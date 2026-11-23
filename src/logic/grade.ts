import type { InputQ, OrderQ, Question } from '../types';

/** 全角英数・記号を半角にし、空白をそろえる */
export function toHalf(s: string): string {
  return s
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ');
}

/** カタカナ → ひらがな */
export function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** 数学の答えの正規化：空白・「y=」などを取り、マイナス記号をそろえる */
export function normMath(s: string): string {
  let t = toHalf(s).replace(/\s+/g, '').toLowerCase();
  t = t.replace(/[−–—ー‐]/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
  t = t.replace(/^[a-z]=/, '');
  t = t.replace(/^\+/, '');
  return t;
}

/** 分数・小数・整数を数にする。数でなければ null */
export function parseNumber(s: string): number | null {
  const t = normMath(s);
  let m = t.match(/^(-?)\(?(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\)?$/);
  if (m) {
    const v = Number(m[2]) / Number(m[3]);
    return m[1] ? -v : v;
  }
  m = t.match(/^-?\d+(?:\.\d+)?$/);
  if (m) return Number(t);
  // -(3/2) のような書き方
  m = t.match(/^-\((\d+)\/(\d+)\)$/);
  if (m) return -Number(m[1]) / Number(m[2]);
  return null;
}

/** 式の正規化：y=3x と 3x、y=-12/x と -12/x、0.5x と 1/2x を同じにする */
export function mathEqual(given: string, expected: string): boolean {
  const a = normMath(given);
  const b = normMath(expected);
  if (!a) return false;
  if (a === b) return true;
  const na = parseNumber(a);
  const nb = parseNumber(b);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 1e-9;
  // ax の形（係数が分数・小数でもよい）
  const coef = (t: string): number | null => {
    const m = t.match(/^(.*?)x$/);
    if (!m) return null;
    if (m[1] === '' || m[1] === '+') return 1;
    if (m[1] === '-') return -1;
    return parseNumber(m[1].replace(/^\((.*)\)$/, '$1'));
  };
  const ca = coef(a);
  const cb = coef(b);
  if (ca !== null && cb !== null) return Math.abs(ca - cb) < 1e-9;
  // a/x の形
  const inv = (t: string): number | null => {
    const m = t.match(/^(-?\d+(?:\.\d+)?)\/x$/);
    if (m) return Number(m[1]);
    const m2 = t.match(/^-\((\d+)\/x\)$/);
    return m2 ? -Number(m2[1]) : null;
  };
  const ia = inv(a);
  const ib = inv(b);
  if (ia !== null && ib !== null) return ia === ib;
  return false;
}

/** 英語：大文字小文字・文末の記号・余分な空白・アポストロフィの形を気にしない */
export function normEn(s: string): string {
  return toHalf(s)
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.?!])\s*/g, '$1 ')
    .replace(/[.?!]\s*$/, '')
    .trim()
    .replace(/[.,?!]$/, '')
    .trim();
}

/** 日本語：空白・句読点・かぎかっこを取り、カタカナはひらがなにそろえる */
export function normJa(s: string): string {
  return toHiragana(
    toHalf(s)
      .replace(/[\s、。，．・「」『』（）()]/g, '')
      .toLowerCase(),
  );
}

export function checkInput(q: InputQ, given: string): boolean {
  if (q.kind === 'math') return q.answers.some((a) => mathEqual(given, a));
  if (q.kind === 'en') return q.answers.some((a) => normEn(a) === normEn(given));
  return q.answers.some((a) => normJa(a) === normJa(given));
}

export function checkOrder(q: OrderQ, given: string[]): boolean {
  const same = (x: string[]) => x.length === given.length && x.every((t, i) => t === given[i]);
  return same(q.tokens) || (q.alts ?? []).some(same);
}

/** 正解として見せる文字列 */
export function answerText(q: Question): string {
  switch (q.type) {
    case 'choice':
      return q.answer;
    case 'input':
      return `${q.prefix ? q.prefix + ' ' : ''}${q.answers[0]}${q.suffix ? ' ' + q.suffix : ''}`;
    case 'order':
      return q.tokens.join(q.join);
    case 'self':
      return q.model;
    case 'write':
      return q.answer;
  }
}
