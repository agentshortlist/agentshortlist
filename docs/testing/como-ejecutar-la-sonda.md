# Cómo ejecutar la sonda MCP (handshake + tools/list)

Qué hace `scripts/mcp-probe.mjs`: arranca un servidor MCP por stdio con un entorno vacío (sin credenciales), hace el `initialize`, pide `tools/list` y imprime un registro JSON para pegar en `src/content/tests.ts`. No llama a ninguna herramienta.

Reglas: se ejecuta dentro de Docker, sin montar carpetas personales ni pasar claves. Si un servidor necesita una clave para arrancar, se anota "no arranca sin credenciales" y no se prueba con una real.

## Windows (PowerShell) o Mac, servidores npm

```bash
docker run --rm -v "${PWD}:/work" -w /work node:22-slim node scripts/mcp-probe.mjs --slug=playwright-mcp --package=@playwright/mcp@0.0.83 --environment="Docker node:22-slim, no credentials" -- npx -y @playwright/mcp@0.0.83
```

En Mac o Linux sustituye `${PWD}` por `$(pwd)`.

## Servidores Python (uvx)

```bash
docker run --rm -v "${PWD}:/work" -w /work ghcr.io/astral-sh/uv:python3.12-bookworm-slim sh -c "apt-get update -qq && apt-get install -y -qq nodejs >/dev/null && node scripts/mcp-probe.mjs --slug=mcp-atlassian --package=mcp-atlassian@latest -- uvx mcp-atlassian"
```

## Qué nos envías

Pega la salida completa (el bloque JSON y la línea de tools). Revisamos que no haya rutas ni secretos y la añadimos a la ficha.

## Límites

La sonda demuestra que el servidor arranca y anuncia sus herramientas. No demuestra que funcionen, ni que los límites de solo lectura se cumplan, ni qué datos salen de la máquina. Eso son pruebas distintas.
