import "server-only";

/**
 * Free, no-auth lookups for country basics. All three sources are designed
 * for public consumption and well-suited to cited use:
 *
 *  - Wikipedia REST API — summary card with extract + page URL
 *  - REST Countries — capital, region, languages, area, flag emoji
 *  - World Bank Open Data — macroeconomic indicators (GDP, population, ...)
 */

export type WikipediaSummary = {
  title: string;
  extract: string;
  url: string;
  thumbnail: { source: string; width: number; height: number } | null;
};

export type RestCountriesData = {
  iso2: string;
  iso3: string;
  name: string;
  officialName: string;
  capital: string | null;
  region: string;
  subregion: string | null;
  population: number;
  area: number; // km²
  languages: string[];
  currencies: Array<{ code: string; name: string; symbol: string }>;
  flagEmoji: string;
  googleMaps: string | null;
};

export type WorldBankIndicator = {
  indicator: string;
  label: string;
  value: number | null;
  year: number | null;
  unit: string;
};

const HEADERS = {
  "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
  accept: "application/json",
};

const REVALIDATE = 60 * 60 * 24; // 24h cache for all country basics

export async function fetchWikipediaSummary(
  countryName: string,
): Promise<WikipediaSummary | null> {
  const slug = countryName.replace(/\s+/g, "_");
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      thumbnail?: { source: string; width: number; height: number };
    };
    return {
      title: json.title ?? countryName,
      extract: json.extract ?? "",
      url:
        json.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${slug}`,
      thumbnail: json.thumbnail ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchRestCountries(
  iso2: string,
): Promise<RestCountriesData | null> {
  const url = `https://restcountries.com/v3.1/alpha/${iso2.toLowerCase()}?fields=name,capital,region,subregion,population,area,languages,currencies,cca2,cca3,flag,maps`;
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      name?: { common?: string; official?: string };
      capital?: string[];
      region?: string;
      subregion?: string;
      population?: number;
      area?: number;
      languages?: Record<string, string>;
      currencies?: Record<string, { name: string; symbol: string }>;
      cca2?: string;
      cca3?: string;
      flag?: string;
      maps?: { googleMaps?: string };
    }>;
    const c = Array.isArray(data) ? data[0] : (data as unknown as typeof data[0]);
    if (!c) return null;
    return {
      iso2: c.cca2 ?? iso2,
      iso3: c.cca3 ?? "",
      name: c.name?.common ?? "",
      officialName: c.name?.official ?? c.name?.common ?? "",
      capital: c.capital?.[0] ?? null,
      region: c.region ?? "",
      subregion: c.subregion ?? null,
      population: c.population ?? 0,
      area: c.area ?? 0,
      languages: c.languages ? Object.values(c.languages) : [],
      currencies: c.currencies
        ? Object.entries(c.currencies).map(([code, v]) => ({
            code,
            name: v.name,
            symbol: v.symbol,
          }))
        : [],
      flagEmoji: c.flag ?? "",
      googleMaps: c.maps?.googleMaps ?? null,
    };
  } catch {
    return null;
  }
}

const WB_INDICATORS: Array<{
  indicator: string;
  label: string;
  unit: string;
}> = [
  { indicator: "NY.GDP.MKTP.CD", label: "GDP", unit: "USD" },
  { indicator: "NY.GDP.PCAP.CD", label: "GDP per capita", unit: "USD" },
  { indicator: "NY.GDP.MKTP.KD.ZG", label: "GDP growth", unit: "%" },
  { indicator: "FP.CPI.TOTL.ZG", label: "Inflation", unit: "%" },
  { indicator: "SL.UEM.TOTL.ZS", label: "Unemployment", unit: "%" },
  { indicator: "SP.DYN.LE00.IN", label: "Life expectancy", unit: "years" },
];

async function fetchWBIndicator(
  iso2: string,
  indicator: string,
  label: string,
  unit: string,
): Promise<WorldBankIndicator> {
  const url = `https://api.worldbank.org/v2/country/${iso2.toLowerCase()}/indicator/${indicator}?format=json&per_page=10&mrnev=1`;
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return { indicator, label, value: null, year: null, unit };
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || json.length < 2)
      return { indicator, label, value: null, year: null, unit };
    const rows = json[1] as Array<{ value: number | null; date: string }>;
    const latest = rows?.find((r) => r.value !== null);
    if (!latest) return { indicator, label, value: null, year: null, unit };
    return {
      indicator,
      label,
      value: latest.value,
      year: Number.parseInt(latest.date, 10),
      unit,
    };
  } catch {
    return { indicator, label, value: null, year: null, unit };
  }
}

export async function fetchWorldBankSnapshot(
  iso2: string,
): Promise<WorldBankIndicator[]> {
  const results = await Promise.all(
    WB_INDICATORS.map((ind) =>
      fetchWBIndicator(iso2, ind.indicator, ind.label, ind.unit),
    ),
  );
  return results.filter((r) => r.value !== null);
}
