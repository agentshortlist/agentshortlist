# Lote 1 de pruebas: qué se prueba y por qué

Fecha de preparación: 24 oct 2026. Versiones fijadas ese día. Todo en Docker, sin credenciales, sin montar carpetas personales (solo `C:\probe`).

| # | Servidor (ficha) | Paquete y versión | Acceso según la ficha |
|---|---|---|---|
| 1 | Playwright MCP | `@playwright/mcp@0.0.83` | Nada que registrar |
| 2 | Reference servers: memory | `@modelcontextprotocol/server-memory@2.0.0` | Sin verificar (control) |
| 3 | Reference servers: everything | `@modelcontextprotocol/server-everything@2.0.0` | Sin verificar |
| 4 | Context7 | `@upstash/context7-mcp@4.4.4` | Sin verificar (clave recomendada, no obligatoria) |
| 5 | Chrome DevTools MCP | `chrome-devtools-mcp@1.12.0` | Sin verificar |
| 6 | Desktop Commander | `@wonderwhy-er/desktop-commander@0.3.1` | Sin verificar |
| 7 | codebase-memory-mcp | `codebase-memory-mcp@0.12.1` | Nada que registrar |
| 8 | Reference servers: fetch | `mcp-server-fetch@2026.10.19` | Sin verificar |
| 9 | Reference servers: git | `mcp-server-git@2026.10.19` | Sin verificar |
| 10 | Excel MCP server | `excel-mcp-server@2.2.2` (`stdio`) | Nada que registrar |

Elegidos porque arrancan sin clave ni cuenta, tienen mucho uso y cubren paquetes de npm y de PyPI. Los que no arranquen sin credenciales no se prueban con una real: se anota "no arranca sin credenciales".

## Qué puede salir mal (y está bien anotarlo)

- Algunos servidores descargan binarios o navegadores al primer arranque: el límite de la sonda es de 240 s.
- Chrome DevTools MCP y Playwright pueden anunciar sus herramientas sin abrir un navegador, pero si piden uno, el resultado es "no arranca" y se anota.
- La sonda solo demuestra arranque, handshake y lista de herramientas. No demuestra que las herramientas funcionen ni que los límites de solo lectura se cumplan.

## Par para el experimento de versiones consecutivas

Dos parches seguidos con un advisory entre ellos. `@bytebase/dbhub` 0.22.5 contra 0.22.6: el advisory GHSA-mwwr-p57h-56pf (el modo solo lectura no impedía escrituras) afecta a 0.22.5 y se corrigió en 0.22.6. La 0.22.5 ya tiene corregido el otro (GHSA-fm8p-53ww-hf6w).

dbhub necesita una cadena de conexión para arrancar. Con datos sintéticos, la prueba usaría una base SQLite en memoria (`--dsn "sqlite:///:memory:"`): **comando por confirmar el lunes**, porque no he podido comprobar que las versiones 0.22.x aceptan esa cadena. Alternativa: `mysql-mcp-server` 0.4.1 contra 0.4.2, que necesita variables de MySQL (no se usaría una real).

Se publican los hashes de descripciones, esquemas y conjunto, y el resultado de `tools-diff.mjs`, tanto si salen idénticos como si no.
