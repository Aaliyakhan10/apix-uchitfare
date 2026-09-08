@echo off
REM ==============================================================================
REM APIx UchitFare - Windows One-Command Deployment Script (SIH26056)
REM ==============================================================================
echo ====================================================================
echo       APIx (UchitFare) - MoSPI Real-Time Price Index Engine         
echo       Windows Deployment Manager                                    
echo ====================================================================

WHERE docker >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo [*] Docker detected. Deploying via Docker Compose...
    docker compose down --remove-orphans
    docker compose up -d --build
    echo [✓] Deployment complete!
    echo Dashboard: http://localhost:3001
    echo Backend  : http://localhost:8001
    goto :end
) ELSE (
    echo [!] Docker not found. Falling back to native Windows processes...
    echo [*] Starting FastAPI Backend on port 8001...
    start "APIx Backend (Port 8001)" cmd /k "python run_demo.py"
    
    timeout /t 3 >nul
    
    echo [*] Starting Autonomous 30-Minute Daemon...
    start "APIx 30-Min Daemon" cmd /k "python daemon_30min.py"
    
    echo [*] Starting Next.js Dashboard on port 3001...
    cd apix-dashboard
    start "APIx Dashboard (Port 3001)" cmd /k "npx next dev -p 3001"
    cd ..
    
    echo ====================================================================
    echo [✓] Native processes launched successfully!
    echo Web Dashboard: http://localhost:3001
    echo Backend API  : http://localhost:8001
    echo ====================================================================
)

:end
pause
