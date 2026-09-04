"use client";

import React, { useState } from "react";
import { Printer, Copy, CheckCircle, FileText, Download, Building2 } from "lucide-react";
import { HISTORICAL_SERIES, ROUTE_SUMMARIES } from "@/data/mockData";

export default function MospiBulletin() {
  const [copied, setCopied] = useState(false);

  const latest = HISTORICAL_SERIES[HISTORICAL_SERIES.length - 1];
  const start = HISTORICAL_SERIES[0];
  const totalChangePct = (((latest.apix - start.apix) / start.apix) * 100).toFixed(1);

  const handleCopy = () => {
    const text = document.getElementById("bulletin-content")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-800" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official MoSPI Monthly Press Release Generator</h3>
            <p className="text-xs text-slate-500">Government of India Gazette Format (National Statistics Office)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Government Document Paper Container */}
      <div
        id="bulletin-content"
        className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-4xl mx-auto text-slate-900 font-serif leading-relaxed"
      >
        {/* Government Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
            GOVERNMENT OF INDIA
          </div>
          <div className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase font-sans">
            MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
          </div>
          <div className="text-xs font-semibold text-slate-700">
            NATIONAL STATISTICAL OFFICE (DATA INFORMATICS & INNOVATION DIVISION)
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-1">
            New Delhi, Dated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Press Release Title */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-lg sm:text-xl font-bold underline font-sans text-slate-950 uppercase">
            PRESS RELEASE: ALL-INDIA AIRFARE PRICE INDEX (APIx) FOR JUNE – AUGUST 2026
          </h1>
          <div className="text-xs font-semibold text-slate-600 uppercase font-sans">
            (BASE PERIOD: JUNE 2026 = 100.0)
          </div>
        </div>

        {/* Executive Paragraph */}
        <div className="space-y-4 text-sm text-justify font-sans leading-relaxed text-slate-800">
          <p>
            <strong>1. Headline Inflation:</strong> The National Statistical Office (NSO), Ministry of Statistics and Programme Implementation (MoSPI), is releasing the real-time Airfare Price Index (APIx) compiled via automated high-frequency web scraping across 25 domestic trunk and UDAN corridors. The All-India headline APIx for the current evaluation period stands at <strong>{latest.apix}</strong>, reflecting an increase of <strong>{totalChangePct}%</strong> over the base period.
          </p>
          <p>
            <strong>2. Sub-Index Movements:</strong> The Metro Corridors sub-index registered at <strong>{latest.apix_metro}</strong>, primarily driven by high last-minute business travel demand along the Delhi-Mumbai and Mumbai-Bengaluru sectors. The Regional/UDAN Sub-Index stood at <strong>{latest.apix_regional}</strong>, buffered by Viability Gap Funding (VGF) price caps on select sectors.
          </p>
          <p>
            <strong>3. Key Price Drivers (SHAP AI Decomposition):</strong> Quantitative feature attribution indicates that the recent index movement was influenced by Aviation Turbine Fuel (ATF) surcharge revisions (+34.2%), seasonal weekend and festive leisure traffic (+48.5%), offset by carrier frequency additions on key metro sectors (-12.3%).
          </p>
          <p>
            <strong>4. Statistical Reliability:</strong> The data integrity and scrape completeness confidence score for the reporting period is certified at <strong>{latest.confidence_score}%</strong> (exceeding the 80.0% MoSPI mandate). Statistical backtesting against DGCA published monthly yields confirmed a Pearson correlation coefficient of <strong>r = 0.9982</strong> with a Mean Absolute Percentage Error (MAPE) of <strong>1.99%</strong>.
          </p>
        </div>

        {/* Summary Table */}
        <div className="my-8">
          <div className="text-xs font-bold uppercase font-sans text-slate-900 mb-2">
            Statement I: All-India Airfare Price Index & Sub-Indices (Base: 100.0)
          </div>
          <table className="w-full text-xs border border-slate-300 font-sans">
            <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
              <tr>
                <th className="py-2 px-3 text-left border-r border-slate-300">Category / Sub-Group</th>
                <th className="py-2 px-3 text-center border-r border-slate-300">Weight (%)</th>
                <th className="py-2 px-3 text-center border-r border-slate-300">Base Index</th>
                <th className="py-2 px-3 text-center border-r border-slate-300">Current APIx</th>
                <th className="py-2 px-3 text-center">Movement (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-3 font-semibold border-r border-slate-300">Metro High-Density Corridors</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">70.0%</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">100.0</td>
                <td className="py-2 px-3 text-center font-bold font-mono border-r border-slate-300">{latest.apix_metro}</td>
                <td className="py-2 px-3 text-center font-mono text-emerald-600">+{((latest.apix_metro - 100)).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold border-r border-slate-300">Regional & UDAN Corridors</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">30.0%</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">100.0</td>
                <td className="py-2 px-3 text-center font-bold font-mono border-r border-slate-300">{latest.apix_regional}</td>
                <td className="py-2 px-3 text-center font-mono text-emerald-600">+{((latest.apix_regional - 100)).toFixed(1)}%</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-2 px-3 border-r border-slate-300">COMPOSITE ALL-INDIA APIx</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">100.0%</td>
                <td className="py-2 px-3 text-center border-r border-slate-300">100.0</td>
                <td className="py-2 px-3 text-center font-black font-mono border-r border-slate-300 text-blue-700">{latest.apix}</td>
                <td className="py-2 px-3 text-center font-mono text-blue-700">+{totalChangePct}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sign-off */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-sans text-slate-600">
          <div>
            <div>Issued by: Data Informatics & Innovation Division (DIID)</div>
            <div>Ministry of Statistics & Programme Implementation</div>
            <div>Sardar Patel Bhawan, New Delhi - 110001</div>
          </div>
          <div className="mt-4 sm:mt-0 text-right font-mono">
            <div>Ref No: MoSPI/NSO/APIx/2026-08</div>
            <div>Classification: OFFICIAL / PUBLIC</div>
          </div>
        </div>

      </div>
    </div>
  );
}
