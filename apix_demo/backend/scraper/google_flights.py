"""
High-Efficiency Google Flights Scraper using Playwright & Stealth Emulation.
Extracts live carrier fares, timings, stops, and price components.
"""
import time
import re
import logging
from typing import List, Optional
from datetime import datetime
from apix_demo.backend.scraper.models import FlightFareRecord, ScrapeResult, parse_fare_string, decompose_fare
from apix_demo.backend.scraper.browser_pool import BrowserPool, default_pool

logger = logging.getLogger("apix.scraper.google_flights")

KNOWN_CARRIERS = [
    "IndiGo", "Air India", "Akasa Air", "SpiceJet", "AI Express", "Air India Express",
    "Vistara", "Alliance Air", "Star Air", "Fly91"
]

def clean_carrier_name(text: str) -> str:
    """Normalizes carrier text into standardized airline name."""
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
        return "Air India"  # Vistara merged into Air India
    if "alliance" in text_lower:
        return "Alliance Air"
    if "star air" in text_lower:
        return "Star Air"
    if "fly91" in text_lower:
        return "Fly91"
    # Return matched or cleaned first word
    words = text.split()
    return words[0] if words else "Other Airline"

class GoogleFlightsScraper:
    def __init__(self, pool: Optional[BrowserPool] = None):
        self.pool = pool or default_pool

    def build_url(self, origin: str, destination: str, date: str) -> str:
        """Constructs direct Google Flights search URL with INR currency and English locale."""
        origin_clean = origin.strip().upper()
        dest_clean = destination.strip().upper()
        return f"https://www.google.com/travel/flights?q=Flights%20to%20{dest_clean}%20from%20{origin_clean}%20on%20{date}%20oneway&curr=INR&hl=en"

    async def scrape(self, origin: str, destination: str, date: str, booking_window: str = "T+7") -> ScrapeResult:
        """Scrapes flight listings from Google Flights."""
        start_time = time.time()
        url = self.build_url(origin, destination, date)
        route_id = f"{origin.upper()}-{destination.upper()}"
        logger.info(f"[Google Flights] Scraping route {route_id} for date {date} ({booking_window})...")

        try:
            async with self.pool.get_page(block_assets=True) as page:
                # 1. Navigate to Google Flights search page
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)

                # 2. Handle Google Consent / Cookie dialog if shown
                try:
                    consent_btn = page.locator("button:has-text('Accept all'), button:has-text('I agree'), button:has-text('Reject all')")
                    if await consent_btn.count() > 0:
                        await consent_btn.first.click(timeout=3000)
                        await page.wait_for_load_state("domcontentloaded", timeout=5000)
                except Exception:
                    pass

                # 3. Wait for flight results container or listitems
                try:
                    await page.wait_for_selector(
                        "li.pIav2d, div[role='listitem'], div.yR1fYc, ul.RKOEc",
                        timeout=12000
                    )
                except Exception:
                    # Give extra grace period for dynamic hydration
                    await page.wait_for_timeout(3000)

                # 4. Extract flight cards using page evaluation
                items_data = await page.evaluate("""
                    () => {
                        const results = [];
                        // Google Flights listing cards
                        const cardElements = document.querySelectorAll('li.pIav2d, div[role="listitem"], div.yR1fYc');
                        
                        cardElements.forEach(card => {
                            const text = card.innerText || '';
                            if (!text.includes('₹') && !text.includes('INR')) return;

                            // Find price
                            const priceMatch = text.match(/₹\\s*([\\d,]+)/) || text.match(/INR\\s*([\\d,]+)/);
                            const priceStr = priceMatch ? priceMatch[1].replace(/,/g, '') : null;
                            if (!priceStr) return;

                            // Find carrier candidate
                            const carrierEl = card.querySelector('.sSHqwe, .XSGjTe, span[aria-label]');
                            let carrierCandidate = carrierEl ? carrierEl.textContent.trim() : '';

                            // Find duration candidate
                            const durationMatch = text.match(/(\\d+\\s*(?:hr|h|m|min)(?:\\s*\\d+\\s*(?:m|min))?)/i);
                            const durationStr = durationMatch ? durationMatch[1] : null;

                            // Check stops
                            const isNonstop = text.toLowerCase().includes('nonstop') || text.toLowerCase().includes('non-stop');
                            const stopsMatch = text.match(/(\\d+)\\s*stop/i);
                            const stopsCount = isNonstop ? 0 : (stopsMatch ? parseInt(stopsMatch[1]) : 1);

                            // Find times
                            const timeMatch = text.match(/(\\d{1,2}:\\d{2}\\s*(?:AM|PM|am|pm)?)\\s*[–-]\\s*(\\d{1,2}:\\d{2}\\s*(?:AM|PM|am|pm)?)/);

                            results.push({
                                raw_text: text,
                                price: parseFloat(priceStr),
                                carrier_candidate: carrierCandidate,
                                duration: durationStr,
                                stops: stopsCount,
                                is_direct: isNonstop,
                                dep_time: timeMatch ? timeMatch[1] : null,
                                arr_time: timeMatch ? timeMatch[2] : null
                            });
                        });
                        return results;
                    }
                """)

                logger.info(f"[Google Flights] Found {len(items_data)} flight card candidates for {route_id}.")

                records: List[FlightFareRecord] = []
                seen_signatures = set()

                for item in items_data:
                    raw_text = item.get("raw_text", "")
                    price = item.get("price", 0.0)
                    if price <= 500 or price > 200000:  # Sanity check
                        continue

                    # Identify carrier
                    detected_carrier = None
                    for c in KNOWN_CARRIERS:
                        if c.lower() in raw_text.lower():
                            detected_carrier = c
                            break
                    if not detected_carrier:
                        detected_carrier = clean_carrier_name(item.get("carrier_candidate", ""))

                    dep_time = item.get("dep_time")
                    arr_time = item.get("arr_time")
                    stops = item.get("stops", 0)

                    # Deduplication key
                    sig = (detected_carrier, dep_time, price, stops)
                    if sig in seen_signatures:
                        continue
                    seen_signatures.add(sig)

                    # Parse duration in minutes
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
                        source="Google Flights",
                        raw_price_str=f"₹{price:,.0f}"
                    )
                    records.append(record)

                latency = round((time.time() - start_time) * 1000, 2)
                return ScrapeResult(
                    success=len(records) > 0,
                    source="Google Flights",
                    origin=origin.upper(),
                    destination=destination.upper(),
                    date=date,
                    booking_window=booking_window,
                    records=records,
                    latency_ms=latency,
                    error_message=None if records else "No active fares found in DOM"
                )

        except Exception as e:
            latency = round((time.time() - start_time) * 1000, 2)
            logger.error(f"[Google Flights] Error scraping {route_id}: {str(e)}")
            return ScrapeResult(
                success=False,
                source="Google Flights",
                origin=origin.upper(),
                destination=destination.upper(),
                date=date,
                booking_window=booking_window,
                records=[],
                error_message=str(e),
                latency_ms=latency
            )

default_google_scraper = GoogleFlightsScraper()
