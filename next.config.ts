import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * The site has no third-party scripts, no analytics, no auth. Everything but
 * the satellite tile imagery comes from same-origin. We DO need:
 *   - 'unsafe-inline' for `style-src` — Next.js injects inline `<style>` tags
 *     for critical CSS, and Tailwind 4 emits inline-style attributes.
 *   - 'unsafe-inline' for `script-src` — JSON-LD <script> tag for SEO and
 *     Next.js's bootstrap inline script.
 *   - 'unsafe-eval' for `script-src` — required by the React refresh runtime
 *     in dev mode. Stripped in prod.
 *   - data:, blob: in `img-src` — next/og generated thumbnails inline.
 *   - https://gibs.earthdata.nasa.gov in img-src + connect-src — the
 *     satellite tiles and the proxied world texture both originate there.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://gibs.earthdata.nasa.gov",
  "font-src 'self' data:",
  "connect-src 'self' https://eonet.gsfc.nasa.gov https://gibs.earthdata.nasa.gov",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  // Hide the small Next.js floating dev indicator so it doesn't sit on top of
  // the globe's bottom-left corner. Has no effect on production builds.
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["framer-motion", "lenis"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gibs.earthdata.nasa.gov",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
