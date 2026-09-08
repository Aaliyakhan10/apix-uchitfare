#!/usr/bin/env bash
# ==============================================================================
# APIx UchitFare - systemd Installation & Deployment Script (SIH26056)
# Automates the setup of:
#   1. apix-backend.service (FastAPI + Uvicorn)
#   2. apix-daemon.service  (30-Minute Autonomous Pipeline Daemon)
#   3. apix-frontend.service (Next.js Dashboard)
# ==============================================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "[!] Please run as root: sudo bash deployment/systemd/install_systemd.sh"
  exit 1
fi

PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
REAL_USER=${SUDO_USER:-$(whoami)}
VENV_PATH="${PROJECT_DIR}/venv"
NODE_BIN=$(which node || echo "/usr/bin/node")
NPM_BIN=$(which npm || echo "/usr/bin/npm")

echo "===================================================================="
echo "  Deploying APIx UchitFare via Linux systemd Services"
echo "  Project Path: ${PROJECT_DIR}"
echo "  System User : ${REAL_USER}"
echo "===================================================================="

# 1. Setup Python virtual environment if missing
if [ ! -d "${VENV_PATH}" ]; then
  echo "[*] Creating Python virtual environment in ${VENV_PATH}..."
  python3 -m venv "${VENV_PATH}"
fi

echo "[*] Installing Python backend requirements..."
"${VENV_PATH}/bin/pip" install --upgrade pip
"${VENV_PATH}/bin/pip" install -r "${PROJECT_DIR}/requirements.txt"

# 2. Build Next.js frontend
echo "[*] Building Next.js production bundle..."
cd "${PROJECT_DIR}/apix-dashboard"
if [ -f "package.json" ]; then
  npm install
  npm run build
fi
cd "${PROJECT_DIR}"

# 3. Render and copy systemd units with dynamic user and paths
echo "[*] Configuring systemd service files..."

cat <<EOF > /etc/systemd/system/apix-backend.service
[Unit]
Description=APIx UchitFare FastAPI Backend Service
After=network.target

[Service]
Type=simple
User=${REAL_USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${VENV_PATH}/bin:/usr/local/bin:/usr/bin:/bin"
Environment="PORT=8001"
Environment="PYTHONUNBUFFERED=1"
ExecStart=${VENV_PATH}/bin/uvicorn apix_demo.backend.main:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

cat <<EOF > /etc/systemd/system/apix-daemon.service
[Unit]
Description=APIx UchitFare 30-Minute Autonomous Scraping & Indexing Daemon
After=network.target apix-backend.service
Wants=apix-backend.service

[Service]
Type=simple
User=${REAL_USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${VENV_PATH}/bin:/usr/local/bin:/usr/bin:/bin"
Environment="PYTHONUNBUFFERED=1"
ExecStart=${VENV_PATH}/bin/python daemon_30min.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

cat <<EOF > /etc/systemd/system/apix-frontend.service
[Unit]
Description=APIx UchitFare Next.js Frontend Dashboard Service
After=network.target apix-backend.service

[Service]
Type=simple
User=${REAL_USER}
WorkingDirectory=${PROJECT_DIR}/apix-dashboard
Environment="PATH=$(dirname ${NPM_BIN}):/usr/local/bin:/usr/bin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="NEXT_PUBLIC_API_URL=http://127.0.0.1:8001"
ExecStart=${NPM_BIN} run start -- -p 3001
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 4. Reload and enable services
echo "[*] Reloading systemd daemon..."
systemctl daemon-reload

echo "[*] Enabling services on system boot..."
systemctl enable apix-backend.service
systemctl enable apix-daemon.service
systemctl enable apix-frontend.service

echo "[*] Starting services now..."
systemctl restart apix-backend.service
systemctl restart apix-daemon.service
systemctl restart apix-frontend.service

echo "===================================================================="
echo "  [SUCCESS] All APIx systemd services deployed & active!"
echo "  - Backend Status  : systemctl status apix-backend"
echo "  - Daemon Status   : systemctl status apix-daemon"
echo "  - Frontend Status : systemctl status apix-frontend"
echo "  - Web Dashboard   : http://<SERVER_IP>:3001"
echo "  - Backend API     : http://<SERVER_IP>:8001"
echo "  - View Logs       : journalctl -u apix-daemon -f"
echo "===================================================================="
