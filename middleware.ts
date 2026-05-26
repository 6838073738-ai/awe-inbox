import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — runs at the Vercel CDN edge before any route handler.
 * Three jobs:
 *
 *   1. Method allowlist on /api routes. We only ever serve GET/HEAD/OPTIONS;
 *      anything else is rejected before any application code runs. Closes
 *      the door on opportunistic PUT/PATCH/DELETE probing.
 *
 *   2. Per-IP token-bucket rate limiter on /api routes. Best-effort — Edge
 *      runtime is stateless across instances so this caps a single PoP not
 *      the global request rate, but it still trips quickly on the most
 *      common abuse pattern (one IP hammering /api/country/X for many X).
 *      Vercel's built-in DDoS layer catches the rest.
 *
 *   3. X-Robots-Tag: noindex on /api responses so search engines don't
 *      surface raw JSON snapshots if they ever crawl one.
 */

const RATE_LIMIT_REQS = 90; // per IP
const RATE_WINDOW_MS = 60_000; // 1 minute
const buckets = new Map<string, { count: number; resetAt: number }>();
const BUCKETS_GC_THRESHOLD = 5_000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Method allowlist
  const m = req.method.toUpperCase();
  if (m !== "GET" && m !== "HEAD" && m !== "OPTIONS") {
    return new NextResponse("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, OPTIONS" },
    });
  }

  // Rate limit
  const ip = clientIp(req);
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    b.count += 1;
    if (b.count > RATE_LIMIT_REQS) {
      const retryAfter = Math.max(
        1,
        Math.ceil((b.resetAt - now) / 1000),
      );
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "retry-after": String(retryAfter),
          "x-ratelimit-limit": String(RATE_LIMIT_REQS),
          "x-ratelimit-window": String(RATE_WINDOW_MS / 1000),
        },
      });
    }
  }

  // Periodic bucket GC so we don't grow unboundedly
  if (buckets.size > BUCKETS_GC_THRESHOLD) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
