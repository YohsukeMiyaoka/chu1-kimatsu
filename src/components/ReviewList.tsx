import type { AnswerRecord } from '../types';
import { answerText } from '../logic/grade';
import { FigureView } from './FigureView';
import { RichText } from './RichText';

/** まちがえた問題のふりかえり（正解・自分の答え・解説） */
export function ReviewList({ recs }: { recs: AnswerRecord[] }) {
  if (!recs.length) return <p className="note">まちがえた問題はありません。すばらしい！</p>;
  return (
    <ul className="review-list">
      {recs.map((r, i) => (
        <li key={i} className="review-item">
          <p className="prompt-sm"><RichText text={r.question.q} /></p>
          {r.question.fig && <div className="review-fig"><FigureView fig={r.question.fig} /></div>}
          <dl className="review-answers">
            <div className="ng"><dt>自分の答え</dt><dd>{r.given || '（なし）'}</dd></div>
            <div className="ok"><dt>正解</dt><dd>{answerText(r.question)}</dd></div>
          </dl>
          <p className="explanation">{r.question.explain}</p>
        </li>
      ))}
    </ul>
  );
}
