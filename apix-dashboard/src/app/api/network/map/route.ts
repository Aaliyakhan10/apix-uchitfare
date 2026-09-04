import { NextResponse } from "next/server";
import { ROUTES } from "@/data/routes";
import { AIRPORTS } from "@/data/geoData";
import { ROUTE_SUMMARIES } from "@/data/mockData";

export async function GET() {
  const routesGeo = ROUTE_SUMMARIES.map((r) => {
    const orig = AIRPORTS[r.origin.split(" ")[0]] || { iata: r.origin, city: r.origin, lat: 28.55, lng: 77.10 };
    const dest = AIRPORTS[r.destination.split(" ")[0]] || { iata: r.destination, city: r.destination, lat: 19.08, lng: 72.86 };

    return {
      route_id: r.route_id,
      origin: orig,
      destination: dest,
      category: r.category,
      distance_km: r.distance_km,
      current_fare: r.current_median_fare,
      fare_per_km: r.fare_per_km,
      hhi: r.hhi,
      is_flagged: r.is_flagged,
      traffic_weight: (ROUTES.find(x => x.id === r.route_id)?.trafficWeight || 0.04)
    };
  });

  return NextResponse.json({
    airports: Object.values(AIRPORTS),
    corridors: routesGeo
  });
}
