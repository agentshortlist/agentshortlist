// Stripe simulado SOLO para pruebas locales (se usa con STRIPE_API_BASE=http://localhost:4010).
// No contiene ni usa claves reales. Guarda las peticiones recibidas en MOCK_LOG para poder comprobarlas.
import { createServer } from "node:http";
import { appendFileSync, writeFileSync, existsSync, readFileSync } from "node:fs";

const PORT = Number(process.env.MOCK_PORT ?? 4010);
const LOG = process.env.MOCK_LOG ?? "/tmp/mock-stripe.log.jsonl";
const STATE = process.env.MOCK_STATE ?? "/tmp/mock-stripe.state.json";
writeFileSync(LOG, "");
if (!existsSync(STATE)) writeFileSync(STATE, JSON.stringify({ subscriptions: [] }));

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    appendFileSync(LOG, JSON.stringify({ method: req.method, path: url.pathname, query: url.search, auth: (req.headers.authorization ?? "").slice(0, 12), body }) + "\n");
    const json = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
    const state = JSON.parse(readFileSync(STATE, "utf8"));
    if (req.method === "GET" && url.pathname === "/v1/subscriptions") return json(200, { object: "list", data: state.subscriptions });
    if (req.method === "POST" && url.pathname.startsWith("/v1/subscriptions/")) return json(200, { id: url.pathname.split("/").pop(), object: "subscription" });
    if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") return json(200, { id: "cs_test_mock", url: "https://checkout.stripe.test/c/pay/cs_test_mock" });
    if (req.method === "GET" && url.pathname === "/v1/prices/price_f") return json(200, { unit_amount: 4900, currency: "usd", recurring: { interval: "month" } });
    if (req.method === "GET" && url.pathname === "/v1/prices/price_n") return json(200, { unit_amount: 9900, currency: "usd", recurring: null });
    json(404, { error: { message: "not found" } });
  });
}).listen(PORT, () => console.log(`mock stripe on :${PORT}`));
