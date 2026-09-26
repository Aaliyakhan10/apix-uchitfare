# UchitFare — submission demo

Team: BitSynq · Problem statement: SIH26056 · Category: Software

## Run

Use Node.js 22 with npm. A pnpm lockfile is also included for the dependency set tested here (`pnpm install --frozen-lockfile`). On Windows, double-click `run_nextjs.bat`. It installs missing dependencies, builds the dashboard, and starts http://localhost:3000. Alternatively run `npm ci`, `npm run build`, and `npm start` inside `apix-dashboard`. Install and build before the presentation; the core demo then runs without internet or a Python backend. External flight-search links still require internet.

## Five-minute judge walkthrough

1. **Context (30 seconds):** explain why changing booking horizons complicate airfare inflation measurement. Point out the sample-data disclosure and the 25-route basket.
2. **Inspect fares (60 seconds):** choose Delhi–Mumbai and compare T+1 with T+45. Expand a fare to inspect its assumed base, fuel and tax decomposition. Explain that these are generated examples, not bookable quotations.
3. **Change assumptions (60 seconds):** open the calculator, adjust metro weight and fuel shock, toggle cleaning, then reset. Explain that this is a sensitivity simulation, not a fitted causal model.
4. **Explore routes (45 seconds):** filter regional routes and search BOM-IXU. Inspect the concentration and price markup. These are screening examples, not findings against an airline.
5. **Compare trends (45 seconds):** select booking horizons and metro/regional comparisons. The sample series covers 90 days ending 8 September 2026. Benchmark comparisons are illustrative.
6. **Deliver output (30 seconds):** download the sample CPI CSV. It contains 30 days × 25 routes × 5 windows = 3,750 rows, plus a header and an explicit synthetic-data column. Refresh Demo reloads the sample APIs and reports errors if a request fails.

## Scope and evidence

| Brief capability | Submission demonstration | Remaining production work |
| --- | --- | --- |
| 25 routes, five booking horizons | Route browser and generated fare samples | Validate route basket and passenger-distance weights against dated source data |
| Index and reliability | Sample time series and sensitivity calculator | Connect audited observations and measure missing-data coverage |
| Cleaning | Interactive cleaning-impact scenario; Python prototype in repository | Validate outlier precision on labelled real fare records |
| Explainability and concentration | Assumption-based explanations and HHI screening examples | Fit and validate an attribution model; validate market shares |
| CPI integration | Downloadable CSV with provenance | Agree schema, base period and methodology with intended users |
| Automated collection | Separate Python scraper prototype | Verify permitted sources, blocking handling, cadence, and dated collection evidence |
| Official backtesting | Illustrative reference comparisons only | Independently source official observations and calculate reproducible metrics |

The attached brief is design context, not evidence that the proposed capabilities already work. The existing Python service is preserved separately; this demo intentionally uses same-origin sample endpoints so presentation results do not depend on external websites. The dashboard does not establish MoSPI approval, verified DGCA benchmarks, production readiness, or live scraping coverage.

## Before uploading or recording

- Run the production build and `node scripts/smoke-demo.mjs` while the server is running.
- Open all four views, change a route and horizon, reset the calculator, and download the CSV.
- Confirm team name and team ID in the actual submission form; no team ID was supplied in the attached brief.
- Record the walkthrough with the sample-data disclosure visible. Attach dated source evidence separately if making any live-collection claims.
- Upload source without `node_modules`, `.next`, credentials, local databases or cache files. Do not present the older dossier's approval/performance claims as measured evidence.
