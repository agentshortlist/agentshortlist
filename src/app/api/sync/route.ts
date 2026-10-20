import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lanza la sincronización diaria (scripts/sync-plesk.sh) cuando una tarea programada llama a esta ruta.
// Solo funciona si existe SYNC_TOKEN en el servidor; sin él responde 404 como si la ruta no existiera.
// Solo ejecuta el script fijado en SYNC_SCRIPT: no acepta ninguna orden desde la petición.
const DEFAULT_SCRIPT = "/var/www/vhosts/agentshortlist.dev/agentrank-src/scripts/sync-plesk.sh";

function sameToken(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function GET(req: Request) {
  const secret = process.env.SYNC_TOKEN;
  if (!secret || secret.length < 24) return new NextResponse("Not found", { status: 404 });

  const given = new URL(req.url).searchParams.get("token") ?? "";
  if (!sameToken(given, secret)) return new NextResponse("Not found", { status: 404 });

  const script = process.env.SYNC_SCRIPT ?? DEFAULT_SCRIPT;
  if (!existsSync(script)) return NextResponse.json({ ok: false, error: "script not found" }, { status: 500 });

  // setsid separa el proceso del de la app: el script reinicia la app al terminar y no debe morir con ella.
  const nodeBin = dirname(process.execPath);
  const setsid = ["/usr/bin/setsid", "/bin/setsid"].find((p) => existsSync(p));
  const [cmd, args] = setsid ? [setsid, ["/bin/bash", script]] : ["/bin/bash", [script]];
  const child = spawn(cmd, args, {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, PATH: `${nodeBin}:${process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin"}` },
  });
  child.on("error", () => {});
  child.unref();

  return NextResponse.json({ ok: true, started: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
