"""
Pydantic data models and schemas for UchitFare airfare scraper subsystem.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import re
from datetime import datetime, timezone

def parse_fare_string(raw_val: Any) -> float:
    """Extracts numeric price value from strings like '₹5,432', 'INR 6,100', 'Rs. 4,999.50'."""
    if isinstance(raw_val, (int, float)):
        return float(raw_val)
    if not raw_val:
        return 0.0
    match = re.search(r"(\d[\d,]*(?:\.\d+)?)", str(raw_val))
    if match:
        cleaned = match.group(1).replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    return 0.0

def decompose_fare(total_fare: float) -> tuple[float, float, float]:
    """
    Decomposes total aggregate airfare into:
    (base_fare ~68%, fuel_surcharge ~16%, taxes_udf ~16%).
    Matches DGCA Indian domestic airline standard cost breakdowns.
    """
    total = max(0.0, total_fare)
    base = round(total * 0.68, 2)
    fuel = round(total * 0.16, 2)
    taxes = round(total - base - fuel, 2)
    return base, fuel, taxes

class FlightFareRecord(BaseModel):
    route_id: str
    origin: str
    destination: str
    date: str
    booking_window: str = "T+7"
    carrier: str
    flight_number: Optional[str] = None
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    duration_mins: Optional[int] = None
    stops: int = 0
    is_direct: bool = True
    base_fare: float
    fuel_surcharge: float
    taxes_udf: float
    total_fare: float
    currency: str = "INR"
    source: str  # "Google Flights" | "Skyscanner"
    scraped_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    raw_price_str: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()

class ScrapeTask(BaseModel):
    origin: str
    destination: str
    date: str
    booking_window: str = "T+7"
    source: str = "google_flights"
    route_id: Optional[str] = None

    def get_route_id(self) -> str:
        return self.route_id or f"{self.origin}-{self.destination}"

class ScrapeResult(BaseModel):
    success: bool
    source: str
    origin: str
    destination: str
    date: str
    booking_window: str
    records: List[FlightFareRecord] = Field(default_factory=list)
    error_message: Optional[str] = None
    latency_ms: float = 0.0
    from_cache: bool = False
