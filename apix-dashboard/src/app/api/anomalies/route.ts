import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    algorithm: "Scikit-Learn Isolation Forest",
    contamination_rate: 0.012,
    total_samples_evaluated: 30947,
    inliers_accepted: 30576,
    outliers_flagged: 371,
    outlier_rate_percent: 1.2,
    decision_threshold: -0.142,
    anomaly_categories: [
      { type: "Erroneous Low Fare Glitch", count: 184, typical_range_inr: "₹200 - ₹480", action: "Quarantined & Excluded" },
      { type: "Misclassified Business Class / Spike", count: 187, typical_range_inr: "₹24,000 - ₹52,000", action: "Quarantined & Excluded" }
    ],
    sample_outliers: [
      { id: "OUT-001", date: "2026-08-15", route_id: "DEL-BOM", carrier: "IndiGo", raw_fare: 350, expected_fare: 7850, reason: "API zero-tax scraping error" },
      { id: "OUT-002", date: "2026-08-15", route_id: "DEL-IXL", carrier: "SpiceJet", raw_fare: 48900, expected_fare: 11200, reason: "Emergency business seat mislabeled as economy" },
      { id: "OUT-003", date: "2026-07-22", route_id: "BOM-BLR", carrier: "Akasa Air", raw_fare: 290, expected_fare: 4200, reason: "Incomplete fare payload" },
      { id: "OUT-004", date: "2026-06-17", route_id: "DEL-CCU", carrier: "Air India", raw_fare: 39500, expected_fare: 5400, reason: "Flexible full-fare premium ticket" },
      { id: "OUT-005", date: "2026-08-28", route_id: "BOM-IXU", carrier: "IndiGo", raw_fare: 410, expected_fare: 6200, reason: "Network timeout glitch" }
    ]
  });
}
