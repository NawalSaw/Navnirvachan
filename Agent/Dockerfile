# ===== Stage 1: Build dependencies =====
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libavcodec-extra \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies globally
RUN pip install --no-cache-dir \
    speechrecognition \
    deep_translator \
    pydub \
    gtts \
    ollama \
    python-dotenv \
    fastapi[standard] \
    uvicorn

# ===== Stage 2: Create the final runtime image =====
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install system dependencies (again for runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libavcodec-extra \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed dependencies from builder
COPY --from=builder /usr/local /usr/local

# Copy application files
COPY . .

# # Set environment variables
# ENV PORT=5001

# # Expose the port
# EXPOSE ${PORT}

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001", "--reload", "--log-level", "debug"]
