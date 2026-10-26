/**
 * Fictional run sessions for the Stride prototype.
 *
 * Eight weeks (Mon Aug 24 – Sun Oct 18, 2026). Weekly totals follow the brief:
 * volume climbs 14 → 25 mi, long runs go 1 → 3 per week, and the
 * distance-weighted pace improves to 7:52 in week 4, then slows to 8:10.
 * Tempo work stops after week 6 as long runs take over the schedule.
 *
 * Fields
 *   id        unique key
 *   date      ISO date (YYYY-MM-DD); the week is derived from it
 *   type      one of the ids in RUN_TYPES (config.js)
 *   distance  miles
 *   pace      average pace, min:sec per mile
 *   avgHr     average heart rate, bpm
 *   rpe       rate of perceived exertion, 1–10
 *
 * Add, remove or edit rows freely — every metric, chart and insight
 * is computed from this list.
 */
export const RUNS = [
  { id: 'run-01', date: '2026-08-25', type: 'fun', distance: 3, pace: '8:23', avgHr: 141, rpe: 3 },
  { id: 'run-02', date: '2026-08-27', type: 'tempo', distance: 3, pace: '7:22', avgHr: 166, rpe: 7 },
  { id: 'run-03', date: '2026-08-28', type: 'fun', distance: 3, pace: '8:21', avgHr: 141, rpe: 3 },
  { id: 'run-04', date: '2026-08-30', type: 'long', distance: 5, pace: '8:11', avgHr: 150, rpe: 5 },
  { id: 'run-05', date: '2026-09-01', type: 'fun', distance: 3.5, pace: '8:18', avgHr: 141, rpe: 3 },
  { id: 'run-06', date: '2026-09-03', type: 'tempo', distance: 3.5, pace: '7:17', avgHr: 166, rpe: 7 },
  { id: 'run-07', date: '2026-09-04', type: 'fun', distance: 3.5, pace: '8:16', avgHr: 141, rpe: 3 },
  { id: 'run-08', date: '2026-09-06', type: 'long', distance: 5.5, pace: '8:06', avgHr: 150, rpe: 5 },
  { id: 'run-09', date: '2026-09-08', type: 'fun', distance: 3.5, pace: '8:15', avgHr: 142, rpe: 3 },
  { id: 'run-10', date: '2026-09-10', type: 'tempo', distance: 4, pace: '7:14', avgHr: 167, rpe: 7 },
  { id: 'run-11', date: '2026-09-11', type: 'fun', distance: 3.5, pace: '8:13', avgHr: 142, rpe: 3 },
  { id: 'run-12', date: '2026-09-13', type: 'long', distance: 6, pace: '8:03', avgHr: 151, rpe: 5 },
  { id: 'run-13', date: '2026-09-15', type: 'fun', distance: 4, pace: '8:10', avgHr: 142, rpe: 3 },
  { id: 'run-14', date: '2026-09-17', type: 'tempo', distance: 4, pace: '7:09', avgHr: 167, rpe: 7 },
  { id: 'run-15', date: '2026-09-18', type: 'fun', distance: 4, pace: '8:08', avgHr: 142, rpe: 3 },
  { id: 'run-16', date: '2026-09-20', type: 'long', distance: 7, pace: '7:58', avgHr: 151, rpe: 5 },
  { id: 'run-17', date: '2026-09-22', type: 'fun', distance: 3, pace: '8:09', avgHr: 144, rpe: 3 },
  { id: 'run-18', date: '2026-09-23', type: 'tempo', distance: 3.5, pace: '7:08', avgHr: 169, rpe: 7 },
  { id: 'run-19', date: '2026-09-24', type: 'long', distance: 6, pace: '8:01', avgHr: 152, rpe: 5 },
  { id: 'run-20', date: '2026-09-26', type: 'fun', distance: 3, pace: '8:03', avgHr: 145, rpe: 3 },
  { id: 'run-21', date: '2026-09-27', type: 'long', distance: 5.5, pace: '8:02', avgHr: 152, rpe: 5 },
  { id: 'run-22', date: '2026-09-29', type: 'fun', distance: 3, pace: '8:15', avgHr: 146, rpe: 4 },
  { id: 'run-23', date: '2026-09-30', type: 'tempo', distance: 3.5, pace: '7:14', avgHr: 171, rpe: 8 },
  { id: 'run-24', date: '2026-10-01', type: 'long', distance: 6.5, pace: '8:07', avgHr: 154, rpe: 6 },
  { id: 'run-25', date: '2026-10-03', type: 'fun', distance: 3.5, pace: '8:09', avgHr: 147, rpe: 4 },
  { id: 'run-26', date: '2026-10-04', type: 'long', distance: 6.5, pace: '8:08', avgHr: 154, rpe: 6 },
  { id: 'run-27', date: '2026-10-06', type: 'fun', distance: 4, pace: '8:15', avgHr: 148, rpe: 4 },
  { id: 'run-28', date: '2026-10-08', type: 'long', distance: 8, pace: '8:04', avgHr: 157, rpe: 6 },
  { id: 'run-29', date: '2026-10-09', type: 'fun', distance: 4, pace: '8:13', avgHr: 148, rpe: 4 },
  { id: 'run-30', date: '2026-10-11', type: 'long', distance: 8, pace: '8:03', avgHr: 157, rpe: 6 },
  { id: 'run-31', date: '2026-10-12', type: 'fun', distance: 3, pace: '8:18', avgHr: 150, rpe: 4 },
  { id: 'run-32', date: '2026-10-14', type: 'long', distance: 6, pace: '8:07', avgHr: 159, rpe: 7 },
  { id: 'run-33', date: '2026-10-15', type: 'fun', distance: 3, pace: '8:16', avgHr: 150, rpe: 4 },
  { id: 'run-34', date: '2026-10-17', type: 'long', distance: 6, pace: '8:06', avgHr: 159, rpe: 7 },
  { id: 'run-35', date: '2026-10-18', type: 'long', distance: 7, pace: '8:11', avgHr: 158, rpe: 7 },
];
