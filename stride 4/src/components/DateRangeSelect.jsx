import { DATE_RANGES } from '../data/config.js';

/** Native <select>: Space/Alt+↓ opens, arrows move, Enter chooses, Escape closes. */
export default function DateRangeSelect({ id, value, onChange }) {
  return (
    <label className="range" htmlFor={id}>
      <span className="sr-only">Date range</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {DATE_RANGES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <svg className="range__chevron" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </label>
  );
}
