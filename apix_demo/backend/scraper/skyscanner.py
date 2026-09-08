"""
High-Efficiency Skyscanner India Scraper using Playwright & Stealth Emulation.
Extracts live carrier fares, timings, stops, and price components.
"""
import time
import re
import logging
from typing import List, Optional
from datetime import datetime
from apix_demo.backend.scraper.models import FlightFareRecord, ScrapeResult, parse_fare_string, decompose_fare
from apix_demo.backend.scraper.browser_pool import BrowserPool, default_pool

logger = logging.getLogger("apix.scraper.skyscanner")

KNOWN_CARRIERS = [
    "IndiGo", "Air India", "Akasa Air", "SpiceJet", "AI Express", "Air India Express",
    "Vistara", "Alliance Air", "Star Air", "Fly91"
]

def clean_carrier_name(text: str) -> str:
    text_lower = text.lower()
    if "indigo" in text_lower:
        return "IndiGo"
    if "express" in text_lower and ("air india" in text_lower or "ai" in text_lower):
        return "AI Express"
    if "air india" in text_lower:
        return "Air India"
    if "akasa" in text_lower:
        return "Akasa Air"
    if "spicejet" in text_lower:
        return "SpiceJet"
    if "vistara" in text_lower:
        return "Air India"
    if "alliance" in text_lower:
        return "Alliance Air"
    if "star air" in text_lower:
        return "Star Air"
    words = text.split()
    return words[0] if words else "Other Airline"

class SkyscannerScraper:
    def __init__(self, pool: Optional[BrowserPool] = None):
        self.pool = pool or default_pool

    def build_url(self, origin: str, destination: str, date_str: str) -> str:
        """
        Constructs Skyscanner flight search URL.
        Skyscanner India accepts YYMMDD format, e.g., 2026-09-15 -> 260915.
        """
        try:
            dt = datetime.fromisoformat(date_str)
            yymmdd = dt.strftime("%y%m%d")
        except Exception:
            yymmdd = date_str.replace("-", "")[2:]

        orig = origin.strip().lower()
        dest = destination.strip().lower()
        return f"https://www.skyscanner.co.in/transport/flights/{orig}/{dest}/{yymmdd}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=0&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false&currency=INR"

    async def scrape(self, origin: str, destination: str, date: str, booking_window: str = "T+7") -> ScrapeResult:
        """Scrapes flight listings from Skyscanner India."""
        start_time = time.time()
        url = self.build_url(origin, destination, date)
        route_id = f"{origin.upper()}-{destination.upper()}"
        logger.info(f"[Skyscanner] Scraping route {route_id} for date {date} ({booking_window})...")

        try:
            async with self.pool.get_page(block_assets=True) as page:
                # 1. Navigate to search URL
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)

                # 2. Dismiss cookie / privacy banner if present
                try:
                    accept_cookie = page.locator("button#accept-button, button:has-text('Accept all'), button:has-text('OK')")
                    if await accept_cookie.count() > 0:
                        await accept_cookie.first.click(timeout=3000)
                except Exception:
                    pass

                # 3. Check for bot challenges (Akamai / Cloudflare / CAPTCHA)
                page_content = await page.content()
                if any(phrase in page_content.lower() for phrase in ["access denied", "pardon our interruption", "captcha", "security check", "verify you are human", "cf-turnstile"]):
                    logger.warning(f"[Skyscanner] Anti-bot challenge page detected for {route_id}. Triggering multi-tier CAPTCHA solver...")
                    from apix_demo.backend.scraper.captcha_solver import default_captcha_solver
                    solve_res = await default_captcha_solver.detect_and_solve_page_challenge(page)
                    if solve_res.get("solved"):
                        logger.info(f"[Skyscanner] CAPTCHA challenge successfully resolved via {solve_res.get('tier')} in {solve_res.get('latency_ms')}ms! Proceeding to results...")
                        await page.wait_for_timeout(2000)
                    else:
                        logger.warning(f"[Skyscanner] Anti-bot challenge solver could not clear page.")
                        latency = round((time.time() - start_time) * 1000, 2)
                        return ScrapeResult(
                            success=False,
                            source="Skyscanner",
                            origin=origin.upper(),
                            destination=destination.upper(),
                            date=date,
                            booking_window=booking_window,
                            records=[],
                            error_message="Skyscanner Anti-Bot / CAPTCHA challenge encountered (Solver exhausted)",
                            latency_ms=latency
                        )

                # 4. Wait for flight results or cards
                try:
                    await page.wait_for_selector(
                        "div[data-test-id='flight-card'], div[class*='FlightCard'], div[class*='Ticket__Wrapper'], div[class*='FlightsResults']",
                        timeout=12000
                    )
                except Exception:
                    await page.wait_for_timeout(3000)

                # 5. Extract flight items via page evaluation
                items_data = await page.evaluate("""
                    () => {
                        const results = [];
                        const cardElements = document.querySelectorAll(
                            "div[data-test-id='flight-card'], div[class*='FlightCard'], div[class*='Ticket__Wrapper'], div[role='region']"
                        );

                        cardElements.forEach(card => {
                            const text = card.innerText || '';
                            if (!text.includes('₹') && !text.includes('INR')) return;

                            const priceMatch = text.match(/₹\\s*([\\d,]+)/) || text.match(/INR\\s*([\\d,]+)/);
                            const priceStr = priceMatch ? priceMatch[1].replace(/,/g, '') : null;
                            if (!priceStr) return;

                            const isNonstop = text.toLowerCase().includes('direct') || text.toLowerCase().includes('nonstop') || text.toLowerCase().includes('non-stop');
                            const stopsMatch = text.match(/(\\d+)\\s*stop/i);
                            const stopsCount = isNonstop ? 0 : (stopsMatch ? parseInt(stopsMatch[1]) : 1);

                            const timeMatch = text.match(/(\\d{1,2}:\\d{2})\\s*[–-]\\s*(\\d{1,2}:\\d{2})/);

                            const durationMatch = text.match(/(\\d+\\s*(?:h|hr|m|min)(?:\\s*\\d+\\s*(?:m|min))?)/i);

                            results.push({
                                raw_text: text,
                                price: parseFloat(priceStr),
                                stops: stopsCount,
                                is_direct: isNonstop,
                                dep_time: timeMatch ? timeMatch[1] : null,
                                arr_time: timeMatch ? timeMatch[2] : null,
                                duration: durationMatch ? durationMatch[1] : null
                            });
                        });
                        return results;
                    }
                """)

                logger.info(f"[Skyscanner] Found {len(items_data)} flight card candidates for {route_id}.")

                records: List[FlightFareRecord] = []
                seen_signatures = set()

                for item in items_data:
                    raw_text = item.get("raw_text", "")
                    price = item.get("price", 0.0)
                    if price <= 500 or price > 200000:
                        continue

                    detected_carrier = None
                    for c in KNOWN_CARRIERS:
                        if c.lower() in raw_text.lower():
                            detected_carrier = c
                            break
                    if not detected_carrier:
                        detected_carrier = "IndiGo"  # Default common domestic carrier if not identified

                    dep_time = item.get("dep_time")
                    arr_time = item.get("arr_time")
                    stops = item.get("stops", 0)

                    sig = (detected_carrier, dep_time, price, stops)
                    if sig in seen_signatures:
                        continue
                    seen_signatures.add(sig)

                    dur_str = item.get("duration", "")
                    dur_mins = None
                    if dur_str:
                        h_match = re.search(r"(\d+)\s*(?:hr|h)", dur_str, re.IGNORECASE)
                        m_match = re.search(r"(\d+)\s*(?:min|m)", dur_str, re.IGNORECASE)
                        hrs = int(h_match.group(1)) if h_match else 0
                        mins = int(m_match.group(1)) if m_match else 0
                        dur_mins = hrs * 60 + mins

                    base_fare, fuel_surcharge, taxes_udf = decompose_fare(price)

                    record = FlightFareRecord(
                        route_id=route_id,
                        origin=origin.upper(),
                        destination=destination.upper(),
                        date=date,
                        booking_window=booking_window,
                        carrier=detected_carrier,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        duration_mins=dur_mins,
                        stops=stops,
                        is_direct=(stops == 0),
                        base_fare=base_fare,
                        fuel_surcharge=fuel_surcharge,
                        taxes_udf=taxes_udf,
                        total_fare=price,
                        source="Skyscanner",
                        raw_price_str=f"₹{price:,.0f}"
                    )
                    records.append(record)

                latency = round((time.time() - start_time) * 1000, 2)
                return ScrapeResult(
                    success=len(records) > 0,
                    source="Skyscanner",
                    origin=origin.upper(),
                    destination=destination.upper(),
                    date=date,
                    booking_window=booking_window,
                    records=records,
                    latency_ms=latency,
                    error_message=None if records else "No active fares extracted from DOM"
                )

        except Exception as e:
            latency = round((time.time() - start_time) * 1000, 2)
            logger.error(f"[Skyscanner] Error scraping {route_id}: {str(e)}")
            return ScrapeResult(
                success=False,
                source="Skyscanner",
                origin=origin.upper(),
                destination=destination.upper(),
                date=date,
                booking_window=booking_window,
                records=[],
                error_message=str(e),
                latency_ms=latency
            )

default_skyscanner_scraper = SkyscannerScraper()
