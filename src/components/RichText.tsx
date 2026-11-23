import { Fragment, type ReactNode } from 'react';
import { parseMath, splitMathRuns } from '../logic/mathText';

/** 式の中の文字（変数 x, y, a, b）は教科書のように斜体にする。点の名前（A, B, O）や単位（cm, g, m）は斜体にしない */
export const VAR_RE = /(?<![A-Za-z])([abxy])(?![A-Za-z])/g;
function vars(s: string, key: string): ReactNode {
  return s.split(VAR_RE).map((p, i) => (i % 2 === 1 ? <i key={`${key}-${i}`} className="var">{p}</i> : <Fragment key={`${key}-${i}`}>{p}</Fragment>));
}

/**
 * 数学の文字列を表示する。
 *  - 式の部分（英字・数字・記号のまとまり）は、すべて同じ書体（.math）で表示し、文字（変数）だけ斜体にする
 *  - 分数は教科書のように上下に分ける
 *  - マイナスは「−」にそろえる
 */
export function MathText({ text }: { text: string }) {
  return (
    <>
      {splitMathRuns(text.replace(/-/g, '−')).map((run, i) =>
        run.math ? (
          <span key={i} className="math">
            {parseMath(run.s).map((seg, j) =>
              seg.t === 'text' ? (
                <Fragment key={j}>{vars(seg.s, `t${i}-${j}`)}</Fragment>
              ) : (
                <span key={j} className="frac" role="math" aria-label={`${seg.den}分の${seg.num}`}>
                  <span className="frac-num">{vars(seg.num, `n${i}-${j}`)}</span>
                  <span className="frac-den">{vars(seg.den, `d${i}-${j}`)}</span>
                </span>
              ),
            )}
          </span>
        ) : (
          <Fragment key={i}>{run.s}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * 問題文・本文の簡単な書式。
 * __ことば__ → 傍線（――線部）を引いて表示する。テストの「――線部の読みを書きなさい」に合わせるため。
 * math のときは、式を同じ書体にし、分数を上下に分けた形で表示する。
 */
export function RichText({ text, math = false }: { text: string; math?: boolean }) {
  const parts = text.split(/__(.+?)__/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bousen">{p}</span>
        ) : math ? (
          <MathText key={i} text={p} />
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
