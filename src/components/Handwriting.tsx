import { useEffect, useRef, useState } from 'react';
import type { WriteQ } from '../types';

/**
 * 漢字の書き取り。マス目に指（Apple Pencil）で書き、「答え合わせ」で正しい字を横に出して、自分で○×を付ける。
 * iPad のキーボードだと変換で漢字が出てしまい、書けるかどうかを確かめられないため。
 */
export function HandwritingArea({ q, done, onMark }: { q: WriteQ; done: boolean; onMark: (score: number) => void }) {
  const chars = [...q.answer];
  const BOX = 150;
  const W = BOX * chars.length;
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [inked, setInked] = useState(false);
  const [shown, setShown] = useState(false);

  const ctx = () => canvas.current?.getContext('2d') ?? null;

  const clear = () => {
    const c = canvas.current;
    const g = ctx();
    if (!c || !g) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    const r = c.width / W;
    g.setTransform(r, 0, 0, r, 0, 0);
    // マス目（十字の点線つき）
    g.strokeStyle = '#c9d3e3';
    g.lineWidth = 2;
    g.setLineDash([]);
    for (let i = 0; i < chars.length; i++) g.strokeRect(i * BOX + 1, 1, BOX - 2, BOX - 2);
    g.setLineDash([6, 6]);
    g.lineWidth = 1;
    for (let i = 0; i < chars.length; i++) {
      g.beginPath();
      g.moveTo(i * BOX + BOX / 2, 0);
      g.lineTo(i * BOX + BOX / 2, BOX);
      g.moveTo(i * BOX, BOX / 2);
      g.lineTo(i * BOX + BOX, BOX / 2);
      g.stroke();
    }
    g.setLineDash([]);
    setInked(false);
  };

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    c.width = W * dpr;
    c.height = BOX * dpr;
    clear();
    setShown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, q.answer]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * BOX };
  };
  const down = (e: React.PointerEvent) => {
    if (shown) return;
    e.preventDefault();
    canvas.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    const g = ctx();
    if (g) {
      g.fillStyle = '#1d2a3a';
      g.beginPath();
      g.arc(last.current.x, last.current.y, 3, 0, Math.PI * 2);
      g.fill();
    }
    setInked(true);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || shown) return;
    e.preventDefault();
    const p = pos(e);
    const g = ctx();
    if (g && last.current) {
      g.strokeStyle = '#1d2a3a';
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(last.current.x, last.current.y);
      g.lineTo(p.x, p.y);
      g.stroke();
    }
    last.current = p;
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  return (
    <div className="hw-area">
      <p className="hw-hint">マスの中に指で書こう（{chars.length}字）</p>
      <div className="hw-row">
        <canvas
          ref={canvas}
          className="hw-canvas"
          style={{ aspectRatio: `${chars.length} / 1`, width: `min(100%, ${chars.length * 190}px)` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
        {shown && (
          <div className="hw-answer" aria-label="正しい字">
            {chars.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>
      {!shown ? (
        <div className="row">
          <button className="btn small" onClick={clear} disabled={!inked}>書き直す</button>
          <button className="btn primary" onClick={() => setShown(true)} disabled={!inked}>答え合わせ</button>
        </div>
      ) : (
        !done && (
          <>
            <p className="model-title">正しい字とくらべて、自分で採点しよう（とめ・はね・はらいも見てね）</p>
            <div className="row">
              <button className="btn mark ok" onClick={() => onMark(1)}>○ 書けた</button>
              <button className="btn mark ng" onClick={() => onMark(0)}>× まちがえた</button>
            </div>
          </>
        )
      )}
    </div>
  );
}
