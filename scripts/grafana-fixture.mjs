// Apoyo de la prueba de llamadas de Grafana. Habla con el Grafana DESECHABLE de la red aislada (usuario admin de prueba, sin puertos publicados).
// Uso: node scripts/grafana-fixture.mjs wait|setup|reset|state <url> <contrasena-admin>
//   wait   espera a que Grafana responda
//   setup  crea la cuenta de servicio (rol Admin) y su token; imprime una ultima linea TOKEN=...
//   reset  deja solo la carpeta "probe-victim" (borra el resto de carpetas)
//   state  lista las carpetas actuales (uid y titulo)
const [mode, base, pass] = process.argv.slice(2);
const auth = "Basic " + Buffer.from("admin:" + pass).toString("base64");
const api = async (method, path, body) => {
  const r = await fetch(base + path, { method, headers: { Authorization: auth, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text };
};
if (mode === "wait") {
  for (let i = 0; i < 60; i++) { try { const r = await fetch(base + "/api/health"); if (r.ok) { console.log("grafana ready"); process.exit(0); } } catch {} await new Promise((r) => setTimeout(r, 2000)); }
  console.log("grafana not ready"); process.exit(1);
}
if (mode === "setup") {
  const sa = await api("POST", "/api/serviceaccounts", { name: "probe-sa", role: "Admin" });
  const tk = await api("POST", `/api/serviceaccounts/${sa.json?.id}/tokens`, { name: "probe-token" });
  if (!tk.json?.key) { console.log("no se pudo crear el token:", sa.status, tk.status, tk.text.slice(0, 200)); process.exit(1); }
  console.log("TOKEN=" + tk.json.key);
}
if (mode === "reset" || mode === "setup") {
  const list = await api("GET", "/api/folders");
  for (const f of list.json ?? []) await api("DELETE", `/api/folders/${f.uid}`);
  await api("POST", "/api/folders", { title: "probe-victim", uid: "probe-victim" });
}
if (mode === "state") {
  const list = await api("GET", "/api/folders");
  console.log("folders: " + ((list.json ?? []).map((f) => `${f.uid}:${f.title}`).sort().join(", ") || "(none)"));
}
