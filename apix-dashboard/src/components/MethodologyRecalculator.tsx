"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { HISTORICAL_SERIES } from "@/data/mockData";
import { Sliders, RefreshCw, Layers, CheckCircle, Info, Calculator } from "lucide-react";

export default function MethodologyRecalculator() {
  const [metroWeight, setMetroWeight] = useState(70);
  const udanWeight = 100 - metroWeight;

  // Dynamically recalculate the 90-day time series using the custom weights
  const recalculatedSeries = HISTORICAL_SERIES.map((item) => {
    const customApix = parseFloat(
      ((item.apix_metro * (metroWeight / 100)) + (item.apix_regional * (udanWeight / 100))).toFixed(2)
    );
    return {
      date: item.date.slice(5),
      official_apix: item.apix,
      custom_apix: customApix,
      difference: parseFloat((customApix - item.apix).toFixed(2))
    };
  });

  const latest = recalculatedSeries[recalculatedSeries.length - 1];
  const delta = (latest.custom_apix - latest.official_apix).toFixed(2);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold tracking-tight">Interactive Laspeyres Methodology Recalculator</h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                DGCA Passenger Weight Simulation
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Simulate policy weight adjustments between High-Density Metro routes and Regional/UDAN subsidized corridors to test CPI sensitivity and basket stability.
            </p>
          </div>

          <button
            onClick={() => setMetroWeight(70)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer self-start md:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to MoSPI Default (70:30)
          </button>
        </div>
      </div>

      {/* Interactive Weight Slider Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Adjust Basket Sub-Group Allocations</h3>
            <p className="text-xs text-slate-500">Total weight is automatically constrained to 100.0% (Laspeyres Base = 100.0)</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded font-bold">Metro: {metroWeight}%</span>
            <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded font-bold">UDAN: {udanWeight}%</span>
          </div>
        </div>

        {/* Slider input */}
        <div className="space-y-2">
          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={metroWeight}
            onChange={(e) => setMetroWeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>30% Metro / 70% UDAN (Regional Focus)</span>
            <span className="font-bold text-slate-600">70% Metro / 30% UDAN (Official MoSPI Baseline)</span>
            <span>90% Metro / 10% UDAN (Heavy Trunk Focus)</span>
          </div>
        </div>

        {/* Dynamic Formula Display */}
        <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-amber-400 font-bold">Formula: </span>
            APIx_t = (Metro_t × {metroWeight/100}) + (UDAN_t × {udanWeight/100})
          </div>
          <div className="text-slate-400 text-[11px]">
            Latest Headline APIx: <strong className="text-white">{latest.official_apix}</strong> → Custom: <strong className="text-emerald-400">{latest.custom_apix}</strong> ({Number(delta) >= 0 ? `+${delta}` : delta})
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Official MoSPI Baseline vs Custom Weight Trajectory</h3>
          <p className="text-xs text-slate-500">Live 90-day time-series sensitivity comparison</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recalculatedSeries} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="official_apix"
                name="Official Baseline (70:30)"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="custom_apix"
                name={`Custom Recalculated (${metroWeight}:${udanWeight})`}
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
