import { ImageResponse } from "next/og";

export const alt = "AgentShortlist: best AI agents, ranked by real signals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.7 }}>AgentShortlist</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          Best AI agents, ranked by real signals.
        </div>
        <div style={{ fontSize: 32, opacity: 0.7, marginTop: 32 }}>
          GitHub stars · recent activity · license
        </div>
      </div>
    ),
    size,
  );
}
