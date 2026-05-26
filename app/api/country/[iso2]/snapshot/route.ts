import { NextResponse } from "next/server";
import { fetchCountryNews } from "@/lib/country-news";
import { fetchCountryStocks } from "@/lib/country-finance";
import { COUNTRY_LABELS } from "@/lib/country-flags";

export const runtime = "nodejs";
// Cache the route handler response itself at the Vercel edge so we don't even
// touch the upstreams again for 1 hour per country. News + stocks both
// change throughout the day, so 1h is a good balance between freshness and
// quota use.
export const revalidate = 3600;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ iso2: string }> },
) {
  const { iso2: raw } = await ctx.params;
  const iso2 = raw.toUpperCase();
  const debug = new URL(req.url).searchParams.has("debug");

  const meta = COUNTRY_LABELS.find((c) => c.iso2 === iso2);
  if (!meta) {
    return NextResponse.json(
      { error: "unknown_country", iso2 },
      { status: 404 },
    );
  }

  let gdeltDebug: unknown = null;
  if (debug) {
    // Bypass our wrapper and call GDELT directly so we can see what the
    // server-side outbound is actually receiving. Helps diagnose rate limits
    // and IP-based blocks visible only from Vercel's egress.
    const q = `"${meta.name}" sourcelang:eng`;
    const url =
      `https://api.gdeltproject.org/api/v2/doc/doc` +
      `?query=${encodeURIComponent(q)}&format=json&maxrecords=10&sort=hybridrel&timespan=24h`;
    try {
      const r = await fetch(url, {
        cache: "no-store",
        headers: {
          "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
        },
      });
      const text = await r.text();
      gdeltDebug = {
        url,
        status: r.status,
        contentType: r.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 400),
      };
    } catch (e) {
      gdeltDebug = { error: String(e) };
    }
  }

  const [news, stocks] = await Promise.all([
    fetchCountryNews(iso2, meta.name, 3),
    fetchCountryStocks(iso2, 3),
  ]);

  return NextResponse.json(
    {
      iso2,
      name: meta.name,
      news,
      stocks,
      ...(debug ? { _debug: gdeltDebug } : {}),
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": debug
          ? "no-store"
          : "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
