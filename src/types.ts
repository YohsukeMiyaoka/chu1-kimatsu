export type SubjectId = 'math' | 'english' | 'japanese' | 'science' | 'social';

/** 図。graph は座標平面、svg は src/figures の名前付きの図 */
export type Figure =
  | {
      kind: 'graph';
      /** 比例 y=ax / 反比例 y=a/x */
      lines?: { type: 'prop' | 'inv'; a: number; label?: string }[];
      points?: { x: number; y: number; label: string }[];
      range?: number;
    }
  | { kind: 'svg'; id: string };

interface QBase {
  id: string;
  unit: string;
  q: string;
  explain: string;
  /** 国語の読解などの本文ID */
  passage?: string;
  fig?: Figure;
  /** 英語のリスニング：読み上げる英文 */
  audio?: string;
}

export interface ChoiceQ extends QBase {
  type: 'choice';
  choices: string[];
  /** 正解の選択肢（文字列） */
  answer: string;
  /** 選択肢をシャッフルしない（ア・イ・ウや年代の順など） */
  fixed?: boolean;
}

export interface InputQ extends QBase {
  type: 'input';
  /** 正解（別解も並べる）。math は数値として同じなら正解 */
  answers: string[];
  kind: 'math' | 'en' | 'ja';
  /** 答えの前に付ける文字（例「x =」） */
  prefix?: string;
  /** 答えの後ろに付ける文字（例「cm」） */
  suffix?: string;
}

export interface OrderQ extends QBase {
  type: 'order';
  /** 正しい順番のカード */
  tokens: string[];
  /** 正解の別の並べ方（カードの並び） */
  alts?: string[][];
  /** カードのつなぎ方（英語は ' '、国語・年代は '' か ' → '） */
  join: string;
}

export interface SelfQ extends QBase {
  type: 'self';
  /** 模範解答 */
  model: string;
  /** 採点のポイント */
  points?: string[];
}

/** 漢字の書き取り：指で書いて、正しい字と見くらべて自分で採点する */
export interface WriteQ extends QBase {
  type: 'write';
  /** 正しい漢字（送りがなは問題文の外） */
  answer: string;
}

export type Question = ChoiceQ | InputQ | OrderQ | SelfQ | WriteQ;

/** 問題を作る関数（数学の計算など、数値を変えて毎回ちがう問題を作る） */
export type Gen = (rng: () => number) => Question;

export interface Unit {
  id: string;
  name: string;
  /** 決まった問題 */
  questions: Question[];
  /** 毎回作る問題 */
  gens?: Gen[];
}

export interface Section {
  title: string;
  units: string[];
  count: number;
  /** 1問あたりの配点 */
  points: number;
}

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  /** 試験範囲（範囲表から） */
  scope: string;
  units: Unit[];
  /** 本番モードの大問構成（配点合計100点） */
  exam: Section[];
  passages?: Record<string, { title: string; text: string }>;
}

export interface User {
  id: string;
  name: string;
}

/** 1問の答えの記録 */
export interface AnswerRecord {
  question: Question;
  given: string;
  /** 1=正解 0.5=部分点（自己採点△） 0=不正解 */
  score: number;
  section?: number;
}

export interface ExamResult {
  id: string;
  userId: string;
  subject: SubjectId;
  date: string;
  score: number;
  durationSec: number;
  sectionScores: { title: string; got: number; max: number }[];
  wrongs: AnswerRecord[];
}

export interface Settings {
  timeLimitMin: number;
  sound: boolean;
}
