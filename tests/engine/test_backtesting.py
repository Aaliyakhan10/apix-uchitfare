import numpy as np
import pandas as pd
import pytest

from apix_demo.backend.engine import backtesting


def test_backtest_metrics_match_the_deterministic_synthetic_comparison(monkeypatch):
    monkeypatch.setattr(backtesting.np.random, "normal", lambda *_args: 0.0)
    daily_index = pd.DataFrame({
        "date": [
            "2026-06-01", "2026-06-02", "2026-07-01",
            "2026-07-02", "2026-08-01", "2026-08-02",
        ],
        "apix": [103.0, 106.0, 107.0, 109.0, 112.0, 116.0],
    })

    report, series = backtesting.backtest_apix_vs_dgca(daily_index)
    expected = np.array([103.27, 105.73, 107.14, 108.78, 112.40, 115.68])

    assert series["dgca_official_index"].to_numpy() == pytest.approx(expected)
    assert report["pearson_correlation"] == pytest.approx(
        round(float(np.corrcoef(daily_index["apix"], expected)[0, 1]), 4)
    )
    assert report["mape_percent"] == pytest.approx(
        round(float(np.mean(np.abs((expected - daily_index["apix"]) / expected)) * 100), 2)
    )


def test_30_day_backtest_returns_the_last_thirty_synthetic_points(monkeypatch):
    monkeypatch.setattr(backtesting.np.random, "normal", lambda *_args: 0.0)
    dates = pd.date_range("2026-08-01", periods=35, freq="D").strftime("%Y-%m-%d")
    daily_index = pd.DataFrame({
        "date": dates,
        "apix": [114.2 + (index - 17) / 10 for index in range(35)],
    })

    report = backtesting.backtest_30day_window(daily_index)

    assert report["sample_days"] == 30
    assert report["start_date"] == dates[5]
    assert report["end_date"] == dates[-1]
    assert len(report["daily_table"]) == 30
    assert report["window"] == "30-Day Lookback"