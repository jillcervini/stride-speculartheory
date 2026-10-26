import { COPY } from '../data/config.js';
import { recommendation } from '../lib/metrics.js';

/**
 * 3. WHAT SHOULD I DO NEXT? Generated from the selected range (metrics.js →
 * recommendation): three targets, each against this week, one sentence of
 * guidance, and what it's based on. The page's only surface and its one
 * deliberate use of green for action.
 */
export default function NextStep({ story }) {
  const rec = recommendation(story);

  return (
    <section className="next" aria-labelledby="next-title">
      <h2 className="next__title" id="next-title">
        <span className="next__mark" aria-hidden="true" />
        {COPY.nextTitle}
      </h2>
      <p className="next__lead">{rec.lead}</p>

      <ul className="next__targets">
        {rec.targets.map((t) => (
          <li key={t.label}>
            <p className="next__value">
              {t.value}
              {t.unit && <span className="next__unit">{t.unit}</span>}
            </p>
            <p className="next__label">{t.label}</p>
            <p className="next__now">{t.now}</p>
          </li>
        ))}
      </ul>

      <p className="next__basis">{rec.basis}</p>
    </section>
  );
}
