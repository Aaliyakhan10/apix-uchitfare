import assert from 'node:assert/strict';

const base = process.env.DEMO_URL || 'http://localhost:3000';
async function get(path, options) {
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, path);
  return response;
}
const overview = await (await get('/api/overview')).json();
assert.equal(overview.data_mode, 'synthetic');
assert.ok(overview.current_apix > 0);
assert.equal(overview.latest_date, '2026-09-08');
const routes = await (await get('/api/routes')).json();
assert.equal(routes.length, 25);
const history = await (await get('/api/index/history')).json();
assert.equal(history.length, 90);
assert.equal(history.at(-1).apix, overview.current_apix);
for (const route of routes) {
  assert.ok(Math.abs(route.carrier_shares.reduce((sum, c) => sum + c.share, 0) - 100) < 0.01);
  assert.equal(route.hhi, Math.round(route.carrier_shares.reduce((sum, c) => sum + c.share ** 2, 0)));
  const [origin, destination] = route.route_id.split('-');
  for (const window of ['T+1', 'T+7', 'T+15', 'T+30', 'T+45']) {
    const payload = await (await get('/api/scraper/live', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, window }),
    })).json();
    assert.equal(payload.data_mode, 'synthetic');
    assert.ok(payload.records.length > 0, route.route_id);
    for (const record of payload.records) {
      assert.equal(record.route_id, route.route_id);
      assert.equal(record.booking_window, window);
      assert.equal(record.base_fare + record.fuel_surcharge + record.taxes_udf, record.total_fare);
      assert.equal(record.source, 'Synthetic demo dataset');
    }
  }
}
const invalid = await fetch(base + '/api/scraper/live', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ origin: 'XXX', destination: 'YYY' }),
});
assert.equal(invalid.status, 400);
const csv = await (await get('/api/export/cpi')).text();
const lines = csv.trim().split('\n');
assert.equal(lines.length, 3751);
assert.ok(lines[0].includes('Data_Mode'));
assert.ok(lines.slice(1).every(line => line.endsWith('synthetic_demo')));
const html = await (await get('/')).text();
assert.ok(html.includes('UchitFare'));
assert.ok(html.includes('Submission prototype using synthetic sample fares'));
console.log('PASS: 25 routes × 5 horizons, provenance, fare totals, 90-day history, invalid input, CSV and homepage.');
