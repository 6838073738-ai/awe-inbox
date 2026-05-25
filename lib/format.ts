import type { EonetEvent, EonetGeometry } from "./types";

export function lastPointGeom(
  geom: EonetGeometry[],
): { lat: number; lng: number; date: string } | null {
  for (let i = geom.length - 1; i >= 0; i--) {
    const g = geom[i];
    if (g.type === "Point") {
      return { lng: g.coordinates[0], lat: g.coordinates[1], date: g.date };
    }
  }
  return null;
}

export function formatCoords(lat: number, lng: number): string {
  const latH = lat >= 0 ? "N" : "S";
  const lngH = lng >= 0 ? "E" : "W";
  const fmt = (n: number) => Math.abs(n).toFixed(2).padStart(5, " ");
  return `${fmt(lat)}°${latH}  ${fmt(lng)}°${lngH}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.valueOf())) return "—";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}  ${hh}:${mi} UTC`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.valueOf())) return "—";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
];
export function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

/**
 * Build a satellite-image alt string with enough detail to be useful to a
 * screen reader. Format: "Satellite imagery of <title>, captured by <sensor>
 * on <date>, viewed from low Earth orbit."
 */
export function altForImagery(
  event: EonetEvent,
  layer: string | undefined,
  date: string | undefined,
): string {
  const sensor = layer?.includes("VIIRS")
    ? "the VIIRS instrument aboard Suomi NPP"
    : layer?.includes("Aqua")
      ? "MODIS aboard NASA's Aqua satellite"
      : layer?.includes("Terra")
        ? "MODIS aboard NASA's Terra satellite"
        : "a NASA Earth-observing satellite";
  const datePart = date ? ` on ${date}` : "";
  return `Satellite imagery of ${event.title}, captured by ${sensor}${datePart}, viewed from low Earth orbit.`;
}
