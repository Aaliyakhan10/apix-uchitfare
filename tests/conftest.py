import pandas as pd
import pytest

from apix_demo.backend.data.routes import ROUTES


@pytest.fixture
def sample_raw_fares():
    fares = [4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 45000]
    rows = []
    for index, total_fare in enumerate(fares):
        base_fare = round(total_fare * 0.68, 2)
        fuel_surcharge = round(total_fare * 0.16, 2)
        rows.append({
            "route_id": "DEL-BOM",
            "date": "2026-09-08",
            "booking_window": "T+7",
            "carrier": "IndiGo",
            "departure_time": f"{index + 6:02}:00",
            "base_fare": base_fare,
            "fuel_surcharge": fuel_surcharge,
            "taxes_udf": round(total_fare - base_fare - fuel_surcharge, 2),
            "total_fare": total_fare,
            "distance_km": 1148,
            "category": "Metro",
            "fuel_index": 100.0 + index,
            "demand_surge_flag": index % 2,
            "competition_count": 4,
        })

    rows.append(rows[3].copy())
    return pd.DataFrame(rows)


@pytest.fixture
def cleaned_fares():
    fares = [4700, 4900, 5100, 5300, 5500, 5700]
    rows = []
    windows = ["T+1", "T+7", "T+15", "T+30", "T+45", "T+15"]
    for index, total_fare in enumerate(fares):
        rows.append({
            "route_id": "DEL-BOM",
            "date": f"2026-09-{index + 1:02}",
            "booking_window": windows[index],
            "carrier": f"Carrier {index % 3}",
            "total_fare": total_fare,
            "base_fare": round(total_fare * 0.68, 2),
            "fuel_surcharge": round(total_fare * 0.16, 2),
            "taxes_udf": round(total_fare * 0.16, 2),
            "distance_km": 1148,
            "category": "Metro",
            "fuel_index": 97.0 + index * 2,
            "demand_surge_flag": index % 2,
            "competition_count": 2 + index % 3,
        })
    return pd.DataFrame(rows)


@pytest.fixture
def sample_route_weights():
    return {route["id"]: route["traffic_weight"] for route in ROUTES}