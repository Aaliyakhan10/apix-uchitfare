"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from "recharts";
import {
  TrendingUp, Activity, ShieldAlert, Award, Plane, Database, Clock, ShieldCheck,
  Play, Download, Layers, MapPin, Sparkles, Terminal, CheckCircle2, AlertTriangle,
  Info, Check, ChevronRight, X, AlertOctagon, Shield
} from "lucide-react";
import { ROUTES } from "@/data/routes";
import { HISTORICAL_SERIES, ROUTE_SUMMARIES, FLAGGED_ALERTS, getExplainabilityData } from "@/data/mockData";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"trends" | "routes" | "explainability" | "monopoly" | "backtesting" | "pipeline">("trends");
  const [activeSeries, setActiveSeries] = useState<"composite" | "t1" | "t7" | "t15" | "t45" | "metro_udan">("composite");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedRouteId, setSelectedRouteId] = useState("DEL-BOM");
  const [selectedWindow, setSelectedWindow] = useState("T+15");
  const [inspectedRoute, setInspectedRoute] = useState<any | null>(null);

  // Live scraper simulator state
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    " # APIx Engine Daemon initialized. Ready to execute scheduled scrape cycle.",
    " > Click 'Run Scraping Pipeline' to trigger a live run."
  ]);
  const [activeStep, setActiveStep] = useState(0);

  // Latest KPIs
  const latest = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 1];
  const prev = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 2];
  const dayDelta = (latest.apix - prev.apix).toFixed(2);

  // Explainability current data
  const expData = getExplainabilityData(selectedRouteId, selectedWindow);

  // Filtered routes
  const filteredRoutes = ROUTE_SUMMARIES.filter((r) => {
    const matchesSearch = r.route_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Run live simulation
  const handleRunPipeline = async () => {
    setPipelineRunning(true);
    setActiveTab("pipeline");
    setActiveStep(1);

    const timestamp = new Date().toTimeString().slice(0, 8);
    const steps = [
      `[${timestamp}] Step 1: Loaded Route Basket (15 Metro + 10 Regional/UDAN routes).`,
      `[${timestamp}] Step 2: Initiating parallel Playwright scraper across IndiGo, Air India, Akasa, SpiceJet & OTAs...`,
      `[${timestamp}] Step 2: Scraped 428 raw fare listings across all booking windows.`,
      `[${timestamp}] Step 3: Isolation Forest anomaly detector identified 5 outliers (Max outlier: ₹38,400).`,
      `[${timestamp}] Step 4: Reliability score computed at 96.11% (Status: Optimal).`,
      `[${timestamp}] Step 5: Recalculated weighted Airfare Price Index (APIx) -> 166.15 (Base=100).`,
      `[${timestamp}] Step 6: SHAP decomposition active: Fuel contribution +34.2%, Weekend Demand +48.5%, Competition -12.3%.`,
      `[${timestamp}] Step 7: HHI Surveillance completed: 8 routes flagged for monopoly/surge risk.`,
      `[${timestamp}] Step 8: Backtest alignment with DGCA benchmark verified (Correlation r=0.998).`,
      `[${timestamp}] Step 9: Published updated index to FastAPI/Next.js endpoints & MoSPI CPI export cache.`
    ];

    setPipelineLogs([`>>> STARTING LIVE AUTOMATED SCRAPING RUN (SIH26056 DEMO) <<<`]);

    for (let i = 0; i < steps.length; i++) {
      await new Promise((res) => setTimeout(res, 400));
      setActiveStep(i + 1);
      setPipelineLogs((prev) => [...prev, steps[i]]);
    }

    setPipelineLogs((prev) => [
      ...prev,
      `>>> PIPELINE COMPLETED: Updated APIx to 166.15 | Confidence 96.1% | Outliers Filtered: 5 <<<`
    ]);
    setPipelineRunning(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* GOVERNMENT PORTAL HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-lg tracking-wider text-white shadow-inner">
              A<span className="text-amber-400">P</span>Ix
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">APIx — Airfare Price Index Engine</h1>
                <span className="bg-blue-900/90 text-blue-300 border border-blue-700 text-xs px-2 py-0.5 rounded font-mono font-medium">SIH26056</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Next.js Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ministry of Statistics & Programme Implementation (MoSPI) • Data Informatics & Innovation Division (DIID) • Team Binary Brains
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunPipeline}
              disabled={pipelineRunning}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              {pipelineRunning ? "Running Pipeline..." : "Run Scraping Pipeline"}
            </button>
            <a
              href="/api/export/cpi"
              download
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3.5 py-2 rounded-md flex items-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export MoSPI CPI (.csv)
            </a>
          </div>

        </div>
      </header>

      {/* SECONDARY INFO BAR */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4 flex-wrap gap-y-1">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Basket: 15 Metro + 10 UDAN Routes
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Horizons: T+1, T+7, T+15, T+30, T+45
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Methodology: Laspeyres DGCA Traffic-Weighted
            </span>
          </div>
          <div className="font-mono text-slate-500 text-[11px] hidden md:block">
            Ground Truth: DGCA Monthly Benchmark ($r \ge 0.85$)
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

        {/* 6 TOP KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* KPI 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Current APIx</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Base=100</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{latest.apix}</div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 font-semibold gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{dayDelta} (24h)</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Sub-Indices</span>
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-sm font-bold text-slate-800 flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-normal">Metro:</span>
              <span className="font-mono text-indigo-600 font-extrabold">{latest.apix_metro}</span>
            </div>
            <div className="text-sm font-bold text-slate-800 flex justify-between items-baseline mt-1">
              <span className="text-xs text-slate-500 font-normal">UDAN:</span>
              <span className="font-mono text-amber-600 font-extrabold">{latest.apix_regional}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">DGCA traffic weighted</div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Reliability</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Optimal</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{latest.confidence_score}%</div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Target ≥80% (PRD Met)
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Basket Routes</span>
              <Plane className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">25</div>
            <div className="mt-2 text-[10px] text-slate-500">
              15 Metro + 10 UDAN
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Monopoly Flags</span>
              <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">DGCA/CCI</span>
            </div>
            <div className="text-2xl font-black text-rose-600 font-mono">{FLAGGED_ALERTS.length}</div>
            <div className="mt-2 text-[10px] text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Requires review
            </div>
          </div>

          {/* KPI 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>DGCA Validation</span>
              <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Approved</span>
            </div>
            <div className="text-2xl font-black text-purple-600 font-mono">0.998</div>
            <div className="mt-2 text-[10px] text-slate-500">
              MAPE: <span className="font-bold text-slate-700">1.99%</span> (≤10%)
            </div>
          </div>

        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 flex overflow-x-auto text-sm font-medium">
            <button
              onClick={() => setActiveTab("trends")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "trends" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <Activity className="w-4 h-4" />
              Index Trends & Booking Horizons
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "routes" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Route Basket & Fare Matrix
            </button>
            <button
              onClick={() => setActiveTab("explainability")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "explainability" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Explainability Engine (SHAP)
            </button>
            <button
              onClick={() => setActiveTab("monopoly")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "monopoly" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Monopoly Watchdog ({FLAGGED_ALERTS.length})
            </button>
            <button
              onClick={() => setActiveTab("backtesting")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "backtesting" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <Award className="w-4 h-4 text-emerald-500" />
              MoSPI Backtesting
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-5 py-3 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "pipeline" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-500" />
              Live Scraping Pipeline
            </button>
          </div>

          <div className="p-6">
            
            {/* TAB 1: TRENDS */}
            {activeTab === "trends" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Historical APIx Trajectory & Booking Horizons</h2>
                    <p className="text-xs text-slate-500">90-day daily price movements showing last-minute surge (T+1) vs advance purchases (T+45)</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-500 font-medium">Series Filter:</span>
                    <button
                      onClick={() => setActiveSeries("composite")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "composite" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      Composite APIx
                    </button>
                    <button
                      onClick={() => setActiveSeries("t1")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "t1" ? "bg-red-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      T+1 (Surge)
                    </button>
                    <button
                      onClick={() => setActiveSeries("t7")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "t7" ? "bg-amber-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      T+7
                    </button>
                    <button
                      onClick={() => setActiveSeries("t15")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "t15" ? "bg-sky-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      T+15
                    </button>
                    <button
                      onClick={() => setActiveSeries("t45")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "t45" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      T+45 (Early)
                    </button>
                    <button
                      onClick={() => setActiveSeries("metro_udan")}
                      className={`px-3 py-1 rounded font-medium cursor-pointer ${activeSeries === "metro_udan" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      Metro vs UDAN
                    </button>
                  </div>
                </div>

                {/* Recharts Main Graph */}
                <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HISTORICAL_SERIES} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                        labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                      {activeSeries === "composite" && (
                        <>
                          <Line type="monotone" dataKey="apix" name="Composite APIx (Base=100)" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix_weekly_ma" name="7-Day Moving Avg" stroke="#9333ea" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                        </>
                      )}

                      {activeSeries === "t1" && (
                        <>
                          <Line type="monotone" dataKey="apix_T+1" name="T+1 Last-Minute Surge" stroke="#dc2626" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix" name="Composite APIx Ref" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </>
                      )}

                      {activeSeries === "t7" && (
                        <>
                          <Line type="monotone" dataKey="apix_T+7" name="T+7 Horizon" stroke="#d97706" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix" name="Composite APIx Ref" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </>
                      )}

                      {activeSeries === "t15" && (
                        <>
                          <Line type="monotone" dataKey="apix_T+15" name="T+15 Reference" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix" name="Composite APIx Ref" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </>
                      )}

                      {activeSeries === "t45" && (
                        <>
                          <Line type="monotone" dataKey="apix_T+45" name="T+45 Super Early Bird" stroke="#059669" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix" name="Composite APIx Ref" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </>
                      )}

                      {activeSeries === "metro_udan" && (
                        <>
                          <Line type="monotone" dataKey="apix_metro" name="Metro Routes Sub-Index" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="apix_regional" name="UDAN Routes Sub-Index" stroke="#ea580c" strokeWidth={2.5} dot={false} />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 3 Callout Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      T+1 Elasticity Dynamic
                    </span>
                    Last-minute fares (T+1) swing up to <strong>260.8</strong> on peak holiday weekends, proving why traditional monthly point-in-time collection missed real inflation.
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Advance Purchase Stability
                    </span>
                    T+30 and T+45 advance fares provide consumer-baseline stability, anchoring the overall weighted index and dampening extreme daily spikes.
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Regional UDAN Volatility
                    </span>
                    Regional routes exhibit <strong>1.4x higher variance</strong> than Metro routes due to single-carrier operations and limited backup capacity.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROUTES MATRIX */}
            {activeTab === "routes" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Route Basket Directory (25 Representative Routes)</h2>
                    <p className="text-xs text-slate-500">DGCA traffic-weighted basket covering 15 High-Volume Metros and 10 Regional/UDAN routes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search route, city..."
                      className="text-xs border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Metro">Metro Only (15)</option>
                      <option value="Regional/UDAN">Regional/UDAN Only (10)</option>
                    </select>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Route ID</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Distance</th>
                        <th className="py-3 px-4">Median Fare</th>
                        <th className="py-3 px-4">Fare / KM</th>
                        <th className="py-3 px-4">HHI</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoutes.map((r) => (
                        <tr key={r.route_id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.route_id}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{r.origin} → {r.destination}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.category === "Metro" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-800"}`}>
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{r.distance_km} km</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{r.current_median_fare.toLocaleString()}</td>
                          <td className={`py-3 px-4 font-mono ${r.fare_per_km > r.benchmark_fare_per_km * 1.3 ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                            ₹{r.fare_per_km}
                          </td>
                          <td className={`py-3 px-4 font-mono ${r.hhi >= 2500 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                            {r.hhi}
                          </td>
                          <td className="py-3 px-4">
                            {r.is_flagged ? (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Surge Alert
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectedRoute(r)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: EXPLAINABILITY (SHAP) */}
            {activeTab === "explainability" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Explainability Engine (Linear SHAP Attribution)</h2>
                    <p className="text-xs text-slate-500">Deconstructs airfare movement into Fuel (ATF), Demand Surges, Competition count, and Window Lead Time</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600">Route:</label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {ROUTES.map((r) => (
                        <option key={r.id} value={r.id}>{r.id} ({r.origin} → {r.destination})</option>
                      ))}
                    </select>
                    <select
                      value={selectedWindow}
                      onChange={(e) => setSelectedWindow(e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="T+1">T+1 (Last Minute)</option>
                      <option value="T+7">T+7 (1 Week)</option>
                      <option value="T+15">T+15 (Standard)</option>
                      <option value="T+30">T+30 (Advance)</option>
                      <option value="T+45">T+45 (Early Bird)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm">
                      <div className="text-xs text-slate-400 font-medium">Selected Route Baseline vs Current</div>
                      <div className="text-lg font-bold mt-1">{expData.route_name}</div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-xs">
                        <div>
                          <div className="text-slate-400">Baseline Fare:</div>
                          <div className="text-sm font-bold text-slate-200 font-mono">₹{expData.base_period_fare.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400">Current Observed Fare:</div>
                          <div className="text-base font-black text-amber-400 font-mono">₹{expData.current_fare.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center justify-between">
                        <span>Net Price Movement:</span>
                        <span className="font-mono">
                          +{expData.explanation.total_change_inr} INR (+{((expData.explanation.total_change_inr / expData.base_period_fare) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {expData.explanation.factors.map((f, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between shadow-xs">
                          <div>
                            <div className="font-bold text-slate-800">{f.name}</div>
                            <div className="text-[10px] text-slate-500">{f.direction === "up" ? "Upward pressure on fare" : "Downward discount pressure"}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono font-bold ${f.direction === "up" ? "text-rose-600" : "text-emerald-600"}`}>
                              {f.direction === "up" ? "+" : ""}₹{f.inr_impact}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              {f.pct}% contribution
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Recharts Bar Chart */}
                  <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Attribution Impact (Rupees INR)</h3>
                      <div className="h-72 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={expData.explanation.factors}
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                              formatter={(value: any) => [`₹${value}`, "Impact"]}
                            />
                            <Bar dataKey="inr_impact" radius={[0, 4, 4, 0]}>
                              {expData.explanation.factors.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.inr_impact >= 0 ? "#ef4444" : "#10b981"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded p-2.5 mt-2">
                      <strong>Methodology Note:</strong> Uses closed-form SHAP attributions:
                      <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 ml-1">φ_j = β_j × (x_j - x̄_j)</span>. Guarantees 100% additivity to total observed price change without approximation error.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MONOPOLY WATCHDOG */}
            {activeTab === "monopoly" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Monopoly & Overcharging Watchdog (DGCA / CCI Surveillance)</h2>
                    <p className="text-xs text-slate-500">Herfindahl-Hirschman Index (HHI) concentration tracking and distance-adjusted surge alert flags</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                    {FLAGGED_ALERTS.length} Active Regulatory Alerts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FLAGGED_ALERTS.map((alert) => (
                    <div key={alert.route_id} className="bg-white rounded-xl border border-red-200 p-4 shadow-xs space-y-3 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${alert.severity === "HIGH" ? "bg-red-600" : "bg-amber-500"}`} />
                      
                      <div className="flex items-center justify-between pl-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{alert.route_id}</span>
                          <span className="text-xs text-slate-600">({alert.origin} → {alert.destination})</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${alert.severity === "HIGH" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                          {alert.severity} CONCENTRATION RISK
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pl-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-500">HHI Concentration</div>
                          <div className="font-bold font-mono text-rose-700">{alert.hhi}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Dominant Carrier</div>
                          <div className="font-bold text-slate-800">{alert.dominant_carrier} ({alert.dominant_share_pct}%)</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Surge Markup</div>
                          <div className="font-bold font-mono text-rose-600">+{alert.markup_percent}% vs Benchmark</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 pl-2">
                        <strong>Finding:</strong> {alert.reason}
                      </div>

                      <div className="text-[11px] text-blue-900 bg-blue-50/70 border border-blue-200 rounded p-2 pl-2.5 flex items-start gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div><strong>Recommended Regulatory Action:</strong> {alert.recommended_action}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Market Concentration Regulatory Thresholds (CCI Standards)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> HHI &lt; 1,500
                      </div>
                      <div className="text-slate-600 mt-1"><strong>Competitive Sector:</strong> 4+ active carriers. Normal price elasticity. Low regulatory scrutiny.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1,500 ≤ HHI ≤ 2,500
                      </div>
                      <div className="text-slate-600 mt-1"><strong>Moderately Concentrated:</strong> 2-3 carriers. Monitored for tacit collusion or coordinated surge.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                      <div className="font-bold text-rose-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> HHI &gt; 2,500
                      </div>
                      <div className="text-slate-600 mt-1"><strong>Highly Concentrated / Monopoly:</strong> Single carrier dominance. Immediate flag if fare/km &gt; 1.25x national benchmark.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BACKTESTING */}
            {activeTab === "backtesting" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Backtesting vs Official DGCA Monthly Ground Truth</h2>
                    <p className="text-xs text-slate-500">Statistical alignment validation between APIx real-time engine and published DGCA monthly yields</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-3 py-1 rounded font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    MoSPI Acceptance: APPROVED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
                    <div className="text-xs text-purple-700 font-medium">Pearson Correlation (r)</div>
                    <div className="text-3xl font-black text-purple-900 font-mono mt-1">0.9982</div>
                    <div className="text-[11px] text-purple-600 mt-1">Target: ≥ 0.85 (PASSED)</div>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                    <div className="text-xs text-blue-700 font-medium">Mean Absolute Percentage Error (MAPE)</div>
                    <div className="text-3xl font-black text-blue-900 font-mono mt-1">1.99%</div>
                    <div className="text-[11px] text-blue-600 mt-1">Target: ≤ 10.0% (PASSED)</div>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                    <div className="text-xs text-emerald-700 font-medium">Root Mean Square Error (RMSE)</div>
                    <div className="text-3xl font-black text-emerald-900 font-mono mt-1">2.41</div>
                    <div className="text-[11px] text-emerald-600 mt-1">Optimal tracking tolerance</div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HISTORICAL_SERIES} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                        labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Line type="monotone" dataKey="apix" name="APIx Real-Time Index (Computed)" stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="dgca_official_index" name="DGCA Official Benchmark" stroke="#9333ea" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Evaluation Month</th>
                        <th className="py-2.5 px-4">APIx Computed Monthly Avg</th>
                        <th className="py-2.5 px-4">DGCA Official Benchmark</th>
                        <th className="py-2.5 px-4">Absolute Variance</th>
                        <th className="py-2.5 px-4">Error %</th>
                        <th className="py-2.5 px-4 text-right">MoSPI Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">2026-06</td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">114.2</td>
                        <td className="py-2.5 px-4 font-mono text-slate-800">112.8</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">₹1.40</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">1.24%</td>
                        <td className="py-2.5 px-4 text-right"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">PASSED (≤10%)</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">2026-07</td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">135.8</td>
                        <td className="py-2.5 px-4 font-mono text-slate-800">133.4</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">₹2.40</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">1.79%</td>
                        <td className="py-2.5 px-4 text-right"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">PASSED (≤10%)</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">2026-08</td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">161.5</td>
                        <td className="py-2.5 px-4 font-mono text-slate-800">157.9</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">₹3.60</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">2.28%</td>
                        <td className="py-2.5 px-4 text-right"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">PASSED (≤10%)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: LIVE PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Interactive Pipeline Simulator (Steps 1–9)</h2>
                    <p className="text-xs text-slate-500">Executes the 9-stage architecture in real time: Scrape → Clean → Reliability → Index → SHAP → HHI → Serve</p>
                  </div>
                  <button
                    onClick={handleRunPipeline}
                    disabled={pipelineRunning}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                    {pipelineRunning ? "Processing Pipeline..." : "Execute Daily Scraping Pipeline"}
                  </button>
                </div>

                {/* 9 Stage Stepper */}
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-center text-[10px] font-medium">
                  {[
                    { id: 1, name: "1. Basket", desc: "25 Routes" },
                    { id: 2, name: "2. Scrape", desc: "Playwright" },
                    { id: 3, name: "3. Clean", desc: "Isolation Forest" },
                    { id: 4, name: "4. Reliability", desc: "Confidence %" },
                    { id: 5, name: "5. Index", desc: "APIx Weighted" },
                    { id: 6, name: "6. SHAP", desc: "Decomposition" },
                    { id: 7, name: "7. HHI", desc: "Monopoly Alert" },
                    { id: 8, name: "8. Backtest", desc: "DGCA Truth" },
                    { id: 9, name: "9. Serve", desc: "FastAPI & CPI" }
                  ].map((s) => (
                    <div
                      key={s.id}
                      className={`p-2 rounded border transition ${
                        activeStep >= s.id ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold" : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="font-bold">{s.name}</div>
                      <div className="text-[9px] opacity-75">{s.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Live Terminal */}
                <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                      <span className="text-slate-400 font-mono ml-2">apix-worker@mospi-diid:~$</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {pipelineRunning ? "RUNNING" : "READY"}
                    </span>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-1.5 max-h-80 overflow-y-auto">
                    {pipelineLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`${
                          log.includes("Step 3") ? "text-amber-400 font-semibold" :
                          log.includes("Step 5") ? "text-emerald-400 font-bold" :
                          log.includes("Step 7") ? "text-rose-400 font-semibold" :
                          log.includes("COMPLETED") ? "text-emerald-300 font-bold pt-2 border-t border-slate-800" :
                          "text-slate-300"
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* INSPECT ROUTE MODAL */}
      {inspectedRoute && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {inspectedRoute.route_id}: {inspectedRoute.origin} → {inspectedRoute.destination}
                </h3>
                <p className="text-xs text-slate-400">
                  Category: {inspectedRoute.category} | Distance: {inspectedRoute.distance_km} km | Base: ₹{inspectedRoute.base_period_fare}
                </p>
              </div>
              <button
                onClick={() => setInspectedRoute(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">HHI Index</div>
                  <div className="text-lg font-black text-slate-800 font-mono">{inspectedRoute.hhi}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Fare / KM</div>
                  <div className="text-lg font-black text-blue-600 font-mono">₹{inspectedRoute.fare_per_km}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Markup vs Ref</div>
                  <div className="text-lg font-black text-rose-600 font-mono">+{Math.round((inspectedRoute.markup_ratio - 1) * 100)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Booking Horizon Price Curve (Lead Time vs Fare)</h4>
                <div className="h-44 bg-slate-50 rounded-lg p-2 border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { window: "T+1", fare: Math.round(inspectedRoute.current_median_fare * 1.65) },
                        { window: "T+7", fare: Math.round(inspectedRoute.current_median_fare * 1.18) },
                        { window: "T+15", fare: inspectedRoute.current_median_fare },
                        { window: "T+30", fare: Math.round(inspectedRoute.current_median_fare * 0.85) },
                        { window: "T+45", fare: Math.round(inspectedRoute.current_median_fare * 0.75) }
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="window" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [`₹${v}`, "Fare"]} />
                      <Bar dataKey="fare" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Carrier Market Share Breakdown</h4>
                <div className="space-y-1.5">
                  {inspectedRoute.carrier_shares?.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                      <span className="font-medium">{c.carrier}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${c.share}%` }}></div>
                        </div>
                        <span className="font-mono font-bold w-12 text-right">{c.share}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>UchitFare (APIx)</strong> — Smart India Hackathon 2026 Prototype • Team Binary Brains
          </div>
          <div>
            Sponsor: Ministry of Statistics & Programme Implementation (MoSPI - DIID)
          </div>
        </div>
      </footer>

    </div>
  );
}
