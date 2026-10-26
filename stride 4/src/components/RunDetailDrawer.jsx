import { useRef } from 'react';
import { formatLongDate, formatMiles, formatPace, interpretRun, recoveryFlags, typeLabel } from '../lib/metrics.js';
import useDialog from '../lib/useDialog.js';
import { RunTypeMark } from './RunTypeMark.jsx';

/**
 * One run, one focus: date, pace, two supporting numbers, one sentence of context.
 * A run on a day that could have been rest gets one orange line.
 */
export default function RunDetailDrawer({ run, onClose }) {
  const closeRef = useRef(null);
  const panelRef = useDialog(Boolean(run), onClose, closeRef);
  if (!run) return null;

  const read = interpretRun(run);
  const flag = recoveryFlags().flags.get(run.id);

  return (
    <div className="layer is-drawer">
      <div className="layer__backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panelRef}>
        <div className="drawer__top">
          <p className="drawer__type">
            <RunTypeMark type={run.type} />
            {typeLabel(run.type)} run
          </p>
          <button type="button" className="close" onClick={onClose} ref={closeRef} aria-label="Close run details">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <h2 className="drawer__title" id="drawer-title">{formatLongDate(run.date)}</h2>

        <p className="drawer__pace">
          {formatPace(run.paceSec)}
          <span>/mi</span>
        </p>
        <p className="drawer__meta">
          {formatMiles(run.distance)} mi · {run.avgHr} bpm avg heart rate
        </p>

        <p className="drawer__read">{read.text}</p>

        {flag && (
          <p className="drawer__flag">
            <strong>{flag.label}.</strong> {flag.detail}
          </p>
        )}
      </aside>
    </div>
  );
}
