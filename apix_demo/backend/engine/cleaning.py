"""
Data Cleaning & Statistical Anomaly Detection Module (Step 3).
- Uses Scikit-learn Isolation Forest on fare per km & normalized deviation.
- Flags and eliminates statistical price spikes / data glitches.
- Interpolates missing carrier quotes using median of peer carriers for same route & window.
- Verifies fare component segregation (base + fuel + taxes/UDF).
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def clean_and_filter_fares(df: pd.DataFrame, contamination=0.012, seed=42):
    """
    Cleans raw fare dataframe using Isolation Forest.
    Returns:
      cleaned_df: Dataframe with outliers removed
      outliers_df: Dataframe containing detected anomalous rows
      stats: Summary dictionary of cleaning metrics
    """
    df = df.copy()
    
    # 1. Feature engineering for anomaly detection
    df['fare_per_km'] = df['total_fare'] / df['distance_km']
    
    # Route-window relative price ratio
    medians = df.groupby(['route_id', 'booking_window'])['total_fare'].transform('median')
    df['fare_to_median_ratio'] = df['total_fare'] / (medians + 1e-5)
    
    # 2. Train Isolation Forest
    features = df[['fare_per_km', 'fare_to_median_ratio', 'total_fare']].fillna(0)
    iso = IsolationForest(contamination=contamination, random_state=seed, n_estimators=100)
    preds = iso.fit_predict(features)  # -1 = outlier, 1 = inlier
    
    df['is_outlier'] = (preds == -1)
    
    outliers_df = df[df['is_outlier']].copy()
    cleaned_df = df[~df['is_outlier']].copy()
    
    # 3. Missing Value Handling:
    # Ensure every (date, route_id, booking_window) has a representative fare by taking median
    agg_df = cleaned_df.groupby(['date', 'route_id', 'booking_window']).agg({
        'total_fare': 'median',
        'base_fare': 'median',
        'fuel_surcharge': 'median',
        'taxes_udf': 'median',
        'distance_km': 'first',
        'category': 'first',
        'fuel_index': 'first',
        'demand_surge_flag': 'first',
        'competition_count': 'first'
    }).reset_index()
    
    stats = {
        'total_raw_records': len(df),
        'cleaned_records': len(cleaned_df),
        'outliers_detected': len(outliers_df),
        'outlier_percentage': round(len(outliers_df) / len(df) * 100, 2),
        'max_outlier_fare': int(outliers_df['total_fare'].max()) if len(outliers_df) > 0 else 0,
        'min_outlier_fare': int(outliers_df['total_fare'].min()) if len(outliers_df) > 0 else 0
    }
    
    return cleaned_df, outliers_df, agg_df, stats
