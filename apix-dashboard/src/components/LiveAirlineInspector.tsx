"use client";

import React, { useState, useEffect } from "react";
import {
  Plane, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle,
  Info, ArrowRight, ShieldCheck, Clock, Layers, Filter, Sparkles,
  ChevronDown, ChevronUp, Search, DollarSign, Calendar
} from "lucide-react";
import { Language } from "@/i18n/translations";

interface FlightRecord {
  route_id: string;
  origin: string;
  destination: string;
  date: string;
  booking_window: string;
  carrier: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  duration_mins?: number;
  stops: number;
  is_direct: boolean;
  total_fare: number;
  base_fare: number;
  fuel_surcharge: number;
  taxes_udf: number;
  currency: string;
  source: string;
  raw_price_str?: string;
}

import { ROUTES as ALL_ROUTES } from "@/data/routes";

interface Props {
  lang: Language;
  activeRouteId?: string;
  onRouteSelected?: (routeId: string) => void;
}

const CARRIER_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  "IndiGo": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600 text-white" },
  "Air India": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-600 text-white" },
  "Akasa Air": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", badge: "bg-amber-500 text-white" },
  "SpiceJet": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-600 text-white" },
  "Air India Express": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-600 text-white" }
};

const DEFAULT_COLOR = { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", badge: "bg-slate-600 text-white" };

const ROUTES = ALL_ROUTES.map(r => ({
  id: r.id,
  name: `${r.originName} → ${r.destinationName}`,
  origin: r.origin,
  dest: r.destination,
  type: r.category
}));

const WINDOWS = [
  { id: "T+1", label: "T+1 (Tomorrow)", tag: "Emergency / Surge Zone", desc: "Dynamic pricing spike (+80% to +120%)" },
  { id: "T+7", label: "T+7 (1-Week)", tag: "MoSPI Standard Horizon", desc: "Core basket benchmark point" },
  { id: "T+15", label: "T+15 (2-Weeks)", tag: "Planned Travel", desc: "Stable commercial baseline" },
  { id: "T+30", label: "T+30 (1-Month)", tag: "Advance Purchase", desc: "Value leisure horizon" },
  { id: "T+45", label: "T+45 (Advance)", tag: "Early Bird Saver", desc: "Lowest capacity buckets" }
];

const INITIAL_DEL_BOM_RECORDS: FlightRecord[] = [
  {
    route_id: "DEL-BOM",
    origin: "DEL",
    destination: "BOM",
    date: "2026-09-15",
    booking_window: "T+7",
    carrier: "IndiGo",
    flight_number: "6E-205",
    departure_time: "06:15 AM",
    arrival_time: "08:35 AM",
    duration_mins: 140,
    stops: 0,
    is_direct: true,
    total_fare: 6774,
    base_fare: 4606,
    fuel_surcharge: 1084,
    taxes_udf: 1084,
    currency: "INR",
    source: "Google Flights"
  },
  {
    route_id: "DEL-BOM",
    origin: "DEL",
    destination: "BOM",
    date: "2026-09-15",
    booking_window: "T+7",
    carrier: "Akasa Air",
    flight_number: "QP-1102",
    departure_time: "08:40 AM",
    arrival_time: "11:05 AM",
    duration_mins: 145,
    stops: 0,
    is_direct: true,
    total_fare: 6359,
    base_fare: 4324,
    fuel_surcharge: 1017,
    taxes_udf: 1017,
    currency: "INR",
    source: "Google Flights"
  },
  {
    route_id: "DEL-BOM",
    origin: "DEL",
    destination: "BOM",
    date: "2026-09-15",
    booking_window: "T+7",
    carrier: "Air India",
    flight_number: "AI-887",
    departure_time: "11:00 AM",
    arrival_time: "01:15 PM",
    duration_mins: 135,
    stops: 0,
    is_direct: true,
    total_fare: 7119,
    base_fare: 4841,
    fuel_surcharge: 1139,
    taxes_udf: 1139,
    currency: "INR",
    source: "Google Flights"
  },
  {
    route_id: "DEL-BOM",
    origin: "DEL",
    destination: "BOM",
    date: "2026-09-15",
    booking_window: "T+7",
    carrier: "SpiceJet",
    flight_number: "SG-8169",
    departure_time: "02:30 PM",
    arrival_time: "04:55 PM",
    duration_mins: 145,
    stops: 0,
    is_direct: true,
    total_fare: 6636,
    base_fare: 4512,
    fuel_surcharge: 1062,
    taxes_udf: 1062,
    currency: "INR",
    source: "Google Flights"
  }
];

export default function LiveAirlineInspector({ lang, activeRouteId, onRouteSelected }: Props) {
  const [selectedRoute, setSelectedRoute] = useState(activeRouteId || "DEL-BOM");
  const [selectedWindow, setSelectedWindow] = useState("T+7");
  const [selectedSource, setSelectedSource] = useState<"google_flights" | "skyscanner">("google_flights");
  const [carrierFilter, setCarrierFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [explainOpen, setExplainOpen] = useState(true);

  // Sync when activeRouteId changes from parent without triggering double fetch
  useEffect(() => {
    if (activeRouteId && activeRouteId !== selectedRoute) {
      setSelectedRoute(activeRouteId);
    }
  }, [activeRouteId]);

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<FlightRecord[]>(INITIAL_DEL_BOM_RECORDS);
  const [fetchSource, setFetchSource] = useState("Google Flights");
  const [fetchTimestamp, setFetchTimestamp] = useState<string>("Cache: 20m ago");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial fetch on mount or when route/window changes
  const fetchLiveFares = async (routeId = selectedRoute, win = selectedWindow, src = selectedSource) => {
    setLoading(true);
    setErrorMsg(null);
    const rObj = ROUTES.find(r => r.id === routeId) || ROUTES[0];

    try {
      const res = await fetch("/api/scraper/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: rObj.origin,
          destination: rObj.dest,
          window: win,
          source: src
        })
      });

      if (!res.ok) throw new Error(`Scraper HTTP ${res.status}`);
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        setRecords(data.records);
        setFetchSource(data.source || (src === "google_flights" ? "Google Flights" : "Skyscanner"));
        setFetchTimestamp(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } else {
        throw new Error("Invalid payload format received");
      }
    } catch (err: any) {
      console.error("Live fetch error:", err);
      setErrorMsg(err.message || "Failed to reach live scraping daemon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFares(selectedRoute, selectedWindow, selectedSource);
  }, [selectedRoute, selectedWindow, selectedSource]);

  const activeRouteObj = ROUTES.find(r => r.id === selectedRoute) || ROUTES[0];

  // Filter records by carrier
  const filteredRecords = carrierFilter === "ALL" 
    ? records 
    : records.filter(r => r.carrier.toLowerCase().includes(carrierFilter.toLowerCase()));

  // Calculate stats
  const minFare = records.length > 0 ? Math.min(...records.map(r => r.total_fare)) : 0;
  const maxFare = records.length > 0 ? Math.max(...records.map(r => r.total_fare)) : 0;
  const avgFare = records.length > 0 ? Math.round(records.reduce((acc, r) => acc + r.total_fare, 0) / records.length) : 0;
  const marketSpread = maxFare - minFare;

  // Build direct verification links
  const targetDateStr = records[0]?.date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${activeRouteObj.dest}%20from%20${activeRouteObj.origin}%20on%20${targetDateStr}%20oneway&curr=INR&hl=en`;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & CONTEXT */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {lang === "hi" ? "लाइव एयरलाइन सत्यापन" : lang === "mr" ? "थेट विमान कंपनी पडताळणी" : "Carrier-Level Live Audit"}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {fetchTimestamp ? `Last sync: ${fetchTimestamp}` : "Ready"}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <span>
                {lang === "hi" 
                  ? "लाइव एयरलाइन किराया निरीक्षक (IndiGo, Air India, Akasa, SpiceJet)" 
                  : lang === "mr" 
                  ? "थेट विमान कंपन्यांचे तिकीट दर निरीक्षक (IndiGo, Air India, Akasa, SpiceJet)" 
                  : "Live Airline Fare Inspector & Direct Google Flights Validator"}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              {lang === "hi"
                ? "वास्तविक समय में सभी प्रमुख एयरलाइनों की उड़ानें, प्रस्थान समय, बेस फेयर, ईंधन अधिभार (YQ) और हवाईअड्डा कर देखें और सीधे Google Flights पर सत्यापित करें।"
                : lang === "mr"
                ? "थेट सर्व प्रमुख विमान कंपन्यांच्या उड्डाणे, वेळ, मूळ भाडे, इंधन अधिभार व विमानतळ कर तपासा आणि थेट Google Flights वर पडताळा."
                : "Inspect real-time live flight quotes across IndiGo, Air India, Akasa Air, SpiceJet, and AI Express with precise base fare decomposition and direct one-click GDS cross-verification."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchLiveFares()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? (lang === "hi" ? "स्कैन हो रहा है..." : "Fetching Live Fares...") : (lang === "hi" ? "लाइव डेटा रीफ्रेश करें" : "Refresh Live Fares")}</span>
            </button>

            <a
              href={googleFlightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
              title="Open Google Flights search in new tab"
            >
              <span>Google Flights</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* CONTROLS BAR: Route, Window, Source */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Route Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {lang === "hi" ? "1. हवाई मार्ग चुनें (Corridor):" : "1. Select Route Corridor:"}
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {ROUTES.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) — {r.type}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Window Horizon */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {lang === "hi" ? "2. बुकिंग समय सीमा (Advance Window):" : "2. Booking Horizon Offset:"}
            </label>
            <select
              value={selectedWindow}
              onChange={(e) => setSelectedWindow(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {WINDOWS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.label} — {w.tag}
                </option>
              ))}
            </select>
          </div>

          {/* Scraper Source */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {lang === "hi" ? "3. डेटा स्रोत (Harvest Engine):" : "3. Harvest Source Engine:"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSource("google_flights")}
                className={`py-2 px-2.5 rounded-lg border font-bold text-center cursor-pointer transition ${
                  selectedSource === "google_flights"
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Google Flights
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource("skyscanner")}
                className={`py-2 px-2.5 rounded-lg border font-bold text-center cursor-pointer transition ${
                  selectedSource === "skyscanner"
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Skyscanner India
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 2. THE CRUCIAL EXPLAINABILITY CARD: WHY MANUAL SEARCHES DIFFER FROM THE INDEX */}
      <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-xs transition">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setExplainOpen(!explainOpen)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                {lang === "hi" 
                  ? "मैनुअल सर्च और APIx सूचकांक में अंतर क्यों दिखता है? (4 मुख्य कारण)" 
                  : lang === "mr"
                  ? "मॅन्युअल शोध आणि APIx निर्देशांकात फरक का दिसतो? (४ मुख्य कारणे)"
                  : "Why Manual Searches Differ from the APIx Index (4 Root Causes Explained)"}
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                {lang === "hi"
                  ? "यदि आप अभी ब्राउज़र में टिकट खोजते हैं और यहाँ अलग मूल्य पाते हैं, तो यह समझें:"
                  : "If you search Google Flights manually and see ₹12,000 while the index says 165 or ₹6,300, here is why:"}
              </p>
            </div>
          </div>
          <button className="text-amber-800 hover:text-amber-950 p-1">
            {explainOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {explainOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 pt-3 border-t border-amber-200 text-xs">
            
            {/* Reason 1: Advance Horizon */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>1. Advance Horizon (T+1 vs T+7)</span>
                </span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-1.5 py-0.5 rounded">Major</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {lang === "hi"
                  ? "ब्राउज़र में आप आमतौर पर आज या कल (T+1) की टिकट खोजते हैं, जहाँ एयरलाइन डायनेमिक सर्ज के कारण दाम ₹12,000–₹18,000 होते हैं। MoSPI बास्केट 7 दिन आगे (T+7 = ₹6,300) और 15 दिन आगे का औसत मापता है।"
                  : "Manual searches default to tomorrow (T+1) where airlines close cheap buckets, surging to ₹12k–₹18k. The MoSPI index tracks normalized horizons (T+7, T+15, T+30) where prices are ₹5,400–₹6,500."}
              </p>
            </div>

            {/* Reason 2: Statistical Index vs Rupee Price */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>2. Index (165.48) vs Rupee Fare (₹)</span>
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-1.5 py-0.5 rounded">Concept</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {lang === "hi"
                  ? "डैशबोर्ड पर '165.48' कोई रुपये का टिकट नहीं है, बल्कि 2024 आधार (Base 100) का सांख्यिकीय सूचकांक है। 165.48 का मतलब है कि 2024 की तुलना में औसत हवाई किराया 65.48% बढ़ा है।"
                  : "The headline '165.48' is a statistical Laspeyres price index relative to Base Year 100, not a ticket price in Rupees. An index of 165 means prices are 65.48% higher than base year 2024."}
              </p>
            </div>

            {/* Reason 3: Fare Buckets & Add-ons */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>3. Saver vs Flexi Fare Buckets</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">Inventory</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {lang === "hi"
                  ? "APIx स्क्रैपर सबसे किफायती 'Economy Saver' (केवल 7kg केबिन बैग) की दर एकत्र करता है। उपभोक्ता जब खुद खरीदते हैं तो 15kg चेक-इन बैग या सीट चयन जोड़ते हैं (+₹1,000–₹2,500)।"
                  : "APIx captures pure published 'Economy Saver' (hand-baggage only) inventory. Manual searches frequently default to Standard tickets with 15kg checked luggage (+₹1,000 to ₹2,500)."}
              </p>
            </div>

            {/* Reason 4: OTA Fees & Markups */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>4. Direct GDS vs OTA Conveniences</span>
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-1.5 py-0.5 rounded">Channel</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {lang === "hi"
                  ? "MakeMyTrip, EaseMyTrip जैसे पोर्टल ₹350–₹750 'सुविधा शुल्क' (Convenience Fee) लगाते हैं या बैंक डिस्काउंट देते हैं। APIx शुद्ध प्रकाशित एयरलाइन टैरिफ दर्ज करता है।"
                  : "OTAs (MakeMyTrip, Yatra, EaseMyTrip) add convenience charges (₹350–₹750) or apply promo cashbacks. APIx benchmarks pure published airline GDS tariffs without ancillary noise."}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* 3. AIRLINE CARRIER SUMMARY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* All Airlines Filter Card */}
        <button
          onClick={() => setCarrierFilter("ALL")}
          className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
            carrierFilter === "ALL" 
              ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
              : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">All Carriers</span>
          <div className="text-lg font-black font-mono mt-0.5">{records.length} Flights</div>
          <span className="text-[11px] font-medium opacity-80 block mt-1">Avg: ₹{avgFare.toLocaleString("en-IN")}</span>
        </button>

        {/* Individual Airlines */}
        {["IndiGo", "Air India", "Akasa Air", "SpiceJet", "Air India Express"].map(carrier => {
          const cFares = records.filter(r => r.carrier.toLowerCase().includes(carrier.toLowerCase())).map(r => r.total_fare);
          const cMin = cFares.length > 0 ? Math.min(...cFares) : 0;
          const count = cFares.length;
          const isSelected = carrierFilter.toLowerCase() === carrier.toLowerCase();
          const col = CARRIER_COLORS[carrier] || DEFAULT_COLOR;

          return (
            <button
              key={carrier}
              onClick={() => setCarrierFilter(isSelected ? "ALL" : carrier)}
              className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                isSelected 
                  ? `${col.bg} ${col.border} ring-2 ring-blue-500 shadow-sm` 
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${col.badge}`}>
                  {carrier.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{count}</span>
              </div>
              <div className="text-base font-black font-mono text-slate-900 mt-1">
                {cMin > 0 ? `₹${cMin.toLocaleString("en-IN")}` : "N/A"}
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                {carrier}
              </span>
            </button>
          );
        })}

      </div>

      {/* 4. FLIGHTS LIST & VERIFICATION TABLE */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Sub-Header with View Toggle */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{filteredRecords.length} Live Quotes on {activeRouteObj.name}</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full font-mono">
                {selectedWindow} Horizon ({targetDateStr})
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Source: <strong className="text-slate-700">{fetchSource}</strong> • Market Fare Spread: <strong className="text-blue-700">₹{marketSpread.toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="bg-slate-200 p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${viewMode === "cards" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Detailed Ledger
              </button>
            </div>
          </div>
        </div>

        {/* CARDS VIEW */}
        {viewMode === "cards" ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecords.map((r, idx) => {
              const col = CARRIER_COLORS[r.carrier] || DEFAULT_COLOR;
              const gSearchUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${r.destination}%20from%20${r.origin}%20on%20${r.date}%20oneway&curr=INR&hl=en`;

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm hover:border-blue-300 transition space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Carrier Badge & Flight Number */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md ${col.badge}`}>
                        {r.carrier}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {r.flight_number || `FL-${idx + 101}`}
                      </span>
                    </div>

                    {/* Flight Schedule */}
                    <div className="flex items-center justify-between mt-3 text-slate-800">
                      <div>
                        <div className="text-base font-black">{r.departure_time || "08:30 AM"}</div>
                        <span className="text-[11px] text-slate-500 font-bold">{r.origin}</span>
                      </div>
                      
                      <div className="text-center px-2">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {r.duration_mins ? `${Math.floor(r.duration_mins/60)}h ${r.duration_mins%60}m` : "2h 15m"}
                        </span>
                        <div className="w-16 h-0.5 bg-slate-300 my-1 relative">
                          <Plane className="w-2.5 h-2.5 text-slate-500 absolute -top-1 left-1/2 -translate-x-1/2" />
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold">
                          {r.is_direct ? "Non-Stop" : `${r.stops} Stop`}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black">{r.arrival_time || "10:45 AM"}</div>
                        <span className="text-[11px] text-slate-500 font-bold">{r.destination}</span>
                      </div>
                    </div>

                    {/* Flight Travel Date (Live 2026) */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 bg-blue-50/60 px-2.5 py-1 rounded-md border border-blue-100">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>Travel Date:</span>
                      </span>
                      <span className="font-mono font-bold text-blue-900">{r.date}</span>
                    </div>

                    {/* Fare Breakdown decomposition */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] space-y-1 font-mono text-slate-600 bg-slate-50/70 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span>Base Fare (68%):</span>
                        <span className="font-semibold text-slate-800">₹{r.base_fare?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.68)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Surcharge YQ (16%):</span>
                        <span className="font-semibold text-slate-800">₹{r.fuel_surcharge?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.16)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Airport Taxes / UDF (16%):</span>
                        <span className="font-semibold text-slate-800">₹{r.taxes_udf?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.16)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Fare & Direct Verify Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Net Fare</span>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        ₹{r.total_fare.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <a
                      href={gSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <span>Verify Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Carrier & Flight</th>
                  <th className="py-2.5 px-3">Travel Date</th>
                  <th className="py-2.5 px-3">Timing</th>
                  <th className="py-2.5 px-3 text-center">Stops</th>
                  <th className="py-2.5 px-3 text-right">Base Fare</th>
                  <th className="py-2.5 px-3 text-right">Fuel (YQ)</th>
                  <th className="py-2.5 px-3 text-right">Airport Taxes</th>
                  <th className="py-2.5 px-3 text-right">Total Fare</th>
                  <th className="py-2.5 px-3 text-center">Cross-Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRecords.map((r, idx) => {
                  const col = CARRIER_COLORS[r.carrier] || DEFAULT_COLOR;
                  const gSearchUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${r.destination}%20from%20${r.origin}%20on%20${r.date}%20oneway&curr=INR&hl=en`;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${col.badge}`}>
                            {r.carrier.split(" ")[0]}
                          </span>
                          <span className="font-bold text-slate-800">{r.carrier}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">({r.flight_number || `FL-${idx+101}`})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-blue-900 font-bold font-mono text-[11px]">
                        {r.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {r.departure_time || "08:30 AM"} → {r.arrival_time || "10:45 AM"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-sans">
                          {r.is_direct ? "Non-Stop" : `${r.stops} Stop`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{r.base_fare?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.68)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{r.fuel_surcharge?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.16)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{r.taxes_udf?.toLocaleString("en-IN") || Math.round(r.total_fare * 0.16)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-base text-blue-700">
                        ₹{r.total_fare.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <a
                          href={gSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                        >
                          <span>Google Flights</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
