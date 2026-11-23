import type { Question, Subject, Unit } from '../types';
import { shuffle, type Rng } from './random';

export interface Item {
  question: Question;
  /** 本番の大問番号（練習では undefined） */
  section?: number;
  points: number;
}

/** 選択肢の並びをシャッフルした問題を返す（元の問題は変えない） */
export function prepare(q: Question, rng: Rng): Question {
  if (q.type === 'choice' && !q.fixed) return { ...q, choices: shuffle(q.choices, rng) };
  return q;
}

/** 単元から n 問えらぶ。決まった問題を先に使い、足りなければ作る問題で補う。作る問題は同じ文にならないようにする */
export function pickFromUnits(units: Unit[], n: number, rng: Rng, used: Set<string> = new Set()): Question[] {
  const fixed = shuffle(units.flatMap((u) => u.questions), rng).filter((q) => !used.has(q.id));
  const gens = units.flatMap((u) => u.gens ?? []);
  const out: Question[] = [];
  // 決まった問題と作る問題を半々くらいで混ぜる（作る問題がある単元だけ）
  const genShare = gens.length ? Math.max(Math.ceil(n / 2), n - fixed.length) : 0;
  const nFixed = Math.min(fixed.length, n - Math.min(genShare, n));
  for (const q of fixed.slice(0, nFixed)) {
    used.add(q.id);
    out.push(q);
  }
  let guard = 0;
  const gOrder = shuffle(gens, rng);
  while (out.length < n && gens.length && guard < n * 30) {
    const q = gOrder[guard % gOrder.length](rng);
    guard++;
    const key = q.q + (q.fig ? JSON.stringify(q.fig) : '');
    if (used.has(key)) continue;
    used.add(key);
    out.push(q);
  }
  // 作る問題がない単元で足りないときは、決まった問題の残りから
  for (const q of fixed.slice(nFixed)) {
    if (out.length >= n) break;
    if (!out.includes(q)) out.push(q);
  }
  return shuffle(out, rng).map((q) => prepare(q, rng));
}

/** 本番モード：大問構成どおりに出題する */
export function buildExam(subject: Subject, rng: Rng): Item[] {
  const used = new Set<string>();
  const items: Item[] = [];
  subject.exam.forEach((sec, i) => {
    const units = subject.units.filter((u) => sec.units.includes(u.id));
    const qs = pickFromUnits(units, sec.count, rng, used);
    // 国語の読解は本文ごとにまとめる
    qs.sort((a, b) => (a.passage ?? '').localeCompare(b.passage ?? ''));
    for (const q of qs) items.push({ question: q, section: i, points: sec.points });
  });
  return items;
}

/** 単元別練習 */
export function buildPractice(units: Unit[], n: number, rng: Rng): Item[] {
  return pickFromUnits(units, n, rng).map((q) => ({ question: q, points: 1 }));
}

export function examMax(subject: Subject): number {
  return subject.exam.reduce((s, sec) => s + sec.count * sec.points, 0);
}

export function unitSize(u: Unit): number {
  return u.questions.length + (u.gens?.length ?? 0);
}
