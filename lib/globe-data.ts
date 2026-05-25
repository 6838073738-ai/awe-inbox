import "server-only";
import { cache } from "react";
import { fetchOpenEvents } from "./eonet";
import { buildGibsUrl, gradientSeed } from "./gibs";
import { scoreEvent } from "./curation";
import { reflections } from "./reflections";
import { lastPointGeom } from "./format";
import { CONFLICTS } from "./conflicts";
import type { CategoryId, EonetEvent } from "./types";

export type GlobePoint = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category: CategoryId;
  /** ISO date of latest geometry point */
  date: string;
  /** 0..1, used to size the marker */
  weight: number;
  /** Score from the curation pass — used for ordering / decisions */
  score: number;
  /** Pre-computed close-up satellite tile URL (loaded lazily by the modal) */
  closeUpUrl: string;
  /** Wider context tile URL (loaded by the modal hero) */
  contextUrl: string;
  /** Short reflection text (1 sentence, used in the tooltip) */
  reflectionShort: string;
  /** Long reflection text (used in the modal body) */
  reflectionLong: string;
  /** Deterministic gradient seed for fallback when imagery fails */
  gradient: { hue: number; angle: number; rx: number; ry: number };
  /** Nearest populated place — for the "what makes this awe" framing */
  nearestCity: string | null;
  nearestCityKm: number;
};

const SHOW_FLOOR = 35; // looser than the curated-feed floor; we want richness
const MAX_PER_CATEGORY = 8; // avoid overwhelming with 286 wildfires
const HARD_MAX = 60;

function dateStepBack(iso: string, days = 2): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function pointFor(event: EonetEvent): { lat: number; lng: number; date: string } | null {
  const p = lastPointGeom(event.geometry);
  return p;
}

/**
 * Globe points = "everything worth looking at right now", with the threat-awe
 * filter applied. The set is larger than the curated 7-card inbox because the
 * globe is the experience now — but it's still much smaller than the raw 307
 * EONET events, which would clutter the planet with US wildfires.
 *
 * Wrapped in React.cache so concurrent callers (page, metadata, OG) share
 * one fetch + score pass.
 */
export const getGlobePoints = cache(async (): Promise<GlobePoint[]> => {
  const events = await fetchOpenEvents(60);

  // Score everything, drop manmade and anything below SHOW_FLOOR
  const scored = events
    .map((event) => {
      const b = scoreEvent(event);
      return { event, breakdown: b };
    })
    .filter((s) => s.breakdown.score >= SHOW_FLOOR && !s.breakdown.suppressed)
    .sort((a, b) => b.breakdown.score - a.breakdown.score);

  // Cap per category so the inbox doesn't drown in one type
  const perCat = new Map<CategoryId, number>();
  const kept: typeof scored = [];
  for (const s of scored) {
    if (kept.length >= HARD_MAX) break;
    const cat = s.event.categories[0]?.id as CategoryId;
    const n = perCat.get(cat) ?? 0;
    if (n >= MAX_PER_CATEGORY) continue;
    kept.push(s);
    perCat.set(cat, n + 1);
  }

  const out: GlobePoint[] = [];
  for (const s of kept) {
    const event = s.event;
    const cat = event.categories[0]?.id as CategoryId;
    if (!cat || cat === "manmade") continue;
    const p = pointFor(event);
    if (!p) continue;

    const refKey = cat as keyof typeof reflections;
    const ref = reflections[refKey];

    const dateISO = dateStepBack(p.date, 2);
    const closeUpUrl = buildGibsUrl({
      lat: p.lat,
      lng: p.lng,
      dateISO,
      halfWidthDeg: 2,
      width: 1600,
      height: 800,
    });
    const contextUrl = buildGibsUrl({
      lat: p.lat,
      lng: p.lng,
      dateISO,
      halfWidthDeg: 6,
      width: 1600,
      height: 800,
    });

    const magNum =
      typeof s.event.geometry[s.event.geometry.length - 1]?.magnitudeValue ===
      "number"
        ? (s.event.geometry[s.event.geometry.length - 1]
            ?.magnitudeValue as number)
        : 0;
    const weight = Math.max(
      0.2,
      Math.min(1, Math.log10(Math.max(magNum, 1)) / 5),
    );

    out.push({
      id: event.id,
      title: event.title,
      lat: p.lat,
      lng: p.lng,
      category: cat,
      date: p.date,
      weight,
      score: s.breakdown.score,
      closeUpUrl,
      contextUrl,
      reflectionShort: ref?.short ?? "",
      reflectionLong: ref?.long ?? "",
      gradient: gradientSeed(p.lat, p.lng),
      nearestCity: s.breakdown.nearestCity,
      nearestCityKm: s.breakdown.nearestCityKm,
    });
  }

  // Append the static conflict layer. These don't go through EONET scoring;
  // they're a curated editorial layer and always shown. The modal uses each
  // conflict's own summary in place of a category-level reflection.
  const today = new Date();
  const todayISO = dateStepBack(today.toISOString(), 2);
  for (const c of CONFLICTS) {
    out.push({
      id: c.id,
      title: c.title,
      lat: c.lat,
      lng: c.lng,
      category: "conflict",
      date: `${c.since}-01T00:00:00Z`,
      weight: 1,
      score: 100,
      closeUpUrl: buildGibsUrl({
        lat: c.lat,
        lng: c.lng,
        dateISO: todayISO,
        halfWidthDeg: 2,
        width: 1600,
        height: 800,
      }),
      contextUrl: buildGibsUrl({
        lat: c.lat,
        lng: c.lng,
        dateISO: todayISO,
        halfWidthDeg: 6,
        width: 1600,
        height: 800,
      }),
      reflectionShort: c.summary,
      reflectionLong: c.summary,
      gradient: gradientSeed(c.lat, c.lng),
      nearestCity: null,
      nearestCityKm: 0,
    });
  }

  return out;
});
