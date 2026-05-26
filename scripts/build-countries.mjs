// Downloads Natural Earth Vector 110m admin-0 countries, projects every border
// segment to Cartesian on a 1.002-radius sphere, and writes two committed
// artefacts:
//
//   lib/country-borders.json — flat Float32-friendly array of (x0,y0,z0,x1,y1,z1)
//   triplets representing every line segment for every border polygon ring.
//   Loaded once on globe mount and turned straight into a THREE.LineSegments mesh.
//
//   lib/country-labels.json — [{ iso2, name, lat, lng, pop }] for every country,
//   sorted by population descending. The runtime overlay decides which subset
//   to render (currently: all 250+, with collision-cull at draw time).
//
// Run manually: `node scripts/build-countries.mjs`
// Source: Natural Earth Vector (https://www.naturalearthdata.com — public domain)
// Re-run after a geopolitical border change (rare; ~yearly cadence).
//
// Notes:
// - Antarctica's outer ring is aggressively simplified (1/4 of its vertices)
//   because at our globe scale the detail is invisible and costs ~30% of the
//   total segment count.
// - Long segments (> ~5° of great-circle arc) are subdivided so the polyline
//   hugs the sphere instead of cutting a straight chord through it.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const BORDERS_OUT = fileURLToPath(
  new URL("../lib/country-borders.json", import.meta.url),
);
const LABELS_OUT = fileURLToPath(
  new URL("../lib/country-labels.json", import.meta.url),
);
const RADIUS = 1.002; // sits just above the texture's r=1.0, below markers (1.012)
const MAX_SEGMENT_RAD = (5 * Math.PI) / 180; // subdivide arcs longer than ~5°
const ANTARCTICA_DECIMATE = 4; // keep 1/4 of Antarctica's vertices

mkdirSync(dirname(BORDERS_OUT), { recursive: true });

console.log("[countries] downloading", SRC);
const res = await fetch(SRC);
if (!res.ok) {
  console.error("[countries] download failed:", res.status, res.statusText);
  process.exit(1);
}
const geojson = await res.json();
console.log(
  "[countries] received",
  geojson.features.length,
  "features",
);

function latLngToVec3(lat, lng, r = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

// Returns the great-circle angle between two lng/lat points in radians.
function angularDistance(lng1, lat1, lng2, lat2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Linear interpolation in lat/lng space — accurate enough for sub-5° splits.
function midpoint(lng1, lat1, lng2, lat2) {
  return [(lng1 + lng2) / 2, (lat1 + lat2) / 2];
}

// Push consecutive line segments for a ring of [lng,lat] points to the
// segments accumulator. Long arcs are recursively subdivided so they hug
// the sphere on render.
function emitRing(segments, ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    if (
      !Number.isFinite(lng1) ||
      !Number.isFinite(lat1) ||
      !Number.isFinite(lng2) ||
      !Number.isFinite(lat2)
    ) {
      continue;
    }
    // Skip segments that cross the antimeridian (lng wraps from +179 to -179)
    // which would otherwise draw a giant chord across the globe.
    if (Math.abs(lng2 - lng1) > 180) continue;

    subdivideAndPush(segments, lng1, lat1, lng2, lat2);
  }
}

function subdivideAndPush(segments, lng1, lat1, lng2, lat2, depth = 0) {
  const arc = angularDistance(lng1, lat1, lng2, lat2);
  if (arc < MAX_SEGMENT_RAD || depth > 5) {
    const a = latLngToVec3(lat1, lng1);
    const b = latLngToVec3(lat2, lng2);
    segments.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    return;
  }
  const [mlng, mlat] = midpoint(lng1, lat1, lng2, lat2);
  subdivideAndPush(segments, lng1, lat1, mlng, mlat, depth + 1);
  subdivideAndPush(segments, mlng, mlat, lng2, lat2, depth + 1);
}

// Polygon centroid fallback when LABEL_X/Y aren't provided.
function ringCentroid(ring) {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const [lng, lat] of ring) {
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      sx += lng;
      sy += lat;
      n += 1;
    }
  }
  return n > 0 ? [sx / n, sy / n] : [0, 0];
}

const segments = [];
const labels = [];

for (const feat of geojson.features) {
  const props = feat.properties ?? {};
  const iso2 = (
    props.ISO_A2_EH ||
    props.ISO_A2 ||
    props.WB_A2 ||
    ""
  ).toUpperCase();
  const name = props.NAME || props.NAME_LONG || props.ADMIN || "";
  const pop = Number.isFinite(props.POP_EST) ? props.POP_EST : 0;
  const isAntarctica = name === "Antarctica" || iso2 === "AQ";

  const labelLng = Number.isFinite(props.LABEL_X)
    ? props.LABEL_X
    : null;
  const labelLat = Number.isFinite(props.LABEL_Y)
    ? props.LABEL_Y
    : null;

  // Iterate every polygon ring across Polygon and MultiPolygon geometries
  const geom = feat.geometry;
  const polys =
    geom?.type === "Polygon"
      ? [geom.coordinates]
      : geom?.type === "MultiPolygon"
        ? geom.coordinates
        : [];

  let largestRing = null;
  let largestRingLen = 0;

  for (const poly of polys) {
    for (let ringIdx = 0; ringIdx < poly.length; ringIdx++) {
      let ring = poly[ringIdx];
      if (isAntarctica && ringIdx === 0) {
        // Decimate Antarctica's outer ring to keep file size sane.
        ring = ring.filter(
          (_, i) => i % ANTARCTICA_DECIMATE === 0 || i === ring.length - 1,
        );
      }
      emitRing(segments, ring);
      if (ring.length > largestRingLen) {
        largestRingLen = ring.length;
        largestRing = ring;
      }
    }
  }

  // Label point: prefer Natural Earth's LABEL_X/Y, fall back to the largest
  // ring's centroid.
  let lng = labelLng;
  let lat = labelLat;
  if (lng === null || lat === null) {
    if (largestRing) {
      const [clng, clat] = ringCentroid(largestRing);
      lng = clng;
      lat = clat;
    } else {
      continue; // no geometry, can't place a flag
    }
  }

  // Skip features without a valid ISO-2 code (Natural Earth sometimes returns
  // "-99" for disputed/unrecognised territories — these would 404 the flag SVG)
  if (!iso2 || iso2 === "-9" || iso2 === "-99" || iso2.length !== 2) continue;
  // Skip Antarctica from the flag labels (it has no widely-recognised flag in
  // the icon set, and a flag at the south pole would always be edge-clipped)
  if (isAntarctica) continue;

  labels.push({
    iso2,
    name,
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000,
    pop: Math.round(pop),
  });
}

labels.sort((a, b) => b.pop - a.pop);

// Round all border vertex components to 5 decimals to save bytes.
const segmentsRounded = segments.map(
  (v) => Math.round(v * 100000) / 100000,
);

const bordersJson = JSON.stringify({
  radius: RADIUS,
  count: segmentsRounded.length / 6,
  segments: segmentsRounded,
});
const labelsJson = JSON.stringify(labels);

writeFileSync(BORDERS_OUT, bordersJson);
writeFileSync(LABELS_OUT, labelsJson);

console.log(
  `[countries] borders → ${BORDERS_OUT} (${(
    Buffer.byteLength(bordersJson) / 1024
  ).toFixed(1)} KB, ${(segmentsRounded.length / 6).toLocaleString()} segments)`,
);
console.log(
  `[countries] labels  → ${LABELS_OUT} (${(
    Buffer.byteLength(labelsJson) / 1024
  ).toFixed(1)} KB, ${labels.length} countries)`,
);
