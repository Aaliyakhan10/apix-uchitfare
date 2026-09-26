# UchitFare — Airfare Price Index Prototype

[![Python tests](https://github.com/Aaliyakhan10/apix-uchitfare/actions/workflows/tests.yml/badge.svg)](https://github.com/Aaliyakhan10/apix-uchitfare/actions/workflows/tests.yml)

**Smart India Hackathon 2026 · SIH26056 · Team BitSynq · Software**

UchitFare is a prototype for exploring how airfare observations could support a timely, explainable price index for India. It contains two distinct applications: a Next.js dashboard backed by reproducible synthetic sample APIs, and a separate Python/FastAPI research prototype with fare-processing and scraper modules.

The project explores automated airfare collection as a potential input to Consumer Price Index research. It is not an official MoSPI system.

> **Data and validation status:** The Next.js dashboard uses reproducible synthetic data and does not collect live fares. The Python prototype contains browser-scraping code, but automated tests mock browser behavior and do not verify current site access or coverage. Displayed sample fares, schedules, market shares, confidence scores and benchmark comparisons are illustrative. No official validation, regulatory findings or MoSPI approval is claimed.

[Project overview](#project-overview) · [Getting started](#getting-started) · [Architecture](#architecture) · [API reference](#api-reference) · [Tests](#tests) · [Data and methodology](#data-and-methodology)

## Project overview

Airfare varies by route, booking horizon and fare conditions. UchitFare explores a workflow for comparing those observations and aggregating them into a weighted index. The repository includes:

| Component | Purpose |
| --- | --- |
| Next.js dashboard | Browse generated fare examples, compare booking horizons, explore sample route metrics and trends, change calculator assumptions, and export a sample CSV. |
| Python/FastAPI research prototype | Explore fare cleaning, index calculation, reliability scoring, explainability, concentration screening, backtesting code, scraper adapters, reporting endpoints and SQLite persistence. |
| Supporting entry points | Root `app.py` serves the FastAPI app and optionally mounts Gradio; `daemon_30min.py` runs the prototype sync cycle; `apix_demo/frontend/index.html` is a legacy dashboard served by FastAPI. Deployment files include Docker, systemd and Hugging Face scaffolding. |
| Automated tests | Exercise calculation and API behavior with in-memory data and mocked browser results; no test depends on a live airline website. |

### SIH problem-statement fit

The SIH26056 framing in this repository is to improve airfare price observation for CPI analysis, especially across routes and booking horizons. The following maps those needs to current code and distinguishes a demonstration from production evidence.

| Need | Current codebase response | Evidence boundary / remaining work |
| --- | --- | --- |
| Compare routes and booking horizons | The dashboard presents 25 configured routes and five horizons; the Python prototype includes route data and Google Flights/Skyscanner scraper adapters. | Dashboard values are synthetic. Scraper tests mock browser results; current site access, permitted collection, route coverage and repeatable live capture are not validated. |
| Check and explain data quality | Python cleaning, reliability and explainability modules; API endpoints expose cleaning simulations and audit summaries. | Tests cover defined examples, not precision/recall on labelled real fares or production missing-data rates. |
| Calculate and inspect an airfare index | Python index and backtesting modules; dashboard trend and sensitivity views. | The dashboard history and calculator are generated demonstrations. Route weights, base period, window weights and methodology need independent source data and stakeholder review. |
| Surface concentration and price patterns | HHI and screening logic, route summaries, map and collusion-analysis endpoints. | These outputs are heuristic examples, not verified findings of overcharging, collusion or regulatory violations. |
| Provide analysis-ready output and refresh | Sample CSV/report endpoints and a Python 30-minute runner. | The dashboard CSV is synthetic and is not an approved MoSPI schema. The 30-minute runner currently executes a simulation; it does not establish live collection. Monitoring, provenance and schema approval remain open. |

Older mentor and judge dossiers contain design goals and claims beyond the runnable, tested evidence. Treat them as discussion material, not proof of official approval, live collection, measured DGCA accuracy or production readiness.

## Getting started

Choose the application you want to run. The dashboard and Python service are separate; the dashboard's sample APIs do not call the Python service.

### Next.js dashboard

Requires Node.js 22 or newer and npm. From the repository root:

```powershell
cd apix-dashboard
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To run a production build instead:

```powershell
npm run build
npm start
```

The dashboard's core sample workflow needs no Python backend or API keys. Initial dependency installation and external flight-search links require internet access. On Windows, `run_nextjs.bat` is also available from the repository root.

### Python API

Requires Python 3.12 or newer. From the repository root, create and activate a virtual environment, then install the project dependencies and start FastAPI:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn apix_demo.backend.main:app --reload --port 8001
```

Open [http://localhost:8001/docs](http://localhost:8001/docs) for the FastAPI OpenAPI interface. The service initializes its prototype dataset on startup and uses local SQLite storage by default. Browser-based scraper operations additionally need a Playwright Chromium installation:

```powershell
python -m playwright install chromium
```

Scraper tests use mocked pages and do not require Chromium or access to external sites. Use only data sources and collection methods you are authorized to access.

The production dashboard build uses webpack. A `pnpm-lock.yaml` is also provided; use one package manager consistently within a checkout.

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

### Formula catalog and implementation notes

This catalog records the calculations present in the Python research prototype and the separate Next.js demo. They are not one reconciled production pipeline: the dashboard serves generated data, and several Python outputs are simulations or fixed-parameter demonstrations.

#### Python fare generation and cleaning

`apix_demo/backend/data/generator.py` makes reproducible sample observations with seed 42. For a route, date, booking window and carrier, its expected fare is:

```text
fuel_rel       = (fuel_index - 100) / 100
demand_factor  = 1 + 0.12 * is_weekend + festival_surge
competition    = 0.94 if carriers >= 4; 1.00 if carriers are 2 or 3; 1.28 otherwise
carrier_factor = 1.05 for Air India; 0.97 for Akasa/SpiceJet; 1.00 otherwise
expected_fare  = base_fare * window_factor * demand_factor
                 * competition * carrier_factor * (1 + 0.32 * fuel_rel)
sample_fare    = expected_fare * Normal(1.0, 0.035)
```

The fuel index is a bounded random walk: each daily change is sampled from `Normal(0.08, 0.55)` and the result is clamped to 88-122. The generator drops about 4.5% of candidate records and injects controlled low/high outliers in about 0.8% of records. These are simulation parameters, not estimates from observed airline data. Booking-window multipliers are T+1 `1.95`, T+7 `1.28`, T+15 `1.00`, T+30 `0.84`, and T+45 `0.74`; window weights are respectively `0.15`, `0.30`, `0.25`, `0.20`, and `0.10`.

The Python cleaner in `engine/cleaning.py` applies these stages:

1. Deduplicate on whichever of route, date, window, carrier, total fare and departure time are present.
2. Calculate `fare_per_km = total_fare / distance_km` and a route/window median ratio `fare_to_median = fare / (median + 1e-5)`.
3. Mark fares `<= 500` or `> 120000` as structurally invalid.
4. If contamination is automatic, calculate the IQR outlier rate on the fare/median ratios using fences `Q1 - 2.5*IQR` and `Q3 + 2.5*IQR`, then clamp it to `[0.005, 0.035]`; use `0.012` when there are at most 10 ratios.
5. Fit a 100-tree `IsolationForest` (seed 42) on fare/km, fare/median ratio and total fare. A row is quarantined if the model marks it an outlier or it violates a structural bound.
6. Aggregate remaining rows by date, route and booking window using the median fare and component values.

The batch cleaner excludes quarantined records; it does not impute those records into the index. The single-record cleaning simulator instead demonstrates replacement with an assumed expected route/window fare. That UI simulation is not the batch cleaner's output. Fare component estimates use base `68%`, fuel `16%`, and taxes/UDF as the residual `total - base - fuel`; they are assumed splits, not independently parsed tax disclosures.

The single-record simulator uses a different structural ceiling (`> 100000`) and ratio checks (`fare/expected_median >= 2.5` or `<= 0.40`). Its reason labels distinguish non-positive fares, fares below 500, fares above 100000, ratios at least 3.2 or 2.2, and ratios at most 0.35. These simulator cutoffs do not replace the batch cleaner's limits.

#### Python index and reliability

For the cleaned median fare `P[r,t,w]`, route `r`, date `t`, and booking window `w`, the Python engine (`engine/apix_calculator.py`) calculates:

```text
CompositeFare[r,t] = sum_w(WindowWeight[w] * P[r,t,w])
PriceRelative[r,t] = CompositeFare[r,t] / BaseFare[r]
APIx[t]            = 100 * sum_r(RouteWeight[r] * PriceRelative[r,t])
```

The Python route weights in `backend/data/routes.json` sum to 1. Category sub-indices divide the weighted relative sum for that category by that category's total route weight, then multiply by 100. Each booking-window index is `100 * sum_r(RouteWeight[r] * P[r,t,w] / BaseFare[r])`. The weekly series is a trailing seven-row arithmetic mean, with shorter windows at the start of the series. The configured booking-window weights also sum to 1. These route and base-fare inputs are project configuration, not verified official passenger-kilometre weights.

The Python reliability score uses expected daily points `E = sum_r(carrier_count[r] * 5)` and observed input rows `A`:

```text
Confidence = min(100, 100 * A / E)
Status     = Optimal when score >= 90; Acceptable when >= 80; otherwise Degraded
```

Metro and regional confidence use the corresponding category's expected points. It is a completeness proxy; it does not assess quote correctness, source independence or sampling bias.

#### Explainability and concentration

The Python explanation model fits linear regression on four features: fuel-index change from 100, a demand-surge flag, carrier count, and booking-window days. Its target is `100 * (fare / route_median_fare - 1)`. For a fitted coefficient `beta[j]`, feature value `x[j]` and training mean `mean[j]`:

```text
AttributionPct[j] = beta[j] * (x[j] - mean[j])
AttributionINR[j] = baseline_fare * AttributionPct[j] / 100
ResidualINR       = current_fare - baseline_fare - sum(AttributionINR[j])
```

If the model is not fitted, the module uses hard-coded coefficients and feature means. The residual forces the rupee amounts to reconcile to the supplied fare change; this is a linear-model explanation on prototype/synthetic inputs, not a validated causal decomposition.

Carrier shares in the Python engine are calculated from counts of cleaned quote rows per route, not seats sold or passenger capacity. The concentration measure and screen are:

```text
Share[i]       = quote_count[i] / sum_i(quote_count[i])
HHI            = sum_i((100 * Share[i]) ** 2)
FarePerKM      = route_median_fare / route_distance_km
MarkupRatio    = FarePerKM / category_median_fare_per_km
Flagged        = (HHI >= 2500) and (MarkupRatio >= 1.25)
```

Classification thresholds are HHI 1500 (moderate), 2500 (high), and 5000 (single-dominant/monopoly label); alert severity is high at markup `>= 1.50` or HHI `>= 6000`. These are prototype screens, not findings about competition law. The Next.js sample uses configured carrier-share scenarios and assumed fare/km benchmarks, not quote counts.

#### Passenger-class and methodology scenarios

The Python passenger-class response applies fixed multipliers (`0.985` economy, `1.024` premium economy, `1.113` business, `0.856` concessional) to the headline index. It computes `class_fare = class_base_fare * class_index / 100` and a fixed-surge burden `3000 / class_fare * 100`. Class shares and multipliers are illustrative; the configured shares sum to 108%, so they are not a normalized passenger basket.

The index-number formulas that a full methodology comparison would use are:

```text
Laspeyres = 100 * sum_i(base_weight[i] * price_relative[i])
Jevons    = 100 * exp(sum_i(weight[i] * ln(price_relative[i])))
Paasche   = 100 * sum_i(current_price[i] * current_quantity[i])
                  / sum_i(base_price[i] * current_quantity[i])
Fisher    = sqrt(Laspeyres * Paasche)
```

Only the weighted Laspeyres-style route calculation is implemented from fare relatives in the Python engine. Its methodology API labels Jevons and Fisher modes but applies fixed factors `0.982` and `0.991` to a reweighted index; it does not calculate geometric relatives or a Paasche index from quantities. The Next.js methodology API also returns metro/regional reweighting, but its formula-specific adjusted value is unused in the response. Therefore those selectors are sensitivity demonstrations, not implementations of Jevons or Fisher formulas.

The Next.js calculator is a separate fixed-assumption scenario. With metro share `m` as a fraction, fuel shock `s` in percent, cleaning toggle `c`, and class choice `k`:

```text
WeightedBase = 168.21*m + 159.11*(1-m)
FuelFactor   = 1 + 0.16*s/100
CleaningAdj  = 0 when cleaning is on; otherwise 8.65 index points
ClassAdj     = -1.25 for common, +4.80 for executive, otherwise 0
Scenario     = WeightedBase*FuelFactor + CleaningAdj + ClassAdj
Delta        = Scenario - 165.48
CPIImpact    = Delta * 0.038
```

The constants and CPI factor are UI assumptions, not fitted relationships or official CPI weights.

#### Backtest calculations and benchmark provenance

The Python backtest reports Pearson correlation, mean absolute percentage error and root mean square error:

```text
Pearson r = corr(predicted_APIx, benchmark)
MAPE      = 100 * mean(abs((benchmark - predicted_APIx) / benchmark))
RMSE      = sqrt(mean((predicted_APIx - benchmark) ** 2))
```

Despite the variable names, `engine/backtesting.py` constructs its comparison series in code: for June-August 2026 it starts from fixed monthly values `104.5`, `107.8`, and `114.2`, then computes `benchmark = monthly_value + 0.82*(APIx - monthly_value) + Normal(0, 0.45)`. Other months use a default monthly value of `110` for the daily curve. Consequently the metrics and pass labels are synthetic and are not backtesting against ingested DGCA observations. The dossier's reported accuracy figures must not be treated as measured results.

#### Next.js synthetic history and CSV

The dashboard's 90-day history is generated independently in `src/data/mockData.ts`. With day index `i` and progress `p = i/89`, it uses `trend = 102.5 + (165.48 - 102.5)*p`, adds `sin(0.28*i)*1.8*(1 - 0.3*p)`, adds `+1.1` on weekends or `-0.4` on weekdays, then adds a fixed festival bump. The last headline value is forced to `165.48`. The fuel series is `100 + 14.20*p + sin(0.2*i)*0.8*(1 - 0.4*p)`; non-final metro and regional series are `1.0165*headline` and `0.9615*headline`. Non-final comparison and confidence series use `0.992*headline + 0.4*cos(0.4*i)` and `95 + 1.8*sin(0.3*i)`, respectively; the last comparison/confidence values are fixed at `164.20` and `96.1`.

Dashboard horizon-index multipliers are T+1 `1.58`, T+7 `1.15`, T+15 `1.00`, T+30 `0.88`, and T+45 `0.76`. These differ from the fare-window multipliers `1.95`, `1.28`, `1.00`, `0.84`, and `0.74` used for sample quote and CSV construction; neither series is recomputed from the other.

The dashboard's separate explainability example uses `current_fare = round(base_fare * window_multiplier * 1.16)`. It allocates the fare difference as `fuel = 0.28*delta`, `surge = 0.45*delta`, `competition = -0.12*delta`, and `booking_window = base_fare*(window_multiplier - 1)`; the residual is the amount needed to sum exactly to the fare difference. These are fixed allocations, not learned or causal attributions.

Sample carrier shares are assigned from the configured carrier count rather than collected observations: one carrier gets 100%; two get 62.5/37.5%; three get 45/35/20%; five get 36/26/18/12/8%; other counts use 42/28/18/12 for the first four positions. The dashboard squares these percentages for HHI and applies its sample flag rule; these scenarios are not market-share measurements.

For each of the last 30 dates, route and window, the sample CSV uses:

```text
Fare       = round(route_base_fare * fare_window_multiplier * daily_APIx / 100)
Base       = round(0.68 * Fare)
Fuel       = round(0.16 * Fare)
Taxes/UDF  = Fare - Base - Fuel
Relative   = Fare / route_base_fare
Contribution = 100 * Relative * (route_weight / sum_route_weights) * window_weight
```

That yields 30 * 25 * 5 = 3,750 rows. It is a generated export, not the calculation source for the headline history and not an approved MoSPI import schema.

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

The dashboard uses **Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts and Lucide**. Its same-origin APIs serve generated examples. Setting `NEXT_PUBLIC_API_URL` does not connect it to the Python service; that integration would need to be implemented and verified.

The Python/FastAPI service contains research modules under `apix_demo/backend/engine`, scraper adapters under `apix_demo/backend/scraper`, route data under `apix_demo/backend/data`, and SQLite-backed persistence. It is a separate prototype; running it does not make the Next.js dashboard live. The root `daemon_30min.py` calls `run_one_click_sync()`, which currently invokes the generated-data simulation; it is not a live-collection scheduler. A separate real-scrape pathway can use the browser adapters, but it falls back to simulation if a scrape errors or returns no listings. `app.py` optionally mounts Gradio when installed. Docker and systemd files are deployment scaffolding and are not covered by the tests described here.

## API reference

### Next.js sample API

These endpoints are served by the Next.js app at `http://localhost:3000` and return sample data.

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
| GET | `/api/anomalies`, `/api/explainability`, `/api/collusion` | Generated anomaly, attribution and concentration examples |
| GET | `/api/advisor/best-time-to-book`, `/api/network/map`, `/api/reports/bulletin` | Generated advisory, route-map and bulletin responses |
| POST | `/api/methodology/recalculate` | Reweighted sample series; see the formula catalog for mode limitations |

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

### Python service API

The separate FastAPI service exposes interactive documentation at `http://localhost:8001/docs`. Key endpoints include:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/overview`, `/api/index/history`, `/api/routes`, `/api/routes/{route_id}` | Prototype summary, history and route analysis |
| GET | `/api/classes/breakdown`, `/api/explainability`, `/api/anomalies`, `/api/cleaning/anomalies`, `/api/cleaning/stats` | Passenger classes, attribution and cleaning audit data |
| POST | `/api/cleaning/simulate`, `/api/methodology/recalculate` | Cleaning and index sensitivity demonstrations |
| GET | `/api/collusion`, `/api/routes/flagged`, `/api/network/map`, `/api/advisor/best-time-to-book` | Concentration screens, map and booking advice |
| GET | `/api/backtesting`, `/api/backtesting/30-days`, `/api/backtesting/dgca-compare` | Prototype comparisons; not independent official validation |
| GET | `/api/reports/bulletin`, `/api/export/cpi` | Generated report and CSV export |
| GET / POST | `/api/scraper/live`, `/api/scraper/trigger`, `/api/pipeline/one-click-sync` | Scraper and pipeline controls; may access external sources or fall back to simulation |
| GET / POST | `/api/scraper/sources`, `/api/scraper/cache-stats`, `/api/scraper/captcha-stats`, `/api/scraper/clear-cache`, `/api/scraper/captcha-solve` | Scraper source, cache and CAPTCHA utilities |
| GET | `/api/database/stats`, `/api/database/quotes` | Local SQLite statistics and stored quote samples |
| POST | `/api/llm/format` | Prototype output formatting endpoint |

Python scraper endpoints may access external sources and are not called by the Next.js sample dashboard. The Python backtesting module currently compares against generated benchmark values; its output is not independent official validation.

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
app.py                           FastAPI entry point; optional Gradio mount
daemon_30min.py                  Simulation-backed 30-minute sync runner
run_demo.py                      Python demo runner
test_captcha_pipeline.py         CAPTCHA pipeline check
test_scale_benchmark.py          Scale benchmark script
verify_system_integrity.py       System integrity checks
apix-dashboard/
  src/app/page.tsx              Main evaluator dashboard
  src/app/api/                  Same-origin generated sample endpoints
  src/components/               Fare, calculator, route, anomaly and analysis views
  src/data/                     Route basket, generated history and API client
  src/i18n/                     Interface translations
  scripts/smoke-demo.mjs         End-to-end API smoke test
apix_demo/backend/
  main.py                       FastAPI application and HTTP API
  data/                          Route definitions, generator and SQLite storage
  engine/                        Cleaning, index, reliability and analysis modules
  scraper/                       Browser adapters, orchestration, cache and CAPTCHA tools
apix_demo/frontend/index.html   Legacy HTML dashboard served by FastAPI
tests/                           Python unit, API and mocked-scraper tests
deployment/                      Hugging Face and systemd deployment files
Dockerfile.* / docker-compose.yml Container build and orchestration files
run_nextjs.bat                  Windows submission-demo launcher
deploy.bat / deploy.sh           Windows and Unix deployment helpers
SUBMISSION_GUIDE.md             Five-minute walkthrough, scope and checklist
```

Older mentor and judge dossiers describe earlier designs and aspirational capabilities; use this README and the submission guide for the current demo scope and evidence limits.

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

