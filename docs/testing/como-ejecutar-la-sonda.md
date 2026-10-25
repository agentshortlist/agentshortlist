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

## Comparar dos versiones del mismo paquete (prueba del caso contrario)

La sonda puede guardar el `tools/list` completo y calcular tres sha256 (descripciones, esquemas y conjunto), con las herramientas ordenadas por nombre y las claves ordenadas. Así se compara una sola variable cada vez.

```bash
docker run --rm -v "${PWD}:/work" -w /work node:22-slim node scripts/mcp-probe.mjs --slug=playwright-mcp --package=@playwright/mcp@0.0.35 --tools-out=out/playwright-0.0.35.json --environment="Docker node:22-slim, no credentials" -- npx -y @playwright/mcp@0.0.35
docker run --rm -v "${PWD}:/work" -w /work node:22-slim node scripts/mcp-probe.mjs --slug=playwright-mcp --package=@playwright/mcp@0.0.83 --tools-out=out/playwright-0.0.83.json --environment="Docker node:22-slim, no credentials" -- npx -y @playwright/mcp@0.0.83
node scripts/tools-diff.mjs out/playwright-0.0.35.json out/playwright-0.0.83.json
```

Crea antes la carpeta `out`. El script de comparación necesita Node 18 o superior en el equipo; si no lo tienes, ejecútalo dentro del mismo contenedor.

Regla: se publica el resultado tanto si las dos versiones difieren como si salen idénticas.
