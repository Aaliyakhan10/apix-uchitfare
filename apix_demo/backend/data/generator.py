"""
Realistic Data Generator for APIx Demo.
Generates multi-carrier, multi-window fare observations across 90 days.
Features authentic ATF fuel price shocks, festival surges, synthetic noise,
and controlled outliers for the Isolation Forest to detect.
"""
import random
import datetime
import numpy as np
import pandas as pd
from apix_demo.backend.data.routes import ROUTES, BOOKING_WINDOWS

def generate_90day_dataset(start_date_str="2026-06-01", days=90, seed=42):
    random.seed(seed)
    np.random.seed(seed)
    
    start_date = datetime.date.fromisoformat(start_date_str)
    dates = [start_date + datetime.timedelta(days=i) for i in range(days)]
    
    # 1. ATF Fuel Index series (baseline 100 with realistic economic trend)
    atf_trend = [100.0]
    for _ in range(1, days):
        change = np.random.normal(0.08, 0.55)
        atf_trend.append(round(max(88.0, min(122.0, atf_trend[-1] + change)), 2))
        
    # 2. Festivals / High Demand calendar (surge factors)
    # Eid (June 17), Independence Day weekend (Aug 14-17), Raksha Bandhan (Aug 28), Janmashtami (Aug 31)
    festival_dates = {
        "2026-06-16": 0.35, "2026-06-17": 0.48, "2026-06-18": 0.30,
        "2026-08-14": 0.52, "2026-08-15": 0.68, "2026-08-16": 0.58, "2026-08-17": 0.42,
        "2026-08-27": 0.38, "2026-08-28": 0.48, "2026-08-29": 0.32
    }
    
    # Booking window price elasticity multipliers
    window_multipliers = {
        "T+1": 1.95,  # Last-minute surge
        "T+7": 1.28,
        "T+15": 1.00, # Base reference
        "T+30": 0.84, # Advance purchase discount
        "T+45": 0.74  # Super early bird
    }
    
    records = []
    outlier_count = 0
    
    for day_idx, current_date in enumerate(dates):
        date_str = current_date.isoformat()
        is_weekend = current_date.weekday() >= 5
        fuel_index = atf_trend[day_idx]
        fuel_rel = (fuel_index - 100.0) / 100.0
        
        festival_surge = festival_dates.get(date_str, 0.0)
        demand_factor = 1.0 + (0.12 if is_weekend else 0.0) + festival_surge
        
        for route in ROUTES:
            route_id = route["id"]
            base_ref = route["base_period_fare"]
            dist = route["distance_km"]
            carriers = route["typical_carriers"]
            num_carriers = len(carriers)
            
            # Monopoly premium for routes with few carriers (e.g. BOM-IXU, DEL-SHL)
            comp_factor = 0.94 if num_carriers >= 4 else (1.0 if num_carriers >= 2 else 1.28)
            
            for window in BOOKING_WINDOWS:
                w_mult = window_multipliers[window]
                
                for carrier in carriers:
                    # 4.5% simulated scrape drop rate (network/anti-bot error)
                    if random.random() < 0.045:
                        continue
                        
                    carrier_tier = 1.05 if carrier == "Air India" else (0.97 if carrier in ["Akasa Air", "SpiceJet"] else 1.0)
                    
                    expected_fare = base_ref * w_mult * demand_factor * comp_factor * carrier_tier * (1.0 + 0.32 * fuel_rel)
                    actual_fare = expected_fare * np.random.normal(1.0, 0.035)
                    
                    # Component segregation
                    base_fare = round(actual_fare * 0.68)
                    fuel_surcharge = round(actual_fare * 0.16)
                    taxes_udf = round(actual_fare * 0.16)
                    total_fare = base_fare + fuel_surcharge + taxes_udf
                    
                    # Inject controlled outliers for Isolation Forest to detect (0.8%)
                    is_injected_outlier = False
                    if random.random() < 0.008:
                        is_injected_outlier = True
                        outlier_count += 1
                        if random.random() < 0.5:
                            # Erroneous low fare glitch
                            total_fare = round(random.uniform(250, 480))
                            base_fare = round(total_fare * 0.5)
                        else:
                            # Extreme spike / misclassified seat
                            total_fare = round(total_fare * random.uniform(3.5, 6.0))
                            base_fare = round(total_fare * 0.75)
                            
                    records.append({
                        "date": date_str,
                        "route_id": route_id,
                        "origin": route["origin"],
                        "destination": route["destination"],
                        "category": route["category"],
                        "distance_km": dist,
                        "booking_window": window,
                        "carrier": carrier,
                        "base_fare": base_fare,
                        "fuel_surcharge": fuel_surcharge,
                        "taxes_udf": taxes_udf,
                        "total_fare": total_fare,
                        "fuel_index": fuel_index,
                        "is_weekend": int(is_weekend),
                        "demand_surge_flag": 1 if (festival_surge > 0 or is_weekend) else 0,
                        "festival_name": "Festival Surge" if festival_surge > 0 else ("Weekend Surge" if is_weekend else "Normal"),
                        "competition_count": num_carriers,
                        "is_synthetic_outlier": is_injected_outlier
                    })
                    
    df = pd.DataFrame(records)
    return df, atf_trend

def simulate_daily_scrape(date_str, base_fuel=105.2, is_weekend=False, festival_surge=0.0):
    """Simulates a live scrape run for a single target date."""
    records = []
    window_multipliers = {"T+1": 1.95, "T+7": 1.28, "T+15": 1.00, "T+30": 0.84, "T+45": 0.74}
    fuel_rel = (base_fuel - 100.0) / 100.0
    demand_factor = 1.0 + (0.12 if is_weekend else 0.0) + festival_surge
    
    for route in ROUTES:
        route_id = route["id"]
        base_ref = route["base_period_fare"]
        dist = route["distance_km"]
        carriers = route["typical_carriers"]
        num_carriers = len(carriers)
        comp_factor = 0.94 if num_carriers >= 4 else (1.0 if num_carriers >= 2 else 1.28)
        
        for window in BOOKING_WINDOWS:
            w_mult = window_multipliers[window]
            for carrier in carriers:
                if random.random() < 0.035:
                    continue
                carrier_tier = 1.05 if carrier == "Air India" else 1.0
                expected = base_ref * w_mult * demand_factor * comp_factor * carrier_tier * (1.0 + 0.32 * fuel_rel)
                actual = expected * np.random.normal(1.0, 0.03)
                base = round(actual * 0.68)
                fuel = round(actual * 0.16)
                udf = round(actual * 0.16)
                total = base + fuel + udf
                
                is_outlier = False
                if random.random() < 0.009:
                    is_outlier = True
                    total = round(total * 4.5)
                    base = round(total * 0.75)
                    
                records.append({
                    "date": date_str,
                    "route_id": route_id,
                    "origin": route["origin"],
                    "destination": route["destination"],
                    "category": route["category"],
                    "distance_km": dist,
                    "booking_window": window,
                    "carrier": carrier,
                    "base_fare": base,
                    "fuel_surcharge": fuel,
                    "taxes_udf": udf,
                    "total_fare": total,
                    "fuel_index": base_fuel,
                    "is_weekend": int(is_weekend),
                    "demand_surge_flag": 1 if (festival_surge > 0 or is_weekend) else 0,
                    "festival_name": "Surge" if festival_surge > 0 else ("Weekend" if is_weekend else "Normal"),
                    "competition_count": num_carriers,
                    "is_synthetic_outlier": is_outlier
                })
    return pd.DataFrame(records)
