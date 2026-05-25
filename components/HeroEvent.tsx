"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { SatelliteImage } from "./SatelliteImage";
import { ScrollIndicator } from "./ScrollIndicator";
import { reflections, categoryTitle, accentVar } from "@/lib/reflections";
import {
  altForImagery,
  formatCoords,
  formatDate,
  lastPointGeom,
} from "@/lib/format";
import type { ScoredEvent } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroEvent({ scored }: { scored: ScoredEvent }) {
  const reduce = useReducedMotion();
  const { event, category, imagery, archive } = scored;
  const point = lastPointGeom(event.geometry);
  const ref =
    category in reflections
      ? reflections[category as keyof typeof reflections]
      : null;

  const words = event.title.trim().split(/\s+/);
  const accent = accentVar[category];

  // Reduced motion: single ≤400ms cross-fade for all elements
  const fadeIn = (delay = 0) =>
    reduce
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.4, delay: 0, ease: EASE },
        }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section
      id="main"
      className="relative min-h-[100dvh] w-full overflow-hidden"
      style={{ ["--accent" as string]: `var(${accent})` }}
      aria-labelledby="hero-title"
    >
      {imagery ? (
        <SatelliteImage
          imagery={imagery}
          alt={altForImagery(event, imagery.layer, imagery.date)}
          priority
          kenBurns={!reduce}
          sizes="100vw"
        />
      ) : null}

      {/* Atmospheric gradient overlay — accent at top-right tapering to ink */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--accent) 28%, transparent) 0%, color-mix(in oklab, var(--color-ink) 30%, transparent) 35%, color-mix(in oklab, var(--color-ink) 85%, transparent) 75%, var(--color-ink) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 70% 12%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1600px] flex-col justify-between px-6 py-[max(env(safe-area-inset-top),1.5rem)] md:px-20 md:py-16">
        {/* Top — title + meta */}
        <div className="flex-1 flex items-center">
          <div className="max-w-[58rem]">
            <m.div
              {...fadeIn(0.05)}
              className="small-caps text-[var(--color-faded)] mb-6"
              style={{ color: "color-mix(in oklab, var(--accent) 70%, var(--color-paper))" }}
            >
              {archive ? "From the recent archive · " : ""}
              {categoryTitle[category]}
            </m.div>

            <h1
              id="hero-title"
              className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[1.02] tracking-[-0.02em] text-[var(--color-paper)]"
            >
              {reduce ? (
                <m.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ display: "inline-block" }}
                >
                  {event.title}
                </m.span>
              ) : (
                words.map((word, i) => (
                  <m.span
                    key={`${word}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2 + i * 0.06,
                      ease: EASE,
                    }}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                  >
                    {i < words.length - 1 ? `${word} ` : word}
                  </m.span>
                ))
              )}
            </h1>

            {ref ? (
              <m.p
                {...fadeIn(0.95)}
                className="mt-10 max-w-[40rem] text-[1.15rem] md:text-[1.28rem] leading-[1.55] text-[color-mix(in_oklab,var(--color-paper)_88%,transparent)]"
              >
                {ref.short}
              </m.p>
            ) : null}

            <m.dl
              {...fadeIn(reduce ? 0 : 1.25)}
              className="mt-14 flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-x-14 md:gap-y-3 text-[var(--color-paper)]"
            >
              <div className="flex flex-col gap-1.5">
                <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                  Category
                </dt>
                <dd className="mono">{categoryTitle[category]}</dd>
              </div>
              {point ? (
                <div className="flex flex-col gap-1.5">
                  <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                    Coordinates
                  </dt>
                  <dd className="mono">{formatCoords(point.lat, point.lng)}</dd>
                </div>
              ) : null}
              {point ? (
                <div className="flex flex-col gap-1.5">
                  <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                    Observed
                  </dt>
                  <dd className="mono">{formatDate(point.date)}</dd>
                </div>
              ) : null}
            </m.dl>

            <m.div {...fadeIn(reduce ? 0 : 1.5)} className="mt-12">
              <Link
                href={`/event/${encodeURIComponent(event.id)}`}
                className="hero-readmore mono inline-flex items-center gap-3 text-[var(--color-paper)]"
              >
                <span>Read more</span>
                <span aria-hidden="true" className="hero-readmore-arrow">
                  →
                </span>
              </Link>
            </m.div>
          </div>
        </div>

        {/* Bottom — scroll indicator */}
        <m.div
          {...fadeIn(reduce ? 0 : 1.7)}
          className="self-center pb-2"
        >
          <ScrollIndicator />
        </m.div>
      </div>
    </section>
  );
}
