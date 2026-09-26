@echo off
setlocal
title UchitFare - SIH26056 Submission Demo
cd /d "%~dp0apix-dashboard"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js with npm is required. Install Node.js 22 LTS, then reopen this launcher.
  pause
  exit /b 1
)
if not exist node_modules\next (
  call npm ci
  if errorlevel 1 goto failed
)
echo Building UchitFare submission demo...
call npm run build
if errorlevel 1 goto failed
echo Open http://localhost:3000 in your browser. Press Ctrl+C to stop.
call npm run start
exit /b %errorlevel%
:failed
echo Setup or build failed. Review the error above before presenting.
pause
exit /b 1
