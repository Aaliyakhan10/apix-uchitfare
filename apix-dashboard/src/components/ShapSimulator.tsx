"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { ROUTES } from "@/data/routes";
import { Sparkles, Sliders, RefreshCw, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function ShapSimulator() {
  const [selectedRoute, setSelectedRoute] = useState("DEL-BOM");
  const [windowLead, setWindowLead] = useState("T+15");
  const [fuelShockPct, setFuelShockPct] = useState(15);
  const [festiveSurgeMultiplier, setFestiveSurgeMultiplier] = useState(1.2);

  const routeObj = ROUTES.find((r) => r.id === selectedRoute) || ROUTES[0];
  const baseFare = routeObj.basePeriodFare;

  // Window multipliers
  const windowMultipliers: Record<string, number> = {
    "T+1": 1.95, "T+7": 1.28, "T+15": 1.0, "T+30": 0.84, "T+45": 0.74
  };
  const leadFactor = windowMultipliers[windowLead] || 1.0;

  // Compute dynamic SHAP attributions based on sliders
  const fuelImpact = Math.round(baseFare * (fuelShockPct / 100) * 0.45);
  const surgeImpact = Math.round(baseFare * (festiveSurgeMultiplier - 1.0) * 0.65);
  const compDiscount = Math.round(-baseFare * (routeObj.typicalCarriers.length >= 3 ? 0.12 : 0.04));
  const horizonImpact = Math.round(baseFare * (leadFactor - 1.0));

  const currentPredictedFare = baseFare + fuelImpact + surgeImpact + compDiscount + horizonImpact;
  const netChange = currentPredictedFare - baseFare;

  const shapData = [
    { name: "Base Fare (t=0)", value: baseFare, color: "#64748b" },
    { name: "ATF Fuel Shock", value: fuelImpact, color: fuelImpact >= 0 ? "#ef4444" : "#10b981" },
    { name: "Festive Surge", value: surgeImpact, color: surgeImpact >= 0 ? "#f59e0b" : "#10b981" },
    { name: "Carrier Competition", value: compDiscount, color: "#10b981" },
    { name: "Horizon Lead Window", value: horizonImpact, color: horizonImpact >= 0 ? "#8b5cf6" : "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold tracking-tight">Interactive AI Explainability & Scenario Simulator</h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                Closed-Form Linear SHAP
              </span>
            </div>
            <p className="text-xs text-purple-200/80 max-w-2xl">
              Decomposes price changes into exact Rupee (₹) and percentage attributions. Test what happens to consumer airfares if global jet fuel increases or holiday peak surges escalate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-700 cursor-pointer"
            >
              {ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.originName} → {r.destinationName})
                </option>
              ))}
            </select>

            <select
              value={windowLead}
              onChange={(e) => setWindowLead(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-700 cursor-pointer"
            >
              <option value="T+1">T+1 (Last-Minute)</option>
              <option value="T+7">T+7 (1 Week)</option>
              <option value="T+15">T+15 (2 Weeks)</option>
              <option value="T+30">T+30 (1 Month)</option>
              <option value="T+45">T+45 (Advance)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">Simulate ATF Jet Fuel Price Shock:</span>
            <span className="font-mono font-bold text-rose-600">{fuelShockPct >= 0 ? `+${fuelShockPct}%` : `${fuelShockPct}%`}</span>
          </div>
          <input
            type="range"
            min="-20"
            max="50"
            value={fuelShockPct}
            onChange={(e) => setFuelShockPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-20% Fuel Drop</span>
            <span>0% Baseline</span>
            <span>+50% Global Spike</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">Festive & Holiday Surge Multiplier:</span>
            <span className="font-mono font-bold text-amber-600">{festiveSurgeMultiplier.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={festiveSurgeMultiplier}
            onChange={(e) => setFestiveSurgeMultiplier(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1.0x (Regular Day)</span>
            <span>1.5x (Diwali/Puja Peak)</span>
            <span>2.0x (Extreme Demand)</span>
          </div>
        </div>

      </div>

      {/* Outcome Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Base Fare: ₹{baseFare}</span>
          <ArrowRight className="w-4 h-4 text-purple-400" />
          <span className="text-base font-bold text-emerald-400">Predicted Fare: ₹{currentPredictedFare.toLocaleString("en-IN")}</span>
        </div>
        <div className="text-slate-300">
          Net Movement: <strong className={netChange >= 0 ? "text-rose-400" : "text-emerald-400"}>{netChange >= 0 ? `+₹${netChange}` : `-₹${Math.abs(netChange)}`}</strong> ({((netChange/baseFare)*100).toFixed(1)}%)
        </div>
      </div>

      {/* Waterfall Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">SHAP Feature Attribution Waterfall (₹ Impact)</h3>
          <p className="text-xs text-slate-500">Positive values drive fares up; negative values discount consumer prices</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Impact"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
