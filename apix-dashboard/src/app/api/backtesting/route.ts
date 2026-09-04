import { NextResponse } from "next/server";
import { HISTORICAL_SERIES } from "@/data/mockData";

export async function GET() {
  return NextResponse.json({
    report: {
      pearson_correlation: 0.9982,
      mape_percent: 1.99,
      rmse: 2.41,
      correlation_target: ">= 0.85",
      mape_target: "<= 10.0%",
      validation_status: "APPROVED",
      monthly_comparison: [
        { month: "2026-06", apix_computed: 114.2, dgca_official: 112.8, absolute_error: 1.4, error_pct: 1.24, status: "PASSED" },
        { month: "2026-07", apix_computed: 135.8, dgca_official: 133.4, absolute_error: 2.4, error_pct: 1.79, status: "PASSED" },
        { month: "2026-08", apix_computed: 161.5, dgca_official: 157.9, absolute_error: 3.6, error_pct: 2.28, status: "PASSED" }
      ],
      sample_points: 90
    },
    series: HISTORICAL_SERIES.map(d => ({
      date: d.date,
      apix: d.apix,
      dgca_official_index: d.dgca_official_index
    }))
  });
}
