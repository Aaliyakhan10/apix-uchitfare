"""
Reliability & Confidence Scoring Module (Step 4).
Confidence Score = (actual_successful_scrapes / expected_scrape_points) * 100
Evaluates data completeness per day, per carrier, and per route.
"""
import pandas as pd
from apix_demo.backend.data.routes import ROUTES, BOOKING_WINDOWS

def calculate_daily_reliability(raw_df: pd.DataFrame):
    """
    Computes daily confidence scores and carrier uptime.
    Expected points = sum of (len(typical_carriers) * len(BOOKING_WINDOWS)) across all 25 routes.
    """
    # Calculate daily expected points
    expected_per_day = sum(len(r['typical_carriers']) * len(BOOKING_WINDOWS) for r in ROUTES)
    
    daily_stats = []
    grouped = raw_df.groupby('date')
    
    for date_str, group in grouped:
        actual_points = len(group)
        confidence_score = round(min(100.0, (actual_points / expected_per_day) * 100), 2)
        
        # Breakdown by route category
        metro_actual = len(group[group['category'] == 'Metro'])
        metro_expected = sum(len(r['typical_carriers']) * len(BOOKING_WINDOWS) for r in ROUTES if r['category'] == 'Metro')
        metro_conf = round(min(100.0, (metro_actual / metro_expected) * 100), 1)
        
        regional_actual = len(group[group['category'] == 'Regional/UDAN'])
        regional_expected = sum(len(r['typical_carriers']) * len(BOOKING_WINDOWS) for r in ROUTES if r['category'] == 'Regional/UDAN')
        regional_conf = round(min(100.0, (regional_actual / regional_expected) * 100), 1)
        
        daily_stats.append({
            'date': date_str,
            'confidence_score': confidence_score,
            'actual_points': actual_points,
            'expected_points': expected_per_day,
            'metro_confidence': metro_conf,
            'regional_confidence': regional_conf,
            'status': 'Optimal' if confidence_score >= 90 else ('Acceptable' if confidence_score >= 80 else 'Degraded')
        })
        
    res_df = pd.DataFrame(daily_stats)
    
    # Carrier completeness
    carrier_counts = raw_df.groupby('carrier').size().to_dict()
    
    return res_df, carrier_counts
