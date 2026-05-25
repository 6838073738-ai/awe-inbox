import Link from "next/link";
import { SatelliteImage } from "./SatelliteImage";
import { ReflectionBlock } from "./ReflectionBlock";
import { Footnote } from "./Footnote";
import { reflections, categoryTitle, accentVar } from "@/lib/reflections";
import {
  altForImagery,
  formatCoords,
  formatDate,
  formatDateShort,
  lastPointGeom,
} from "@/lib/format";
import type { ScoredEvent } from "@/lib/types";

export function EventDetail({ scored }: { scored: ScoredEvent }) {
  const { event, category, imagery, archive } = scored;
  const point = lastPointGeom(event.geometry);
  const ref =
    category in reflections
      ? reflections[category as keyof typeof reflections]
      : null;
  const accent = accentVar[category];

  const firstPoint = (() => {
    for (const g of event.geometry) {
      if (g.type === "Point") return g;
    }
    return null;
  })();

  const sensor = imagery?.layer?.includes("VIIRS")
    ? "VIIRS / Suomi NPP"
    : imagery?.layer?.includes("Aqua")
      ? "MODIS / NASA Aqua"
      : imagery?.layer?.includes("Terra")
        ? "MODIS / NASA Terra"
        : "MODIS / NASA";

  return (
    <main
      id="main"
      style={{ ["--accent" as string]: `var(${accent})` }}
    >
      {/* Hero — tighter ±2° */}
      <section
        className="relative w-full min-h-[80vh] overflow-hidden"
        aria-labelledby="detail-title"
      >
        {imagery ? (
          <SatelliteImage
            imagery={imagery}
            alt={altForImagery(event, imagery.layer, imagery.date)}
            priority
            kenBurns={false}
            sizes="100vw"
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--accent) 26%, transparent) 0%, color-mix(in oklab, var(--color-ink) 30%, transparent) 40%, var(--color-ink) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-[1600px] flex-col justify-end px-6 pb-20 pt-32 md:px-20 md:pb-24 md:pt-40">
          <div className="max-w-[60rem]">
            <div className="small-caps mb-5 text-[color-mix(in_oklab,var(--accent)_70%,var(--color-paper))]">
              {archive ? "Recent Archive · " : ""}
              {categoryTitle[category]}
            </div>
            <h1
              id="detail-title"
              className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]"
            >
              {event.title}
            </h1>
            <dl className="mono mt-10 grid grid-cols-1 gap-y-3 md:grid-cols-[auto_auto_auto] md:gap-x-10 md:gap-y-0 text-[var(--color-faded)]">
              {point ? (
                <div className="flex gap-3">
                  <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                    Coordinates
                  </dt>
                  <dd>{formatCoords(point.lat, point.lng)}</dd>
                </div>
              ) : null}
              {firstPoint ? (
                <div className="flex gap-3">
                  <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                    First seen
                  </dt>
                  <dd>{formatDateShort(firstPoint.date)}</dd>
                </div>
              ) : null}
              {point ? (
                <div className="flex gap-3">
                  <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                    Last update
                  </dt>
                  <dd>{formatDate(point.date)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      {/* Long-form reflection */}
      <section
        className="w-full px-6 py-32 md:px-20 md:py-48"
        aria-label="Reflection"
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2 md:col-start-1">
              <div className="small-caps text-[var(--color-faded)]">
                Reflection
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 md:col-start-3">
              <ReflectionBlock>
                {ref ? <p>{ref.long}</p> : <p>{event.description ?? ""}</p>}
              </ReflectionBlock>
            </div>
          </div>
        </div>
      </section>

      {/* What you are looking at */}
      <section
        className="w-full px-6 py-24 md:px-20"
        aria-label="About this imagery"
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2 md:col-start-1">
              <div className="small-caps text-[var(--color-faded)]">
                What you are looking at
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 md:col-start-3">
              <dl className="mono grid grid-cols-1 gap-y-3 md:grid-cols-[10rem_1fr] md:gap-y-4 text-[var(--color-faded)]">
                <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                  Sensor
                </dt>
                <dd>{sensor}</dd>
                <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                  Image date
                </dt>
                <dd>{imagery?.date ?? "—"}</dd>
                <dt className="text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
                  Imagery
                </dt>
                <dd>
                  {imagery?.kind === "satellite"
                    ? "NASA GIBS WMS (True Color)"
                    : "Composed gradient — no usable satellite tile for this region today"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Footnotes */}
      {event.sources?.length ? (
        <section className="w-full px-6 py-24 md:px-20" aria-label="Sources">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-2 md:col-start-1">
                <div className="small-caps text-[var(--color-faded)]">
                  Sources
                </div>
              </div>
              <div className="col-span-12 md:col-span-7 md:col-start-3">
                <ol className="border-t border-[color-mix(in_oklab,var(--color-paper)_18%,transparent)]">
                  {event.sources.map((s, i) => (
                    <Footnote
                      key={`${s.id}-${i}`}
                      index={i + 1}
                      href={s.url}
                      label={`${s.id} — ${s.url}`}
                    />
                  ))}
                  <li className="grid grid-cols-[2rem_1fr] items-baseline gap-4 py-2 border-t border-[color-mix(in_oklab,var(--color-paper)_8%,transparent)] mt-2">
                    <span className="mono text-[var(--color-faded)] tabular-nums">
                      [{event.sources.length + 1}]
                    </span>
                    <a
                      href={event.link}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline decoration-[color-mix(in_oklab,var(--accent)_55%,transparent)] underline-offset-[5px] hover:decoration-[var(--accent)] transition-[text-decoration-color] duration-300"
                      style={{ textDecorationThickness: "1px" }}
                    >
                      EONET event record ↗
                    </a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Back to today */}
      <section className="w-full px-6 pb-40 pt-12 md:px-20" aria-label="Navigation">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7 md:col-start-3">
              <Link
                href="/"
                className="mono inline-flex items-center gap-3 text-[var(--color-paper)] underline decoration-[color-mix(in_oklab,var(--accent)_55%,transparent)] underline-offset-[6px] hover:decoration-[var(--accent)] transition-[text-decoration-color] duration-300"
                style={{ textDecorationThickness: "1px" }}
              >
                <span aria-hidden="true">←</span>
                Back to today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
