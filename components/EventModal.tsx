"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "./CategoryIcon";
import { accentVar, categoryTitle } from "@/lib/reflections";
import { formatCoords, formatDate } from "@/lib/format";
import type { GlobePoint } from "@/lib/globe-data";

export function EventModal({
  point,
  onClose,
}: {
  point: GlobePoint;
  onClose: () => void;
}) {
  const [imgErrored, setImgErrored] = useState(false);

  // Lock body scroll while the modal is open and trap Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const accent = accentVar[point.category];
  const seed = point.gradient;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${point.id}`}
      className="event-modal fixed inset-0 z-50 flex items-center justify-center px-4 py-8 md:px-10 md:py-14"
      onClick={onClose}
      style={{ ["--accent" as string]: `var(${accent})` }}
    >
      {/* Backdrop */}
      <div
        className="event-modal-backdrop absolute inset-0"
        aria-hidden="true"
      />

      {/* Card */}
      <article
        className="event-modal-card relative z-10 w-full max-w-[1000px] max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="event-modal-close mono"
          aria-label="Close"
        >
          Close ✕
        </button>

        {/* Close-up satellite hero */}
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          {imgErrored ? (
            <div
              className="gradient-fallback absolute inset-0"
              style={
                {
                  "--g-angle": `${seed.angle}deg`,
                  "--g-rx": `${seed.rx}%`,
                  "--g-ry": `${seed.ry}%`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ) : (
            <Image
              src={point.closeUpUrl}
              alt={`Close-up satellite imagery of ${point.title}, captured by MODIS / NASA Terra near ${formatDate(point.date)}.`}
              fill
              sizes="(max-width: 1000px) 100vw, 1000px"
              priority
              unoptimized
              onError={() => setImgErrored(true)}
              style={{ objectFit: "cover" }}
            />
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--color-ink) 88%, transparent) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="px-6 pt-8 pb-10 md:px-12 md:pt-10 md:pb-14">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="event-modal-cat-icon"
              style={{ color: `var(${accent})` }}
              aria-hidden="true"
            >
              <CategoryIcon category={point.category} size={16} />
            </span>
            <span className="small-caps text-[color-mix(in_oklab,var(--accent)_75%,var(--color-paper))]">
              {categoryTitle[point.category]}
            </span>
          </div>

          <h2
            id={`modal-title-${point.id}`}
            className="font-display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.05] tracking-[-0.018em] text-[var(--color-paper)]"
          >
            {point.title}
          </h2>

          <p className="prose-reflection mt-8">
            {point.reflectionLong || point.reflectionShort}
          </p>

          <dl className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4">
            <div className="flex flex-col gap-1.5">
              <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                Coordinates
              </dt>
              <dd className="mono text-[var(--color-paper)]">
                {formatCoords(point.lat, point.lng)}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                Observed
              </dt>
              <dd className="mono text-[var(--color-paper)]">
                {formatDate(point.date)}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="small-caps text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                Nearest place
              </dt>
              <dd className="mono text-[var(--color-paper)]">
                {point.nearestCity
                  ? `${point.nearestCity} · ${Math.round(point.nearestCityKm).toLocaleString()} km`
                  : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {point.category !== "conflict" ? (
              <Link
                href={`/event/${encodeURIComponent(point.id)}`}
                className="mono inline-flex items-center gap-3 text-[var(--color-paper)] underline decoration-[color-mix(in_oklab,var(--accent)_60%,transparent)] underline-offset-[6px] hover:decoration-[var(--accent)] transition-[text-decoration-color] duration-300"
                style={{ textDecorationThickness: "1px" }}
              >
                Open full page
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            <span className="mono text-[color-mix(in_oklab,var(--color-paper)_40%,transparent)]">
              Press <kbd className="kbd">Esc</kbd> to return to the globe
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
