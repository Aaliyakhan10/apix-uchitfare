"use client";

import React, { useState } from "react";
import { Users, Briefcase, GraduationCap, ShieldAlert, Award, TrendingUp, AlertCircle, Percent, ArrowUpRight } from "lucide-react";
import { Language, translations } from "@/i18n/translations";

interface PassengerClassBreakdownProps {
  lang: Language;
}

export default function PassengerClassBreakdown({ lang }: PassengerClassBreakdownProps) {
  const t = translations[lang] || translations.en;

  const [simulatedSurge, setSimulatedSurge] = useState<number>(3000);

  const classes = [
    {
      id: "economy",
      name: lang === "hi" ? "इकोनॉमी क्लास (आम नागरिक)" : lang === "mr" ? "इकॉनॉमी वर्ग (सामान्य नागरिक)" : "Economy Class (Common Citizen)",
      tag: lang === "hi" ? "जन सामान्य आधार" : lang === "mr" ? "सर्वसामान्य ग्राहक" : "Public Basket (82%)",
      traffic_share: 82,
      base_fare: 5850,
      class_apix: 161.81,
      multiplier: "1.00x",
      typical_range: "₹4,200 - ₹7,400",
      sensitivity: lang === "hi" ? "अत्यधिक संवेदनशील" : lang === "mr" ? "अत्यंत संवेदनशील" : "High Elasticity",
      icon: Users,
      color: "blue",
      borderCol: "border-blue-300",
      bgCol: "bg-blue-50/70",
      textCol: "text-blue-700",
      desc: lang === "hi" 
        ? "82% घरेलू यात्री इस वर्ग में यात्रा करते हैं। मूल्य वृद्धि और अंतिम समय की बुकिंग पर सर्वाधिक आर्थिक दबाव।"
        : lang === "mr"
        ? "८२% देशांतर्गत प्रवासी या वर्गात प्रवास करतात. अचानक भाडेवाढीचा सर्वाधिक फटका याच वर्गाला बसतो."
        : "Accounts for 82% of domestic travelers. Highest sensitivity to dynamic pricing and last-minute booking surges."
    },
    {
      id: "premium",
      name: lang === "hi" ? "प्रीमियम इकोनॉमी (मध्यम वर्ग)" : lang === "mr" ? "प्रीमियम इकॉनॉमी (मध्यम वर्ग)" : "Premium Economy (Middle Class)",
      tag: lang === "hi" ? "मध्यम वर्ग" : lang === "mr" ? "मध्यम वर्ग" : "Frequent Flyers (11%)",
      traffic_share: 11,
      base_fare: 8480,
      class_apix: 168.21,
      multiplier: "1.45x",
      typical_range: "₹7,200 - ₹11,500",
      sensitivity: lang === "hi" ? "मध्यम संवेदनशील" : lang === "mr" ? "मध्यम संवेदनशील" : "Moderate Elasticity",
      icon: Award,
      color: "indigo",
      borderCol: "border-indigo-300",
      bgCol: "bg-indigo-50/70",
      textCol: "text-indigo-700",
      desc: lang === "hi"
        ? "मध्यम वर्ग और नियमित व्यावसायिक यात्री। अधिक लेगरूम, निःशुल्क टिकट पुनर्निर्धारण और प्राथमिकता बोर्डिंग।"
        : lang === "mr"
        ? "मध्यम वर्ग आणि नियमित व्यावसायिक प्रवासी. जास्तीचा लेगरूम आणि तिकीट बदलण्याची सोय."
        : "Middle class and frequent business flyers requiring extra legroom, flexible cancellations, and priority check-in."
    },
    {
      id: "business",
      name: lang === "hi" ? "बिजनेस क्लास (कॉर्पोरेट / उच्च वर्ग)" : lang === "mr" ? "बिझनेस क्लास (कॉर्पोरेट / उच्च वर्ग)" : "Business Class (Corporate Elite)",
      tag: lang === "hi" ? "कॉर्पोरेट / उच्च वर्ग" : lang === "mr" ? "कॉर्पोरेट / उच्च वर्ग" : "Executive Suites (7%)",
      traffic_share: 7,
      base_fare: 22500,
      class_apix: 182.83,
      multiplier: "3.85x",
      typical_range: "₹18,000 - ₹42,000",
      sensitivity: lang === "hi" ? "अप्रभावित (Inelastic)" : lang === "mr" ? "स्थिर मागणी (Inelastic)" : "Inelastic Demand",
      icon: Briefcase,
      color: "amber",
      borderCol: "border-amber-300",
      bgCol: "bg-amber-50/70",
      textCol: "text-amber-700",
      desc: lang === "hi"
        ? "कॉर्पोरेट अधिकारी और उच्च आय वर्ग। मांग अप्रभावित रहती है क्योंकि खर्च कंपनियों द्वारा वहन किया जाता है।"
        : lang === "mr"
        ? "कॉर्पोरेट अधिकारी आणि उच्च उत्पन्न गट. तिकीट खर्च कंपनी बजेटमधून होत असल्याने दरवाढीचा प्रभाव नगण्य."
        : "Corporate executives and HNWIs. Inelastic demand where price surges are directly absorbed by company budgets."
    },
    {
      id: "concessional",
      name: lang === "hi" ? "रियायती वर्ग (छात्र / वरिष्ठ / रक्षा)" : lang === "mr" ? "सवलत वर्ग (विद्यार्थी / ज्येष्ठ / सैनिक)" : "Concessional (Student / Senior / Defence)",
      tag: lang === "hi" ? "DGCA कल्याणकारी योजना" : lang === "mr" ? "DGCA कल्याणकारी योजना" : "Welfare Concessions",
      traffic_share: 8,
      base_fare: 4210,
      class_apix: 140.62,
      multiplier: "0.72x",
      typical_range: "₹3,100 - ₹5,200",
      sensitivity: lang === "hi" ? "संरक्षित रियायत" : lang === "mr" ? "संरक्षित दर" : "Regulated / Protected",
      icon: GraduationCap,
      color: "emerald",
      borderCol: "border-emerald-300",
      bgCol: "bg-emerald-50/70",
      textCol: "text-emerald-700",
      desc: lang === "hi"
        ? "DGCA परिपत्रकों के तहत छात्रों, वरिष्ठ नागरिकों और रक्षा कर्मियों को मूल किराए पर 6% से 50% तक वैधानिक रियायत।"
        : lang === "mr"
        ? "DGCA नियमांनुसार विद्यार्थी, ६० वर्षांवरील ज्येष्ठ नागरिक आणि सैनिकांना मूळ दरावर ५०% पर्यंत कायदेशीर सवलत."
        : "DGCA mandated welfare concessions (6% to 50% on basic fare) for Students, Senior Citizens, and Armed Forces personnel."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">{t.passengerClassTitle}</h2>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                MoSPI Stratification
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {t.passengerClassDesc}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shrink-0 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {lang === "hi" ? "किराया विषमता अनुपात" : lang === "mr" ? "भाडे विषमता प्रमाण" : "Executive / Economy Disparity"}
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">3.85x</div>
            <span className="text-[10px] text-slate-300 font-medium">Business vs. Economy</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Passenger Class Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const IconComponent = cls.icon;
          return (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border-2 ${cls.borderCol} p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`p-2 rounded-xl ${cls.bgCol} ${cls.textCol}`}>
                    <IconComponent className="w-5 h-5" />
                  </span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${cls.bgCol} ${cls.textCol}`}>
                    {cls.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{cls.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{cls.base_fare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      ({cls.multiplier})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {lang === "hi" ? "यात्री भार" : lang === "mr" ? "प्रवासी प्रमाण" : "Traffic Share"}
                    </span>
                    <span className="font-black text-slate-800 font-mono">{cls.traffic_share}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {lang === "hi" ? "वर्ग APIx" : lang === "mr" ? "वर्ग APIx" : "Class APIx"}
                    </span>
                    <span className={`font-black font-mono ${cls.textCol}`}>{cls.class_apix}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {cls.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{cls.typical_range}</span>
                <span className="font-bold text-slate-700">{cls.sensitivity}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Airfare Surge Disparity Matrix */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">{t.surgeDisparityTitle}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.surgeDisparityDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              {lang === "hi" ? "त्योहारी / अंतिम समय उछाल:" : lang === "mr" ? "सणासुदीची दरवाढ:" : "Simulated Surge:"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1500, 3000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSimulatedSurge(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer transition ${
                    simulatedSurge === amt
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  +₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disparity Comparison Bars */}
        <div className="space-y-4">
          {classes.map((cls) => {
            const burdenPct = Number(((simulatedSurge / cls.base_fare) * 100).toFixed(1));
            const newTotal = cls.base_fare + simulatedSurge;
            const isSevere = burdenPct >= 35;

            return (
              <div key={cls.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{cls.name}</span>
                    <span className="text-slate-500 font-mono">(₹{cls.base_fare.toLocaleString("en-IN")})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-600">
                      {lang === "hi" ? "उछाल बाद किराया:" : lang === "mr" ? "वाढीव भाडे:" : "Surged Fare:"}
                      {" "}<strong className="text-slate-900 font-mono font-black">₹{newTotal.toLocaleString("en-IN")}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isSevere ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}>
                      +{burdenPct}% {lang === "hi" ? "अतिरिक्त बोझ" : lang === "mr" ? "अतिरिक्त भार" : "Wallet Impact"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isSevere ? "bg-gradient-to-r from-amber-500 to-rose-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"
                    }`}
                    style={{ width: `${Math.min(100, burdenPct * 1.5)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isSevere
                      ? (lang === "hi" 
                          ? "⚠️ गंभीर प्रभाव: आम नागरिक के यात्रा बजट का 50% से अधिक हिस्सा केवल उछाल में खर्च होता है।"
                          : lang === "mr"
                          ? "⚠️ गंभीर परिणाम: सर्वसामान्य नागरिकाच्या बजेटवर ५०% पेक्षा जास्त भार फक्त दरवाढीचा."
                          : "⚠️ Severe Regressive Impact: Over 50% of the traveler's baseline fare is consumed by surge pricing alone.")
                      : (lang === "hi"
                          ? "स्थिर प्रभाव: उच्च आय वर्ग और कंपनियों के लिए यह वृद्धि नगण्य है।"
                          : lang === "mr"
                          ? "किरकोळ प्रभाव: उच्च उत्पन्न गट आणि कंपन्यांसाठी ही दरवाढ नगण्य आहे."
                          : "Marginal Impact: Readily absorbed by corporate budgets with near-zero change in travel frequency.")
                    }
                  </span>
                  <span className="font-mono font-bold text-slate-700">+{simulatedSurge} INR</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistical Officer Policy Takeaway */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <h4 className="font-black">
              {lang === "hi" 
                ? "MoSPI सांख्यिकी अधिकारी नीतिगत निष्कर्ष (Policy Takeaway):" 
                : lang === "mr"
                ? "MoSPI सांख्यिकी अधिकारी धोरणात्मक निष्कर्ष:"
                : "MoSPI Statistical Officer Policy Takeaway:"
              }
            </h4>
            <p className="leading-relaxed">
              {lang === "hi"
                ? "पारंपरिक एयरलाइन रिपोर्टिंग केवल औसत कीमतों को दिखाती है। हमारा APIx मल्टी-क्लास स्तरीकरण स्पष्ट करता है कि ₹3,000 की सामान्य मूल्य वृद्धि आम इकोनॉमी यात्री (82% आबादी) पर 51% का अप्रत्याशित बोझ डालती है, जबकि कॉर्पोरेट बिजनेस क्लास पर इसका प्रभाव केवल 9% होता है। इसलिए MoSPI CPI में इकोनॉमी टिकटों को 82% भार देना ही वास्तविक मुद्रास्फीति को दर्शाता है।"
                : lang === "mr"
                ? "पारंपारिक अहवाल केवळ सरासरी दर दाखवतात. आमचे APIx मल्टी-क्लास स्तरीकरण हे सिद्ध करते की ₹३,००० ची दरवाढ सामान्य इकॉनॉमी प्रवाशावर (८२% जनता) ५१% इतका प्रचंड बोजा टाकते, तर कॉर्पोरेट वर्गावर केवळ ९% प्रभाव पडतो. म्हणूनच MoSPI CPI मध्ये इकॉनॉमी दरांना ८२% वजन देणेच खरी महागाई दर्शवते."
                : "Traditional airline averages hide severe social regressivity. APIx multi-class stratification proves that a uniform ₹3,000 surge imposes a 51.3% penalty on common citizens (82% of traffic), whereas corporate travelers bear only 9.2%. Assigning an 82% weight to Economy fares in the MoSPI CPI captures authentic consumer cost of living."
              }
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
