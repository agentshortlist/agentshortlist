// Sumidero de red para la prueba de telemetria. Corre en un contenedor SIN salida a internet; el servidor MCP que se prueba comparte su red.
// Hace tres cosas y nada mas:
//  1. DNS (UDP 127.0.0.1:53): contesta cualquier nombre con 127.0.0.1 y anota el nombre pedido.
//  2. TCP 443: lee el primer paquete (ClientHello de TLS), anota el nombre del servidor (SNI) y cierra. No completa TLS: no se ve ningun contenido.
//  3. TCP 80: anota metodo, host, ruta y tamano del cuerpo (sin guardar el cuerpo), y contesta 200 vacio.
// Todo lo que el servidor intente contactar por nombre queda en el registro; nada sale al exterior.
// Limite: una conexion directa a una direccion IP (sin consulta DNS) no pasa por aqui; sale por la red del contenedor, que no tiene salida.
// Uso: node scripts/telemetry-sink.mjs <archivo-de-registro>
import dgram from "node:dgram";
import net from "node:net";
import { appendFileSync, writeFileSync } from "node:fs";

const logFile = process.argv[2] ?? "sink.log";
const P = { dns: Number(process.env.SINK_DNS_PORT ?? 53), tls: Number(process.env.SINK_TLS_PORT ?? 443), http: Number(process.env.SINK_HTTP_PORT ?? 80) }; // solo para probarlo fuera de Docker
writeFileSync(logFile, "");
const log = (o) => appendFileSync(logFile, JSON.stringify({ t: new Date().toISOString(), ...o }) + "\n");

// ---- DNS ----
const dns = dgram.createSocket("udp4");
dns.on("message", (msg, rinfo) => {
  try {
    let i = 12;
    const labels = [];
    while (msg[i] !== 0 && i < msg.length) { const l = msg[i]; labels.push(msg.subarray(i + 1, i + 1 + l).toString("ascii")); i += l + 1; }
    const qEnd = i + 1 + 4; // cero final + QTYPE + QCLASS
    const qtype = msg.readUInt16BE(i + 1);
    const name = labels.join(".").toLowerCase();
    log({ kind: "dns", name, qtype: qtype === 1 ? "A" : qtype === 28 ? "AAAA" : String(qtype) });
    const head = Buffer.from(msg.subarray(0, 12));
    head.writeUInt16BE(0x8180, 2); // respuesta, recursion deseada y disponible, sin error
    head.writeUInt16BE(1, 4); // QDCOUNT
    head.writeUInt16BE(qtype === 1 ? 1 : 0, 6); // ANCOUNT: solo respondemos a las A
    head.writeUInt16BE(0, 8); head.writeUInt16BE(0, 10);
    const q = msg.subarray(12, qEnd);
    const parts = [head, q];
    if (qtype === 1) parts.push(Buffer.from([0xc0, 0x0c, 0, 1, 0, 1, 0, 0, 0, 5, 0, 4, 127, 0, 0, 1]));
    dns.send(Buffer.concat(parts), rinfo.port, rinfo.address);
  } catch (e) { log({ kind: "dns-error", error: String(e.message) }); }
});
dns.bind(P.dns, "127.0.0.1");

// ---- TLS: nombre del servidor (SNI) del ClientHello ----
function sniOf(b) {
  try {
    if (b[0] !== 0x16 || b[5] !== 0x01) return null;
    let p = 5 + 4 + 2 + 32; // registro (5) + cabecera de handshake (4) + version (2) + aleatorio (32)
    p += 1 + b[p]; // session id
    p += 2 + b.readUInt16BE(p); // cipher suites
    p += 1 + b[p]; // compresion
    const end = p + 2 + b.readUInt16BE(p); p += 2;
    while (p + 4 <= end) {
      const type = b.readUInt16BE(p), len = b.readUInt16BE(p + 2);
      if (type === 0) { const n = b.readUInt16BE(p + 7); return b.subarray(p + 9, p + 9 + n).toString("ascii").toLowerCase(); }
      p += 4 + len;
    }
  } catch { /* ClientHello incompleto */ }
  return null;
}

net.createServer((s) => {
  s.once("data", (d) => { log({ kind: "tls", sni: sniOf(d), bytes: d.length }); s.destroy(); });
  s.on("error", () => {});
}).listen(P.tls, "::");

net.createServer((s) => {
  let got = "";
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    if (!got) { s.destroy(); return; } // conexion sin datos: no cuenta
    const [head, ...rest] = got.split("\r\n\r\n");
    const lines = head.split("\r\n");
    const [method, path] = (lines[0] ?? "").split(" ");
    const host = (lines.find((l) => /^host:/i.test(l)) ?? "").replace(/^host:\s*/i, "");
    log({ kind: "http", method, host, path, bodyBytes: Buffer.byteLength(rest.join("\r\n\r\n")) });
    s.end("HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
  };
  s.on("data", (d) => { got += d.toString("latin1"); if (got.includes("\r\n\r\n")) setTimeout(finish, 150); });
  s.on("end", finish);
  s.on("error", () => {});
}).listen(P.http, "::");

log({ kind: "ready" });
console.log("SINK READY");
setInterval(() => {}, 1 << 30);
