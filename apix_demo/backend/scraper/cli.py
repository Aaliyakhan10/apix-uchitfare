"""
Command-Line Interface for UchitFare Real-Time Airfare Scraper.
Supports single-route queries, basket runs, and cache inspection.
"""
import argparse
import asyncio
import sys
import json
import logging
from datetime import datetime, date

from apix_demo.backend.scraper.models import ScrapeTask
from apix_demo.backend.scraper.orchestrator import ScraperOrchestrator
from apix_demo.backend.scraper.cache import default_cache

def setup_logging(verbose: bool):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        level=level
    )

async def main_async(args):
    setup_logging(args.verbose)
    
    if args.clear_cache:
        default_cache.clear()
        print("[APIx Scraper] SQLite cache cleared successfully.")
        return

    if args.cache_stats:
        stats = default_cache.get_stats()
        print("\n=== APIx Scraper Cache Stats ===")
        print(json.dumps(stats, indent=2))
        return

    orchestrator = ScraperOrchestrator(
        cache_enabled=not args.no_cache,
        cache_ttl_hours=args.cache_ttl
    )

    try:
        # Single direct route scrape
        if args.origin and args.destination:
            travel_date = args.date or orchestrator.calculate_window_date(args.window)
            source = args.source.lower()
            
            print(f"\n=======================================================")
            print(f"[APIx] Scraping Route: {args.origin.upper()} -> {args.destination.upper()}")
            print(f"Travel Date: {travel_date} ({args.window})")
            print(f"Source: {source.title()} | Caching: {not args.no_cache}")
            print(f"=======================================================\n")

            task = ScrapeTask(
                origin=args.origin.upper(),
                destination=args.destination.upper(),
                date=travel_date,
                booking_window=args.window,
                source=source
            )

            result = await orchestrator.scrape_single_task(task)

            if result.success:
                print(f"[OK] Success! Extracted {len(result.records)} flights in {result.latency_ms:.1f}ms (From Cache: {result.from_cache})\n")
                print(f"{'Carrier':<15} {'Dep - Arr':<15} {'Stops':<8} {'Base':<10} {'Taxes':<10} {'Total (INR)':<12}")
                print("-" * 75)
                for r in result.records:
                    times = f"{r.departure_time or 'N/A'} - {r.arrival_time or 'N/A'}"
                    stops_str = "Direct" if r.is_direct else f"{r.stops} stop"
                    print(f"{r.carrier:<15} {times:<15} {stops_str:<8} Rs.{r.base_fare:<9.0f} Rs.{r.taxes_udf:<9.0f} Rs.{r.total_fare:<10.0f}")
                print("-" * 75)
                avg_fare = sum(r.total_fare for r in result.records) / len(result.records)
                print(f"[STATS] Route Average Fare: Rs.{avg_fare:,.0f} across {len(result.records)} listings\n")
            else:
                print(f"[WARN] Scraping completed with notice: {result.error_message}")
                print(f"Latency: {result.latency_ms:.1f}ms\n")

        # Multi-route basket run
        else:
            routes = args.routes.split(",") if args.routes else ["DEL-BOM", "BOM-BLR"]
            windows = args.windows.split(",") if args.windows else ["T+7"]
            sources = args.sources.split(",") if args.sources else ["google_flights"]

            print(f"\n=======================================================")
            print(f"[APIx] Launching Basket Scrape: {len(routes)} routes x {len(windows)} windows")
            print(f"Sources: {', '.join(sources)}")
            print(f"Concurrency: {args.concurrency}")
            print(f"=======================================================\n")

            basket_res = await orchestrator.run_basket(
                route_ids=routes,
                booking_windows=windows,
                sources=sources,
                concurrency=args.concurrency
            )

            df = basket_res["dataframe"]
            print(f"[OK] Basket Scrape Complete!")
            print(f"Total Tasks: {basket_res['total_tasks']} | Succeeded: {basket_res['successful_tasks']} | Cache Hits: {basket_res['cache_hits']}")
            print(f"Total Flight Listings Collected: {basket_res['total_records']}\n")

            if not df.empty:
                print("[RESULTS] Extracted Records Preview:")
                print(df[["route_id", "booking_window", "carrier", "total_fare", "source"]].head(10).to_string(index=False))
                
                if args.output:
                    df.to_csv(args.output, index=False)
                    print(f"\n[SAVED] Saved full results to {args.output}")

    finally:
        await orchestrator.close()

def main():
    parser = argparse.ArgumentParser(description="UchitFare Airfare Scraper Subsystem (Google Flights & Skyscanner)")
    parser.add_argument("--origin", type=str, help="Origin airport IATA (e.g. DEL)")
    parser.add_argument("--destination", type=str, help="Destination airport IATA (e.g. BOM)")
    parser.add_argument("--date", type=str, help="Travel date YYYY-MM-DD")
    parser.add_argument("--window", type=str, default="T+7", choices=["T+1", "T+7", "T+15", "T+30", "T+45"], help="Booking horizon window")
    parser.add_argument("--source", type=str, default="google_flights", choices=["google_flights", "skyscanner"], help="Scraping target aggregator")
    parser.add_argument("--routes", type=str, help="Comma-separated route IDs for basket run (e.g. DEL-BOM,BOM-BLR)")
    parser.add_argument("--windows", type=str, help="Comma-separated windows (e.g. T+1,T+7)")
    parser.add_argument("--sources", type=str, help="Comma-separated sources (e.g. google_flights,skyscanner)")
    parser.add_argument("--concurrency", type=int, default=3, help="Max parallel browser workers")
    parser.add_argument("--no-cache", action="store_true", help="Bypass SQLite cache")
    parser.add_argument("--cache-ttl", type=float, default=4.0, help="Cache validity in hours")
    parser.add_argument("--cache-stats", action="store_true", help="Display cache status")
    parser.add_argument("--clear-cache", action="store_true", help="Clear all stored cache entries")
    parser.add_argument("--output", type=str, help="Path to save output CSV")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose debug logging")

    args = parser.parse_args()
    asyncio.run(main_async(args))

if __name__ == "__main__":
    main()
