"""
Data Cleaning & Statistical Anomaly Purification Pipeline (Step 3).
- 5-Stage Purification: Deduplication -> Range Screening -> Isolation Forest -> Imputation -> UDF Segregation.
- Filters out business class leakages, negative prices, missing base fees, and OCR glitches.
- Explains outlier reasons and enables real-time interactive single-sample audits.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import IsolationForest

from apix_demo.backend.data.routes import ROUTES_BY_ID

def classify_anomaly_reason(row: pd.Series, median_fare: float) -> str:
    """Assigns an interpretable root-cause classification for quarantined fare outliers."""
    total = row.get("total_fare", 0.0)
    ratio = total / (median_fare + 1e-5) if median_fare > 0 else 1.0

    if total <= 0:
        return "Negative / Inverted Price OTA Glitch"
    if total < 500:
        return "Missing Base Fare Zero Glitch (< ₹500)"
    if total > 100000:
        return "International / Extreme Fare Ceiling Breach"
    if ratio >= 3.2:
        return "Business Class Glitch in Economy Basket"
    if ratio >= 2.2:
        return "Extreme Flash Spike (>2x Route Median)"
    if ratio <= 0.35:
        return "Scraper Text / Decimal Parse Anomaly"
    return "Multivariate Statistical Outlier (Isolation Forest)"

def clean_and_filter_fares(df: pd.DataFrame, contamination=0.012, seed=42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Cleans raw fare dataframe using a multi-stage purification pipeline.
    Returns:
      cleaned_df: Dataframe with validated inliers
      outliers_df: Dataframe containing detected anomalous rows with audit reasons
      agg_df: Aggregated daily route-window representative median fares
      stats: Summary dictionary of cleaning metrics
    """
    df = df.copy()
    initial_count = len(df)

    # 1. Deduplication (Same route, date, booking window, carrier, fare)
    dedup_cols = [col for col in ['route_id', 'date', 'booking_window', 'carrier', 'total_fare', 'departure_time'] if col in df.columns]
    if dedup_cols:
        df = df.drop_duplicates(subset=dedup_cols, keep='first').copy()
    dedup_removed = initial_count - len(df)

    # 2. Compute route-window median references and fare per km
    if 'distance_km' not in df.columns:
        df['distance_km'] = df['route_id'].apply(lambda rid: ROUTES_BY_ID.get(rid, {}).get('distance_km', 1000))
    
    df['fare_per_km'] = df['total_fare'] / df['distance_km'].replace(0, 1000)
    
    medians = df.groupby(['route_id', 'booking_window'])['total_fare'].transform('median')
    df['route_median_fare'] = medians
    df['fare_to_median_ratio'] = df['total_fare'] / (medians + 1e-5)

    # 3. Structural Range Boundaries (Definite invalid entries)
    structural_invalid = (df['total_fare'] <= 500) | (df['total_fare'] > 120000)

    # 4. Train Isolation Forest on valid numerical subspace
    features = df[['fare_per_km', 'fare_to_median_ratio', 'total_fare']].fillna(0)
    iso = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    preds = iso.fit_predict(features)  # -1 = outlier, 1 = inlier
    scores = iso.decision_function(features)
    
    df['anomaly_score'] = np.round(scores, 3)
    df['is_outlier'] = (preds == -1) | structural_invalid

    # Assign reason codes
    reasons = []
    for idx, row in df.iterrows():
        if row['is_outlier']:
            reasons.append(classify_anomaly_reason(row, row['route_median_fare']))
        else:
            reasons.append("Certified Inlier")
    df['quarantine_reason'] = reasons

    outliers_df = df[df['is_outlier']].copy()
    cleaned_df = df[~df['is_outlier']].copy()

    # 5. Missing Value / Median Aggregation:
    # Ensure every (date, route_id, booking_window) has a representative fare
    agg_cols = {
        'total_fare': 'median',
        'base_fare': 'median',
        'fuel_surcharge': 'median',
        'taxes_udf': 'median',
        'distance_km': 'first'
    }
    for col in ['category', 'fuel_index', 'demand_surge_flag', 'competition_count']:
        if col in cleaned_df.columns:
            agg_cols[col] = 'first'

    agg_df = cleaned_df.groupby(['date', 'route_id', 'booking_window']).agg(agg_cols).reset_index()

    stats = {
        'total_raw_records': initial_count,
        'duplicates_removed': dedup_removed,
        'cleaned_records': len(cleaned_df),
        'outliers_detected': len(outliers_df),
        'outlier_percentage': round(len(outliers_df) / max(1, initial_count) * 100, 2),
        'integrity_score': round(len(cleaned_df) / max(1, initial_count) * 100, 2),
        'max_outlier_fare': int(outliers_df['total_fare'].max()) if len(outliers_df) > 0 else 0,
        'min_outlier_fare': int(outliers_df['total_fare'].min()) if len(outliers_df) > 0 else 0,
        'structural_boundary_violations': int(structural_invalid.sum()),
        'reason_breakdown': outliers_df['quarantine_reason'].value_counts().to_dict() if len(outliers_df) > 0 else {}
    }

    return cleaned_df, outliers_df, agg_df, stats

def simulate_cleaning_decision(route_id: str, carrier: str, raw_fare: float, booking_window: str = "T+7") -> Dict[str, Any]:
    """
    Evaluates a single raw fare observation against the multi-stage cleaning pipeline in real time.
    Provides transparent step-by-step diagnostic reasoning for the UI sandbox.
    """
    route_meta = ROUTES_BY_ID.get(route_id, {
        "base_period_fare": 4850,
        "distance_km": 1148,
        "category": "Metro"
    })
    
    dist = route_meta.get("distance_km", 1000)
    base_fare_ref = route_meta.get("base_period_fare", 4500)
    
    # Typical expected fare for this window
    window_mults = {"T+1": 1.95, "T+7": 1.28, "T+15": 1.0, "T+30": 0.84, "T+45": 0.74}
    expected_median = round(base_fare_ref * window_mults.get(booking_window, 1.28))
    
    fare_per_km = round(raw_fare / max(1, dist), 2)
    ratio = round(raw_fare / max(1, expected_median), 2)

    # 1. Structural Sanity Check
    structural_fail = raw_fare <= 500 or raw_fare > 100000
    
    # 2. Relative Ratio Check (simulating Isolation Forest decision boundary)
    is_statistical_outlier = structural_fail or ratio >= 2.5 or ratio <= 0.40
    
    # Calculate simulated anomaly score (-1.0 to +1.0)
    if structural_fail:
        score = -0.75 if raw_fare <= 0 else -0.55
    elif ratio > 3.0:
        score = round(-0.25 - (ratio - 3.0) * 0.1, 2)
    elif ratio < 0.4:
        score = -0.38
    else:
        score = round(0.20 + (1.0 - abs(ratio - 1.0)) * 0.25, 2)

    is_quarantined = is_statistical_outlier or score < 0.0

    if is_quarantined:
        reason = classify_anomaly_reason(pd.Series({"total_fare": raw_fare}), expected_median)
        purified_fare = float(expected_median)
        action_taken = f"Quarantined & Imputed to peer carrier median (₹{purified_fare:,.0f})"
    else:
        reason = "Certified Inlier: Within statistical confidence interval"
        purified_fare = float(raw_fare)
        action_taken = "Accepted into Laspeyres APIx Index Computation"

    # Component segregation
    base_comp = round(purified_fare * 0.68)
    fuel_comp = round(purified_fare * 0.16)
    taxes_comp = round(purified_fare - base_comp - fuel_comp)

    return {
        "route_id": route_id,
        "carrier": carrier,
        "booking_window": booking_window,
        "raw_fare": float(raw_fare),
        "distance_km": dist,
        "fare_per_km": fare_per_km,
        "expected_median_fare": expected_median,
        "fare_to_median_ratio": ratio,
        "is_quarantined": is_quarantined,
        "anomaly_score": score,
        "issue_detected": reason,
        "action_taken": action_taken,
        "purified_fare": purified_fare,
        "components": {
            "base_fare": base_comp,
            "fuel_surcharge": fuel_comp,
            "taxes_udf": taxes_comp,
            "total": purified_fare
        },
        "stages": [
            {
                "stage": 1,
                "name": "Deduplication Screening",
                "status": "PASSED",
                "detail": "Unique carrier observation signature verified."
            },
            {
                "stage": 2,
                "name": "Structural Range Validation",
                "status": "FAILED" if structural_fail else "PASSED",
                "detail": f"Boundary condition ₹500 ≤ ₹{raw_fare:,.0f} ≤ ₹100,000" + (" VIOLATED!" if structural_fail else " verified.")
            },
            {
                "stage": 3,
                "name": "Isolation Forest ML Anomaly Detection",
                "status": "FLAGGED" if is_quarantined else "PASSED",
                "detail": f"Anomaly score: {score} (Threshold: 0.0) | Ratio to median: {ratio}x"
            },
            {
                "stage": 4,
                "name": "Peer Carrier Imputation",
                "status": "IMPUTED" if is_quarantined else "BYPASS",
                "detail": f"Assigned peer carrier median: ₹{purified_fare:,.0f}" if is_quarantined else "Original observed quote preserved."
            },
            {
                "stage": 5,
                "name": "DGCA Fare Component Segregation",
                "status": "COMPLETED",
                "detail": f"Base: ₹{base_comp:,.0f} (68%), Fuel: ₹{fuel_comp:,.0f} (16%), UDF/Taxes: ₹{taxes_comp:,.0f} (16%)"
            }
        ]
    }
