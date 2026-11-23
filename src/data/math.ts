// 数学：東京書籍「新しい数学1」P98〜156（3章 方程式・4章 比例と反比例）
// 計算問題は gens（毎回数値を変えて作る）。答えはプログラムで計算する。
import type { ChoiceQ, Gen, InputQ, Question, Subject } from '../types';
import { hardApp, hardEq, hardFunc, trapQs } from './mathHard';

/** 単元IDをつけかえる（mathHard の問題を単元ごとに分けるため） */
const inUnit = (unit: string, gens: Gen[]): Gen[] => gens.map((g) => (r) => ({ ...g(r), unit }) as Question);

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
/** 分数の文字列（約分済み）。答えの入力用 */
export const frac = (n: number, d: number) => {
  const g = gcd(n, d);
  let a = n / g;
  let b = d / g;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}` : `${a}/${b}`;
};
/** 答え用の ax（1x → x、-1x → -x） */
const ax = (c: string) => (c === '1' ? 'x' : c === '-1' ? '-x' : c + 'x');
/** 係数つきの項：3x, −x, x */
const term = (c: number, v = 'x', first = true): string => {
  const abs = Math.abs(c);
  const body = abs === 1 && v ? v : `${abs}${v}`;
  if (first) return c < 0 ? `−${body}` : body;
  return c < 0 ? ` − ${body}` : ` + ${body}`;
};
/** ax + b の形 */
const lin = (a: number, b: number) => (a === 0 ? M(b) : term(a) + (b === 0 ? '' : term(b, '', false)));

let n = 0;
const gid = (p: string) => `${p}-${n++}`;
const num = (unit: string, q: string, ans: number | string, explain: string, extra: Partial<InputQ> = {}): InputQ => ({
  id: gid(unit), unit, type: 'input', kind: 'math', q, answers: [String(ans)], explain, ...extra,
});

// ---------- 方程式の解き方 ----------
const eqBasic: Gen[] = [
  (r) => {
    const x = nz(r, -9, 9), a = nz(r, -9, 9) || 2, b = nz(r, -15, 15);
    const A = Math.abs(a) === 1 ? a * 2 : a;
    const c = A * x + b;
    return num('m-eq', `次の方程式を解きなさい。\n${lin(A, b)} = ${M(c)}`, x,
      `${M(b)} を移項すると ${term(A)} = ${M(c)}${b > 0 ? ' − ' + b : ' + ' + -b} = ${M(c - b)}\n両辺を ${M(A)} でわって x = ${M(x)}`, { prefix: 'x =' });
  },
  (r) => {
    const x = nz(r, -8, 8);
    let a = nz(r, -9, 9), c = nz(r, -9, 9);
    while (a === c) c = nz(r, -9, 9);
    const b = ri(r, -12, 12);
    const d = a * x + b - c * x;
    return num('m-eq', `次の方程式を解きなさい。\n${lin(a, b)} = ${lin(c, d)}`, x,
      `x の項を左辺に、数の項を右辺に移項する。\n${term(a)}${term(-c, 'x', false)} = ${M(d)}${term(-b, '', false)}\n${term(a - c)} = ${M(d - b)}\nx = ${M(x)}`, { prefix: 'x =' });
  },
];

const eqParen: Gen[] = [
  // a(x + b) = cx + d
  (r) => {
    const x = nz(r, -7, 7), a = pick(r, [2, 3, 4, 5, -2, -3]), b = nz(r, -6, 6);
    let c = nz(r, -6, 6);
    while (c === a) c = nz(r, -6, 6);
    const d = a * (x + b) - c * x;
    return num('m-eq2', `次の方程式を解きなさい。\n${M(a)}(${lin(1, b)}) = ${lin(c, d)}`, x,
      `かっこをはずすと ${lin(a, a * b)} = ${lin(c, d)}\n移項して ${term(a - c)} = ${M(d - a * b)}\nx = ${M(x)}`, { prefix: 'x =' });
  },
  // 小数：0.a x + 0.b = 0.c x + 0.d
  (r) => {
    const x = nz(r, -9, 9);
    let a = nz(r, -9, 9), c = nz(r, -9, 9);
    while (a === c) c = nz(r, -9, 9);
    const b = ri(r, -20, 20);
    const d = a * x + b - c * x;
    const dec = (v: number) => M(v / 10);
    const decLin = (p: number, q: number) => `${p < 0 ? '−' : ''}${Math.abs(p / 10)}x${q === 0 ? '' : q < 0 ? ' − ' + Math.abs(q / 10) : ' + ' + q / 10}`;
    return num('m-eq2', `次の方程式を解きなさい。\n${decLin(a, b)} = ${decLin(c, d)}`, x,
      `両辺を10倍して小数をなくす。\n${lin(a, b)} = ${lin(c, d)}\n${term(a - c)} = ${M(d - b)}\nx = ${M(x)}\n（${dec(a)} などはすべて10倍する。数の項の10倍を忘れないこと）`, { prefix: 'x =' });
  },
  // 分数：x/p + b = x/q
  (r) => {
    const [p, q] = pick(r, [[2, 3], [3, 4], [2, 5], [4, 6], [3, 6], [2, 4], [3, 5]]);
    const L = (p * q) / gcd(p, q);
    const k = nz(r, -4, 4);
    const x = L * k;
    const b = x / q - x / p;
    if (!Number.isInteger(b) || b === 0) {
      return num('m-eq2', `次の方程式を解きなさい。\nx/${p} = ${M(k * (L / p))}`, k * L,
        `両辺に ${p} をかけて x = ${M(k * L)}`, { prefix: 'x =' });
    }
    return num('m-eq2', `次の方程式を解きなさい。\nx/${p} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = x/${q}`, x,
      `両辺に ${L}（${p} と ${q} の最小公倍数）をかけて分母をはらう。\n${L / p}x ${b < 0 ? '−' : '+'} ${Math.abs(b * L)} = ${L / q}x\n${term(L / p - L / q)} = ${M(-b * L)}\nx = ${M(x)}`, { prefix: 'x =' });
  },
  // (x + a)/p = (x + b)/q
  (r) => {
    const [p, q] = pick(r, [[2, 3], [3, 2], [3, 4], [4, 3], [2, 5]]);
    const x = nz(r, -9, 9);
    // p(x+b) = q(x+a) を満たす a, b を選ぶ
    const a = nz(r, -5, 5);
    const bNum = q * (x + a) - p * x;
    if (bNum % p !== 0) {
      return num('m-eq2', `次の方程式を解きなさい。\n(x ${a < 0 ? '−' : '+'} ${Math.abs(a)})/${p} = ${M(x + a)}/${p}`, x, `両辺に ${p} をかける。x ${a < 0 ? '−' : '+'} ${Math.abs(a)} = ${M(x + a)}　x = ${M(x)}`, { prefix: 'x =' });
    }
    const b = bNum / p;
    const show = (v: number) => (v === 0 ? 'x' : `x ${v < 0 ? '−' : '+'} ${Math.abs(v)}`);
    return num('m-eq2', `次の方程式を解きなさい。\n(${show(b)})/${q} = (${show(a)})/${p}`, x,
      `両辺に ${p * q} をかけて分母をはらう（分子にかっこを付ける）。\n${p}(${show(b)}) = ${q}(${show(a)})\n${lin(p, p * b)} = ${lin(q, q * a)}\n${term(p - q)} = ${M(q * a - p * b)}\nx = ${M(x)}`, { prefix: 'x =' });
  },
];

const eqRatio: Gen[] = [
  (r) => {
    const a = ri(r, 2, 9), c = ri(r, 2, 9), k = ri(r, 2, 6);
    const b = c * k;
    const x = a * k;
    return num('m-ratio', `次の比例式を解きなさい。\nx : ${a} = ${b} : ${c}`, x,
      `比例式の性質（a : b = c : d ならば ad = bc）を使う。\n${c}x = ${a} × ${b}\n${c}x = ${a * b}\nx = ${x}`, { prefix: 'x =' });
  },
  (r) => {
    const a = ri(r, 2, 8), k = ri(r, 2, 5), b = ri(r, 2, 8);
    const c = a * k, x = b * k;
    return num('m-ratio', `次の比例式を解きなさい。\n${a} : ${b} = ${c} : x`, x,
      `${a}x = ${b} × ${c}\n${a}x = ${b * c}\nx = ${x}`, { prefix: 'x =' });
  },
  (r) => {
    // (x + a) : b = c : d
    const d = ri(r, 2, 5), k = ri(r, 2, 4), b = d * k, c = ri(r, 2, 7), a = nz(r, -4, 6);
    const x = c * k - a;
    return num('m-ratio', `次の比例式を解きなさい。\n(x ${a < 0 ? '−' : '+'} ${Math.abs(a)}) : ${b} = ${c} : ${d}`, x,
      `${d}(x ${a < 0 ? '−' : '+'} ${Math.abs(a)}) = ${b} × ${c}\n${lin(d, d * a)} = ${b * c}\n${d}x = ${b * c - d * a}\nx = ${x}`, { prefix: 'x =' });
  },
  (r) => {
    const [m, w] = pick(r, [[3, 5], [2, 3], [4, 7], [3, 4], [2, 5]]);
    const k = pick(r, [20, 30, 40, 50]);
    const milk = w * k;
    return num('m-ratio', `コーヒーと牛乳を ${m} : ${w} の割合で混ぜてカフェオレを作る。牛乳を ${milk}mL 使うとき、コーヒーは何mL 必要ですか。`, m * k,
      `コーヒーを x mL とすると x : ${milk} = ${m} : ${w}\n${w}x = ${milk * m}\nx = ${m * k}`, { suffix: 'mL' });
  },
];

const eqApp: Gen[] = [
  // 代金
  (r) => {
    const a = pick(r, [60, 70, 80, 90, 110, 120]), b = pick(r, [150, 180, 200, 230, 250]), x = ri(r, 3, 9);
    const c = a * x + b;
    return num('m-app', `1本 ${a}円の鉛筆を何本かと、1冊 ${b}円のノートを1冊買ったところ、代金の合計は ${c}円でした。鉛筆を何本買いましたか。`, x,
      `鉛筆を x 本とすると ${a}x + ${b} = ${c}\n${a}x = ${c - b}\nx = ${x}`, { suffix: '本' });
  },
  // 過不足
  (r) => {
    const n2 = ri(r, 5, 12), p = ri(r, 2, 5), rr = p + ri(r, 1, 2), q = ri(r, 1, 9);
    const total = p * n2 + q;
    const s = rr * n2 - total;
    if (s <= 0) {
      return num('m-app', `何人かの子どもに色紙を配る。1人 ${p}枚ずつ配ると ${q}枚余り、色紙は全部で ${total}枚ある。子どもは何人ですか。`, n2, `人数を x 人とすると ${p}x + ${q} = ${total}　x = ${n2}`, { suffix: '人' });
    }
    return num('m-app', `何人かの子どもに色紙を配る。1人 ${p}枚ずつ配ると ${q}枚余り、1人 ${rr}枚ずつ配ると ${s}枚たりない。子どもの人数は何人ですか。`, n2,
      `人数を x 人として、色紙の枚数を2通りに表す。\n${p}x + ${q} = ${rr}x − ${s}\n${p - rr}x = ${-s - q}\nx = ${n2}\n（色紙は ${total}枚）`, { suffix: '人' });
  },
  // 速さ（追いつく）
  (r) => {
    const v1 = pick(r, [60, 70, 80]), t = pick(r, [5, 6, 10, 12]);
    const v2 = pick(r, [180, 200, 210, 240].filter((v) => (v1 * t) % (v - v1) === 0)) ?? 200;
    if ((v1 * t) % (v2 - v1) !== 0) {
      return num('m-app', `弟が家を出て分速 60m で歩いた。その 10分後に兄が分速 210m で自転車で追いかけた。兄は家を出てから何分後に弟に追いつきますか。`, 4, `兄が x 分後に追いつくとすると 210x = 60(x + 10)\n150x = 600　x = 4`, { suffix: '分後' });
    }
    const x = (v1 * t) / (v2 - v1);
    return num('m-app', `弟が家を出て分速 ${v1}m で歩いた。その ${t}分後に兄が分速 ${v2}m で自転車で同じ道を追いかけた。兄は家を出てから何分後に弟に追いつきますか。`, x,
      `兄が x 分後に追いつくとすると、2人の進んだ道のりは等しい。\n${v2}x = ${v1}(x + ${t})\n${v2 - v1}x = ${v1 * t}\nx = ${x}`, { suffix: '分後' });
  },
  // 年齢
  (r) => {
    const s = ri(r, 8, 14), k = pick(r, [2, 3]), x = ri(r, 2, 12);
    const f = k * (s + x) - x;
    return num('m-app', `現在、父は ${f}才、子どもは ${s}才です。父の年齢が子どもの年齢の ${k}倍になるのは何年後ですか。`, x,
      `x 年後とすると ${f} + x = ${k}(${s} + x)\n${f} + x = ${k * s} + ${k}x\n${1 - k}x = ${k * s - f}\nx = ${x}`, { suffix: '年後' });
  },
  // 解から a
  (r) => {
    const p = nz(r, -4, 5), b = ri(r, 2, 6), c = ri(r, 2, 6), d = nz(r, -9, 9);
    // b x + a = c x + d に x = p
    const a = c * p + d - b * p;
    return num('m-app', `x についての方程式 ${b}x + a = ${lin(c, d)} の解が ${M(p)} のとき、a の値を求めなさい。`, a,
      `x = ${M(p)} を代入すると ${b} × (${M(p)}) + a = ${c} × (${M(p)}) ${d < 0 ? '−' : '+'} ${Math.abs(d)}\n${M(b * p)} + a = ${M(c * p + d)}\na = ${M(a)}`, { prefix: 'a =' });
  },
  // 2けたの数・連続する整数
  (r) => {
    const x = ri(r, 5, 40);
    const s = x + (x + 1) + (x + 2);
    return num('m-app', `連続する3つの整数があり、その和は ${s} です。いちばん小さい数を求めなさい。`, x,
      `いちばん小さい数を x とすると、3つの数は x, x + 1, x + 2\nx + (x + 1) + (x + 2) = ${s}\n3x + 3 = ${s}\nx = ${x}`);
  },
  // 1個あたり・りんごとみかん
  (r) => {
    const total = ri(r, 10, 15), a = pick(r, [120, 150, 130]), b = pick(r, [50, 60, 40]), x = ri(r, 2, total - 2);
    const c = a * x + b * (total - x);
    return num('m-app', `1個 ${a}円のりんごと1個 ${b}円のみかんを合わせて ${total}個買ったら、代金は ${c}円でした。りんごを何個買いましたか。`, x,
      `りんごを x 個とすると、みかんは (${total} − x) 個。\n${a}x + ${b}(${total} − x) = ${c}\n${a - b}x + ${b * total} = ${c}\n${a - b}x = ${c - b * total}\nx = ${x}`, { suffix: '個' });
  },
];

// ---------- 比例・反比例 ----------
const prop: Gen[] = [
  (r) => {
    const a = nz(r, -6, 6), x = nz(r, -5, 5);
    return num('m-prop', `y は x に比例し、x = ${M(x)} のとき y = ${M(a * x)} です。y を x の式で表しなさい。`, ax(String(a)),
      `比例の式 y = ax に x = ${M(x)}, y = ${M(a * x)} を代入する。\n${M(a * x)} = a × (${M(x)})　a = ${M(a)}\nよって y = ${term(a)}`, { prefix: 'y =', answers: [ax(String(a))] });
  },
  (r) => {
    // 比例定数が分数
    const [p, q] = pick(r, [[2, 3], [3, 4], [1, 2], [-2, 3], [-3, 2], [3, 5], [-1, 4]]);
    const k = nz(r, -2, 2), x = q * k * (r() < 0.5 ? 1 : 2), y = (p * x) / q;
    return num('m-prop', `y は x に比例し、x = ${M(x)} のとき y = ${M(y)} です。y を x の式で表しなさい。\n（比例定数が分数のときは、キーパッドの「分数 /」を使って入力する）`, ax(frac(p, q)),
      `y = ax に代入して ${M(y)} = a × (${M(x)})　a = ${frac(p, q).replace('-', '−')}\nよって y = ${frac(p, q).replace('-', '−')}x`, { prefix: 'y =' });
  },
  (r) => {
    const a = nz(r, -5, 5), x1 = nz(r, -4, 4), x2 = nz(r, -6, 6);
    return num('m-prop', `y は x に比例し、x = ${M(x1)} のとき y = ${M(a * x1)} です。x = ${M(x2)} のときの y の値を求めなさい。`, a * x2,
      `まず式を求める。a = ${M(a * x1)} ÷ (${M(x1)}) = ${M(a)} より y = ${term(a)}\nx = ${M(x2)} を代入して y = ${M(a)} × (${M(x2)}) = ${M(a * x2)}`, { prefix: 'y =' });
  },
  (r) => {
    const a = pick(r, [6, 8, 12, 18, 24, -6, -12, -18, 20]), divs = [1, 2, 3, 4, 6].filter((d) => a % d === 0);
    const x = pick(r, divs) * (r() < 0.5 ? -1 : 1);
    return num('m-inv', `y は x に反比例し、x = ${M(x)} のとき y = ${M(a / x)} です。y を x の式で表しなさい。`, `${a}/x`,
      `反比例の式 y = a/x より a = xy = (${M(x)}) × (${M(a / x)}) = ${M(a)}\nよって y = ${M(a)}/x`, { prefix: 'y =' });
  },
  (r) => {
    const a = pick(r, [12, 24, 36, 18, -24, -12, 30]);
    const ds = [1, 2, 3, 4, 6].filter((d) => a % d === 0);
    const x1 = pick(r, ds), x2 = pick(r, ds.filter((d) => d !== x1)) * (r() < 0.5 ? -1 : 1);
    return num('m-inv', `y は x に反比例し、x = ${M(x1)} のとき y = ${M(a / x1)} です。x = ${M(x2)} のときの y の値を求めなさい。`, a / x2,
      `a = xy = ${M(x1)} × (${M(a / x1)}) = ${M(a)} より y = ${M(a)}/x\nx = ${M(x2)} を代入して y = ${M(a)} ÷ (${M(x2)}) = ${M(a / x2)}`, { prefix: 'y =' });
  },
  (r) => {
    // 表から比例定数
    const a = nz(r, -4, 4);
    const xs = [-2, -1, 0, 1, 2, 3];
    // 1か所を空らんにして、そこを答えさせることもある
    const blank = pick(r, [null, 4, 5]);
    const row = xs.map((x, i) => (i === blank ? '?' : M(a * x)));
    const fig = { kind: 'table' as const, head: ['x', ...xs.map(M)], rows: [['y', ...row]] };
    if (blank !== null) {
      return num('m-prop', `表の y は x に比例しています。表の ? に入る数を求めなさい。`, a * xs[blank],
        `比例定数 a = y/x = ${M(a)}（x = 1 のとき y = ${M(a)}）\ny = ${term(a)} に x = ${xs[blank]} を代入して y = ${M(a * xs[blank])}`, { fig });
    }
    return num('m-prop', `表の y は x に比例しています。比例定数を求めなさい。`, a,
      `比例定数 a = y/x = ${M(a * 2)} ÷ 2 = ${M(a)}（どの組でも同じ）`, { fig });
  },
  (r) => {
    const a = pick(r, [12, 24, 18, 6, -12, -6]);
    const xs = [1, 2, 3, 6].filter((x) => a % x === 0);
    const fig = { kind: 'table' as const, head: ['x', ...xs.map(M)], rows: [['y', ...xs.map((x) => M(a / x))]] };
    return num('m-inv', `表の y は x に反比例しています。比例定数を求めなさい。`, a,
      `反比例では xy の値が一定で、それが比例定数。\n1 × (${M(a)}) = ${M(a)}`, { fig });
  },
];

const graph: Gen[] = [
  (r) => {
    const [p, q] = pick(r, [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [1, 2], [-1, 2], [2, 3], [-2, 3], [3, 2], [-3, 2], [1, 3]]);
    const a = p / q;
    return num('m-graph', `図の直線は比例のグラフです。y を x の式で表しなさい。`, ax(frac(p, q)),
      `原点を通る直線なので y = ax。グラフは点 (${q}, ${M(p)}) を通るので a = ${M(p)} ÷ ${q} = ${frac(p, q).replace('-', '−')}\nよって y = ${frac(p, q).replace('-', '−')}x`,
      { prefix: 'y =', fig: { kind: 'graph', lines: [{ type: 'prop', a }], points: [{ x: q, y: p, label: '' }] } });
  },
  (r) => {
    const a = pick(r, [4, 6, 8, 12, -4, -6, -8, -12, 10, -10]);
    const ds = [1, 2, 3, 4, 5, 6].filter((d) => a % d === 0 && Math.abs(a / d) <= 6);
    const x = pick(r, ds);
    return num('m-graph', `図の曲線は反比例のグラフで、点 (${x}, ${M(a / x)}) を通ります。y を x の式で表しなさい。`, `${a}/x`,
      `y = a/x に x = ${x}, y = ${M(a / x)} を代入。a = ${x} × (${M(a / x)}) = ${M(a)}\nよって y = ${M(a)}/x`,
      { prefix: 'y =', fig: { kind: 'graph', lines: [{ type: 'inv', a }], points: [{ x, y: a / x, label: '' }] } });
  },
  (r) => {
    const x = nz(r, -5, 5), y = nz(r, -5, 5);
    const quad = x > 0 ? (y > 0 ? '第1' : '第4') : y > 0 ? '第2' : '第3';
    return {
      id: gid('m-graph'), unit: 'm-graph', type: 'input', kind: 'math',
      q: `図の点Aの座標を答えなさい。（例：(3,−2)）`,
      answers: [`(${x},${y})`, `${x},${y}`],
      explain: `x 座標は横（左右）、y 座標は縦（上下）の目もりを読む。\nA(${M(x)}, ${M(y)})　（${quad}象限にある点）`,
      fig: { kind: 'graph', points: [{ x, y, label: 'A' }] },
    };
  },
  (r) => {
    const a = pick(r, [2, 3, -2, -3, 1, -1]);
    const x = pick(r, [1, 2, 3, -1, -2]);
    return num('m-graph', `比例 y = ${term(a)} のグラフ上にあり、x 座標が ${M(x)} である点の y 座標を求めなさい。`, a * x,
      `y = ${M(a)} × (${M(x)}) = ${M(a * x)}`);
  },
];

const app2: Gen[] = [
  (r) => {
    const w = pick(r, [4, 5, 6, 8]), n2 = pick(r, [150, 200, 250, 300]);
    const g = (w * n2) / 10;
    return num('m-use', `同じ紙 10枚の重さをはかったら ${w * 1}g でした。この紙 ${n2}枚の重さは何g ですか。（重さは枚数に比例する）`, g,
      `1枚の重さは ${w}/10 g。x 枚の重さを y g とすると y = ${w}/10 x\nx = ${n2} のとき y = ${g}`, { suffix: 'g' });
  },
  (r) => {
    const a = pick(r, [24, 36, 30, 40, 48]), b = pick(r, [12, 16, 20, 15, 18, 10, 8, 6].filter((v) => (a * 10) % v === 0 && v !== a));
    const t = (a * 10) / b;
    return num('m-use', `歯の数が ${a} の歯車Aが毎秒10回転している。これにかみ合う歯の数が ${b} の歯車Bは毎秒何回転しますか。`, t,
      `かみ合う歯の数は等しい（${a} × 10 = ${a * 10}）。歯の数 x と回転数 y は反比例し xy = ${a * 10}\ny = ${a * 10} ÷ ${b} = ${t}`, { suffix: '回転' });
  },
  (r) => {
    const s = pick(r, [24, 36, 48, 60]), x = pick(r, [3, 4, 6, 8, 12].filter((v) => s % v === 0));
    return num('m-use', `面積が ${s}cm² の長方形の、縦の長さを x cm、横の長さを y cm とする。x = ${x} のときの y の値を求めなさい。`, s / x,
      `xy = ${s} なので y = ${s}/x（反比例）\nx = ${x} のとき y = ${s / x}`, { suffix: 'cm' });
  },
  (r) => {
    const v = pick(r, [3, 4, 5, 6]), l = pick(r, [60, 90, 120]);
    return num('m-use', `水そうに毎分 ${v}L ずつ水を入れる。x 分間に入る水の量を y L とするとき、y を x の式で表しなさい。`, `${v}x`,
      `1分で ${v}L なので y = ${v}x（比例）。たとえば ${l / v}分で ${l}L 入る。`, { prefix: 'y =' });
  },
];

// ---------- 用語・性質（決まった問題） ----------
let cid = 0;
const ch = (unit: string, q: string, answer: string, wrong: string[], explain: string, fixed = false): ChoiceQ => ({
  id: `${unit}-c${cid++}`, unit, type: 'choice', q, answer, choices: [answer, ...wrong], explain, fixed,
});

const funcQs: ChoiceQ[] = [
  ch('m-func', 'ともなって変わる2つの数量 x, y があり、x の値を決めると y の値がただ1つに決まるとき、y は x の何であるといいますか。', '関数', ['比例定数', '変域', '座標'], 'x の値を決めると y の値がただ1つ決まるとき「y は x の関数である」という。'),
  ch('m-func', '次のうち、y が x の関数であるものはどれですか。', '1辺 x cm の正方形の周の長さ y cm', ['身長 x cm の人の体重 y kg', '年齢 x 才の人の身長 y cm', '周の長さが x cm の長方形の面積 y cm²'], '正方形の周は y = 4x で1つに決まる。体重や身長は人によってちがい、長方形の面積も縦横の長さで変わるので1つに決まらない。'),
  ch('m-func', '変数のとりうる値の範囲を何といいますか。', '変域', ['定義', '比例定数', '原点'], '変数のとりうる値の範囲を「変域」という。不等号を使って表す。'),
  ch('m-func', '「x は 2 以上 5 未満」を不等号で表したものはどれですか。', '2 ≦ x < 5', ['2 < x ≦ 5', '2 < x < 5', '2 ≦ x ≦ 5'], '「以上」「以下」はその数をふくむので ≦、「未満」はふくまないので <。'),
  ch('m-func', '「x は −3 より大きく 4 以下」を不等号で表したものはどれですか。', '−3 < x ≦ 4', ['−3 ≦ x < 4', '−3 ≦ x ≦ 4', '−3 < x < 4'], '「より大きい」はふくまないので <、「以下」はふくむので ≦。'),
  ch('m-func', 'y = ax で表される関係で、a のことを何といいますか。', '比例定数', ['変数', '変域', '座標'], 'y = ax の a を比例定数という。反比例 y = a/x の a も比例定数という。'),
  ch('m-func', '座標平面で、x 軸と y 軸が交わる点を何といいますか。', '原点', ['頂点', '交点O', '中心'], '原点 O の座標は (0, 0)。'),
  ch('m-func', '点 (−2, 5) はどこにありますか。', '第2象限', ['第1象限', '第3象限', '第4象限'], 'x が負、y が正なので左上の第2象限。'),
  ch('m-func', '点 (3, 0) はどこにありますか。', 'x 軸上', ['y 軸上', '原点', '第1象限'], 'y 座標が 0 の点は x 軸上にある。'),
  ch('m-prop', '比例 y = ax のグラフについて正しいものはどれですか。', '原点を通る直線', ['原点を通る曲線', '原点を通らない直線', '双曲線'], '比例のグラフは原点を通る直線。'),
  ch('m-prop', '比例 y = ax で a < 0 のとき、グラフはどうなりますか。', '右下がりの直線', ['右上がりの直線', '横に平行な直線', '双曲線'], 'a > 0 なら右上がり、a < 0 なら右下がり。'),
  ch('m-prop', '比例 y = ax で a > 0 のとき、x の値が増加すると y の値はどうなりますか。', '増加する', ['減少する', '変わらない', '0 になる'], 'a > 0 なら x が増えると y も増える（右上がり）。'),
  ch('m-prop', 'y が x に比例するとき、x の値が 2倍、3倍になると y の値はどうなりますか。', '2倍、3倍になる', ['1/2倍、1/3倍になる', '2増え、3増える', '変わらない'], '比例では x が n 倍になると y も n 倍になる。'),
  ch('m-inv', 'y が x に反比例するとき、x の値が 2倍、3倍になると y の値はどうなりますか。', '1/2倍、1/3倍になる', ['2倍、3倍になる', '2減り、3減る', '変わらない'], '反比例では x が n 倍になると y は 1/n 倍になる。'),
  ch('m-inv', '反比例 y = a/x のグラフを何といいますか。', '双曲線', ['放物線', '直線', '円'], '反比例のグラフは、なめらかな2つの曲線で「双曲線」という。'),
  ch('m-inv', '反比例 y = a/x について、つねに一定になるものはどれですか。', 'x と y の積 xy', ['x と y の和', 'y を x でわった商', 'x と y の差'], '反比例では xy = a（一定）。比例では y/x = a（一定）。'),
  ch('m-inv', '反比例のグラフについて正しいものはどれですか。', 'x 軸や y 軸と交わらない', ['原点を通る', '直線になる', 'y 軸と1点で交わる'], '反比例のグラフは座標軸に近づくが、交わらない。x = 0 のときの y の値はない。'),
  ch('m-inv', 'y = 12/x で、x の値が増加すると（x > 0 の範囲）y の値はどうなりますか。', '減少する', ['増加する', '変わらない', '増加したり減少したりする'], 'a > 0 の反比例では x > 0 の範囲で、x が増加すると y は減少する。'),
  ch('m-inv', '次のうち、y が x に反比例するものはどれですか。', '面積 20cm² の長方形の縦 x cm と横 y cm', ['1個 50円のパン x 個の代金 y 円', '1辺 x cm の正三角形の周の長さ y cm', '分速 80m で x 分歩いた道のり y m'], '縦 × 横 = 20 なので y = 20/x（反比例）。ほかはすべて比例。'),
  ch('m-prop', '次のうち、y が x に比例するものはどれですか。', '分速 70m で x 分歩いた道のり y m', ['1000円で x 円の品物を買ったおつり y 円', '24km の道のりを時速 x km で進んだ時間 y 時間', '面積 30cm² の三角形の底辺 x cm と高さ y cm'], 'y = 70x（比例）。おつりは y = 1000 − x、時間は y = 24/x（反比例）、三角形は y = 60/x（反比例）。'),
  ch('m-eq', '方程式を成り立たせる文字の値を、その方程式の何といいますか。', '解', ['項', '係数', '答え'], '方程式を成り立たせる値を「解」、解を求めることを「方程式を解く」という。'),
  ch('m-eq', '等式の一方の辺にある項を、符号を変えて他方の辺に移すことを何といいますか。', '移項', ['展開', '代入', '約分'], '移項するときは符号を変える。'),
  ch('m-eq', '次のうち、x = 3 が解である方程式はどれですか。', '2x − 1 = 5', ['x + 4 = 1', '3x = 1', '5 − x = 8'], 'x = 3 を代入すると 2 × 3 − 1 = 5 で成り立つ。'),
  ch('m-eq', '方程式 3x = 12 を解くときに使う等式の性質はどれですか。', '両辺を同じ数でわっても等式は成り立つ', ['両辺に同じ数をたしても等式は成り立つ', '両辺から同じ数をひいても等式は成り立つ', '両辺を入れかえても等式は成り立つ'], '両辺を 3 でわって x = 4。'),
  ch('m-ratio', '比例式 a : b = c : d が成り立つとき、いつも成り立つ式はどれですか。', 'ad = bc', ['ac = bd', 'ab = cd', 'a + d = b + c'], '比例式では「外側の積 = 内側の積」（ad = bc）。'),
];

export const math: Subject = {
  id: 'math',
  name: '数学',
  icon: '📐',
  color: '#3a5bd9',
  scope: '教科書 P.98〜156（「方程式」と4章「比例と反比例」すべて）／問題ノート P.64〜99',
  units: [
    { id: 'm-eq', name: '方程式の解き方', questions: funcQs.filter((q) => q.unit === 'm-eq'), gens: eqBasic },
    { id: 'm-eq2', name: 'かっこ・小数・分数の方程式', questions: [], gens: eqParen },
    { id: 'm-ratio', name: '比例式', questions: funcQs.filter((q) => q.unit === 'm-ratio'), gens: eqRatio },
    { id: 'm-app', name: '方程式の利用（文章題）', questions: [], gens: eqApp },
    { id: 'm-func', name: '関数・変域・座標', questions: funcQs.filter((q) => q.unit === 'm-func') },
    { id: 'm-prop', name: '比例', questions: funcQs.filter((q) => q.unit === 'm-prop'), gens: prop.slice(0, 3).concat(prop[5]) },
    { id: 'm-inv', name: '反比例', questions: funcQs.filter((q) => q.unit === 'm-inv'), gens: [prop[3], prop[4], prop[6]] },
    { id: 'm-graph', name: '比例・反比例のグラフ', questions: [], gens: graph },
    { id: 'm-use', name: '比例・反比例の利用', questions: [], gens: app2 },
    { id: 'm-trap', name: '★ひっかけ問題', questions: trapQs.map((q) => ({ ...q, unit: 'm-trap' })) },
    { id: 'm-hard-eq', name: '★難しめ：方程式・比例式', questions: [], gens: inUnit('m-hard-eq', hardEq) },
    { id: 'm-hard-app', name: '★難しめ：方程式の文章題', questions: [], gens: inUnit('m-hard-app', hardApp) },
    { id: 'm-hard-func', name: '★難しめ：比例・反比例', questions: [], gens: inUnit('m-hard-func', hardFunc) },
  ],
  exam: [
    { title: '方程式を解く', units: ['m-eq', 'm-eq2'], count: 7, points: 4 },
    { title: '比例式', units: ['m-ratio'], count: 2, points: 4 },
    { title: '方程式の利用', units: ['m-app', 'm-hard-app'], count: 3, points: 5 },
    { title: '関数・ひっかけ', units: ['m-func', 'm-trap'], count: 3, points: 2 },
    { title: '比例と反比例', units: ['m-prop', 'm-inv', 'm-use'], count: 4, points: 4 },
    { title: 'グラフ', units: ['m-graph'], count: 3, points: 4 },
    { title: '応用（難しめ）', units: ['m-hard-eq', 'm-hard-func'], count: 3, points: 5 },
  ],
};
