import os
import sys
from pathlib import Path

# Add workspace directory to path
ROOT_DIR = str(Path(__file__).resolve().parent)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from apix_demo.backend.main import app

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
    port = int(os.environ.get("PORT", os.environ.get("GRADIO_SERVER_PORT", 7860)))
    uvicorn.run(app, host="0.0.0.0", port=port)
