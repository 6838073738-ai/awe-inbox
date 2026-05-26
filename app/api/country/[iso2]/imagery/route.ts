import { NextResponse } from "next/server";
import { COUNTRY_LABELS } from "@/lib/country-flags";
import { buildGibsUrl } from "@/lib/gibs";

/**
 * Per-country NASA GIBS satellite imagery proxy. Builds a MODIS Terra
 * True-Color WMS URL centred on the country's label point, with a
 * country-sized half-width (large countries get a wider box). Falls back
 * to MODIS Aqua / VIIRS if the Terra tile is blank for the requested date.
 *
 * Cached at the Vercel edge for 12 hours with a 24h stale-while-revalidate.
 * GIBS imagery is NASA public domain.
 */

export const runtime = "nodejs";
export const revalidate = 43_200; // 12h

// Rough "how wide should the satellite frame be in degrees" hint per
// country. Countries not listed here default to ±8°. Hand-curated for the
// biggest landmasses so they don't render as a tiny island in a sea of
// neighbours.
const HALF_WIDTH_DEG: Record<string, number> = {
  RU: 36,
  CA: 28,
  US: 24,
  CN: 22,
  BR: 20,
  AU: 22,
  IN: 16,
  AR: 18,
  KZ: 18,
  DZ: 14,
  CD: 14,
  GL: 22,
  ID: 22,
  MN: 16,
  SA: 14,
  SD: 14,
  // Microstates — tight zoom so the country dominates the frame
  VA: 0.2,
  MC: 0.2,
  SM: 0.5,
  LI: 0.5,
  AD: 0.6,
  MT: 0.6,
  SG: 0.5,
  BH: 0.8,
  MV: 2,
  LC: 1,
  WS: 1.5,
};

function dateNDaysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400_000);
  return d.toISOString().slice(0, 10);
}

const LAYERS = [
  "MODIS_Terra_CorrectedReflectance_TrueColor",
  "MODIS_Aqua_CorrectedReflectance_TrueColor",
  "VIIRS_SNPP_CorrectedReflectance_TrueColor",
] as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ iso2: string }> },
) {
  const { iso2: raw } = await ctx.params;
  const iso2 = raw.toUpperCase();
  const country = COUNTRY_LABELS.find((c) => c.iso2 === iso2);
  if (!country) {
    return new NextResponse("Unknown country", { status: 404 });
  }

  const halfWidthDeg = HALF_WIDTH_DEG[iso2] ?? 8;
  // GIBS True Color is often blank for "today" (no satellite pass yet),
  // so we try recent days walking backward.
  const datesToTry = [1, 2, 3, 4, 6, 9, 14, 21].map(dateNDaysAgo);

  for (const dateISO of datesToTry) {
    for (const layer of LAYERS) {
      const url = buildGibsUrl({
        lat: country.lat,
        lng: country.lng,
        dateISO,
        halfWidthDeg,
        width: 2048,
        height: 1024,
        layer,
      });
      try {
        const res = await fetch(url, {
          next: { revalidate: 43_200 },
          headers: {
            "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
          },
        });
        if (!res.ok) continue;
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) continue;
        const buf = await res.arrayBuffer();
        // Skip empty (mostly-black) responses — GIBS returns a small black
        // JPEG when the layer is blank for that date/region. Real images
        // are usually > 25 KB.
        if (buf.byteLength < 8_000) continue;
        return new NextResponse(buf, {
          headers: {
            "content-type": contentType,
            "cache-control":
              "public, s-maxage=43200, stale-while-revalidate=86400",
            "x-source": `GIBS ${layer}`,
            "x-source-date": dateISO,
          },
        });
      } catch {
        // try next combo
      }
    }
  }

  return new NextResponse("No GIBS imagery available", { status: 502 });
}
