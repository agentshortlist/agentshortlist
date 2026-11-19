FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends git libssl3 libicu72 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
