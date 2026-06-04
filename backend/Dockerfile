# UTM Borrow API — portable container (Railway, Fly.io, Cloud Run, etc.)
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install deps first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App source.
COPY . .

EXPOSE 8000

# Host platforms inject $PORT; default to 8000 locally. Single worker keeps the
# in-process SSE broadcaster (realtime.py) coherent.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
