# Automated Test Results

**Result: PASS**  
**Run date:** 26 September 2026  
**Environment:** Python 3.12.6, pytest 9.1.1

## Summary

- 28 tests passed.
- Core-module coverage: 89.82%, above the configured 70% CI threshold.
- Cleaning: 82% coverage.
- APIx index calculation: 100% coverage.
- Explainability: 100% coverage.
- Scraper tests use mocked browser results; no live websites were accessed.

Coverage is measured for the three named core modules only, not the entire repository.

## Run

From the repository root, install the development dependencies and run the suite:

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest
```

Run the same core coverage gate used by GitHub Actions with:

```powershell
python -m pytest `
  --cov=apix_demo.backend.engine.cleaning `
  --cov=apix_demo.backend.engine.apix_calculator `
  --cov=apix_demo.backend.engine.explainability `
  --cov-report=term-missing `
  --cov-fail-under=70
```

## Coverage Scope

The suite checks fare cleaning and structural limits, Laspeyres index calculations, route-weight normalization, reliability scoring, explainability arithmetic, HHI concentration and flagging rules, deterministic calculations in the synthetic backtest, a FastAPI cleaning endpoint, mocked scraper parsing, and existing scraper model/cache behavior.

The backtesting tests validate calculations over generated comparison values; they do not validate against official DGCA observations. Passing tests establish software behavior for the tested cases, not live collection coverage, economic accuracy, or regulatory approval.

## Warnings

The passing run reported three non-failing deprecation warnings: one from Starlette's `httpx` test-client integration and two related to FastAPI's deprecated `on_event` startup hook. They did not affect the test results.
