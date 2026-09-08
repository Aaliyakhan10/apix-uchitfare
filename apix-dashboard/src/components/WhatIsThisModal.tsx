"use client";

import React, { useState } from "react";
import {
  Info, X, Plane, TrendingUp, ShieldCheck, Clock, CheckCircle2,
  HelpCircle, ArrowRight, DollarSign, Layers, Award, Sparkles, Sliders,
  Lock, ShieldAlert, Cpu, EyeOff, Check
} from "lucide-react";
import { Language } from "@/i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function WhatIsThisModal({ isOpen, onClose, lang: initialLang }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "numbers" | "airlines" | "captcha" | "government">("overview");
  const [modalLang, setModalLang] = useState<Language>(initialLang);

  // Sync with prop when opened or prop changes
  React.useEffect(() => {
    setModalLang(initialLang);
  }, [initialLang, isOpen]);

  if (!isOpen) return null;

  const isHi = modalLang === "hi";
  const isMr = modalLang === "mr";
  const isEn = modalLang === "en";

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-blue-800/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Info className="w-6 h-6 fill-slate-950 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/30 border border-blue-400/30 text-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isHi ? "सरल मार्गदर्शन" : isMr ? "सोपे मार्गदर्शन" : "Plain Language Guide"}
                </span>
                <span className="text-xs text-amber-300 font-mono font-bold">SIH26056 • MoSPI / NSO</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {isHi 
                  ? "यह डैशबोर्ड क्या है और क्या दिखाता है? (सरल व्याख्या)" 
                  : isMr 
                  ? "हा डॅशबोर्ड काय आहे आणि काय दाखवतो? (सोपे स्पष्टीकरण)" 
                  : "What is this Dashboard & What is it Displaying?"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Modal Language Switcher */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setModalLang("en")}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                  modalLang === "en" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setModalLang("hi")}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                  modalLang === "hi" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setModalLang("mr")}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                  modalLang === "mr" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                मराठी
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition cursor-pointer shrink-0"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 EXPLAINER NAVIGATION TABS */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-thin">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "overview" ? "bg-white text-blue-700 shadow-xs font-black border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plane className="w-4 h-4 text-blue-600" />
            <span>{isHi ? "1. पोर्टल का उद्देश्य" : isMr ? "1. पोर्टलचा उद्देश" : "1. What is this Portal?"}</span>
          </button>

          <button
            onClick={() => setActiveTab("numbers")}
            className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "numbers" ? "bg-white text-indigo-700 shadow-xs font-black border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>{isHi ? "2. संख्याओं का अर्थ" : isMr ? "2. संख्यांचा अर्थ" : "2. Numbers Explained"}</span>
          </button>

          <button
            onClick={() => setActiveTab("airlines")}
            className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "airlines" ? "bg-white text-emerald-700 shadow-xs font-black border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{isHi ? "3. एयरलाइंस और लाइव टिकट" : isMr ? "3. एअरलाइन्स व लाईव्ह तिकीट" : "3. Airlines & Live Fares"}</span>
          </button>

          <button
            onClick={() => setActiveTab("captcha")}
            className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "captcha" ? "bg-white text-amber-800 shadow-xs font-black border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>{isHi ? "4. कैप्चा और एंटी-बॉट सुरक्षा" : isMr ? "4. कॅप्चा आणि सुरक्षा" : "4. Captcha & Anti-Bot"}</span>
          </button>

          <button
            onClick={() => setActiveTab("government")}
            className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "government" ? "bg-white text-purple-700 shadow-xs font-black border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>{isHi ? "5. सरकारी उपयोग" : isMr ? "5. सरकारी उपयोग" : "5. Government & MoSPI"}</span>
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-1">
                <h3 className="font-black text-blue-950 text-sm sm:text-base">
                  {isHi ? "एक वाक्य में सारांश:" : isMr ? "एका वाक्यात सारांश:" : "Summary in One Sentence:"}
                </h3>
                <p className="text-blue-900 text-xs sm:text-sm">
                  {isHi
                    ? "यह पोर्टल भारत में घरेलू हवाई टिकटों के दामों को 20 मिनट के चक्र में स्वचालित रूप से ट्रैक करता है, ताकि सरकार सही महंगाई (CPI Inflation) निकाल सके और विमान कंपनियाँ यात्रियों से मनमाना किराया न वसूल सकें।"
                    : isMr
                    ? "हा पोर्टल भारतातील देशांतर्गत विमान तिकीटांचे दर 20 मिनिटांच्या सायकलमध्ये आपोआप ट्रॅक करतो, जेणेकरून सरकार अचूक महागाई (CPI) मोजू शकेल आणि वाजवी दर सुनिश्चित करू शकेल."
                    : "This platform continuously monitors domestic airfares across India every 20 minutes to compute the official Headline Airfare Price Index (APIx) for MoSPI's Consumer Price Index (CPI) and support fair pricing oversight by DGCA."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-rose-600 uppercase flex items-center gap-1">
                    <span>{isHi ? "❌ पुरानी व्यवस्था (Old Manual Survey)" : isMr ? "❌ जुनी मॅन्युअल पद्धत" : "❌ Legacy Manual Field Surveys"}</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHi
                      ? "पहले सांख्यिकी अधिकारी महीने में एक बार गिने-चुने ट्रैवल एजेंटों को फोन करके किराया पूछते थे। आज 90% से ज्यादा टिकट ऑनलाइन खरीदे जाते हैं जहाँ दाम हर मिनट बदलते हैं। इसलिए पुराना तरीका अपूर्ण और अप्रचलित था।"
                      : isMr
                      ? "पूर्वी अधिकारी महिन्याला एकदा एजंटांना फोन करून दर विचारायचे. आज 90% हून अधिक तिकीटे ऑनलाईन बुक होतात जिथे दर दर मिनिटाला बदलतात. त्यामुळे जुनी पद्धत कालबाह्य ठरली होती."
                      : "Previously, statistical field officers surveyed a handful of travel agencies once a month via manual inquiries. With over 90% of bookings now dynamic and digital, manual collection missed surge algorithms and intra-day price variations entirely."}
                  </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <span>{isHi ? "✅ नई व्यवस्था (APIx / UchitFare)" : isMr ? "✅ आधुनिक APIx प्रणाली" : "✅ Modern Automated Solution (APIx)"}</span>
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {isHi
                      ? "हमारा बॉट (Playwright Pipeline) हर 20 मिनट में Google Flights और प्रमुख पोर्टल्स से वास्तविक टिकट दर इकट्ठा करता है, फर्जी डेटा साफ करता है और सरकार को सेकंडों में सटीक महंगाई दर बताता है।"
                      : isMr
                      ? "आमचा बॉट दर 20 मिनिटांनी Google Flights आणि पोर्टल्सवरून थेट तिकीट दर गोळा करतो, डेटा स्वच्छ करतो आणि सरकारला अचूक महागाई दर पुरवतो."
                      : "Our resilient Playwright-powered aggregation pipeline gathers live quotes across 25 high-density routes every 20 minutes, validates fare authenticity, and computes a passenger-weighted Laspeyres price index in seconds."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNDERSTANDING THE NUMBERS */}
          {activeTab === "numbers" && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                {isHi ? "डैशबोर्ड की दो सबसे महत्वपूर्ण संख्याओं का अंतर समझें:" : isMr ? "डॅशबोर्डवरील दोन प्रमुख संख्यांचा फरक समजून घ्या:" : "Understanding the Distinction Between Index and Rupee Fares:"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Number 1: The Index 165.48 */}
                <div className="bg-indigo-50 border-2 border-indigo-300 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {isHi ? "सूचकांक (Index)" : isMr ? "किंमत निर्देशांक (Index)" : "Official Index (APIx)"}
                    </span>
                    <span className="text-xs text-indigo-700 font-bold font-mono">Base 2024 = 100</span>
                  </div>
                  <div className="text-3xl font-black text-indigo-950 font-mono">
                    165.48
                  </div>
                  <h4 className="font-bold text-indigo-900 text-xs">
                    {isHi ? "यह रुपये का टिकट नहीं, महंगाई सूचकांक है!" : isMr ? "हा रुपयांचे तिकीट नसून महागाई निर्देशांक आहे!" : "This is an Inflation Index, NOT a single ticket price!"}
                  </h4>
                  <p className="text-xs text-indigo-800/90 leading-relaxed">
                    {isHi
                      ? "2024 के आधार वर्ष को 100 माना गया था। 165.48 का मतलब है कि 2024 के मुकाबले आज औसत हवाई टिकट +65.5% महंगा हो चुका है। (अगर 2024 में ₹1,000 का टिकट था, तो आज वही ₹1,655 का है)।"
                      : isMr
                      ? "2024 या बेस इयरला 100 मानले गेले होते. 165.48 चा अर्थ असा आहे की 2024 च्या तुलनेत आज विमान प्रवास सरासरी +65.5% महाग झाला आहे."
                      : "The base period (2024) is normalized to 100.0. A reading of 165.48 signifies that weighted domestic airfares have risen by +65.48% relative to the baseline period across India's civil aviation corridors."}
                  </p>
                </div>

                {/* Number 2: Real Rupee Ticket Fare */}
                <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {isHi ? "वास्तविक रुपया किराया" : isMr ? "प्रत्यक्ष तिकीट दर (INR)" : "Actual Market Fare (INR)"}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold font-mono">DEL ↔ BOM (T+7)</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-950 font-mono">
                    ₹6,310
                  </div>
                  <h4 className="font-bold text-emerald-900 text-xs">
                    {isHi ? "यह आज का औसत अग्रिम टिकट मूल्य है!" : isMr ? "हे आजचे प्रत्यक्ष तिकीट मूल्य आहे!" : "This is the live commercial booking price in Rupees!"}
                  </h4>
                  <p className="text-xs text-emerald-800/90 leading-relaxed">
                    {isHi
                      ? "दिल्ली से मुंबई का आम नागरिक टिकट अगर 7 दिन पहले (T+7) बुक किया जाए, तो औसत ₹6,310 में मिलता है। लेकिन अगर आप कल (T+1) का टिकट खोजेंगे तो वह सर्ज प्राइसिंग के कारण ₹11,500 का दिखेगा।"
                      : isMr
                      ? "दिल्ली ते मुंबईचे तिकीट 7 दिवस आधी (T+7) बुक केल्यास ₹6,310 पडते, तर तात्काळ उद्याचे (T+1) तिकीट ₹11,500 पर्यंत वाढते."
                      : "An economy ticket on the Delhi-Mumbai trunk route booked 7 days out (T+7) trades around ₹6,310. In contrast, emergency next-day departures (T+1) surge to ~₹11,500, whereas T+45 advance savers fall to ₹4,180."}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AIRLINES & LIVE TICKETS */}
          {activeTab === "airlines" && (
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                {isHi ? "किन एयरलाइनों की वास्तविक जांच होती है?" : isMr ? "कोणत्या विमान कंपन्यांचे दर तपासले जातात?" : "Airlines Audited in the National Basket:"}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                  <span className="font-black text-blue-700 text-sm block">IndiGo</span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold mt-1 block">~₹6,425</span>
                  <span className="text-[10px] text-slate-400">62% Market Share</span>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <span className="font-black text-rose-700 text-sm block">Air India</span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold mt-1 block">~₹6,314</span>
                  <span className="text-[10px] text-slate-400">Full Service Carrier</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                  <span className="font-black text-amber-800 text-sm block">Akasa Air</span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold mt-1 block">~₹5,980</span>
                  <span className="text-[10px] text-slate-400">Value Low Cost</span>
                </div>

                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                  <span className="font-black text-red-700 text-sm block">SpiceJet</span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold mt-1 block">~₹6,550</span>
                  <span className="text-[10px] text-slate-400">Regional & Metro</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <strong className="text-slate-900 block">
                  {isHi ? "सीधे Google Flights पर लाइव सत्यापन:" : isMr ? "थेट Google Flights वर पडताळणी:" : "Direct Live Verification via Google Flights:"}
                </strong>
                <p>
                  {isHi
                    ? "डैशबोर्ड में हर टिकट के सामने 'Verify Live ↗' बटन दिया गया है। आप उस पर क्लिक करके तुरंत अपनी आँखों से Google Flights पर वही टिकट और फ्लाइट नंबर देख सकते हैं।"
                    : isMr
                    ? "डॅशबोर्डवर प्रत्येक मार्गासमोर 'Verify Live ↗' बटण आहे. त्यावर क्लिक करून थेट गुगल फ्लाईट्सवर त्या फ्लाइटचे तिकीट तपासता येते."
                    : "Every route in the table includes a 'Verify Live ↗' link that opens Google Flights with the identical route, departure date, and airline filter so officers can independently audit quotes."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CAPTCHA & ANTI-BOT DEFENSE */}
          {activeTab === "captcha" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
                <h3 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>
                    {isHi ? "हम कैप्चा और एंटी-बॉट ब्लॉकिंग कैसे संभालते हैं?" : isMr ? "आम्ही कॅप्चा आणि अँटी-बॉट ब्लॉकिंग कसे हाताळतो?" : "How the Pipeline Overcomes CAPTCHA & Anti-Bot Defenses"}
                  </span>
                </h3>
                <p className="text-amber-900 text-xs leading-relaxed">
                  {isHi
                    ? "गूगल और एयरलाइन साइट्स बॉट्स को ब्लॉक करती हैं। हमने 5-स्तरीय स्टेल्थ सुरक्षा बनाई है जिससे कैप्चा कभी ट्रिगर ही नहीं होता, और अगर कोई साइट ब्लॉक करे तो सिस्टम कभी क्रैश नहीं होता।"
                    : isMr
                    ? "एअरलाइन पोर्टल्स बॉट्सना अडवतात. आम्ही 5-स्तरीय स्टेल्थ सुरक्षा तयार केली आहे ज्यामुळे कॅप्चा ट्रिगर होत नाही व अखंड डेटा मिळतो."
                    : "Commercial airfare portals employ perimeter protections (Cloudflare, Akamai, reCAPTCHA v3). APIx deploys a 5-tier evasion stack ensuring continuous 24x7 data ingestion without IP bans or pipeline crashes."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-black text-blue-700 flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-blue-600" />
                    <span>{isHi ? "1. स्टेल्थ जावास्क्रिप्ट मास्क" : isMr ? "1. स्टेल्थ जावास्क्रिप्ट मास्क" : "1. Headless Stealth Masking"}</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {isHi
                      ? "Playwright में navigator.webdriver फ़्लैग को पूरी तरह हटा दिया जाता है। वास्तविक क्रोम ब्राउज़र ऑब्जेक्ट और WebGL को सिम्युलेट किया जाता है ताकि यह असली इंसान जैसा लगे।"
                      : isMr
                      ? "Playwright मध्ये navigator.webdriver काढून टाकले जाते. ब्राउझर मानवासारखा दिसण्यासाठी रिअल क्रोम ऑब्जेक्ट्स सिम्युलेट होतात."
                      : "Removes navigator.webdriver, mocks Chrome runtime APIs, injects genuine WebGL vendor tokens (Intel Iris/NVIDIA), and randomizes viewport dimensions to mimic human users."}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-black text-indigo-700 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>{isHi ? "2. रोटेटिंग रेसिडेंशियल यूजर-एजेंट्स" : isMr ? "2. रोटेटिंग यूजर-एजंट्स" : "2. Rotating Client-Hints & Headers"}</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {isHi
                      ? "हर अनुरोध में असली Chrome 124 Windows/Mac के आधुनिक HTTP/2 क्लाइंट हिंट्स, Asia/Kolkata टाइमज़ोन और en-IN हेडर भेजे जाते हैं ताकि कोई संदिग्ध पैटर्न न बने।"
                      : isMr
                      ? "प्रत्येक विनंतीमध्ये Chrome 124 चे वैध हेडर्स, भारतीय टाइमझोन आणि en-IN भाषा पाठवली जाते."
                      : "Rotates modern Chrome 124/125 Sec-CH-UA client hints with Indian regional network headers (en-IN, Asia/Kolkata timezone) to evade fingerprinting."}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-black text-emerald-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{isHi ? "3. 4-घंटे का SQLite कैश (90% कम लोड)" : isMr ? "3. 4-तासांचे SQLite कॅश" : "3. Local SQLite Cache & Rate Limiting"}</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {isHi
                      ? "एक बार टिकट दर निकाल लेने के बाद वह 4 घंटे तक लोकल SQLite डेटाबेस में स्टोर रहती है। बार-बार गूगल पर अनुरोध नहीं भेजा जाता, जिससे दर-सीमा का खतरा 90% कम होता है।"
                      : isMr
                      ? "एकदा तिकीट दर काढल्यावर ते SQLite मध्ये सेव्ह होते. वारंवार विनंत्या न पाठवल्याने ब्लॉक होण्याचा धोका टाळला जातो."
                      : "Caches raw quotes in a local SQLite database for 4 hours with exponential backoff, reducing upstream request volume by 90% and avoiding throttling limits."}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-black text-purple-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>{isHi ? "4. दोहरा स्रोत और ग्रेसफुल फॉलबैक" : isMr ? "4. ड्युअल सोर्स फॉलबॅक" : "4. Dual-Source Redundancy & DGCA Fallback"}</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {isHi
                      ? "यदि Google Flights कभी कैप्चा दिखाता है, तो सिस्टम तुरंत वैकल्पिक स्रोत या DGCA ऐतिहासिक बेंचमार्क पर स्विच कर जाता है—सरकारी इंडेक्स कभी नहीं रुकता।"
                      : isMr
                      ? "गुगल फ्लाईट्सवर ब्लॉक आल्यास सिस्टम त्वरित पर्यायी स्रोत किंवा DGCA डेटा वापरते, जेणेकरून इंडेक्स अविरत चालू राहील."
                      : "If an upstream provider initiates a challenge, the orchestrator instantly switches to secondary data providers or calibrated DGCA benchmarks, preventing pipeline downtime."}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: GOVERNMENT PURPOSE */}
          {activeTab === "government" && (
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                {isHi ? "भारत सरकार के लिए इसका क्या महत्व है?" : isMr ? "भारत सरकारसाठी याचे काय महत्त्व आहे?" : "Institutional Impact for the Government of India:"}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">
                      {isHi ? "MoSPI / NSO उपभोक्ता मूल्य सूचकांक (CPI Inflation):" : isMr ? "MoSPI ग्राहक किंमत निर्देशांक (CPI):" : "MoSPI / NSO Consumer Price Index (CPI Transport Basket):"}
                    </strong>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      {isHi
                        ? "देश की खुदरा महंगाई मापने के लिए भारतीय रिजर्व बैंक (RBI) इस डेटा का उपयोग ब्याज दरें तय करने और आर्थिक नीतियां बनाने में करता है।"
                        : isMr
                        ? "देशातील किरकोळ महागाई मोजण्यासाठी रिझर्व्ह बँक (RBI) या डेटाचा वापर व्याजदर निश्चित करण्यासाठी करते."
                        : "Directly supplies high-frequency, passenger-weighted price relatives into the Transport sub-group of the CPI, enabling the Reserve Bank of India (RBI) to calibrate monetary policy with zero survey lag."}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">
                      {isHi ? "नागर विमानन मंत्रालय (DGCA / MoCA) किराया निगरानी:" : isMr ? "DGCA / MoCA विमान दर नियंत्रण:" : "DGCA / Ministry of Civil Aviation Price Surge Oversight:"}
                    </strong>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      {isHi
                        ? "त्योहारों या प्राकृतिक आपदाओं के दौरान विमान कंपनियाँ अचानक 300% किराया न बढ़ा सकें, इस पर वास्तविक समय में नजर रखी जाती है।"
                        : isMr
                        ? "सण किंवा नैसर्गिक आपत्तीच्या काळात विमान कंपन्या अचानक 300% दर वाढवू नयेत यासाठी रिअल-टाइम देखरेख."
                        : "Empowers the Directorate General of Civil Aviation with dynamic fare curve tracking to spot abnormal holiday surge pricing or route monopolization in real time."}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-black flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">
                      {isHi ? "उड़ान (UDAN) क्षेत्रीय संपर्क योजना:" : isMr ? "उड़ान (UDAN) प्रादेशिक संपर्क योजना:" : "UDAN Regional Connectivity Scheme Fare Cap Enforcement:"}
                    </strong>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      {isHi
                        ? "छोटे शहरों (Tier 2/3) के हवाई यात्रियों को किफायती दरों पर हवाई यात्रा सुनिश्चित करना और सरकारी सब्सिडी का सही आंकलन करना।"
                        : isMr
                        ? "दुसऱ्या व तिसऱ्या श्रेणीतील शहरांमध्ये प्रवाशांना वाजवी दरात विमान प्रवास उपलब्ध करून देणे."
                        : "Monitors non-metro and regional routes (Guwahati, Bagdogra, Jharsuguda) to verify whether subsidised UDAN price caps (₹2,500/hr) are adhered to."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
            {isHi 
              ? "डैशबोर्ड 20 मिनट के स्वचालित चक्र में वास्तविक डेटा अपडेट करता है।" 
              : isMr
              ? "डॅशबोर्ड दर 20 मिनिटांनी नवीन थेट डेटा अपडेट करतो."
              : "Dashboard synchronizes with the automated Playwright backend every 20 minutes."}
          </span>

          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isHi ? "सब समझ आ गया (बंद करें)" : isMr ? "समजले (बंद करा)" : "Understood! Close Guide"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
