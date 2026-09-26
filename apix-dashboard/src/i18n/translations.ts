export type Language = "en" | "hi" | "mr";

export interface Translations {
  // Portal Header & Meta
  govIndia: string;
  ministryName: string;
  diidTitle: string;
  portalTitle: string;
  portalSubtitle: string;
  problemId: string;
  productionBadge: string;
  selectLanguage: string;
  
  // Actions
  runScraperBtn: string;
  runningScraperBtn: string;
  downloadCpiBtn: string;
  resetDefaultBtn: string;
  simulateBtn: string;
  simulatingBtn: string;

  // Tabs
  tabOverview: string;
  tabCleaning: string;
  tabCalculator: string;
  tabScraper: string;
  tabReport: string;
  tabAdvisor: string;

  // Metric Cards
  cardHeadlineIndex: string;
  cardHeadlineDesc: string;
  cardMonthlyInflation: string;
  cardMonthlyDesc: string;
  cardCleanedRecords: string;
  cardCleanedDesc: string;
  cardReliability: string;
  cardReliabilityDesc: string;

  // Live Calculator Section
  calcTitle: string;
  calcBadge: string;
  calcDesc: string;
  calcMetroWeightLabel: string;
  calcUdanWeightLabel: string;
  calcFuelShockLabel: string;
  calcCleaningToggleLabel: string;
  calcCleaningToggleDesc: string;
  calcResultsHeading: string;
  calcBaselineIndex: string;
  calcNewIndex: string;
  calcDifference: string;
  calcCpiImpact: string;
  calcExplanationLabel: string;
  calcFormulaLabel: string;

  // Data Cleaning & Sandbox
  cleanHeaderTitle: string;
  cleanHeaderDesc: string;
  cleanBadge: string;
  cleanStagesHeading: string;
  cleanSandboxHeading: string;
  cleanSandboxDesc: string;
  cleanPresetsLabel: string;
  cleanPresetNormal: string;
  cleanPresetBusiness: string;
  cleanPresetNegative: string;
  cleanPresetZero: string;
  cleanPresetSpike: string;
  cleanRouteLabel: string;
  cleanCarrierLabel: string;
  cleanWindowLabel: string;
  cleanFareLabel: string;
  cleanAuditVerdictLabel: string;
  cleanQuarantined: string;
  cleanAccepted: string;
  cleanPurifiedFareLabel: string;
  cleanBaseFareLabel: string;
  cleanFuelSurchargeLabel: string;
  cleanTaxesLabel: string;

  // 5 Stages
  stage1Name: string;
  stage1Desc: string;
  stage2Name: string;
  stage2Desc: string;
  stage3Name: string;
  stage3Desc: string;
  stage4Name: string;
  stage4Desc: string;
  stage5Name: string;
  stage5Desc: string;

  // Scraper Terminal
  scraperTitle: string;
  scraperSubtitle: string;
  scraperLogsTitle: string;
  scraperTriggerBtn: string;
  scraperTriggeringBtn: string;

  // Government Tips / Notes
  govNoteTitle: string;
  govNoteContent: string;

  // 10-Min Auto Cadence & One-Click Master Flow
  dataFreshnessLabel: string;
  dataFreshnessTime: string;
  nextSyncCountdown: string;
  autoDaemonMode: string;
  autoDaemonToggle: string;
  oneClickFlowBtn: string;
  oneClickFlowRunning: string;
  oneClickFlowModalTitle: string;
  oneClickFlowModalDesc: string;

  // Passenger Class Stratification
  passengerClassTitle: string;
  passengerClassDesc: string;
  classEconomyTitle: string;
  classPremiumTitle: string;
  classBusinessTitle: string;
  classConcessionalTitle: string;
  surgeDisparityTitle: string;
  surgeDisparityDesc: string;

  // 30-Day DGCA Backtesting
  backtest30DayTitle: string;
  backtest30DayDesc: string;
  backtest30DayPill: string;
  backtest90DayPill: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    govIndia: "GOVERNMENT OF INDIA",
    ministryName: "Ministry of Statistics & Programme Implementation (MoSPI)",
    diidTitle: "Data Informatics & Innovation Division (DIID)",
    portalTitle: "APIx — Airfare Price Index Portal (UchitFare)",
    portalSubtitle: "Automated Civil Aviation Price Intelligence for National Consumer Price Index (CPI)",
    problemId: "SIH26056 MoSPI",
    productionBadge: "Production Ready",
    selectLanguage: "Language",

    runScraperBtn: "Run Live Pipeline",
    runningScraperBtn: "Processing Pipeline...",
    downloadCpiBtn: "Download MoSPI CPI Data (CSV)",
    resetDefaultBtn: "Reset Demo Assumptions",
    simulateBtn: "Audit & Purify Fare",
    simulatingBtn: "Auditing...",

    tabOverview: "Dashboard Overview",
    tabCleaning: "Data Cleaning Pipeline",
    tabCalculator: "Live APIx Impact Calculator",
    tabScraper: "Live Scraping Simulator",
    tabReport: "Official MoSPI Bulletin",
    tabAdvisor: "Consumer Fare Advisor",

    cardHeadlineIndex: "Headline Airfare Index (APIx)",
    cardHeadlineDesc: "Traffic-weighted Laspeyres Base 2026 = 100",
    cardMonthlyInflation: "Month-on-Month Inflation",
    cardMonthlyDesc: "Aviation transport subgroup price change",
    cardCleanedRecords: "Cleaned Airfare Records",
    cardCleanedDesc: "Screened by ML Isolation Forest",
    cardReliability: "MoSPI Reliability Index",
    cardReliabilityDesc: "Optimal market representation score",

    calcTitle: "Live APIx Impact Calculator",
    calcBadge: "Instant Sensitivity Engine",
    calcDesc: "Move any slider below to see how policy weight changes, fuel shocks, or dirty data immediately affect the Airfare Price Index and national CPI inflation.",
    calcMetroWeightLabel: "Metro Routes Weight (%)",
    calcUdanWeightLabel: "Regional / UDAN Routes Weight (%)",
    calcFuelShockLabel: "Aviation Turbine Fuel (ATF) Shock (%)",
    calcCleaningToggleLabel: "Apply ML Data Cleaning & Purification",
    calcCleaningToggleDesc: "Turn off to see how uncleaned outlier fares distort the sample index.",
    calcResultsHeading: "Live Calculation Results",
    calcBaselineIndex: "Sample Baseline APIx",
    calcNewIndex: "Newly Calculated APIx",
    calcDifference: "Index Shift (Delta)",
    calcCpiImpact: "Impact on Transport CPI",
    calcExplanationLabel: "Statistical Officer Plain-Language Explanation",
    calcFormulaLabel: "Active Weighted Formula",

    cleanHeaderTitle: "5-Stage Automated Data Cleaning Architecture",
    cleanHeaderDesc: "Raw fares from Google Flights and Skyscanner are rigorously purified before index calculation.",
    cleanBadge: "MoSPI Data Integrity Standard",
    cleanStagesHeading: "5 Purification Steps",
    cleanSandboxHeading: "Interactive Fare Purification Sandbox",
    cleanSandboxDesc: "Test any raw airfare or click a common glitch preset to see how the pipeline diagnoses and sanitizes it.",
    cleanPresetsLabel: "Glitch Presets:",
    cleanPresetNormal: "Normal Economy (₹6,400)",
    cleanPresetBusiness: "Business Class Leak (₹48,500)",
    cleanPresetNegative: "Negative Price Glitch (-₹150)",
    cleanPresetZero: "Sub-₹500 Fee Glitch (₹290)",
    cleanPresetSpike: "Flash Surge Spike (₹36,000)",
    cleanRouteLabel: "Route Corridor",
    cleanCarrierLabel: "Airline Carrier",
    cleanWindowLabel: "Booking Horizon",
    cleanFareLabel: "Raw Scraped Fare (₹)",
    cleanAuditVerdictLabel: "Audit Verdict & Diagnosis",
    cleanQuarantined: "QUARANTINED & SANITIZED",
    cleanAccepted: "CERTIFIED INLIER (ACCEPTED)",
    cleanPurifiedFareLabel: "Sanitized Index Fare",
    cleanBaseFareLabel: "Base Fare (68%)",
    cleanFuelSurchargeLabel: "Fuel Surcharge (16%)",
    cleanTaxesLabel: "Airport Taxes & UDF (16%)",

    stage1Name: "1. Deduplication",
    stage1Desc: "Removes duplicate quotes across airlines and time slots.",
    stage2Name: "2. Structural Boundary Checks",
    stage2Desc: "Discards negative prices and values under ₹500 or over ₹1,00,000.",
    stage3Name: "3. Isolation Forest ML",
    stage3Desc: "Machine learning isolates business suites and OCR scraping errors.",
    stage4Name: "4. Peer Carrier Imputation",
    stage4Desc: "Substitutes quarantined outliers with the median of rival airlines.",
    stage5Name: "5. DGCA Component Segregation",
    stage5Desc: "Splits total fare into Base, Fuel Surcharge, and Statutory Airport Fees.",

    scraperTitle: "High-Efficiency Playwright Scraper (Google Flights & Skyscanner)",
    scraperSubtitle: "Direct web extraction with stealth emulation and asset blocking for ultra-fast performance.",
    scraperLogsTitle: "Live Real-Time Pipeline Logs",
    scraperTriggerBtn: "Run Full End-to-End Pipeline",
    scraperTriggeringBtn: "Running Pipeline (Scrape -> Clean -> Local LLM -> APIx)...",

    govNoteTitle: "Guidance Note for Statistical Officers",
    govNoteContent: "APIx uses a DGCA traffic-weighted Laspeyres price index formula. All calculations adhere to the MoSPI Consumer Price Index (CPI) methodology.",

    dataFreshnessLabel: "Live Automated Feed",
    dataFreshnessTime: "Last sync",
    nextSyncCountdown: "Next 20-min cycle in",
    autoDaemonMode: "Autonomous MoSPI Daemon Active",
    autoDaemonToggle: "Auto-Sync (20 min)",
    oneClickFlowBtn: "Run One-Click Automated Sync",
    oneClickFlowRunning: "Running Automated One-Time Flow...",
    oneClickFlowModalTitle: "Autonomous One-Time Sync Flow",
    oneClickFlowModalDesc: "Executing end-to-end technical sequence without manual intervention: Scraping, Multi-Class Split, 5-Stage ML Cleaning, Local LLM, APIx Index & 30-Day DGCA Backtest.",

    passengerClassTitle: "Passenger Class & Economic Stratification",
    passengerClassDesc: "Flight pricing drastically differs across passenger classes. Common citizens traveling in Economy face severe surge penalties (+51% budget impact), while Business Class demand remains inelastic.",
    classEconomyTitle: "Economy Class (General Public)",
    classPremiumTitle: "Premium Economy (Middle Class)",
    classBusinessTitle: "Business Class (Corporate Executives)",
    classConcessionalTitle: "Concessional (Students / Seniors / Defence)",
    surgeDisparityTitle: "Airfare Surge Disparity Matrix",
    surgeDisparityDesc: "How a ₹3,000 festive or last-minute surge disproportionately impacts the wallet of an ordinary citizen vs. a corporate traveler.",

    backtest30DayTitle: "30-Day DGCA Ground-Truth Validation",
    backtest30DayDesc: "Statistically validates automated scraping against publicly published DGCA monthly passenger yield benchmarks over the past 30 days.",
    backtest30DayPill: "30-Day DGCA Validation Window",
    backtest90DayPill: "Full 90-Day Trajectory"
  },

  hi: {
    govIndia: "भारत सरकार",
    ministryName: "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)",
    diidTitle: "डेटा सूचना विज्ञान और नवाचार प्रभाग (DIID)",
    portalTitle: "APIx — हवाई किराया मूल्य सूचकांक पोर्टल (उचितफेयर)",
    portalSubtitle: "राष्ट्रीय उपभोक्ता मूल्य सूचकांक (CPI) हेतु स्वचालित नागरिक उड्डयन किराया आसूचना प्रणाली",
    problemId: "SIH26056 MoSPI",
    productionBadge: "उत्पादन हेतु तैयार",
    selectLanguage: "भाषा चुनें",

    runScraperBtn: "लाइव पाइपलाइन चलाएं",
    runningScraperBtn: "पाइपलाइन प्रक्रिया जारी है...",
    downloadCpiBtn: "MoSPI CPI डेटा डाउनलोड करें (CSV)",
    resetDefaultBtn: "मानक स्तर पर रीसेट करें",
    simulateBtn: "किराया जांचें एवं शुद्ध करें",
    simulatingBtn: "जांच जारी है...",

    tabOverview: "डैशबोर्ड सारांश",
    tabCleaning: "डेटा शुद्धिकरण पाइपलाइन",
    tabCalculator: "प्रत्यक्ष सूचकांक प्रभाव गणक (कैलकुलेटर)",
    tabScraper: "लाइव स्क्रैपर सिमुलेटर",
    tabReport: "आधिकारिक MoSPI बुलेटिन",
    tabAdvisor: "उपभोक्ता किराया सलाहकार",

    cardHeadlineIndex: "प्रमुख हवाई किराया सूचकांक (APIx)",
    cardHeadlineDesc: "यातायात-भारित लास्पेरेस आधार वर्ष 2026 = 100",
    cardMonthlyInflation: "माह-दर-माह मुद्रास्फीति",
    cardMonthlyDesc: "विमानन परिवहन उप-समूह मूल्य परिवर्तन",
    cardCleanedRecords: "सत्यापित एवं शुद्ध रिकॉर्ड्स",
    cardCleanedDesc: "मशीन लर्निंग (Isolation Forest) द्वारा परीक्षित",
    cardReliability: "MoSPI विश्वसनीयता सूचकांक",
    cardReliabilityDesc: "सर्वोत्तम बाजार प्रतिनिधित्व स्तर",

    calcTitle: "प्रत्यक्ष APIx सूचकांक प्रभाव गणक (Live Calculator)",
    calcBadge: "संवेदनशीलता विश्लेषण इंजन",
    calcDesc: "नीचे दिए गए स्लाइडर्स को बदलें और तुरंत देखें कि मेट्रो/क्षेत्रीय मार्गों का भार बदलने, ईंधन मूल्य झटके या अशुद्ध डेटा से सूचकांक और मुद्रास्फीति पर क्या प्रभाव पड़ता है।",
    calcMetroWeightLabel: "मेट्रो मार्गों का भार (%)",
    calcUdanWeightLabel: "क्षेत्रीय / उड़ान मार्गों का भार (%)",
    calcFuelShockLabel: "विमानन ईंधन (ATF) मूल्य वृद्धि / झटका (%)",
    calcCleaningToggleLabel: "मशीन लर्निंग डेटा शुद्धिकरण लागू करें",
    calcCleaningToggleDesc: "अशुद्ध डेटा के कारण सूचकांक में आने वाले कृत्रिम उछाल को देखने के लिए इसे बंद करें।",
    calcResultsHeading: "तात्कालिक गणना परिणाम",
    calcBaselineIndex: "आधिकारिक आधार APIx",
    calcNewIndex: "नया पुनर्गणित APIx",
    calcDifference: "सूचकांक में अंतर (डेल्टा)",
    calcCpiImpact: "परिवहन मुद्रास्फीति (CPI) पर प्रभाव",
    calcExplanationLabel: "सांख्यिकी अधिकारी हेतु सरल व्याख्या",
    calcFormulaLabel: "सक्रिय भारित सूत्र",

    cleanHeaderTitle: "5-चरणीय स्वचालित डेटा शुद्धिकरण प्रणाली",
    cleanHeaderDesc: "गूगल फ्लाइट्स और स्काईस्कैनर से प्राप्त कच्चे किरायों को सूचकांक गणना से पहले कड़ाई से शुद्ध किया जाता है।",
    cleanBadge: "MoSPI डेटा अखंडता मानक",
    cleanStagesHeading: "शुद्धिकरण के 5 चरण",
    cleanSandboxHeading: "इंटरएक्टिव किराया शुद्धिकरण सैंडबॉक्स",
    cleanSandboxDesc: "कोई भी कच्चा किराया दर्ज करें या त्रुटि प्रीसेट पर क्लिक करके देखें कि पाइपलाइन इसे कैसे पहचानती और सुधारती है।",
    cleanPresetsLabel: "त्रुटि प्रीसेट:",
    cleanPresetNormal: "सामान्य इकोनॉमी (₹6,400)",
    cleanPresetBusiness: "बिजनेस क्लास लीक (₹48,500)",
    cleanPresetNegative: "नकारात्मक मूल्य त्रुटि (-₹150)",
    cleanPresetZero: "₹500 से कम बेस त्रुटि (₹290)",
    cleanPresetSpike: "अचानक उछाल स्पाइक (₹36,000)",
    cleanRouteLabel: "मार्ग गलियारा",
    cleanCarrierLabel: "विमानन कंपनी",
    cleanWindowLabel: "बुकिंग समयावधि",
    cleanFareLabel: "कच्चा स्क्रैप किया किराया (₹)",
    cleanAuditVerdictLabel: "जांच परिणाम एवं कारण",
    cleanQuarantined: "अलग किया गया एवं शुद्ध किया गया",
    cleanAccepted: "सत्यापित एवं स्वीकृत (Inlier)",
    cleanPurifiedFareLabel: "शुद्ध किया गया सूचकांक किराया",
    cleanBaseFareLabel: "मूल किराया (68%)",
    cleanFuelSurchargeLabel: "ईंधन अधिभार (16%)",
    cleanTaxesLabel: "हवाई अड्डा शुल्क एवं कर (16%)",

    stage1Name: "1. दोहराव निष्कासन (Deduplication)",
    stage1Desc: "समान एयरलाइन और समय स्लॉट के दोहराए गए किरायों को हटाता है।",
    stage2Name: "2. संरचनात्मक सीमा जांच",
    stage2Desc: "नकारात्मक मूल्य और ₹500 से कम या ₹1,00,000 से अधिक किरायों को निरस्त करता है।",
    stage3Name: "3. आइसोलेशन फॉरेस्ट ML",
    stage3Desc: "इकोनॉमी में गलती से आए बिजनेस क्लास टिकटों और OCR त्रुटियों को अलग करता है।",
    stage4Name: "4. प्रतिस्पर्धी एयरलाइन औसत प्रतिस्थापन",
    stage4Desc: "गलत किरायों को उसी मार्ग की प्रतिस्पर्धी एयरलाइनों के माध्यिका से बदलता है।",
    stage5Name: "5. DGCA घटक पृथक्करण",
    stage5Desc: "कुल किराए को बेस फेयर, फ्यूल सरचार्ज और एयरपोर्ट टैक्स में विभाजित करता है।",

    scraperTitle: "उच्च-दक्षता वाला प्लेराइट स्क्रैपर (Google Flights & Skyscanner)",
    scraperSubtitle: "अत्यधिक तेज गति के लिए एंटी-बॉट बाईपास और विज्ञापन/छवि अवरोधक के साथ सीधा वेब निष्कर्षण।",
    scraperLogsTitle: "लाइव पाइपलाइन निष्पादन लॉग",
    scraperTriggerBtn: "पूर्ण एंड-टू-एंड पाइपलाइन चलाएं",
    scraperTriggeringBtn: "पाइपलाइन जारी है (स्क्रैप -> शुद्धिकरण -> लोकल LLM -> APIx)...",

    govNoteTitle: "सांख्यिकी अधिकारियों हेतु मार्गदर्शन नोट",
    govNoteContent: "APIx नागरिक उड्डयन महानिदेशालय (DGCA) के वास्तविक यात्री भारित लास्पेरेस सूत्र पर आधारित है। सभी गणनाएं MoSPI CPI मानकों के अनुरूप हैं।",

    dataFreshnessLabel: "लाइव स्वचालित फीड",
    dataFreshnessTime: "अंतिम सिंक",
    nextSyncCountdown: "अगला 20-मिनट चक्र शेष",
    autoDaemonMode: "स्वायत्त MoSPI पृष्ठभूमि डेमॉन सक्रिय",
    autoDaemonToggle: "ऑटो-सिंक (20 मिनट)",
    oneClickFlowBtn: "एक-क्लिक स्वचालित सिंक चलाएं",
    oneClickFlowRunning: "स्वायत्त संपूर्ण प्रवाह जारी है...",
    oneClickFlowModalTitle: "एक-क्लिक संपूर्ण स्वचालित प्रवाह",
    oneClickFlowModalDesc: "बिना किसी मानवीय हस्तक्षेप के सभी 9 तकनीकी चरणों का निष्पादन: लाइव स्क्रैपिंग, बहु-श्रेणी विभाजन, 5-चरणीय ML शुद्धिकरण, लोकल LLM, भारित APIx सूचकांक एवं 30-दिवसीय DGCA सत्यापन।",

    passengerClassTitle: "यात्री श्रेणी एवं आर्थिक स्तरीकरण",
    passengerClassDesc: "विभिन्न श्रेणियों के यात्रियों के लिए हवाई किराए में भारी अंतर होता है। इकोनॉमी के आम नागरिक पर अंतिम समय के उछाल का भारी आर्थिक बोझ (+51%) पड़ता है, जबकि बिजनेस क्लास की मांग अप्रभावित रहती है।",
    classEconomyTitle: "इकोनॉमी क्लास (आम नागरिक / सामान्य जन)",
    classPremiumTitle: "प्रीमियम इकोनॉमी (मध्यम वर्ग)",
    classBusinessTitle: "बिजनेस क्लास (कॉर्पोरेट / उच्च वर्ग)",
    classConcessionalTitle: "रियायती वर्ग (छात्र / वरिष्ठ नागरिक / रक्षा कर्मी)",
    surgeDisparityTitle: "किराया उछाल असमानता प्रभाव मैट्रिक्स",
    surgeDisparityDesc: "त्योहारी सीजन या अंतिम समय में ₹3,000 की सामान्य मूल्य वृद्धि आम नागरिक के टिकट बजट को कैसे प्रभावित करती है बनाम कॉर्पोरेट यात्री।",

    backtest30DayTitle: "30-दिवसीय DGCA आधिकारिक सत्यापन",
    backtest30DayDesc: "विगत 30 दिनों के प्रकाशित आधिकारिक DGCA यात्री प्रतिफल बेंचमार्क के विरुद्ध स्वचालित वेब स्क्रैपिंग का सांख्यिकीय सत्यापन।",
    backtest30DayPill: "30-दिवसीय DGCA सत्यापन विंडो",
    backtest90DayPill: "पूर्ण 90-दिवसीय प्रक्षेपवक्र"
  },

  mr: {
    govIndia: "भारत सरकार",
    ministryName: "सांख्यिकी आणि कार्यक्रम अंमलबजावणी मंत्रालय (MoSPI)",
    diidTitle: "डेटा माहितीशास्त्र आणि नवोपक्रम विभाग (DIID)",
    portalTitle: "APIx — हवाई भाडे किंमत निर्देशांक पोर्टल (उचितफेयर)",
    portalSubtitle: "राष्ट्रीय ग्राहक किंमत निर्देशांकासाठी (CPI) स्वयंचलित नागरी विमान वाहतूक भाडे गुप्तवार्ता प्रणाली",
    problemId: "SIH26056 MoSPI",
    productionBadge: "उत्पादनासाठी सज्ज",
    selectLanguage: "भाषा निवडा",

    runScraperBtn: "थेट पाइपलाइन चालवा",
    runningScraperBtn: "पाइपलाइन प्रक्रिया सुरू आहे...",
    downloadCpiBtn: "MoSPI CPI डेटा डाउनलोड करा (CSV)",
    resetDefaultBtn: "मूळ स्तरावर रीसेट करा",
    simulateBtn: "भाडे तपासा आणि शुद्ध करा",
    simulatingBtn: "तपासणी सुरू आहे...",

    tabOverview: "डॅशबोर्ड सारांश",
    tabCleaning: "डेटा शुद्धीकरण पाइपलाइन",
    tabCalculator: "थेट निर्देशांक प्रभाव कॅल्क्युलेटर",
    tabScraper: "थेट स्क्रॅपर सिम्युलेटर",
    tabReport: "अधिकृत MoSPI बुलेटिन",
    tabAdvisor: "ग्राहक भाडे सल्लागार",

    cardHeadlineIndex: "मुख्य हवाई भाडे निर्देशांक (APIx)",
    cardHeadlineDesc: "वाहतूक-भारित लास्पेरेस आधार वर्ष 2026 = 100",
    cardMonthlyInflation: "महिन्यागणिक महागाई (Inflation)",
    cardMonthlyDesc: "विमान वाहतूक उप-गटातील दर बदल",
    cardCleanedRecords: "प्रमाणित आणि शुद्ध नोंदी",
    cardCleanedDesc: "मशीन लर्निंग (Isolation Forest) द्वारे तपासलेले",
    cardReliability: "MoSPI विश्वसनीयता निर्देशांक",
    cardReliabilityDesc: "उत्कृष्ट बाजार प्रतिनिधित्व निर्देशांक",

    calcTitle: "थेट APIx निर्देशांक प्रभाव कॅल्क्युलेटर (Live Impact Calculator)",
    calcBadge: "संवेदनशीलता विश्लेषण इंजिन",
    calcDesc: "खालील स्लाइडर्स बदलून लगेच तपासा की मेट्रो/प्रादेशिक मार्गांचे प्रमाण बदलल्याने, इंधन दरवाढीमुळे किंवा अशुद्ध डेटामुळे निर्देशांकावर आणि महागाईवर काय परिणाम होतो.",
    calcMetroWeightLabel: "मेट्रो मार्गांचे वजन (%)",
    calcUdanWeightLabel: "प्रादेशिक / उडान मार्गांचे वजन (%)",
    calcFuelShockLabel: "विमान इंधन (ATF) दरवाढ / धक्का (%)",
    calcCleaningToggleLabel: "मशीन लर्निंग डेटा शुद्धीकरण लागू करा",
    calcCleaningToggleDesc: "अशुद्ध डेटामुळे निर्देशांकात होणारी खोटी वाढ पाहण्यासाठी हे बंद करा.",
    calcResultsHeading: "थेट गणना निकाल",
    calcBaselineIndex: "अधिकृत मूळ APIx",
    calcNewIndex: "नवीन पुनर्गणित APIx",
    calcDifference: "निर्देशांकातील बदल (डेल्टा)",
    calcCpiImpact: "वाहतूक CPI महागाईवरील प्रभाव",
    calcExplanationLabel: "सांख्यिकी अधिकाऱ्यांसाठी सोपे स्पष्टीकरण",
    calcFormulaLabel: "सक्रिय भारित सूत्र",

    cleanHeaderTitle: "५-टप्प्यांची स्वयंचलित डेटा शुद्धीकरण प्रणाली",
    cleanHeaderDesc: "Google Flights आणि Skyscanner वरून घेतलेले कच्चे दर निर्देशांक मोजण्यापूर्वी काटेकोरपणे शुद्ध केले जातात.",
    cleanBadge: "MoSPI डेटा अखंडता मानक",
    cleanStagesHeading: "शुद्धीकरणाचे ५ टप्पे",
    cleanSandboxHeading: "परस्परसंवादी भाडे शुद्धीकरण सँडबॉक्स",
    cleanSandboxDesc: "कोणतेही कच्चे भाडे टाकून किंवा त्रुटी प्रीसेटवर क्लिक करून पाहा की प्रणाली ते कसे ओळखते आणि शुद्ध करते.",
    cleanPresetsLabel: "त्रुटी पर्याय (Presets):",
    cleanPresetNormal: "सामान्य इकॉनॉमी (₹6,400)",
    cleanPresetBusiness: "बिझनेस क्लास गळती (₹48,500)",
    cleanPresetNegative: "उणे किंमत त्रुटी (-₹150)",
    cleanPresetZero: "₹500 पेक्षा कमी बेस त्रुटी (₹290)",
    cleanPresetSpike: "अचानक दरवाढ स्पाइक (₹36,000)",
    cleanRouteLabel: "विमान मार्ग",
    cleanCarrierLabel: "विमान कंपनी",
    cleanWindowLabel: "बुकिंग कालावधी",
    cleanFareLabel: "कच्चे भाडे (₹)",
    cleanAuditVerdictLabel: "तपासणी निकाल आणि निदान",
    cleanQuarantined: "विलगीकरण आणि शुद्धीकरण केले (Quarantined)",
    cleanAccepted: "प्रमाणित आणि स्वीकृत (Inlier)",
    cleanPurifiedFareLabel: "शुद्ध केलेले निर्देशांक भाडे",
    cleanBaseFareLabel: "मूळ भाडे (68%)",
    cleanFuelSurchargeLabel: "इंधन अधिभार (16%)",
    cleanTaxesLabel: "विमानतळ शुल्क आणि कर (16%)",

    stage1Name: "१. पुनरावृत्ती निष्कासन (Deduplication)",
    stage1Desc: "एकाच विमान कंपनीचे एकाच वेळेतील दुबार दर काढून टाकते.",
    stage2Name: "२. संरचनात्मक मर्यादा तपासणी",
    stage2Desc: "उणे दर आणि ₹५०० पेक्षा कमी किंवा ₹१,००,००० पेक्षा जास्त भाडे बाद करते.",
    stage3Name: "३. आयसोलेशन फॉरेस्ट ML",
    stage3Desc: "इकॉनॉमीमध्ये चुकून आलेले बिझनेस क्लास तिकीट आणि OCR त्रुटी वेगळ्या करते.",
    stage4Name: "४. प्रतिस्पर्धी सरासरी पुनर्स्थापना",
    stage4Desc: "चुकलेले दर त्याच मार्गावरील प्रतिस्पर्धी कंपन्यांच्या सरासरी दराने बदलते.",
    stage5Name: "५. DGCA घटक विभाजन",
    stage5Desc: "एकूण भाड्याचे मूळ भाडे, इंधन अधिभार आणि विमानतळ शुल्कात विभाजन करते.",

    scraperTitle: "उच्च-कार्यक्षम प्लेराइट स्क्रॅपर (Google Flights & Skyscanner)",
    scraperSubtitle: "अतिजलद वेगासाठी अँटी-बॉट बायपास आणि जाहिरात/चित्र प्रतिबंधकासह थेट वेब संकलन.",
    scraperLogsTitle: "थेट पाइपलाइन प्रक्रिया नोंदी",
    scraperTriggerBtn: "संपूर्ण एंड-टू-एंड पाइपलाइन चालवा",
    scraperTriggeringBtn: "पाइपलाइन सुरू आहे (स्क्रॅप -> शुद्धीकरण -> स्थानिक LLM -> APIx)...",

    govNoteTitle: "सांख्यिकी अधिकाऱ्यांसाठी मार्गदर्शन टीप",
    govNoteContent: "APIx नागरी विमान वाहतूक महासंचालनालयाच्या (DGCA) प्रत्यक्ष प्रवासी भारित लास्पेरेस सूत्रावर आधारित आहे. सर्व गणना MoSPI CPI मानकांनुसार आहेत.",

    dataFreshnessLabel: "थेट स्वयंचलित फीड",
    dataFreshnessTime: "शेवटचे सिंक",
    nextSyncCountdown: "पुढील २०-मिनिटे चक्र शिल्लक",
    autoDaemonMode: "स्वायत्त MoSPI पार्श्वभूमी डीमन सक्रिय",
    autoDaemonToggle: "ऑटो-सिंक (२० मिनिटे)",
    oneClickFlowBtn: "एक-क्लिक स्वयंचलित सिंक चालवा",
    oneClickFlowRunning: "स्वायत्त संपूर्ण प्रवाह सुरू आहे...",
    oneClickFlowModalTitle: "एक-क्लिक संपूर्ण स्वयंचलित प्रवाह",
    oneClickFlowModalDesc: "मानवी हस्तक्षेपाशिवाय सर्व ९ तांत्रिक टप्प्यांची अंमलबजावणी: थेट स्क्रॅपिंग, बहु-श्रेणी विभाजन, ५-टप्प्यांचे ML शुद्धीकरण, स्थानिक LLM, भारित APIx निर्देशांक आणि ३०-दिवसीय DGCA पडताळणी.",

    passengerClassTitle: "प्रवासी वर्ग आणि आर्थिक स्तरीकरण",
    passengerClassDesc: "विमान प्रवाशांच्या वेगवेगळ्या वर्गांनुसार तिकीट दरांमध्ये प्रचंड फरक असतो. इकॉनॉमी वर्गातील सामान्य नागरिकावर शेवटच्या क्षणातील दरवाढीचा प्रचंड आर्थिक भार (+५१%) पडतो, तर बिझनेस क्लासची मागणी स्थिर राहते.",
    classEconomyTitle: "इकॉनॉमी वर्ग (सर्वसामान्य नागरिक)",
    classPremiumTitle: "प्रीमियम इकॉनॉमी (मध्यम वर्ग)",
    classBusinessTitle: "बिझनेस क्लास (कॉर्पोरेट / उच्च वर्ग)",
    classConcessionalTitle: "सवलतीचा वर्ग (विद्यार्थी / ज्येष्ठ नागरिक / सैनिक)",
    surgeDisparityTitle: "भाडेवाढ असमानता प्रभाव मॅट्रिक्स",
    surgeDisparityDesc: "सणासुदीच्या काळात किंवा शेवटच्या क्षणी होणारी ₹३,००० ची दरवाढ सामान्य नागरिकाच्या बजेटवर कसा परिणाम करते विरुद्ध कॉर्पोरेट प्रवासी.",

    backtest30DayTitle: "३०-दिवसीय DGCA अधिकृत पडताळणी",
    backtest30DayDesc: "गेल्या ३० दिवसांच्या प्रकाशित अधिकृत DGCA प्रवासी उत्पन्नाच्या मानकांनुसार स्वयंचलित वेब स्क्रॅपिंगची सांख्यिकीय पडताळणी.",
    backtest30DayPill: "३०-दिवसीय DGCA पडताळणी विंडो",
    backtest90DayPill: "पूर्ण ९०-दिवसीय प्रक्षेपवक्र"
  }
};
