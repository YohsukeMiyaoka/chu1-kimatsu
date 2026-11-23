import { useEffect, useState } from 'react';
import type { AnswerRecord, ExamResult, Subject } from './types';
import { applyAnswers, load, newId, save, type SaveData, type Session } from './logic/storage';
import { buildExam, buildPractice, prepare, type Item } from './logic/exam';
import { shuffle } from './logic/random';
import { setSoundEnabled, sounds } from './logic/sound';
import { subjectById } from './data';
import { QuizScreen } from './screens/QuizScreen';
import { HistoryScreen, Home, MistakesScreen, ResultScreen, SettingsScreen, SubjectMenu, UserSelect } from './screens/Screens';

type View =
  | { name: 'users' }
  | { name: 'home' }
  | { name: 'subject'; subject: Subject }
  | { name: 'quiz'; subject: Subject; items: Item[]; mode: 'exam' | 'practice'; title: string; answers?: (AnswerRecord | null)[]; idx?: number; elapsed?: number }
  | { name: 'result'; subject: Subject; mode: 'exam' | 'practice'; records: AnswerRecord[]; result: ExamResult | null; isBest: boolean }
  | { name: 'mistakes' }
  | { name: 'history' }
  | { name: 'settings' };

const withoutSession = (d: SaveData, userId: string): SaveData => {
  const sessions = { ...d.sessions };
  delete sessions[userId];
  return { ...d, sessions };
};

export default function App() {
  const [data, setData] = useState<SaveData>(load);
  const user = data.users.find((u) => u.id === data.currentUserId) ?? null;
  const [view, setView] = useState<View>(user ? { name: 'home' } : { name: 'users' });

  useEffect(() => save(data), [data]);
  useEffect(() => setSoundEnabled(data.settings.sound), [data.settings.sound]);

  if (!user || view.name === 'users') {
    return (
      <UserSelect
        users={data.users}
        onSelect={(id) => {
          setData((d) => ({ ...d, currentUserId: id }));
          setView({ name: 'home' });
        }}
        onAdd={(name) => {
          const u = { id: newId(), name };
          setData((d) => ({ ...d, users: [...d.users, u], currentUserId: u.id }));
          setView({ name: 'home' });
        }}
        onDelete={(id) =>
          setData((d) => ({
            ...withoutSession(d, id),
            users: d.users.filter((u) => u.id !== id),
            results: d.results.filter((r) => r.userId !== id),
            currentUserId: d.currentUserId === id ? null : d.currentUserId,
          }))
        }
      />
    );
  }

  const uid = user.id;
  const home = () => setView({ name: 'home' });
  const session = data.sessions[uid];

  const startPractice = (subject: Subject, items: Item[], title: string) =>
    setView({ name: 'quiz', subject, items, mode: 'practice', title });

  const startExam = (subject: Subject) => {
    const items = buildExam(subject, Math.random);
    const s: Session = { userId: uid, subject: subject.id, mode: 'exam', title: '本番テスト', items, answers: items.map(() => null), idx: 0, elapsedSec: 0 };
    // 新しい本番を始めたら、前の途中のテストは捨てる
    setData((d) => ({ ...d, sessions: { ...d.sessions, [uid]: s } }));
    setView({ name: 'quiz', subject, items, mode: 'exam', title: '本番テスト' });
  };

  const resume = (s: Session) =>
    setView({ name: 'quiz', subject: subjectById(s.subject), items: s.items, mode: s.mode, title: s.title, answers: s.answers, idx: s.idx, elapsed: s.elapsedSec });

  const finishQuiz = (subject: Subject, mode: 'exam' | 'practice', records: AnswerRecord[], durationSec: number) => {
    let result: ExamResult | null = null;
    let isBest = false;
    if (mode === 'exam') {
      const secs = subject.exam.map((s) => ({ title: s.title, got: 0, max: s.count * s.points }));
      for (const r of records) {
        if (r.section !== undefined) secs[r.section].got += r.score * subject.exam[r.section].points;
      }
      secs.forEach((s) => (s.got = Math.round(s.got * 10) / 10));
      const score = Math.round(secs.reduce((a, s) => a + s.got, 0));
      const prevBest = Math.max(-1, ...data.results.filter((r) => r.userId === uid && r.subject === subject.id).map((r) => r.score));
      isBest = prevBest >= 0 && score > prevBest;
      result = {
        id: newId(), userId: uid, subject: subject.id, date: new Date().toISOString(), score, durationSec,
        sectionScores: secs, wrongs: records.filter((r) => r.score < 1),
      };
      const res = result;
      // 本番は提出したときに、答えた問題を正答率・まちがいノートに反映する（答え直しができるので途中では数えない）
      const answered = records.filter((r) => !r.given.startsWith('（未回答') && !r.given.startsWith('（時間切れ'));
      // 記録は新しい30回分だけ（まちがえた問題も持つので）
      setData((d) => ({ ...applyAnswers(withoutSession(d, uid), uid, subject.id, answered), results: [...d.results, res].slice(-30) }));
      sounds.fanfare();
    }
    setView({ name: 'result', subject, mode, records, result, isBest });
  };

  switch (view.name) {
    case 'home':
      return (
        <Home
          user={user}
          data={data}
          session={session}
          onResume={() => session && resume(session)}
          onDiscard={() => setData((d) => withoutSession(d, uid))}
          onSubject={(subject) => setView({ name: 'subject', subject })}
          onMistakes={() => setView({ name: 'mistakes' })}
          onHistory={() => setView({ name: 'history' })}
          onSettings={() => setView({ name: 'settings' })}
          onSwitchUser={() => setView({ name: 'users' })}
        />
      );
    case 'subject': {
      const { subject } = view;
      return (
        <SubjectMenu
          subject={subject}
          stats={data.unitStats[uid] ?? {}}
          timeLimitMin={data.settings.timeLimitMin}
          session={session?.subject === subject.id ? session : undefined}
          onResume={() => session && resume(session)}
          onBack={home}
          onExam={() => startExam(subject)}
          onPractice={(ids) => {
            const units = subject.units.filter((u) => ids.includes(u.id));
            startPractice(subject, buildPractice(units, 10, Math.random), ids.length === 1 ? units[0].name : 'ミックス');
          }}
        />
      );
    }
    case 'quiz': {
      const { subject, mode } = view;
      return (
        <QuizScreen
          subject={subject}
          items={view.items}
          mode={mode}
          title={view.title}
          initialAnswers={view.answers}
          initialIdx={view.idx}
          initialElapsed={view.elapsed}
          timeLimitMin={data.settings.timeLimitMin}
          onAnswer={(rec) => setData((d) => applyAnswers(d, uid, subject.id, [rec]))}
          onSave={(answers, idx, elapsed) =>
            setData((d) => (d.sessions[uid] ? { ...d, sessions: { ...d.sessions, [uid]: { ...d.sessions[uid], answers, idx, elapsedSec: elapsed } } } : d))
          }
          onSuspend={() => setView({ name: 'home' })}
          onQuit={() => {
            if (mode === 'exam') setData((d) => withoutSession(d, uid));
            setView({ name: 'subject', subject });
          }}
          onFinish={(recs, sec) => finishQuiz(subject, mode, recs, sec)}
        />
      );
    }
    case 'result':
      return (
        <ResultScreen
          subject={view.subject}
          mode={view.mode}
          records={view.records}
          result={view.result}
          isBest={view.isBest}
          onBack={() => setView({ name: 'subject', subject: view.subject })}
          onRetryWrong={() =>
            startPractice(
              view.subject,
              view.records.filter((r) => r.score < 1).map((r) => ({ question: prepare(r.question, Math.random), points: 1 })),
              'まちがえた問題',
            )
          }
        />
      );
    case 'mistakes': {
      const notes = Object.values(data.mistakes[uid] ?? {}).reverse();
      return (
        <MistakesScreen
          notes={notes}
          onBack={home}
          onPractice={(sid, recs) =>
            startPractice(
              subjectById(sid),
              shuffle(recs).slice(0, 10).map((r) => ({ question: prepare(r.question, Math.random), points: 1 })),
              'まちがいノート',
            )
          }
        />
      );
    }
    case 'history':
      return <HistoryScreen results={data.results.filter((r) => r.userId === uid)} onBack={home} />;
    case 'settings':
      return <SettingsScreen settings={data.settings} onChange={(s) => setData((d) => ({ ...d, settings: s }))} onBack={home} />;
    default:
      return null;
  }
}
