"use client";

import { useMemo, type MouseEvent } from "react";
import { getFlagSvg } from "@/lib/country-flags";

/**
 * Small circular flag chip rendered as part of the globe's HTML overlay
 * layer. Position + opacity are written every rAF tick by `Globe.tsx`'s
 * projection loop. The chip is interactive: hover surfaces today's
 * news/stocks for that country, click navigates to the full country page.
 */
export function FlagMarker({
  iso2,
  name,
  onHover,
  onHoverEnd,
  onClick,
}: {
  iso2: string;
  name: string;
  onHover: (iso2: string, name: string, x: number, y: number) => void;
  onHoverEnd: () => void;
  onClick: (iso2: string) => void;
}) {
  const svg = useMemo(() => getFlagSvg(iso2), [iso2]);
  if (!svg) return null;
  return (
    <button
      type="button"
      data-flag-iso={iso2}
      title={name}
      aria-label={`${name} — open country details`}
      className="globe-flag"
      style={{
        transform: "translate3d(-9999px, -9999px, 0)",
        opacity: 0,
        willChange: "transform, opacity",
      }}
      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) =>
        onHover(iso2, name, e.clientX, e.clientY)
      }
      onMouseMove={(e: MouseEvent<HTMLButtonElement>) =>
        onHover(iso2, name, e.clientX, e.clientY)
      }
      onMouseLeave={onHoverEnd}
      onFocus={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onHover(iso2, name, r.left + r.width / 2, r.top + r.height / 2);
      }}
      onBlur={onHoverEnd}
      onClick={() => onClick(iso2)}
      // The SVG strings come from a static npm package, never user input,
      // so dangerouslySetInnerHTML is safe here.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
