import { useState } from 'react';
import type { AnswerRecord, ExamResult, Settings, Subject, User } from '../types';
import type { SaveData } from '../logic/storage';
import { SUBJECTS } from '../data';
import { examMax } from '../logic/exam';
import { ReviewList } from '../components/ReviewList';

const fmtTime = (sec: number) => `${Math.floor(sec / 60)}分${String(sec % 60).padStart(2, '0')}秒`;
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ---------- ユーザー選択 ----------
export function UserSelect({ users, onSelect, onAdd, onDelete }: { users: User[]; onSelect: (id: string) => void; onAdd: (name: string) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const add = () => {
    const n = name.trim();
    if (!n) return;
    onAdd(n);
    setName('');
  };
  return (
    <div className="screen center">
      <div className="hero">
        <div className="hero-icons">{SUBJECTS.map((s) => <span key={s.id}>{s.icon}</span>)}</div>
        <h1 className="title">中1 期末テスト演習</h1>
        <p className="subtitle">2学期 期末テスト（5教科）</p>
      </div>
      <div className="user-list">
        {users.map((u) => (
          <div key={u.id} className="user-row">
            <button className="btn big user-btn" disabled={editing} onClick={() => onSelect(u.id)}>{u.name}</button>
            {editing && (
              <button className="btn danger round" aria-label={`${u.name}を消す`} onClick={() => confirm(`「${u.name}」を消しますか？\n記録も全部消えます。`) && onDelete(u.id)}>✕</button>
            )}
          </div>
        ))}
      </div>
      <div className="add-row">
        <input className="name-input" value={name} placeholder="名前を入れて登録" onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && add()} />
        <button className="btn primary" disabled={!name.trim()} onClick={add}>登録</button>
      </div>
      {users.length > 0 && <button className="btn ghost" onClick={() => setEditing(!editing)}>{editing ? '終わる' : '名前を消す'}</button>}
    </div>
  );
}

// ---------- ホーム（教科を選ぶ） ----------
export function Home({ user, data, onSubject, onMistakes, onHistory, onSettings, onSwitchUser }: {
  user: User; data: SaveData; onSubject: (s: Subject) => void; onMistakes: () => void; onHistory: () => void; onSettings: () => void; onSwitchUser: () => void;
}) {
  const mine = data.results.filter((r) => r.userId === user.id);
  const nMistakes = Object.keys(data.mistakes[user.id] ?? {}).length;
  const bests = SUBJECTS.map((s) => Math.max(-1, ...mine.filter((r) => r.subject === s.id).map((r) => r.score)));
  const total = bests.every((b) => b >= 0) ? bests.reduce((a, b) => a + b, 0) : null;
  return (
    <div className="screen">
      <header className="menu-header">
        <h1 className="title-sm">{user.name} さん</h1>
        <button className="btn small ghost" onClick={onSwitchUser}>ユーザー変更</button>
      </header>
      <div className="subject-grid">
        {SUBJECTS.map((s, i) => {
          const last = mine.filter((r) => r.subject === s.id).at(-1);
          return (
            <button key={s.id} className="subject-card" style={{ borderTopColor: s.color }} onClick={() => onSubject(s)}>
              <span className="subject-icon">{s.icon}</span>
              <span className="subject-name">{s.name}</span>
              <span className="subject-best">{bests[i] >= 0 ? `最高 ${bests[i]}点` : 'まだ受けていない'}</span>
              {last && <span className="subject-last">前回 {last.score}点</span>}
            </button>
          );
        })}
      </div>
      {total !== null && <p className="total">5教科の最高点の合計：<strong>{total}</strong> / 500点</p>}
      <div className="row">
        <button className="btn" onClick={onMistakes}>📕 まちがいノート（{nMistakes}問）</button>
        <button className="btn" onClick={onHistory}>📊 記録</button>
        <button className="btn" onClick={onSettings}>⚙ 設定</button>
      </div>
      <p className="note small">試験日：11/25（水）国語・英語・理科　11/26（木）社会・数学</p>
    </div>
  );
}

// ---------- 教科のメニュー ----------
export function SubjectMenu({ subject, stats, onExam, onPractice, onBack, timeLimitMin }: {
  subject: Subject; stats: Record<string, { ok: number; total: number }>; onExam: () => void; onPractice: (unitIds: string[]) => void; onBack: () => void; timeLimitMin: number;
}) {
  const nExam = subject.exam.reduce((a, s) => a + s.count, 0);
  return (
    <div className="screen">
      <header className="menu-header">
        <button className="btn small ghost" onClick={onBack}>← もどる</button>
        <h1 className="title-sm" style={{ color: subject.color }}>{subject.icon} {subject.name}</h1>
        <span />
      </header>
      <p className="scope"><strong>試験範囲：</strong>{subject.scope}</p>
      <button className="btn big primary exam-btn" style={{ background: subject.color }} onClick={onExam}>
        📝 本番テスト（{nExam}問・{examMax(subject)}点満点・{timeLimitMin}分）
      </button>
      <h2 className="h2">単元別に練習（10問ずつ・すぐに答え合わせ）</h2>
      <div className="unit-list">
        <button className="unit-btn mix" onClick={() => onPractice(subject.units.map((u) => u.id))}>
          <span>🎲 全部の単元からミックス</span>
        </button>
        {subject.units.map((u) => {
          const st = stats[`${subject.id}:${u.id}`];
          const pct = st && st.total ? Math.round((st.ok / st.total) * 100) : null;
          return (
            <button key={u.id} className="unit-btn" onClick={() => onPractice([u.id])}>
              <span>{u.name}</span>
              <span className={`pct ${pct === null ? '' : pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'bad'}`}>
                {pct === null ? '未挑戦' : `正答率 ${pct}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 結果 ----------
export function ResultScreen({ subject, mode, records, result, isBest, onRetryWrong, onBack }: {
  subject: Subject; mode: 'exam' | 'practice'; records: AnswerRecord[]; result: ExamResult | null; isBest: boolean; onRetryWrong: () => void; onBack: () => void;
}) {
  const wrong = records.filter((r) => r.score < 1);
  const ok = records.filter((r) => r.score >= 1).length;
  return (
    <div className="screen">
      <div className="result-top">
        <p className="result-mode">{subject.icon} {subject.name}　{mode === 'exam' ? '本番テスト' : '練習'}</p>
        {result ? (
          <>
            <p className="score"><strong style={{ color: subject.color }}>{result.score}</strong><span> / 100点</span></p>
            {isBest && <p className="new-best">🎉 自己ベスト！</p>}
            <p className="note">かかった時間 {fmtTime(result.durationSec)}</p>
            <table className="section-table">
              <tbody>
                {result.sectionScores.map((s, i) => (
                  <tr key={i} className={s.got < s.max * 0.6 ? 'weak' : ''}>
                    <td>第{i + 1}問</td><td>{s.title}</td><td className="num">{s.got} / {s.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="score"><strong style={{ color: subject.color }}>{ok}</strong><span> / {records.length}問 正解</span></p>
        )}
      </div>
      <div className="row">
        {wrong.length > 0 && <button className="btn primary" onClick={onRetryWrong}>まちがえた {wrong.length}問をもう一度</button>}
        <button className="btn" onClick={onBack}>メニューへ</button>
      </div>
      <h2 className="h2">ふりかえり</h2>
      <ReviewList recs={wrong} />
    </div>
  );
}

// ---------- まちがいノート ----------
export function MistakesScreen({ notes, onPractice, onBack }: { notes: (AnswerRecord & { subject: string })[]; onPractice: (subjectId: string, recs: AnswerRecord[]) => void; onBack: () => void }) {
  return (
    <div className="screen">
      <header className="menu-header">
        <button className="btn small ghost" onClick={onBack}>← もどる</button>
        <h1 className="title-sm">📕 まちがいノート</h1>
        <span />
      </header>
      <p className="note">まちがえた問題がたまります。正解すると消えます。</p>
      <div className="subject-grid">
        {SUBJECTS.map((s) => {
          const recs = notes.filter((n) => n.subject === s.id);
          return (
            <button key={s.id} className="subject-card" style={{ borderTopColor: s.color }} disabled={!recs.length} onClick={() => onPractice(s.id, recs)}>
              <span className="subject-icon">{s.icon}</span>
              <span className="subject-name">{s.name}</span>
              <span className="subject-best">{recs.length}問</span>
            </button>
          );
        })}
      </div>
      <ReviewList recs={notes} />
    </div>
  );
}

// ---------- 記録 ----------
export function HistoryScreen({ results, onBack }: { results: ExamResult[]; onBack: () => void }) {
  return (
    <div className="screen">
      <header className="menu-header">
        <button className="btn small ghost" onClick={onBack}>← もどる</button>
        <h1 className="title-sm">📊 本番テストの記録</h1>
        <span />
      </header>
      {SUBJECTS.map((s) => {
        const rs = results.filter((r) => r.subject === s.id).slice().reverse();
        return (
          <section key={s.id}>
            <h2 className="h2">{s.icon} {s.name}</h2>
            {rs.length ? (
              <ul className="history">
                {rs.map((r) => (
                  <li key={r.id}>
                    <span className="date">{fmtDate(r.date)}</span>
                    <span className="pts" style={{ color: s.color }}>{r.score}点</span>
                    <span className="time">{fmtTime(r.durationSec)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">まだ記録がありません</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------- 設定 ----------
export function SettingsScreen({ settings, onChange, onBack }: { settings: Settings; onChange: (s: Settings) => void; onBack: () => void }) {
  return (
    <div className="screen">
      <header className="menu-header">
        <button className="btn small ghost" onClick={onBack}>← もどる</button>
        <h1 className="title-sm">⚙ 設定</h1>
        <span />
      </header>
      <div className="setting-list">
        <div className="setting">
          <span>本番テストの時間</span>
          <div className="stepper">
            <button className="btn round" onClick={() => onChange({ ...settings, timeLimitMin: Math.max(10, settings.timeLimitMin - 5) })}>−</button>
            <strong>{settings.timeLimitMin}分</strong>
            <button className="btn round" onClick={() => onChange({ ...settings, timeLimitMin: Math.min(90, settings.timeLimitMin + 5) })}>＋</button>
          </div>
        </div>
        <div className="setting">
          <span>効果音</span>
          <button className={`toggle ${settings.sound ? 'on' : ''}`} onClick={() => onChange({ ...settings, sound: !settings.sound })}>{settings.sound ? 'ON' : 'OFF'}</button>
        </div>
      </div>
      <p className="note small">記録はこのiPadの中だけに保存されます。</p>
    </div>
  );
}
