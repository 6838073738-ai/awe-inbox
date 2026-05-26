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
  _req: Request,
  ctx: { params: Promise<{ iso2: string }> },
) {
  const { iso2: raw } = await ctx.params;
  const iso2 = raw.toUpperCase();

  const meta = COUNTRY_LABELS.find((c) => c.iso2 === iso2);
  if (!meta) {
    return NextResponse.json(
      { error: "unknown_country", iso2 },
      { status: 404 },
    );
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
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
