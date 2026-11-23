import { useEffect, useState } from 'react';
import type { AnswerRecord, ExamResult, Subject } from './types';
import { applyAnswers, load, newId, save, type SaveData } from './logic/storage';
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
  | { name: 'quiz'; subject: Subject; items: Item[]; mode: 'exam' | 'practice'; title: string }
  | { name: 'result'; subject: Subject; mode: 'exam' | 'practice'; records: AnswerRecord[]; result: ExamResult | null; isBest: boolean }
  | { name: 'mistakes' }
  | { name: 'history' }
  | { name: 'settings' };

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
          setData({ ...data, currentUserId: id });
          setView({ name: 'home' });
        }}
        onAdd={(name) => {
          const u = { id: newId(), name };
          setData({ ...data, users: [...data.users, u], currentUserId: u.id });
          setView({ name: 'home' });
        }}
        onDelete={(id) =>
          setData({
            ...data,
            users: data.users.filter((u) => u.id !== id),
            results: data.results.filter((r) => r.userId !== id),
            currentUserId: data.currentUserId === id ? null : data.currentUserId,
          })
        }
      />
    );
  }

  const home = () => setView({ name: 'home' });

  const startPractice = (subject: Subject, items: Item[], title: string) =>
    setView({ name: 'quiz', subject, items, mode: 'practice', title });

  const finishQuiz = (subject: Subject, mode: 'exam' | 'practice', records: AnswerRecord[], durationSec: number) => {
    let next = applyAnswers(data, user.id, subject.id, records);
    let result: ExamResult | null = null;
    let isBest = false;
    if (mode === 'exam') {
      const secs = subject.exam.map((s) => ({ title: s.title, got: 0, max: s.count * s.points }));
      for (const r of records) {
        if (r.section !== undefined) secs[r.section].got += r.score * subject.exam[r.section].points;
      }
      secs.forEach((s) => (s.got = Math.round(s.got * 10) / 10));
      const score = Math.round(secs.reduce((a, s) => a + s.got, 0));
      const prevBest = Math.max(-1, ...data.results.filter((r) => r.userId === user.id && r.subject === subject.id).map((r) => r.score));
      isBest = prevBest >= 0 && score > prevBest;
      result = {
        id: newId(), userId: user.id, subject: subject.id, date: new Date().toISOString(), score, durationSec,
        sectionScores: secs, wrongs: records.filter((r) => r.score < 1),
      };
      // 記録は新しい30回分だけ（まちがえた問題も持つので）
      next = { ...next, results: [...next.results, result].slice(-30) };
      sounds.fanfare();
    }
    setData(next);
    setView({ name: 'result', subject, mode, records, result, isBest });
  };

  switch (view.name) {
    case 'home':
      return (
        <Home
          user={user}
          data={data}
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
          stats={data.unitStats[user.id] ?? {}}
          timeLimitMin={data.settings.timeLimitMin}
          onBack={home}
          onExam={() => setView({ name: 'quiz', subject, items: buildExam(subject, Math.random), mode: 'exam', title: '本番テスト' })}
          onPractice={(ids) => {
            const units = subject.units.filter((u) => ids.includes(u.id));
            startPractice(subject, buildPractice(units, 10, Math.random), ids.length === 1 ? units[0].name : 'ミックス');
          }}
        />
      );
    }
    case 'quiz':
      return (
        <QuizScreen
          subject={view.subject}
          items={view.items}
          mode={view.mode}
          title={view.title}
          timeLimitMin={data.settings.timeLimitMin}
          onQuit={() => setView({ name: 'subject', subject: view.subject })}
          onFinish={(recs, sec) => finishQuiz(view.subject, view.mode, recs, sec)}
        />
      );
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
      const notes = Object.values(data.mistakes[user.id] ?? {}).reverse();
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
      return <HistoryScreen results={data.results.filter((r) => r.userId === user.id)} onBack={home} />;
    case 'settings':
      return <SettingsScreen settings={data.settings} onChange={(s) => setData({ ...data, settings: s })} onBack={home} />;
    default:
      return null;
  }
}
