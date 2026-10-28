// Crea una sola vez las dos propiedades de contacto que usa el formulario de la newsletter.
// Uso: RESEND_API_KEY=... node scripts/resend-create-properties.mjs   (la clave no se imprime ni se guarda)
const key = process.env.RESEND_API_KEY;
if (!key) { console.error("Set RESEND_API_KEY in the environment."); process.exit(1); }
for (const prop of ["signup_source", "alerts_interest"]) {
  const res = await fetch("https://api.resend.com/contact-properties", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key: prop, type: "string" }),
  });
  console.log(prop, res.status, res.ok ? "created" : await res.text());
}
