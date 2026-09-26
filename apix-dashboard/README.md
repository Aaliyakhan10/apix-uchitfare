# UchitFare dashboard

The Next.js application for the **UchitFare / BitSynq SIH26056 submission demo**.

See the [project README](../README.md) for the methodology, API reference, limitations and troubleshooting, and the [submission guide](../SUBMISSION_GUIDE.md) for the evaluator walkthrough.

## Run

Use Node.js 22 or newer with npm. From this directory:

```sh
npm ci
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). The production build uses webpack. No Python backend or API keys are required; the dashboard serves synthetic sample data through its own API routes.

## Develop and verify

```sh
npm run dev
```

If Turbopack encounters a worker error, use `npm run dev -- --webpack`.

With the server running, use a second terminal in this directory:

```sh
npm run test:demo
```

The smoke test checks 25 routes across five horizons, fare totals, carrier-share and HHI consistency, time-series coverage, CSV provenance and basic page availability. Run `npm run lint` separately for static analysis; existing warnings and other legacy-code findings are not covered by the smoke test.

## Key files

| File or directory | Purpose |
| --- | --- |
| `src/app/page.tsx` | Main dashboard and navigation |
| `src/app/api/` | Same-origin sample API routes |
| `src/components/LiveAirlineInspector.tsx` | Route and booking-horizon fare explorer |
| `src/components/LiveIndexCalculator.tsx` | Assumption-based sensitivity calculator |
| `src/data/mockData.ts` | Reproducible history, shares and concentration examples |
| `src/data/overview.ts` | Shared initial dashboard and overview API values |
| `scripts/smoke-demo.mjs` | Local API verification |

The `/api/scraper/live` endpoint name is inherited from the earlier prototype; this app returns generated examples. Neither the data nor the displayed benchmark metrics establish live collection or official approval.
