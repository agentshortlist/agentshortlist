import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para el servidor propio (Plesk): STANDALONE=1 npm run build. En Vercel no se activa.
  output: process.env.STANDALONE === "1" ? "standalone" : undefined,
  // Fija la raíz del proyecto: hay un package-lock.json suelto en la carpeta personal que desplazaba la salida.
  outputFileTracingRoot: path.join(__dirname),
  // El CSS de la página (unos 16 KB) se incrusta en el HTML: así no hay una petición que bloquee el primer pintado.
  experimental: { inlineCss: true },
  // www y dominio sin www son la misma web: una sola dirección canónica.
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host" as const, value: "www.agentshortlist.dev" }], destination: "https://agentshortlist.dev/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
