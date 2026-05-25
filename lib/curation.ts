import "server-only";
import { cache } from "react";
import { fetchOpenEvents, fetchClosedEvents } from "./eonet";
import citiesData from "./cities.json";
import { resolveImagery } from "./gibs";
import type {
  CategoryId,
  City,
  CuratedFeed,
  EonetEvent,
  EonetGeometry,
  ScoredEvent,
  ScoreBreakdown,
} from "./types";

const cities = citiesData as City[];

/**
 * Category base scores — weighted toward "reward-based awe" per Keltner.
 * Volcanoes, ice, and ocean color are slow, vast, and beautiful → high.
 * Wildfires and severe storms can be either; their base is moderate and a
 * hard suppression kicks in when they are near populated places.
 * Manmade is excluded entirely.
 */
export const CATEGORY_BASE: Record<CategoryId, number> = {
  volcanoes: 95,
  seaLakeIce: 85,
  waterColor: 70,
  severeStorms: 60,
  dustHaze: 50,
  wildfires: 40,
  earthquakes: 30,
  floods: 18,
  landslides: 18,
  drought: 14,
  tempExtremes: 14,
  snow: 14,
  manmade: 0,
  // Conflict events bypass EONET scoring entirely (they come from the
  // curated static list in lib/conflicts.ts), so this entry is never read —
  // present only to satisfy the type.
  conflict: 0,
};

export const SCORE_FLOOR = 60;
export const ARCHIVE_FLOOR = 70;

const EARTH_RADIUS_KM = 6371;

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function magnitudeBoost(
  cat: CategoryId,
  mag: number | null | undefined,
): number {
  const m = typeof mag === "number" && Number.isFinite(mag) ? mag : 0;
  let raw: number;
  switch (cat) {
    case "wildfires":
      raw = Math.log10(Math.max(m, 100)) * 4; // acres
      break;
    case "seaLakeIce":
      raw = Math.log10(Math.max(m, 1)) * 5; // km²
      break;
    case "volcanoes":
      raw = m * 3; // VEI
      break;
    case "earthquakes":
      raw = Math.max(0, (m - 5) * 12); // Mw
      break;
    default:
      raw = Math.min(15, Math.log10(Math.max(m, 1)) * 3);
  }
  return Math.min(Math.max(raw, 0), 25);
}

function geomTime(g: EonetGeometry): number {
  const t = Date.parse(g.date);
  return Number.isFinite(t) ? t : Date.now();
}

function pointsFromGeometry(
  geom: EonetGeometry[],
): Array<{ lat: number; lng: number }> {
  const out: Array<{ lat: number; lng: number }> = [];
  for (const g of geom) {
    if (g.type === "Point") {
      out.push({ lng: g.coordinates[0], lat: g.coordinates[1] });
    }
    // Polygon support intentionally omitted — none observed in current EONET feed
  }
  return out;
}

export function scoreEvent(event: EonetEvent): ScoreBreakdown {
  const cat = event.categories[0]?.id as CategoryId | undefined;

  const empty: ScoreBreakdown = {
    base: 0,
    magnitude: 0,
    longevity: 0,
    recency: 0,
    proximity: 0,
    mundanity: 0,
    total: 0,
    score: 0,
    nearestCityKm: Infinity,
    nearestCity: null,
    suppressed: true,
    suppressionReason: undefined,
  };

  if (!cat || CATEGORY_BASE[cat] === undefined) {
    return { ...empty, suppressionReason: "unknown category" };
  }
  if (cat === "manmade") {
    return { ...empty, suppressionReason: "manmade excluded" };
  }

  const points = pointsFromGeometry(event.geometry);
  if (points.length === 0) {
    return { ...empty, suppressionReason: "no point geometry" };
  }

  let base = CATEGORY_BASE[cat];
  const latestGeom = event.geometry[event.geometry.length - 1];
  const earliestGeom = event.geometry[0];
  const mag = latestGeom.magnitudeValue;

  const magBoost = magnitudeBoost(cat, mag);

  const span = (geomTime(latestGeom) - geomTime(earliestGeom)) / 86_400_000;
  const longevity = (Math.max(0, Math.min(span, 60)) / 60) * 15;

  const ageDays = (Date.now() - geomTime(latestGeom)) / 86_400_000;
  const recency = (Math.max(0, 14 - ageDays) / 14) * 10;

  // Proximity penalty + nearest-city attribution
  let proximity = 0;
  let nearestCityKm = Infinity;
  let nearestCity: string | null = null;

  for (const point of points) {
    for (const city of cities) {
      const d = haversine(point.lat, point.lng, city.lat, city.lng);
      if (d < nearestCityKm) {
        nearestCityKm = d;
        nearestCity = `${city.n}, ${city.c}`;
      }
      if (d <= 150) {
        const cityWeight = Math.log10(city.p / 100_000) + 1; // 100k→1, 1M→2, 10M→3
        const distFactor = d < 50 ? 1 : 1 - (d - 50) / 100; // taper 50→150
        proximity += cityWeight * Math.max(0, distFactor) * 6;
      }
    }
  }
  proximity = Math.min(proximity, 80);

  // Hard suppressions — the threat-awe filter
  let suppressed = false;
  let suppressionReason: string | undefined;
  if (cat === "wildfires" && nearestCityKm < 100) {
    suppressed = true;
    suppressionReason = `wildfire within ${nearestCityKm.toFixed(0)}km of ${nearestCity}`;
  }
  if (cat === "severeStorms" && nearestCityKm < 200) {
    suppressed = true;
    suppressionReason = `storm within ${nearestCityKm.toFixed(0)}km of ${nearestCity}`;
  }
  if (
    cat === "earthquakes" &&
    (mag === null || mag === undefined || mag < 6.5)
  ) {
    base = 15; // smaller quakes get a smaller base; not suppressed outright
  }

  // Mundanity penalty — small fires, etc.
  let mundanity = 0;
  if (
    cat === "wildfires" &&
    (mag === null || mag === undefined || mag < 1000)
  ) {
    mundanity = 15;
  }

  const total = base + magBoost + longevity + recency - proximity - mundanity;
  const score = suppressed ? 0 : Math.max(0, total);

  return {
    base,
    magnitude: magBoost,
    longevity,
    recency,
    proximity,
    mundanity,
    total,
    score,
    nearestCityKm,
    nearestCity,
    suppressed,
    suppressionReason,
  };
}

export function curate(events: EonetEvent[], floor = SCORE_FLOOR): ScoredEvent[] {
  return events
    .map<ScoredEvent>((event) => {
      const breakdown = scoreEvent(event);
      const category = event.categories[0]?.id as CategoryId;
      return {
        event,
        score: breakdown.score,
        breakdown,
        category,
      };
    })
    .filter((s) => s.score >= floor)
    .sort((a, b) => b.score - a.score);
}

/**
 * Diversify by category: prefer the top-scored event of each category before
 * doubling up. This prevents the inbox from collapsing into "six icebergs"
 * when the EONET feed is dominated by one category, while still respecting
 * the score ordering for ties between categories.
 */
function diversifyByCategory(
  pool: ScoredEvent[],
  count: number,
  maxPerCategory = 2,
): ScoredEvent[] {
  const taken: ScoredEvent[] = [];
  const counts = new Map<string, number>();
  // First pass: one per category, in score order
  for (const s of pool) {
    if (taken.length >= count) break;
    if ((counts.get(s.category) ?? 0) === 0) {
      taken.push(s);
      counts.set(s.category, 1);
    }
  }
  // Second pass: fill up to maxPerCategory each, then anything remaining
  if (taken.length < count) {
    for (const s of pool) {
      if (taken.length >= count) break;
      if (taken.includes(s)) continue;
      const cur = counts.get(s.category) ?? 0;
      if (cur < maxPerCategory) {
        taken.push(s);
        counts.set(s.category, cur + 1);
      }
    }
  }
  if (taken.length < count) {
    for (const s of pool) {
      if (taken.length >= count) break;
      if (!taken.includes(s)) taken.push(s);
    }
  }
  return taken;
}

/**
 * Top-level feed builder. Wrapped in React.cache() so multiple callers within
 * a single request share the same result (page + generateMetadata + OG).
 * Cross-request caching is handled by the underlying `fetch` revalidate.
 */
export const getCuratedFeed = cache(async (): Promise<CuratedFeed> => {
  const openRaw = await fetchOpenEvents(60);
  const liveScored = curate(openRaw, SCORE_FLOOR);

  let today: ScoredEvent | null = liveScored[0] ?? null;
  let pool: ScoredEvent[] = liveScored.slice(1);

  if (liveScored.length < 7) {
    const closedRaw = await fetchClosedEvents(180);
    const archive = curate(closedRaw, ARCHIVE_FLOOR).map<ScoredEvent>((s) => ({
      ...s,
      archive: true,
    }));
    if (!today && archive.length > 0) {
      today = archive[0];
      pool = [...pool, ...archive.slice(1)];
    } else {
      pool = [...pool, ...archive];
    }
  }

  // Resolve imagery for hero + inbox in parallel.
  // The inbox is diversified so a feed dominated by one category doesn't
  // collapse the page into six iterations of the same reflection.
  const inbox = diversifyByCategory(pool, 6, 2);
  const all = today ? [today, ...inbox] : inbox;

  await Promise.all(
    all.map(async (s) => {
      const points = pointsFromGeometry(s.event.geometry);
      if (points.length === 0) return;
      // Use a tighter bbox for detail-page hero, normal for cards
      const lastPoint = points[points.length - 1];
      const dateRef = new Date(
        s.event.geometry[s.event.geometry.length - 1]?.date ?? Date.now(),
      );
      s.imagery = await resolveImagery(lastPoint.lat, lastPoint.lng, dateRef);
    }),
  );

  return {
    today,
    inbox,
    generatedAt: new Date().toISOString(),
    totalConsidered: openRaw.length,
  };
});

/**
 * Debug helper used by the verification step. Returns a tidy table of the
 * top N raw-considered events with score breakdown so we can prove the
 * threat-awe filter is doing its job against live data.
 */
export async function debugScoreReport(limit = 12): Promise<
  Array<{
    id: string;
    title: string;
    category: CategoryId;
    base: number;
    mag: number;
    longevity: number;
    recency: number;
    proximity: number;
    mundanity: number;
    score: number;
    nearestKm: number;
    nearestCity: string | null;
    suppressed: boolean;
    reason?: string;
  }>
> {
  const open = await fetchOpenEvents(60);
  const closed = await fetchClosedEvents(60);
  const all = [...open, ...closed];
  const rows = all
    .map((event) => {
      const b = scoreEvent(event);
      return {
        id: event.id,
        title: event.title,
        category: (event.categories[0]?.id ?? ("manmade" as CategoryId)),
        base: Math.round(b.base * 10) / 10,
        mag: Math.round(b.magnitude * 10) / 10,
        longevity: Math.round(b.longevity * 10) / 10,
        recency: Math.round(b.recency * 10) / 10,
        proximity: Math.round(b.proximity * 10) / 10,
        mundanity: Math.round(b.mundanity * 10) / 10,
        score: Math.round(b.score * 10) / 10,
        nearestKm: Math.round(b.nearestCityKm),
        nearestCity: b.nearestCity,
        suppressed: b.suppressed,
        reason: b.suppressionReason,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return rows;
}
