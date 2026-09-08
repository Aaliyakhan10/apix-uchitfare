import json
from pathlib import Path

ROUTES_FILE = Path(__file__).parent / 'routes.json'
with open(ROUTES_FILE, 'r', encoding='utf-8') as f:
    ROUTES = json.load(f)

ROUTES_BY_ID = {r['id']: r for r in ROUTES}
BOOKING_WINDOWS = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45']
WINDOW_WEIGHTS = {'T+1': 0.15, 'T+7': 0.30, 'T+15': 0.25, 'T+30': 0.20, 'T+45': 0.10}
CARRIERS = ['IndiGo', 'Air India', 'Akasa Air', 'SpiceJet', 'AI Express', 'Alliance Air', 'Star Air']
OTAS = ['MakeMyTrip', 'EaseMyTrip', 'Yatra']

PASSENGER_CLASSES = {
    "economy": {
        "id": "economy",
        "name": "Economy Class",
        "name_hi": "इकोनॉमी क्लास (आम नागरिक)",
        "name_mr": "इकॉनॉमी वर्ग (सामान्य नागरिक)",
        "traffic_weight": 0.82,
        "fare_multiplier": 1.00,
        "base_ref_fare": 5850,
        "typical_range": "₹4,200 - ₹7,400",
        "surge_elasticity": "HIGH",
        "description": "Common citizens and budget travelers. High sensitivity to dynamic pricing and late booking penalties.",
        "description_hi": "आम नागरिक और बजट यात्री। मूल्य वृद्धि और अंतिम समय की बुकिंग पर अत्यधिक संवेदनशील।",
        "description_mr": "सामान्य नागरिक आणि बजेट प्रवासी. तिकीट वाढीवर अत्यंत संवेदनशील."
    },
    "premium_economy": {
        "id": "premium_economy",
        "name": "Premium Economy",
        "name_hi": "प्रीमियम इकोनॉमी (मध्यम वर्ग)",
        "name_mr": "प्रीमियम इकॉनॉमी (मध्यम वर्ग)",
        "traffic_weight": 0.11,
        "fare_multiplier": 1.45,
        "base_ref_fare": 8480,
        "typical_range": "₹7,200 - ₹11,500",
        "surge_elasticity": "MODERATE",
        "description": "Middle class and frequent business flyers requiring extra legroom and flexible changes.",
        "description_hi": "मध्यम वर्ग और नियमित यात्री। अतिरिक्त लेगरूम और टिकट बदलाव की सुविधा।",
        "description_mr": "मध्यम वर्ग आणि नियमित व्यावसायिक प्रवासी. अतिरिक्त सुविधा व लवचिकता."
    },
    "business": {
        "id": "business",
        "name": "Business Class",
        "name_hi": "बिजनेस क्लास (कॉर्पोरेट/उच्च वर्ग)",
        "name_mr": "बिझनेस क्लास (कॉर्पोरेट/उच्च वर्ग)",
        "traffic_weight": 0.07,
        "fare_multiplier": 3.85,
        "base_ref_fare": 22500,
        "typical_range": "₹18,000 - ₹42,000",
        "surge_elasticity": "LOW (Inelastic)",
        "description": "Corporate executives and high-net-worth travelers. Inelastic demand absorbed by corporate budgets.",
        "description_hi": "कॉर्पोरेट अधिकारी और उच्च वर्ग। अप्रभावित मांग जो कंपनी बजट द्वारा वहन की जाती है।",
        "description_mr": "कॉर्पोरेट अधिकारी आणि उच्च वर्ग. अप्रभावित मागणी जी कंपनी बजेटद्वारे भरली जाते."
    },
    "concessional": {
        "id": "concessional",
        "name": "Concessional (Student / Senior / Defence)",
        "name_hi": "रियायती (छात्र / वरिष्ठ नागरिक / रक्षा कर्मी)",
        "name_mr": "सवलत (विद्यार्थी / ज्येष्ठ नागरिक / संरक्षण दल)",
        "traffic_weight": 0.08,
        "fare_multiplier": 0.72,
        "base_ref_fare": 4210,
        "typical_range": "₹3,100 - ₹5,200",
        "surge_elasticity": "PROTECTED",
        "description": "DGCA mandated welfare concessions (6% to 50% on basic fare) for Students, Senior Citizens, and Armed Forces.",
        "description_hi": "डीजीसीए द्वारा अनिवार्य रियायतें (मूल किराए पर 6% से 50% तक) छात्रों, वरिष्ठ नागरिकों और सैनिकों हेतु।",
        "description_mr": "डीजीसीए द्वारे अनिवार्य कल्याणकारी सवलती (मूळ दरावर 6% ते 50%) विद्यार्थी, ज्येष्ठ आणि सैनिकांसाठी."
    }
}

