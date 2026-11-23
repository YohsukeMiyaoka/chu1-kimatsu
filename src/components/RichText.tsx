import { Fragment } from 'react';
import { parseMath, splitMathRuns } from '../logic/mathText';

/**
 * 数学の文字列を表示する。
 *  - 式の部分（英字・数字・記号のまとまり）は、文字・数字・記号をすべて同じ書体（.math）で表示する
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
                <Fragment key={j}>{seg.s}</Fragment>
              ) : (
                <span key={j} className="frac" role="math" aria-label={`${seg.den}分の${seg.num}`}>
                  <span className="frac-num">{seg.num}</span>
                  <span className="frac-den">{seg.den}</span>
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
