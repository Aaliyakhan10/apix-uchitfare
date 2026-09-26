import pandas as pd

from apix_demo.backend.data.routes import ROUTES, ROUTES_BY_ID
from apix_demo.backend.engine.monopoly_detector import analyze_route_competition


PEER_ROUTE_IDS = [route["id"] for route in ROUTES if route["category"] == "Metro"][1:5]


def competition_fares(target_fare_per_km, peer_fare_per_km):
    rows = []
    route_prices = [
        ("DEL-BOM", target_fare_per_km),
        *[(route_id, peer_fare_per_km) for route_id in PEER_ROUTE_IDS],
    ]
    for route_id, fare_per_km in route_prices:
        route = ROUTES_BY_ID[route_id]
        fare = round(route["distance_km"] * fare_per_km)
        carriers = ["Dominant Carrier"] * 4 if route_id == "DEL-BOM" else ["Carrier A", "Carrier B"]
        for carrier in carriers:
            rows.append({
                "route_id": route_id,
                "carrier": carrier,
                "total_fare": fare,
                "distance_km": route["distance_km"],
                "category": route["category"],
            })
    return pd.DataFrame(rows)


def test_hhi_is_10000_for_one_carrier_and_1000_for_ten_equal_carriers():
    monopoly_rows = [
        {"route_id": "DEL-BOM", "carrier": "Only Carrier", "total_fare": 6000,
         "distance_km": 1148, "category": "Metro"}
        for _ in range(10)
    ]
    competitive_rows = [
        {"route_id": "BOM-BLR", "carrier": f"Carrier {index}", "total_fare": 5000,
         "distance_km": 842, "category": "Metro"}
        for index in range(10)
    ]

    monopoly_summary, _ = analyze_route_competition(pd.DataFrame(monopoly_rows))
    competitive_summary, _ = analyze_route_competition(pd.DataFrame(competitive_rows))

    assert monopoly_summary[0]["hhi"] == 10000
    assert competitive_summary[0]["hhi"] == 1000


def test_route_is_flagged_only_when_concentration_and_markup_both_exceed_threshold():
    summary, _ = analyze_route_competition(competition_fares(7.5, 5.0))
    target = next(route for route in summary if route["route_id"] == "DEL-BOM")

    assert target["hhi"] == 10000
    assert target["markup_ratio"] >= 1.25
    assert target["is_flagged"] is True


def test_high_concentration_without_markup_is_not_flagged():
    summary, _ = analyze_route_competition(competition_fares(5.5, 5.0))
    target = next(route for route in summary if route["route_id"] == "DEL-BOM")

    assert target["hhi"] == 10000
    assert target["markup_ratio"] < 1.25
    assert target["is_flagged"] is False