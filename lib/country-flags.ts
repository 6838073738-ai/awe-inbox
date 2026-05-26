import * as flags from "country-flag-icons/string/1x1";
import countryLabels from "./country-labels.json";

/**
 * Static label point + identification for one country, as produced by
 * `scripts/build-countries.mjs`. Coordinates are the Natural Earth LABEL_X/Y
 * properties (or polygon centroid fallback) — these are designed for label
 * placement and avoid landing in oceans the way naive centroids sometimes do.
 */
export type CountryLabel = {
  iso2: string;
  name: string;
  lat: number;
  lng: number;
  pop: number;
};

export const COUNTRY_LABELS: CountryLabel[] = countryLabels as CountryLabel[];

const FLAG_STRINGS = flags as unknown as Record<string, string>;

/**
 * Returns the inlined SVG string for a country's flag, or null if the
 * `country-flag-icons` package doesn't ship a flag for that ISO-2 code.
 * SVGs come directly from a static npm package, so it is safe to render with
 * `dangerouslySetInnerHTML`.
 */
export function getFlagSvg(iso2: string): string | null {
  return FLAG_STRINGS[iso2] ?? null;
}
