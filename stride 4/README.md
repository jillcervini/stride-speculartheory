# Stride — Running Performance Prototype

Stride is a clickable prototype that helps a serious recreational runner answer one question: **"Am I actually getting better?"** It reads eight weeks of runs, explains what changed, and suggests what to try next.

## How to review it

You don't need any accounts, purchases or hosting.

- **Quickest:** open **`stride-prototype.html`** in any browser by double-clicking it. It's a self-contained build of this source and works offline.
- **From source:** you need Node.js 18 or newer. In this folder, run:
  ```bash
  npm install
  npm run dev
  ```
  Then open http://localhost:5173.

## Where the code lives

Everything is in **`src/`**:

| File or folder | What it does |
|---|---|
| `components/Dashboard.jsx` | The page. Holds all the app's state (selected date range, run-type filter, which panel is open) and lays out the sections. |
| `components/` | One file per part of the page: summary, pace chart, "What changed?", "Try this next", recent runs, training calendar, run drawer, empty state. |
| `lib/metrics.js` | The logic. Plain functions that turn the runs into the headline, comparisons and recommendation. |
| `data/runs.js` | The 35 sample runs. |
| `data/config.js` | Date ranges, run types and on-screen wording. |
| `styles/global.css` | All styling. Colors and spacing are set at the top of the file. |

Built with React and Vite. No other libraries; the chart is hand-built.

## What works vs. what's mocked

- **Works:** changing the date range updates every section; the training calendar and its run-type filter; the run detail drawer; the empty state (Tempo + Last 2 weeks) and its "Show last 4 weeks" button; keyboard navigation.
- **Mocked:** all data is fictional and built into the app. There's no backend, login, saving or network, so there are no loading or error states.

## Limitations and assumptions

- The data is designed to tell one story: mileage rises, pace peaks in week 4, then slows.
- "Recovery opportunity" rules are simple checks on rest days, not validated coaching advice.
- Desktop-first. It works on phones but isn't optimized for them.
- Known accessibility gaps: chart tooltips are mouse-only, and Safari needs Option+Tab to reach buttons.

## More context

For a short overview, see [`docs/engineering-readme.pdf`](docs/engineering-readme.pdf) (handoff notes) and [`docs/design-and-ai-process.pdf`](docs/design-and-ai-process.pdf) (design decisions and process).
