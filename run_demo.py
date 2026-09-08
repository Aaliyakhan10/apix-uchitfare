#!/usr/bin/env python3
"""
Cross-platform launcher for APIx (UchitFare) - SIH26056 Demo.
Sponsor: MoSPI — Data Informatics & Innovation Division (DIID)
"""
import sys
import os
import webbrowser
from pathlib import Path
import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parent))

import socket

def is_port_available(h: str, p: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((h, p)) != 0

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    if not is_port_available(host, port):
        print(f"[!] Notice: Port {port} is occupied by another process. Searching for open port...")
        for candidate in [8001, 8002, 8080, 8081]:
            if is_port_available(host, candidate):
                port = candidate
                break
    url = f"http://{host}:{port}"
    print("=" * 70)
    print("  APIx: Real-Time Airfare Price Index Engine (MoSPI - DIID)")
    print("  Smart India Hackathon 2026 | Problem ID: SIH26056 | Team: Binary Brains")
    print("=" * 70)
    print(f"\n[*] Opening Evaluator Dashboard at: {url}")
    print(f"[*] API Documentation available at: {url}/docs")
    print("[*] Press Ctrl+C to stop the server.\n")
    
    # Try opening browser automatically
    try:
        webbrowser.open(url)
    except Exception:
        pass
        
    uvicorn.run("apix_demo.backend.main:app", host=host, port=port, reload=True)

