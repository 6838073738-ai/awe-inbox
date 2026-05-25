import { ImageResponse } from "next/og";
import { getCuratedFeed } from "@/lib/curation";
import { reflections, categoryTitle } from "@/lib/reflections";

export const runtime = "nodejs"; // need access to cities.json + EONET via cached feed
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Satellite imagery of today's awe event";

export default async function OG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feed = await getCuratedFeed();
  const all = feed.today ? [feed.today, ...feed.inbox] : feed.inbox;
  const decoded = decodeURIComponent(id);
  const scored = all.find((s) => s.event.id === decoded);

  const title = scored?.event.title ?? "An event";
  const cat = scored?.category;
  const ref =
    cat && cat in reflections
      ? reflections[cat as keyof typeof reflections]
      : null;

  // Each category has a distinct accent. Satori can't reliably fetch GIBS
  // JPEGs, so we render an accent-tinted gradient instead — every event's
  // OG card is distinctive without depending on external image loading.
  const accentMap: Record<string, string> = {
    volcanoes: "#e0633a",
    seaLakeIce: "#a8c5d6",
    severeStorms: "#8a7fb5",
    wildfires: "#c89b5a",
    earthquakes: "#a8744a",
    waterColor: "#4f8c8a",
    dustHaze: "#c9a36b",
    floods: "#6f9bb0",
    landslides: "#9a7c5e",
    drought: "#b8a474",
    tempExtremes: "#d2865a",
    snow: "#c8d4dc",
  };
  const accent = (cat && accentMap[cat]) ?? "#b8ae9b";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `radial-gradient(90% 70% at 72% 18%, ${accent}3a 0%, transparent 55%), radial-gradient(70% 50% at 28% 78%, ${accent}22 0%, transparent 55%), #0b0b0c`,
          position: "relative",
          color: "#f4efe6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(11,11,12,0.0) 0%, rgba(11,11,12,0.25) 60%, rgba(11,11,12,0.85) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 56,
            left: 72,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: accent,
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          {cat ? categoryTitle[cat] : "Awe Inbox"}
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.04,
              letterSpacing: -1.5,
              color: "#f4efe6",
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {title}
          </div>
          {ref ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.45,
                color: "#f4efe6cc",
                maxWidth: 900,
                display: "flex",
              }}
            >
              {ref.short.length > 180 ? ref.short.slice(0, 178) + "…" : ref.short}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: accent,
              fontFamily: "monospace",
              marginTop: 12,
              display: "flex",
            }}
          >
            Awe Inbox · NASA EONET
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
