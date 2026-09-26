# UchitFare — Airfare Price Index for India

**Smart India Hackathon 2026 · SIH26056 · Team BitSynq · Software**

UchitFare explores how airfare observations can support a more timely, explainable price index for India. Its **APIx** dashboard lets evaluators compare booking horizons, inspect route-level fares and concentration, test pricing assumptions, and export a sample dataset for CPI research.

The project addresses the problem statement on automated airfare collection for augmentation of the Consumer Price Index, associated with the **Ministry of Statistics and Programme Implementation (MoSPI)**.

> **Demo status:** The submission dashboard uses reproducible **synthetic data**. It runs independently of the Python service and requires no API keys. Displayed fares, schedules, market shares, confidence scores and benchmark comparisons are illustrative. This prototype does not establish live collection coverage, official validation, regulatory findings or MoSPI approval.

[Quick start](#quick-start) · [Demo walkthrough](#demo-walkthrough) · [Data and methodology](#data-and-methodology) · [API reference](#demo-api-reference) · [Verification](#verification) · [Submission guide](SUBMISSION_GUIDE.md)

## Why UchitFare?

Airfare depends on when a traveller books, which route they choose, and the fare conditions being compared. A price index needs a consistent observation basket to distinguish those differences from price movements over time.

UchitFare demonstrates that workflow through four connected views:

| View | What you can demonstrate |
| --- | --- |
| **Fare auditor** | Select a route and booking horizon; compare sample carrier quotes, sort results, and inspect assumed fare components. |
| **Sensitivity calculator** | Adjust metro/regional weights, fuel shock, cleaning assumptions and passenger mix; observe the index change immediately. |
| **Route registry and HHI** | Search and filter 25 routes; examine assumed carrier shares, concentration and fare markups. |
| **Trend dashboard** | Explore a 90-day sample series, booking-horizon comparisons and metro/regional movements. |

The dashboard also provides sample CSV export and a **Refresh Demo** action that reloads local data. It does not scrape external websites when refreshed.

## Quick start

### Prerequisites

- **Node.js 22 or newer**, with npm.
- Internet access for the initial dependency installation.
- A browser and an available local port, normally `3000`.

Python, a database server and API credentials are **not required** for the submission dashboard. After installation and a successful build, its core workflow runs locally without internet. External flight-search links require an internet connection.

### Run the submission demo

From the repository root:

```sh
cd apix-dashboard
npm ci
npm run build
npm start
```

Open **[http://localhost:3000](http://localhost:3000)**. Keep the terminal running; press **Ctrl+C** to stop the server.

On Windows, you can instead double-click [`run_nextjs.bat`](run_nextjs.bat). The launcher installs dependencies if the Next.js package is missing, builds the dashboard, and starts the production server. It stops and displays an error if setup or compilation fails.

The build script uses webpack because Turbopack encountered a CSS worker error on the tested Windows environment.

### Develop locally

After installing dependencies, run this from `apix-dashboard`:

```sh
npm run dev
```

If the same Turbopack worker issue occurs during development:

```sh
npm run dev -- --webpack
```

A `pnpm-lock.yaml` is also included for the dependency set used in the demo verification. If choosing pnpm, use `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm start`. Use one package manager consistently within a checkout.

## Demo walkthrough

Allow approximately five minutes. The buttons in the introduction panel jump between the four views.

1. **Inspect fares.** Choose **DEL–BOM** and compare **T+1** with **T+45**. Explain the difference between a rupee fare and an index value. The quoted flights and fare components are generated examples.
2. **Change assumptions.** Open the calculator and set the fuel shock to **+25%**. With the default weights, cleaning enabled and standard passenger mix, the sample index changes from **165.48 to 172.10**. Reset the assumptions afterward.
3. **Explore routes.** Filter regional routes or search **BOM-IXU**. Inspect the assumed market concentration and sample markup. An HHI alert is a screening example, not evidence of unlawful pricing.
4. **Compare trends.** Open the 90-day view and compare the composite index with metro/regional or booking-horizon series.
5. **Export and refresh.** Download the sample CSV, then select **Refresh Demo**. The refresh log explicitly identifies the dataset as synthetic.

See [SUBMISSION_GUIDE.md](SUBMISSION_GUIDE.md) for presentation timing, the scope-to-brief mapping and the pre-submission checklist.

## Data and methodology

### Sample coverage

| Property | Current demo |
| --- | --- |
| Route basket | 25 routes: 15 metro and 10 in the regional/UDAN category |
| Booking horizons | T+1, T+7, T+15, T+30 and T+45 days from the sample reference date |
| Time series | 90 daily observations ending **8 September 2026** |
| Headline sample index | **165.48**, against an illustrative base of 100 |
| Default calculator mix | 70% metro, 30% regional |
| CSV export | Latest 30 sample days × 25 routes × 5 horizons = **3,750 rows**, plus a header |
| Provenance | Sample fare and overview APIs identify synthetic data; every CSV row includes `Data_Mode=synthetic_demo` |

“Regional/UDAN” is the demo's grouping label; it does not mean every route in that category is a verified subsidized UDAN service. Carrier names and airport codes provide recognizable examples, not confirmation of actual schedules or market shares.

### Index and sensitivity model

The intended index concept combines price relatives with normalized basket weights:

```text
Price relative = comparable current fare / base-period fare
Index = 100 × Σ(weight × price relative), with Σ(weight) = 1
```

The current dashboard history is a generated scenario. It is not reconstructed from independently collected fare observations. The sensitivity calculator applies the following explicit assumptions:

```text
Weighted baseline = metro index × metro share + regional index × regional share
Scenario index = weighted baseline × (1 + 0.16 × fuel shock / 100)
                 + cleaning adjustment + passenger-mix adjustment
```

Fuel share, cleaning distortion, passenger-mix adjustments and the displayed CPI impact factor are demo assumptions. They are not fitted causal effects or verified official CPI weights.

### Market concentration

HHI is calculated from the sample carrier shares:

```text
HHI = Σ(carrier percentage share²)
```

Shares sum to 100% for each route. A single carrier with 100% share produces an HHI of 10,000. The sample screening rule flags routes with **HHI ≥ 2,500** and a fare-per-kilometre markup of **at least 25%** above the assumed benchmark. These are demonstration thresholds; alerts are not sent to regulators.

### CSV interpretation

The export includes date, route, category, booking window, route weight, fare components, total fare, price relative, weighted contribution and provenance. Fuel and base-fare components use assumed proportions; taxes are the remainder so the components sum to the total.

The contribution calculation normalizes route weights and applies booking-window weights. The `Traffic_Weight` column retains the configured route weight. CSV fare scenarios and the headline history are separate illustrative constructions; their aggregates should not be presented as a reconciled official index or an approved MoSPI import schema.

Displayed correlation and error metrics are illustrative values, not independently reproduced DGCA backtesting results. The Python prototype and older technical dossiers do not change this evidence boundary.

## Architecture

```text
Browser: Next.js / React dashboard
  ├── Local sensitivity calculations
  └── Same-origin Next.js API routes
        ├── Synthetic history and route basket
        ├── Generated fare examples
        └── Sample CSV export

Separate research prototype in the full repository
  Python / FastAPI → collection, cleaning, indexing and SQLite modules
```

The submission dashboard uses **Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts and Lucide icons**. Its API calls stay on the same origin. Setting `NEXT_PUBLIC_API_URL` does not switch the current dashboard to live backend data; live integration requires implementation and verification.

The full repository also contains a Python/FastAPI prototype with analytical modules, scraper adapters and SQLite storage. It is preserved for further development and is not needed for the demo or included in the standalone dashboard submission ZIP. Docker and systemd files are deployment scaffolding; those deployment paths were not verified as part of the submission demo checks.

## Demo API reference

These endpoints are served by the Next.js app at `http://localhost:3000`.

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/overview` | Sample index, date, coverage and summary metrics |
| GET | `/api/index/history` | 90-day generated index series |
| GET | `/api/routes` | 25 sample route summaries, carrier shares and HHI |
| GET | `/api/routes?flagged=true` | Routes meeting the sample screening rule |
| GET / POST | `/api/scraper/live` | Generated fare records for a supported route and horizon |
| POST | `/api/scraper/trigger` | Sample snapshot response; reports zero records scraped |
| GET | `/api/export/cpi` | Downloadable `uchitfare_sample_cpi.csv` |
| GET | `/api/backtesting` | Illustrative comparison data, marked `ILLUSTRATIVE_ONLY` |

The `/scraper/live` name is retained from the earlier prototype; it does **not** indicate live collection in this demo. The Next.js app has no `/docs` Swagger page; interactive FastAPI documentation belongs to the separate Python service.

Example POST body for `/api/scraper/live`:

```json
{
  "origin": "DEL",
  "destination": "BOM",
  "window": "T+7"
}
```

For a browser-friendly GET request, encode the plus sign:

[Sample DEL–BOM fares at T+7](http://localhost:3000/api/scraper/live?origin=DEL&destination=BOM&window=T%2B7)

Unsupported routes or booking horizons return HTTP `400`.

## Verification

With the production server running, open a **second terminal**:

```sh
cd apix-dashboard
npm run test:demo
```

The smoke test checks all **125 route/horizon combinations**, non-empty sample responses, fare-component totals, carrier shares, HHI calculations, the 90-day history, invalid-route rejection, CSV row count and provenance, and the homepage disclosure.

| Check | Recorded result during demo preparation |
| --- | --- |
| Production build and TypeScript checks | Passed |
| Demo API smoke test | Passed |
| Browser interaction checks | Route/horizon changes, calculator adjustment/reset, view navigation and refresh exercised |
| ESLint on selected changed dashboard files | No errors on the checked revision; warnings remain |
| Live scraper, official benchmarks and cloud deployment | Not validated |

For static analysis, `npm run lint` runs the project's ESLint configuration. The repository is not claimed to be warning-free. Smoke-test success verifies the sample workflow, not economic accuracy or production readiness.

To test another port in PowerShell:

```powershell
$env:DEMO_URL = "http://localhost:3001"
npm run test:demo
```

## Repository guide

```text
apix-dashboard/
  src/app/page.tsx              Main evaluator dashboard
  src/app/api/                  Next.js sample endpoints
  src/components/               Fare inspector, calculator and supporting views
  src/data/                     Route basket, generated history and API client
  src/i18n/                     Interface translations
  scripts/smoke-demo.mjs         End-to-end API smoke test
apix_demo/backend/              Separate Python research prototype
apix_demo/frontend/             Earlier standalone portal
deployment/                    Deployment scaffolding (full repository)
run_nextjs.bat                  Windows submission-demo launcher
SUBMISSION_GUIDE.md             Five-minute walkthrough and checklist
```

Older mentor and judge dossiers in the full repository describe earlier designs and aspirational capabilities. Use this README and the submission guide for the current demo scope.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| `npm` is not recognized | Install Node.js with npm, reopen the terminal, then check `node --version` and `npm --version`. |
| Port 3000 is occupied | Start with `npm start -- --port 3001`, open that URL, and set `DEMO_URL` accordingly for tests. |
| `npm start` cannot find a production build | Run `npm run build` successfully before starting. |
| Turbopack reports a worker error in development | Run `npm run dev -- --webpack`. The production build already uses webpack. |
| Dependency installation fails | Check registry connectivity and install using the chosen package manager's lockfile. |
| Smoke test reports a connection error | Keep the server running in a separate terminal and confirm the test URL matches its port. |
| Sample date stays at September 2026 | This is intentional: the snapshot is fixed for reproducible evaluation. |
| Sample fares differ from an airline website | They are generated examples, not quotes retrieved from that website. |

## Before submission

Run the build and smoke test on the presentation machine, rehearse the walkthrough, and confirm the team details in the submission form. Keep the synthetic-data disclosure visible when recording the demo.

A production extension would require dated, auditable fare observations; validated basket and passenger-distance weights; measured missing-data coverage; independently sourced benchmark comparisons; and tested deployment and collection behavior. Those are future validation tasks, not claims made by this demo.
