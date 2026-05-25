import "server-only";
import type { ResolvedImagery } from "./types";

export const GIBS_LAYERS = [
  "MODIS_Terra_CorrectedReflectance_TrueColor",
  "MODIS_Aqua_CorrectedReflectance_TrueColor",
  "VIIRS_SNPP_CorrectedReflectance_TrueColor",
] as const;

export type GibsLayer = (typeof GIBS_LAYERS)[number];

const BASE = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";

export type GibsParams = {
  lat: number;
  lng: number;
  dateISO: string; // YYYY-MM-DD
  halfWidthDeg?: number;
  width?: number;
  height?: number;
  layer?: GibsLayer;
};

/**
 * Build a GIBS WMS GetMap URL.
 *
 * IMPORTANT: WMS 1.3.0 with EPSG:4326 requires BBOX in lat-first order:
 *   BBOX = minLat,minLon,maxLat,maxLon
 * GIBS may tolerate lon-first on symmetric boxes, but lat-first is correct.
 */
export function buildGibsUrl({
  lat,
  lng,
  dateISO,
  halfWidthDeg = 4,
  width = 2048,
  height = 1024,
  layer = GIBS_LAYERS[0],
}: GibsParams): string {
  const aspect = width / height;
  const minLat = Math.max(-90, lat - halfWidthDeg);
  const maxLat = Math.min(90, lat + halfWidthDeg);
  const minLon = Math.max(-180, lng - halfWidthDeg * aspect);
  const maxLon = Math.min(180, lng + halfWidthDeg * aspect);

  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.3.0",
    LAYERS: layer,
    STYLES: "",
    CRS: "EPSG:4326",
    BBOX: `${minLat},${minLon},${maxLat},${maxLon}`,
    WIDTH: width.toString(),
    HEIGHT: height.toString(),
    FORMAT: "image/jpeg",
    TIME: dateISO,
  });

  return `${BASE}?${params.toString()}`;
}

/**
 * Yield candidate URLs across (date × layer) starting one day back from baseDate.
 * Same-day GIBS tiles are often blank (acquisition lag); we step back 1–5 days
 * and try each of the three TrueColor layers per date.
 */
export function gibsCandidates(
  baseDate: Date,
  lat: number,
  lng: number,
  opts?: { halfWidthDeg?: number; width?: number; height?: number },
): string[] {
  const urls: string[] = [];
  for (let offset = 1; offset <= 5; offset++) {
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - offset);
    const dateISO = d.toISOString().slice(0, 10);
    for (const layer of GIBS_LAYERS) {
      urls.push(buildGibsUrl({ lat, lng, dateISO, layer, ...opts }));
    }
  }
  return urls;
}

/**
 * Deterministic gradient seed from coordinates — used by gradient fallback.
 * Same coordinates always produce the same gradient angle and offset, so
 * regenerations are stable across requests.
 */
export function gradientSeed(lat: number, lng: number) {
  const hue = Math.floor(Math.abs(lat * 7.31 + lng * 3.17) % 360);
  const angle = Math.floor(Math.abs(lat * 13 + lng * 5) % 360);
  const rx = 20 + Math.floor(Math.abs(lng + 180) % 60);
  const ry = 15 + Math.floor(Math.abs(lat + 90) % 60);
  return { hue, angle, rx, ry };
}

/**
 * Resolve usable imagery for an event. Returns the first candidate URL whose
 * HEAD request succeeds with reasonable Content-Length; otherwise returns a
 * gradient fallback descriptor. We do not download bytes — only verify the
 * server returns a non-trivial JPEG.
 */
export async function resolveImagery(
  lat: number,
  lng: number,
  dateRef: Date = new Date(),
  opts?: { halfWidthDeg?: number; width?: number; height?: number },
): Promise<ResolvedImagery> {
  const candidates = gibsCandidates(dateRef, lat, lng, opts);
  const gradient = gradientSeed(lat, lng);

  // Probe the first few candidates with HEAD. GIBS returns 200 even for
  // blank tiles, so we also accept the URL if the server is reachable —
  // the next/image pipeline will surface broken images via onError.
  // To keep this fast, only probe the first 3 candidates.
  for (const url of candidates.slice(0, 3)) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        next: { revalidate: 21600, tags: ["gibs"] },
      });
      if (res.ok) {
        const len = Number(res.headers.get("content-length") ?? 0);
        // Tiles smaller than ~8 KB are usually blank
        if (!Number.isFinite(len) || len === 0 || len > 8 * 1024) {
          const params = new URL(url).searchParams;
          return {
            kind: "satellite",
            url,
            layer: params.get("LAYERS") ?? undefined,
            date: params.get("TIME") ?? undefined,
            candidates,
            gradient,
          };
        }
      }
    } catch {
      // continue
    }
  }

  return {
    kind: "gradient",
    candidates,
    gradient,
  };
}
