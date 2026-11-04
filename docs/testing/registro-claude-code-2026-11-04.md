# Pruebas en Claude Code, 4 nov 2026 (registros; servidores de prueba retirados)

Cliente: Claude Code **2.1.318** (el `mcp list` inicial se hizo con 2.1.312; se actualizó solo al abrir). Modelo de la sesión: Sonnet 5.5, plan Claude Pro. Sistema: Windows 11 Pro 26H2 (compilación 26300.9711), Docker 29.9.2. Alcance: configuración local, proyecto `C:/Users/anton`. Modo de permisos: **auto mode on** (sin preguntas de permiso). Contenedores con `--memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges`.
Pendiente de la pantalla: aparecía "Update installed · Restart to update" (hay otra versión posterior ya instalada).

| Servidor y versión | Estado en /mcp | Herramientas | Acción inocua | Resultado | Hora (fin) |
|---|---|---|---|---|---|
| server-memory 2.0.0 | conectado | 9 | crear entidad y leer grafo | 2 llamadas; entidad `prueba` (tipo `test`, sin observaciones), sin relaciones | 8:23 |
| server-everything 2.0.0 | conectado | 20 | echo y get-sum | 2 llamadas; "Echo: hola"; "The sum of 2 and 3 is 5." | 8:24 |
| context7-mcp 4.4.4 | conectado | 2 | buscar documentación de react | 2 llamadas; resolvió `/reactjs/react.dev` y consultó conceptos básicos | 8:25 |
| mcp-server-fetch 2026.10.19 | conectado | 1 | descargar example.com | 1 llamada; devolvió "Example Domain" | 8:25 |
| mcp-server-git 2026.10.19 (con git instalado en el contenedor) | conectado | 12 | estado de /tmp/probe-repo | 1 llamada; rama master, sin commits ni cambios | 8:25 |

Primer intento de git (imagen uv sin git): CONNECTION_CLOSED; stderr `ImportError: Bad git executable`.
Hallazgo: everything lista 20 en Claude Code frente a 16 (initialize) y 22 (server/discover); el código registra herramientas según capacidades del cliente (roots, elicitation, sampling).
Límites: el cliente indica "Called X n times" (evidencia del cliente); el texto del resultado es la narración del modelo.
