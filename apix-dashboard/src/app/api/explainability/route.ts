import { NextResponse } from "next/server";
import { getExplainabilityData } from "@/data/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("route_id") || "DEL-BOM";
  const window = searchParams.get("window") || "T+15";
  return NextResponse.json(getExplainabilityData(routeId, window));
}
