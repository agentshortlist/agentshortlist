# Guía de pruebas por cliente: Claude Code y Cursor (borrador del 29 oct 2026)

Objetivo: tener pruebas **hechas en un cliente real** (Claude Code y Cursor) de 3 a 5 servidores antes del 13 nov, para poder publicar "Best MCP servers for Claude Code" sin inventar nada. Sin pruebas, ese post no sale (regla de la agenda).

## Qué probar y por qué (sin credenciales reales)
| Servidor | Versión fijada | Imagen | Por qué |
|---|---|---|---|
| server-memory | 2.0.0 | node:22-slim | Ya lo tenemos probado con la sonda; se compara cliente frente a sonda |
| server-everything | 2.0.0 | node:22-slim | Servidor de referencia para clientes: lista de herramientas completa |
| mcp-server-fetch | 2026.10.19 | uv + Python 3.12 | Un servidor de red; ver qué muestra el cliente |
| context7 | 4.4.4 | node:22-slim | Uno de los más recomendados en las listas que ocupan la SERP |
| mcp-server-git | 2026.10.19 | uv + git | Cambios de estado de repositorio; probar con un repositorio vacío |

Se dejan fuera Playwright (necesita navegador) y los que piden cuentas o claves de terceros.

## Cómo aislarlo (sin ejecutar código de terceros directamente en tu equipo)
Lanza cada servidor **dentro de Docker** desde la configuración del cliente: el cliente habla con el contenedor por stdio (`docker run -i --rm ...`). Mismas condiciones que las pruebas anteriores: sin credenciales, sin montar carpetas personales, límites de recursos.
Ejemplo (node): `docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges node:22-slim npx -y @modelcontextprotocol/server-memory@2.0.0`
Ejemplo (uv): `docker run -i --rm --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges ghcr.io/astral-sh/uv:python3.12-bookworm-slim uvx mcp-server-fetch@2026.10.19`
**Máquina elegida (29 oct): la de Windows** (i7, 32 GB). Motivos: es la que tiene Docker (en el Mac M1 Pro no hay), usa las mismas imágenes amd64 que las pruebas anteriores (en el Mac serían arm64 y algunos binarios cambiarían) y tiene más memoria. Hace falta instalar allí Claude Code y Cursor si no están.

## Claude Code
1. Anota la versión: `claude --version` y el sistema operativo.
2. Añade el servidor: `claude mcp add <nombre> -- docker run -i --rm ... <comando del servidor>` (alcance de proyecto o de usuario; anótalo).
3. Dentro de una sesión, `/mcp`: debe aparecer como conectado. Anota el estado y cuántas herramientas lista el cliente; copia los nombres.
4. Pídele al cliente una acción **inocua con datos sintéticos** (por ejemplo, con memory: crear una entidad "prueba"; con fetch: pedir una página pública de ejemplo). Anota si la herramienta se invocó y qué devolvió, sin copiar datos personales.
5. Quita el servidor al terminar: `claude mcp remove <nombre>`.

## Cursor
1. Anota la versión (Cursor → About) y el sistema operativo.
2. Añade el servidor en `.cursor/mcp.json` del proyecto (o el global) con `"command": "docker"` y `"args": ["run","-i","--rm", ..., "<imagen>", ...]`.
3. En Settings → MCP debe verse el servidor con indicador de conectado y el número de herramientas. Anota ambos y los nombres.
4. Lanza la misma acción inocua que en Claude Code y anota el resultado.
5. Quita el servidor del archivo al terminar.

## Un dato más a anotar en Claude Code (comentario de un lector, 29 oct)
Un lector indicó que Claude Code carga las definiciones de herramientas de forma diferida, y que eso cambia cuándo cuesta una descripción que varía. No lo hemos medido. Al hacer las pruebas, anotar si el cliente muestra las herramientas del servidor desde el principio de la sesión o solo cuando se piden (y cómo se ve en `/mcp`), sin sacar conclusiones sobre caché.

## Qué anotar por prueba (una línea; me la pegas y yo escribo el registro)
`cliente | versión del cliente | sistema | servidor y versión | comando completo | estado (conectado o error) | nº de herramientas que muestra | acción inocua (sí/no y resultado) | fecha | hora de inicio y de fin`
Con las horas se mide también el tiempo humano por prueba.

## Reglas
- Nada de credenciales reales, carpetas personales ni datos reales.
- Una configuración por servidor y cliente; si algo falla, se anota el error tal cual (un fallo es un resultado).
- No se afirma que un servidor "funciona en Claude Code" hasta tener esta línea anotada con su versión.
- Cada registro llevará la versión exacta del cliente y de cada servidor, y la fecha.

## Calendario
Hacer la mitad (Claude Code) antes del 6 nov y Cursor antes del 11 nov; el post del 13 nov solo sale con al menos 3 servidores probados en cada cliente.
