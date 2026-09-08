"""
High-efficiency caching layer for airfare scraping.
Uses SQLite for zero-dependency, ultra-fast persistence and deduplication with TTL.
"""
import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager
from apix_demo.backend.scraper.models import FlightFareRecord

CACHE_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "scraper_cache.db"

class ScraperCache:
    def __init__(self, db_path: Path = CACHE_DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        with self._connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scraped_fares (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    route_id TEXT NOT NULL,
                    origin TEXT NOT NULL,
                    destination TEXT NOT NULL,
                    travel_date TEXT NOT NULL,
                    booking_window TEXT NOT NULL,
                    records_json TEXT NOT NULL,
                    record_count INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_query ON scraped_fares (source, origin, destination, travel_date)
            """)
            conn.commit()

    def get_cached(self, source: str, origin: str, destination: str, travel_date: str, max_age_hours: float = 4.0) -> Optional[List[FlightFareRecord]]:
        """Retrieves cached records if created within max_age_hours."""
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=max_age_hours)).strftime("%Y-%m-%d %H:%M:%S")
        with self._connection() as conn:
            cursor = conn.execute("""
                SELECT records_json, created_at FROM scraped_fares
                WHERE source = ? AND origin = ? AND destination = ? AND travel_date = ? AND created_at >= ?
                ORDER BY created_at DESC LIMIT 1
            """, (source, origin.upper(), destination.upper(), travel_date, cutoff))
            row = cursor.fetchone()
            if row:
                try:
                    data = json.loads(row["records_json"])
                    return [FlightFareRecord(**item) for item in data]
                except Exception:
                    return None
        return None

    def store_records(self, source: str, origin: str, destination: str, travel_date: str, booking_window: str, records: List[FlightFareRecord]):
        """Stores or updates cached records."""
        if not records:
            return
        route_id = f"{origin.upper()}-{destination.upper()}"
        records_json = json.dumps([r.to_dict() for r in records])
        with self._connection() as conn:
            conn.execute("""
                DELETE FROM scraped_fares
                WHERE source = ? AND origin = ? AND destination = ? AND travel_date = ?
            """, (source, origin.upper(), destination.upper(), travel_date))
            conn.execute("""
                INSERT INTO scraped_fares (source, route_id, origin, destination, travel_date, booking_window, records_json, record_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (source, route_id, origin.upper(), destination.upper(), travel_date, booking_window, records_json, len(records), datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")))
            conn.commit()

    def clear(self):
        """Clears all cached queries."""
        with self._connection() as conn:
            conn.execute("DELETE FROM scraped_fares")
            conn.commit()

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics on cached queries."""
        with self._connection() as conn:
            total_queries = conn.execute("SELECT COUNT(*) FROM scraped_fares").fetchone()[0]
            total_records = conn.execute("SELECT SUM(record_count) FROM scraped_fares").fetchone()[0] or 0
            sources = conn.execute("SELECT source, COUNT(*) FROM scraped_fares GROUP BY source").fetchall()
            return {
                "total_queries_cached": total_queries,
                "total_records_cached": total_records,
                "source_breakdown": {row[0]: row[1] for row in sources},
                "db_path": str(self.db_path)
            }

default_cache = ScraperCache()
