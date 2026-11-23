/**
 * 数学の文字列の中の分数を見つける（教科書のように上下に分けた分数で表示するため）。
 *  - (x + 1)/2   → 分子 x + 1、分母 2（分子のかっこは外す）
 *  - x/3, 12/x, 2/3 → そのまま分子・分母
 *  - 2/3x        → 分数 2/3 のうしろに x（係数が分数の項）
 *  - −12/x       → 符号は分数の前に残る（−の後ろに分数）
 */
export type MathSeg = { t: 'text'; s: string } | { t: 'frac'; num: string; den: string };

// 分子：かっこでくくった式 か 数（小数可）・文字1つ。分母：数 か 文字1つ か かっこでくくった式
const FRAC = /\(([^()]+)\)\/(\d+(?:\.\d+)?|[a-z]|\([^()]+\))|(\d+(?:\.\d+)?|[a-z])\/(\d+(?:\.\d+)?|[a-z])(?![\d.])/g;

const unwrap = (s: string) => (s.startsWith('(') && s.endsWith(')') ? s.slice(1, -1) : s);

export function parseMath(text: string): MathSeg[] {
  const out: MathSeg[] = [];
  let last = 0;
  for (const m of text.matchAll(FRAC)) {
    const start = m.index!;
    // 英単語の中（例: and/or）や「分数 /」のような説明は対象外：前が英字なら分数にしない
    const prev = text[start - 1] ?? '';
    if (/[A-Za-z]/.test(prev)) continue;
    if (start > last) out.push({ t: 'text', s: text.slice(last, start) });
    const num = m[1] ?? m[3];
    const den = unwrap(m[2] ?? m[4]);
    out.push({ t: 'frac', num, den });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ t: 'text', s: text.slice(last) });
  return out;
}
