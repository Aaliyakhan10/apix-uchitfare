import pandas as pd
import pytest

from apix_demo.backend.engine.cleaning import clean_and_filter_fares


def test_deduplicates_fares_and_quarantines_extreme_outlier(sample_raw_fares):
    cleaned, outliers, aggregated, stats = clean_and_filter_fares(
        sample_raw_fares, contamination=0.09
    )

    assert stats["duplicates_removed"] == 1
    assert stats["total_raw_records"] == len(sample_raw_fares)
    assert 45000 in outliers["total_fare"].to_list()
    assert 45000 not in cleaned["total_fare"].to_list()
    assert len(aggregated) == 1
    assert aggregated.loc[0, "route_id"] == "DEL-BOM"


def test_structural_fare_limits_are_quarantined(sample_raw_fares):
    invalid_row = sample_raw_fares.iloc[[0]].copy()
    invalid_row["departure_time"] = ["23:00"]
    invalid_row.loc[:, "total_fare"] = [400]
    invalid_row.loc[:, "base_fare"] = [272]
    invalid_row.loc[:, "fuel_surcharge"] = [64]
    invalid_row.loc[:, "taxes_udf"] = [64]
    fares = pd.concat([sample_raw_fares, invalid_row], ignore_index=True)

    _, outliers, _, stats = clean_and_filter_fares(fares, contamination=0.09)

    assert 400 in outliers["total_fare"].to_list()
    assert stats["structural_boundary_violations"] >= 1


@pytest.mark.parametrize("fare", [0, -10, 500, 120001])
def test_invalid_fare_boundaries_never_enter_cleaned_output(sample_raw_fares, fare):
    invalid_row = sample_raw_fares.iloc[[0]].copy()
    invalid_row["departure_time"] = ["23:30"]
    invalid_row.loc[:, "total_fare"] = [fare]
    fares = pd.concat([sample_raw_fares, invalid_row], ignore_index=True)

    cleaned, outliers, _, _ = clean_and_filter_fares(fares, contamination=0.09)

    assert fare not in cleaned["total_fare"].to_list()
    assert fare in outliers["total_fare"].to_list()