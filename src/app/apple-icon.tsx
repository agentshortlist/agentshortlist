import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono de Apple y logotipo de la organización: cuadrado sin esquinas (iOS las redondea) con el monograma de la marca.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
          <path d="M15 51 L32 17 L49 51" stroke="#fafafa" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23.5 39 H40.5" stroke="#fafafa" strokeWidth="6" strokeLinecap="round" />
          <circle cx="32" cy="14" r="7.5" fill="#7c9cff" />
        </svg>
      </div>
    ),
    size,
  );
}
