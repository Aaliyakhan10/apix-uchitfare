@echo off
title APIx (UchitFare) - MoSPI DIID Airfare Price Index Engine
echo =========================================================================
echo   APIx: Real-Time Airfare Price Index Engine (MoSPI - DIID)
echo   Smart India Hackathon 2026 | Problem ID: SIH26056 | Team: Binary Brains
echo =========================================================================
echo.
echo Starting FastAPI Server and Dashboard on http://localhost:8000 ...
echo Press Ctrl+C to stop the server.
echo.
python -m uvicorn apix_demo.backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
