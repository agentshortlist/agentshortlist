// Falso complemento de Blender para la prueba de llamadas. NO ejecuta nada: escucha en el puerto 9876, anota cada orden que le llega
// (tipo y codigo) en un archivo y responde "success". Sirve para ver que scripts cruzan el servidor MCP y llegan hasta el socket de Blender.
// Si un script aparece en el registro, el servidor lo dejo pasar; si no aparece, lo paro antes. Que llegue no significa que sea daninho:
// aqui no hay Blender y no se ejecuta nada.
// Uso: node scripts/fake-blender-socket.mjs <archivo-de-registro> [puerto]
import net from "node:net";
import { appendFileSync, writeFileSync } from "node:fs";
const logFile = process.argv[2] ?? "blender.socket.log";
const port = Number(process.argv[3] ?? 9876);
writeFileSync(logFile, "");
const log = (o) => appendFileSync(logFile, JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
net.createServer((sock) => {
  let buf = "";
  sock.on("data", (d) => {
    buf += d.toString("utf8");
    let msg;
    try { msg = JSON.parse(buf); } catch { return; } // el cliente envia un JSON sin salto de linea: se espera a tenerlo completo
    buf = "";
    log({ type: msg.type, code: msg.params?.code ?? null, params: msg.params?.code ? undefined : msg.params });
    sock.write(JSON.stringify({ status: "success", result: { result: "fake-blender: received, nothing executed" } }));
  });
  sock.on("error", () => {});
}).listen(port, "127.0.0.1", () => log({ event: "listening", port }));
