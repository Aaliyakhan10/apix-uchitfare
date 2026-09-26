import { NextResponse } from "next/server";
import { HISTORICAL_SERIES } from "@/data/mockData";
export async function POST() {
  const latest = HISTORICAL_SERIES.at(-1)!;
  return NextResponse.json({ data_mode: "synthetic", target_date: latest.date, new_apix: latest.apix, confidence_score: latest.confidence_score, records_scraped: 0, outliers_rejected: 0, logs: ["Loaded synthetic sample snapshot. No live scraping was performed."] });
}
