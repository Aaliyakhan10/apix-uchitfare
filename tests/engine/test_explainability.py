import pytest

from apix_demo.backend.engine.explainability import ExplainabilityEngine


FEATURES = [
    "fuel_delta_pct",
    "demand_surge_flag",
    "competition_count",
    "booking_window_days",
]


def fixed_engine(coefficients, means=None):
    engine = ExplainabilityEngine()
    engine.coefficients = coefficients
    engine.feature_means = means or {feature: 0.0 for feature in FEATURES}
    return engine


def test_regression_model_fits_cleaned_fare_features(cleaned_fares):
    engine = ExplainabilityEngine()

    engine.fit(cleaned_fares)

    assert set(engine.coefficients) == set(FEATURES)
    assert set(engine.feature_means) == set(FEATURES)
    assert all(value == value for value in engine.coefficients.values())


def test_linear_attributions_and_residual_reconcile_to_fare_change():
    engine = fixed_engine({
        "fuel_delta_pct": 0.5,
        "demand_surge_flag": 10.0,
        "competition_count": -2.0,
        "booking_window_days": -0.25,
    })

    result = engine.explain_route_day(
        current_fare=5500,
        baseline_fare=5000,
        fuel_index=110,
        is_surge=1,
        competition_count=2,
        window="T+1",
    )
    factors = result["factors"]

    assert result["shap_formula"] == "phi_j = beta_j * (x_j - E[X_j])"
    assert sum(factor["inr_impact"] for factor in factors) == pytest.approx(
        result["total_change_inr"]
    )
    assert sum(factor["pct"] for factor in factors) == pytest.approx(100.0)


def test_dominant_fuel_feature_has_largest_attribution():
    engine = fixed_engine({
        "fuel_delta_pct": 2.0,
        "demand_surge_flag": 0.1,
        "competition_count": 0.01,
        "booking_window_days": 0.001,
    })

    result = engine.explain_route_day(
        current_fare=5500,
        baseline_fare=5000,
        fuel_index=110,
        is_surge=1,
        competition_count=2,
        window="T+15",
    )
    fuel = next(factor for factor in result["factors"] if factor["name"] == "ATF Jet Fuel Shock")

    assert fuel["inr_impact"] == max(factor["inr_impact"] for factor in result["factors"])