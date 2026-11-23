import type { AnswerRecord } from '../types';
import { answerText } from '../logic/grade';
import { FigureView } from './FigureView';
import { RichText } from './RichText';

const isMath = (r: AnswerRecord) => r.question.unit.startsWith('m-');

/** まちがえた問題のふりかえり（正解・自分の答え・解説） */
export function ReviewList({ recs }: { recs: AnswerRecord[] }) {
  if (!recs.length) return <p className="note">まちがえた問題はありません。すばらしい！</p>;
  return (
    <ul className="review-list">
      {recs.map((r, i) => (
        <li key={i} className="review-item">
          <p className="prompt-sm"><RichText text={r.question.q} math={isMath(r)} /></p>
          {r.question.fig && <div className="review-fig"><FigureView fig={r.question.fig} /></div>}
          <dl className="review-answers">
            <div className="ng"><dt>自分の答え</dt><dd><RichText text={r.given || '（なし）'} math={isMath(r)} /></dd></div>
            <div className="ok"><dt>正解</dt><dd><RichText text={answerText(r.question)} math={isMath(r)} /></dd></div>
          </dl>
          <p className="explanation"><RichText text={r.question.explain} math={isMath(r)} /></p>
        </li>
      ))}
    </ul>
  );
}
