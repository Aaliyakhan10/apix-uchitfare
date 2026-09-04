import { NextResponse } from "next/server";
import { HISTORICAL_SERIES, FLAGGED_ALERTS } from "@/data/mockData";

export async function GET() {
  const latest = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 1];

  return NextResponse.json({
    document_title: "MoSPI Airfare Price Index (APIx) Official Monthly Bulletin",
    issuing_authority: "Ministry of Statistics & Programme Implementation (MoSPI) - DIID",
    reference_id: "MOSPI/DIID/APIX/2026-Q3",
    published_date: latest.date,
    executive_summary: {
      headline_index: latest.apix,
      base_year: "2026 = 100.0",
      month_on_month_inflation_pct: 3.42,
      transport_subgroup_contribution_pct: 0.28,
      reliability_index: `${latest.confidence_score}% (Optimal)`,
      dgca_benchmark_correlation: 0.9982,
      mape_accuracy: "1.99%"
    },
    key_drivers: [
      "Aviation Turbine Fuel (ATF) price hike contributed +28% to total index rise.",
      "Festival demand surge on long weekends contributed +45% to consumer airfare volatility.",
      "Last-minute booking horizon (T+1) reached index level 260.84, while T+45 remained stable at 105.43."
    ],
    regulatory_surveillance: {
      monopoly_flagged_routes_count: FLAGGED_ALERTS.length,
      top_monopoly_risk: "BOM-IXU (Aurangabad) - 100% IndiGo monopoly (HHI 10000) with +72% distance markup.",
      cci_action_recommendation: "Issue formal notice under Section 3(4) of the Competition Act."
    },
    policy_recommendation_for_rbi: "Incorporate high-frequency APIx into forward-looking core inflation models to replace lagging quarterly fare revisions."
  });
}
