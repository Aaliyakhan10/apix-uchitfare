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

if __name__ == "__main__":
    port = 8000
    host = "127.0.0.1"
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
