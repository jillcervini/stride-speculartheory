import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_RANGE, DEFAULT_TYPE } from '../data/config.js';
import { ALL_RUNS, filterRuns, rangeStory, weeksInRange } from '../lib/metrics.js';
import Header from './Header.jsx';
import PerformanceSummary from './PerformanceSummary.jsx';
import PerformanceChart from './PerformanceChart.jsx';
import WhatChanged from './WhatChanged.jsx';
import NextStep from './NextStep.jsx';
import RecentRuns from './RecentRuns.jsx';
import TrainingPatternSheet from './TrainingPatternSheet.jsx';
import RunDetailDrawer from './RunDetailDrawer.jsx';


/**
 * Homepage reads top to bottom as one story:
 *   PerformanceSummary  → headline + supporting insight + readout, for the selected range
 *   PerformanceChart    → the 8-week pace trend
 *   WhatChanged         → volume, recovery, pace (before → after)
 *   NextStep            → what to do next, generated for the selected range
 *   RecentRuns          → compact list
 * Detail on demand: TrainingPatternSheet (from "See training pattern →") and RunDetailDrawer.
 *
 * State:
 *   range          date range, shared by the homepage and the sheet
 *   type           run-type filter (sheet only)
 *   patternOpen    sheet open/closed
 *   selectedRunId  run shown in the drawer (null = closed)
 */
export default function Dashboard() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [patternOpen, setPatternOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);

  const story = useMemo(() => rangeStory(range), [range]);
  const weeks = useMemo(() => weeksInRange(range), [range]);
  const rangeRuns = useMemo(() => filterRuns(ALL_RUNS, { type: 'all', range }), [range]);
  const patternRuns = useMemo(() => filterRuns(ALL_RUNS, { type, range }), [type, range]);
  const selectedRun = ALL_RUNS.find((r) => r.id === selectedRunId) ?? null;

  const closeDrawer = useCallback(() => setSelectedRunId(null), []);
  const closeSheet = useCallback(() => setPatternOpen(false), []);

  /** Empty-state recovery: apply the fix and keep focus inside the sheet, on its title. */
  const recover = (patch) => {
    if (patch.range) setRange(patch.range);
    if (patch.type) setType(patch.type);
    requestAnimationFrame(() => document.getElementById('sheet-title')?.focus());
  };

  return (
    <div className="app">
      <Header range={range} onRangeChange={setRange} />

      <main className="page" id="main">
        <PerformanceSummary story={story} range={range} />
        <PerformanceChart story={story} />
        <WhatChanged story={story} onOpenPattern={() => setPatternOpen(true)} />
        <NextStep story={story} />
        <RecentRuns key={range} runs={rangeRuns} selectedRunId={selectedRunId} onSelect={setSelectedRunId} />
      </main>

      <TrainingPatternSheet
        open={patternOpen}
        onClose={closeSheet}
        weeks={weeks}
        runs={patternRuns}
        type={type}
        range={range}
        onTypeChange={setType}
        onRangeChange={setRange}
        onRecover={recover}
        selectedRunId={selectedRunId}
        onSelectRun={setSelectedRunId}
      />
      <RunDetailDrawer run={selectedRun} onClose={closeDrawer} />
    </div>
  );
}
