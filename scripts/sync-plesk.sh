#!/usr/bin/env bash
# Sincronización diaria en el servidor (Plesk): descarga datos de GitHub, reconstruye la web y la publica.
# Se ejecuta desde una tarea programada de Plesk. Vive en <raíz del hosting>/agentrank-src/scripts/.
# Secretos opcionales en <raíz>/agentrank-src/.env.sync (una línea KEY=valor), p. ej. GITHUB_TOKEN=...
set -uo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(dirname "$SRC")"
APP="$ROOT/httpdocs"
LOG="$SRC/sync.log"
SITE="https://agentshortlist.dev"
# La app (Passenger) lanza este script con NODE_ENV=production: hace falta instalar también las dependencias de desarrollo.
unset NODE_ENV
# La app en marcha (server.js standalone) deja variables internas de Next que, heredadas, rompen un "next build" ("generate is not a function").
for v in $(compgen -e); do case "$v" in __NEXT_*|NEXT_PRIVATE_*|NEXT_RUNTIME) unset "$v";; esac; done
for d in /opt/plesk/node/22/bin "$ROOT"/.nodenv/versions/*/bin; do [ -x "$d/node" ] && PATH="$d:$PATH"; done
export PATH


exec >>"$LOG" 2>&1
echo "=== $(date -u +%FT%TZ) inicio ==="

# Un solo proceso a la vez.
exec 9>"$SRC/.sync.lock"
command -v flock >/dev/null && { flock -n 9 || { echo "otra sincronización en curso, salgo"; exit 0; }; }

[ -f "$SRC/.env.sync" ] && { set -a; . "$SRC/.env.sync"; set +a; }
cd "$SRC"

fail() { echo "ERROR: $1"; exit 1; }

# 1. Datos
# Entorno limpio: la app en marcha (Passenger) deja variables que rompen el build ("useState" nulo al generar páginas).
CLEAN="env -i HOME=$HOME PATH=$PATH LANG=C.UTF-8"
[ -d node_modules ] || $CLEAN npm ci --include=dev --no-audit --no-fund || fail "npm ci"
rm -rf "$SRC/.data-backup"; cp -R src/data "$SRC/.data-backup" 2>/dev/null
npm run data:refresh || { rm -rf src/data; mv "$SRC/.data-backup" src/data; fail "data:refresh (datos restaurados)"; }
rm -rf "$SRC/.data-backup"

# 1b. Avisos de seguridad (OSV.dev). Si falla se conserva el archivo anterior y la sincronización sigue.
cp src/content/advisories.json "$SRC/.advisories-backup" 2>/dev/null
node scripts/osv-check.mjs >/dev/null || { echo "AVISO: osv-check falló, se conservan los avisos anteriores"; [ -f "$SRC/.advisories-backup" ] && cp "$SRC/.advisories-backup" src/content/advisories.json; }
rm -f "$SRC/.advisories-backup"

# 2. Build autocontenido
export NEXT_PUBLIC_SITE_URL="$SITE" STANDALONE=1
rm -rf .next
# webpack: el build con Turbopack falla en este servidor ("generate is not a function").
$CLEAN NEXT_PUBLIC_SITE_URL="$SITE" STANDALONE=1 npx next build || fail "build"

# 3. Publicar con copia de seguridad de la versión anterior
STAMP="$(date +%s)"
BK="$ROOT/agentrank-backup"
rm -rf "$BK" && mkdir -p "$BK"
cp -R "$APP/.next" "$BK/.next" 2>/dev/null
cp "$APP/server.js" "$BK/server.js" 2>/dev/null
cp -R "$APP/public" "$BK/public" 2>/dev/null

rm -rf "$APP/.next" "$APP/public"
mkdir -p "$APP/.next"
cp -R .next/standalone/.next/. "$APP/.next/"
cp -R .next/static "$APP/.next/static"
cp .next/standalone/server.js "$APP/server.js"
[ -d public ] && cp -R public "$APP/public"

# 4. Reinicio de la app (Passenger)
mkdir -p "$APP/tmp" && touch "$APP/tmp/restart.txt"
sleep 8

# 5. Comprobación; si falla, vuelve a la versión anterior
ok=1
for p in / /best/coding /sitemap.xml /search-index.json; do
  code="$(curl -s -m 40 -o /dev/null -w '%{http_code}' "$SITE$p")"
  echo "$p -> $code"
  [ "$code" = "200" ] || ok=0
done
if [ "$ok" != "1" ]; then
  echo "Comprobación fallida: restauro la versión anterior"
  rm -rf "$APP/.next" "$APP/public"
  cp -R "$BK/.next" "$APP/.next"; cp "$BK/server.js" "$APP/server.js"; cp -R "$BK/public" "$APP/public"
  touch "$APP/tmp/restart.txt"
  fail "publicación revertida"
fi

echo "=== $(date -u +%FT%TZ) OK ($STAMP) ==="
