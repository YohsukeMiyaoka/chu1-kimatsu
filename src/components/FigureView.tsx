import type { Figure } from '../types';
import { SOLUB, SOLUB_TEMPS } from '../data/solubility';

const INK = 'currentColor';

/** 座標平面（比例・反比例のグラフ、点） */
function Graph({ fig }: { fig: Extract<Figure, { kind: 'graph' }> }) {
  const R = fig.range ?? 6;
  const S = 320;
  const u = S / (2 * R + 3); // 1目もりの長さ（軸の矢印と文字の分だけ余白をとる）
  const X = (x: number) => S / 2 + x * u;
  const Y = (y: number) => S / 2 - y * u;
  const grid = [];
  for (let i = -R; i <= R; i++) {
    grid.push(<line key={`v${i}`} x1={X(i)} y1={Y(-R)} x2={X(i)} y2={Y(R)} className="fig-grid" />);
    grid.push(<line key={`h${i}`} x1={X(-R)} y1={Y(i)} x2={X(R)} y2={Y(i)} className="fig-grid" />);
  }
  const ticks = [];
  for (let i = -R; i <= R; i++) {
    if (i === 0 || i % 2 !== 0) continue;
    ticks.push(<text key={`tx${i}`} x={X(i)} y={Y(0) + 14} textAnchor="middle" className="fig-tick">{i}</text>);
    ticks.push(<text key={`ty${i}`} x={X(0) - 6} y={Y(i) + 4} textAnchor="end" className="fig-tick">{i}</text>);
  }
  const paths = (fig.lines ?? []).map((l, k) => {
    if (l.type === 'prop') {
      // 枠の中におさまる範囲だけ描く
      const xMax = Math.min(R, Math.abs(l.a) > 1 ? R / Math.abs(l.a) : R);
      return <line key={k} x1={X(-xMax)} y1={Y(-xMax * l.a)} x2={X(xMax)} y2={Y(xMax * l.a)} className="fig-line" />;
    }
    const seg = (sign: number) => {
      const pts: string[] = [];
      for (let t = 0.05; t <= R + 1e-9; t += 0.05) {
        const x = sign * t;
        const y = l.a / x;
        if (Math.abs(y) <= R) pts.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
      }
      return pts.join(' ');
    };
    return (
      <g key={k}>
        <polyline points={seg(1)} className="fig-line" />
        <polyline points={seg(-1)} className="fig-line" />
      </g>
    );
  });
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="figure graph" role="img" aria-label="座標平面のグラフ">
      {grid}
      <line x1={X(-R - 0.6)} y1={Y(0)} x2={X(R + 0.6)} y2={Y(0)} className="fig-axis" markerEnd="url(#arr)" />
      <line x1={X(0)} y1={Y(-R - 0.6)} x2={X(0)} y2={Y(R + 0.6)} className="fig-axis" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={INK} />
        </marker>
      </defs>
      <text x={X(R + 0.7)} y={Y(0) - 6} className="fig-label">x</text>
      <text x={X(0) + 6} y={Y(R + 0.5)} className="fig-label">y</text>
      <text x={X(0) - 6} y={Y(0) + 14} textAnchor="end" className="fig-label">O</text>
      {ticks}
      {paths}
      {(fig.points ?? []).map((p, k) => (
        <g key={`p${k}`}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={4.5} className="fig-dot" />
          {p.label && <text x={X(p.x) + 7} y={Y(p.y) - 7} className="fig-label strong">{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

/** 気体の集め方（ア・イ・ウ） */
function Collect() {
  return (
    <svg viewBox="0 0 420 190" className="figure wide" role="img" aria-label="気体の集め方の図">
      {/* ア：水上置換法 */}
      <g>
        <text x="60" y="20" textAnchor="middle" className="fig-label strong">ア</text>
        <rect x="15" y="110" width="95" height="60" className="fig-water" />
        <rect x="15" y="100" width="95" height="70" className="fig-box" />
        <rect x="50" y="60" width="22" height="80" rx="10" className="fig-tube" />
        <rect x="50" y="110" width="22" height="30" className="fig-water" />
        <polyline points="0,150 61,150 61,128" className="fig-pipe" />
      </g>
      {/* イ：上方置換法 */}
      <g transform="translate(150,0)">
        <text x="55" y="20" textAnchor="middle" className="fig-label strong">イ</text>
        <rect x="44" y="35" width="22" height="90" rx="10" className="fig-tube" transform="rotate(180 55 80)" />
        <polyline points="0,170 55,170 55,50" className="fig-pipe" />
        <text x="55" y="160" textAnchor="middle" className="fig-tick">口が下</text>
      </g>
      {/* ウ：下方置換法 */}
      <g transform="translate(290,0)">
        <text x="55" y="20" textAnchor="middle" className="fig-label strong">ウ</text>
        <rect x="44" y="70" width="22" height="90" rx="10" className="fig-tube" />
        <polyline points="0,40 55,40 55,150" className="fig-pipe" />
        <text x="55" y="185" textAnchor="middle" className="fig-tick">口が上</text>
      </g>
    </svg>
  );
}

/** 純物質を加熱したときの温度変化 */
function Heat() {
  return (
    <svg viewBox="0 0 320 220" className="figure" role="img" aria-label="加熱したときの温度変化のグラフ">
      <line x1="40" y1="190" x2="310" y2="190" className="fig-axis" />
      <line x1="40" y1="190" x2="40" y2="15" className="fig-axis" />
      <text x="300" y="210" textAnchor="end" className="fig-tick">加熱時間</text>
      <text x="46" y="20" className="fig-tick">温度</text>
      <polyline points="40,175 100,120 190,120 270,60 305,60" className="fig-line" />
      <line x1="40" y1="120" x2="100" y2="120" className="fig-dash" />
      <text x="34" y="124" textAnchor="end" className="fig-tick">63℃</text>
      <text x="145" y="112" textAnchor="middle" className="fig-tick">温度が一定</text>
    </svg>
  );
}

/** ガスバーナー */
function Burner() {
  return (
    <svg viewBox="0 0 220 240" className="figure" role="img" aria-label="ガスバーナーの図">
      <rect x="95" y="20" width="30" height="110" className="fig-box" />
      <rect x="85" y="70" width="50" height="16" rx="4" className="fig-screw" />
      <rect x="80" y="120" width="60" height="18" rx="4" className="fig-screw" />
      <path d="M70,138 L150,138 L165,200 L55,200 z" className="fig-box" />
      <rect x="40" y="200" width="140" height="14" className="fig-box" />
      <line x1="135" y1="78" x2="185" y2="60" className="fig-pipe" />
      <text x="188" y="58" className="fig-label strong">A</text>
      <line x1="140" y1="129" x2="185" y2="140" className="fig-pipe" />
      <text x="188" y="146" className="fig-label strong">B</text>
      <polyline points="0,190 55,190" className="fig-pipe" />
      <text x="4" y="182" className="fig-tick">ガス</text>
    </svg>
  );
}

/** 表 */
function Table({ fig }: { fig: Extract<Figure, { kind: 'table' }> }) {
  return (
    <table className="fig-table">
      {fig.caption && <caption>{fig.caption}</caption>}
      <thead>
        <tr>{fig.head.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {fig.rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (fig.rowHead !== false && j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const SOLUB_COLORS: Record<string, string> = { 硝酸カリウム: '#d6336c', ミョウバン: '#3a5bd9', 塩化ナトリウム: '#1f9d6b' };

/** 溶解度の表と溶解度曲線 */
function Solubility() {
  const W = 340, H = 250, L = 44, B = 210, T = 14, R = 300;
  const X = (t: number) => L + (t / 60) * (R - L);
  const Y = (g: number) => B - (g / 120) * (B - T);
  return (
    <div className="fig-stack">
      <Table
        fig={{
          kind: 'table',
          caption: '溶解度（水100g にとける質量〔g〕）',
          head: ['物質＼水の温度', ...SOLUB_TEMPS.map((t) => `${t}℃`)],
          rows: Object.entries(SOLUB).map(([k, v]) => [k, ...SOLUB_TEMPS.map((t) => v[t])]),
        }}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="figure" role="img" aria-label="溶解度曲線">
        {[0, 20, 40, 60, 80, 100, 120].map((g) => (
          <g key={g}>
            <line x1={L} y1={Y(g)} x2={R} y2={Y(g)} className="fig-grid" />
            <text x={L - 6} y={Y(g) + 4} textAnchor="end" className="fig-tick">{g}</text>
          </g>
        ))}
        {SOLUB_TEMPS.map((t) => (
          <g key={t}>
            <line x1={X(t)} y1={T} x2={X(t)} y2={B} className="fig-grid" />
            <text x={X(t)} y={B + 16} textAnchor="middle" className="fig-tick">{t}</text>
          </g>
        ))}
        <line x1={L} y1={B} x2={R} y2={B} className="fig-axis" />
        <line x1={L} y1={B} x2={L} y2={T} className="fig-axis" />
        <text x={R} y={B + 32} textAnchor="end" className="fig-tick">水の温度〔℃〕</text>
        <text x={L + 6} y={T + 10} className="fig-tick">〔g〕</text>
        {Object.entries(SOLUB).map(([k, v]) => (
          <g key={k}>
            <polyline points={SOLUB_TEMPS.map((t) => `${X(t)},${Y(v[t])}`).join(' ')} fill="none" stroke={SOLUB_COLORS[k]} strokeWidth={2.6} />
            {SOLUB_TEMPS.map((t) => <circle key={t} cx={X(t)} cy={Y(v[t])} r={3} fill={SOLUB_COLORS[k]} />)}
            <text x={X(60) - 4} y={Y(v[60]) - 8} textAnchor="end" className="fig-tick" fill={SOLUB_COLORS[k]} style={{ fill: SOLUB_COLORS[k], fontWeight: 700 }}>{k}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function FigureView({ fig }: { fig: Figure }) {
  if (fig.kind === 'graph') return <Graph fig={fig} />;
  if (fig.kind === 'table') return <Table fig={fig} />;
  switch (fig.id) {
    case 'collect':
      return <Collect />;
    case 'heat':
      return <Heat />;
    case 'burner':
      return <Burner />;
    case 'solubility':
      return <Solubility />;
    default:
      return null;
  }
}
