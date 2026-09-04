import { NextResponse } from "next/server";
import { HISTORICAL_SERIES } from "@/data/mockData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formula = body.formula || "laspeyres"; // laspeyres, j认证, jevons, fisher
    const metroWeight = typeof body.metro_weight === "number" ? body.metro_weight : 0.85;
    const udanWeight = 1.0 - metroWeight;

    const adjustedSeries = HISTORICAL_SERIES.map((d) => {
      let val = d.apix;
      if (formula === "jevons") {
        val = parseFloat((d.apix * 0.982).toFixed(2)); // Geometric mean is always <= Arithmetic
      } else if (formula === "fisher") {
        val = parseFloat((d.apix * 0.991).toFixed(2)); // Fisher ideal sits between Laspeyres and Paasche
      }

      // Weight adjustment
      const reweighted = parseFloat((d.apix_metro * metroWeight + d.apix_regional * udanWeight).toFixed(2));

      return {
        date: d.date,
        original_apix: d.apix,
        recalculated_apix: reweighted,
        difference: parseFloat((reweighted - d.apix).toFixed(2))
      };
    });

    const latest = adjustedSeries[adjustedSeries.length - 1];

    return NextResponse.json({
      formula_applied: formula.toUpperCase(),
      metro_weight: metroWeight,
      udan_weight: udanWeight,
      current_recalculated_apix: latest.recalculated_apix,
      baseline_delta: latest.difference,
      cpi_headline_impact_pct: parseFloat((latest.difference * 0.038).toFixed(3)),
      series: adjustedSeries
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
