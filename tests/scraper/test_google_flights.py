import asyncio
from contextlib import asynccontextmanager

from apix_demo.backend.scraper.google_flights import GoogleFlightsScraper


class FakeLocator:
    async def count(self):
        return 0


class FakePage:
    def __init__(self, items):
        self.items = items
        self.url = None

    async def goto(self, url, **_kwargs):
        self.url = url

    def locator(self, _selector):
        return FakeLocator()

    async def wait_for_selector(self, *_args, **_kwargs):
        return None

    async def evaluate(self, _script):
        return self.items


class FakePool:
    def __init__(self, page):
        self.page = page

    @asynccontextmanager
    async def get_page(self, block_assets=True):
        yield self.page


def test_scraper_maps_mocked_listing_data_without_network_access():
    page = FakePage([{
        "raw_text": "IndiGo nonstop flight ₹5,432",
        "price": 5432,
        "carrier_candidate": "IndiGo",
        "duration": "2h 10m",
        "stops": 0,
        "is_direct": True,
        "dep_time": "06:45 AM",
        "arr_time": "08:55 AM",
    }])
    scraper = GoogleFlightsScraper(pool=FakePool(page))

    result = asyncio.run(scraper.scrape("del", "bom", "2026-09-15", "T+7"))

    assert result.success is True
    assert page.url.startswith("https://www.google.com/travel/flights?")
    assert len(result.records) == 1
    record = result.records[0]
    assert record.route_id == "DEL-BOM"
    assert record.date == "2026-09-15"
    assert record.booking_window == "T+7"
    assert record.carrier == "IndiGo"
    assert record.total_fare == 5432
    assert record.base_fare + record.fuel_surcharge + record.taxes_udf == record.total_fare


def test_empty_or_changed_listing_returns_empty_result():
    scraper = GoogleFlightsScraper(pool=FakePool(FakePage([])))

    result = asyncio.run(scraper.scrape("DEL", "BOM", "2026-09-15", "T+7"))

    assert result.success is False
    assert result.records == []
    assert result.error_message == "No active fares found in DOM"