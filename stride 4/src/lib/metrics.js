/**
 * Pure data helpers: parsing, filtering, weekly aggregation, summary metrics
 * and run-level interpretation. No React in here, so it is easy to test or swap.
 */
import { RUNS } from '../data/runs.js';
import { PROGRAM_START, PROGRAM_WEEKS, DATE_RANGES, RUN_TYPES, PATTERN } from '../data/config.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const startMs = Date.parse(`${PROGRAM_START}T00:00:00Z`);

/* ---------- formatting ---------- */

export const parsePace = (pace) => {
  const [m, s] = pace.split(':').map(Number);
  return m * 60 + s;
};

export const formatPace = (sec) => {
  if (sec == null || Number.isNaN(sec)) return '—';
  const r = Math.round(sec);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
};

export const formatMiles = (mi) => (Number.isInteger(mi) ? `${mi}.0` : mi.toFixed(1));

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const longFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const formatDate = (iso) => dateFmt.format(new Date(`${iso}T00:00:00Z`));
export const formatWeekday = (iso) => dayFmt.format(new Date(`${iso}T00:00:00Z`));
const dayNameFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });
export const formatDayName = (iso) => dayNameFmt.format(new Date(`${iso}T00:00:00Z`));
export const formatLongDate = (iso) => longFmt.format(new Date(`${iso}T00:00:00Z`));

export const typeLabel = (id) => RUN_TYPES.find((t) => t.id === id)?.label ?? id;
export const typeNoun = (id) => RUN_TYPES.find((t) => t.id === id)?.noun ?? 'runs';

/* ---------- normalized data ---------- */

const weekOf = (iso) => Math.floor((Date.parse(`${iso}T00:00:00Z`) - startMs) / (7 * DAY_MS)) + 1;

/** Runs with derived fields: week number, pace in seconds, duration. Sorted oldest → newest. */
export const ALL_RUNS = RUNS.map((r) => {
  const paceSec = parsePace(r.pace);
  return { ...r, week: weekOf(r.date), paceSec, durationSec: paceSec * r.distance };
}).sort((a, b) => a.date.localeCompare(b.date));

export const weekStartDate = (week) =>
  new Date(startMs + (week - 1) * 7 * DAY_MS).toISOString().slice(0, 10);

/** Week numbers covered by a date range id, e.g. '4w' → [5, 6, 7, 8]. */
export const weeksInRange = (rangeId) => {
  const n = DATE_RANGES.find((r) => r.id === rangeId)?.weeks ?? PROGRAM_WEEKS;
  return Array.from({ length: n }, (_, i) => PROGRAM_WEEKS - n + 1 + i);
};

export const filterRuns = (runs, { type, range }) => {
  const weeks = new Set(weeksInRange(range));
  return runs.filter((r) => weeks.has(r.week) && (type === 'all' || r.type === type));
};

/* ---------- aggregation ---------- */

const weightedPace = (runs) => {
  const miles = runs.reduce((a, r) => a + r.distance, 0);
  return miles ? runs.reduce((a, r) => a + r.paceSec * r.distance, 0) / miles : null;
};

const mean = (xs) => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null);

/** One row per week in range. Weeks with no matching runs have paceSec: null. */
export const weeklySeries = (runs, weeks) =>
  weeks.map((week) => {
    const inWeek = runs.filter((r) => r.week === week);
    return {
      week,
      start: weekStartDate(week),
      miles: inWeek.reduce((a, r) => a + r.distance, 0),
      runCount: inWeek.length,
      longRuns: inWeek.filter((r) => r.type === 'long').length,
      types: inWeek.map((r) => r.type), // in date order, for the run-mix row under the chart
      paceSec: weightedPace(inWeek),
      avgHr: mean(inWeek.map((r) => r.avgHr)),
    };
  });

/** Best (fastest) week among weeks that have runs. */
export const bestWeek = (series) =>
  series.filter((w) => w.paceSec != null).reduce((best, w) => (!best || w.paceSec < best.paceSec ? w : best), null);

/* ---------- run detail ---------- */

/**
 * Short, careful interpretation of a single run: compares it with earlier runs of
 * the same type. Returns { tone, text } where tone is 'neutral' | 'positive' | 'watch'.
 */
export const interpretRun = (run) => {
  const earlier = ALL_RUNS.filter((r) => r.type === run.type && r.date < run.date);
  const noun = typeNoun(run.type).replace(/s$/, '');
  if (earlier.length < 2) {
    return {
      tone: 'neutral',
      text: `One of your first ${typeNoun(run.type)} in this window, so it helps set the baseline for later comparisons.`,
    };
  }
  const dPace = Math.round(run.paceSec - weightedPace(earlier));
  const dHr = Math.round(run.avgHr - mean(earlier.map((r) => r.avgHr)));
  const hrPhrase = dHr >= 2 ? `at a ${dHr} bpm higher average heart rate` : dHr <= -2 ? `at a ${-dHr} bpm lower heart rate` : 'at a similar heart rate';

  if (dPace >= 5 && dHr >= 2) {
    return {
      tone: 'watch',
      text: `${dPace} sec/mi slower than your earlier ${noun} average, ${hrPhrase}. More effort for a slower pace fits the recent plateau.`,
    };
  }
  if (dPace >= 5) {
    return {
      tone: 'watch',
      text: `${dPace} sec/mi slower than your earlier ${noun} average, ${hrPhrase}. Worth watching, though a single run can vary for many reasons.`,
    };
  }
  if (dPace < 5 && dHr >= 4) {
    return {
      tone: 'watch',
      text: `A similar pace to your earlier ${noun} average, but ${hrPhrase}. This pace is taking more effort than it used to.`,
    };
  }
  if (dPace <= -5) {
    return { tone: 'positive', text: `${-dPace} sec/mi faster than your earlier ${noun} average, ${hrPhrase}. A strong session.` };
  }
  return { tone: 'neutral', text: `In line with your earlier ${noun} average pace, ${hrPhrase}.` };
};

/* ---------- headline story ---------- */

/**
 * The numbers behind the hero insight, computed from all runs across the full window:
 * how volume, long-run frequency and pace changed, plus the user's own best week,
 * which anchors the suggested next step.
 */
export const overallStory = () => {
  const series = weeklySeries(ALL_RUNS, Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1));
  const first = series[0];
  const latest = series[series.length - 1];
  const best = bestWeek(series);
  return {
    first,
    latest,
    best,
    mileagePct: Math.round(((latest.miles - first.miles) / first.miles) * 100),
    paceDeltaSec: Math.round(latest.paceSec - best.paceSec),
  };
};

/* ---------- recovery patterns ---------- */

/**
 * Recovery rules, checked against every run. A rule only flags runs if the runner
 * kept it during their improving weeks (up to their best-pace week); that way every
 * flag is "you stopped doing something that was working", based on their own history.
 *
 *   hard-after-hard  a tempo or long run the day after a tempo or long run  (severity: high)
 *   no-rest-after-long  any run the day after a long run                    (severity: medium)
 */
const HARD = new Set(['tempo', 'long']);
const dayGap = (a, b) => Math.round((Date.parse(b.date) - Date.parse(a.date)) / DAY_MS);

const RULES = [
  {
    id: 'hard-after-hard',
    severity: 'high',
    label: PATTERN.flagLabel,
    test: (run, prev) => prev && dayGap(prev, run) === 1 && HARD.has(run.type) && HARD.has(prev.type),
    detail: (run, prev) =>
      `${typeLabel(run.type)} run the day after a ${typeLabel(prev.type).toLowerCase()} run. Back-to-back hard days leave less time to recover.`,
    suggestion: (run, prev, baselineEnd) =>
      `Rest on ${formatDayName(run.date)}. In weeks 1–${baselineEnd}, every hard run was followed by rest or an easy run.`,
    habit: 'you never ran two hard days in a row',
  },
  {
    id: 'no-rest-after-long',
    severity: 'medium',
    label: PATTERN.flagLabel,
    test: (run, prev) => prev && dayGap(prev, run) === 1 && prev.type === 'long' && !HARD.has(run.type),
    detail: () => 'Ran the day after a long run.',
    suggestion: (run, prev, baselineEnd) => `Take this day off, as you did after every long run in weeks 1–${baselineEnd}.`,
    habit: 'you always rested the day after a long run',
  },
];

const computeFlags = () => {
  const story = overallStory();
  const baselineEnd = story.best.week;
  const flags = new Map();
  const activeRules = RULES.filter((rule) =>
    ALL_RUNS.every((run, i) => run.week > baselineEnd || !rule.test(run, ALL_RUNS[i - 1])),
  );
  ALL_RUNS.forEach((run, i) => {
    const prev = ALL_RUNS[i - 1];
    const rule = activeRules.find((r) => r.test(run, prev));
    if (rule) {
      flags.set(run.id, {
        rule: rule.id,
        severity: rule.severity,
        label: rule.label,
        detail: rule.detail(run, prev),
        suggestion: rule.suggestion(run, prev, baselineEnd),
      });
    }
  });
  return { flags, activeRules, baselineEnd };
};

let cachedFlags;
/** { flags: Map<runId, flag>, activeRules, baselineEnd } — computed once from ALL_RUNS. */
export const recoveryFlags = () => (cachedFlags ??= computeFlags());

/* ---------- range-aware story (homepage) ---------- */

const runOn = (iso) => ALL_RUNS.find((r) => r.date === iso);
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const WINDOW_END = addDays(PROGRAM_START, PROGRAM_WEEKS * 7 - 1);

/**
 * Long runs in the given weeks that were followed by a rest day.
 * A long run on the last day of the data is skipped: we can't know yet.
 */
export const restAfterLongRuns = (weeks) => {
  const longs = ALL_RUNS.filter((r) => weeks.includes(r.week) && r.type === 'long' && addDays(r.date, 1) <= WINDOW_END);
  const rested = longs.filter((r) => !runOn(addDays(r.date, 1))).length;
  return { rested, total: longs.length, rate: longs.length ? rested / longs.length : null };
};

/**
 * Everything the homepage says for one date range, computed from all runs.
 * The headline is chosen by rules so it stays true to the data:
 *   - pace within 5 s/mi of the range's best      → "holding steady"
 *   - slower every week while mileage climbed      → "slowed every week as mileage climbed"
 *   - slower than best while mileage rose > 10%    → "running more, but getting slower"
 *   - slower than best otherwise                   → "pace has slowed"
 *   - current week is the best and faster than the start → "getting faster"
 */
export const rangeStory = (rangeId) => {
  const weeks = weeksInRange(rangeId);
  const series = weeklySeries(ALL_RUNS, weeks);
  const first = series[0];
  const latest = series[series.length - 1];
  const best = bestWeek(series);
  const mileagePct = Math.round(((latest.miles - first.miles) / first.miles) * 100);
  const paceDelta = Math.round(latest.paceSec - best.paceSec); // + = slower than best
  const slowerEveryWeek = series.every((w, i) => i === 0 || w.paceSec > series[i - 1].paceSec);
  const steady = paceDelta <= 5 && !(latest === best && first.paceSec - latest.paceSec > 5);

  let headline;
  if (latest === best && first.paceSec - latest.paceSec > 5) headline = "You're getting faster.";
  else if (steady) headline = 'Your pace is holding steady.';
  else if (slowerEveryWeek && mileagePct > 10) headline = 'Your pace has slowed every week as mileage climbed.';
  else if (mileagePct > 10) headline = "You're running more, but getting slower.";
  else headline = 'Your pace has slowed.';

  // "What changed?": first half of the range vs second half for recovery
  const half = Math.max(1, Math.floor(weeks.length / 2));
  const earlyWeeks = weeks.slice(0, half);
  const recentWeeks = weeks.slice(half);
  const recovery = { early: restAfterLongRuns(earlyWeeks), recent: restAfterLongRuns(recentWeeks), earlyWeeks, recentWeeks };

  return { weeks, series, first, latest, best, mileagePct, paceDelta, steady, headline, recovery };
};

/** "Weeks 1–4" / "Week 7" */
export const weeksLabel = (weeks) => (weeks.length === 1 ? `Week ${weeks[0]}` : `Weeks ${weeks[0]}–${weeks[weeks.length - 1]}`);

/**
 * Per week: each long run and whether it was followed by a rest day
 * (null when the next day is past the end of the data). Drives the recovery micro-chart.
 */
export const longRunRecoveryByWeek = (weeks) =>
  weeks.map((wk) =>
    ALL_RUNS.filter((r) => r.week === wk && r.type === 'long').map((r) => ({
      id: r.id,
      rested: addDays(r.date, 1) > WINDOW_END ? null : !runOn(addDays(r.date, 1)),
    })),
  );

/** True when a run happened the day before this one (back-to-back days). */
export const ranDayBefore = (run) => Boolean(runOn(addDays(run.date, -1)));

/* ---------- interpretation: insight sentence + recommendation, per range ---------- */

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One supporting sentence under the headline: why it matters and where the runner stands. */
export const rangeInsight = (story) => {
  const { first, latest, best, mileagePct, paceDelta, steady, series } = story;
  const bp = formatPace(best.paceSec);
  const np = formatPace(latest.paceSec);
  const mileage = `weekly mileage ${mileagePct >= 0 ? 'rose' : 'fell'} ${Math.abs(mileagePct)}%`;
  if (latest === best && first.paceSec - latest.paceSec > 5) {
    return `Pace has improved ${Math.round(first.paceSec - latest.paceSec)} sec/mi since week ${first.week}, and this week is your fastest.`;
  }
  if (steady) {
    return `Pace has stayed within ${paceDelta} sec/mi of your best (${bp}) over the last ${plural(series.length, 'week')}, while ${mileage}.`;
  }
  if (best !== first) {
    return `Pace improved for ${plural(best.week - first.week, 'week')}, peaked at ${bp} in week ${best.week}, and has slowed ${paceDelta} sec/mi since, while ${mileage}.`;
  }
  return `Pace has slowed from ${bp} to ${np} over the last ${plural(series.length, 'week')}, while ${mileage}.`;
};

/**
 * What to do next, grounded in the selected range:
 *  - slowing → a recovery-focused week modelled on the range's fastest week
 *  - steady  → hold volume and protect recovery so pace has room to improve
 *  - faster  → keep building gradually
 * Each target carries "now" so the change to make is explicit.
 */
export const recommendation = (story) => {
  const { best, latest, paceDelta, steady, first, weeks } = story;
  const { flags } = recoveryFlags();
  const latestLongs = longRunRecoveryByWeek([latest.week])[0].filter((l) => l.rested !== null);
  const restedNow = latestLongs.filter((l) => l.rested).length;
  const restedNowText = latestLongs.length ? `${restedNow} of ${latestLongs.length} rested this week` : 'no long runs this week';
  const backToBackNow = ALL_RUNS.filter((r) => r.week === latest.week && flags.get(r.id)?.rule === 'hard-after-hard').length;

  if (latest === best && first.paceSec - latest.paceSec > 5) {
    return {
      lead: 'Your current balance is working. Keep the same rhythm and add volume slowly.',
      targets: [
        { value: `~${Math.round(latest.miles * 1.05)}`, unit: 'mi', label: 'weekly volume', now: `${formatMiles(latest.miles)} mi this week` },
        { value: `${latest.longRuns}`, label: latest.longRuns === 1 ? 'long run' : 'long runs', now: 'same as this week' },
        { value: '1', label: 'rest day after each long run', now: restedNowText },
      ],
      basis: `Based on week ${latest.week}, your fastest in this period.`,
    };
  }

  if (steady) {
    return {
      lead: 'Your pace is holding. Keep mileage where it is and protect recovery after long runs to give it room to improve.',
      targets: [
        { value: `~${Math.round(latest.miles)}`, unit: 'mi', label: 'hold weekly volume', now: `${formatMiles(latest.miles)} mi this week` },
        { value: '1', label: 'rest day after each long run', now: restedNowText },
        { value: '0', label: 'back-to-back hard days', now: `${backToBackNow} this week` },
      ],
      basis: `Based on your last ${plural(weeks.length, 'week')}.`,
    };
  }

  return {
    lead: `Reduce volume for one week and prioritize recovery after your ${best.longRuns === 1 ? 'long run' : 'long runs'}. Then see whether your pace responds.`,
    targets: [
      { value: `~${Math.round(best.miles)}`, unit: 'mi', label: 'weekly volume', now: `${formatMiles(latest.miles)} mi this week` },
      { value: `${best.longRuns}`, label: best.longRuns === 1 ? 'long run' : 'long runs', now: `${latest.longRuns} this week` },
      { value: '1', label: best.longRuns === 1 ? 'rest day after it' : 'rest day after each', now: restedNowText },
    ],
    basis: `Modeled on week ${best.week}, your fastest in this period${paceDelta > 5 ? ` (${formatPace(best.paceSec)}/mi)` : ''}.`,
  };
};
