#!/bin/sh
# Uso (dentro del contenedor, carpeta /work, en la red probe-net): sh docs/testing/write-probe/grafana-run.sh <etiqueta> <archivo-de-llamadas> <flag-o-none> <token>
tag="$1"; calls="$2"; extra="$3"; token="$4"
[ "$extra" = "none" ] && extra=""   # "none" = sin argumento extra (PowerShell elimina los argumentos vacios)
apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq nodejs >/dev/null 2>&1
mkdir -p out/write-probe
node scripts/mcp-probe.mjs --slug=grafana-mcp-server --package=mcp-grafana@2.1.1 --timeout=180 --call-timeout=60 \
  --calls="$calls" \
  --tools-out="out/write-probe/grafana.$tag.tools.json" --record-out="out/write-probe/grafana.$tag.record.json" \
  --environment="uv python3.12 image, Docker, disposable Grafana with synthetic data, extra args: ${extra:-none}" \
  --env=GRAFANA_URL=http://probe-gf:3000 --env=GRAFANA_SERVICE_ACCOUNT_TOKEN="$token" \
  -- uvx mcp-grafana@2.1.1 $extra > "out/write-probe/grafana.$tag.probe.txt" 2>&1
node scripts/write-probe-summary.mjs "$calls" "out/write-probe/grafana.$tag.record.json"
