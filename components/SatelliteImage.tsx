"use client";

import Image from "next/image";
import { useState } from "react";
import type { ResolvedImagery } from "@/lib/types";

type Props = {
  imagery: ResolvedImagery;
  alt: string;
  priority?: boolean;
  kenBurns?: boolean;
  sizes?: string;
  className?: string;
};

export function SatelliteImage({
  imagery,
  alt,
  priority = false,
  kenBurns = true,
  sizes = "100vw",
  className = "",
}: Props) {
  const [imgErrored, setImgErrored] = useState(false);
  const useGradient =
    imagery.kind === "gradient" || imgErrored || !imagery.url;

  const seed = imagery.gradient;
  const gradientVars = {
    "--g-angle": `${seed.angle}deg`,
    "--g-rx": `${seed.rx}%`,
    "--g-ry": `${seed.ry}%`,
  } as React.CSSProperties;

  if (useGradient) {
    return (
      <div
        className={`gradient-fallback absolute inset-0 ${className}`}
        style={gradientVars}
        aria-hidden="true"
      />
    );
  }

  // Ken Burns is applied to an inner wrapper so the image fills it and is
  // transformed without affecting layout. Origin offset hashed from coords
  // varies per event so each composition is unique.
  const originX = 40 + (Math.abs(seed.hue) % 30);
  const originY = 35 + (Math.abs(seed.angle) % 30);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className={kenBurns ? "absolute inset-0 ken-burns" : "absolute inset-0"}
        style={
          {
            "--kb-origin-x": `${originX}%`,
            "--kb-origin-y": `${originY}%`,
            "--kb-x": `${(seed.hue % 7) - 3}%`,
            "--kb-y": `${(seed.angle % 5) - 2}%`,
          } as React.CSSProperties
        }
      >
        <Image
          src={imagery.url!}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => setImgErrored(true)}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </div>
    </div>
  );
}
