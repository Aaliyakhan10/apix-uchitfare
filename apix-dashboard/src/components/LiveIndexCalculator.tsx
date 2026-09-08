"use client";

import React, { useState } from "react";
import { Calculator, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { Language, translations } from "@/i18n/translations";

interface LiveIndexCalculatorProps {
  lang: Language;
}

export default function LiveIndexCalculator({ lang }: LiveIndexCalculatorProps) {
  const t = translations[lang] || translations.en;

  // Sliders and controls
  const [metroWeight, setMetroWeight] = useState<number>(70);
  const [fuelShock, setFuelShock] = useState<number>(0);
  const [cleaningEnabled, setCleaningEnabled] = useState<boolean>(true);
  const [passengerClassMix, setPassengerClassMix] = useState<"standard" | "common" | "executive">("standard");

  const udanWeight = 100 - metroWeight;

  // Baseline figures
  const BASELINE_METRO = 168.20;
  const BASELINE_REGIONAL = 159.13;
  const BASELINE_APIX = 165.48; // Official 70:30 with 0% shock and cleaning ON

  // Calculation logic
  // 1. Weight impact
  const weightedBase = (BASELINE_METRO * (metroWeight / 100)) + (BASELINE_REGIONAL * (udanWeight / 100));
  
  // 2. Fuel shock impact: Fuel surcharge is ~16% of total fare
  const fuelMultiplier = 1.0 + (0.16 * (fuelShock / 100));
  
  // 3. Cleaning impact: If cleaning is OFF, unquarantined outliers (business suite leaks, etc.) inflate index by +8.65
  const outlierDistortion = cleaningEnabled ? 0.0 : 8.65;

  // 4. Passenger class mix impact:
  // Standard: 82% Econ, 11% Prem, 7% Biz (Base 0.0)
  // Common: 100% Economy (-1.25 pts lower)
  // Executive Heavy: 65% Econ, 20% Prem, 15% Biz (+4.80 pts higher)
  const classShift = passengerClassMix === "common" ? -1.25 : passengerClassMix === "executive" ? 4.80 : 0.0;

  const newApix = Number((weightedBase * fuelMultiplier + outlierDistortion + classShift).toFixed(2));
  const delta = Number((newApix - BASELINE_APIX).toFixed(2));
  const pctChange = Number(((delta / BASELINE_APIX) * 100).toFixed(2));
  
  // Transport CPI Impact: civil aviation transport weight factor ~0.038
  const cpiImpact = Number((delta * 0.038).toFixed(2));

  const handleReset = () => {
    setMetroWeight(70);
    setFuelShock(0);
    setCleaningEnabled(true);
    setPassengerClassMix("standard");
  };

  // Generate plain-language explanation for government officer
  const getGovernmentExplanation = () => {
    const sign = delta >= 0 ? "+" : "";
    const cpiSign = cpiImpact >= 0 ? "+" : "";

    if (lang === "hi") {
      let text = `मेट्रो मार्गों का भार ${metroWeight}% (उड़ान: ${udanWeight}%) और ATF ईंधन में ${fuelShock >= 0 ? `+${fuelShock}` : fuelShock}% परिवर्तन करने से आधिकारिक APIx सूचकांक ${BASELINE_APIX} से बदलकर ${newApix} (${sign}${delta} अंक, ${sign}${pctChange}%) हो जाता है। इससे परिवहन उपभोक्ता मूल्य सूचकांक (CPI) पर ${cpiSign}${cpiImpact}% का सीधा प्रभाव पड़ेगा।`;
      if (!cleaningEnabled) {
        text += ` ⚠️ गंभीर चेतावनी: मशीन लर्निंग शुद्धिकरण बंद होने के कारण, ₹48,500 के बिजनेस क्लास लीकेज और गलत दरों से सूचकांक में +8.65 अंकों का कृत्रिम उछाल दर्ज हुआ है!`;
      }
      return text;
    }

    if (lang === "mr") {
      let text = `मेट्रो मार्गांचे वजन ${metroWeight}% (उडान: ${udanWeight}%) आणि ATF इंधनात ${fuelShock >= 0 ? `+${fuelShock}` : fuelShock}% बदल केल्याने अधिकृत APIx निर्देशांक ${BASELINE_APIX} वरून ${newApix} (${sign}${delta} गुण, ${sign}${pctChange}%) होतो. यामुळे राष्ट्रीय वाहतूक महागाईवर (CPI) ${cpiSign}${cpiImpact}% थेट परिणाम होईल.`;
      if (!cleaningEnabled) {
        text += ` ⚠️ गंभीर इशारा: डेटा शुद्धीकरण बंद असल्याने, ₹48,500 च्या बिझनेस क्लास तिकीट गळतीमुळे निर्देशांकात +8.65 गुणांची खोटी वाढ झाली आहे!`;
      }
      return text;
    }

    // Default English
    let text = `Allocating ${metroWeight}% weight to Metro routes (UDAN: ${udanWeight}%) with a ${fuelShock >= 0 ? `+${fuelShock}` : fuelShock}% ATF fuel surcharge shock shifts APIx from ${BASELINE_APIX} to ${newApix} (${sign}${delta} pts, ${sign}${pctChange}%). This generates an estimated ${cpiSign}${cpiImpact}% impact on the national Transport CPI.`;
    if (!cleaningEnabled) {
      text += ` ⚠️ CRITICAL NOTICE: With ML Data Cleaning disabled, unpurified business class leaks and OTA errors artificially inflate the index by +8.65 points!`;
    }
    return text;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Government Card Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-300">
                <Calculator className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">{t.calcTitle}</h2>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                {t.calcBadge}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {t.calcDesc}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer self-start md:self-center shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            {t.resetDefaultBtn}
          </button>
        </div>
      </div>

      {/* Grid: Interactive Controls & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {lang === "hi" ? "पैरामीटर समायोजन (स्लाइडर)" : lang === "mr" ? "घटक समायोजन (स्लाइडर्स)" : "Policy & Market Sensitivity Adjustments"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === "hi" ? "किसी भी मान को बदलें, परिणाम तुरंत दाईं ओर अपडेट होंगे" : lang === "mr" ? "कोणतीही मूल्ये बदला, निकाल त्वरित उजवीकडे दिसतील" : "Slide any control to instantly see real-time index changes."}
            </p>
          </div>

          {/* Slider 1: Metro vs UDAN Weight */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-2">
                <span>{t.calcMetroWeightLabel}</span>
              </label>
              <div className="flex items-center gap-2 font-mono">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Metro: {metroWeight}%</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">UDAN: {udanWeight}%</span>
              </div>
            </div>

            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={metroWeight}
              onChange={(e) => setMetroWeight(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>30% ({lang === "hi" ? "क्षेत्रीय प्राथमिकता" : lang === "mr" ? "प्रादेशिक भर" : "Regional Priority"})</span>
              <span className="font-bold text-slate-700">70% ({lang === "hi" ? "MoSPI मानक" : lang === "mr" ? "MoSPI मानक" : "MoSPI Standard"})</span>
              <span>90% ({lang === "hi" ? "मेट्रो प्राथमिकता" : lang === "mr" ? "मेट्रो भर" : "Heavy Trunk"})</span>
            </div>
          </div>

          {/* Slider 2: Fuel Surcharge Shock */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-2">
                <span>{t.calcFuelShockLabel}</span>
              </label>
              <span className={`px-2.5 py-0.5 rounded font-bold font-mono text-xs ${
                fuelShock > 0 ? "bg-rose-100 text-rose-800" : fuelShock < 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
              }`}>
                {fuelShock > 0 ? `+${fuelShock}%` : `${fuelShock}%`}
              </span>
            </div>

            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={fuelShock}
              onChange={(e) => setFuelShock(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>-30% ({lang === "hi" ? "सस्ता ईंधन" : lang === "mr" ? "स्वस्त इंधन" : "Fuel Drop"})</span>
              <span className="font-bold text-slate-700">0% ({lang === "hi" ? "स्थिर दर" : lang === "mr" ? "स्थिर दर" : "Stable Benchmark"})</span>
              <span>+50% ({lang === "hi" ? "गंभीर वृद्धि" : lang === "mr" ? "तीव्र दरवाढ" : "Severe Shock"})</span>
            </div>
          </div>

          {/* Toggle: Data Cleaning ON / OFF */}
          <div className={`p-4 rounded-xl border transition ${
            cleaningEnabled ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50 border-rose-300"
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {cleaningEnabled ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <h4 className="text-xs font-bold text-slate-900">{t.calcCleaningToggleLabel}</h4>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t.calcCleaningToggleDesc}
                </p>
              </div>

              <button
                onClick={() => setCleaningEnabled(!cleaningEnabled)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                  cleaningEnabled
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs hover:bg-emerald-700"
                    : "bg-rose-600 text-white border-rose-700 shadow-xs hover:bg-rose-700"
                }`}
              >
                {cleaningEnabled
                  ? (lang === "hi" ? "सक्रिय (ON)" : lang === "mr" ? "सुरू (ON)" : "ENABLED (ON)")
                  : (lang === "hi" ? "निष्क्रिय (OFF)" : lang === "mr" ? "बंद (OFF)" : "DISABLED (OFF)")}
              </button>
            </div>
          </div>

          {/* Passenger Class Mix Selector */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">
                {lang === "hi" ? "यात्री श्रेणी बास्केट मिश्रण:" : lang === "mr" ? "प्रवासी वर्ग बास्केट रचना:" : "Passenger Class Basket Weighting:"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                {passengerClassMix === "standard" ? "82:11:7 Standard" : passengerClassMix === "common" ? "100% Economy" : "Executive Heavy"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPassengerClassMix("standard")}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  passengerClassMix === "standard"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                {lang === "hi" ? "मानक MoSPI" : lang === "mr" ? "मानक MoSPI" : "MoSPI Standard"}
              </button>
              <button
                onClick={() => setPassengerClassMix("common")}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  passengerClassMix === "common"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                {lang === "hi" ? "100% आम नागरिक" : lang === "mr" ? "१००% सामान्य नागरिक" : "100% Economy"}
              </button>
              <button
                onClick={() => setPassengerClassMix("executive")}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  passengerClassMix === "executive"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                {lang === "hi" ? "कॉर्पोरेट ट्रंक" : lang === "mr" ? "कॉर्पोरेट ट्रंक" : "Executive Heavy"}
              </button>
            </div>
          </div>

          {/* Formula Display */}
          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between gap-2">
            <div>
              <span className="text-amber-400 font-bold">{t.calcFormulaLabel}: </span>
              APIx = (Metro × {metroWeight}%) + (UDAN × {udanWeight}%) × [1 + 0.16 × ({fuelShock}%)]
            </div>
          </div>

        </div>

        {/* Right Column: Live Calculated Results (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50 rounded-2xl border-2 border-slate-300 p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          <div>
            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.calcResultsHeading}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {lang === "hi" ? "तात्कालिक प्रभाव विश्लेषण" : lang === "mr" ? "तात्काळ प्रभाव विश्लेषण" : "Real-time index recalculation"}
              </p>
            </div>

            {/* Before vs After Big Metric Block */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 text-center shadow-2xs">
                <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">{t.calcBaselineIndex}</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono mt-1.5 block">{BASELINE_APIX}</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Base 2026 = 100.0</span>
              </div>

              <div className={`p-4 rounded-xl border-2 text-center shadow-2xs ${
                delta === 0 ? "bg-white border-slate-200" : delta > 0 ? "bg-rose-50 border-rose-300" : "bg-emerald-50 border-emerald-300"
              }`}>
                <span className="text-xs font-black text-slate-600 block uppercase tracking-wider">{t.calcNewIndex}</span>
                <span className={`text-3xl sm:text-4xl font-black font-mono mt-1.5 block ${
                  delta === 0 ? "text-slate-900" : delta > 0 ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {newApix}
                </span>
                <span className={`text-xs font-black block mt-1 ${
                  delta >= 0 ? "text-rose-700" : "text-emerald-700"
                }`}>
                  {delta >= 0 ? `+${delta}` : delta} pts ({delta >= 0 ? `+${pctChange}` : pctChange}%)
                </span>
              </div>
            </div>

            {/* Shift & CPI Impact Cards */}
            <div className="mt-4 space-y-3">
              
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  {delta >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className="text-sm font-bold text-slate-800">{t.calcDifference}</span>
                </div>
                <span className={`text-base font-black font-mono ${delta >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {delta >= 0 ? `+${delta}` : delta}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="text-sm font-bold text-slate-800">{t.calcCpiImpact}</span>
                </div>
                <span className={`text-base font-black font-mono ${cpiImpact >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {cpiImpact >= 0 ? `+${cpiImpact}%` : `${cpiImpact}%`}
                </span>
              </div>

            </div>
          </div>

          {/* Plain-Language Explanation Callout */}
          <div className="bg-blue-50/90 border-2 border-blue-200 rounded-xl p-4 text-sm space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-950 block">
              {t.calcExplanationLabel}
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">
              {getGovernmentExplanation()}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
