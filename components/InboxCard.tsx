"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { SatelliteImage } from "./SatelliteImage";
import { accentVar, categoryTitle, reflections } from "@/lib/reflections";
import {
  altForImagery,
  formatCoords,
  formatDate,
  lastPointGeom,
  toRoman,
} from "@/lib/format";
import type { ScoredEvent } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function InboxCard({
  scored,
  ordinal,
}: {
  scored: ScoredEvent;
  ordinal: number;
}) {
  const reduce = useReducedMotion();
  const { event, category, imagery } = scored;
  const point = lastPointGeom(event.geometry);
  const ref =
    category in reflections
      ? reflections[category as keyof typeof reflections]
      : null;
  const accent = accentVar[category];

  const viewportAnim = reduce
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, margin: "-10% 0%" },
        transition: { duration: 0.4, ease: EASE },
      }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-12% 0%" },
        transition: { duration: 0.9, ease: EASE },
      };

  return (
    <m.article
      {...viewportAnim}
      className="inbox-card group relative min-h-[80vh] w-full overflow-hidden"
      style={{ ["--accent" as string]: `var(${accent})` }}
      aria-labelledby={`inbox-title-${event.id}`}
    >
      <Link
        href={`/event/${encodeURIComponent(event.id)}`}
        aria-label={`Open ${event.title}`}
        className="absolute inset-0 z-20"
        tabIndex={-1}
      />

      <div className="absolute inset-0 inbox-card-image">
        {imagery ? (
          <SatelliteImage
            imagery={imagery}
            alt={altForImagery(event, imagery.layer, imagery.date)}
            kenBurns={false}
            sizes="100vw"
          />
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-ink) 35%, transparent) 0%, color-mix(in oklab, var(--color-ink) 25%, transparent) 30%, color-mix(in oklab, var(--accent) 18%, transparent) 60%, var(--color-ink) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-30 mx-auto flex min-h-[80vh] w-full max-w-[1600px] flex-col justify-end px-6 pb-16 pt-24 md:px-20 md:pb-20 md:pt-32 pointer-events-none">
        <div className="grid w-full grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-1 self-start">
            <span
              className="font-display text-[1.6rem] md:text-[1.85rem] leading-none tracking-[0.02em]"
              style={{
                color: "color-mix(in oklab, var(--accent) 70%, var(--color-paper))",
                fontVariantNumeric: "lining-nums",
              }}
              aria-hidden="true"
            >
              {toRoman(ordinal)}
            </span>
          </div>

          <div className="col-span-12 md:col-span-8 md:col-start-2">
            <div className="small-caps mb-4 text-[color-mix(in_oklab,var(--accent)_60%,var(--color-faded))]">
              {categoryTitle[category]}
            </div>
            <h2
              id={`inbox-title-${event.id}`}
              className="font-display text-[clamp(2rem,4.5vw,4rem)] leading-[1.04] tracking-[-0.015em] text-[var(--color-paper)]"
            >
              <Link
                href={`/event/${encodeURIComponent(event.id)}`}
                className="inbox-card-title pointer-events-auto relative z-10"
              >
                {event.title}
              </Link>
            </h2>
            {ref ? (
              <p className="mt-6 max-w-[36rem] text-[1.0625rem] leading-[1.65] text-[color-mix(in_oklab,var(--color-paper)_82%,transparent)]">
                {ref.short}
              </p>
            ) : null}
          </div>

          <div className="col-span-12 md:col-span-3 md:col-start-10 mono flex flex-col justify-end gap-2 text-[var(--color-faded)] md:text-right">
            {point ? (
              <>
                <span className="block">{formatCoords(point.lat, point.lng)}</span>
                <span className="block text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                  {formatDate(point.date)}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </m.article>
  );
}
