"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Two analytics layers:
 *
 *   1. Vercel Analytics (cookieless, GDPR-safe, free) — always on.
 *      One `<Analytics />` component, no setup beyond enabling Web
 *      Analytics in the Vercel project dashboard.
 *
 *   2. Google Analytics 4 — loaded only when `NEXT_PUBLIC_GA_ID` is set
 *      AND the visitor doesn't have Do-Not-Track on AND we're in
 *      production. The gtag library is loaded via next/script with
 *      `afterInteractive` so it never blocks the first paint.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [allowGa, setAllowGa] = useState(false);

  useEffect(() => {
    if (!gaId) {
      setAllowGa(false);
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      setAllowGa(false);
      return;
    }
    // Honour Do-Not-Track: if the user has DNT enabled, skip loading GA.
    // (Browsers have been removing DNT, but Firefox + a few privacy
    // extensions still send it, and respecting it is cheap.)
    type NavigatorWithDnt = Navigator & {
      msDoNotTrack?: string;
      doNotTrack?: string;
    };
    const nav =
      typeof window !== "undefined"
        ? (window.navigator as NavigatorWithDnt)
        : null;
    const dnt =
      nav?.doNotTrack ??
      nav?.msDoNotTrack ??
      (window as unknown as { doNotTrack?: string })?.doNotTrack;
    if (dnt === "1" || dnt === "yes") {
      setAllowGa(false);
      return;
    }
    setAllowGa(true);
  }, [gaId]);

  return (
    <>
      <VercelAnalytics />
      {allowGa && gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
