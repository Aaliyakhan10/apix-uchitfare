"use client";

import React, { useState } from "react";
import { AIRPORTS } from "@/data/geoData";
import { ROUTES } from "@/data/routes";
import { ROUTE_SUMMARIES } from "@/data/mockData";
import { Plane, AlertTriangle, CheckCircle2, Info, MapPin, Eye } from "lucide-react";

interface NetworkMapProps {
  onSelectRoute?: (routeId: string) => void;
  selectedRouteId?: string;
}

export default function NetworkMap({ onSelectRoute, selectedRouteId }: NetworkMapProps) {
  const [filter, setFilter] = useState<"ALL" | "Metro" | "Regional/UDAN" | "FLAGGED">("ALL");
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [hoveredAirport, setHoveredAirport] = useState<string | null>(null);

  // SVG coordinate transformation for Indian subcontinent
  const project = (lat: number, lng: number) => {
    const x = Math.round(40 + ((lng - 70) / 25) * 570);
    const y = Math.round(620 - 40 - ((lat - 8) / 28) * 540);
    return { x, y };
  };

  const filteredRoutes = ROUTE_SUMMARIES.filter((r) => {
    if (filter === "FLAGGED") return r.is_flagged;
    if (filter === "Metro") return r.category === "Metro";
    if (filter === "Regional/UDAN") return r.category === "Regional/UDAN";
    return true;
  });

  const activeRouteData = ROUTE_SUMMARIES.find((r) => r.route_id === (hoveredRoute || selectedRouteId));

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">National Flight Network & Fare Topology</h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Interactive SVG</span>
          </div>
          <p className="text-xs text-slate-500">25 Domestic Corridors connecting 21 Primary Hubs & UDAN Nodes</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-medium mr-1">Corridor Filter:</span>
          {(["ALL", "Metro", "Regional/UDAN", "FLAGGED"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                filter === cat
                  ? cat === "FLAGGED"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "All Corridors (25)" : cat === "FLAGGED" ? "Monopoly / Flagged (8)" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: SVG Map + Route Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Network Map */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1.5 shadow-md">
            <div className="font-semibold text-slate-200">Corridor Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500 rounded"></span> Metro Trunk Corridor
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-emerald-400 rounded"></span> Regional / UDAN Corridor
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-500 rounded"></span> Monopoly Overcharging Flag
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Airport Hub / Station
            </div>
          </div>

          {/* Map Canvas */}
          <svg
            viewBox="0 0 650 620"
            className="w-full h-auto max-h-[540px] select-none"
          >
            <defs>
              <linearGradient id="metroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="flaggedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="udanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Background Grid Pattern */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`grid-h-${i}`}
                x1="20"
                y1={40 + i * 54}
                x2="630"
                y2={40 + i * 54}
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeDasharray="4 4"
              />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`grid-v-${i}`}
                x1={40 + i * 57}
                y1="20"
                x2={40 + i * 57}
                y2="600"
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeDasharray="4 4"
              />
            ))}

            {/* Flight Route Arcs */}
            {filteredRoutes.map((r) => {
              const orig = AIRPORTS[r.route_id.split("-")[0]];
              const dest = AIRPORTS[r.route_id.split("-")[1]];
              if (!orig || !dest) return null;

              const p1 = project(orig.lat, orig.lng);
              const p2 = project(dest.lat, dest.lng);

              // Calculate quadratic bezier curve midpoint with elevation
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2 - 35;

              const isHovered = hoveredRoute === r.route_id;
              const isSelected = selectedRouteId === r.route_id;

              const strokeColor = r.is_flagged
                ? "url(#flaggedGrad)"
                : r.category === "Metro"
                ? "url(#metroGrad)"
                : "url(#udanGrad)";

              return (
                <g key={r.route_id}>
                  <path
                    d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 3 : r.is_flagged ? 2.2 : 1.6}
                    strokeOpacity={isHovered || isSelected ? 1 : 0.65}
                    className="cursor-pointer transition-all duration-200 hover:stroke-amber-300"
                    onMouseEnter={() => setHoveredRoute(r.route_id)}
                    onMouseLeave={() => setHoveredRoute(null)}
                    onClick={() => onSelectRoute && onSelectRoute(r.route_id)}
                  />
                  {(isSelected || isHovered) && (
                    <circle cx={midX} cy={midY} r={4} fill="#f59e0b" className="animate-ping" />
                  )}
                </g>
              );
            })}

            {/* Airport Nodes */}
            {Object.values(AIRPORTS).map((a) => {
              const pt = project(a.lat, a.lng);
              const isHovered = hoveredAirport === a.iata;

              return (
                <g
                  key={a.iata}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredAirport(a.iata)}
                  onMouseLeave={() => setHoveredAirport(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 4.5}
                    fill={a.iata === "DEL" || a.iata === "BOM" ? "#f59e0b" : "#38bdf8"}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                  <text
                    x={pt.x + 8}
                    y={pt.y + 4}
                    fill={isHovered ? "#ffffff" : "#94a3b8"}
                    fontSize={isHovered ? "11" : "9"}
                    fontWeight={isHovered ? "bold" : "medium"}
                    fontFamily="monospace"
                  >
                    {a.iata}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="w-full mt-2 text-center text-[10px] text-slate-500">
            Coordinates: WGS84 Mercator Projection • Click any arc to inspect fare economics
          </div>
        </div>

        {/* Selected / Hovered Route Economics Inspector */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          {activeRouteData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900 font-mono">{activeRouteData.route_id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeRouteData.category === "Metro"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {activeRouteData.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {activeRouteData.origin} → {activeRouteData.destination}
                  </div>
                </div>

                {activeRouteData.is_flagged ? (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" /> Overcharging
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fair Pricing
                  </span>
                )}
              </div>

              {/* KPI metrics for this route */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Distance</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">{activeRouteData.distance_km} km</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Current Fare</span>
                  <span className="text-base font-extrabold text-blue-600 font-mono">₹{activeRouteData.current_median_fare.toLocaleString("en-IN")}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Fare / Km</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">₹{activeRouteData.fare_per_km}</span>
                  <span className="text-[10px] text-slate-400 block">Bench: ₹{activeRouteData.benchmark_fare_per_km}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">HHI Concentration</span>
                  <span
                    className={`text-base font-extrabold font-mono ${
                      activeRouteData.hhi >= 5000
                        ? "text-rose-600"
                        : activeRouteData.hhi >= 2500
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {activeRouteData.hhi}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{activeRouteData.concentration_level}</span>
                </div>
              </div>

              {/* Carrier Market Shares */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">Carrier Capacity Distribution:</span>
                <div className="space-y-2">
                  {activeRouteData.carrier_shares.map((c) => (
                    <div key={c.carrier} className="text-xs">
                      <div className="flex justify-between text-slate-600 mb-0.5">
                        <span className="font-medium">{c.carrier}</span>
                        <span className="font-mono font-bold">{c.share}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.share >= 60 ? "bg-rose-500" : c.share >= 35 ? "bg-blue-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${c.share}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overcharge alert text if flagged */}
              {activeRouteData.is_flagged && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Watchdog Flag Activated
                  </div>
                  Markup ratio is <strong>{activeRouteData.markup_ratio}x</strong> benchmark. Dominant carrier controls pricing above regulatory comfort threshold.
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Eye className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Hover over or click any route on the map</p>
              <p className="text-xs">View real-time fare per km, HHI, and carrier concentration.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>25 Monitored Corridors</span>
            {activeRouteData && onSelectRoute && (
              <button
                onClick={() => onSelectRoute(activeRouteData.route_id)}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Deep Dive Analysis →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
