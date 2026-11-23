import { useEffect, useRef, useState } from 'react';
import type { AnswerRecord, Question, Subject } from '../types';
import type { Item } from '../logic/exam';
import { answerText, checkInput, checkOrder } from '../logic/grade';
import { sounds } from '../logic/sound';
import { speak, stopSpeaking } from '../logic/speech';
import { ChoiceArea, MathInput, OrderArea, SelfArea, TextInput } from '../components/Answer';
import { FigureView } from '../components/FigureView';
import { HandwritingArea } from '../components/Handwriting';
import { Dialog } from '../components/Dialog';

interface Props {
  subject: Subject;
  items: Item[];
  mode: 'exam' | 'practice';
  timeLimitMin: number;
  title: string;
  /** 続きから再開するときの、答え済みの記録と経過時間 */
  initialRecords?: AnswerRecord[];
  initialElapsed?: number;
  /** 1問答えるたびに呼ぶ（すぐ保存する） */
  onAnswer: (rec: AnswerRecord, records: AnswerRecord[], elapsedSec: number) => void;
  /** 経過時間をときどき保存する */
  onTick: (elapsedSec: number) => void;
  onFinish: (records: AnswerRecord[], durationSec: number) => void;
  /** 本番を中断する（続きはホームから） */
  onSuspend: () => void;
  /** やめる（本番は記録せずに破棄） */
  onQuit: () => void;
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export function QuizScreen(props: Props) {
  const { subject, items, mode, timeLimitMin, title, onAnswer, onTick, onFinish, onSuspend, onQuit } = props;
  const [records, setRecords] = useState<AnswerRecord[]>(props.initialRecords ?? []);
  const idx = Math.min(records.length, items.length - 1);
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [current, setCurrent] = useState<AnswerRecord | null>(null);
  const [showPassage, setShowPassage] = useState(true);
  const [quitOpen, setQuitOpen] = useState(false);
  const base = useRef(props.initialElapsed ?? 0);
  const mounted = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  const item = items[idx];
  const q = item.question;
  const isExam = mode === 'exam';
  const limit = timeLimitMin * 60;
  const elapsedAt = (t: number) => base.current + Math.floor((t - mounted.current) / 1000);
  const elapsed = elapsedAt(now);
  const remain = Math.max(0, limit - elapsed);

  const finish = (recs: AnswerRecord[]) => {
    if (finished.current) return;
    finished.current = true;
    stopSpeaking();
    onFinish(recs, elapsedAt(Date.now()));
  };

  /** 答えていない問題を0点にして採点する（時間切れ・途中で採点） */
  const finishWithRest = (label: string) => {
    const rest = items.slice(records.length).map((it) => ({ question: it.question, given: label, score: 0, section: it.section }));
    finish([...records, ...rest]);
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 経過時間を15秒ごとに保存（再読み込みしても時間が続くように）
  useEffect(() => {
    if (elapsed > 0 && elapsed % 15 === 0) onTick(elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // 時間切れ
  useEffect(() => {
    if (isExam && remain === 0) finishWithRest('（時間切れ）');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain]);

  // 新しい問題になったらリセット。リスニングは自動で読み上げる
  useEffect(() => {
    setValue('');
    setPicked(null);
    setResult(null);
    setCurrent(null);
    window.scrollTo({ top: 0 });
    if (q.audio) setTimeout(() => speak(q.audio!), 300);
    return () => stopSpeaking();
  }, [idx, q.audio]);

  const commit = (rec: AnswerRecord) => {
    const recs = [...records, rec];
    onAnswer(rec, recs, elapsedAt(Date.now()));
    return recs;
  };

  const record = (given: string, score: number) => {
    const rec: AnswerRecord = { question: q, given, score, section: item.section };
    if (isExam) {
      // 本番は答え合わせをせずに次へ
      const recs = commit(rec);
      if (recs.length >= items.length) finish(recs);
      else setRecords(recs);
      return;
    }
    // 練習：答えた時点で保存し、答え合わせを見せる
    commit(rec);
    setCurrent(rec);
    setResult(score >= 1);
    if (score >= 1) sounds.correct();
    else sounds.wrong();
  };

  const next = () => {
    if (!current) return;
    const recs = [...records, current];
    if (recs.length >= items.length) finish(recs);
    else setRecords(recs);
  };

  const passage = q.passage ? subject.passages?.[q.passage] : undefined;
  const done = current !== null;

  const answerArea = (question: Question) => {
    switch (question.type) {
      case 'choice':
        return (
          <ChoiceArea
            q={question}
            picked={picked}
            done={done}
            onPick={(c) => {
              setPicked(c);
              record(c, c === question.answer ? 1 : 0);
            }}
          />
        );
      case 'input': {
        const submit = () => record(value, checkInput(question, value) ? 1 : 0);
        return question.kind === 'math' ? (
          <MathInput q={question} value={value} onChange={setValue} onSubmit={submit} done={done} result={result} />
        ) : (
          <TextInput q={question} value={value} onChange={setValue} onSubmit={submit} done={done} result={result} />
        );
      }
      case 'order':
        return <OrderArea q={question} done={done} result={result} onSubmit={(t) => record(t.join(question.join === '\n' ? ' / ' : question.join), checkOrder(question, t) ? 1 : 0)} />;
      case 'self':
        return <SelfArea q={question} done={done} onMark={(s, text) => record(text || '（ノートに記入）', s)} />;
      case 'write':
        return <HandwritingArea q={question} done={done} onMark={(s) => record(s >= 1 ? '（手書き：○）' : '（手書き：×）', s)} />;
    }
  };

  return (
    <div className="screen quiz">
      <header className="quiz-header">
        <button className="btn small quit-btn" onClick={() => setQuitOpen(true)}>✕ やめる</button>
        <div className="progress">
          <div className="progress-label">
            <span className="subj-chip" style={{ background: subject.color }}>{subject.name}</span>
            <span>{title}</span>
            <span className="count">{idx + 1} / {items.length}</span>
          </div>
          <div className="progress-bar"><div style={{ width: `${(records.length / items.length) * 100}%`, background: subject.color }} /></div>
        </div>
        {isExam && <div className={`timer ${remain < 300 ? 'hurry' : ''}`}>⏱ {fmt(remain)}</div>}
      </header>

      {isExam && item.section !== undefined && (
        <p className="section-label">
          第{item.section + 1}問　{subject.exam[item.section].title}（各{item.points}点）
        </p>
      )}

      <div className={`q-layout ${passage || q.fig ? 'has-side' : ''}`} key={idx}>
        {(passage || q.fig) && (
          <aside className="q-side">
            {passage && (
              <div className="passage">
                <button className="passage-title" onClick={() => setShowPassage(!showPassage)}>
                  📄 {passage.title} {showPassage ? '▲' : '▼'}
                </button>
                {showPassage && <div className="passage-text">{passage.text}</div>}
              </div>
            )}
            {q.fig && <FigureView fig={q.fig} />}
          </aside>
        )}
        <main className="q-main">
          <p className="prompt">{q.q}</p>
          {q.audio && (
            <button className="btn audio" onClick={() => speak(q.audio!)}>🔊 もう一度聞く</button>
          )}
          {answerArea(q)}
          {!done && q.type !== 'self' && (
            <button className="btn small ghost skip" onClick={() => record('（わからない）', 0)}>わからない →</button>
          )}
        </main>
      </div>

      {done && current && (
        <div className={`feedback ${result ? 'ok' : current.score > 0 ? 'half' : 'ng'}`}>
          <div className="feedback-head">
            <span className="feedback-mark">{result ? '⭕ 正解！' : current.score > 0 ? '🔺 おしい' : '❌ ざんねん'}</span>
            <button className="btn primary" onClick={next}>{records.length + 1 >= items.length ? '結果を見る' : '次へ →'}</button>
          </div>
          {!result && q.type !== 'self' && (
            <p className="feedback-answer">正解：<strong>{answerText(q)}</strong></p>
          )}
          <p className="explanation">{q.explain}</p>
        </div>
      )}

      {quitOpen &&
        (isExam ? (
          <Dialog
            title="本番テストを中断しますか？"
            actions={[
              { label: '中断して、あとで続きから', kind: 'primary', onClick: () => { stopSpeaking(); onSuspend(); } },
              { label: `ここまでで採点する（残り${items.length - records.length}問は0点）`, onClick: () => { setQuitOpen(false); finishWithRest('（未回答）'); } },
              { label: 'やめる（このテストは記録しない）', kind: 'danger', onClick: () => { stopSpeaking(); onQuit(); } },
              { label: 'テストにもどる', kind: 'plain', onClick: () => setQuitOpen(false) },
            ]}
          >
            <p>答えた {records.length}問はそのまま保存されています。中断すると、ホーム画面の「続きから」で再開できます（時間も止まります）。</p>
          </Dialog>
        ) : (
          <Dialog
            title="練習をやめますか？"
            actions={[
              { label: 'やめる', kind: 'primary', onClick: () => { stopSpeaking(); onQuit(); } },
              { label: '練習にもどる', kind: 'plain', onClick: () => setQuitOpen(false) },
            ]}
          >
            <p>ここまでに答えた {records.length + (current ? 1 : 0)}問の結果は、正答率とまちがいノートに保存されています。</p>
          </Dialog>
        ))}
    </div>
  );
}
