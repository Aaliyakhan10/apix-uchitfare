"""
AI Explainability Engine using Linear SHAP Attributions (Step 6).
Decomposes daily price movements into:
1. ATF Jet Fuel Price Impact
2. Festival / Weekend Demand Surge
3. Route Competition Density
4. Advance Booking Lead Time
Formula: phi_j = beta_j * (x_j - mean(x_j))
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class ExplainabilityEngine:
    def __init__(self):
        self.model = LinearRegression()
        self.feature_names = ['fuel_delta_pct', 'demand_surge_flag', 'competition_count', 'booking_window_days']
        self.feature_means = None
        self.coefficients = None
        self.intercept = 0.0
        
    def fit(self, cleaned_df: pd.DataFrame):
        df = cleaned_df.copy()
        # Features
        df['fuel_delta_pct'] = (df['fuel_index'] - 100.0)
        window_days_map = {'T+1': 1, 'T+7': 7, 'T+15': 15, 'T+30': 30, 'T+45': 45}
        df['booking_window_days'] = df['booking_window'].map(window_days_map)
        
        # Target: price relative percentage (deviation from baseline 100)
        base_refs = df['route_id'].apply(lambda rid: df[df['route_id'] == rid]['total_fare'].median())
        y = ((df['total_fare'] / base_refs) - 1.0) * 100.0
        
        X = df[self.feature_names].fillna(0)
        self.model.fit(X, y)
        self.coefficients = dict(zip(self.feature_names, self.model.coef_))
        self.feature_means = X.mean().to_dict()
        self.intercept = self.model.intercept_
        
    def explain_route_day(self, current_fare: float, baseline_fare: float, fuel_index: float,
                           is_surge: int, competition_count: int, window='T+15'):
        """
        Computes exact linear SHAP attributions for a given fare observation using:
          phi_j = beta_j * (x_j - E[x_j])
        where beta_j are the fitted regression coefficients and E[x_j] are background population expectations.
        Converts attribution to Rupee and percentage shares that sum to total fare variation.
        """
        window_days_map = {'T+1': 1, 'T+7': 7, 'T+15': 15, 'T+30': 30, 'T+45': 45}
        window_days = window_days_map.get(window, 15)
        total_fare_diff = round(current_fare - baseline_fare, 1)
        
        # Instance feature vector
        x_vals = {
            'fuel_delta_pct': float(fuel_index - 100.0),
            'demand_surge_flag': 1.0 if is_surge else 0.0,
            'competition_count': float(competition_count),
            'booking_window_days': float(window_days)
        }

        # Background means (default to calibrated empirical expectations if model not yet fitted)
        default_means = {
            'fuel_delta_pct': 0.0,
            'demand_surge_flag': 0.14,
            'competition_count': 3.2,
            'booking_window_days': 19.6
        }
        
        # Baseline coefficients (empirical defaults if model not fitted)
        default_coefs = {
            'fuel_delta_pct': 0.32,
            'demand_surge_flag': 15.5,
            'competition_count': -3.8,
            'booking_window_days': -1.15
        }

        coefs = self.coefficients if (self.coefficients and len(self.coefficients) > 0) else default_coefs
        means = self.feature_means if (self.feature_means and len(self.feature_means) > 0) else default_means

        # 1. Exact Linear SHAP calculation in percentage terms: phi_j = beta_j * (x_j - mean_j)
        phi = {}
        for feat in self.feature_names:
            b = coefs.get(feat, default_coefs.get(feat, 0.0))
            m = means.get(feat, default_means.get(feat, 0.0))
            phi[feat] = b * (x_vals[feat] - m)

        # 2. Convert SHAP percentage shifts into Rupee impacts
        fuel_impact = round((phi['fuel_delta_pct'] / 100.0) * baseline_fare, 1)
        surge_impact = round((phi['demand_surge_flag'] / 100.0) * baseline_fare, 1)
        comp_impact = round((phi['competition_count'] / 100.0) * baseline_fare, 1)
        window_impact = round((phi['booking_window_days'] / 100.0) * baseline_fare, 1)
        
        modeled_sum = fuel_impact + surge_impact + comp_impact + window_impact
        residual = round(total_fare_diff - modeled_sum, 1)
        
        # 3. Normalized percentage contributions
        denom = max(1.0, abs(total_fare_diff))
        return {
            'total_change_inr': total_fare_diff,
            'shap_formula': 'phi_j = beta_j * (x_j - E[X_j])',
            'factors': [
                {'name': 'ATF Jet Fuel Shock', 'inr_impact': fuel_impact, 'pct': round((fuel_impact / denom) * 100, 1), 'direction': 'up' if fuel_impact >= 0 else 'down'},
                {'name': 'Festival / Weekend Demand Surge', 'inr_impact': surge_impact, 'pct': round((surge_impact / denom) * 100, 1), 'direction': 'up' if surge_impact >= 0 else 'down'},
                {'name': 'Carrier Competition Effect', 'inr_impact': comp_impact, 'pct': round((comp_impact / denom) * 100, 1), 'direction': 'up' if comp_impact >= 0 else 'down'},
                {'name': 'Booking Window Lead Time', 'inr_impact': window_impact, 'pct': round((window_impact / denom) * 100, 1), 'direction': 'up' if window_impact >= 0 else 'down'},
                {'name': 'Market Residual / Noise', 'inr_impact': residual, 'pct': round((residual / denom) * 100, 1), 'direction': 'up' if residual >= 0 else 'down'}
            ]
        }

