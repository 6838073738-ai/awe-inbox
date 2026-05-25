import "server-only";
import type { EonetCollection, EonetEvent } from "./types";

const BASE = "https://eonet.gsfc.nasa.gov/api/v3";
// Refresh once per day. EONET itself updates events throughout the day, but
// the visual change to the globe is small enough that one curation pass per
// 24h matches the contemplative cadence of the product.
const REVALIDATE_SECONDS = 86400;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["eonet"] },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(
      `EONET fetch failed: ${res.status} ${res.statusText} for ${url}`,
    );
  }
  return (await res.json()) as T;
}

export async function fetchOpenEvents(days = 60): Promise<EonetEvent[]> {
  try {
    const data = await fetchJson<EonetCollection>(
      `${BASE}/events?status=open&days=${days}`,
    );
    return data.events ?? [];
  } catch (err) {
    console.error("[eonet] fetchOpenEvents failed:", err);
    return [];
  }
}

export async function fetchClosedEvents(days = 180): Promise<EonetEvent[]> {
  try {
    const data = await fetchJson<EonetCollection>(
      `${BASE}/events?status=closed&days=${days}`,
    );
    return data.events ?? [];
  } catch (err) {
    console.error("[eonet] fetchClosedEvents failed:", err);
    return [];
  }
}
