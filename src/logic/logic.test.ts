import { describe, expect, it } from 'vitest';
import { SUBJECTS } from '../data';
import type { InputQ, OrderQ } from '../types';
import { buildExam, examMax } from './exam';
import { checkInput, checkOrder, mathEqual, normEn, normJa, parseNumber } from './grade';
import { seededRng } from './random';

describe('採点', () => {
  it('数の比較（分数・小数・マイナス記号）', () => {
    expect(parseNumber('-3/2')).toBe(-1.5);
    expect(mathEqual('−1.5', '-3/2')).toBe(true);
    expect(mathEqual('x=5', '5')).toBe(true);
    expect(mathEqual('５', '5')).toBe(true);
    expect(mathEqual('4', '5')).toBe(false);
    expect(mathEqual('', '0')).toBe(false);
  });
  it('式の比較（y=ax, y=a/x）', () => {
    expect(mathEqual('y=3x', '3x')).toBe(true);
    expect(mathEqual('-x', '-1x')).toBe(true);
    expect(mathEqual('2/3x', '(2/3)x')).toBe(true);
    expect(mathEqual('-12/x', 'y=-12/x')).toBe(true);
    expect(mathEqual('12/x', '-12/x')).toBe(false);
    expect(mathEqual('3x', '-3x')).toBe(false);
    expect(mathEqual('(3,-2)', '(3,-2)')).toBe(true);
  });
  it('英語は大文字小文字・文末記号・アポストロフィを気にしない', () => {
    expect(normEn("I can’t swim.")).toBe(normEn("i can't swim"));
    expect(normEn('  Do you  like dogs ? ')).toBe(normEn('Do you like dogs'));
  });
  it('日本語はカタカナ・ひらがな・空白を気にしない', () => {
    expect(normJa('ヨウシツ')).toBe(normJa('ようしつ'));
    expect(normJa(' 溶質 。')).toBe('溶質');
  });
  it('漢字の書き取りはひらがなでは正解にしない', () => {
    const q: InputQ = { id: 'x', unit: 'u', type: 'input', kind: 'ja', q: '', answers: ['歓迎'], explain: '' };
    expect(checkInput(q, '歓迎')).toBe(true);
    expect(checkInput(q, 'かんげい')).toBe(false);
  });
  it('並べかえは別解も正解', () => {
    const q: OrderQ = { id: 'o', unit: 'u', type: 'order', q: '', tokens: ['a', 'b', 'c'], alts: [['b', 'a', 'c']], join: ' ', explain: '' };
    expect(checkOrder(q, ['a', 'b', 'c'])).toBe(true);
    expect(checkOrder(q, ['b', 'a', 'c'])).toBe(true);
    expect(checkOrder(q, ['c', 'a', 'b'])).toBe(false);
  });
});

describe('問題データ', () => {
  for (const s of SUBJECTS) {
    describe(s.name, () => {
      it('本番の配点合計が100点', () => expect(examMax(s)).toBe(100));

      it('大問の単元が実在し、問題数が足りる（作る問題がない単元は決まった問題の数）', () => {
        for (const sec of s.exam) {
          const units = s.units.filter((u) => sec.units.includes(u.id));
          expect(units.length, sec.title).toBe(sec.units.length);
          const fixed = units.reduce((a, u) => a + u.questions.length, 0);
          const gens = units.some((u) => (u.gens ?? []).length > 0);
          if (!gens) expect(fixed, sec.title).toBeGreaterThanOrEqual(sec.count);
        }
      });

      it('IDの重複がない・正解が選択肢にある・本文が実在する・単元が合っている', () => {
        const ids = new Set<string>();
        for (const u of s.units) {
          for (const q of u.questions) {
            expect(ids.has(q.id), q.id).toBe(false);
            ids.add(q.id);
            expect(q.unit, q.id).toBe(u.id);
            if (q.type === 'choice') {
              expect(q.choices, q.id).toContain(q.answer);
              expect(new Set(q.choices).size, q.id).toBe(q.choices.length);
            }
            if (q.type === 'input') expect(checkInput(q, q.answers[0]), q.id).toBe(true);
            if (q.passage) expect(s.passages?.[q.passage], q.id).toBeTruthy();
            expect(q.explain.length, q.id).toBeGreaterThan(0);
          }
        }
      });

      it('作る問題（数学・理科の計算）が正しい形で作られる', () => {
        const rng = seededRng(42);
        for (const u of s.units) {
          for (const g of u.gens ?? []) {
            for (let i = 0; i < 300; i++) {
              const q = g(rng);
              const text = q.q + q.explain + JSON.stringify(q);
              expect(text, q.q).not.toMatch(/NaN|undefined|Infinity|null/);
              expect(q.unit).toBe(u.id);
              if (q.type === 'input') {
                expect(checkInput(q, q.answers[0]), q.q).toBe(true);
                if (q.kind === 'math') {
                  const n = parseNumber(q.answers[0]);
                  // 数の答えは小数第1位まで（中1で扱う範囲）
                  if (n !== null) expect(Math.abs(n * 10 - Math.round(n * 10)), q.q).toBeLessThan(1e-9);
                }
              }
            }
          }
        }
      });

      it('本番テストを何回作っても大問どおりの問題数になる', () => {
        for (let seed = 1; seed <= 30; seed++) {
          const items = buildExam(s, seededRng(seed));
          expect(items.length).toBe(s.exam.reduce((a, x) => a + x.count, 0));
          const ids = items.map((i) => i.question.id + i.question.q);
          expect(new Set(ids).size).toBe(ids.length);
        }
      });
    });
  }
});

describe('保存', () => {
  it('答えるたびに単元の正答率とまちがいノートに反映される', async () => {
    const { applyAnswers } = await import('./storage');
    const q: InputQ = { id: 'q1', unit: 'u1', type: 'input', kind: 'ja', q: '問', answers: ['a'], explain: '' };
    const base = { users: [], results: [], settings: { timeLimitMin: 50, sound: true }, currentUserId: null, unitStats: {}, mistakes: {}, sessions: {} };
    let d = applyAnswers(base, 'me', 'japanese', [{ question: q, given: 'b', score: 0 }]);
    expect(d.unitStats.me['japanese:u1']).toEqual({ ok: 0, total: 1 });
    expect(Object.keys(d.mistakes.me)).toHaveLength(1);
    d = applyAnswers(d, 'me', 'japanese', [{ question: q, given: 'a', score: 1 }]);
    expect(d.unitStats.me['japanese:u1']).toEqual({ ok: 1, total: 2 });
    expect(Object.keys(d.mistakes.me)).toHaveLength(0);
  });
});

describe('国語の問題文', () => {
  it('「――線部」の問題には傍線（__語__）があり、【】は使わない', () => {
    const ja = SUBJECTS.find((s) => s.id === 'japanese')!;
    for (const u of ja.units) {
      for (const q of u.questions) {
        expect(q.q, q.id).not.toContain('【');
        if (q.q.includes('――線部')) expect(q.q, q.id).toMatch(/__.+__/);
      }
    }
  });
});
