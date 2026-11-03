# Segundo tuit del hilo y respuestas con datos (2 nov)

Reglas: respuestas solo donde alguien ya hable de MCP y el dato aporte; sin mencionar personas ni proyectos con @; tono llano, sin imitar IA; si preguntan si es IA, no negarlo. Publicas tú.

## Segundo tuit del hilo del Radar #2 (232 caracteres con el enlace como 23)

Every test record behind this edition is open data: 33 runs of 24 MCP servers, with the exact version, the start command, the environment and a hash of the tool list. JSON and CSV, free to reuse with credit.

https://agentshortlist.dev/data

## Respuesta A: cuando hablen de vigilar o fijar versiones de servidores MCP (253)

If you watch MCP servers by hashing tools/list: the hash can change between runs of the same version with no code change. A Docker container ID in one description did it for us. Compare hashes from the same environment.

Data: https://agentshortlist.dev/blog/10-mcp-servers-in-docker-what-their-tool-lists-tell-you

## Respuesta B: cuando hablen de modo solo lectura (270)

Read-only flags are not all equal. MongoDB MCP with --readOnly lists 18 tools instead of 27, Grafana with --disable-write lists 62 instead of 79. Blender safe mode and ClickHouse write-off list the same tools, so the limit lives elsewhere.

Data: https://agentshortlist.dev/data

## Respuesta C: cuando hablen de escáneres de tool poisoning o de herramientas que leen solo las definiciones (255)

Same tool list, different security status: DBHub 0.22.5 and 0.22.6 announce byte-identical tools, but only 0.22.6 has the fix for a high-severity read-only bypass. A scanner that reads only tool definitions cannot tell them apart.

https://agentshortlist.dev/blog/dbhub-same-tool-list-different-security-status

## Notas
- Cifras verificadas en los registros (tests.ts): MongoDB 27 a 18, Grafana 79 a 62, Blender y ClickHouse sin cambio; 33 registros de 24 servidores; DBHub 0.22.5/0.22.6 con el mismo hash.
- Máximo 2 etiquetas: #MCP en el principal si quieres.
