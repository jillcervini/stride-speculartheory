import { useLayoutEffect, useRef, useState } from 'react';
import { formatMiles, formatPace } from '../lib/metrics.js';

/**
 * The one primary visualization. It answers: "Is my pace getting better or worse?"
 *
 * Average pace per week, plotted by value (slower = higher). The line is green up
 * to the best week and shifts to orange as pace slows (warm white if the change is
 * within 5 sec/mi), so the trend reads before any label. Only two points are
 * labelled: best and now. Faint week markers give structure without gridlines.
 * Hover a week for its numbers; a visually hidden table carries every value.
 */

const H = 316;
const PLOT_TOP = 40;
const PLOT_BOTTOM = 230;
const AXIS_Y = 296;
const PAD_X = 24;

function useWidth(ref) {
  const [width, setWidth] = useState(800);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export default function PerformanceChart({ story }) {
  const { series, best, latest, paceDelta } = story;
  const ref = useRef(null);
  const width = useWidth(ref);
  const [hover, setHover] = useState(null);

  const n = series.length;
  const plotW = width - PAD_X * 2;
  const step = n > 1 ? plotW / (n - 1) : 0;
  const x = (i) => (n > 1 ? PAD_X + i * step : width / 2);
  const paces = series.map((w) => w.paceSec);
  const min = Math.min(...paces);
  const max = Math.max(...paces, min + 10);
  const y = (p) => PLOT_BOTTOM - ((p - min) / (max - min)) * (PLOT_BOTTOM - PLOT_TOP);

  const pts = series.map((w, i) => ({ x: x(i), y: y(w.paceSec), w, i }));
  const line = pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + p.x) / 2;
    return `${d} C${mx},${prev.y} ${mx},${p.y} ${p.x},${p.y}`;
  }, '');
  const area = `${line} L${pts[n - 1].x},${PLOT_BOTTOM + 20} L${pts[0].x},${PLOT_BOTTOM + 20} Z`;

  const bestIdx = series.indexOf(best);
  const bestPt = pts[bestIdx];
  const nowPt = pts[n - 1];
  const slowing = paceDelta > 5;
  const endColor = bestIdx === n - 1 ? 'var(--good)' : slowing ? 'var(--warn)' : 'var(--text)';
  const bestFrac = n > 1 ? bestIdx / (n - 1) : 0;
  const hovered = hover != null ? pts[hover] : null;
  const anchor = (px) => (px < 80 ? 'start' : px > width - 80 ? 'end' : 'middle');

  return (
    <section className="trend" aria-labelledby="trend-title">
      <div className="trend__head">
        <h2 className="label" id="trend-title">
          Pace by week
        </h2>
        <p className="trend__hint">↑ slower</p>
      </div>

      <div className="trend__plot" ref={ref}>
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Average pace by week. Best ${formatPace(best.paceSec)} in week ${best.week}; now ${formatPace(latest.paceSec)} in week ${latest.week}.`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="pace-stroke" gradientUnits="userSpaceOnUse" x1={PAD_X} x2={PAD_X + plotW} y1="0" y2="0">
              <stop offset="0" stopColor="var(--good)" />
              <stop offset={bestFrac} stopColor="var(--good)" />
              <stop offset="1" stopColor={endColor} />
            </linearGradient>
            <linearGradient id="pace-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--text)" stopOpacity="0.07" />
              <stop offset="1" stopColor="var(--text)" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {pts.map((p) => (
            <line key={`m${p.w.week}`} className={`trend__marker ${p === hovered ? 'is-active' : ''}`} x1={p.x} x2={p.x} y1={PLOT_TOP - 20} y2={PLOT_BOTTOM + 20} />
          ))}

          <path d={area} fill="url(#pace-area)" />
          <path d={line} className="trend__glow" stroke="url(#pace-stroke)" filter="url(#glow)" />
          <path d={line} className="trend__line" stroke="url(#pace-stroke)" pathLength="1" />

          {pts.map((p) =>
            p === bestPt || p === nowPt ? null : (
              <circle key={`p${p.w.week}`} cx={p.x} cy={p.y} r={p === hovered ? 5 : 3.5} className="trend__pt" />
            ),
          )}

          <circle cx={bestPt.x} cy={bestPt.y} r="13" className="halo is-good" />
          <circle cx={bestPt.x} cy={bestPt.y} r="6.5" className="trend__key is-good" />
          <text className="trend__label is-good" x={bestPt.x} y={bestPt.y + 30} textAnchor={anchor(bestPt.x)}>
            Best {formatPace(best.paceSec)}
          </text>

          {nowPt !== bestPt && (
            <>
              <circle cx={nowPt.x} cy={nowPt.y} r="13" className={`halo ${slowing ? 'is-warn' : 'is-flat'}`} />
              <circle cx={nowPt.x} cy={nowPt.y} r="6.5" className={`trend__key ${slowing ? 'is-warn' : 'is-flat'}`} />
              <text className={`trend__label ${slowing ? 'is-warn' : ''}`} x={nowPt.x} y={nowPt.y - 20} textAnchor={anchor(nowPt.x)}>
                Now {formatPace(latest.paceSec)}
              </text>
            </>
          )}

          {pts.map((p) => (
            <text key={`x${p.w.week}`} className={`trend__x ${p === bestPt ? 'is-good' : ''} ${p === hovered ? 'is-active' : ''}`} x={p.x} y={AXIS_Y} textAnchor="middle">
              Wk {p.w.week}
            </text>
          ))}

          {pts.map((p) => (
            <rect key={`h${p.w.week}`} x={p.x - (step || plotW) / 2} y={0} width={step || plotW} height={H} fill="transparent" onMouseEnter={() => setHover(p.i)} />
          ))}
        </svg>

        {hovered && (
          <div className="trend__tip" style={{ left: Math.min(Math.max(hovered.x, 90), width - 90), top: hovered.y - 30 }} aria-hidden="true">
            <span className="trend__tip-wk">Week {hovered.w.week}</span>
            <span className="trend__tip-pace">
              {formatPace(hovered.w.paceSec)}
              <small>/mi</small>
            </span>
            <span className="trend__tip-mi">{formatMiles(hovered.w.miles)} mi</span>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Average pace and mileage by week</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Average pace</th>
            <th scope="col">Mileage</th>
          </tr>
        </thead>
        <tbody>
          {series.map((w) => (
            <tr key={w.week}>
              <th scope="row">Week {w.week}</th>
              <td>{formatPace(w.paceSec)} per mile</td>
              <td>{formatMiles(w.miles)} miles</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
