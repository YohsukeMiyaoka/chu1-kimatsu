import type { Subject, SubjectId } from '../types';
import { english } from './english';
import { japanese } from './japanese';
import { math } from './math';
import { science } from './science';
import { social } from './social';

/** 試験の日程順（11/25：国語・英語・理科、11/26：社会・数学） */
export const SUBJECTS: Subject[] = [japanese, english, science, social, math];

export const subjectById = (id: SubjectId | string): Subject => {
  const s = SUBJECTS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown subject ${id}`);
  return s;
};
