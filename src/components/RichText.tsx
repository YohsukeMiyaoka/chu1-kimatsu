import { Fragment } from 'react';

/**
 * 問題文・本文の簡単な書式。
 * __ことば__ → 傍線（――線部）を引いて表示する。テストの「――線部の読みを書きなさい」に合わせるため。
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/__(.+?)__/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} className="bousen">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}
