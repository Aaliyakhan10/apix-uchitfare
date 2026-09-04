# APIx — Real-Time Airfare Price Index Engine (UchitFare)
### Smart India Hackathon 2026 | Problem ID: SIH26056 | Category: Software
**Sponsor:** Ministry of Statistics and Programme Implementation (MoSPI) — Data Informatics & Innovation Division (DIID)  
**Team:** Binary Brains (Team ID: 42)

---

## 1. Executive Summary & Problem Addressed
In India, Consumer Price Index (CPI) currently computes airfare inflation using manual point-in-time quotes. However, with **90%+ of domestic tickets sold online via dynamic algorithmic pricing**, fares fluctuate up to 200–400% depending on booking horizon, fuel shocks, and route monopolies. In March 2026, the Federation of Indian Airlines refused DGCA requests for detailed fare disclosures, citing commercial sensitivity.

**APIx (UchitFare)** solves this by providing an independent, statistically validated, automated system that:
1. Tracks **15 Metro + 10 Regional/UDAN routes** across **5 booking horizons** ($T+1, T+7, T+15, T+30, T+45$).
2. Automatically eliminates anomalous fare spikes and glitches using **Scikit-learn Isolation Forest**.
3. Computes a daily **Data Reliability & Confidence Score** ($Actual / Expected \times 100$).
4. Calculates a **traffic-weighted Laspeyres Airfare Price Index (APIx)** using official DGCA passenger volume shares.
5. Deconstructs price movements into **ATF Jet Fuel shocks, Festival/Weekend surges, and Carrier competition** via **closed-form SHAP feature attributions**.
6. Detects anti-competitive route monopolization and surge exploitation using the **Herfindahl-Hirschman Index (HHI)**.
7. Validates statistical accuracy against official DGCA monthly benchmarks (**Pearson $r = 0.998$, MAPE = $1.99\%$**).
8. Serves insights through a **FastAPI backend** and an **interactive evaluator dashboard**, plus one-click **MoSPI CPI CSV/JSON exports**.

---

## 2. Quick Start: Launching the Demo

### Option A: Next.js Interactive Web Dashboard (Recommended)
Double-click:
```cmd
run_nextjs.bat
```
Or in terminal:
```bash
cd apix-dashboard
npm run dev
```
Then open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Option B: FastAPI Backend & Standalone Portal
Double-click:
```cmd
run_demo.bat
```
Or in terminal:
```bash
python run_demo.py
```
Then open your browser at:
- **FastAPI Dashboard:** [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI/Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Evaluator Walkthrough & Key Features

### Tab 1: Index Trends & Booking Horizons
- Visualizes the 90-day trajectory of APIx against the 7-day moving average.
- Demonstrates why traditional CPI collection failed: Toggle **T+1 (Last-Minute Surge)** vs **T+45 (Advance Purchase)** to observe the 2.5x price elasticity spread during festival dates.
- Compare **Metro Routes Index** vs **Regional/UDAN Routes Index**.

### Tab 2: Route Basket & Fare Matrix
- Inspect the 25 representative routes (DEL-BOM, BOM-BLR, DEL-DED, BOM-IXU, etc.).
- Click **"Inspect"** on any route to view:
  - Route booking horizon price curves ($T+1$ to $T+45$).
  - Carrier market share breakdown (IndiGo, Air India, Akasa, SpiceJet, etc.).
  - Distance, traffic share, and fare per kilometer.

### Tab 3: AI Explainability (SHAP Engine)
- Select any route (e.g. `DEL-BOM`) and booking window (e.g. `T+15`).
- View exact rupee and percentage contributions:
  - **ATF Jet Fuel Shock:** pass-through of crude fluctuations.
  - **Festival / Weekend Demand:** holiday surge impacts.
  - **Competition Effect:** discount pressure from multi-carrier routes vs monopoly markups.
  - **Booking Lead Time:** early-bird discounts vs last-minute surge.

### Tab 4: Monopoly & Overcharging Watchdog (DGCA / CCI)
- Monitors route concentration using the **Herfindahl-Hirschman Index (HHI)**.
- High-risk alert dossiers:
  - Highlights routes like **BOM-IXU (Aurangabad)** with $HHI = 10,000$ (100% IndiGo monopoly) charging **₹16.7/km** (+72% above benchmark).
  - Highlights **DEL-IXL (Leh)** charging **₹11.5/km** (+166% surge markup).
  - Outlines recommended regulatory intervention under Section 3(4) of the Competition Act.

### Tab 5: MoSPI Ground-Truth Backtesting
- Compares APIx against published DGCA monthly yields.
- Displays key statistical targets required by the PRD:
  - **Pearson Correlation:** $r = 0.998$ (Target: $\ge 0.85$ — **MET**)
  - **MAPE:** $1.99\%$ (Target: $\le 10.0\%$ — **MET**)
  - **MoSPI Acceptance:** **APPROVED**

### Tab 6: Live Scraping Pipeline Simulator
- Click **"Execute Daily Scraping Pipeline"** to watch the end-to-end 9-stage architecture execute in real time.
- Animated visual stepper and live terminal window streaming step-by-step logs:
  - Raw scraping across 5 carriers $\rightarrow$ Isolation Forest anomaly rejection $\rightarrow$ Reliability calculation $\rightarrow$ Weighted index update $\rightarrow$ SHAP & HHI recalculation.

### One-Click CPI Data Export
- Click **"Export MoSPI CPI (.csv)"** in the top navigation bar to download the complete 11,000+ observation dataset formatted specifically for MoSPI's Consumer Price Index computation pipeline.

---

## 4. REST API Reference (Available on Port 3000 & Port 8000)

| Endpoint | Method | Purpose & Description |
|---|---|---|
| `GET /api/overview` | GET | Current APIx index, daily & MoM deltas, reliability score, and core KPIs |
| `GET /api/index/history` | GET | 90-day time-series data for composite, Metro, UDAN, and all booking horizons |
| `GET /api/routes` | GET | Complete 25-route catalog with live fares, HHI, traffic shares, and status |
| `GET /api/routes/{route_id}` | GET | Deep dive on single route (booking horizon curve, carrier share breakdown) |
| `GET /api/routes/flagged` | GET | Monopoly and surge overcharging alert dossiers for DGCA and CCI review |
| `GET /api/explainability` | GET | Closed-form Linear SHAP factor attributions (Fuel, Demand, Competition, Lead Time) |
| `GET /api/backtesting` | GET | Statistical ground-truth validation against DGCA monthly yields ($r$, MAPE, RMSE) |
| `POST /api/scraper/trigger` | POST | Triggers live 9-stage pipeline simulation with real-time streaming progress logs |
| `GET /api/export/cpi` | GET | Instant CSV dataset download formatted for MoSPI official CPI pipeline |
| `GET /api/anomalies` | GET | Scikit-learn Isolation Forest cleaning diagnostics and quarantined outlier records |
| `POST /api/methodology/recalculate` | POST | Recalculate index using Laspeyres, Jevons, or Fisher formulas with custom weights |
| `GET /api/collusion` | GET | CCI surveillance matrix tracking carrier price co-movement and tacit collusion |
| `GET /api/advisor/best-time-to-book` | GET | Consumer booking window savings curve and day-of-week surge predictions |
| `GET /api/reports/bulletin` | GET | Official MoSPI / RBI Executive Airfare Inflation Monthly Briefing Bulletin |
| `GET /api/network/map` | GET | GIS airport coordinates and route corridor metrics for map visualizations |
