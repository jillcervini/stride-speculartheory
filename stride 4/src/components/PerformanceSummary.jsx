import { DATE_RANGES } from '../data/config.js';
import { formatMiles, formatPace, rangeInsight } from '../lib/metrics.js';

/**
 * 1. HOW AM I DOING? One block: the headline (the takeaway), one sentence that says
 * why it matters and where the runner stands, then the readout that backs it up.
 * Everything here is interpreted for the selected range.
 * Orange = slower than best. Green = best.
 */
export default function PerformanceSummary({ story, range }) {
  const { headline, latest, best, first, mileagePct, paceDelta } = story;
  const rangeLabel = DATE_RANGES.find((r) => r.id === range)?.label;
  const slower = paceDelta > 5;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__eyebrow">{rangeLabel}</p>
      <h1 className="hero__title" id="hero-title" aria-live="polite">
        {headline}
      </h1>
      <p className="hero__insight">{rangeInsight(story)}</p>

      <dl className="readout">
        <div className="readout__item is-primary">
          <dt>Current pace</dt>
          <dd className={slower ? 'is-warn' : ''}>
            {formatPace(latest.paceSec)}
            <span className="readout__unit">/mi</span>
          </dd>
          <p className={`readout__sub ${slower ? 'is-warn' : ''}`}>
            {latest === best ? 'Your best in this period' : `${paceDelta} sec/mi off your best`}
          </p>
        </div>
        <div className="readout__item">
          <dt>Best pace</dt>
          <dd className="is-good">
            {formatPace(best.paceSec)}
            <span className="readout__unit">/mi</span>
          </dd>
          <p className="readout__sub">Week {best.week}</p>
        </div>
        <div className="readout__item">
          <dt>Weekly mileage</dt>
          <dd>
            {formatMiles(latest.miles)}
            <span className="readout__unit">mi</span>
          </dd>
          <p className="readout__sub">
            {mileagePct >= 0 ? '+' : '−'}
            {Math.abs(mileagePct)}% since week {first.week}
          </p>
        </div>
      </dl>
    </section>
  );
}
