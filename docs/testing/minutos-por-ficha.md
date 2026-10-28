# Minutos por ficha (medición, desde el 25 oct 2026)

La hoja de ruta definitiva pide medir cuánto cuesta mantener cada ficha en "Probado", para decidir si ampliar. Hay dos tiempos: el de máquina (lo mide el script) y el humano (hay que anotarlo).

## Lote 3 (25 oct, 19:06 a 19:24, unos 18 minutos en total, sin supervisión)
Tiempo de máquina por prueba, tomado de las horas de la consola y del propio registro de cada prueba. Una pasada, salvo donde se indica.

| Ficha (paquete) | Resultado | Segundos de máquina |
|---|---|---|
| server-memory, con llamada | pasa | 3 |
| server-everything, con llamada | pasa | 9 |
| mcp-server-git, con llamada | pasa | 21 |
| mcp-server-fetch, con llamada | pasa | 23 |
| kubernetes-mcp-server | no arrancó con el comando usado (mostró su ayuda); se repite en el lote 3b | 241 |
| mcp-server-kubernetes | pasa, dos pasadas idénticas | 72 y 64 |
| browser-tools-mcp | pasa, dos pasadas idénticas | 29 y 29 |
| context-mode | pasa, dos pasadas idénticas | 17 y 17 |
| n8n-mcp | pasa, dos pasadas idénticas | 15 y 14 |
| mongodb-mcp-server | pasa, dos pasadas idénticas | 66 y 71 |
| motherduck-mcp-server | falló por el comando (faltaba `--read-write`); se repite en el lote 3b | 257 |
| redis-mcp-server | pasa, dos pasadas idénticas | 24 y 22 |
| mcp-server-qdrant | pasa, dos pasadas idénticas | 34 y 16 |

## Lectura
- Una prueba de arranque, handshake y lista de herramientas cuesta entre 3 y 72 segundos de máquina cuando todo va bien. Lo caro son los fallos que esperan al límite de 240 s (dos de las trece pruebas, por un comando equivocado mío).
- Con el script único y desatendido, **el tiempo humano de un lote entero es de unos minutos** (copiar archivos, lanzar, subir el resultado). El coste real no es la ejecución sino **verificar el comando de arranque de cada servidor** y **escribir y revisar el registro**.
- Falta medir esos dos tiempos humanos por ficha: verificar el comando y revisar el registro. Pendiente de anotar con un cronómetro en el próximo lote.

## Lote 3b (25 oct, 19:40 a 19:42, unos 2 minutos, sin supervisión)
| Ficha (paquete) | Resultado | Segundos de máquina |
|---|---|---|
| mcp-server-motherduck, con `--read-write` | pasa, dos pasadas idénticas | 7 y 7 |
| kubernetes-mcp-server, con kubeconfig inventado | pasa, dos pasadas idénticas | 3 y 3 |

Los dos fallos del lote 3 eran del comando, no de los servidores: cada uno costó 4 minutos de máquina esperando al límite de 240 s. Una comprobación previa del comando (ayuda del servidor o su README) habría evitado esos 8 minutos y la repetición.

## MongoDB con y sin `--readOnly` (26 oct, 08:2x, unos 5 minutos, sin supervisión)
| Ficha (paquete) | Resultado | Segundos de máquina |
|---|---|---|
| mongodb-mcp-server 3.1.0, por defecto | pasa, 27 herramientas, dos pasadas idénticas | 85 y 48 |
| mongodb-mcp-server 3.1.0, `--readOnly` | pasa, 18 herramientas, dos pasadas idénticas | 50 y 48 |

La primera pasada fue la más lenta (85 s frente a unos 48 s en las demás). Probablemente por la descarga de imágenes y paquetes, pero no lo hemos verificado.

## Lo que sigue sin medirse: tiempo humano por ficha
No puedo cronometrar tu tiempo ni el mío entre mensajes; si no se anota, no existe como dato. Propuesta para el lote 4, sin añadir trabajo: apuntar en una línea por ficha tres horas (mejor con la hora del mensaje en el chat):
1. Inicio de la verificación del comando de arranque (README del servidor).
2. Comando validado.
3. Registro revisado y pegado en `tests.ts`.

Con eso sale "minutos de verificación + minutos de revisión" por ficha. Hasta entonces, la cifra honesta es: **máquina, 3 a 85 segundos por ficha; humano, sin medir**.
