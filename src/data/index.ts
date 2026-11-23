import type { Question, Subject, SubjectId } from '../types';
import { english } from './english';
import { japanese } from './japanese';
import { math } from './math';
import { moreEnglish } from './moreEnglish';
import { moreJapanese } from './moreJapanese';
import { moreScience } from './moreScience';
import { moreSocial } from './moreSocial';
import { science } from './science';
import { social } from './social';

/** 追加問題を、同じIDの単元に合流させる */
function withMore(s: Subject, more: { units: Record<string, Question[]>; passages?: Subject['passages'] }): Subject {
  for (const id of Object.keys(more.units)) {
    if (!s.units.some((u) => u.id === id)) throw new Error(`${s.name}: 単元 ${id} がない`);
  }
  return {
    ...s,
    passages: { ...s.passages, ...more.passages },
    units: s.units.map((u) => ({ ...u, questions: [...u.questions, ...(more.units[u.id] ?? [])] })),
  };
}

/** 試験の日程順（11/25：国語・英語・理科、11/26：社会・数学） */
export const SUBJECTS: Subject[] = [
  withMore(japanese, moreJapanese),
  withMore(english, moreEnglish),
  withMore(science, moreScience),
  withMore(social, moreSocial),
  math,
];

export const subjectById = (id: SubjectId | string): Subject => {
  const s = SUBJECTS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown subject ${id}`);
  return s;
};
