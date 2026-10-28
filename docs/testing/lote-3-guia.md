# Lote 3: llamada inocua y nueve fichas nuevas, para dejar corriendo de noche

Preparado: 25 oct 2026. Todo en Docker, sin credenciales, sin montar carpetas personales (solo `C:\probe`), con datos sintéticos y límites de memoria, CPU y procesos por contenedor.

## Qué hace el script
**A. Llamada inocua (una pasada).** Arranca cada servidor, lista sus herramientas y llama a algunas con datos de prueba.

| Servidor | Llamadas |
|---|---|
| server-memory | `create_entities` (una entidad de prueba) y `read_graph` |
| server-everything | `echo` y `get-sum` |
| mcp-server-git | `git_status` en un repositorio vacío creado dentro del contenedor |
| mcp-server-fetch | `fetch` de `https://example.com` (la única llamada que sale a internet) |

**B. Nueve fichas nuevas (dos pasadas cada una, la segunda solo si la primera hizo handshake).** Solo `tools/list`, sin llamadas.

| Ficha | Paquete y versión | Comando |
|---|---|---|
| kubernetes-mcp-server | `kubernetes-mcp-server@0.0.69` | `npx -y` |
| mcp-server-kubernetes | `mcp-server-kubernetes@4.1.9` | `npx -y` |
| browser-tools-mcp | `@agentdeskai/browser-tools-mcp@2.0.2` | `npx -y` |
| context-mode | `context-mode@1.0.169` | `npx -y` |
| n8n-mcp | `n8n-mcp@2.99.1` | `npx -y`, con `MCP_MODE=stdio` |
| mongodb-mcp-server | `mongodb-mcp-server@3.1.0` | `npx -y` |
| motherduck-mcp-server | `mcp-server-motherduck@1.1.0` | `uvx ... --db-path :memory:` |
| redis-mcp-server | `redis-mcp-server@0.5.1` | `uvx ... --url redis://127.0.0.1:6379/0` (no hay ningún Redis detrás) |
| qdrant-mcp-server | `mcp-server-qdrant@0.8.1` | `uvx`, con `QDRANT_LOCAL_PATH` y `COLLECTION_NAME` de prueba |

Versiones consultadas en npm y PyPI el 25 oct 2026. Se dejó fuera Serena (no pude verificar su comando de arranque) y todo lo que pide clave o cuenta.

**Supuestos sin verificar:** que `MCP_MODE=stdio` sea lo correcto para n8n-mcp, y que cada servidor arranque sin conexión a su base de datos o clúster. Si alguno no arranca, el script lo anota como "no arranca" y sigue; no es un fallo del script.

## Antes de dejarlo (5 minutos)
1. **Copia a `C:\probe`**, reemplazando si ya existen: `scripts\mcp-probe.mjs` (**ha cambiado**: ahora admite llamadas), `scripts\tools-diff.mjs` (el mismo del lote 2) y `run-lote-3.ps1` junto a la carpeta `scripts`, no dentro.
2. **Docker Desktop abierto** y arrancado del todo (el script no hace nada si Docker no está en marcha).
3. **Equipo enchufado.** El script evita que Windows se suspenda mientras corre, pero no impide que lo suspendas tú ni que se cierre la tapa del portátil.
4. **Que no se reinicie por actualizaciones** durante la noche (puedes pausarlas desde Windows Update unos días).
5. **Espacio libre en disco:** unos 10 GB, por imágenes y paquetes.
6. **Anota la hora a la que lo lanzas** y la hora a la que lo compruebas: es el primer dato de minutos reales.

## Cómo se lanza
```powershell
cd C:\probe; powershell -ExecutionPolicy Bypass -File .\run-lote-3.ps1
```
No cierres la ventana de PowerShell. Tiempo máximo: 240 minutos; pasado ese tiempo no empieza pruebas nuevas. Lo esperable es de 1 a 2 horas.

## Si se corta o quieres pararlo
- **Parar:** `Ctrl+C` en la ventana de PowerShell.
- **Reanudar:** vuelve a ejecutar el mismo comando; salta lo ya hecho (marcas `.done` en `out\lote3`).
- **Repetir todo:** borra la carpeta `out\lote3` y lanza de nuevo.

## Qué enviar al terminar
El archivo **`C:\probe\out\lote3\TODO.txt`**, subido como archivo (pesa bastante). Contiene el resumen, los tiempos y la salida de cada prueba. Con `RESUMEN.txt` y `TIEMPOS.csv` basta si no puedes subirlo.

## Qué no demuestra
Que un servidor arranque y liste herramientas no significa que funcione, que sea seguro ni que los límites de solo lectura se cumplan. Las llamadas inocuas demuestran que esa llamada concreta respondió sin error con datos de prueba, nada más.

## Seguridad: lo que sí y lo que no
- **Sí:** sin credenciales, sin carpetas tuyas montadas, datos sintéticos, límites de recursos y `no-new-privileges` en cada contenedor.
- **No:** los contenedores tienen acceso a internet (necesario para instalar los paquetes). Es código de terceros ejecutándose sin que lo mires.
