# Lote 2: experimento de versiones consecutivas con `tools/list` idéntico

Preparado: 25 oct 2026 (para el lunes 26 oct). Todo en Docker en la máquina Windows, sin credenciales, datos sintéticos, sin montar carpetas personales (solo `C:\probe`).

## Qué se quiere demostrar
Dos capas de riesgo distintas: los avisos de seguridad (OSV) dicen que una versión está afectada; el `tools/list` dice qué anuncia el servidor a la IA. Si dos versiones consecutivas, una afectada y otra corregida, anuncian exactamente lo mismo, un escáner que solo mire descripciones no puede distinguirlas, y los avisos OSV sí. Se publica el resultado salga como salga.

## Comprobado hoy con datos reales (registro npm y PyPI)

| Par | Publicadas | Advisory (según nuestro `advisories.json`, fuente OSV) | Qué cambia en el paquete |
|---|---|---|---|
| `@bytebase/dbhub` 0.22.5 → 0.22.6 | 2026-06-24 04:22 y 07:34 UTC (3 h de diferencia) | GHSA-mwwr-p57h-56pf (el modo solo lectura no impedía escrituras): afecta a 0.22.5, corregido en 0.22.6 | Cambia el código de los conectores (PostgreSQL, MySQL, MariaDB, SQLite, SQL Server): aparecen `BEGIN READ ONLY`, `START TRANSACTION READ ONLY`, `PRAGMA query_only`. En una comparación textual del código no cambia ninguna línea con `description`, `inputSchema` ni `registerTool`. |
| `mysql-mcp-server` 0.4.1 → 0.4.2 (PyPI) | ambas existen (última: 0.4.4) | GHSA-rqfv-2mw9-78g2 / PYSEC-2026-4109: sin validación de Origin/Host en el transporte SSE; corregido en 0.4.2 | Solo `server.py`: protección contra DNS rebinding en el transporte SSE. Las definiciones de herramientas del modo stdio no cambian en la comparación textual. |

Ojo: la comparación textual es una **predicción**, no la medida. La medida es lo que anuncie `tools/list` el lunes. Si el resultado la contradice, se publica la medida.

### Por qué el par principal es dbhub
- Es el par que ya teníamos acordado y el advisory cae justo entre las dos versiones (un parche de 3 horas).
- Se arranca sin datos propios: dbhub tiene `--demo` (SQLite en memoria con una base de empleados de ejemplo). Está en las dos versiones.
- mysql-mcp-server es el segundo caso y se ejecuta por defecto (`-SoloDbhub` lo omite): su arreglo solo toca SSE, así que con stdio la diferencia entre versiones puede no tener efecto observable; sirve de segundo caso. Necesita variables `MYSQL_*` (se pasan sintéticas; no hay base de datos detrás). Para uvx el ejecutable se llama `mysql_mcp_server`, por eso se usa `uvx --from mysql-mcp-server==X mysql_mcp_server`.
- Nota: la ficha de dbhub revisa una versión anterior; la última es 1.5.0 (9 oct 2026). El experimento compara dos parches antiguos a propósito, no la versión actual.

## Cómo se hace una sola variable cada vez
- **Mismo entorno:** mismo contenedor base (`node:22-slim`), mismo procedimiento, mismo comando salvo la versión, **hostname fijo** (`--hostname=probe-host`).
- **Intercalado:** 0.22.5, 0.22.6, 0.22.5, 0.22.6 (así una deriva del entorno afecta a las dos).
- **Control de determinismo:** cada versión se ejecuta dos veces. Si 0.22.5 contra 0.22.5 ya sale distinto, la diferencia es del entorno, no de la versión, y no se concluye nada sobre el cambio de versión.
- **Hallazgo de Desktop Commander:** una descripción puede incrustar el ID del contenedor (12 caracteres hexadecimales). Con hostname fijo no debería pasar. Si aun así aparece algo parecido, `tools-diff.mjs --normalize` sustituye esas cadenas por `<ID12>` y recalcula los hashes. El script ya genera esa comparación (`DIFF-dbhub-0.22.5-vs-0.22.6-normalized.txt`). Regla: el resultado normalizado se publica **diciendo** que está normalizado y qué se sustituyó, junto al bruto.
- `tools-diff.mjs` compara herramientas añadidas o quitadas, descripciones, esquemas y los tres sha256. Para cada descripción distinta imprime dónde empieza la diferencia.

## Cómo ejecutarlo (PowerShell, `C:\probe`)
**Copiar** a `C:\probe`, respetando las carpetas (si ya existen, reemplazar):
- `scripts\mcp-probe.mjs` y `scripts\tools-diff.mjs` (este último es nuevo: acepta `--normalize`)
- `run-lote-2.ps1` (junto a la carpeta `scripts`, no dentro)

**Antes:** Docker Desktop abierto y en marcha (icono de la ballena sin avisos). No hace falta tener Node instalado.

**Ejecutar** (un único comando; tarda unos minutos porque descarga imágenes y paquetes):
```powershell
cd C:\probe
powershell -ExecutionPolicy Bypass -File .\run-lote-2.ps1
```
Hace 8 ejecuciones (dbhub 0.22.5 y 0.22.6, y mysql-mcp-server 0.4.1 y 0.4.2, cada una dos veces) y 8 comparaciones. Para solo dbhub: añade `-SoloDbhub`.

**Pegar de vuelta:** el contenido completo de `C:\probe\out\lote2\TODO.txt` (o súbelo como archivo). Contiene cada ejecución y cada comparación, incluidas las de control. Antes de publicar, revisamos que no haya rutas ni secretos.

Si algo falla: pega lo que salga en la ventana de PowerShell. Un servidor que no arranque se anota como "no arranca", no se reintenta con credenciales reales.

## Cómo se interpreta (se decide antes de ver el resultado)
| Resultado | Qué significa | Qué se publica |
|---|---|---|
| Controles idénticos y 0.22.5 = 0.22.6 en descripciones, esquemas y conjunto | El `tools/list` no distingue la versión afectada de la corregida; solo la capa de avisos lo hace | Los tres hashes y la tabla de advisories |
| Controles idénticos y 0.22.5 ≠ 0.22.6 | Cambió lo que se anuncia entre versiones | La diferencia exacta de `tools-diff` |
| Control distinto | Hay una fuente de variación del entorno | La causa si se identifica (con `--normalize`), o "no concluyente" |
| Un servidor no arranca | Se anota "no arranca" con la causa | Nada más sobre ese par |

Qué **no** demuestra: que el escáner de un tercero dé el mismo veredicto (eso lo medirá su servicio), ni que la corrección de solo lectura funcione (el modo `--demo` no ejecuta herramientas; la sonda solo pide `tools/list`).

## Lo que no se hace
- No se llama a ninguna herramienta, ni siquiera `execute_sql`.
- No se pasan credenciales reales; las variables de MySQL son inventadas.
- No se cita a terceros por su nombre en ningún texto público sin su permiso.
