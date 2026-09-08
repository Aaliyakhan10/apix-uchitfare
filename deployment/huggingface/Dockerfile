FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860 \
    HF_HOME=/tmp/huggingface

# Hugging Face Spaces standard user
RUN useradd -m -u 1000 user
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install core dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install lightweight CPU-only PyTorch & Transformers for Qwen2.5 on CPU
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir transformers accelerate

# Copy application files
COPY --chown=user:user apix_demo /app/apix_demo
COPY --chown=user:user run_demo.py /app/

RUN chown -R user:user /app && mkdir -p /tmp/huggingface && chown -R user:user /tmp/huggingface
USER user

EXPOSE 7860

CMD ["uvicorn", "apix_demo.backend.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "2"]
