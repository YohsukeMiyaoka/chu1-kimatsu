import type { AnswerRecord, ExamResult, Settings, User } from '../types';

// 端末の中（localStorage）だけに保存する。外には送らない。
const KEY = 'chu1-kimatsu:v1';

export interface UnitStat {
  ok: number;
  total: number;
}

export interface SaveData {
  users: User[];
  results: ExamResult[];
  settings: Settings;
  currentUserId: string | null;
  /** userId → 単元ID → 正答数 */
  unitStats: Record<string, Record<string, UnitStat>>;
  /** userId → まちがいノート（問題IDごと。正解したら消える） */
  mistakes: Record<string, Record<string, AnswerRecord & { subject: string }>>;
}

export const DEFAULT_SETTINGS: Settings = { timeLimitMin: 50, sound: true };

const empty = (): SaveData => ({
  users: [],
  results: [],
  settings: DEFAULT_SETTINGS,
  currentUserId: null,
  unitStats: {},
  mistakes: {},
});

export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const d = JSON.parse(raw) as Partial<SaveData>;
    return {
      users: d.users ?? [],
      results: d.results ?? [],
      settings: { ...DEFAULT_SETTINGS, ...d.settings },
      currentUserId: d.currentUserId ?? null,
      unitStats: d.unitStats ?? {},
      mistakes: d.mistakes ?? {},
    };
  } catch {
    return empty();
  }
}

export function save(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 容量オーバーなど。保存できなくてもアプリは使えるようにする
  }
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** 答えの記録を、単元の成績とまちがいノートに反映する（新しいデータを返す） */
export function applyAnswers(data: SaveData, userId: string, subject: string, recs: AnswerRecord[]): SaveData {
  const stats = { ...(data.unitStats[userId] ?? {}) };
  const notes = { ...(data.mistakes[userId] ?? {}) };
  for (const r of recs) {
    const key = `${subject}:${r.question.unit}`;
    const s = stats[key] ?? { ok: 0, total: 0 };
    stats[key] = { ok: s.ok + r.score, total: s.total + 1 };
    // 作る問題（数学の計算）は毎回ちがうので、問題文をキーにする
    const id = `${subject}:${r.question.id}:${r.question.q}`;
    if (r.score >= 1) delete notes[id];
    else notes[id] = { ...r, subject };
  }
  // まちがいノートは新しい200問まで
  const keys = Object.keys(notes);
  for (const k of keys.slice(0, Math.max(0, keys.length - 200))) delete notes[k];
  return {
    ...data,
    unitStats: { ...data.unitStats, [userId]: stats },
    mistakes: { ...data.mistakes, [userId]: notes },
  };
}
