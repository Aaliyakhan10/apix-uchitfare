import pandas as pd
import pytest

from apix_demo.backend.data.routes import BOOKING_WINDOWS, ROUTES
from apix_demo.backend.engine.apix_calculator import compute_apix_indices


def build_daily_fares(date_factors):
    rows = []
    for date, factor in date_factors:
        for route in ROUTES:
            for window in BOOKING_WINDOWS:
                rows.append({
                    "date": date,
                    "route_id": route["id"],
                    "booking_window": window,
                    "total_fare": route["base_period_fare"] * factor,
                    "category": route["category"],
                    "fuel_index": 100.0,
                    "demand_surge_flag": 0,
                    "competition_count": len(route["typical_carriers"]),
                    "distance_km": route["distance_km"],
                })
    return pd.DataFrame(rows)


def test_route_traffic_weights_sum_to_one(sample_route_weights):
    assert sum(sample_route_weights.values()) == pytest.approx(1.0)


def test_index_matches_weighted_route_and_window_relatives():
    daily_index, route_daily = compute_apix_indices(
        build_daily_fares([("2026-09-08", 1.1)])
    )

    assert daily_index.loc[0, "apix"] == pytest.approx(110.0)
    assert daily_index.loc[0, "apix_T+7"] == pytest.approx(110.0)
    assert len(route_daily) == len(ROUTES)
    assert all(value == pytest.approx(1.1) for value in route_daily["price_relative"])


def test_weekly_rolling_average_uses_available_daily_values():
    date_factors = [
        (f"2026-09-{day:02}", 1.0 + (day - 1) / 100)
        for day in range(1, 9)
    ]
    daily_index, _ = compute_apix_indices(build_daily_fares(date_factors))

    assert daily_index.loc[6, "apix_weekly_ma"] == pytest.approx(103.0)
    assert daily_index.loc[7, "apix_weekly_ma"] == pytest.approx(104.0)