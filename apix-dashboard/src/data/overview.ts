import { HISTORICAL_SERIES, FLAGGED_ALERTS } from "./mockData";
import { ROUTES } from "./routes";
const latest = HISTORICAL_SERIES.at(-1)!;
const previous = HISTORICAL_SERIES.at(-2)!;
export const DEMO_OVERVIEW = {
  data_mode: "synthetic",
  current_apix: latest.apix,
  base_period_apix: 100,
  day_change: Number((latest.apix - previous.apix).toFixed(2)),
  overall_change: Number((latest.apix - 100).toFixed(2)),
  latest_date: latest.date,
  confidence_score: latest.confidence_score,
  reliability_status: "Sample coverage",
  metro_apix: latest.apix_metro,
  regional_apix: latest.apix_regional,
  monitored_routes_count: ROUTES.length,
  flagged_routes_count: FLAGGED_ALERTS.length,
  backtest_correlation: 0.9982,
  backtest_mape: 1.99,
  last_sync_display: "Sample: 08 Sep 2026",
};
