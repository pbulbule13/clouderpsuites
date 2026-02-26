FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8080
CMD exec gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind :${PORT} --max-requests 1000 --max-requests-jitter 100 --timeout 300 --limit-request-line 8190 --limit-request-body 1048576 --access-logfile - --error-logfile -
