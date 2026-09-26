import { ROUTES, BOOKING_WINDOWS, WINDOW_WEIGHTS } from "./routes";

export interface DayIndexRecord {
  date: string;
  apix: number;
  apix_metro: number;
  apix_regional: number;
  apix_weekly_ma: number;
  "apix_T+1": number;
  "apix_T+7": number;
  "apix_T+15": number;
  "apix_T+30": number;
  "apix_T+45": number;
  fuel_index: number;
  confidence_score: number;
  dgca_official_index: number;
}

export interface RouteSummary {
  route_id: string;
  origin: string;
  destination: string;
  category: "Metro" | "Regional/UDAN";
  distance_km: number;
  current_median_fare: number;
  base_period_fare: number;
  fare_per_km: number;
  benchmark_fare_per_km: number;
  markup_ratio: number;
  hhi: number;
  concentration_level: string;
  is_flagged: boolean;
  carrier_count: number;
  carrier_shares: { carrier: string; share: number }[];
}

export interface FlaggedAlert {
  route_id: string;
  origin: string;
  destination: string;
  category: string;
  hhi: number;
  severity: "HIGH" | "MEDIUM";
  dominant_carrier: string;
  dominant_share_pct: number;
  fare_per_km: number;
  benchmark_fare_per_km: number;
  markup_percent: number;
  reason: string;
  recommended_action: string;
}

// Generate 90-day time series data calibrated to canon MoSPI baseline (100 in 2024 -> 165.48 today)
export function generateHistoryData(): DayIndexRecord[] {
  const records: DayIndexRecord[] = [];
  // 90-day time series ending on current date: September 8, 2026
  const today = new Date("2026-09-08T00:00:00Z"); // 2026-09-08
  const startDate = new Date(today);
  startDate.setUTCDate(today.getUTCDate() - 89); // Exactly 90 days

  const festivalDates: Record<string, number> = {
    "2026-06-16": 1.35, "2026-06-17": 1.88, "2026-06-18": 1.20,
    "2026-08-14": 2.12, "2026-08-15": 2.68, "2026-08-16": 2.28, "2026-08-17": 1.42,
    "2026-08-27": 1.58, "2026-08-28": 1.95, "2026-08-29": 1.32,
    "2026-09-03": 1.40, "2026-09-04": 1.95, "2026-09-05": 1.38, "2026-09-08": 0.95
  };

  const rollingQueue: number[] = [];

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;

    // Progression ratio from 0 to 1
    const progress = i / 89.0;
    
    // Fuel Index gradually moving from 100.0 to 114.20
    const fuelIndex = parseFloat((100.0 + 14.20 * progress + Math.sin(i * 0.2) * 0.8 * (1 - progress * 0.4)).toFixed(2));

    let apixVal: number;
    if (i === 89) {
      apixVal = 165.48;
    } else {
      const baseTrend = 102.5 + (165.48 - 102.5) * progress;
      const seasonalWave = Math.sin(i * 0.28) * 1.8 * (1 - progress * 0.3);
      const weekendEffect = isWeekend ? 1.1 : -0.4;
      const festBump = festivalDates[dateStr] || 0.0;
      apixVal = parseFloat((baseTrend + seasonalWave + weekendEffect + festBump).toFixed(2));
    }

    rollingQueue.push(apixVal);
    if (rollingQueue.length > 7) rollingQueue.shift();
    const ma = parseFloat((rollingQueue.reduce((a, b) => a + b, 0) / rollingQueue.length).toFixed(2));

    const t1 = parseFloat((apixVal * 1.58).toFixed(2));
    const t7 = parseFloat((apixVal * 1.15).toFixed(2));
    const t15 = apixVal;
    const t30 = parseFloat((apixVal * 0.88).toFixed(2));
    const t45 = parseFloat((apixVal * 0.76).toFixed(2));

    // Metro (70%) and Regional/UDAN (30%) weighting: 168.21 * 0.70 + 159.11 * 0.30 = 165.48
    const metroApix = i === 89 ? 168.21 : parseFloat((apixVal * 1.0165).toFixed(2));
    const regionalApix = i === 89 ? 159.11 : parseFloat((apixVal * 0.9615).toFixed(2));
    const dgcaOfficial = i === 89 ? 164.20 : parseFloat((apixVal * 0.992 + (Math.cos(i * 0.4) * 0.4)).toFixed(2));
    const confidence = i === 89 ? 96.1 : parseFloat((95.0 + Math.sin(i * 0.3) * 1.8).toFixed(1));

    records.push({
      date: dateStr,
      apix: apixVal,
      apix_metro: metroApix,
      apix_regional: regionalApix,
      apix_weekly_ma: ma,
      "apix_T+1": t1,
      "apix_T+7": t7,
      "apix_T+15": t15,
      "apix_T+30": t30,
      "apix_T+45": t45,
      fuel_index: fuelIndex,
      confidence_score: confidence,
      dgca_official_index: dgcaOfficial
    });
  }

  return records;
}

export const HISTORICAL_SERIES = generateHistoryData();

export const ROUTE_SUMMARIES: RouteSummary[] = ROUTES.map((r) => {
  const isUdan = r.isUdan;

  const currentFare = Math.round(r.basePeriodFare * (isUdan ? 1.25 : 1.18));
  const farePerKm = parseFloat((currentFare / r.distanceKm).toFixed(2));
  const benchmarkFpk = isUdan ? 8.45 : 4.65;
  const markupRatio = parseFloat((farePerKm / benchmarkFpk).toFixed(2));


  const carrierShares = r.typicalCarriers.map((c, i) => {
    if (r.typicalCarriers.length === 1) return { carrier: c, share: 100.0 };
    if (r.typicalCarriers.length === 2) return { carrier: c, share: i === 0 ? 62.5 : 37.5 };
    if (r.typicalCarriers.length === 3) return { carrier: c, share: i === 0 ? 45.0 : (i === 1 ? 35.0 : 20.0) };
    if (r.typicalCarriers.length === 5) return { carrier: c, share: [36, 26, 18, 12, 8][i] };
    return { carrier: c, share: i === 0 ? 42.0 : (i === 1 ? 28.0 : (i === 2 ? 18.0 : 12.0)) };
  });

  const hhi = Math.round(carrierShares.reduce((sum, carrier) => sum + carrier.share ** 2, 0));
  const isFlagged = hhi >= 2500 && markupRatio >= 1.25;

  return {
    route_id: r.id,
    origin: r.originName,
    destination: r.destinationName,
    category: r.category,
    distance_km: r.distanceKm,
    current_median_fare: currentFare,
    base_period_fare: r.basePeriodFare,
    fare_per_km: farePerKm,
    benchmark_fare_per_km: benchmarkFpk,
    markup_ratio: markupRatio,
    hhi: hhi,
    concentration_level: hhi >= 5000 ? "Monopoly / Dominant" : (hhi >= 2500 ? "Highly Concentrated" : "Competitive"),
    is_flagged: isFlagged,
    carrier_count: r.typicalCarriers.length,
    carrier_shares: carrierShares
  };
});

export const FLAGGED_ALERTS: FlaggedAlert[] = ROUTE_SUMMARIES.filter(r => r.is_flagged).map(r => {
  const dominant = r.carrier_shares[0];
  const markupPercent = Math.round((r.markup_ratio - 1.0) * 100);
  return {
    route_id: r.route_id,
    origin: r.origin,
    destination: r.destination,
    category: r.category,
    hhi: r.hhi,
    severity: (r.markup_ratio >= 1.5 || r.hhi >= 6000) ? "HIGH" : "MEDIUM",
    dominant_carrier: dominant.carrier,
    dominant_share_pct: dominant.share,
    fare_per_km: r.fare_per_km,
    benchmark_fare_per_km: r.benchmark_fare_per_km,
    markup_percent: markupPercent,
    reason: `Synthetic scenario shows market concentration (HHI ${r.hhi}) with ${dominant.carrier} controlling ${dominant.share}%. Fare of ₹${r.fare_per_km}/km is ${markupPercent}% above distance benchmark.`,
    recommended_action: "Review source evidence before drawing any regulatory conclusions."
  };
});

export function getExplainabilityData(routeId = "DEL-BOM", window = "T+15") {
  const r = ROUTES.find(x => x.id === routeId) || ROUTES[0];
  const base = r.basePeriodFare;
  const windowMultiplier: Record<string, number> = { "T+1": 1.95, "T+7": 1.28, "T+15": 1.0, "T+30": 0.84, "T+45": 0.74 };
  const currentFare = Math.round(base * (windowMultiplier[window] || 1.0) * 1.16);
  const diff = currentFare - base;

  const fuelImpact = Math.round(diff * 0.28);
  const surgeImpact = Math.round(diff * 0.45);
  const compImpact = Math.round(-diff * 0.12);
  const windowImpact = Math.round(base * ((windowMultiplier[window] || 1.0) - 1.0));
  const residual = diff - (fuelImpact + surgeImpact + compImpact + windowImpact);

  const denom = Math.max(1, Math.abs(diff));

  return {
    route_id: r.id,
    route_name: `${r.originName} -> ${r.destinationName}`,
    current_fare: currentFare,
    base_period_fare: base,
    explanation: {
      total_change_inr: diff,
      factors: [
        { name: "ATF Jet Fuel Shock", inr_impact: fuelImpact, pct: Math.round((fuelImpact / denom) * 100), direction: fuelImpact >= 0 ? "up" : "down" },
        { name: "Festival / Weekend Surge", inr_impact: surgeImpact, pct: Math.round((surgeImpact / denom) * 100), direction: surgeImpact >= 0 ? "up" : "down" },
        { name: "Carrier Competition Discount", inr_impact: compImpact, pct: Math.round((compImpact / denom) * 100), direction: compImpact >= 0 ? "up" : "down" },
        { name: "Booking Window Lead Time", inr_impact: windowImpact, pct: Math.round((windowImpact / denom) * 100), direction: windowImpact >= 0 ? "up" : "down" },
        { name: "Market Residual / Noise", inr_impact: residual, pct: Math.round((residual / denom) * 100), direction: residual >= 0 ? "up" : "down" }
      ]
    }
  };
}
