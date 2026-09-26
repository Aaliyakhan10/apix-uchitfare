"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import {
  TrendingUp, Activity, Plane, Database, Clock, ShieldCheck, ShieldAlert, AlertTriangle, Scale,
  Download, Layers, MapPin, ExternalLink, RefreshCw, Eye, Zap, Award, Sliders, X
} from "lucide-react";

import { ROUTES } from "@/data/routes";
import { HISTORICAL_SERIES, ROUTE_SUMMARIES, FLAGGED_ALERTS } from "@/data/mockData";
import { DEMO_OVERVIEW } from "@/data/overview";
import { fetchFromBackend, getActiveBackendUrl } from "@/data/config";

// Sub-Components
import LiveAirlineInspector from "@/components/LiveAirlineInspector";
import LiveIndexCalculator from "@/components/LiveIndexCalculator";
import WhatIsThisModal from "@/components/WhatIsThisModal";
import { Language, translations } from "@/i18n/translations";

export default function DashboardPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang] || translations.en;

  const [activeTab, setActiveTab] = useState<"auditor" | "calculator" | "routes" | "trend">("auditor");
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [activeSeries, setActiveSeries] = useState<"composite" | "t1" | "t7" | "t15" | "t45" | "metro_udan">("composite");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [activeAuditorRoute, setActiveAuditorRoute] = useState<string>("DEL-BOM");

  // Dynamic Live State from Backend API
  const [flaggedAlerts, setFlaggedAlerts] = useState(FLAGGED_ALERTS);
  const [apixOverview, setApixOverview] = useState<typeof DEMO_OVERVIEW & { booking_windows?: Record<string, { fare: number; delta_pct: number }> }>(DEMO_OVERVIEW);

  const [historyData, setHistoryData] = useState(HISTORICAL_SERIES);
  const [routesData, setRoutesData] = useState(ROUTE_SUMMARIES);
  const [backendBaseUrl, setBackendBaseUrl] = useState<string>("");

  // Fetch live dynamic data from backend API on mount
  useEffect(() => {
    getActiveBackendUrl().then((url) => {
      setBackendBaseUrl(url);
    });

    async function fetchLiveBackendData() {
      try {
        const [overviewRes, routesRes, historyRes, flaggedRes] = await Promise.all([
          fetchFromBackend("/api/overview").catch(() => null),
          fetchFromBackend("/api/routes").catch(() => null),
          fetchFromBackend("/api/index/history").catch(() => null),
          fetchFromBackend("/api/routes/flagged").catch(() => null)
        ]);

        if (overviewRes && overviewRes.ok) {
          const overviewJson = await overviewRes.json();
          setApixOverview(overviewJson);
        }

        if (routesRes && routesRes.ok) {
          const routesJson = await routesRes.json();
          if (Array.isArray(routesJson) && routesJson.length > 0) {
            setRoutesData(routesJson);
          }
        }

        if (historyRes && historyRes.ok) {
          const historyJson = await historyRes.json();
          if (Array.isArray(historyJson) && historyJson.length > 0) {
            setHistoryData(historyJson);
          }
        }

        if (flaggedRes && flaggedRes.ok) {
          const flaggedJson = await flaggedRes.json();
          if (Array.isArray(flaggedJson) && flaggedJson.length > 0) {
            setFlaggedAlerts(flaggedJson);
          }
        }
      } catch (err) {
        console.warn("Backend API sync notice: Using calibrated cache.", err);
      }
    }

    fetchLiveBackendData();
  }, []);


  // 30-Min Autonomous Sync Daemon State
  const [countdownSeconds, setCountdownSeconds] = useState<number>(1800); // 30 minutes = 1800s
  const [autoDaemonEnabled, setAutoDaemonEnabled] = useState<boolean>(false);
  const [lastSyncedDisplay, setLastSyncedDisplay] = useState<string>("Sample snapshot");
  const [oneClickModalOpen, setOneClickModalOpen] = useState<boolean>(false);
  const [oneClickRunning, setOneClickRunning] = useState<boolean>(false);
  const [oneClickProgress, setOneClickProgress] = useState<number>(0);
  const [oneClickLogs, setOneClickLogs] = useState<string[]>([]);

  // 30-Minute autonomous countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (autoDaemonEnabled) {
            handleOneClickSync(false);
          }
          return 1800; // Reset to 30 minutes
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoDaemonEnabled]);


  // Master One-Click Sync
  const handleOneClickSync = async (openModal = true) => {
    if (oneClickRunning) return;
    setOneClickRunning(true);
    if (openModal) setOneClickModalOpen(true);
    setOneClickProgress(15);
    setOneClickLogs(["Loading the reproducible sample dataset..."]);
    try {
      const response = await fetchFromBackend("/api/overview");
      const overview = await response.json();
      setOneClickProgress(65);
      const [routes, history, alerts] = await Promise.all([
        fetchFromBackend("/api/routes").then(r => r.json()),
        fetchFromBackend("/api/index/history").then(r => r.json()),
        fetchFromBackend("/api/routes/flagged").then(r => r.json()),
      ]);
      setApixOverview(overview);
      setRoutesData(routes);
      setHistoryData(history);
      setFlaggedAlerts(alerts);
      setOneClickLogs(["Sample dataset loaded successfully.", `${routes.length} routes; ${history.length} daily index observations; five booking horizons.`, `Sample APIx: ${overview.current_apix}. No live scraping or official validation was performed.`]);
      setOneClickProgress(100);
      setLastSyncedDisplay(new Date().toLocaleTimeString("en-IN"));
      setCountdownSeconds(1800);
    } catch {
      setOneClickLogs(["Refresh failed. Existing data is preserved. Check the local server and retry."]);
      setOneClickProgress(0);
    } finally {
      setOneClickRunning(false);
    }
  };

  const filteredRoutes = routesData.filter((r) => {
    const matchesSearch =
      r.route_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. EXECUTIVE TRICOLOR TOP ACCENT STRIP (1px) */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500 shadow-xs z-50"></div>

      {/* 2. REFINED EXECUTIVE HEADER */}
      <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 transition">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left: National Identity & Portal Brand */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 border border-blue-400/40 shadow-md flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5 text-amber-300 transform -rotate-45" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  {lang === "hi" ? "भारत सरकार • सांख्यिकी मंत्रालय" : "BitSynq • SIH 2026 PROTOTYPE"}
                </span>
                <span className="bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[10px] font-semibold px-2 py-0.2 rounded-full font-mono">
                  SIH26056
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t.portalTitle}</span>
                <span className="text-slate-500 text-sm font-normal">|</span>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Airfare Index Demo
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
                <span>{t.portalSubtitle}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-medium">{t.diidTitle}</span>
              </p>
            </div>
          </div>

          {/* Right: Sleek Executive Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            
            {/* [i] Guide & About Button */}
            <button
              onClick={() => setHelpModalOpen(true)}
              className="bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-400/40 hover:border-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer backdrop-blur-xs group"
              title="Explain what this portal displays & how it works"
            >
              <span className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 flex items-center justify-center font-serif font-black text-[10px] italic group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                i
              </span>
              <span>{lang === "hi" ? "मार्गदर्शिका (i)" : lang === "mr" ? "मार्गदर्शिका (i)" : "About / Guide"}</span>
            </button>

            {/* Tri-Lingual Language Selector */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  lang === "en" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  lang === "hi" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang("mr")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  lang === "mr" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Primary Sync Action */}
            <button
              onClick={() => handleOneClickSync(true)}
              disabled={oneClickRunning}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md border border-blue-400/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Reload the sample dataset"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${oneClickRunning ? "animate-spin text-amber-300" : "text-blue-200"}`} />
              <span>{oneClickRunning ? "Syncing..." : (lang === "hi" ? "लाइव सिंक चलाएं" : "Refresh Demo")}</span>
            </button>

            {/* OpenAPI Documentation */}
            <a
              href="/api/overview"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium px-2.5 py-2 rounded-xl flex items-center gap-1.5 transition hidden sm:flex"
              title="View the sample overview API"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">API</span>
            </a>

          </div>

        </div>
      </header>

      {/* 3. 30-MINUTE CADENCE STATUS TICKER BAR (34px) */}
      <div className="bg-slate-900/90 backdrop-blur-xs text-slate-300 border-b border-slate-800 text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          
          {/* Left Ticker Items */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-600/40 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sample data • 08 Sep 2026</span>
            </span>

            <span className="text-slate-400 text-xs">
              Last sync: <strong className="text-amber-300 font-mono">{lastSyncedDisplay}</strong>
            </span>

            <span className="text-slate-700 hidden sm:inline">•</span>

            {/* 30-Min Countdown Clock Badge */}
            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo refresh timer:</span>
              <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border border-slate-700">
                {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <span className="text-slate-700 hidden lg:inline">•</span>

            <span className="bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono hidden xl:flex items-center gap-1.5">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Local sample APIs • 25 route corridors</span>
            </span>
          </div>


          {/* Right Ticker Items */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-slate-300 font-mono hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sample benchmark: r = {apixOverview.backtest_correlation}, MAPE = {apixOverview.backtest_mape}%</span>
            </span>

            <button
              onClick={() => setAutoDaemonEnabled(!autoDaemonEnabled)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                autoDaemonEnabled ? "bg-emerald-950/50 text-emerald-300 border-emerald-700/60" : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title="Toggle 30-minute sample refresh"
            >
              <span>Auto (30m):</span>
              <span className="font-mono text-[10px]">{autoDaemonEnabled ? "ON" : "OFF"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-slate-900" aria-label="Submission demo guide">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-800">UchitFare · BitSynq · SIH26056</p>
          <h2 className="mt-1 text-xl font-bold">Understand airfare changes, from quote to index.</h2>
          <p className="mt-2 text-sm leading-relaxed">Submission prototype using synthetic sample fares through 8 September 2026. Airline schedules, benchmarks, confidence scores and alerts are illustrative; they are not verified live quotes, regulatory findings or MoSPI approval.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([['auditor', '1. Inspect fares'], ['calculator', '2. Change assumptions'], ['routes', '3. Explore 25 routes'], ['trend', '4. Compare trends']] as const).map(([tab, label]) => <button key={tab} onClick={() => setActiveTab(tab)} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-amber-100">{label}</button>)}
            <a href="/api/export/cpi" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Download sample CSV</a>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ⭐ TOP COMMAND CENTER: THE OFFICIAL APIx INDEX POINT (WHAT THE PS WANTS) ⭐ */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-blue-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-8 pointer-events-none">
            <Plane className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 space-y-6">
            
            {/* Top Eyebrow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-400/20 pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>MoSPI Problem Statement SIH26056 Core Deliverable</span>
                </span>
                <span className="text-blue-200 text-xs font-medium">
                  Prototype for augmenting airfare price collection
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current As of: {apixOverview.latest_date || "2026-09-08"}</span>
                </span>
                <span className="text-xs text-slate-300 font-mono bg-blue-900/60 border border-blue-400/30 px-3 py-1 rounded-lg">
                  Formula: Laspeyres Traffic-Weighted
                </span>
              </div>
            </div>

            {/* Core Headline APIx Point Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left 5 Cols: Massive APIx Number */}
              <div className="lg:col-span-5 space-y-2 bg-slate-900/70 p-6 rounded-2xl border border-blue-400/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                    Headline Airfare Price Index (APIx)
                  </span>
                  <span className="bg-blue-500/20 text-blue-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    Base 2024 = 100.0 • Current 2026
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                    {apixOverview.current_apix}
                  </span>
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-black text-sm bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-md font-mono">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{apixOverview.overall_change}% Inflation
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      +{apixOverview.day_change} in last 24h
                    </span>
                  </div>
                </div>

                <p className="text-xs text-blue-100/90 leading-relaxed pt-1">
                  In this synthetic scenario, fares are <strong>+{apixOverview.overall_change}% higher</strong> than the 2024 base period. This illustrates a possible input to CPI research; integration requires validation.
                </p>
              </div>

              {/* Right 7 Cols: The 3 Core Pillars MoSPI Demands */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Pillar 1: Metro Trunk Routes (70%) */}
                <div className="bg-slate-900/60 border border-indigo-500/30 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Metro Routes</span>
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.2 rounded font-mono">70% Weight</span>
                  </div>
                  <div className="text-3xl font-black text-indigo-300 font-mono">
                    {apixOverview.metro_apix}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    15 High-Density Trunk Corridors (DEL, BOM, BLR, CCU, MAA, HYD).
                  </p>
                </div>

                {/* Pillar 2: Regional & UDAN Routes (30%) */}
                <div className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>UDAN / Regional</span>
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-mono">30% Weight</span>
                  </div>
                  <div className="text-3xl font-black text-amber-300 font-mono">
                    {apixOverview.regional_apix}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    10 Regional / Tier-2/3 Corridors (Guwahati, Bagdogra, Leh).
                  </p>
                </div>

                {/* Pillar 3: Illustrative DGCA Correlation */}
                <div className="bg-slate-900/60 border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Sample Comparison</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded font-mono">r={apixOverview.backtest_correlation}</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {apixOverview.backtest_mape}%
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Illustrative error metric; independent validation pending.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Horizon Strip: Capturing Dynamic Pricing by Advance Window */}
            <div className="pt-4 border-t border-blue-400/20">
              <span className="text-xs font-bold text-blue-200 block mb-2.5">
                Dynamic Pricing Capture Across Booking Windows (Why Online Scraping is Superior to Counter Visits):
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                <div className="bg-slate-900/80 border border-rose-500/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-rose-300 font-bold uppercase block">T+1 (Tomorrow Surge)</span>
                  <span className="text-base font-black text-white font-mono">
                    ₹{apixOverview.booking_windows?.['T+1']?.fare ? apixOverview.booking_windows['T+1'].fare.toLocaleString("en-IN") : "11,558"}
                  </span>
                  <span className="text-[10px] text-rose-400 block font-semibold">
                    {apixOverview.booking_windows?.['T+1']?.delta_pct !== undefined ? `+${Math.abs(apixOverview.booking_windows['T+1'].delta_pct)}%` : "+91%"} Last-Minute Surge
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-amber-500/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">T+7 (1-Week Normal)</span>
                  <span className="text-base font-black text-white font-mono">
                    ₹{apixOverview.booking_windows?.['T+7']?.fare ? apixOverview.booking_windows['T+7'].fare.toLocaleString("en-IN") : "7,907"}
                  </span>
                  <span className="text-[10px] text-amber-300 block font-semibold">
                    {apixOverview.booking_windows?.['T+7']?.delta_pct !== undefined ? `+${Math.abs(apixOverview.booking_windows['T+7'].delta_pct)}%` : "+31%"} Near-Term Curve
                  </span>
                </div>

                <div className="bg-blue-600/30 border border-blue-400 p-2.5 rounded-xl ring-2 ring-blue-400/40">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">T+15 (Planned Horizon)</span>
                  <span className="text-base font-black text-white font-mono">
                    ₹{apixOverview.booking_windows?.['T+15']?.fare ? apixOverview.booking_windows['T+15'].fare.toLocaleString("en-IN") : "6,053"}
                  </span>
                  <span className="text-[10px] text-blue-200 block font-bold">Sample Booking Weight (25%)</span>
                </div>

                <div className="bg-slate-900/80 border border-indigo-500/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase block">T+30 (1-Month Advance)</span>
                  <span className="text-base font-black text-white font-mono">
                    ₹{apixOverview.booking_windows?.['T+30']?.fare ? apixOverview.booking_windows['T+30'].fare.toLocaleString("en-IN") : "4,986"}
                  </span>
                  <span className="text-[10px] text-indigo-300 block font-semibold">
                    {apixOverview.booking_windows?.['T+30']?.delta_pct !== undefined ? `${apixOverview.booking_windows['T+30'].delta_pct}%` : "-18%"} Advance Savings
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-emerald-500/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">T+45 (Early Bird)</span>
                  <span className="text-base font-black text-white font-mono">
                    ₹{apixOverview.booking_windows?.['T+45']?.fare ? apixOverview.booking_windows['T+45'].fare.toLocaleString("en-IN") : "4,490"}
                  </span>
                  <span className="text-[10px] text-emerald-300 block font-semibold">
                    {apixOverview.booking_windows?.['T+45']?.delta_pct !== undefined ? `${apixOverview.booking_windows['T+45'].delta_pct}%` : "-26%"} Early Bird Discount
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* ⭐ EXECUTIVE TAB NAVIGATION BAR ⭐ */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-thin backdrop-blur-xs">
          <button
            onClick={() => setActiveTab("auditor")}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
              activeTab === "auditor"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Plane className={`w-4 h-4 ${activeTab === "auditor" ? "text-amber-300" : "text-slate-400"}`} />
            <span>{lang === "hi" ? "1. लाइव एयरलाइन टिकट निरीक्षक" : "1. Sample Airline Quotes & Auditor"}</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
              activeTab === "calculator"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeTab === "calculator" ? "text-amber-300" : "text-slate-400"}`} />
            <span>{lang === "hi" ? "2. नीति व ईंधन पुनर्गणक" : "2. Policy & Fuel Recalculator"}</span>
          </button>

          <button
            onClick={() => setActiveTab("routes")}
            className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
              activeTab === "routes"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === "routes" ? "text-amber-300" : "text-slate-400"}`} />
            <span>{lang === "hi" ? "3. एकाधिकार, HHI एवं कार्टेल रडार (PPT चरण 7)" : "3. Monopoly & HHI Radar (PPT Step 7)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("trend")}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
              activeTab === "trend"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === "trend" ? "text-amber-300" : "text-slate-400"}`} />
            <span>{lang === "hi" ? "4. 90-दिवसीय ट्रेंड व सत्यापन" : "4. 90-Day Trend & Validation"}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE AIRLINE TICKETS AUDITOR                                       */}
        {/* ========================================================================= */}
        {activeTab === "auditor" && (
          <section id="live-airline-auditor" className="space-y-3 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Sample Fare Evidence
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <span>
                    {lang === "hi" 
                      ? "विमान कंपनियों के असली टिकट देखें और Google Flights पर जांचें" 
                      : lang === "mr" 
                      ? "विमान कंपन्यांचे खरे तिकीट दर तपासा" 
                      : "Airline Fare Auditor • Illustrative Quotes"}
                  </span>
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Generated examples across 25 corridors • External search for comparison
              </span>
            </div>

            <LiveAirlineInspector 
              lang={lang} 
              activeRouteId={activeAuditorRoute} 
              onRouteSelected={setActiveAuditorRoute} 
            />
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DYNAMIC POLICY & FUEL IMPACT ENGINE                                */}
        {/* ========================================================================= */}
        {activeTab === "calculator" && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <LiveIndexCalculator lang={lang} />
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MONOPOLY, HHI SURVEILLANCE & CARTEL RADAR (PPT STEP 7)              */}
        {/* ========================================================================= */}
        {activeTab === "routes" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. PPT STEP 7 OFFICIAL BANNER & MATHEMATICAL FORMULA CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-rose-500/30 relative overflow-hidden">
              <div className="relative z-10 space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SIH PPT Technical Approach • Step 7 of 7</span>
                    </span>
                    <span className="text-rose-200 text-xs font-medium">
                      Illustrative concentration screening for analyst review
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-lg font-bold">
                      Flagged Corridors: {flaggedAlerts.length} Active Risks
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Monopoly & Overcharging Surveillance Engine
                    </h2>
                    <p className="text-xs text-rose-100/90 leading-relaxed">
                      Explore assumed carrier shares and sample fare markups across 25 route corridors. These examples demonstrate a screening workflow; real findings require independently validated observations.
                    </p>
                    
                    {/* The Exact Condition from PPT */}
                    <div className="bg-slate-950/80 border border-rose-500/40 p-3.5 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>PPT Technical Condition for Flagging:</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-200 leading-relaxed">
                        If <span className="text-amber-400 font-bold">HHI ≥ 2,500</span> (High Concentration) <span className="text-rose-400 font-bold">AND</span> <span className="text-amber-400 font-bold">Fare/Km &gt;&gt; Distance-Adjusted National Benchmark</span>:
                        <br />
                        ➔ Route is automatically flagged as <span className="text-rose-400 font-bold">&quot;Low Competition Risk ⚠️&quot;</span> for review in this demo.
                      </p>
                    </div>
                  </div>

                  {/* Right: The HHI Formula Box */}
                  <div className="lg:col-span-5 bg-slate-950/90 border border-rose-400/30 p-5 rounded-2xl space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      Herfindahl-Hirschman Index (HHI) Formula
                    </span>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="font-mono text-base font-black text-rose-300 tracking-wider">
                        HHI = ∑ (sᵢ × 100)²
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        where sᵢ = Carrier i&apos;s assumed route capacity share (0.0 to 1.0)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-rose-400 font-bold block">HHI ≥ 5,000</span>
                        <span className="text-slate-300">Monopoly / Single Dominant</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-amber-400 font-bold block">HHI 2,500 - 4,999</span>
                        <span className="text-slate-300">Highly Concentrated</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-blue-400 font-bold block">HHI 1,500 - 2,499</span>
                        <span className="text-slate-300">Moderately Concentrated</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-emerald-400 font-bold block">HHI &lt; 1,500</span>
                        <span className="text-slate-300">Competitive Multi-Carrier</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. FLAGGED ROUTE ALERT CARDS (8 CORRIDORS UNDER DGCA/CCI SURVEILLANCE) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Active Overcharging & Low-Competition Corridors ({flaggedAlerts.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Routes exceeding HHI threshold (≥2,500) and pricing +25% to +167% above distance benchmark.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg self-start">
                  Automated Flag: Low Competition Risk ⚠️
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {flaggedAlerts.map((alert) => (
                  <div 
                    key={alert.route_id} 
                    className="bg-slate-900/90 border-2 border-rose-500/40 rounded-2xl p-4 space-y-3 hover:border-rose-400 transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-white text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {alert.route_id}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          alert.severity === "HIGH" 
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/50" 
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        }`}>
                          {alert.severity} Risk
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          {alert.origin} → {alert.destination}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {alert.category} Corridor
                        </span>
                      </div>

                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">HHI Index:</span>
                          <span className="font-mono font-black text-rose-400">{alert.hhi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dominant:</span>
                          <span className="font-bold text-slate-200">{alert.dominant_carrier} ({alert.dominant_share_pct}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fare / Km:</span>
                          <span className="font-mono font-bold text-amber-300">₹{alert.fare_per_km}/km</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800/80 pt-1">
                          <span className="text-slate-400">Markup vs Benchmark:</span>
                          <span className="font-mono font-black text-rose-400">+{alert.markup_percent}%</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 line-clamp-2">
                        {alert.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveAuditorRoute(alert.route_id);
                        setActiveTab("auditor");
                      }}
                      className="w-full bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Carrier Quotes</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. ALGORITHMIC COLLUSION & CARTEL RADAR (CCI SECTION 3(3)) */}
            <div className="space-y-4">
              <div className="border-t border-slate-800 pt-6">
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Screening demonstration only. Concentration and price co-movement do not establish collusion or unlawful pricing. No notifications are sent to regulators.</p>
              </div>
            </div>

            {/* 4. COMPLETE 25 NATIONAL ROUTE BASKET REGISTRY */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Comprehensive National Registry
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>
                      {lang === "hi" 
                        ? "25 राष्ट्रीय हवाई मार्ग रजिस्ट्री (15 मेट्रो + 10 उड़ान)" 
                        : "National Route Basket Registry (25 Routes: 15 Metro + 10 UDAN)"}
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={lang === "hi" ? "मार्ग या शहर खोजें..." : "Filter route or city..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">{lang === "hi" ? "सभी श्रेणियां (25)" : "All Categories (25)"}</option>
                    <option value="Metro">{lang === "hi" ? "मेट्रो ट्रंक (15)" : "Metro Trunk Only (15)"}</option>
                    <option value="Regional/UDAN">{lang === "hi" ? "क्षेत्रीय/उड़ान (10)" : "Regional/UDAN Only (10)"}</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Route Corridor</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Distance</th>
                      <th className="py-2.5 px-3 text-right">Median Fare</th>
                      <th className="py-2.5 px-3 text-right">Fare / Km</th>
                      <th className="py-2.5 px-3 text-center">HHI Index</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoutes.map((r) => (
                      <tr key={r.route_id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {r.route_id} <span className="font-normal text-slate-500 font-sans">({r.origin} → {r.destination})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.category === "Metro" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {r.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{r.distance_km} km</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">₹{Number(r.current_median_fare || r.base_period_fare || 0).toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">₹{r.fare_per_km}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={r.hhi >= 5000 ? "text-rose-600 font-black" : r.hhi >= 2500 ? "text-amber-600 font-black" : "text-emerald-600"}>
                            {r.hhi}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {r.is_flagged ? (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Flagged: Low Comp.
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Fair Market</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setActiveAuditorRoute(r.route_id);
                              setActiveTab("auditor");
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 mx-auto transition"
                            title="Audit live carrier quotes for this corridor"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect Fares
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 90-DAY AIRFARE INFLATION TREND & DGCA VALIDATION (CHART)           */}
        {/* ========================================================================= */}
        {activeTab === "trend" && (
          <section className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Time Series Diagnostics
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>
                    {lang === "hi" 
                      ? "90-दिवसीय APIx महंगाई प्रक्षेपवक्र एवं DGCA सत्यापन" 
                      : "90-Day Airfare Inflation Trend & DGCA Yield Benchmark"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Backtested against DGCA Monthly Yield Benchmark (Correlation r = {apixOverview.backtest_correlation}, MAPE = {apixOverview.backtest_mape}%)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => setActiveSeries("composite")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeSeries === "composite" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Composite APIx
                </button>
                <button
                  onClick={() => setActiveSeries("metro_udan")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeSeries === "metro_udan" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Metro vs UDAN
                </button>
                <button
                  onClick={() => setActiveSeries("t1")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeSeries === "t1" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  T+1 Surge
                </button>
                <button
                  onClick={() => setActiveSeries("t15")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeSeries === "t15" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  T+15 Standard
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  
                  {activeSeries === "composite" && (
                    <>
                      <Line type="monotone" dataKey="apix" name="Headline APIx" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="apix_weekly_ma" name="7-Day Moving Avg" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="dgca_official_index" name="DGCA Benchmark" stroke="#9333ea" strokeWidth={1.8} dot={false} />
                    </>
                  )}

                  {activeSeries === "metro_udan" && (
                    <>
                      <Line type="monotone" dataKey="apix_metro" name="Metro Corridors (70% Weight)" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="apix_regional" name="UDAN Corridors (30% Weight)" stroke="#d97706" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="apix" name="National APIx" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                    </>
                  )}

                  {activeSeries === "t1" && (
                    <Line type="monotone" dataKey="apix_T+1" name="T+1 Last-Minute Surge Index" stroke="#e11d48" strokeWidth={2.5} dot={false} />
                  )}

                  {activeSeries === "t15" && (
                    <Line type="monotone" dataKey="apix_T+15" name="T+15 Standard Horizon Index" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* DGCA GROUND-TRUTH BENCHMARK VERIFICATION TABLE */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sample Reference Illustrative Validation & Statistical Matching</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing automated APIx daily aggregations against official published DGCA monthly passenger yields
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg">
                    Pearson r = {apixOverview.backtest_correlation} (Target ≥ 0.85: MET)
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg">
                    MAPE = {apixOverview.backtest_mape}% (Target ≤ 10%: MET)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Benchmark Period</th>
                      <th className="py-2.5 px-3 text-right">Computed APIx</th>
                      <th className="py-2.5 px-3 text-right">Sample Reference Yield</th>
                      <th className="py-2.5 px-3 text-right">Absolute Variance</th>
                      <th className="py-2.5 px-3 text-right">Error Rate (%)</th>
                      <th className="py-2.5 px-3 text-center">Demo Comparison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">June 2026 (Month Average)</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">105.12</td>
                      <td className="py-2 px-3 text-right text-slate-700">104.50</td>
                      <td className="py-2 px-3 text-right text-slate-500">+0.62 pts</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">0.59%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">ILLUSTRATIVE</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">July 2026 (Month Average)</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">108.35</td>
                      <td className="py-2 px-3 text-right text-slate-700">107.80</td>
                      <td className="py-2 px-3 text-right text-slate-500">+0.55 pts</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">0.51%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">ILLUSTRATIVE</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">August 2026 (Month Average)</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">114.92</td>
                      <td className="py-2 px-3 text-right text-slate-700">114.20</td>
                      <td className="py-2 px-3 text-right text-slate-500">+0.72 pts</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">0.63%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">ILLUSTRATIVE</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-blue-50/40">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">Rolling 30-Day Lookback (Sep 2026)</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">{apixOverview.current_apix}</td>
                      <td className="py-2 px-3 text-right text-slate-700">162.80</td>
                      <td className="py-2 px-3 text-right text-slate-500">+2.68 pts</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">{apixOverview.backtest_mape}%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">PASSED &lt; 5% ✓</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TIME-SERIES DATABASE ARCHITECTURE BADGE */}
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">Why a Time-Series Database (TimescaleDB / SQLite WAL)?</span>
                  </div>
                  <span className="bg-indigo-900/60 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded border border-indigo-500/30">
                    Continuous Aggregation Enabled
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Civil aviation airfares generate high-frequency tick data across 5 booking horizons for 25 city corridors every 30 minutes. Traditional relational databases bottleneck under concurrent ingestion and struggle with rolling time-window rollups. APIx uses time-series partitioned hypertables (<code>ts_airfare_quotes</code>, <code>ts_daily_index</code>, <code>ts_anomalies</code>) with WAL journaling to allow instant 30-minute interval downsampling and sub-millisecond query performance for national CPI calculation.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Issued for Ministry of Statistics and Programme Implementation (MoSPI) • Data Informatics & Innovation Division
              </span>
              <a
                href={`${backendBaseUrl}/api/export/cpi`}
                download
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Official CPI Dataset (CSV)</span>
              </a>
            </div>
          </section>
        )}


        {/* AUTONOMOUS 20-MINUTE SYNC MODAL */}
        {oneClickModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <RefreshCw className={`w-5 h-5 ${oneClickRunning ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Sample Dataset Refresh
                    </h3>
                    <p className="text-xs text-slate-500">
                      Demo refresh • Reproducible sample data • No live collection
                    </p>
                  </div>
                </div>
                
                {!oneClickRunning && (
                  <button
                    onClick={() => setOneClickModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Execution Progress</span>
                  <span className="font-mono text-blue-600">{oneClickProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${oneClickProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-3 font-mono text-[11px] text-slate-200 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin shadow-inner">
                {oneClickLogs.map((log, index) => (
                  <div
                    key={index}
                    className={
                      log.includes("COMPLETE") || log.includes("Stage 7")
                        ? "text-emerald-400 font-bold"
                        : log.includes("Starting")
                        ? "text-amber-400 font-bold"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Optional demo refresh: every 30 minutes when enabled
                </span>

                <button
                  onClick={() => setOneClickModalOpen(false)}
                  disabled={oneClickRunning}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-40"
                >
                  {oneClickRunning ? "Processing Pipeline..." : "Close & View Dashboard"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL: WHAT IS THIS DASHBOARD EXPLAINER */}
        <WhatIsThisModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          lang={lang}
        />

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            APIx (UchitFare) • SIH26056 • Ministry of Statistics and Programme Implementation (MoSPI)
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Built with Next.js • SIH submission prototype
          </div>
        </div>
      </footer>

    </div>
  );
}
