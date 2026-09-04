import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    surveillance_target: "Competition Commission of India (CCI) - Fair Market Watchdog",
    methodology: "Carrier Price Co-Movement & Coordinated Surge Correlation Matrix",
    correlation_matrix: {
      carriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet"],
      matrix: [
        [1.00, 0.89, 0.74, 0.68],
        [0.89, 1.00, 0.78, 0.72],
        [0.74, 0.78, 1.00, 0.62],
        [0.68, 0.72, 0.62, 1.00]
      ]
    },
    flagged_collusion_sectors: [
      {
        route_id: "DEL-BOM",
        primary_carriers: ["IndiGo", "Air India"],
        correlation_coefficient: 0.92,
        finding: "High price-matching synchronization: IndiGo and Air India fare increases occurred within 30 minutes on 14 peak days.",
        risk_level: "HIGH"
      },
      {
        route_id: "BOM-GOI",
        primary_carriers: ["IndiGo", "Akasa Air"],
        correlation_coefficient: 0.86,
        finding: "Weekend holiday surges synchronized across economy buckets with near-zero price differential.",
        risk_level: "MEDIUM"
      }
    ],
    recommended_cci_action: "Conduct sector enquiry under Section 3(3)(a) of Competition Act 2002 for algorithmic price-signaling."
  });
}
