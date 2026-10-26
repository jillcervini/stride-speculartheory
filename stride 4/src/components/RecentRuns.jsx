import { useState } from 'react';
import { RECENT_RUNS_LIMIT } from '../data/config.js';
import { formatDate, formatMiles, formatPace, formatWeekday, recoveryFlags, typeLabel } from '../lib/metrics.js';
import { RunTypeMark } from './RunTypeMark.jsx';

/** Compact list, newest first. Each row is a button that opens the run. */
export default function RecentRuns({ runs, selectedRunId, onSelect }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...runs].reverse();
  const visible = showAll ? sorted : sorted.slice(0, RECENT_RUNS_LIMIT);
  const { flags } = recoveryFlags();

  return (
    <section className="section runs" aria-labelledby="runs-title">
      <div className="runs__head">
        <h2 className="section__title" id="runs-title">Recent runs</h2>
        {sorted.length > RECENT_RUNS_LIMIT && (
          <button type="button" className="text-link is-quiet" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}>
            {showAll ? 'Show fewer' : `Show all ${sorted.length}`}
          </button>
        )}
      </div>

      <ul className="runs__list">
        {visible.map((r) => {
          const flag = flags.get(r.id);
          return (
            <li key={r.id}>
              <button
                type="button"
                className={`run ${r.id === selectedRunId ? 'is-selected' : ''}`}
                onClick={() => onSelect(r.id)}
                aria-label={`${typeLabel(r.type)} run, ${formatWeekday(r.date)} ${formatDate(r.date)}, ${formatMiles(r.distance)} miles at ${formatPace(r.paceSec)} per mile.${flag ? ` ${flag.label}.` : ''} Open details`}
              >
                <span className="run__date">
                  {formatWeekday(r.date)}, {formatDate(r.date)}
                  {flag && (
                    <span className="run__flag" aria-hidden="true">
                      {flag.label}
                    </span>
                  )}
                </span>
                <span className="run__type">
                  <RunTypeMark type={r.type} />
                  {typeLabel(r.type)}
                </span>
                <span className="run__num">{formatMiles(r.distance)} mi</span>
                <span className="run__num is-pace">{formatPace(r.paceSec)} /mi</span>
                <svg className="run__chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
