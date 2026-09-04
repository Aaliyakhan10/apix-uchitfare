import { NextResponse } from "next/server";
import { HISTORICAL_SERIES, FLAGGED_ALERTS } from "@/data/mockData";
import { ROUTES } from "@/data/routes";

export async function GET() {
  const latest = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 1];
  const prev = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 2];

  return NextResponse.json({
    current_apix: latest.apix,
    base_period_apix: 100.0,
    day_change: parseFloat((latest.apix - prev.apix).toFixed(2)),
    overall_change: parseFloat((latest.apix - 100.0).toFixed(2)),
    latest_date: latest.date,
    confidence_score: latest.confidence_score,
    reliability_status: "Optimal",
    metro_apix: latest.apix_metro,
    regional_apix: latest.apix_regional,
    monitored_routes_count: ROUTES.length,
    flagged_routes_count: FLAGGED_ALERTS.length,
    backtest_correlation: 0.9982,
    backtest_mape: 1.99
  });
}
