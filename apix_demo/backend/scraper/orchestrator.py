"""
Scraper Orchestrator for APIx / UchitFare.
Executes parallel multi-source scraping (Google Flights & Skyscanner) across
route baskets and booking windows with caching, concurrency control, and DataFrame exports.
"""
import asyncio
import datetime
import logging
from typing import List, Dict, Any, Optional
import pandas as pd

from apix_demo.backend.scraper.models import FlightFareRecord, ScrapeTask, ScrapeResult
from apix_demo.backend.scraper.browser_pool import default_pool
from apix_demo.backend.scraper.google_flights import default_google_scraper
from apix_demo.backend.scraper.skyscanner import default_skyscanner_scraper
from apix_demo.backend.scraper.cache import default_cache
from apix_demo.backend.data.routes import ROUTES, ROUTES_BY_ID, BOOKING_WINDOWS

logger = logging.getLogger("apix.scraper.orchestrator")

WINDOW_DAYS_MAP = {
    "T+1": 1,
    "T+7": 7,
    "T+15": 15,
    "T+30": 30,
    "T+45": 45
}

class ScraperOrchestrator:
    def __init__(self, cache_enabled: bool = True, cache_ttl_hours: float = 4.0):
        self.cache_enabled = cache_enabled
        self.cache_ttl_hours = cache_ttl_hours
        self.pool = default_pool
        self.google_scraper = default_google_scraper
        self.skyscanner_scraper = default_skyscanner_scraper
        self.cache = default_cache

    def calculate_window_date(self, window: str, base_date: Optional[datetime.date] = None) -> str:
        """Calculates travel date string based on booking window offset."""
        ref = base_date or datetime.date.today()
        days_offset = WINDOW_DAYS_MAP.get(window, 7)
        return (ref + datetime.timedelta(days=days_offset)).isoformat()

    async def scrape_single_task(self, task: ScrapeTask) -> ScrapeResult:
        """Executes single scrape task with caching and source dispatch."""
        source_key = "google_flights" if "google" in task.source.lower() else "skyscanner"

        # 1. Check local cache
        if self.cache_enabled:
            cached_records = self.cache.get_cached(
                source=source_key,
                origin=task.origin,
                destination=task.destination,
                travel_date=task.date,
                max_age_hours=self.cache_ttl_hours
            )
            if cached_records:
                logger.info(f"[Cache HIT] {task.origin}-{task.destination} on {task.date} ({source_key}) - {len(cached_records)} records")
                return ScrapeResult(
                    success=True,
                    source="Google Flights" if source_key == "google_flights" else "Skyscanner",
                    origin=task.origin,
                    destination=task.destination,
                    date=task.date,
                    booking_window=task.booking_window,
                    records=cached_records,
                    latency_ms=1.5,
                    from_cache=True
                )

        # 2. Live scrape
        if source_key == "google_flights":
            res = await self.google_scraper.scrape(task.origin, task.destination, task.date, task.booking_window)
        else:
            res = await self.skyscanner_scraper.scrape(task.origin, task.destination, task.date, task.booking_window)

        # 3. Store to cache if successful
        if self.cache_enabled and res.success and res.records:
            self.cache.store_records(
                source=source_key,
                origin=task.origin,
                destination=task.destination,
                travel_date=task.date,
                booking_window=task.booking_window,
                records=res.records
            )

        return res

    async def run_tasks(self, tasks: List[ScrapeTask], concurrency: int = 3) -> List[ScrapeResult]:
        """Runs a list of scrape tasks with bounded concurrency."""
        sem = asyncio.Semaphore(concurrency)

        async def worker(task: ScrapeTask):
            async with sem:
                return await self.scrape_single_task(task)

        results = await asyncio.gather(*(worker(t) for t in tasks), return_exceptions=False)
        return results

    async def run_basket(
        self,
        route_ids: Optional[List[str]] = None,
        booking_windows: Optional[List[str]] = None,
        sources: Optional[List[str]] = None,
        base_date: Optional[datetime.date] = None,
        concurrency: int = 3
    ) -> Dict[str, Any]:
        """
        Executes an end-to-end basket scrape across specified routes, windows, and sources.
        """
        target_windows = booking_windows or ["T+7"]
        target_sources = sources or ["google_flights"]
        
        # Filter routes
        if route_ids:
            route_catalog = [r for r in ROUTES if r["id"] in route_ids]
        else:
            route_catalog = ROUTES[:5]  # Default first 5 key routes for quick targeted runs

        tasks: List[ScrapeTask] = []
        for r in route_catalog:
            orig = r["origin"]
            dest = r["destination"]
            for w in target_windows:
                travel_date = self.calculate_window_date(w, base_date=base_date)
                for src in target_sources:
                    tasks.append(ScrapeTask(
                        origin=orig,
                        destination=dest,
                        date=travel_date,
                        booking_window=w,
                        source=src,
                        route_id=r["id"]
                    ))

        logger.info(f"[Orchestrator] Starting basket scrape of {len(tasks)} tasks across {len(route_catalog)} routes...")
        results = await self.run_tasks(tasks, concurrency=concurrency)

        all_records: List[FlightFareRecord] = []
        successful_tasks = 0
        cache_hits = 0

        for res in results:
            if res.success:
                successful_tasks += 1
                all_records.extend(res.records)
            if res.from_cache:
                cache_hits += 1

        # Build pandas DataFrame enriched with route metadata
        records_data = []
        for r in all_records:
            r_meta = ROUTES_BY_ID.get(r.route_id, {})
            records_data.append({
                "date": r.date,
                "route_id": r.route_id,
                "origin": r.origin,
                "destination": r.destination,
                "category": r_meta.get("category", "Metro"),
                "distance_km": r_meta.get("distance_km", 1000),
                "traffic_weight": r_meta.get("traffic_weight", 0.04),
                "booking_window": r.booking_window,
                "carrier": r.carrier,
                "base_fare": r.base_fare,
                "fuel_surcharge": r.fuel_surcharge,
                "taxes_udf": r.taxes_udf,
                "total_fare": r.total_fare,
                "fuel_index": 105.0,
                "demand_surge_flag": 0,
                "competition_count": len(r_meta.get("typical_carriers", [r.carrier])),
                "stops": r.stops,
                "is_direct": int(r.is_direct),
                "duration_mins": r.duration_mins,
                "source": r.source,
                "scraped_at": r.scraped_at
            })

        df = pd.DataFrame(records_data)
        
        return {
            "total_tasks": len(tasks),
            "successful_tasks": successful_tasks,
            "cache_hits": cache_hits,
            "total_records": len(all_records),
            "dataframe": df,
            "results": results
        }

    async def close(self):
        await self.pool.close()

# Convenience runner
async def run_basket_scrape(route_ids=None, windows=None, sources=None) -> pd.DataFrame:
    orchestrator = ScraperOrchestrator()
    try:
        res = await orchestrator.run_basket(route_ids=route_ids, booking_windows=windows, sources=sources)
        return res["dataframe"]
    finally:
        await orchestrator.close()
