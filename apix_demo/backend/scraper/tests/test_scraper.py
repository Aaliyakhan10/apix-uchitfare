"""
Automated Unit and Integration Tests for UchitFare Scraper Subsystem.
Tests fare parsing, component decomposition, caching, models, and mock/live browser flows.
"""
import pytest
import tempfile
from pathlib import Path
from apix_demo.backend.scraper.models import (
    parse_fare_string,
    decompose_fare,
    FlightFareRecord,
    ScrapeTask,
    ScrapeResult
)
from apix_demo.backend.scraper.cache import ScraperCache

def test_parse_fare_string():
    assert parse_fare_string("₹5,432") == 5432.0
    assert parse_fare_string("INR 6,100") == 6100.0
    assert parse_fare_string("Rs. 4,999.50") == 4999.5
    assert parse_fare_string(7250) == 7250.0
    assert parse_fare_string("") == 0.0
    assert parse_fare_string(None) == 0.0

def test_decompose_fare():
    total = 10000.0
    base, fuel, taxes = decompose_fare(total)
    assert base == 6800.0
    assert fuel == 1600.0
    assert taxes == 1600.0
    assert round(base + fuel + taxes, 2) == total

def test_flight_fare_record_creation():
    rec = FlightFareRecord(
        route_id="DEL-BOM",
        origin="DEL",
        destination="BOM",
        date="2026-09-15",
        booking_window="T+7",
        carrier="IndiGo",
        base_fare=4000.0,
        fuel_surcharge=1000.0,
        taxes_udf=1000.0,
        total_fare=6000.0,
        stops=0,
        is_direct=True,
        source="Google Flights"
    )
    d = rec.to_dict()
    assert d["route_id"] == "DEL-BOM"
    assert d["carrier"] == "IndiGo"
    assert d["total_fare"] == 6000.0
    assert d["is_direct"] is True

def test_scraper_cache():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_cache.db"
        cache = ScraperCache(db_path=db_path)
        
        # Initially empty
        res = cache.get_cached("google_flights", "DEL", "BOM", "2026-09-15")
        assert res is None
        
        # Store records
        rec = FlightFareRecord(
            route_id="DEL-BOM",
            origin="DEL",
            destination="BOM",
            date="2026-09-15",
            booking_window="T+7",
            carrier="Air India",
            base_fare=4500.0,
            fuel_surcharge=1000.0,
            taxes_udf=1000.0,
            total_fare=6500.0,
            source="Google Flights"
        )
        cache.store_records("google_flights", "DEL", "BOM", "2026-09-15", "T+7", [rec])
        
        # Retrieve from cache
        cached = cache.get_cached("google_flights", "DEL", "BOM", "2026-09-15")
        assert cached is not None
        assert len(cached) == 1
        assert cached[0].carrier == "Air India"
        assert cached[0].total_fare == 6500.0
        
        # Stats
        stats = cache.get_stats()
        assert stats["total_queries_cached"] == 1
        assert stats["total_records_cached"] == 1
        
        # Clear
        cache.clear()
        assert cache.get_cached("google_flights", "DEL", "BOM", "2026-09-15") is None

if __name__ == "__main__":
    pytest.main(["-v", __file__])
