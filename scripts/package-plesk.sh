#!/usr/bin/env bash
# Construye la web para el servidor propio (Plesk) y deja un zip listo para subir a /httpdocs.
# Uso: bash scripts/package-plesk.sh
set -euo pipefail
cd "$(dirname "$0")/.."

export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://agentshortlist.dev}"
export STANDALONE=1

rm -rf .next dist-plesk
npm run build

mkdir -p dist-plesk
cp -R .next/standalone/. dist-plesk/
mkdir -p dist-plesk/.next
cp -R .next/static dist-plesk/.next/static
[ -d public ] && cp -R public dist-plesk/public

# Sin node_modules (trae binarios del sistema donde se construye): en el servidor se instala con npm.
rm -rf dist-plesk/node_modules
cat > dist-plesk/package.json <<'JSON'
{
  "name": "agentshortlist",
  "private": true,
  "scripts": { "start": "node server.js" },
  "dependencies": { "next": "15.5.28", "react": "19.1.0", "react-dom": "19.1.0" }
}
JSON

# Plesk (Passenger) arranca el archivo de inicio configurado: server.js ya lo genera Next.
(cd dist-plesk && zip -qr ../agentshortlist-plesk.zip . -x "*.DS_Store")
echo "Listo: agentshortlist-plesk.zip ($(du -h agentshortlist-plesk.zip | cut -f1))"
