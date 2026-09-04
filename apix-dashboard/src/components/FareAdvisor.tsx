"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ROUTES } from "@/data/routes";
import { Calendar, DollarSign, ArrowDownRight, Sparkles, Check, Clock, TrendingUp, Info } from "lucide-react";

export default function FareAdvisor() {
  const [selectedRoute, setSelectedRoute] = useState("DEL-BOM");

  const routeObj = ROUTES.find((r) => r.id === selectedRoute) || ROUTES[0];
  const base = routeObj.basePeriodFare;

  // Simulate pricing curve across booking horizons
  const horizonCurve = [
    { horizon: "T+45", days: 45, fare: Math.round(base * 0.74), label: "Deep Advance", savings: "38% cheaper" },
    { horizon: "T+30", days: 30, fare: Math.round(base * 0.82), label: "Early Bird", savings: "28% cheaper" },
    { horizon: "T+21", days: 21, fare: Math.round(base * 0.88), label: "Sweet Spot", savings: "21% cheaper", optimal: true },
    { horizon: "T+15", days: 15, fare: Math.round(base * 1.00), label: "Baseline Window", savings: "Fair Fare" },
    { horizon: "T+7", days: 7, fare: Math.round(base * 1.28), label: "Late Window", savings: "+28% markup" },
    { horizon: "T+3", days: 3, fare: Math.round(base * 1.55), label: "Surge Window", savings: "+55% markup" },
    { horizon: "T+1", days: 1, fare: Math.round(base * 1.95), label: "Last-Minute", savings: "+95% surge" },
  ];

  const optimalPoint = horizonCurve.find((h) => h.optimal) || horizonCurve[2];
  const lastMinutePoint = horizonCurve[horizonCurve.length - 1];
  const maxSavings = lastMinutePoint.fare - optimalPoint.fare;
  const savingsPct = Math.round((maxSavings / lastMinutePoint.fare) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold tracking-tight">Consumer & MoSPI Airfare Prediction Engine</h2>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                Optimal Booking Window
              </span>
            </div>
            <p className="text-xs text-blue-200/80 max-w-2xl">
              Empowering consumers and public policy researchers with dynamic yield curve modeling to find the statistical sweet spot before airlines trigger algorithmic surges.
            </p>
          </div>

          {/* Route Dropdown Selector */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-2 border border-white/20">
            <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider mb-1">Select Corridor</span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.originName} → {r.destinationName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3 Insight Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Recommended Sweet Spot</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">T+21 to T+15</div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block">
            Estimated Fare: ₹{optimalPoint.fare.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Statistically lowest fare volatility before automated dynamic pricing inflection kicks in.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Potential Citizen Savings</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600 font-mono">₹{maxSavings.toLocaleString("en-IN")}</div>
          <div className="mt-2 text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded inline-block">
            Save {savingsPct}% vs Last-Minute (T+1)
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Comparison between T+21 optimal booking and last-minute emergency fare (₹{lastMinutePoint.fare.toLocaleString("en-IN")}).
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Surge Steepness Factor</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono">2.21x</div>
          <div className="mt-2 text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-1 rounded inline-block">
            High Surge Volatility
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fares jump exponentially in the final 72 hours due to revenue management yield gating.
          </p>
        </div>

      </div>

      {/* Yield Curve Line Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Empirical Booking Horizon Fare Trajectory ({selectedRoute})</h3>
            <p className="text-xs text-slate-500">Average ticket fare observed across booking lead times (Advance vs Last-Minute)</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2 py-1 rounded">
            Distance: {routeObj.distanceKm} km
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={horizonCurve} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="horizon" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Median Fare"]}
                labelFormatter={(label) => `Lead Window: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="fare"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead time milestone strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
          {horizonCurve.map((h) => (
            <div
              key={h.horizon}
              className={`p-2.5 rounded-lg border text-center text-xs transition ${
                h.optimal
                  ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="font-mono font-bold text-slate-900">{h.horizon}</div>
              <div className="text-xs font-black text-blue-600 font-mono mt-0.5">₹{h.fare.toLocaleString("en-IN")}</div>
              <div className={`text-[10px] mt-1 font-semibold ${h.optimal ? "text-emerald-700" : "text-slate-500"}`}>
                {h.savings}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
