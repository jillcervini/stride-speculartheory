import { RUN_TYPES } from '../data/config.js';
import { RunTypeMark } from './RunTypeMark.jsx';

/**
 * Primary interaction: run-type segmented control.
 *
 * Built on native radio inputs inside a fieldset, so keyboard support comes from
 * the browser: Tab moves into the group (landing on the selected option),
 * Arrow keys move and select, Tab leaves. The radios are visually hidden; the
 * label is the visible pill and picks up focus/checked styles from the input.
 * Each option shows its run-type mark, so the filter doubles as the chart's key.
 */
export default function RunFilter({ value, onChange }) {
  return (
    <fieldset className="segmented">
      <legend className="sr-only">Run type</legend>
      {RUN_TYPES.map((t) => (
        <label key={t.id} className="segmented__option">
          <input
            type="radio"
            name="run-type"
            value={t.id}
            checked={value === t.id}
            onChange={() => onChange(t.id)}
            className="segmented__input"
          />
          <span className="segmented__label">
            <RunTypeMark type={t.id} size="sm" />
            {t.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
