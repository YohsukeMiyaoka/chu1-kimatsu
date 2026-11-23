import { Fragment, type ReactNode } from 'react';
import { parseMath } from '../logic/mathText';

/**
 * 数学の式の文字を教科書のように表示する：
 *  - マイナスは「−」にそろえる
 *  - 文字（x, y, a）は斜体（単位の m・g・cm などは斜体にしない）
 */
function mathChars(s: string, key: string): ReactNode {
  const t = s.replace(/-/g, '−');
  const parts = t.split(/(?<![A-Za-z])([xya])(?![A-Za-z])/g);
  return parts.map((p, i) => (i % 2 === 1 ? <i key={`${key}-${i}`} className="var">{p}</i> : <Fragment key={`${key}-${i}`}>{p}</Fragment>));
}

/** 数学の文字列：分数を教科書のように上下に分けて表示する */
export function MathText({ text }: { text: string }) {
  return (
    <>
      {parseMath(text).map((seg, i) =>
        seg.t === 'text' ? (
          <Fragment key={i}>{mathChars(seg.s, `t${i}`)}</Fragment>
        ) : (
          <span key={i} className="frac" role="math" aria-label={`${seg.den}分の${seg.num}`}>
            <span className="frac-num">{mathChars(seg.num, `n${i}`)}</span>
            <span className="frac-den">{mathChars(seg.den, `d${i}`)}</span>
          </span>
        ),
      )}
    </>
  );
}

/**
 * 問題文・本文の簡単な書式。
 * __ことば__ → 傍線（――線部）を引いて表示する。テストの「――線部の読みを書きなさい」に合わせるため。
 * math のときは、分数を上下に分けた形で表示する。
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
