import { NextResponse } from "next/server";

/**
 * Proxy for NASA SDO's latest 171-angstrom full-disc solar image.
 * SDO publishes a refreshed full-disc to this URL roughly every 12 minutes.
 * We cache at the Vercel edge for 10 minutes with a 24h stale-while-
 * revalidate so a brief SDO outage doesn't break the Sun page.
 *
 * SDO imagery is NASA public-domain (no auth, no licensing fee).
 *
 * Wavelength: 171 Å — emitted by Fe IX ions at ~600,000 °C, the
 * temperature of the upper transition region and quiet corona. It's
 * the wavelength that shows the corona's loop structures and active
 * regions most beautifully.
 */

export const runtime = "nodejs";
export const revalidate = 600; // 10 min

const SDO_URL =
  "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_0171.jpg";

export async function GET() {
  try {
    const upstream = await fetch(SDO_URL, {
      next: { revalidate: 600 },
      headers: {
        "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
      },
    });
    if (!upstream.ok) {
      return new NextResponse("SDO upstream " + upstream.status, {
        status: 502,
      });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control":
          "public, s-maxage=600, stale-while-revalidate=86400",
        "x-source": "NASA SDO AIA 171",
      },
    });
  } catch {
    return new NextResponse("SDO fetch failed", { status: 502 });
  }
}
