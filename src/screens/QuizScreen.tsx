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
import { RichText } from '../components/RichText';

interface Props {
  subject: Subject;
  items: Item[];
  mode: 'exam' | 'practice';
  timeLimitMin: number;
  title: string;
  /** 本番を続きから再開するときの答え・問題番号・経過時間 */
  initialAnswers?: (AnswerRecord | null)[];
  initialIdx?: number;
  initialElapsed?: number;
  /** 練習：1問答えるたびに呼ぶ（正答率・まちがいノートにすぐ保存） */
  onAnswer: (rec: AnswerRecord) => void;
  /** 本番：答え・今の問題・経過時間を保存する */
  onSave: (answers: (AnswerRecord | null)[], idx: number, elapsedSec: number) => void;
  onFinish: (records: AnswerRecord[], durationSec: number) => void;
  /** 本番を中断する（続きはホームから） */
  onSuspend: () => void;
  /** やめる（本番は記録せずに破棄） */
  onQuit: () => void;
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
/** 入力欄に戻す答え（「わからない」などの印は戻さない） */
const realGiven = (r: AnswerRecord | null | undefined) => (r && !r.given.startsWith('（') ? r.given : '');

export function QuizScreen(props: Props) {
  const { subject, items, mode, timeLimitMin, title, onAnswer, onSave, onFinish, onSuspend, onQuit } = props;
  const isExam = mode === 'exam';
  const n = items.length;
  const [answers, setAnswers] = useState<(AnswerRecord | null)[]>(() => props.initialAnswers ?? items.map(() => null));
  const [idx, setIdx] = useState(Math.min(props.initialIdx ?? 0, n - 1));
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [current, setCurrent] = useState<AnswerRecord | null>(null);
  const [showPassage, setShowPassage] = useState(true);
  const [dialog, setDialog] = useState<null | 'quit' | 'submit' | 'list'>(null);
  const base = useRef(props.initialElapsed ?? 0);
  const mounted = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  const item = items[idx];
  const q = item.question;
  const prev = answers[idx];
  const limit = timeLimitMin * 60;
  const elapsedAt = (t: number) => base.current + Math.floor((t - mounted.current) / 1000);
  const elapsed = elapsedAt(now);
  const remain = Math.max(0, limit - elapsed);
  const answeredCount = answers.filter(Boolean).length;

  /** 本番を採点する（答えていない問題は0点） */
  const submit = (list: (AnswerRecord | null)[], label: string) => {
    if (finished.current) return;
    finished.current = true;
    stopSpeaking();
    const recs = items.map((it, i) => list[i] ?? { question: it.question, given: label, score: 0, section: it.section });
    onFinish(recs, elapsedAt(Date.now()));
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 本番：経過時間を15秒ごとに保存（再読み込みしても時間が続くように）
  useEffect(() => {
    if (isExam && elapsed > 0 && elapsed % 15 === 0) onSave(answers, idx, elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // 時間切れ
  useEffect(() => {
    if (isExam && remain === 0) submit(answers, '（時間切れ）');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain]);

  // 問題が変わったら入力をリセット（本番で答えた問題にもどったときは前の答えを入れておく）
  useEffect(() => {
    setValue(isExam ? realGiven(answers[idx]) : '');
    setPicked(isExam ? answers[idx]?.given ?? null : null);
    setResult(null);
    setCurrent(null);
    window.scrollTo({ top: 0 });
    if (q.audio) setTimeout(() => speak(q.audio!), 300);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, q.audio]);

  const go = (to: number, list = answers) => {
    const t = Math.max(0, Math.min(n - 1, to));
    setIdx(t);
    if (isExam) onSave(list, t, elapsedAt(Date.now()));
  };

  const record = (given: string, score: number) => {
    const rec: AnswerRecord = { question: q, given, score, section: item.section };
    if (isExam) {
      // 本番は答え合わせをせず、答えをしまって次の問題へ（あとでもどって答え直せる）
      const list = answers.slice();
      list[idx] = rec;
      setAnswers(list);
      if (idx + 1 < n) go(idx + 1, list);
      else {
        onSave(list, idx, elapsedAt(Date.now()));
        setDialog('submit');
      }
      return;
    }
    // 練習：答えた時点で保存し、答え合わせを見せる
    onAnswer(rec);
    setCurrent(rec);
    setResult(score >= 1);
    if (score >= 1) sounds.correct();
    else sounds.wrong();
  };

  const nextPractice = () => {
    if (!current) return;
    const list = answers.slice();
    list[idx] = current;
    setAnswers(list);
    if (idx + 1 >= n) {
      finished.current = true;
      onFinish(list.filter((r): r is AnswerRecord => r !== null), elapsedAt(Date.now()));
    } else setIdx(idx + 1);
  };

  const passage = q.passage ? subject.passages?.[q.passage] : undefined;
  const done = current !== null;

  const answerArea = (question: Question) => {
    // 本番で答え直すときは、部品を作り直して前の答えを入れる
    const k = `${idx}-${isExam ? JSON.stringify(prev?.given ?? '') : ''}`;
    switch (question.type) {
      case 'choice':
        return (
          <ChoiceArea
            key={k}
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
        const ok = () => record(value, checkInput(question, value) ? 1 : 0);
        return question.kind === 'math' ? (
          <MathInput key={k} q={question} value={value} onChange={setValue} onSubmit={ok} done={done} result={result} />
        ) : (
          <TextInput key={k} q={question} value={value} onChange={setValue} onSubmit={ok} done={done} result={result} />
        );
      }
      case 'order': {
        const sep = question.join === '\n' ? ' / ' : question.join;
        const initial = isExam && realGiven(prev) ? realGiven(prev).split(sep) : undefined;
        return <OrderArea key={k} q={question} initial={initial} done={done} result={result} onSubmit={(t) => record(t.join(sep), checkOrder(question, t) ? 1 : 0)} />;
      }
      case 'self':
        return <SelfArea key={k} q={question} done={done} onMark={(s, text) => record(text || '（ノートに記入）', s)} />;
      case 'write':
        return <HandwritingArea key={k} q={question} done={done} onMark={(s) => record(s >= 1 ? '（手書き：○）' : '（手書き：×）', s)} />;
    }
  };

  return (
    <div className="screen quiz">
      <header className="quiz-header">
        <button className="btn small quit-btn" onClick={() => setDialog('quit')}>✕ やめる</button>
        <div className="progress">
          <div className="progress-label">
            <span className="subj-chip" style={{ background: subject.color }}>{subject.name}</span>
            <span>{title}</span>
            <span className="count">{idx + 1} / {n}</span>
            {isExam && <span className="count">（答えた {answeredCount}問）</span>}
          </div>
          <div className="progress-bar"><div style={{ width: `${((isExam ? answeredCount : idx) / n) * 100}%`, background: subject.color }} /></div>
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
                  📄 {passage.title} {showPassage ? '▲ たたむ' : '▼ 本文を見る'}
                </button>
                {showPassage && (
                  <>
                    {passage.note && <p className="passage-note">{passage.note}</p>}
                    <div className="passage-text"><RichText text={passage.text} /></div>
                    {passage.translation && !isExam && (
                      <details className="translation">
                        <summary>現代語訳を見る（練習のときだけ）</summary>
                        <div className="passage-text">{passage.translation}</div>
                      </details>
                    )}
                  </>
                )}
              </div>
            )}
            {q.fig && <FigureView fig={q.fig} />}
          </aside>
        )}
        <main className="q-main">
          <p className="prompt"><RichText text={q.q} /></p>
          {q.audio && (
            <button className="btn audio" onClick={() => speak(q.audio!)}>🔊 もう一度聞く</button>
          )}
          {isExam && prev && (
            <p className="prev-answer">いまの答え：<strong>{prev.given}</strong>（答え直すと上書きされます）</p>
          )}
          {answerArea(q)}
          {!isExam && !done && q.type !== 'self' && (
            <button className="btn small ghost skip" onClick={() => record('（わからない）', 0)}>わからない →</button>
          )}
        </main>
      </div>

      {isExam && (
        <nav className="exam-nav">
          <button className="btn" disabled={idx === 0} onClick={() => go(idx - 1)}>← 前の問題</button>
          <button className="btn small" onClick={() => setDialog('list')}>問題一覧</button>
          {idx + 1 < n ? (
            <button className="btn" onClick={() => go(idx + 1)}>次の問題 →</button>
          ) : (
            <button className="btn primary" onClick={() => setDialog('submit')}>提出する</button>
          )}
        </nav>
      )}

      {done && current && (
        <div className={`feedback ${result ? 'ok' : current.score > 0 ? 'half' : 'ng'}`}>
          <div className="feedback-head">
            <span className="feedback-mark">{result ? '⭕ 正解！' : current.score > 0 ? '🔺 おしい' : '❌ ざんねん'}</span>
            <button className="btn primary" onClick={nextPractice}>{idx + 1 >= n ? '結果を見る' : '次へ →'}</button>
          </div>
          {!result && q.type !== 'self' && (
            <p className="feedback-answer">正解：<strong>{answerText(q)}</strong></p>
          )}
          <p className="explanation">{q.explain}</p>
        </div>
      )}

      {dialog === 'list' && (
        <Dialog title="問題一覧（番号をタップでその問題へ）" actions={[{ label: '閉じる', kind: 'plain', onClick: () => setDialog(null) }]}>
          <div className="q-palette">
            {items.map((_, i) => (
              <button
                key={i}
                className={`pal ${answers[i] ? 'answered' : ''} ${i === idx ? 'here' : ''}`}
                onClick={() => { setDialog(null); go(i); }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p>色つき＝答えた問題　白＝まだ答えていない問題</p>
        </Dialog>
      )}

      {dialog === 'submit' && (
        <Dialog
          title="テストを提出しますか？"
          actions={[
            { label: '提出して採点する', kind: 'primary', onClick: () => { setDialog(null); submit(answers, '（未回答）'); } },
            { label: '見直す（問題一覧へ）', kind: 'plain', onClick: () => setDialog('list') },
            { label: 'テストにもどる', kind: 'plain', onClick: () => setDialog(null) },
          ]}
        >
          <p>
            {n}問中 {answeredCount}問 答えています。
            {answeredCount < n && <strong>　まだ答えていない問題が {n - answeredCount}問あります（0点になります）。</strong>}
          </p>
        </Dialog>
      )}

      {dialog === 'quit' &&
        (isExam ? (
          <Dialog
            title="本番テストを中断しますか？"
            actions={[
              { label: '中断して、あとで続きから', kind: 'primary', onClick: () => { stopSpeaking(); onSave(answers, idx, elapsedAt(Date.now())); onSuspend(); } },
              { label: `ここまでで採点する（未回答${n - answeredCount}問は0点）`, onClick: () => { setDialog(null); submit(answers, '（未回答）'); } },
              { label: 'やめる（このテストは記録しない）', kind: 'danger', onClick: () => { stopSpeaking(); onQuit(); } },
              { label: 'テストにもどる', kind: 'plain', onClick: () => setDialog(null) },
            ]}
          >
            <p>答えた {answeredCount}問はそのまま保存されています。中断すると、ホーム画面の「続きから」で再開できます（時間も止まります）。</p>
          </Dialog>
        ) : (
          <Dialog
            title="練習をやめますか？"
            actions={[
              { label: 'やめる', kind: 'primary', onClick: () => { stopSpeaking(); onQuit(); } },
              { label: '練習にもどる', kind: 'plain', onClick: () => setDialog(null) },
            ]}
          >
            <p>ここまでに答えた {answeredCount + (current ? 1 : 0)}問の結果は、正答率とまちがいノートに保存されています。</p>
          </Dialog>
        ))}
    </div>
  );
}
