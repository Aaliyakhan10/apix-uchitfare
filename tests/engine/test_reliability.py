import pandas as pd
import pytest

from apix_demo.backend.data.routes import BOOKING_WINDOWS, ROUTES
from apix_demo.backend.engine.reliability import calculate_daily_reliability


def expected_daily_points():
    return sum(len(route["typical_carriers"]) * len(BOOKING_WINDOWS) for route in ROUTES)


def test_partial_coverage_score_uses_actual_rows(sample_raw_fares):
    reliability, carrier_counts = calculate_daily_reliability(sample_raw_fares)
    row = reliability.iloc[0]
    expected = expected_daily_points()

    assert row["actual_points"] == len(sample_raw_fares)
    assert row["expected_points"] == expected
    assert row["confidence_score"] == pytest.approx(
        round(len(sample_raw_fares) / expected * 100, 2)
    )
    assert carrier_counts["IndiGo"] == len(sample_raw_fares)


def test_reliability_score_is_capped_at_one_hundred():
    count = expected_daily_points() + 5
    raw_fares = pd.DataFrame({
        "date": ["2026-09-08"] * count,
        "category": ["Metro"] * count,
        "carrier": ["IndiGo"] * count,
    })

    reliability, _ = calculate_daily_reliability(raw_fares)

    assert reliability.loc[0, "confidence_score"] == 100.0
    assert reliability.loc[0, "actual_points"] > reliability.loc[0, "expected_points"]


def test_empty_input_returns_no_daily_observations():
    reliability, carrier_counts = calculate_daily_reliability(
        pd.DataFrame(columns=["date", "category", "carrier"])
    )

    assert reliability.empty
    assert carrier_counts == {}