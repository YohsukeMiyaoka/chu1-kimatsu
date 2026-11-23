import { useEffect, useRef, useState } from 'react';
import type { AnswerRecord, Question, Subject } from '../types';
import type { Item } from '../logic/exam';
import { answerText, checkInput, checkOrder } from '../logic/grade';
import { sounds } from '../logic/sound';
import { speak, stopSpeaking } from '../logic/speech';
import { ChoiceArea, MathInput, OrderArea, SelfArea, TextInput } from '../components/Answer';
import { FigureView } from '../components/FigureView';

interface Props {
  subject: Subject;
  items: Item[];
  mode: 'exam' | 'practice';
  timeLimitMin: number;
  title: string;
  onFinish: (records: AnswerRecord[], durationSec: number) => void;
  onQuit: () => void;
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export function QuizScreen({ subject, items, mode, timeLimitMin, title, onFinish, onQuit }: Props) {
  const [idx, setIdx] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [current, setCurrent] = useState<AnswerRecord | null>(null);
  const [showPassage, setShowPassage] = useState(true);
  const start = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  const item = items[idx];
  const q = item.question;
  const isExam = mode === 'exam';
  const limit = timeLimitMin * 60;
  const elapsed = Math.floor((now - start.current) / 1000);
  const remain = Math.max(0, limit - elapsed);

  const finish = (recs: AnswerRecord[]) => {
    if (finished.current) return;
    finished.current = true;
    stopSpeaking();
    onFinish(recs, Math.floor((Date.now() - start.current) / 1000));
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 時間切れ：残りの問題は0点にして採点する
  useEffect(() => {
    if (isExam && remain === 0) {
      const rest = items.slice(records.length).map((it) => ({ question: it.question, given: '（時間切れ）', score: 0, section: it.section }));
      finish([...records, ...rest]);
    }
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

  const record = (given: string, score: number) => {
    const rec: AnswerRecord = { question: q, given, score, section: item.section };
    if (isExam) {
      // 本番は答え合わせをせずに次へ（記述の自己採点だけはその場で）
      const recs = [...records, rec];
      setRecords(recs);
      if (idx + 1 >= items.length) finish(recs);
      else setIdx(idx + 1);
      return;
    }
    setCurrent(rec);
    setResult(score >= 1);
    if (score >= 1) sounds.correct();
    else sounds.wrong();
  };

  const next = () => {
    if (!current) return;
    const recs = [...records, current];
    setRecords(recs);
    if (idx + 1 >= items.length) finish(recs);
    else setIdx(idx + 1);
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
    }
  };

  return (
    <div className="screen quiz">
      <header className="quiz-header">
        <button className="btn small ghost" onClick={() => confirm('ここでやめますか？\n（答えた分は記録されません）') && onQuit()}>✕ やめる</button>
        <div className="progress">
          <div className="progress-label">
            <span className="subj-chip" style={{ background: subject.color }}>{subject.name}</span>
            <span>{title}</span>
            <span className="count">{idx + 1} / {items.length}</span>
          </div>
          <div className="progress-bar"><div style={{ width: `${(idx / items.length) * 100}%`, background: subject.color }} /></div>
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
            <button className="btn primary" onClick={next}>{idx + 1 >= items.length ? '結果を見る' : '次へ →'}</button>
          </div>
          {!result && q.type !== 'self' && (
            <p className="feedback-answer">正解：<strong>{answerText(q)}</strong></p>
          )}
          <p className="explanation">{q.explain}</p>
        </div>
      )}
    </div>
  );
}
