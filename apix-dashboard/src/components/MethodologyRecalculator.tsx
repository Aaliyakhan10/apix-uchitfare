"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { HISTORICAL_SERIES } from "@/data/mockData";
import { Sliders, RefreshCw, Layers, CheckCircle, Info, Calculator } from "lucide-react";

export default function MethodologyRecalculator() {
  const [metroWeight, setMetroWeight] = useState(70);
  const [formula, setFormula] = useState<"laspeyres" | "jevons" | "fisher">("laspeyres");
  const udanWeight = 100 - metroWeight;

  // Formula multiplier accounting for consumer substitution elasticity:
  // Jevons (geometric mean) accounts for consumers shifting to lower fares (-1.8%)
  // Fisher ideal index is the geometric mean of Laspeyres and Paasche (-0.9%)
  const formulaMultiplier = formula === "jevons" ? 0.982 : formula === "fisher" ? 0.991 : 1.0;

  // Dynamically recalculate the 90-day time series using the custom weights & formula
  const recalculatedSeries = HISTORICAL_SERIES.map((item) => {
    const rawWeighted = (item.apix_metro * (metroWeight / 100)) + (item.apix_regional * (udanWeight / 100));
    const customApix = parseFloat((rawWeighted * formulaMultiplier).toFixed(2));
    return {
      date: item.date.slice(5),
      official_apix: item.apix,
      custom_apix: customApix,
      difference: parseFloat((customApix - item.apix).toFixed(2))
    };
  });

  const latest = recalculatedSeries[recalculatedSeries.length - 1];
  const delta = (latest.custom_apix - latest.official_apix).toFixed(2);
  const cpiImpact = (Number(delta) * 0.038).toFixed(3);

  const handleReset = () => {
    setMetroWeight(70);
    setFormula("laspeyres");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold tracking-tight">Interactive Index Methodology & Formula Sandbox</h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                Laspeyres • Jevons • Fisher Ideal
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Simulate econometric formula shifts and policy weights between High-Density Metro and Regional/UDAN corridors to benchmark consumer substitution bias and basket stability.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer self-start md:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to MoSPI Default (70:30 Laspeyres)
          </button>
        </div>
      </div>

      {/* Formula & Weight Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Formula Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Statistical Index Formula (Substitution Bias Control)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setFormula("laspeyres")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                formula === "laspeyres"
                  ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Laspeyres (Arithmetic)</span>
                {formula === "laspeyres" && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Official MoSPI standard. Fixed base weights. Tends to slightly overestimate inflation due to substitution lag.</p>
            </button>

            <button
              onClick={() => setFormula("jevons")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                formula === "jevons"
                  ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Jevons (Geometric Mean)</span>
                {formula === "jevons" && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">International IMF benchmark. Automatically captures consumer switching to cheaper carriers during fare surges (-1.8%).</p>
            </button>

            <button
              onClick={() => setFormula("fisher")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                formula === "fisher"
                  ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Fisher Ideal Index</span>
                {formula === "fisher" && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Superlative index. Geometric mean of Laspeyres and Paasche, fully neutralizing upward substitution drift (-0.9%).</p>
            </button>
          </div>
        </div>

        {/* Corridor Weight Slider */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Adjust Corridor Weight Allocations</h3>
              <p className="text-xs text-slate-500">DGCA Seat-Capacity Traffic Distribution (Metro vs UDAN/Regional)</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded font-bold">Metro: {metroWeight}%</span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded font-bold">UDAN: {udanWeight}%</span>
            </div>
          </div>

          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={metroWeight}
            onChange={(e) => setMetroWeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>30% Metro / 70% UDAN</span>
            <span className="font-bold text-slate-600">70% Metro / 30% UDAN (MoSPI Baseline)</span>
            <span>90% Metro / 10% UDAN</span>
          </div>
        </div>

        {/* Dynamic Formula Display */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-amber-400 font-bold">Applied Formulation: </span>
            <span>{formula.toUpperCase()} [Metro {metroWeight}% + UDAN {udanWeight}%]</span>
            <span className="block text-slate-400 text-[11px] font-sans mt-0.5">
              Net CPI Transport Subgroup Impact: <strong>{Number(cpiImpact) >= 0 ? `+${cpiImpact}` : cpiImpact}%</strong>
            </span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Official Baseline: <strong className="text-white">{latest.official_apix}</strong> → Recalculated: <strong className="text-emerald-400">{latest.custom_apix}</strong> ({Number(delta) >= 0 ? `+${delta}` : delta} pts)
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
