import { NextResponse } from "next/server";
import { HISTORICAL_SERIES } from "@/data/mockData";

export async function GET() {
  return NextResponse.json(HISTORICAL_SERIES);
}
