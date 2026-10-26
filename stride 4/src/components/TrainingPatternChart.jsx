import { PATTERN } from '../data/config.js';
import { ALL_RUNS, formatDate, formatDayName, formatMiles, formatPace, overallStory, recoveryFlags, typeLabel, weekStartDate } from '../lib/metrics.js';
import { RunTypeMark } from './RunTypeMark.jsx';

/**
 * Training pattern as a familiar training calendar: one row per week, Mon → Sun across.
 * Reading a row = reading a week, the way runners already plan.
 *
 *   - a run is a small tile: its shape (Fun / Tempo / Long) and distance
 *   - a rest day is an empty slot, so gaps between runs are obvious
 *   - a recovery opportunity is the same tile with a thin orange outline
 *   - your fastest week's label is green
 * One sentence underneath states the pattern. The run-type filter dims other
 * types; every run is a real <button> that opens the run.
 */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MS = 24 * 60 * 60 * 1000;
const BEST_WEEK = overallStory().best.week;

export default function TrainingPatternChart({ weeks, type, selectedRunId, onSelect }) {
  const { flags } = recoveryFlags();

  return (
    <div className={`pattern ${type !== 'all' ? 'is-filtered' : ''}`}>
      <div className="pattern__scroll">
        <table className="cal">
          <caption className="sr-only">Training calendar: runs by day, one row per week</caption>
          <thead>
            <tr>
              <th scope="col" className="cal__corner">
                <span className="sr-only">Week</span>
              </th>
              {DAYS.map((d) => (
                <th key={d} scope="col" className="cal__day">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((wk) => {
              const start = Date.parse(`${weekStartDate(wk)}T00:00:00Z`);
              return (
                <tr key={wk}>
                  <th scope="row" className={`cal__week ${wk === BEST_WEEK ? 'is-best' : ''}`}>
                    Week {wk}
                    {wk === BEST_WEEK && <span className="sr-only"> (your fastest week)</span>}
                  </th>
                  {DAYS.map((d, di) => {
                    const iso = new Date(start + di * DAY_MS).toISOString().slice(0, 10);
                    const run = ALL_RUNS.find((r) => r.date === iso);
                    if (!run) {
                      return (
                        <td key={d} className="cal__cell">
                          <span className="cal__rest">
                            <span className="sr-only">Rest</span>
                          </span>
                        </td>
                      );
                    }
                    const flag = flags.get(run.id);
                    const dim = type !== 'all' && run.type !== type;
                    return (
                      <td key={d} className="cal__cell">
                        <button
                          type="button"
                          className={`pattern__run is-${run.type} ${flag ? 'is-flag' : ''} ${dim ? 'is-dim' : ''} ${run.id === selectedRunId ? 'is-selected' : ''}`}
                          onClick={() => onSelect(run.id)}
                          aria-label={`${formatDayName(run.date)} ${formatDate(run.date)}: ${typeLabel(run.type)} run, ${formatMiles(run.distance)} miles at ${formatPace(run.paceSec)} per mile.${flag ? ` ${flag.label}.` : ''}`}
                          title={flag ? `${typeLabel(run.type)} · ${flag.label}` : typeLabel(run.type)}
                        >
                          <RunTypeMark type={run.type} />
                          <span className="pattern__mi">
                            {formatMiles(run.distance).replace(/\.0$/, '')}
                            <small>mi</small>
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RecoveryInsight weeks={weeks} />

      <ul className="pattern__key" aria-label="Key">
        <li><RunTypeMark type="fun" size="sm" />Fun</li>
        <li><RunTypeMark type="tempo" size="sm" />Tempo</li>
        <li><RunTypeMark type="long" size="sm" />Long</li>
        <li><span className="pattern__key-flag" aria-hidden="true" />{PATTERN.flagLabel}</li>
      </ul>
    </div>
  );
}

/** One sentence: how recovery opportunities changed across the visible weeks. */
function RecoveryInsight({ weeks }) {
  const { flags } = recoveryFlags();
  const count = (ws) => ALL_RUNS.filter((r) => ws.includes(r.week) && flags.has(r.id)).length;
  const half = Math.max(1, Math.floor(weeks.length / 2));
  const early = weeks.slice(0, half);
  const late = weeks.slice(half);
  const a = count(early);
  const b = count(late);
  const lastWeek = weeks[weeks.length - 1];
  const lastCount = count([lastWeek]);
  const span = (ws) => (ws.length === 1 ? `week ${ws[0]}` : `weeks ${ws[0]}–${ws[ws.length - 1]}`);

  const sentence =
    b > a
      ? 'Recovery opportunities increased in the second half of your training.'
      : b < a
        ? 'Recovery opportunities decreased in the second half of your training.'
        : a === 0
          ? 'No recovery opportunities in this period.'
          : 'Recovery opportunities held steady across this period.';

  return (
    <p className="pattern__insight">
      <span className="pattern__insight-text">{sentence}</span>
      {(a > 0 || b > 0) && (
        <span className="pattern__insight-sub">
          {a} in {span(early)} <span aria-hidden="true">→</span>
          <span className="sr-only">to</span> <strong>{lastCount}</strong> in week {lastWeek}
        </span>
      )}
    </p>
  );
}
