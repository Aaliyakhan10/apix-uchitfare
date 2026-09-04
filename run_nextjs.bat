@echo off
title APIx Next.js Dashboard - MoSPI DIID (SIH26056)
echo =========================================================================
echo   APIx: Real-Time Airfare Price Index Engine (Next.js Dashboard)
echo   Smart India Hackathon 2026 | Problem ID: SIH26056 | Team: Binary Brains
echo =========================================================================
echo.
cd /d "%~dp0apix-dashboard"
echo Starting Next.js Server on http://localhost:3000 ...
echo Press Ctrl+C to stop the server.
echo.
npm run dev
pause
