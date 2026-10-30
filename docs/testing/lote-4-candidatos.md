# Lote 4: candidatos y comandos (borrador del 28 oct 2026)

Estado (actualizado el 28 oct): **validación corta (lote 4a) hecha: los 6 comandos arrancaron y listaron herramientas en una pasada.** Resultados abajo. Falta el lote completo (`run-lote-4.ps1`: dos pasadas, con y sin flags, prueba pareada). Docker no está en el Mac: el lote se ejecuta en la máquina Windows. Lección del lote 3: antes de la prueba larga, ejecutar `--help` o comprobar el arranque con un límite corto; los fallos por comando equivocado costaron 4 minutos de máquina cada uno.

Criterio: servidores sin credenciales reales (sin cuenta, o con datos de relleno que no tocan ningún servicio). Mismas condiciones que antes: Docker, límites de recursos, hostname fijo, sin montar carpetas personales, dos pasadas, `--record-out` y `--tools-out`.

## A. Se pueden probar sin credenciales (prioridad)
| Ficha | Paquete verificado en el registro | Comando propuesto (a validar) | Riesgo de que no arranque |
|---|---|---|---|
| serena | PyPI `serena-agent` 2.1.0 | `uv tool install serena-agent` y arrancar con el comando de servidor MCP de su README (no figura en la línea que he leído: **validar con `--help`**) | Medio: necesita proyecto o carpeta de trabajo; usar una carpeta vacía dentro del contenedor |
| blender-mcp | PyPI `mcp-for-blender` 2.2.4 (`blender-mcp` 2.0.0 es solo un alias) | `BLENDER_MCP_SAFE_MODE=1 DISABLE_TELEMETRY=true uvx mcp-for-blender` | Medio: puede esperar al complemento de Blender para el socket; el `tools/list` debería responder igualmente |
| grafana-mcp-server | PyPI `mcp-grafana` 2.1.1 | `GRAFANA_URL=http://localhost:3000 GRAFANA_SERVICE_ACCOUNT_TOKEN=<relleno> uvx mcp-grafana --disable-write` (stdio por defecto) | Bajo a medio: puede intentar conectar al arrancar; el token es de relleno etiquetado |
| clickhouse-mcp-server | PyPI `mcp-clickhouse` 0.7.0 | `uvx mcp-clickhouse` con `CLICKHOUSE_HOST`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` de relleno y `CLICKHOUSE_ALLOW_WRITE_ACCESS=false` | Medio: puede comprobar la conexión al arrancar (probar con y sin esa variable) |
| mcp-toolbox-for-databases | npm `@toolbox-sdk/server` 1.15.0 (`toolbox`) | `npx @toolbox-sdk/server --prebuilt=<base> --stdio` con una base SQLite local vacía; validar qué `--prebuilt` admite sqlite | Medio: **validar con `--help`** |
| talk-to-figma-mcp | npm `cursor-talk-to-figma-mcp` 0.3.5 | `bunx cursor-talk-to-figma-mcp@latest` en una imagen con Bun | Medio: el README exige un servidor WebSocket aparte; ver si el MCP lista herramientas sin él |

## B. Se pueden pero con más trabajo (después)
- **home-assistant-mcp-server** (`ha-mcp` 8.7.0 en PyPI): el README lo presenta como servidor HTTP, no stdio. Hay que ver si ofrece modo stdio.
- **mcp-context-forge**, **prest**, **data-api-builder**, **graphjin**: servicios más pesados o con otra instalación (binarios, .NET, bases de datos). Aparcados.
- **mcp-inspector**: es una herramienta de depuración con interfaz, no un servidor que liste herramientas; probablemente no encaja con la sonda.
- **exa**, **firecrawl**: remoto o con llave; entran en el lote 5.

## C. Lote 5 (clave de relleno, etiquetada, decisión del 25 oct)
Servidores que piden un token de un tercero pero solo hace falta que arranquen y listen herramientas: github-mcp-server, notion-mcp-server, tavily-mcp, perplexity-mcp-server, stripe-agent-toolkit, framelink-mcp-for-figma y similares. **No** se usa ninguna credencial real; el valor es de relleno y queda declarado en el registro. Pendiente de definir comandos.

## Qué añadir al lote 4 por las ideas de la comunidad (28 oct)
1. Registrar el **comando de arranque exacto** (campo nuevo) en cada registro.
2. Para los servidores cuya lista dependa de la configuración, ejecutar **con y sin** la variable o flag (por ejemplo `CLICKHOUSE_ALLOW_WRITE_ACCESS`, `--disable-write`).
3. **Prueba pareada con un servidor sintético**: dos casos, uno que cambia solo un ID de contenedor y otro que cambia el destino permitido, para validar la normalización.
4. Anotar las tres horas por ficha (inicio de verificación, comando validado, registro revisado).

## Siguiente paso
Validar comando a comando con una pasada corta de `--help` (en Docker, en Windows) antes de lanzar el script del lote. Si el propietario quiere, preparo `run-lote-4a.ps1` con una primera pasada **solo de ayuda y arranque corto** (menos de 10 minutos) para confirmar los comandos, y después el script completo.

## Resultado del lote 4a (28 oct, una pasada por servidor, 11:42 a 11:45, unos 3 minutos de máquina)
| Ficha | Paquete | Resultado | Herramientas | Observaciones |
|---|---|---|---|---|
| serena | serena-agent 2.1.0 | pasa | 3 (`activate_project`, `initial_instructions`, `serena_repl`) | El comando es `serena start-mcp-server`. Sin proyecto activo: la lista puede ampliarse al activar uno (no probado) |
| blender-mcp | mcp-for-blender 2.2.4 | pasa | 9 | Con modo seguro y sin telemetría. Incluye `execute_blender_code`. No necesitó Blender para listar |
| grafana-mcp-server | mcp-grafana 2.1.1 | pasa | 62 | Con `--disable-write` y token de relleno; el binario real es Go dentro del paquete PyPI. Su ayuda lista decenas de `--disable-*` |
| clickhouse-mcp-server | mcp-clickhouse 0.7.0 | pasa | 3 (`list_databases`, `list_tables`, `run_query`) | Con escritura desactivada. Su registro de arranque muestra una petición GET a pypi.org (comprobación de actualizaciones de FastMCP): dato para el post de telemetría |
| mcp-toolbox-for-databases | @toolbox-sdk/server 1.15.0 | pasa | 2 (`execute_sql`, `list_tables`) | Con `--prebuilt=sqlite --stdio`; la ayuda lista decenas de fuentes preconstruidas |
| talk-to-figma-mcp | cursor-talk-to-figma-mcp 0.3.5 | pasa | 40 | Necesita Bun. Reintenta cada 2 s conectar a `ws://localhost:3055` (no existe) y aun así lista herramientas |

Qué falta: la segunda pasada de cada uno (en el lote completo) y las variantes con y sin flag. **Todavía no hay registros en `tests.ts` para estos seis**: un solo run no cumple nuestra regla de dos pasadas.
