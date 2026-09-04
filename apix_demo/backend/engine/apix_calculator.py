"""
Weighted Airfare Price Index (APIx) Calculation Engine (Step 5).
Formulation:
  P_{r,t} = sum_{w} (P_{r,t,w} * W_w)  [Composite route price across booking windows]
  Price_Relative_{r,t} = P_{r,t} / P_{r,0}
  APIx_t = sum_{r} (Price_Relative_{r,t} * Route_Traffic_Weight_r) * 100
"""
import pandas as pd
from apix_demo.backend.data.routes import ROUTES_BY_ID, WINDOW_WEIGHTS

def compute_apix_indices(agg_df: pd.DataFrame):
    """
    Computes daily APIx indices: Overall, Category-wise (Metro vs UDAN), and Window-wise.
    agg_df columns: [date, route_id, booking_window, total_fare, category, ...]
    """
    # 1. Map window weights
    agg_df['window_weight'] = agg_df['booking_window'].map(WINDOW_WEIGHTS)
    agg_df['weighted_fare'] = agg_df['total_fare'] * agg_df['window_weight']
    
    # 2. Route composite daily price
    route_daily = agg_df.groupby(['date', 'route_id']).agg({
        'weighted_fare': 'sum',
        'category': 'first',
        'fuel_index': 'first',
        'demand_surge_flag': 'first',
        'competition_count': 'first',
        'distance_km': 'first'
    }).reset_index()
    
    route_daily.rename(columns={'weighted_fare': 'composite_fare'}, inplace=True)
    
    # 3. Add Route Base Fare & Traffic Weight
    route_daily['base_fare_ref'] = route_daily['route_id'].apply(lambda rid: ROUTES_BY_ID[rid]['base_period_fare'])
    route_daily['traffic_weight'] = route_daily['route_id'].apply(lambda rid: ROUTES_BY_ID[rid]['traffic_weight'])
    
    # Price Relative
    route_daily['price_relative'] = route_daily['composite_fare'] / route_daily['base_fare_ref']
    route_daily['weighted_price_relative'] = route_daily['price_relative'] * route_daily['traffic_weight']
    
    # 4. Compute Overall Daily APIx
    daily_index = route_daily.groupby('date').agg({
        'weighted_price_relative': 'sum',
        'fuel_index': 'first',
        'demand_surge_flag': 'first'
    }).reset_index()
    
    daily_index['apix'] = round(daily_index['weighted_price_relative'] * 100, 2)
    
    # 5. Metro vs Regional sub-indices
    metro_weights_sum = sum(r['traffic_weight'] for r in ROUTES_BY_ID.values() if r['category'] == 'Metro')
    udan_weights_sum = sum(r['traffic_weight'] for r in ROUTES_BY_ID.values() if r['category'] == 'Regional/UDAN')
    
    metro_daily = route_daily[route_daily['category'] == 'Metro'].groupby('date')['weighted_price_relative'].sum() / metro_weights_sum * 100
    udan_daily = route_daily[route_daily['category'] == 'Regional/UDAN'].groupby('date')['weighted_price_relative'].sum() / udan_weights_sum * 100
    
    daily_index['apix_metro'] = round(daily_index['date'].map(metro_daily), 2)
    daily_index['apix_regional'] = round(daily_index['date'].map(udan_daily), 2)
    
    # 6. Window-specific indices (e.g. APIx_T+1, APIx_T+7...)
    for win in ['T+1', 'T+7', 'T+15', 'T+30', 'T+45']:
        win_df = agg_df[agg_df['booking_window'] == win].copy()
        win_df['base_fare_ref'] = win_df['route_id'].apply(lambda rid: ROUTES_BY_ID[rid]['base_period_fare'])
        win_df['traffic_weight'] = win_df['route_id'].apply(lambda rid: ROUTES_BY_ID[rid]['traffic_weight'])
        win_df['win_pr'] = (win_df['total_fare'] / win_df['base_fare_ref']) * win_df['traffic_weight']
        win_daily = win_df.groupby('date')['win_pr'].sum() * 100
        daily_index[f'apix_{win}'] = round(daily_index['date'].map(win_daily), 2)
        
    # 7. Rolling 7-day average (Weekly)
    daily_index['apix_weekly_ma'] = round(daily_index['apix'].rolling(7, min_periods=1).mean(), 2)
    
    return daily_index, route_daily
