#!/usr/bin/env bash
# ==============================================================================
# APIx UchitFare - Universal One-Command Deployment Script (SIH26056)
# Supports:
#   1. Docker Compose (Default / Containerized)
#   2. Native Linux systemd Services
# ==============================================================================
set -e

MODE=${1:-"docker"}

echo "===================================================================="
echo "      APIx (UchitFare) - MoSPI Real-Time Price Index Engine         "
echo "      Deployment Script | Mode: ${MODE}                             "
echo "===================================================================="

if [ "$MODE" = "systemd" ]; then
    echo "[*] Launching systemd deployment..."
    if [ "$EUID" -ne 0 ]; then
        echo "[!] Error: systemd deployment requires root privileges. Please run: sudo bash deploy.sh systemd"
        exit 1
    fi
    bash deployment/systemd/install_systemd.sh
elif [ "$MODE" = "docker" ]; then
    echo "[*] Checking Docker & Docker Compose installation..."
    if ! command -v docker &> /dev/null; then
        echo "[!] Docker is not installed. Please install Docker or run with: sudo bash deploy.sh systemd"
        exit 1
    fi

    echo "[*] Building and launching APIx containers (Backend, Daemon, Frontend)..."
    docker compose down --remove-orphans || true
    docker compose build --parallel
    docker compose up -d

    echo ""
    echo "===================================================================="
    echo "  [SUCCESS] All APIx containers deployed and running!"
    echo "  - Web Dashboard   : http://localhost:3001"
    echo "  - Backend API     : http://localhost:8001"
    echo "  - Swagger Docs    : http://localhost:8001/docs"
    echo "  - 30-Min Daemon   : Continuous autonomous cycle active"
    echo "  - Container Logs  : docker compose logs -f"
    echo "===================================================================="
else
    echo "[!] Unknown mode: ${MODE}. Usage: bash deploy.sh [docker|systemd]"
    exit 1
fi
