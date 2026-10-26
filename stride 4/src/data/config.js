/**
 * Product configuration: the things a designer or PM is most likely to tweak.
 * Data lives in runs.js; copy and options live here.
 */

/** First Monday of the 8-week window. Week numbers are counted from here. */
export const PROGRAM_START = '2026-08-24';
export const PROGRAM_WEEKS = 8;

/**
 * Run-type filter options (training-pattern sheet). `id` must match `type` in runs.js
 * ('all' is special). `label` is the short filter label, `noun` is used in sentences.
 */
export const RUN_TYPES = [
  { id: 'all', label: 'All', noun: 'runs' },
  { id: 'fun', label: 'Fun', noun: 'fun runs' },
  { id: 'tempo', label: 'Tempo', noun: 'tempo runs' },
  { id: 'long', label: 'Long', noun: 'long runs' },
];

/** Date-range options, ordered widest → narrowest. `weeks` counts back from the most recent week. */
export const DATE_RANGES = [
  { id: '8w', label: 'Last 8 weeks', weeks: 8 },
  { id: '4w', label: 'Last 4 weeks', weeks: 4 },
  { id: '2w', label: 'Last 2 weeks', weeks: 2 },
];

export const DEFAULT_RANGE = '8w';
export const DEFAULT_TYPE = 'all';

/** Recent runs shown on the homepage before "Show all". */
export const RECENT_RUNS_LIMIT = 5;

/**
 * Homepage copy. Headlines are chosen from the data in metrics.js → rangeStory().
 * Keep the language observational: Stride surfaces patterns, it doesn't diagnose.
 */
export const COPY = {
  changedTitle: 'What changed?',
  patternSentence: 'Your recent training pattern may be contributing to your performance plateau.',
  steadySentence: 'Your pace is steady for now, but recovery days after long runs are still being skipped.',
  nextTitle: 'Try this next',
  patternLink: 'See your training pattern',
};

/** Training-pattern sheet copy and the flag label used everywhere. */
export const PATTERN = {
  title: 'Training pattern',
  flagLabel: 'Recovery opportunity',
};
