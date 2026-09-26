from fastapi.testclient import TestClient

from apix_demo.backend.main import app


def test_cleaning_simulation_endpoint_returns_auditable_fare_components():
    client = TestClient(app)

    response = client.post(
        "/api/cleaning/simulate",
        json={
            "route_id": "DEL-BOM",
            "carrier": "IndiGo",
            "raw_fare": 5000,
            "booking_window": "T+7",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["route_id"] == "DEL-BOM"
    assert payload["raw_fare"] == 5000
    assert payload["components"]["base_fare"] + payload["components"]["fuel_surcharge"] + payload["components"]["taxes_udf"] == payload["components"]["total"]
    assert len(payload["stages"]) == 5


def test_cleaning_simulation_requires_a_request_body():
    client = TestClient(app)

    response = client.post("/api/cleaning/simulate")

    assert response.status_code == 422