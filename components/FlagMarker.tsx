"use client";

import { useMemo } from "react";
import { getFlagSvg } from "@/lib/country-flags";

/**
 * Small circular flag chip rendered as part of the globe's HTML overlay
 * layer. Position + opacity are written every rAF tick by `Globe.tsx`'s
 * projection loop, so this component is purely presentational.
 *
 * `iso2` is an ISO-3166-1 alpha-2 country code (uppercase). If the
 * `country-flag-icons` package has no flag for that code we render nothing
 * (the parent loop still positions the empty wrapper, which stays invisible).
 */
export function FlagMarker({
  iso2,
  name,
}: {
  iso2: string;
  name: string;
}) {
  const svg = useMemo(() => getFlagSvg(iso2), [iso2]);
  if (!svg) return null;
  return (
    <span
      data-flag-iso={iso2}
      title={name}
      aria-label={name}
      className="globe-flag"
      style={{
        transform: "translate3d(-9999px, -9999px, 0)",
        opacity: 0,
        willChange: "transform, opacity",
      }}
      // The SVG strings come from a static npm package, never user input,
      // so dangerouslySetInnerHTML is safe here. Inlining the SVG (vs
      // wrapping in an <img src="data:image/svg+xml,...">) avoids a
      // base64-encode round-trip per flag.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
