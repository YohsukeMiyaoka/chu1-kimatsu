import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChoiceQ, InputQ, OrderQ, SelfQ } from '../types';
import { shuffle } from '../logic/random';
import { MathText } from './RichText';

/** 選択式 */
export function ChoiceArea({ q, picked, done, onPick }: { q: ChoiceQ; picked: string | null; done: boolean; onPick: (c: string) => void }) {
  const long = q.choices.some((c) => c.length > 12);
  return (
    <div className={`choices ${long ? 'long' : ''}`}>
      {q.choices.map((c, i) => {
        let cls = 'choice';
        if (done) {
          if (c === q.answer) cls += ' is-correct';
          else if (c === picked) cls += ' is-wrong';
          else cls += ' is-dim';
        } else if (c === picked) cls += ' is-picked';
        return (
          <button key={c} className={cls} disabled={done} onClick={() => onPick(c)}>
            <span className="choice-mark">{'アイウエオ'[i]}</span>
            <span>{q.unit.startsWith('m-') ? <MathText text={c} /> : c}</span>
          </button>
        );
      })}
    </div>
  );
}

const PAD = ['7', '8', '9', 'x', '4', '5', '6', 'y', '1', '2', '3', '/', '0', '.', '-', ',', '(', ')', '=', 'a'];

/** 数式キーパッド（iPad のキーボードを出さない） */
export function MathInput({ q, value, onChange, onSubmit, done, result }: { q: InputQ; value: string; onChange: (v: string) => void; onSubmit: () => void; done: boolean; result: boolean | null }) {
  const show = (v: string) => v.replace(/-/g, '−');
  return (
    <div className="math-input">
      <div className={`answer-box ${result === true ? 'is-correct' : result === false ? 'is-wrong' : ''}`}>
        {q.prefix && <span className="affix"><MathText text={q.prefix} /></span>}
        <span className="answer-text">{value ? <MathText text={show(value)} /> : <span className="placeholder">キーで入力</span>}</span>
        {q.suffix && <span className="affix">{q.suffix}</span>}
      </div>
      {!done && (
        <div className="math-pad">
          {PAD.map((k) => (
            <button key={k} className={`key ${/\d/.test(k) ? '' : 'func'}`} onClick={() => onChange(value + k)}>
              {k === '-' ? '−' : k === '/' ? '分数 /' : /^[xya]$/.test(k) ? <i className="var">{k}</i> : k}
            </button>
          ))}
          <button className="key delete" onClick={() => onChange(value.slice(0, -1))}>⌫ 1字消す</button>
          <button className="key delete" onClick={() => onChange('')}>全部消す</button>
          <button className="key submit" disabled={!value} onClick={onSubmit}>決定</button>
        </div>
      )}
    </div>
  );
}

/** 文字の入力（英語・日本語）。iPad のキーボード（手書き・音声入力も可） */
export function TextInput({ q, value, onChange, onSubmit, done, result }: { q: InputQ; value: string; onChange: (v: string) => void; onSubmit: () => void; done: boolean; result: boolean | null }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!done) ref.current?.focus({ preventScroll: true });
  }, [q.id, done]);
  return (
    <div className="text-input">
      <div className={`answer-box ${result === true ? 'is-correct' : result === false ? 'is-wrong' : ''}`}>
        {q.prefix && <span className="affix">{q.prefix}</span>}
        <input
          ref={ref}
          className="answer-input"
          value={value}
          disabled={done}
          lang={q.kind === 'en' ? 'en' : 'ja'}
          inputMode="text"
          autoCapitalize={q.kind === 'en' ? 'sentences' : 'off'}
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          placeholder={q.kind === 'en' ? '英語で入力' : 'ここに入力'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // 漢字変換を確定する Enter では送信しない
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && value.trim()) onSubmit();
          }}
        />
        {q.suffix && <span className="affix">{q.suffix}</span>}
      </div>
      {!done && (
        <button className="btn primary" disabled={!value.trim()} onClick={onSubmit}>決定</button>
      )}
    </div>
  );
}

/** 並べかえ。カードをタップして順に並べる（同じ語が2回出ても区別できるよう番号で持つ） */
export function OrderArea({ q, done, onSubmit, result, initial }: { q: OrderQ; done: boolean; onSubmit: (tokens: string[]) => void; result: boolean | null; initial?: string[] }) {
  const cards = useMemo(() => {
    let s = shuffle(q.tokens.map((t, i) => ({ t, i })));
    // 最初から正しい順にならないようにする
    if (s.every((c, k) => c.i === k) && s.length > 1) s = [...s.slice(1), s[0]];
    return s;
  }, [q]);
  /** 前の答え（カードの文字の並び）をカードの番号にもどす */
  const restore = (): number[] => {
    if (!initial) return [];
    const used = new Set<number>();
    const out: number[] = [];
    for (const t of initial) {
      const ci = cards.findIndex((c, i) => c.t === t && !used.has(i));
      if (ci < 0) return [];
      used.add(ci);
      out.push(ci);
    }
    return out;
  };
  const [chosen, setChosen] = useState<number[]>(restore);
  useEffect(() => setChosen(restore()), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const vertical = q.join === '\n';
  return (
    <div className="order-area">
      <div className={`order-answer ${vertical ? 'vertical' : ''} ${result === true ? 'is-correct' : result === false ? 'is-wrong' : ''}`}>
        {chosen.length === 0 && <span className="placeholder">下のカードを順番にタップ</span>}
        {chosen.map((ci, k) => (
          <button key={ci} className="card placed" disabled={done} onClick={() => setChosen(chosen.filter((x) => x !== ci))}>
            {vertical && <span className="card-no">{k + 1}</span>}
            {cards[ci].t}
          </button>
        ))}
      </div>
      {!done && (
        <>
          <div className={`order-pool ${vertical ? 'vertical' : ''}`}>
            {cards.map((c, ci) =>
              chosen.includes(ci) ? (
                <span key={ci} className="card ghost">{c.t}</span>
              ) : (
                <button key={ci} className="card" onClick={() => setChosen([...chosen, ci])}>{c.t}</button>
              ),
            )}
          </div>
          <div className="row">
            <button className="btn small" disabled={!chosen.length} onClick={() => setChosen([])}>やり直す</button>
            <button className="btn primary" disabled={chosen.length !== cards.length} onClick={() => onSubmit(chosen.map((ci) => cards[ci].t))}>決定</button>
          </div>
        </>
      )}
    </div>
  );
}

/** 記述：自分で書いてから模範解答を見て、○△×を自分で付ける */
export function SelfArea({ q, onMark, done }: { q: SelfQ; onMark: (score: number, text: string) => void; done: boolean }) {
  const [text, setText] = useState('');
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setText('');
    setShown(false);
  }, [q]);
  return (
    <div className="self-area">
      <textarea
        className="self-text"
        value={text}
        disabled={shown}
        placeholder="答えを書いてみよう（ノートに書いてもOK）"
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      {!shown ? (
        <button className="btn primary" onClick={() => setShown(true)}>模範解答を見る</button>
      ) : (
        <div className="model">
          <p className="model-title">模範解答</p>
          <p className="model-text">{q.model}</p>
          {q.points && (
            <ul className="model-points">
              {q.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
          {!done && (
            <>
              <p className="model-title">自分の答えを採点しよう</p>
              <div className="row">
                <button className="btn mark ok" onClick={() => onMark(1, text)}>○ できた</button>
                <button className="btn mark half" onClick={() => onMark(0.5, text)}>△ 半分</button>
                <button className="btn mark ng" onClick={() => onMark(0, text)}>× だめ</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
