import { useRef } from 'react';
import { PATTERN } from '../data/config.js';
import { typeNoun } from '../lib/metrics.js';
import useDialog from '../lib/useDialog.js';
import RunFilter from './RunFilter.jsx';
import DateRangeSelect from './DateRangeSelect.jsx';
import TrainingPatternChart from './TrainingPatternChart.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Secondary view, opened from "See training pattern →".
 * Exploratory: run-type filter + date range (shared with the homepage),
 * the day-by-day chart (with a one-line recovery insight),
 * and an empty state when nothing matches.
 */
export default function TrainingPatternSheet({ open, onClose, weeks, runs, type, range, onTypeChange, onRangeChange, onRecover, selectedRunId, onSelectRun }) {
  const titleRef = useRef(null);
  const panelRef = useDialog(open, onClose, titleRef);
  if (!open) return null;

  return (
    <div className="layer is-sheet">
      <div className="layer__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={panelRef}>
        <div className="sheet__top">
          <h2 className="sheet__title" id="sheet-title" ref={titleRef} tabIndex={-1}>
            {PATTERN.title}
          </h2>
          <button type="button" className="close" onClick={onClose} aria-label="Close training pattern">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sheet__controls">
          <RunFilter value={type} onChange={onTypeChange} />
          <DateRangeSelect id="range-sheet" value={range} onChange={onRangeChange} />
        </div>

        {/* announced to screen readers when the filters change; the chart itself shows the result */}
        <p className="sr-only" aria-live="polite">
          {runs.length ? `${runs.length} ${runs.length === 1 ? typeNoun(type).replace(/s$/, '') : typeNoun(type)} shown` : ''}
        </p>

        {runs.length ? (
          <TrainingPatternChart weeks={weeks} type={type} selectedRunId={selectedRunId} onSelect={onSelectRun} />
        ) : (
          <EmptyState type={type} range={range} onRecover={onRecover} />
        )}
      </div>
    </div>
  );
}
