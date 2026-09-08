#!/usr/bin/env python3
"""
Autonomous 30-Minute Cadence Daemon for APIx (UchitFare) - SIH26056.
Executes automated civil aviation scraping, multi-stage ML cleaning,
Laspeyres index calculation, DGCA backtest verification, and Time-Series DB persistence
every 30 minutes (1,800 seconds) continuously.
"""
import sys
import time
import datetime
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from apix_demo.backend.engine.pipeline import pipeline_instance
from apix_demo.backend.data.timeseries_db import ts_db

CADENCE_INTERVAL_SECONDS = 1800  # 30 Minutes

def run_cadence_cycle(cycle_number: int):
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("\n" + "=" * 75)
    print(f"  [APIx DAEMON] Starting Autonomous 30-Minute Cycle #{cycle_number} at {now_str}")
    print(f"  Target: All 25 National City-Pair Corridors (Metro & Regional/UDAN)")
    print(f"  Storage Engine: {ts_db.engine_type}")
    print("=" * 75)
    
    start_t = time.time()
    result = pipeline_instance.run_one_click_sync()
    duration = round(time.time() - start_t, 2)
    
    print(f"\n[✓] Cycle #{cycle_number} Complete in {duration}s:")
    print(f"    • Headline APIx Index : {result.get('headline_apix')}")
    print(f"    • Reliability Score   : {result.get('confidence_score')}%")
    print(f"    • Observations Scraped: {result.get('records_scraped')}")
    print(f"    • Outliers Quarantined: {result.get('outliers_rejected')}")
    print(f"    • DGCA Correlation    : r = {result.get('backtest_30day_summary', {}).get('pearson_correlation')}")
    print(f"    • DGCA MAPE Accuracy  : {result.get('backtest_30day_summary', {}).get('mape_percent')}%")
    
    stats = ts_db.get_database_stats()
    print(f"    • Time-Series Quotes  : {stats.get('total_time_series_quotes')} rows in {stats.get('database_file')}")
    print(f"\n[*] Sleeping for 30 minutes (1,800s). Next automated cycle scheduled at:")
    next_time = (datetime.datetime.now() + datetime.timedelta(seconds=CADENCE_INTERVAL_SECONDS)).strftime("%H:%M:%S")
    print(f"    👉 {next_time} IST\n")

def main():
    print("=" * 75)
    print("  APIx: Autonomous 30-Minute Civil Aviation Price Intelligence Daemon")
    print("  MoSPI DIID • Smart India Hackathon 2026 | Problem ID: SIH26056")
    print(f"  Cadence Schedule: Exactly every 30 minutes (1,800 seconds)")
    print("=" * 75)
    
    # Initialize baseline pipeline
    pipeline_instance.initialize()
    cycle = 1
    
    # Run immediate initial sync
    run_cadence_cycle(cycle)
    
    while True:
        try:
            time.sleep(CADENCE_INTERVAL_SECONDS)
            cycle += 1
            run_cadence_cycle(cycle)
        except KeyboardInterrupt:
            print("\n[!] Daemon stopped by user.")
            break
        except Exception as e:
            print(f"[!] Daemon error in cycle #{cycle}: {str(e)}. Retrying in 60s...")
            time.sleep(60)

if __name__ == "__main__":
    main()
