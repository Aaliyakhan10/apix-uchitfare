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

// Generate 90-day time series data
export function generateHistoryData(): DayIndexRecord[] {
  const records: DayIndexRecord[] = [];
  const startDate = new Date(2026, 5, 1); // June 1, 2026
  let currentFuel = 100.0;
  let currentBaseIndex = 102.5;

  const festivalDates: Record<string, number> = {
    "2026-06-16": 0.35, "2026-06-17": 0.48, "2026-06-18": 0.30,
    "2026-08-14": 0.52, "2026-08-15": 0.68, "2026-08-16": 0.58, "2026-08-17": 0.42,
    "2026-08-27": 0.38, "2026-08-28": 0.48, "2026-08-29": 0.32
  };

  const rollingQueue: number[] = [];

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    currentFuel += (Math.sin(i * 0.15) * 0.45) + 0.12;
    const fuelIndex = parseFloat(currentFuel.toFixed(2));
    const fuelRel = (fuelIndex - 100.0) / 100.0;

    const festSurge = festivalDates[dateStr] || 0.0;
    const demandBump = (isWeekend ? 0.12 : 0.0) + festSurge;

    currentBaseIndex += 0.55 + (Math.sin(i * 0.3) * 0.35);
    const apixVal = parseFloat((currentBaseIndex * (1.0 + 0.32 * fuelRel + demandBump)).toFixed(2));

    rollingQueue.push(apixVal);
    if (rollingQueue.length > 7) rollingQueue.shift();
    const ma = parseFloat((rollingQueue.reduce((a, b) => a + b, 0) / rollingQueue.length).toFixed(2));

    const t1 = parseFloat((apixVal * 1.58).toFixed(2));
    const t7 = parseFloat((apixVal * 1.15).toFixed(2));
    const t15 = apixVal;
    const t30 = parseFloat((apixVal * 0.88).toFixed(2));
    const t45 = parseFloat((apixVal * 0.76).toFixed(2));

    const metroApix = parseFloat((apixVal * 1.01).toFixed(2));
    const regionalApix = parseFloat((apixVal * 0.94).toFixed(2));
    const dgcaOfficial = parseFloat((apixVal * 0.985 + (Math.cos(i) * 0.8)).toFixed(2));
    const confidence = parseFloat((94.5 + (Math.sin(i) * 2.8)).toFixed(1));

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
  const isSingleCarrier = r.typicalCarriers.length === 1;
  const isDuopoly = r.typicalCarriers.length === 2;
  const isUdan = r.isUdan;

  let hhi = isSingleCarrier ? 10000 : (isDuopoly ? 5000 : (r.typicalCarriers.length === 3 ? 3333 : 2500));
  if (r.id === "DEL-BOM") hhi = 2240;
  if (r.id === "BOM-BLR") hhi = 3450;
  if (r.id === "BOM-IXU") hhi = 10000;
  if (r.id === "DEL-SHL") hhi = 10000;

  const currentFare = Math.round(r.basePeriodFare * (isUdan ? 1.25 : 1.18));
  const farePerKm = parseFloat((currentFare / r.distanceKm).toFixed(2));
  const benchmarkFpk = isUdan ? 8.45 : 4.65;
  const markupRatio = parseFloat((farePerKm / benchmarkFpk).toFixed(2));

  const isFlagged = (hhi >= 2500 && markupRatio >= 1.25);

  const carrierShares = r.typicalCarriers.map((c, i) => {
    if (r.typicalCarriers.length === 1) return { carrier: c, share: 100.0 };
    if (r.typicalCarriers.length === 2) return { carrier: c, share: i === 0 ? 62.5 : 37.5 };
    if (r.typicalCarriers.length === 3) return { carrier: c, share: i === 0 ? 45.0 : (i === 1 ? 35.0 : 20.0) };
    return { carrier: c, share: i === 0 ? 42.0 : (i === 1 ? 28.0 : (i === 2 ? 18.0 : 12.0)) };
  });

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
    reason: `Route exhibits severe market concentration (HHI ${r.hhi}) with ${dominant.carrier} controlling ${dominant.share}%. Fare of ₹${r.fare_per_km}/km is ${markupPercent}% above distance benchmark.`,
    recommended_action: "Issue notice under Section 3(4) of Competition Act / DGCA Airfare Monitoring Cell Review."
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
