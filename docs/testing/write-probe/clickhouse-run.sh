#!/bin/sh
# Uso (dentro del contenedor, carpeta /work, en la red probe-net): sh docs/testing/write-probe/clickhouse-run.sh <etiqueta> <archivo-de-llamadas> <write true|false> <drop true|false>
tag="$1"; calls="$2"; write="$3"; drop="$4"
apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq nodejs >/dev/null 2>&1
mkdir -p out/write-probe
node scripts/mcp-probe.mjs --slug=clickhouse-mcp-server --package=mcp-clickhouse@0.7.0 --timeout=180 --call-timeout=60 \
  --calls="$calls" \
  --tools-out="out/write-probe/clickhouse.$tag.tools.json" --record-out="out/write-probe/clickhouse.$tag.record.json" \
  --environment="uv python3.12 image, Docker, disposable ClickHouse 24.8 container with synthetic data, ALLOW_WRITE_ACCESS=$write ALLOW_DROP=$drop" \
  --env=CLICKHOUSE_HOST=probe-ch --env=CLICKHOUSE_PORT=8123 --env=CLICKHOUSE_USER=probe --env=CLICKHOUSE_PASSWORD=probe-pass \
  --env=CLICKHOUSE_SECURE=false --env=CLICKHOUSE_VERIFY=false \
  --env=CLICKHOUSE_ALLOW_WRITE_ACCESS="$write" --env=CLICKHOUSE_ALLOW_DROP="$drop" \
  -- uvx mcp-clickhouse@0.7.0 > "out/write-probe/clickhouse.$tag.probe.txt" 2>&1
node scripts/write-probe-summary.mjs "$calls" "out/write-probe/clickhouse.$tag.record.json"
