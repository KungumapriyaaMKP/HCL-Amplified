FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860 \
    FASTEMBED_CACHE_PATH=/app/.cache/fastembed

WORKDIR /app

# Install system dependencies (build tools & libmagic if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-warm FastEmbed model during build to ensure fast sub-second startup
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='BAAI/bge-small-en-v1.5')"

# Copy application and dataset files
COPY app/ ./app/
COPY data/ ./data/

# Expose port (7860 standard for Hugging Face Spaces, 8000 for standard Docker)
EXPOSE 7860

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start FastAPI server
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
