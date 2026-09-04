import { NextResponse } from "next/server";
import { ROUTES } from "@/data/routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("route_id") || "DEL-BOM";
  const r = ROUTES.find(x => x.id === routeId) || ROUTES[0];

  const base = r.basePeriodFare;

  return NextResponse.json({
    route_id: r.id,
    route_name: `${r.originName} -> ${r.destinationName}`,
    category: r.category,
    recommendation: {
      sweet_spot_window: "T+21 to T+30 Days",
      expected_savings_pct: 38.5,
      worst_window_to_avoid: "T+1 to T+3 (Surge Penalty: +95%)",
      cheapest_departure_days: ["Tuesday", "Wednesday"],
      peak_departure_days: ["Friday Evening", "Sunday Night (+28% markup)"]
    },
    booking_curve_breakdown: [
      { horizon: "T+45", avg_fare_inr: Math.round(base * 0.74), label: "Super Early Bird", savings_vs_last_minute: "62% cheaper" },
      { horizon: "T+30", avg_fare_inr: Math.round(base * 0.84), label: "Optimal Booking Window", savings_vs_last_minute: "57% cheaper" },
      { horizon: "T+15", avg_fare_inr: base, label: "Standard Benchmark", savings_vs_last_minute: "49% cheaper" },
      { horizon: "T+7", avg_fare_inr: Math.round(base * 1.28), label: "Late Booking Price Rise", savings_vs_last_minute: "34% cheaper" },
      { horizon: "T+1", avg_fare_inr: Math.round(base * 1.95), label: "Last Minute Surge Zone", savings_vs_last_minute: "0% (Peak Price)" }
    ]
  });
}
