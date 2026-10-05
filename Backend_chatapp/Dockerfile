# ScrapSaathi — Chatbot Microservice (FastAPI + LangChain + FAISS)
FROM python:3.10-slim AS base

WORKDIR /app

# Install system dependencies needed for compiling C/C++ extensions if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy knowledge base and source files
COPY Knowledge_base/ ./Knowledge_base/
COPY main.py .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
