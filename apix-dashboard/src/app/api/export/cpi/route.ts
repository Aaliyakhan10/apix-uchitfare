import { NextResponse } from "next/server";
import { ROUTES, WINDOW_WEIGHTS } from "@/data/routes";
import { HISTORICAL_SERIES } from "@/data/mockData";

export async function GET() {
  const rows: string[] = [
    "Date,MoSPI_SubGroup,Route_ID,Origin,Destination,Category,Traffic_Weight,Booking_Window,Median_Base_Fare_INR,Median_Fuel_Surcharge_INR,Median_Taxes_UDF_INR,Median_Total_Fare_INR,Price_Relative,APIx_Weighted_Contribution,Data_Mode"
  ];

  const totalWeight = ROUTES.reduce((sum, route) => sum + route.trafficWeight, 0);
  const windows = ["T+1", "T+7", "T+15", "T+30", "T+45"];
  const winMult: Record<string, number> = { "T+1": 1.95, "T+7": 1.28, "T+15": 1.0, "T+30": 0.84, "T+45": 0.74 };

  HISTORICAL_SERIES.slice(-30).forEach(day => {
    ROUTES.forEach(r => {
      windows.forEach(w => {
        const fare = Math.round(r.basePeriodFare * winMult[w] * (day.apix / 100));
        const base = Math.round(fare * 0.68);
        const fuel = Math.round(fare * 0.16);
        const taxes = fare - base - fuel;
        const pr = (fare / r.basePeriodFare).toFixed(4);
        const contrib = (parseFloat(pr) * (r.trafficWeight / totalWeight) * WINDOW_WEIGHTS[w] * 100).toFixed(4);

        rows.push(`${day.date},Transport - Domestic Airfares,${r.id},${r.originName},${r.destinationName},${r.category},${r.trafficWeight},${w},${base},${fuel},${taxes},${fare},${pr},${contrib},synthetic_demo`);
      });
    });
  });

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=uchitfare_sample_cpi.csv"
    }
  });
}
