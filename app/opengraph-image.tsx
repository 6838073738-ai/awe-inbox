import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Awe Inbox — one planetary event per day, chosen for its grandeur";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(80% 60% at 30% 20%, #2a2828 0%, #0b0b0c 60%), #0b0b0c",
          padding: "72px 96px",
          fontFamily: "serif",
          color: "#f4efe6",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#b8ae9b",
              fontFamily: "monospace",
            }}
          >
            Awe Inbox
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 980,
              color: "#f4efe6",
            }}
          >
            One planetary event per day, chosen for its grandeur.
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#b8ae9b",
              fontFamily: "monospace",
              marginTop: 18,
            }}
          >
            From NASA EONET · MODIS · GIBS
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
