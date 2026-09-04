"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Filter, Search, CheckCircle2, XCircle } from "lucide-react";

export default function AnomalyInspector() {
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("ALL");

  const anomalyRecords = [
    { id: "ANM-8021", route: "DEL-BOM", carrier: "IndiGo", rawFare: 48500, cleanedFare: 7200, score: -0.34, reason: "Business Class Glitch in Economy Basket", date: "Today, 06:12" },
    { id: "ANM-8022", route: "BOM-IXU", carrier: "IndiGo", rawFare: 36000, cleanedFare: 8400, score: -0.29, reason: "OCR / Scraper Text Parse Anomaly", date: "Today, 06:14" },
    { id: "ANM-8023", route: "DEL-CCU", carrier: "Air India", rawFare: 42000, cleanedFare: 6800, score: -0.31, reason: "First Suite Fare Leakage", date: "Yesterday, 18:30" },
    { id: "ANM-8024", route: "BLR-IXG", carrier: "Star Air", rawFare: 290, cleanedFare: 3800, score: -0.42, reason: "Missing Base Fare Zero Glitch", date: "Yesterday, 14:22" },
    { id: "ANM-8025", route: "GAU-IMF", carrier: "AI Express", rawFare: 28500, cleanedFare: 4200, score: -0.27, reason: "Extreme Flash Spike (>5x Median)", date: "03 Sep, 20:10" },
    { id: "ANM-8026", route: "DEL-IXL", carrier: "SpiceJet", rawFare: -120, cleanedFare: 5500, score: -0.68, reason: "Negative Price OTA API Return", date: "02 Sep, 08:45" },
    { id: "ANM-8027", route: "BOM-BLR", carrier: "Akasa Air", rawFare: 39500, cleanedFare: 5100, score: -0.28, reason: "Multi-leg Multiplier Misclassification", date: "01 Sep, 12:18" }
  ];

  const filtered = anomalyRecords.filter((rec) => {
    const matchesSearch = rec.route.toLowerCase().includes(search.toLowerCase()) ||
      rec.carrier.toLowerCase().includes(search.toLowerCase()) ||
      rec.reason.toLowerCase().includes(search.toLowerCase());
    const matchesReason = filterReason === "ALL" || rec.reason.includes(filterReason);
    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight">Scikit-learn Isolation Forest Cleaning Audit Log</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                Unsupervised Anomaly Filter
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 max-w-2xl">
              Strictly purifies raw web scraped data before index calculation. Eliminates OCR glitches, misclassified premium cabin seats, and negative API returns to safeguard official CPI integrity.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center font-mono text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block">Total Scraped</span>
              <span className="text-sm font-bold text-white">38,250</span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block">Outliers Excluded</span>
              <span className="text-sm font-bold text-amber-300">371 (1.2%)</span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block">Cleaned Integrity</span>
              <span className="text-sm font-bold text-emerald-400">98.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by route, carrier, or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Issue:</span>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Detected Anomalies</option>
            <option value="Business">Business Suite Leaks</option>
            <option value="OCR">OCR / Scraper Glitches</option>
            <option value="Negative">Negative / Zero Fares</option>
            <option value="Flash">Extreme Flash Spikes</option>
          </select>
        </div>
      </div>

      {/* Anomaly Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Route Corridor</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4 text-right">Raw Scraped Fare</th>
                <th className="py-3 px-4 text-right">Purified Value</th>
                <th className="py-3 px-4 text-center">IF Score</th>
                <th className="py-3 px-4">Detected Issue & Action Taken</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 font-mono">
                  <td className="py-3 px-4 font-bold text-slate-700 font-sans">{rec.id}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-700">{rec.route}</td>
                  <td className="py-3 px-4 font-sans text-slate-800">{rec.carrier}</td>
                  <td className="py-3 px-4 text-right text-rose-600 font-bold line-through">
                    ₹{rec.rawFare.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                    ₹{rec.cleanedFare.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                      {rec.score}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      {rec.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans text-slate-400 text-[11px]">
                    {rec.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
