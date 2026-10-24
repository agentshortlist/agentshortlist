// Pruebas que hemos ejecutado nosotros. Cada registro describe una combinación exacta; una ficha sin registros muestra "Tested by us: Not yet".
// Se rellena a mano con el JSON que imprime scripts/mcp-probe.mjs. No se infiere nada: si no hay registro, no hay prueba.
export type ProbeStatus = "pass" | "fail" | "not-run";

export type ProbeRecord = {
  slug: string;
  testedAt: string; // AAAA-MM-DD
  package: string; // paquete y versión exactos, p. ej. "@playwright/mcp@0.0.83"
  client: string; // "mcp-probe" cuando es el script; o Claude Code, Cursor… cuando se prueba en un cliente real
  clientVersion: string;
  os: string; // sistema anfitrión
  environment: string; // p. ej. "Docker node:22-slim, no credentials, synthetic data"
  install: ProbeStatus;
  handshake: ProbeStatus; // initialize respondido con un protocolo válido
  toolsList: { status: ProbeStatus; count: number | null };
  call?: { tool: string; status: ProbeStatus; note: string }; // llamada inocua, solo si se pudo aislar
  notes: string;
};

export const TESTS: ProbeRecord[] = [];

export const testsFor = (slug: string): ProbeRecord[] => TESTS.filter((t) => t.slug === slug).sort((a, b) => b.testedAt.localeCompare(a.testedAt));
