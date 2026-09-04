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
