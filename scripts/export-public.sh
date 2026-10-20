#!/usr/bin/env bash
# Actualiza la copia pública del proyecto: copia los archivos no ignorados a la carpeta del repositorio público
# y crea un commit con la identidad AgentShortlist. No hace push: eso se hace a mano con las credenciales propias.
# Uso: scripts/export-public.sh "Mensaje del commit" [carpeta-destino]
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
MSG="${1:?Falta el mensaje del commit}"
DEST="${2:-$HOME/Desktop/agentshortlist-public}"
[ -d "$DEST/.git" ] || { echo "No existe un repositorio en $DEST"; exit 1; }

cd "$DEST"
git rm -rq --ignore-unmatch . >/dev/null
cd "$SRC"
git ls-files -co --exclude-standard -z | while IFS= read -r -d '' f; do
  [ -f "$f" ] && { mkdir -p "$DEST/$(dirname "$f")"; cp -p "$f" "$DEST/$f"; }
done
cd "$DEST"
git add -A
if git diff --cached --quiet; then echo "Sin cambios que publicar."; exit 0; fi
GIT_AUTHOR_NAME="AgentShortlist" GIT_AUTHOR_EMAIL="hi@agentshortlist.dev" \
GIT_COMMITTER_NAME="AgentShortlist" GIT_COMMITTER_EMAIL="hi@agentshortlist.dev" \
git commit -q -m "$MSG"
git --no-pager log --stat --format='%h %an <%ae> %s' -1 | head -25
echo "Listo. Para publicar: cd $DEST && git push"
