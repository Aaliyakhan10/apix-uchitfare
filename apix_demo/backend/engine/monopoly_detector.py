"""
Monopoly & Overcharging Watchdog Engine (Step 7).
Computes route Herfindahl-Hirschman Index (HHI):
  HHI = sum_{i} (market_share_i * 100)^2
Flags routes where:
  1. HHI >= 2500 (High Market Concentration)
  2. Fare per KM significantly exceeds distance-adjusted national benchmark.
Generates alerts for DGCA and Competition Commission of India (CCI).
"""
import pandas as pd
from apix_demo.backend.data.routes import ROUTES, ROUTES_BY_ID

def analyze_route_competition(cleaned_df: pd.DataFrame):
    """
    Computes HHI, carrier shares, and detects overcharging routes.
    """
    # 1. Market shares based on scraped capacity / flight offerings
    carrier_route_counts = cleaned_df.groupby(['route_id', 'carrier']).size().reset_index(name='flight_count')
    total_per_route = carrier_route_counts.groupby('route_id')['flight_count'].transform('sum')
    carrier_route_counts['market_share'] = carrier_route_counts['flight_count'] / total_per_route
    
    # 2. HHI per route
    carrier_route_counts['hhi_part'] = (carrier_route_counts['market_share'] * 100) ** 2
    route_hhi = {str(k): int(round(v)) for k, v in carrier_route_counts.groupby('route_id')['hhi_part'].sum().items()}
    
    # 3. Carrier breakdown dict per route
    route_carriers_dict = {}
    for rid, grp in carrier_route_counts.groupby('route_id'):
        route_carriers_dict[str(rid)] = [
            {'carrier': str(row['carrier']), 'share': float(round(row['market_share'] * 100, 1))}
            for _, row in grp.iterrows()
        ]
        
    # 4. National average fare per km
    cleaned_df['fare_per_km'] = cleaned_df['total_fare'] / cleaned_df['distance_km']
    metro_avg_fpk = float(cleaned_df[cleaned_df['category'] == 'Metro']['fare_per_km'].median())
    regional_avg_fpk = float(cleaned_df[cleaned_df['category'] == 'Regional/UDAN']['fare_per_km'].median())
    
    # Route level summary
    route_summary = []
    flagged_alerts = []
    
    for r in ROUTES:
        rid = str(r['id'])
        r_df = cleaned_df[cleaned_df['route_id'] == rid]
        if len(r_df) == 0:
            continue
            
        current_fare = int(round(float(r_df['total_fare'].median())))
        fare_per_km = float(round(current_fare / r['distance_km'], 2))
        hhi = int(route_hhi.get(rid, 2500))
        
        benchmark_fpk = float(regional_avg_fpk if r['is_udan'] else metro_avg_fpk)
        markup_ratio = float(round(fare_per_km / benchmark_fpk, 2))
        
        # Classification
        if hhi >= 5000:
            conc_level = 'Monopoly / Single Dominant'
        elif hhi >= 2500:
            conc_level = 'Highly Concentrated'
        elif hhi >= 1500:
            conc_level = 'Moderately Concentrated'
        else:
            conc_level = 'Competitive'
            
        # Flagging logic: High concentration AND fare per km markup >= 1.25
        is_flagged = bool((hhi >= 2500) and (markup_ratio >= 1.25))
        
        route_entry = {
            'route_id': rid,
            'origin': str(r['origin_name']),
            'destination': str(r['destination_name']),
            'category': str(r['category']),
            'distance_km': int(r['distance_km']),
            'current_median_fare': current_fare,
            'base_period_fare': int(r['base_period_fare']),
            'fare_per_km': fare_per_km,
            'benchmark_fare_per_km': float(round(benchmark_fpk, 2)),
            'markup_ratio': markup_ratio,
            'hhi': hhi,
            'concentration_level': conc_level,
            'is_flagged': is_flagged,
            'carrier_count': int(len(r['typical_carriers'])),
            'carrier_shares': route_carriers_dict.get(rid, [])
        }
        route_summary.append(route_entry)
        
        if is_flagged:
            dominant_carrier = sorted(route_carriers_dict.get(rid, []), key=lambda x: x['share'], reverse=True)[0]
            markup_pct = float(round((markup_ratio - 1.0) * 100, 1))
            flagged_alerts.append({
                'route_id': rid,
                'origin': str(r['origin_name']),
                'destination': str(r['destination_name']),
                'category': str(r['category']),
                'hhi': hhi,
                'severity': 'HIGH' if (markup_ratio >= 1.50 or hhi >= 6000) else 'MEDIUM',
                'dominant_carrier': str(dominant_carrier['carrier']),
                'dominant_share_pct': float(dominant_carrier['share']),
                'fare_per_km': fare_per_km,
                'benchmark_fare_per_km': float(round(benchmark_fpk, 2)),
                'markup_percent': markup_pct,
                'reason': f"Route exhibits severe market concentration (HHI {hhi}) with {dominant_carrier['carrier']} controlling {dominant_carrier['share']}%. Fare of ₹{fare_per_km}/km is {int(round(markup_pct))}% above distance benchmark.",
                'recommended_action': "Issue notice under Section 3(4) of Competition Act / DGCA Airfare Monitoring Cell Review."
            })
            
    return route_summary, flagged_alerts
