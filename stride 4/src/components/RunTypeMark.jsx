/**
 * Run-type symbols. Shape carries the meaning (Fun = circle, Tempo = diamond,
 * Long = pill), in neutral warm tones so the page keeps a single accent color.
 * Always paired with a text label.
 */

/** HTML mark for text contexts. */
export function RunTypeMark({ type, size = 'md' }) {
  if (type === 'all') return null;
  return <span className={`type-mark is-${type} is-${size}`} aria-hidden="true" />;
}

/** SVG glyph for charts, centered on (x, y). `s` is the base size in px. */
export function RunTypeGlyph({ type, x, y, s = 8 }) {
  let shape;
  if (type === 'tempo') {
    const d = s * 0.74;
    shape = <rect x={x - d / 2} y={y - d / 2} width={d} height={d} rx={1} transform={`rotate(45 ${x} ${y})`} />;
  } else if (type === 'long') {
    shape = <rect x={x - s * 0.9} y={y - s * 0.38} width={s * 1.8} height={s * 0.76} rx={s * 0.38} />;
  } else {
    shape = <circle cx={x} cy={y} r={s / 2} />;
  }
  return (
    <g className={`type-glyph is-${type}`} aria-hidden="true">
      {shape}
    </g>
  );
}
