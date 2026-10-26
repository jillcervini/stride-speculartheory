import { DATE_RANGES } from '../data/config.js';
import { ALL_RUNS, formatDate, typeNoun, weeksInRange } from '../lib/metrics.js';
import { RunTypeMark } from './RunTypeMark.jsx';

/**
 * Expected data state in the training-pattern sheet (e.g. Tempo + Last 2 weeks).
 * Calm, not an error: a faint outline of the empty weeks keeps it feeling like the
 * calendar, the copy says what happened and what to do, and the main action widens
 * the date range while keeping the selected run type, so the runs appear right away.
 */
export default function EmptyState({ type, range, onRecover }) {
  const current = DATE_RANGES.find((r) => r.id === range);
  const wider = DATE_RANGES[DATE_RANGES.indexOf(current) - 1]; // ordered widest → narrowest
  const noun = typeNoun(type);
  const single = noun.replace(/s$/, '');
  const last = [...ALL_RUNS].reverse().find((r) => type === 'all' || r.type === type);
  const weeks = weeksInRange(range);

  return (
    <div className="empty" role="status" aria-labelledby="empty-title">
      <div className="empty__ghost" aria-hidden="true">
        {weeks.map((wk) => (
          <div key={wk} className="empty__ghost-col">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} />
            ))}
            <p>Wk {wk}</p>
          </div>
        ))}
        <span className="empty__badge">
          <RunTypeMark type={type} size="lg" />
        </span>
      </div>

      <h3 className="empty__title" id="empty-title">
        No {noun} in the {current.label.toLowerCase()}
      </h3>
      <p className="empty__body">
        There aren't any {noun} to show for this period.
        {last && ` Your most recent ${single} was on ${formatDate(last.date)}, in week ${last.week}.`}
      </p>

      <div className="empty__actions">
        {wider && (
          <button type="button" className="btn is-primary" onClick={() => onRecover({ range: wider.id })}>
            Show {wider.label.toLowerCase()}
            <span aria-hidden="true">→</span>
          </button>
        )}
        {type !== 'all' && (
          <button type="button" className="text-link" onClick={() => onRecover({ type: 'all' })}>
            or view all run types
          </button>
        )}
      </div>
    </div>
  );
}
