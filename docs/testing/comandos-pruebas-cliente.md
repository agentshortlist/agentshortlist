# Comandos para las pruebas por cliente (Windows, 4 nov 2026)

Requisitos: Docker Desktop abierto. Sin credenciales, sin montar carpetas. Límites idénticos a las pruebas anteriores. Anota hora de inicio y de fin de cada prueba.

Prefijo común (ya incluido abajo): `docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges`

## Claude Code (PowerShell; ejecuta de uno en uno y anota)
```
claude --version
claude mcp add pt-memory -- docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges node:22-slim npx -y @modelcontextprotocol/server-memory@2.0.0
claude mcp add pt-everything -- docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges node:22-slim npx -y @modelcontextprotocol/server-everything@2.0.0
claude mcp add pt-context7 -- docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges node:22-slim npx -y @upstash/context7-mcp@4.4.4
claude mcp add pt-fetch -- docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges ghcr.io/astral-sh/uv:python3.12-bookworm-slim uvx mcp-server-fetch@2026.10.19
claude mcp add pt-git -- docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges ghcr.io/astral-sh/uv:python3.12-bookworm-slim sh -c "apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq git >/dev/null 2>&1 && git init -q /tmp/probe-repo && uvx mcp-server-git@2026.10.19"
```
Dentro de `claude`: `/mcp` → estado y nº de herramientas (copia nombres). Acciones inocuas:
- memory: "crea una entidad llamada prueba y lee el grafo"
- everything: "usa echo con 'hola' y get-sum con 2 y 3"
- context7: "busca la documentación de la librería react" (solo lectura)
- fetch: "descarga https://example.com"
- git: "dime el estado del repositorio" (ejecuta en una carpeta vacía con `git init`; con el contenedor sin montar nada puede fallar: es un resultado, anótalo)
Quitar al terminar: `claude mcp remove pt-memory` (y los demás).
Anota también: ¿Claude Code muestra las herramientas desde el inicio o solo al cargarlas?

## Cursor (`%USERPROFILE%\.cursor\mcp.json` o `.cursor\mcp.json` del proyecto)
```json
{
  "mcpServers": {
    "pt-memory": { "command": "docker", "args": ["run","-i","--rm","--memory=3g","--cpus=2","--pids-limit=1024","--security-opt=no-new-privileges","node:22-slim","npx","-y","@modelcontextprotocol/server-memory@2.0.0"] },
    "pt-everything": { "command": "docker", "args": ["run","-i","--rm","--memory=3g","--cpus=2","--pids-limit=1024","--security-opt=no-new-privileges","node:22-slim","npx","-y","@modelcontextprotocol/server-everything@2.0.0"] },
    "pt-context7": { "command": "docker", "args": ["run","-i","--rm","--memory=3g","--cpus=2","--pids-limit=1024","--security-opt=no-new-privileges","node:22-slim","npx","-y","@upstash/context7-mcp@4.4.4"] },
    "pt-fetch": { "command": "docker", "args": ["run","-i","--rm","--memory=3g","--cpus=2","--pids-limit=1024","--security-opt=no-new-privileges","ghcr.io/astral-sh/uv:python3.12-bookworm-slim","uvx","mcp-server-fetch@2026.10.19"] },
    "pt-git": { "command": "docker", "args": ["run","-i","--rm","--memory=3g","--cpus=2","--pids-limit=1024","--security-opt=no-new-privileges","ghcr.io/astral-sh/uv:python3.12-bookworm-slim","sh","-c","apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq git >/dev/null 2>&1 && git init -q /tmp/probe-repo && uvx mcp-server-git@2026.10.19"] }
  }
}
```
Cursor → Settings → MCP: indicador y nº de herramientas. Mismas acciones inocuas. Al terminar, borra las entradas.

## Línea a pegarme por prueba
`cliente | versión | sistema | servidor y versión | comando | estado | nº herramientas | acción inocua (sí/no y resultado) | fecha | inicio-fin`

## Nota 4 nov
Primer intento de `pt-git` con la imagen uv sin git: CONNECTION_CLOSED; causa (stderr): `ImportError: Bad git executable` (la imagen no trae git). Es un resultado válido y se registra. Segundo intento: instalar git dentro del contenedor (como en las pruebas anteriores) e iniciar un repo en /tmp/probe-repo; en el cliente, usar ese repo.
