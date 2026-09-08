"""
APIx / UchitFare Airfare Scraper Subsystem.
Automated, high-efficiency price extraction for Google Flights and Skyscanner.
"""

from apix_demo.backend.scraper.models import FlightFareRecord, ScrapeTask, ScrapeResult
from apix_demo.backend.scraper.orchestrator import ScraperOrchestrator, run_basket_scrape

__all__ = [
    "FlightFareRecord",
    "ScrapeTask",
    "ScrapeResult",
    "ScraperOrchestrator",
    "run_basket_scrape"
]
