// 数学：定期テストで差がつく「難しめ」「ひっかけ」問題（3章 方程式・4章 比例と反比例）
// 計算・文章題は数値を変えて毎回作る（答えはプログラムで計算）。
import type { ChoiceQ, Gen, InputQ, Question } from '../types';

type R = () => number;
const ri = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const nz = (r: R, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = ri(r, lo, hi);
  return v;
};
const pick = <T,>(r: R, arr: T[]) => arr[Math.floor(r() * arr.length)];
const M = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
const frac = (n: number, d: number) => {
  const g = gcd(n, d);
  let a = n / g;
  let b = d / g;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}` : `${a}/${b}`;
};
const showFrac = (s: string) => s.replace('-', '−');
const r1 = (v: number) => Math.round(v * 10) / 10;
/** 係数つきの項 */
const term = (c: number, v = 'x', first = true): string => {
  const abs = Math.abs(c);
  const body = abs === 1 && v ? v : `${abs}${v}`;
  if (first) return c < 0 ? `−${body}` : body;
  return c < 0 ? ` − ${body}` : ` + ${body}`;
};
const lin = (a: number, b: number) => (a === 0 ? M(b) : term(a) + (b === 0 ? '' : term(b, '', false)));
const xpm = (b: number) => (b === 0 ? 'x' : `x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`);

let n = 0;
const U = 'm-hard';
const num = (q: string, ans: number | string, explain: string, extra: Partial<InputQ> = {}): InputQ => ({
  id: `${U}-${n++}`, unit: U, type: 'input', kind: 'math', q, answers: [String(ans)], explain, ...extra,
});
let c = 0;
const ch = (q: string, answer: string, wrong: string[], explain: string, extra: Partial<ChoiceQ> = {}): ChoiceQ => ({
  id: `${U}-c${c++}`, unit: U, type: 'choice', q, answer, choices: [answer, ...wrong], explain, ...extra,
});

/** 条件に合う数がでるまで作り直す（最後は必ず作れる形で返す） */
function retry(r: R, make: (r: R) => Question | null, fallback: () => Question): Question {
  for (let i = 0; i < 60; i++) {
    const q = make(r);
    if (q) return q;
  }
  return fallback();
}

// ---------- 方程式（難しめ） ----------
export const hardEq: Gen[] = [
  // (ax + b)/p − (cx + d)/q = e
  (r) =>
    retry(r, (r) => {
      const [p, q] = pick(r, [[2, 3], [3, 4], [4, 6], [2, 5], [3, 2], [6, 4]]);
      const x = nz(r, -6, 6), a = pick(r, [1, 2, 3, -1]), cc = pick(r, [1, 2, -1, 3]);
      const m1 = ri(r, -3, 3), m2 = ri(r, -3, 3);
      const b = p * m1 - a * x, d = q * m2 - cc * x;
      if (Math.abs(b) > 12 || Math.abs(d) > 12 || b === 0 || d === 0) return null;
      const L = lcm(p, q);
      const k = (L / p) * a - (L / q) * cc;
      if (k === 0) return null;
      const e = m1 - m2;
      const top = (s: number, t: number) => `(${lin(s, t)})`;
      return num(`次の方程式を解きなさい。\n${top(a, b)}/${p} − ${top(cc, d)}/${q} = ${M(e)}`, x,
        `両辺に ${L} をかけて分母をはらう。分子は ( ) のまま計算するのがポイント。\n${L / p}(${lin(a, b)}) − ${L / q}(${lin(cc, d)}) = ${M(L * e)}\n${lin((L / p) * a, (L / p) * b)} ${(L / q) * cc > 0 ? '−' : '+'} ${Math.abs((L / q) * cc) === 1 ? '' : Math.abs((L / q) * cc)}x ${(L / q) * d > 0 ? '−' : '+'} ${Math.abs((L / q) * d)} = ${M(L * e)}\n${term(k)} = ${M(k * x)}\nx = ${M(x)}\n【ひっかけ】「−」のあとのかっこをはずすとき、うしろの項の符号も変わる。`,
        { prefix: 'x =' });
    }, () => num('次の方程式を解きなさい。\n(x + 1)/2 − (x − 1)/3 = 2', 7, '両辺に6をかける。3(x + 1) − 2(x − 1) = 12\n3x + 3 − 2x + 2 = 12\nx = 7', { prefix: 'x =' })),
  // 0.a(x − b) = 0.c x + d（小数とかっこ）
  (r) =>
    retry(r, (r) => {
      const x = nz(r, -9, 9), a = pick(r, [2, 3, 4, 6]), b = nz(r, -5, 5), cc = pick(r, [1, 5, 7, 8]);
      if (a === cc) return null;
      const lhs = (a * (x - b)) / 10;
      const d = r1(lhs - (cc * x) / 10);
      if (Math.abs(d) > 9) return null;
      return num(`次の方程式を解きなさい。\n0.${a}(${xpm(-b)}) = 0.${cc}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`, x,
        `両辺を10倍する。かっこの外の 0.${a} だけを10倍する（かっこの中は10倍しない）。\n${a}(${xpm(-b)}) = ${cc}x ${d < 0 ? '−' : '+'} ${Math.abs(r1(d * 10))}\n${lin(a, -a * b)} = ${lin(cc, r1(d * 10))}\n${term(a - cc)} = ${M(r1(d * 10) + a * b)}\nx = ${M(x)}`,
        { prefix: 'x =' });
    }, () => num('次の方程式を解きなさい。\n0.2(x − 3) = 0.5x + 0.9', -5, '10倍して 2(x − 3) = 5x + 9\n2x − 6 = 5x + 9\n−3x = 15\nx = −5', { prefix: 'x =' })),
  // 解から a（a が両辺にある）
  (r) =>
    retry(r, (r) => {
      const p = pick(r, [2, 3, -1, -2, 4, 5]);
      const cc = nz(r, -4, 5), b = nz(r, -9, 9);
      // a·p + b = c·p + a → a(p − 1) = c·p − b
      const top = cc * p - b;
      if (top % (p - 1) !== 0) return null;
      const a = top / (p - 1);
      if (a === 0 || Math.abs(a) > 20) return null;
      return num(`x についての方程式 ax ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${term(cc)} + a の解が x = ${M(p)} であるとき、a の値を求めなさい。`, a,
        `x = ${M(p)} を代入すると、a についての方程式になる。\n${M(p)}a ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${M(cc * p)} + a\n${M(p)}a − a = ${M(cc * p)} ${b < 0 ? '+' : '−'} ${Math.abs(b)}\n${M(p - 1)}a = ${M(top)}\na = ${M(a)}`,
        { prefix: 'a =' });
    }, () => num('x についての方程式 ax − 3 = 2x + a の解が x = 3 であるとき、a の値を求めなさい。', 4.5, '3a − 3 = 6 + a\n2a = 9\na = 4.5（9/2）', { prefix: 'a =' })),
  // (x + a) : b = x : c
  (r) =>
    retry(r, (r) => {
      const b = ri(r, 2, 9), cc = ri(r, 2, 9);
      if (b === cc) return null;
      const a = nz(r, -6, 8);
      if ((cc * a) % (b - cc) !== 0) return null;
      const x = (cc * a) / (b - cc);
      if (x === 0 || Math.abs(x) > 30) return null;
      return num(`次の比例式を解きなさい。\n(${xpm(a)}) : ${b} = x : ${cc}`, x,
        `外側の積＝内側の積 より ${cc}(${xpm(a)}) = ${b}x\n${lin(cc, cc * a)} = ${b}x\n${term(cc - b)} = ${M(-cc * a)}\nx = ${M(x)}`, { prefix: 'x =' });
    }, () => num('次の比例式を解きなさい。\n(x − 2) : 3 = x : 5', 5, '5(x − 2) = 3x\n5x − 10 = 3x\n2x = 10\nx = 5', { prefix: 'x =' })),
];

// ---------- 方程式の利用（難しめ） ----------
export const hardApp: Gen[] = [
  // 割引
  (r) => {
    const price = pick(r, [800, 1200, 1500, 2000, 2400, 3000]);
    const w = pick(r, [1, 2, 3]);
    const pay = (price * (10 - w)) / 10;
    return num(`ある品物を定価の${w}割引きで買ったところ、代金は ${pay}円でした。この品物の定価は何円ですか。`, price,
      `定価を x 円とすると、${w}割引きの値段は (1 − 0.${w})x = 0.${10 - w}x 円。\n0.${10 - w}x = ${pay}\nx = ${price}\n【ひっかけ】「${w}割引き」は定価の 0.${w} 倍ではなく 0.${10 - w} 倍。`, { suffix: '円' });
  },
  // 途中から走る
  (r) =>
    retry(r, (r) => {
      const v1 = pick(r, [60, 70, 80]), v2 = pick(r, [150, 160, 180, 200]);
      const t = ri(r, 12, 20), x = ri(r, 3, t - 3);
      const dist = v1 * x + v2 * (t - x);
      return num(`家から ${dist}m はなれた駅まで行くのに、はじめは分速 ${v1}m で歩き、途中から分速 ${v2}m で走ったところ、全部で ${t}分かかりました。歩いた時間は何分ですか。`, x,
        `歩いた時間を x 分とすると、走った時間は (${t} − x) 分。道のりの合計で式を作る。\n${v1}x + ${v2}(${t} − x) = ${dist}\n${v1}x + ${v2 * t} − ${v2}x = ${dist}\n${M(v1 - v2)}x = ${M(dist - v2 * t)}\nx = ${x}`, { suffix: '分' });
    }, () => num('家から1500m はなれた駅まで、はじめ分速60m で歩き、途中から分速150m で走ったら、全部で16分かかった。歩いた時間は何分ですか。', 10, '60x + 150(16 − x) = 1500\n−90x = −900\nx = 10', { suffix: '分' })),
  // 2けたの数の入れかえ
  (r) => {
    const p = ri(r, 1, 7), q = ri(r, p + 1, 9);
    const s = p + q, d = 9 * (q - p);
    return num(`2けたの正の整数があります。十の位の数と一の位の数の和は ${s} で、十の位と一の位を入れかえた数は、もとの数より ${d} 大きくなります。もとの整数を求めなさい。`, 10 * p + q,
      `十の位を x とすると、一の位は ${s} − x。\nもとの数：10x + (${s} − x)　入れかえた数：10(${s} − x) + x\n10(${s} − x) + x = 10x + (${s} − x) + ${d}\n${10 * s} − 9x = 9x + ${s + d}\n−18x = ${M(s + d - 10 * s)}\nx = ${p}　→ もとの数は ${10 * p + q}\n【ひっかけ】答えは x ではなく「もとの整数」。`);
  },
  // 長いす
  (r) =>
    retry(r, (r) => {
      const x = ri(r, 6, 15), k1 = pick(r, [3, 4, 5]), k2 = k1 + 1, e = pick(r, [0, 1]), m = ri(r, 1, k2 - 1);
      const people = k2 * (x - e - 1) + m;
      const rest = people - k1 * x;
      if (rest <= 0 || rest > 15) return null;
      const extra = e ? `、さらに長いすが ${e}脚あまります` : 'ます';
      return num(`生徒が長いすに座ります。1脚に ${k1}人ずつ座ると ${rest}人が座れません。1脚に ${k2}人ずつ座ると、最後の長いすには ${m}人が座ることになり${extra}。長いすは何脚ありますか。`, x,
        `長いすを x 脚として、生徒の人数を2通りに表す。\n${k1}人ずつ：${k1}x + ${rest}（人）\n${k2}人ずつ：${k2}人ずつ座る長いすは (x − ${e + 1}) 脚、最後の1脚に ${m}人${e ? `、あまる長いす ${e}脚` : ''} → ${k2}(x − ${e + 1}) + ${m}（人）\n${k1}x + ${rest} = ${k2}(x − ${e + 1}) + ${m}\nx = ${x}\n【ひっかけ】最後の1脚は ${k2}人ではない。あまるいすも数え忘れないこと。`, { suffix: '脚' });
    }, () => num('長いす1脚に4人ずつ座ると6人座れない。5人ずつ座ると最後のいすは2人で、いすが1脚あまる。長いすは何脚？', 14, '4x + 6 = 5(x − 2) + 2\nx = 14', { suffix: '脚' })),
  // 池のまわりで出会う・追いつく
  (r) =>
    retry(r, (r) => {
      const va = pick(r, [60, 70, 80, 90]), vb = pick(r, [50, 60, 70, 100, 120]);
      const same = r() < 0.4;
      const x = ri(r, 4, 15);
      if (same && vb <= va) return null;
      const L = same ? (vb - va) * x : (va + vb) * x;
      if (L > 3000) return null;
      return same
        ? num(`1周 ${L}m の池のまわりを、A は分速 ${va}m、B は分速 ${vb}m で、同じ場所から同時に同じ向きに歩き始めました。B が A にはじめて追いつく（1周多く歩く）のは何分後ですか。`, x,
            `同じ向き：B が A より1周（${L}m）多く歩いたときに追いつく。\n${vb}x − ${va}x = ${L}\n${vb - va}x = ${L}\nx = ${x}`, { suffix: '分後' })
        : num(`1周 ${L}m の池のまわりを、A は分速 ${va}m、B は分速 ${vb}m で、同じ場所から同時に反対向きに歩き始めました。2人がはじめて出会うのは何分後ですか。`, x,
            `反対向き：2人の歩いた道のりの和が1周（${L}m）になったときに出会う。\n${va}x + ${vb}x = ${L}\n${va + vb}x = ${L}\nx = ${x}`, { suffix: '分後' });
    }, () => num('1周1200m の池のまわりを、A は分速70m、B は分速80m で反対向きに歩く。はじめて出会うのは何分後？', 8, '70x + 80x = 1200\nx = 8', { suffix: '分後' })),
  // 姉と妹のお金のやりとり
  (r) => {
    const x = pick(r, [1200, 1500, 1800, 2000, 2400]), y = pick(r, [600, 800, 900, 1000]), g = pick(r, [100, 200, 300]);
    if ((x - g) === 2 * (y + g)) {
      return num(`姉は ${x}円、妹は ${y}円持っています。姉が妹に何円かわたしたところ、姉の金額は妹の金額の2倍になりました。姉は妹に何円わたしましたか。`, g,
        `わたした金額を x 円とすると (${x} − x) = 2(${y} + x)\n${x} − x = ${2 * y} + 2x\n−3x = ${M(2 * y - x)}\nx = ${g}`, { suffix: '円' });
    }
    // 2倍になるように金額を作り直す
    const yy = (x - 3 * g) / 2;
    return num(`姉は ${x}円、妹は ${yy}円持っています。姉が妹に何円かわたしたところ、姉の金額は妹の金額の2倍になりました。姉は妹に何円わたしましたか。`, g,
      `わたした金額を x 円とすると、姉は (${x} − x) 円、妹は (${yy} + x) 円。\n${x} − x = 2(${yy} + x)\n${x} − x = ${2 * yy} + 2x\n−3x = ${M(2 * yy - x)}\nx = ${g}\n【ひっかけ】わたすと、姉は減り妹は増える。両方に x を使う。`, { suffix: '円' });
  },
];

// ---------- 比例・反比例（難しめ） ----------
const rangeText = (lo: number, hi: number, v = 'y') => `${M(lo)} ≦ ${v} ≦ ${M(hi)}`;
export const hardFunc: Gen[] = [
  // 比例の変域（a < 0 のひっかけ）
  (r) => {
    const a = pick(r, [-3, -2, 2, 3, -4]);
    const x1 = pick(r, [-3, -2, -1]), x2 = pick(r, [2, 3, 4]);
    const y1 = a * x1, y2 = a * x2;
    const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
    const choices = [rangeText(lo, hi), rangeText(hi, lo), rangeText(-hi, -lo), rangeText(a * 0, hi)];
    const uniq = [...new Set(choices)];
    while (uniq.length < 4) uniq.push(rangeText(lo - 1, hi + 1 + uniq.length));
    return {
      id: `${U}-rng-${n++}`, unit: U, type: 'choice', q: `y = ${term(a)} で、x の変域が ${rangeText(x1, x2, 'x')} のとき、y の変域を求めなさい。`,
      answer: rangeText(lo, hi), choices: uniq.slice(0, 4),
      explain: `x = ${M(x1)} のとき y = ${M(y1)}、x = ${M(x2)} のとき y = ${M(y2)}。\n小さい方を左、大きい方を右に書いて ${rangeText(lo, hi)}\n${a < 0 ? '【ひっかけ】a < 0 なので、x が大きいほど y は小さくなる。変域の左右が入れかわる。' : '両はしの x を代入して求める。'}`,
    } satisfies ChoiceQ;
  },
  // 反比例の変域
  (r) =>
    retry(r, (r) => {
      const a = pick(r, [12, 24, 18, -12, -24, 36]);
      const ds = [1, 2, 3, 4, 6].filter((d) => a % d === 0);
      const x1 = pick(r, ds), x2 = pick(r, ds.filter((d) => d > x1));
      if (!x2) return null;
      const y1 = a / x1, y2 = a / x2;
      const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      const uniq = [...new Set([rangeText(lo, hi), rangeText(hi, lo), rangeText(a / x2 / 2, a * 2), rangeText(-hi, -lo)])];
      if (uniq.length < 4) return null;
      return {
        id: `${U}-inv-${n++}`, unit: U, type: 'choice', q: `y = ${M(a)}/x で、x の変域が ${rangeText(x1, x2, 'x')} のとき、y の変域を求めなさい。`,
        answer: rangeText(lo, hi), choices: uniq,
        explain: `x = ${x1} のとき y = ${M(y1)}、x = ${x2} のとき y = ${M(y2)}。\n小さい方から書いて ${rangeText(lo, hi)}\n【ひっかけ】${a > 0 ? '反比例（a > 0）では x が増えると y は減るので、x = ' + x1 + ' のときが最大。' : 'a < 0 なので y はすべて負の数。'}`,
      } satisfies ChoiceQ;
    }, () => ch('y = 12/x で、x の変域が 2 ≦ x ≦ 6 のとき、y の変域は？', '2 ≦ y ≦ 6', ['6 ≦ y ≦ 2', '6 ≦ y ≦ 12', '1 ≦ y ≦ 6'], 'x = 2 のとき 6、x = 6 のとき 2。')),
  // 反比例のグラフ上の、x・y がともに整数の点の個数
  (r) => {
    const a = pick(r, [6, 8, 10, 12, 16, 18, 20, -6, -12]);
    const divs = Array.from({ length: Math.abs(a) }, (_, i) => i + 1).filter((d) => Math.abs(a) % d === 0);
    const cnt = divs.length * 2;
    return num(`y = ${M(a)}/x のグラフ上の点のうち、x 座標も y 座標も整数である点は何個ありますか。`, cnt,
      `x が ${Math.abs(a)} の約数（${divs.join('、')}）のとき y も整数になる。\nx が正の数のとき ${divs.length}個、x が負の数のときも ${divs.length}個。\n合わせて ${cnt}個\n【ひっかけ】負の数の x を忘れやすい。`, { suffix: '個' });
  },
  // 2つのグラフの交点
  (r) => {
    const b = pick(r, [12, 18, 24, 8, 6, 20, -12, -18]);
    const p = pick(r, [1, 2, 3, 4, 6].filter((d) => b % d === 0 && d !== 1));
    const yv = b / p;
    return num(`比例 y = ax のグラフと反比例 y = ${M(b)}/x のグラフが、x 座標が ${p} の点で交わっています。a の値を求めなさい。`, frac(yv, p),
      `交点は y = ${M(b)}/x 上にあるので、x = ${p} のとき y = ${M(b)} ÷ ${p} = ${M(yv)}。交点は (${p}, ${M(yv)})\nこの点は y = ax 上にもあるので ${M(yv)} = ${p}a\na = ${showFrac(frac(yv, p))}`, { prefix: 'a =' });
  },
  // 反比例のグラフと三角形の面積（x に関係なく一定）
  (r) => {
    const a = pick(r, [6, 8, 10, 12, 16, 18, 24]);
    const p = pick(r, [1, 2, 3, 4, 6].filter((d) => a % d === 0));
    return num(`y = ${a}/x のグラフ上の点 A(${p}, ${a / p}) から x 軸に垂線をひき、x 軸との交点を B とします。原点を O とするとき、三角形 OAB の面積を求めなさい。（1目もり1cm）`, a / 2,
      `底辺 OB = ${p}、高さ AB = ${a / p}\n面積 = ${p} × ${a / p} ÷ 2 = ${a / 2}\n【発展】反比例のグラフ上のどの点でも xy = ${a} なので、面積はいつも ${a} ÷ 2 = ${a / 2} になる。`, { suffix: 'cm²' });
  },
  // 動点
  (r) => {
    const ab = pick(r, [4, 6, 8, 10]), bc = pick(r, [6, 8, 10, 12]), v = pick(r, [1, 2]);
    const k = (ab * v) / 2;
    const t = ri(r, 1, bc / v);
    return r() < 0.5
      ? num(`長方形 ABCD（AB = ${ab}cm、BC = ${bc}cm）で、点 P は B を出発して辺 BC 上を C まで毎秒 ${v}cm で動きます。x 秒後の三角形 ABP の面積を y cm² とするとき、y を x の式で表しなさい。`, k === 1 ? 'x' : `${k}x`,
          `BP = ${v}x cm。三角形 ABP の底辺 BP、高さ AB = ${ab}\ny = ${v}x × ${ab} ÷ 2 = ${k}x（比例）`, { prefix: 'y =' })
      : num(`長方形 ABCD（AB = ${ab}cm、BC = ${bc}cm）で、点 P は B を出発して辺 BC 上を C まで毎秒 ${v}cm で動きます。出発して ${t}秒後の三角形 ABP の面積は何cm² ですか。`, k * t,
          `y = ${v}x × ${ab} ÷ 2 = ${k}x。x = ${t} を代入して y = ${k * t}`, { suffix: 'cm²' });
  },
  // 何倍になるか（反比例のひっかけ）
  (r) => {
    const k = pick(r, [2, 3, 4, 5]);
    const inv = r() < 0.6;
    return num(`y は x に${inv ? '反比例' : '比例'}しています。x の値が ${k}倍になると、y の値は何倍になりますか。（分数の答えは、キーパッドの「分数 /」を使って入力する）`, inv ? `1/${k}` : k,
      inv ? `反比例では x が ${k}倍になると y は 1/${k}倍になる（xy が一定だから）。\n【ひっかけ】「${k}分の1倍」であって「${k}倍」や「−${k}倍」ではない。` : `比例では x が ${k}倍になると y も ${k}倍になる。`, { suffix: '倍' });
  },
  // 比例定数が分数＋値
  (r) => {
    const [p, q] = pick(r, [[2, 3], [-3, 4], [3, 2], [-1, 3], [5, 2]]);
    const x1 = q * pick(r, [1, 2, -1]), x2 = q * pick(r, [3, -2, 4]);
    const y1 = (p * x1) / q;
    return num(`y は x に比例し、x = ${M(x1)} のとき y = ${M(y1)} です。x = ${M(x2)} のときの y の値を求めなさい。`, (p * x2) / q,
      `a = ${M(y1)} ÷ (${M(x1)}) = ${showFrac(frac(p, q))}　→ y = ${showFrac(frac(p, q))}x\nx = ${M(x2)} を代入して y = ${M((p * x2) / q)}`, { prefix: 'y =' });
  },
];

// ---------- ひっかけ（選択） ----------
export const trapQs: ChoiceQ[] = [
  ch('方程式 −3x = 12 を解いたものとして正しいのはどれですか。', 'x = −4', ['x = 4', 'x = −36', 'x = −1/4'], '両辺を −3 でわる。12 ÷ (−3) = −4。両辺に −3 をかけたり、わる数を逆にしたりしないこと。'),
  ch('方程式 2(x − 3) = 4 のかっこをはずした式として正しいのはどれですか。', '2x − 6 = 4', ['2x − 3 = 4', '2x + 6 = 4', 'x − 6 = 4'], 'かっこの中のすべての項に 2 をかける。−3 にもかけ忘れないこと。'),
  ch('方程式 −(x − 5) = 3 のかっこをはずした式として正しいのはどれですか。', '−x + 5 = 3', ['−x − 5 = 3', 'x − 5 = 3', '−x + 5 = −3'], '−( ) をはずすと、かっこの中の符号がすべて変わる。'),
  ch('方程式 (x − 1)/2 = (x + 1)/3 の両辺に6をかけた式として正しいのはどれですか。', '3(x − 1) = 2(x + 1)', ['3x − 1 = 2x + 1', '6x − 1 = 6x + 1', '2(x − 1) = 3(x + 1)'], '分子にかっこを付けてから分配する。分母の 2 には 3 が、3 には 2 がかかる。'),
  ch('方程式 x/3 − 1 = 2 の両辺に3をかけた式として正しいのはどれですか。', 'x − 3 = 6', ['x − 1 = 6', 'x − 3 = 2', '3x − 3 = 6'], '分母をはらうときは、分数でない項（−1）や右辺にも 3 をかける。'),
  ch('方程式 0.3x − 1.2 = 0.6 の両辺を10倍した式として正しいのはどれですか。', '3x − 12 = 6', ['3x − 1.2 = 0.6', '3x − 12 = 0.6', '3x − 1.2 = 6'], 'すべての項を10倍する。'),
  ch('方程式 0.5x + 2 = 0.25x を整数の係数にするとき、両辺を何倍すればよいですか。', '100倍', ['10倍', '1000倍', '5倍'], '0.25 は小数第2位まであるので100倍する。50x + 200 = 25x'),
  ch('方程式 5x − 7 = 3x + 1 で、移項した式として正しいのはどれですか。', '5x − 3x = 1 + 7', ['5x + 3x = 1 − 7', '5x − 3x = 1 − 7', '5x + 3x = 1 + 7'], '移項するときは符号を変える。3x → −3x、−7 → +7。'),
  ch('比例式 x : 6 = 2 : 3 を解いたものとして正しいのはどれですか。', 'x = 4', ['x = 9', 'x = 1', 'x = 36'], '外側の積＝内側の積 より 3x = 12、x = 4。'),
  ch('ある数 x の3倍から5をひいた数は、x の2倍に4を加えた数に等しい。これを表した方程式はどれですか。', '3x − 5 = 2x + 4', ['3x − 5 = 2(x + 4)', '3(x − 5) = 2x + 4', '5 − 3x = 2x + 4'], '「3倍から5をひく」＝3x − 5、「2倍に4を加える」＝2x + 4。'),
  ch('次のうち、y が x に比例するものはどれですか。', 'y = x/4', ['y = 4/x', 'y = x + 4', 'xy = 4'], 'y = x/4 は y = (1/4)x と同じで、比例定数 1/4 の比例。'),
  ch('次のうち、y が x に反比例するものはどれですか。', 'xy = −10', ['y = −10x', 'y = x − 10', 'y = x/10'], 'xy = −10 は y = −10/x と同じ。比例定数が負でも反比例。'),
  ch('y = 2x + 1 について正しいものはどれですか。', '比例でも反比例でもない', ['比例である', '反比例である', '比例定数は 2 である'], 'y = ax の形ではない（+1 がある）ので比例ではない。x が2倍になっても y は2倍にならない。'),
  ch('y = 3/x + 1 について正しいものはどれですか。', '反比例ではない', ['反比例で、比例定数は 3', '反比例で、比例定数は 4', '比例である'], 'y = a/x の形ではないので反比例ではない。'),
  ch('反比例 y = −8/x の比例定数はどれですか。', '−8', ['8', '−1/8', '1/8'], 'y = a/x の a が比例定数。符号もふくめて −8。'),
  ch('反比例 y = −6/x のグラフがある場所はどれですか。', '第2象限と第4象限', ['第1象限と第3象限', '第1象限と第2象限', '第3象限と第4象限'], 'a < 0 のとき、x が正なら y は負（第4象限）、x が負なら y は正（第2象限）。'),
  ch('比例 y = −2x で、x の値が増加すると y の値はどうなりますか。', '減少する', ['増加する', '変わらない', '0 に近づく'], 'a < 0 の比例は右下がり。x が増えると y は減る。'),
  ch('反比例 y = −12/x で、x > 0 の範囲で x の値が増加すると y の値はどうなりますか。', '増加する', ['減少する', '変わらない', '0 になる'], 'a < 0 の反比例では、x > 0 の範囲で x が増えると y も増える（−12 → −6 → −4 …）。'),
  ch('点 (−2, 0) はどこにありますか。', 'x 軸上', ['y 軸上', '第2象限', '第3象限'], 'y 座標が 0 なので x 軸上。象限には入らない。'),
  ch('点 (3, −4) と x 軸について対称な点の座標はどれですか。', '(3, 4)', ['(−3, −4)', '(−3, 4)', '(4, −3)'], 'x 軸について対称 → y 座標の符号だけが変わる。'),
  ch('点 (3, −4) と原点について対称な点の座標はどれですか。', '(−3, 4)', ['(3, 4)', '(−3, −4)', '(−4, 3)'], '原点について対称 → x・y の両方の符号が変わる。'),
  ch('y は x に反比例し、x = 0 のときの y の値として正しいものはどれですか。', 'y の値はない', ['y = 0', 'y = 1', 'y は比例定数と同じ'], '0 でわることはできないので、x = 0 のときの y の値はない。'),
  ch('1辺 x cm の正方形の面積を y cm² とします。y は x に比例しますか。', '比例しない', ['比例し、比例定数は 4', '比例し、比例定数は 2', '反比例する'], 'y = x × x なので y = ax の形ではない。x が2倍になると y は4倍になる。'),
  ch('分速 x m で 1200m 歩くのにかかる時間を y 分とします。正しいものはどれですか。', 'y は x に反比例し、y = 1200/x', ['y は x に比例し、y = 1200x', 'y は x に反比例し、y = x/1200', 'y は x に比例し、y = x/1200'], '時間 = 道のり ÷ 速さ。速さが2倍になると時間は半分になる。'),
];
