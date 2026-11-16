#!/bin/sh
# Uso (dentro del contenedor, carpeta /work): sh docs/testing/write-probe/blender-run.sh <etiqueta> <0|1>   (1 = BLENDER_MCP_SAFE_MODE=1)
tag="$1"; safe="$2"
apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq nodejs >/dev/null 2>&1
mkdir -p out/write-probe
node scripts/fake-blender-socket.mjs "out/write-probe/blender.$tag.socket.log" 9876 &
sleep 1
envs="--env=BLENDER_HOST=127.0.0.1 --env=DISABLE_TELEMETRY=true"
if [ "$safe" = "1" ]; then envs="$envs --env=BLENDER_MCP_SAFE_MODE=1"; fi
node scripts/mcp-probe.mjs --slug=blender-mcp --package=mcp-for-blender@2.2.4 --timeout=180 --call-timeout=60 \
  --calls=docs/testing/write-probe/blender-calls.json \
  --tools-out="out/write-probe/blender.$tag.tools.json" --record-out="out/write-probe/blender.$tag.record.json" \
  --environment="uv python3.12 image, Docker, fake Blender socket (nothing is executed), safe mode=$safe" \
  $envs -- uvx mcp-for-blender@2.2.4 > "out/write-probe/blender.$tag.probe.txt" 2>&1
node scripts/write-probe-summary.mjs docs/testing/write-probe/blender-calls.json "out/write-probe/blender.$tag.record.json" "out/write-probe/blender.$tag.socket.log"
