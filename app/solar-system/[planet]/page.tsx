import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlanet, PLANET_SLUGS } from "@/lib/planet-data";
import { fetchWikipediaSummary } from "@/lib/country-info";

export const revalidate = 86400; // 24h

type Params = { planet: string };

export function generateStaticParams() {
  return PLANET_SLUGS.map((p) => ({ planet: p }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { planet } = await params;
  const info = getPlanet(planet);
  if (!info) return { title: "Planet — Awe Inbox" };
  return {
    title: `${info.name} — Awe Inbox`,
    description: info.shortFact,
  };
}

function fmtNum(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

function fmtMass(n: number): string {
  if (n < 0.01) return n.toExponential(2);
  return n.toLocaleString();
}

function fmtPeriod(d: number | null): string {
  if (d === null) return "—";
  if (d >= 365) return `${(d / 365.25).toFixed(2)} years`;
  return `${d.toFixed(2)} days`;
}

function fmtRotation(h: number): string {
  if (h >= 24 * 30) return `${(h / (24 * 30)).toFixed(1)} months`;
  if (h >= 24) return `${(h / 24).toFixed(2)} days`;
  return `${h.toFixed(2)} hours`;
}

const SECTION_LABEL =
  "small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5";
const SOURCE_LINK =
  "underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200";

async function WikiBlurb({ slug }: { slug: string }) {
  const info = getPlanet(slug);
  if (!info) return null;
  const wiki = await fetchWikipediaSummary(info.wikipediaSlug);
  if (!wiki) return null;
  return (
    <section className="mt-14">
      <h2 className={SECTION_LABEL}>Wikipedia synopsis</h2>
      <p className="prose-reflection text-[16px] leading-[1.6]">
        {wiki.extract}
      </p>
      <p className="mt-3 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
        Source:{" "}
        <a
          href={wiki.url}
          target="_blank"
          rel="noopener noreferrer"
          className={SOURCE_LINK}
        >
          Wikipedia — {wiki.title}
        </a>
      </p>
    </section>
  );
}

function WikiSkeleton() {
  return (
    <section className="mt-14 space-y-3">
      <div className="skeleton-shimmer rounded-[2px]" style={{ height: 11, width: 130 }} />
      <div className="skeleton-shimmer rounded-[2px]" style={{ height: 14, width: "94%" }} />
      <div className="skeleton-shimmer rounded-[2px]" style={{ height: 14, width: "88%" }} />
      <div className="skeleton-shimmer rounded-[2px]" style={{ height: 14, width: "72%" }} />
    </section>
  );
}

export default async function PlanetPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { planet } = await params;
  const info = getPlanet(planet);
  if (!info) notFound();

  const { stats } = info;

  return (
    <main className="mx-auto max-w-[920px] px-6 md:px-10 py-16 md:py-24">
      <Link
        href="/solar-system"
        className="mono text-[12px] tracking-[0.12em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] hover:text-[var(--color-paper)] transition-colors"
      >
        ← back to solar system
      </Link>

      {/* Hero */}
      <header className="mt-10 flex items-center gap-6 md:gap-10">
        <div
          className="shrink-0 relative overflow-hidden"
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            backgroundImage: `url(${info.texture})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--color-ink) 90%, transparent), 0 12px 40px color-mix(in oklab, var(--color-ink) 75%, transparent)",
          }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h1
            className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[1.04] tracking-[-0.018em]"
            style={{ color: info.accent }}
          >
            {info.name}
          </h1>
          <p className="mt-3 prose-reflection text-[16px] leading-[1.55] text-[var(--color-paper)]">
            {info.shortFact}
          </p>
        </div>
      </header>

      {/* Stats grid */}
      <section className="mt-14">
        <h2 className={SECTION_LABEL}>Vital statistics</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6">
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Diameter
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {fmtNum(stats.diameterKm)} km
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Mass (Earths)
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {fmtMass(stats.massEarths)}
            </dd>
          </div>
          {stats.distanceFromSunAU !== null ? (
            <div>
              <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                Distance from Sun
              </dt>
              <dd className="mono text-[var(--color-paper)] text-[15px]">
                {stats.distanceFromSunAU.toFixed(3)} AU
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Year length
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {fmtPeriod(stats.orbitalPeriodDays)}
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Day length
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {fmtRotation(stats.dayLengthHours)}
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Moons
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {stats.moons.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Surface gravity
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {stats.gravityMS2.toFixed(2)} m/s²
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Escape velocity
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {stats.escapeVelocityKms.toFixed(2)} km/s
            </dd>
          </div>
          <div>
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              Surface temp
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {stats.surfaceTempC.avg !== undefined
                ? `${stats.surfaceTempC.avg.toLocaleString()} °C avg`
                : stats.surfaceTempC.min !== undefined &&
                    stats.surfaceTempC.max !== undefined
                  ? `${stats.surfaceTempC.min}…${stats.surfaceTempC.max} °C`
                  : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
          Source:{" "}
          <a
            href={info.nasaFactSheet}
            target="_blank"
            rel="noopener noreferrer"
            className={SOURCE_LINK}
          >
            NASA Planetary Fact Sheet
          </a>
        </p>
      </section>

      {/* Trivia */}
      <section className="mt-14">
        <h2 className={SECTION_LABEL}>Trivia</h2>
        <div className="prose-reflection space-y-5 text-[16.5px] leading-[1.65]">
          {info.longTrivia.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Wikipedia summary (streamed) */}
      <Suspense fallback={<WikiSkeleton />}>
        <WikiBlurb slug={info.slug} />
      </Suspense>

      {/* References */}
      <section className="mt-16">
        <h2 className={SECTION_LABEL}>References</h2>
        <ol className="list-decimal pl-5 space-y-1.5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
          <li>
            <a
              href={info.nasaFactSheet}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOURCE_LINK} break-all`}
            >
              {info.nasaFactSheet}
            </a>{" "}
            — NASA Goddard Space Flight Center, Planetary Fact Sheet ({info.name}).
          </li>
          <li>
            <a
              href={`https://en.wikipedia.org/wiki/${info.wikipediaSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOURCE_LINK} break-all`}
            >
              {`https://en.wikipedia.org/wiki/${info.wikipediaSlug}`}
            </a>{" "}
            — Wikipedia, "{info.name}."
          </li>
        </ol>
        <p className="mt-6 mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
          Trivia hand-written, fact-checked against NASA planetary fact
          sheets and Wikipedia as of 2026-05. Wikipedia synopsis fetched
          live and revalidated daily.
        </p>
      </section>
    </main>
  );
}
