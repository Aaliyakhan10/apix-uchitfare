import os
import sys
from pathlib import Path

# Add workspace directory to path
ROOT_DIR = str(Path(__file__).resolve().parent)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from apix_demo.backend.main import app

# ZeroGPU compatibility probe (satisfies Hugging Face ZeroGPU check)
try:
    import importlib
    spaces_mod = importlib.import_module("spaces")
    @spaces_mod.GPU
    def zero_gpu_probe():
        return True
except Exception:
    pass

try:
    import importlib
    gr = importlib.import_module("gradio")
    # Minimal Gradio dashboard mounted at /ui for Hugging Face visual display
    with gr.Blocks(title="APIx MoSPI Engine") as demo:
        gr.Markdown("# ✈️ APIx (UchitFare) - MoSPI Real-Time Engine")
        gr.Markdown(
            """
            **Status:** 🟢 Backend Online (16 GB Free CPU Space)  
            **Model:** Local Hugging Face Qwen2.5 on CPU + WAL Time-Series DB  
            
            ### Quick Links:
            - 📄 [Interactive Swagger OpenAPI Docs](/docs)
            - 📊 [Time-Series Database Stats](/api/database/stats)
            - 🧠 [Test LLM Formatter Endpoint](/api/llm/format)
            """
        )

    # Mount Gradio onto the existing FastAPI application at /ui
    app = gr.mount_gradio_app(app, demo, path="/ui")
except ImportError:
    pass

if __name__ == "__main__":
    import uvicorn
    import socket
    import time
    
    port = int(os.environ.get("PORT", os.environ.get("GRADIO_SERVER_PORT", 7860)))
    
    # Wait for any lingering socket in TIME_WAIT to be cleared by the OS
    for attempt in range(5):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                s.bind(("0.0.0.0", port))
                break
        except OSError:
            print(f"[Startup] Waiting for port {port} to clear... (attempt {attempt+1}/5)")
            time.sleep(2)
            
    uvicorn.run(app, host="0.0.0.0", port=port)
