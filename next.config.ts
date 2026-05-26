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
// Google Analytics + Google Tag Manager + Vercel Analytics endpoints.
// GA loads its gtag.js from googletagmanager.com and beacons to
// google-analytics.com (region.analytics.google.com for newer setups).
// Vercel Analytics loads its script from /_vercel/insights, served same-
// origin via Vercel's edge, so no CSP change is needed for that side.
const GA_SCRIPT_HOSTS = [
  "https://www.googletagmanager.com",
];
const GA_CONNECT_HOSTS = [
  "https://www.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.google-analytics.com",
];
const GA_IMG_HOSTS = ["https://www.google-analytics.com"];

const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GA_SCRIPT_HOSTS.join(" ")}${isProd ? "" : " 'unsafe-eval'"}`,
  // Block inline event-handler attributes (onclick="...") at the CSP level.
  // We never use them — they belong to the React pre-history.
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://gibs.earthdata.nasa.gov ${GA_IMG_HOSTS.join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' https://eonet.gsfc.nasa.gov https://gibs.earthdata.nasa.gov ${GA_CONNECT_HOSTS.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  ...(isProd ? ["upgrade-insecure-requests", "block-all-mixed-content"] : []),
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
        // Aggressively deny everything we don't use. Anything not listed
        // defaults to enabled, so we enumerate.
        value: [
          "accelerometer=()",
          "ambient-light-sensor=()",
          "autoplay=()",
          "battery=()",
          "browsing-topics=()",
          "camera=()",
          "display-capture=()",
          "encrypted-media=()",
          "fullscreen=(self)",
          "geolocation=()",
          "gyroscope=()",
          "hid=()",
          "identity-credentials-get=()",
          "idle-detection=()",
          "interest-cohort=()",
          "keyboard-map=()",
          "magnetometer=()",
          "microphone=()",
          "midi=()",
          "otp-credentials=()",
          "payment=()",
          "picture-in-picture=()",
          "publickey-credentials-create=()",
          "publickey-credentials-get=()",
          "screen-wake-lock=()",
          "serial=()",
          "speaker-selection=()",
          "storage-access=()",
          "sync-xhr=()",
          "usb=()",
          "web-share=()",
          "window-management=()",
          "xr-spatial-tracking=()",
        ].join(", "),
      },
      { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "Origin-Agent-Cluster", value: "?1" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
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
