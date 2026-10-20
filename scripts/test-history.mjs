// Pruebas de la lógica del historial con datos SINTÉTICOS (solo viven aquí, nunca en src/data).
// Ejecutar: node --experimental-strip-types --no-warnings scripts/test-history.mjs
import { baselineFor, daysBetween, diffSnapshots, isEmptyDiff, series, sortedDates } from "../src/lib/history-core.ts";

let failed = 0;
const ok = (name, cond, extra = "") => { if (!cond) failed++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  → " + extra : ""}`); };

const T = (stars, push, lic, cat = "c1") => [stars, push, lic, 0, cat];
const snap = (verifiedAt, tools, excluded = []) => ({ verifiedAt, tools, excluded });
const H = {
  "2026-10-01": snap("2026-10-01T10:00:00Z", { a: T(100, "2026-09-30T00:00:00Z", "MIT"), b: T(90, "2026-09-29T00:00:00Z", "MIT"), old: T(50, "2026-08-01T00:00:00Z", "MIT") }),
  "2026-10-08": snap("2026-10-08T10:00:00Z", { a: T(120, "2026-10-07T00:00:00Z", "MIT"), b: T(150, "2026-10-07T00:00:00Z", "Apache-2.0"), old: T(50, "2026-08-01T00:00:00Z", "MIT") }),
  "2026-10-17": snap("2026-10-17T10:00:00Z", { a: T(121, "2026-10-16T00:00:00Z", "MIT"), b: T(160, "2026-10-16T00:00:00Z", null), n: T(10, "2026-10-16T00:00:00Z", "MIT") }, [{ slug: "old", name: "Old", reason: "inactive", daysSincePush: 77 }]),
};
const dates = sortedDates(H);

ok("fechas ordenadas", JSON.stringify(dates) === JSON.stringify(["2026-10-01", "2026-10-08", "2026-10-17"]));
ok("daysBetween", daysBetween("2026-10-01", "2026-10-17") === 16);
ok("baselineFor 7d: el más reciente igual o anterior a (último-7)", baselineFor(dates, "2026-10-17", 7).date === "2026-10-08" && baselineFor(dates, "2026-10-17", 7).spanDays === 9);
ok("baselineFor 30d sin historia suficiente: primer registro y ventana más corta declarada", baselineFor(dates, "2026-10-17", 30).date === "2026-10-01" && baselineFor(dates, "2026-10-17", 30).spanDays === 16);
ok("baselineFor con un solo registro → null", baselineFor(["2026-10-17"], "2026-10-17", 7).date === null);
ok("baselineFor sin registros → null", baselineFor([], "2026-10-17", 7).date === null);

const order1 = { c1: ["a", "b", "old"] };
const order3 = { c1: ["b", "a", "n"] };
const d = diffSnapshots(H["2026-10-08"], H["2026-10-17"], order1, order3);
ok("entradas: n", JSON.stringify(d.entered) === '["n"]');
ok("salidas con motivo y días", d.left.length === 1 && d.left[0].slug === "old" && d.left[0].reason === "inactive" && d.left[0].daysSincePush === 77);
ok("cambio de licencia detectado (Apache-2.0 → ninguna)", d.licenseChanges.length === 1 && d.licenseChanges[0].slug === "b" && d.licenseChanges[0].from === "Apache-2.0" && d.licenseChanges[0].to === null);
ok("ganancia de estrellas ordenada", d.starGains[0].slug === "b" && d.starGains[0].delta === 10 && d.starGains[1].slug === "a" && d.starGains[1].delta === 1);
ok("movimientos de ranking", d.rankMoves.length === 2 && d.rankMoves.every((m) => (m.slug === "a" && m.from === 1 && m.to === 2) || (m.slug === "b" && m.from === 2 && m.to === 1)));
ok("entrada nueva no cuenta como movimiento ni ganancia", !d.rankMoves.some((m) => m.slug === "n") && !d.starGains.some((g) => g.slug === "n"));
ok("diff de un registro consigo mismo está vacío", isEmptyDiff(diffSnapshots(H["2026-10-17"], H["2026-10-17"], order3, order3)));

const s = series(H, "a", (t) => t[0]);
ok("serie de estrellas con 3 puntos reales", s.length === 3 && s[0].value === 100 && s[2].value === 121);
ok("serie omite registros donde la herramienta no existe", series(H, "n", (t) => t[0]).length === 1);
ok("serie de herramienta inexistente vacía", series(H, "zzz", (t) => t[0]).length === 0);

console.log(failed ? `\n${failed} FALLAN` : "\nTodas las pruebas superadas");
process.exit(failed ? 1 : 0);
