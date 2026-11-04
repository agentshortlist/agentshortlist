# Pruebas en Cursor, 4 nov 2026 (registros; faltan horas de Cursor)

Cliente: Cursor **3.28.7 (user setup)**, modo Agent, configuración de usuario `C:\Users\anton\.cursor\mcp.json`. Sistema: Windows 11 Pro 26H2 (compilación 26300.9711), Docker 29.9.2. Mismos comandos y límites de contenedor que en Claude Code (git con `git` instalado dentro del contenedor).

| Servidor y versión | Estado | Herramientas (recursos) | Acción inocua | Resultado (narración del chat) | ¿Pidió permiso? | Hora |
|---|---|---|---|---|---|---|
| server-memory 2.0.0 | conectado | 9 (1 recurso) | crear entidad y leer grafo | entidad `prueba` tipo `test` con una observación; sin relaciones | sí, pidió permiso | por confirmar |
| server-everything 2.0.0 | conectado | 19 (7 recursos) | echo y get-sum | "Echo: hola"; "The sum of 2 and 3 is 5." | sí, pidió permiso | por confirmar |
| context7-mcp 4.4.4 | conectado | 2 | documentación de react | `/reactjs/react.dev` (reputación alta, puntuación 86.22, ~4.412 fragmentos) | sí, pidió permiso | por confirmar |
| mcp-server-fetch 2026.10.19 | conectado | 1 | descargar example.com | "Example Domain" | sí, pidió permiso | por confirmar |
| mcp-server-git 2026.10.19 | conectado | 12 | estado de /tmp/probe-repo | rama master, sin commits, árbol limpio | sí, pidió permiso | por confirmar |

Hallazgo: everything lista **19** en Cursor frente a **20** en Claude Code 2.1.318 y 16 (initialize) / 22 (server/discover) en nuestra sonda. Cursor no lista `trigger-url-elicitation`. Coherente con el código del servidor 2.0.0 (herramientas según capacidades del cliente: roots, elicitation form, elicitation url, sampling); lo que declara cada cliente es una deducción, no una medición.
Contraste con Claude Code: Cursor pidió permiso en las cinco acciones; Claude Code iba en auto mode y no preguntó.
Límite: el texto pegado es la narración del modelo; falta la evidencia de la llamada en la interfaz (indicador de herramienta usada).
