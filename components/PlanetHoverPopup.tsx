"use client";

import { PLANET_DATA } from "@/lib/planet-data";

function fmtBig(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

function fmtDays(d: number | null): string {
  if (d === null) return "—";
  if (d >= 365) return `${(d / 365.25).toFixed(2)} yr`;
  return `${d.toFixed(1)} d`;
}

function fmtHours(h: number): string {
  if (h >= 24 * 30) return `${(h / (24 * 30)).toFixed(1)} mo`;
  if (h >= 24) return `${(h / 24).toFixed(1)} d`;
  return `${h.toFixed(1)} h`;
}

/**
 * Tooltip card that appears beside the cursor when a planet (or the Sun
 * or Moon) is hovered in the SolarSystem scene. Pulls trivia + stats from
 * lib/planet-data.ts (committed static dataset).
 */
export function PlanetHoverPopup({
  slug,
  x,
  y,
}: {
  slug: string;
  x: number;
  y: number;
}) {
  const info = PLANET_DATA[slug];
  if (!info) return null;
  const { stats } = info;

  // Position so the popup doesn't run off-screen
  const W = 280;
  const PAD = 16;
  const viewportW =
    typeof window !== "undefined" ? window.innerWidth : 1080;
  const viewportH =
    typeof window !== "undefined" ? window.innerHeight : 1920;
  let left = x + 20;
  if (left + W + PAD > viewportW) left = x - W - 20;
  if (left < PAD) left = PAD;
  let top = y - 12;
  const maxH = 280;
  if (top + maxH > viewportH - PAD) top = viewportH - maxH - PAD;
  if (top < PAD) top = PAD;

  return (
    <div
      className="planet-popup fixed z-40 pointer-events-none"
      style={{ left, top, width: W }}
      role="tooltip"
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3
          className="font-display text-[1.1rem] leading-tight"
          style={{ color: info.accent }}
        >
          {info.name}
        </h3>
        {stats.distanceFromSunAU !== null ? (
          <span className="mono text-[10px] tracking-[0.14em] text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
            {stats.distanceFromSunAU.toFixed(2)} AU
          </span>
        ) : null}
      </div>

      <p className="text-[12.5px] leading-[1.4] text-[var(--color-paper)] mb-3">
        {info.shortFact}
      </p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Diameter
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {fmtBig(stats.diameterKm)} km
          </dd>
        </div>
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Mass (Earths)
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {stats.massEarths < 0.01
              ? stats.massEarths.toExponential(2)
              : stats.massEarths.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Year
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {fmtDays(stats.orbitalPeriodDays)}
          </dd>
        </div>
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Day
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {fmtHours(stats.dayLengthHours)}
          </dd>
        </div>
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Moons
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {stats.moons.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="small-caps text-[9px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
            Gravity
          </dt>
          <dd className="mono text-[11px] text-[var(--color-paper)]">
            {stats.gravityMS2.toFixed(1)} m/s²
          </dd>
        </div>
      </dl>

      <div className="mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
        click for the full page →
      </div>
    </div>
  );
}
