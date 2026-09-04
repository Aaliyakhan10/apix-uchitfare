import { NextResponse } from "next/server";
import { ROUTE_SUMMARIES, FLAGGED_ALERTS } from "@/data/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("flagged") === "true") {
    return NextResponse.json(FLAGGED_ALERTS);
  }
  return NextResponse.json(ROUTE_SUMMARIES);
}
