FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if any are needed (e.g. for pdf parsing, though standard python packages are fine)
# Clean up cache to minimize image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --pre --no-cache-dir -r requirements.txt

COPY . .

# Expose port 7860 which Hugging Face Spaces routes to
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
