import { COPY } from '../data/config.js';
import { formatMiles, formatPace } from '../lib/metrics.js';

/**
 * 2. WHAT IS INFLUENCING MY PERFORMANCE? Three typographic rows, ordered
 * cause → cause → effect: Volume, Recovery, Pace. Before → after, then the
 * change in words, colored only when it matters (orange = worse).
 * No extra charts: the pace trend above is the one visualization.
 */
export default function WhatChanged({ story, onOpenPattern }) {
  const { first, latest, best, mileagePct, paceDelta, recovery } = story;
  const { early, recent, earlyWeeks, recentWeeks } = recovery;
  const slowing = paceDelta > 5;
  const span = (ws) => (ws.length === 1 ? `week ${ws[0]}` : `weeks ${ws[0]}–${ws[ws.length - 1]}`);
  const recoveryWorse = early.rate != null && recent.rate != null && recent.rate < early.rate;

  const rows = [
    {
      id: 'volume',
      label: 'Volume',
      from: formatMiles(first.miles),
      to: formatMiles(latest.miles),
      unit: 'mi/week',
      change: `${mileagePct >= 0 ? '↑' : '↓'} ${Math.abs(mileagePct)}%`,
      note: `week ${first.week} → week ${latest.week}`,
      tone: '',
    },
    {
      id: 'recovery',
      label: 'Recovery',
      from: early.total ? `${early.rested}/${early.total}` : '—',
      to: recent.total ? `${recent.rested}/${recent.total}` : '—',
      unit: 'long runs followed by rest',
      change: recoveryWorse ? '↓ less consistent' : recent.rate === 0 ? 'still skipped' : 'consistent',
      note: `${span(earlyWeeks)} → ${span(recentWeeks)}`,
      tone: recoveryWorse || recent.rate === 0 ? 'is-warn' : '',
    },
    {
      id: 'pace',
      label: 'Pace',
      from: formatPace(best.paceSec),
      to: formatPace(latest.paceSec),
      unit: '/mi',
      change: slowing ? `↓ ${paceDelta} sec/mi slower` : `${paceDelta} sec/mi`,
      note: `best (week ${best.week}) → now`,
      tone: slowing ? 'is-warn' : '',
    },
  ];

  return (
    <section className="changed" aria-labelledby="changed-title">
      <h2 className="section__title" id="changed-title">{COPY.changedTitle}</h2>

      <dl className="rows">
        {rows.map((r) => (
          <div key={r.id} className="row">
            <dt className="row__label">{r.label}</dt>
            <dd className="row__values">
              <span className="row__from">{r.from}</span>
              <span className="row__arrow" aria-label="to">→</span>
              <span className={`row__to ${r.tone}`}>{r.to}</span>
              <span className="row__unit">{r.unit}</span>
            </dd>
            <dd className={`row__change ${r.tone}`}>
              {r.change}
              <span className="row__note">{r.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="changed__summary">
        {slowing ? COPY.patternSentence : COPY.steadySentence}{' '}
        <button type="button" className="text-link is-inline" onClick={onOpenPattern}>
          {COPY.patternLink} <span aria-hidden="true">→</span>
        </button>
      </p>
    </section>
  );
}
