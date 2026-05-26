import "server-only";

/**
 * GDELT 2.0 DOC API — free, no auth, English-language article search.
 * Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
 *
 * We restrict to a curated allow-list of reputable English-language outlets
 * so the popup/detail-page citations are credible. GDELT supports filtering
 * with `domain:` and `sourcecountry:` operators.
 */

// Allowlist of reputable English-language outlets. We query GDELT broadly
// (sourcelang:eng + country name) and then accept only articles whose host
// matches this list — putting the trust filter in post-processing keeps the
// GDELT query simple and reliable.
const REPUTABLE_DOMAINS = new Set<string>([
  // Western majors
  "bbc.com",
  "bbc.co.uk",
  "reuters.com",
  "apnews.com",
  "aljazeera.com",
  "aljazeera.net",
  "theguardian.com",
  "nytimes.com",
  "ft.com",
  "economist.com",
  "washingtonpost.com",
  "wsj.com",
  "bloomberg.com",
  "cnn.com",
  "us.cnn.com",
  "edition.cnn.com",
  "npr.org",
  "abc.net.au",
  "france24.com",
  "lemonde.fr",
  "dw.com",
  "euronews.com",
  "politico.com",
  "politico.eu",
  "time.com",
  "theatlantic.com",
  "newyorker.com",
  "foreignpolicy.com",
  "foreignaffairs.com",
  "thediplomat.com",
  "csis.org",
  "cbc.ca",
  // Asia-Pacific
  "scmp.com",
  "japantimes.co.jp",
  "asahi.com",
  "mainichi.jp",
  "nikkei.com",
  "channelnewsasia.com",
  "straitstimes.com",
  "todayonline.com",
  "thehindu.com",
  "ndtv.com",
  "indianexpress.com",
  "hindustantimes.com",
  "thedailystar.net",
  "dawn.com",
  "tribune.com.pk",
  "rappler.com",
  "inquirer.net",
  "abs-cbn.com",
  "vnexpress.net",
  "bangkokpost.com",
  "thejakartapost.com",
  "kompas.com",
  "koreatimes.co.kr",
  "koreaherald.com",
  "yna.co.kr",
  "taipeitimes.com",
  // Middle East / Africa
  "haaretz.com",
  "timesofisrael.com",
  "jpost.com",
  "arabnews.com",
  "thenationalnews.com",
  "ahram.org.eg",
  "egypttoday.com",
  "iol.co.za",
  "news24.com",
  "mg.co.za",
  "businessdaily.co.ke",
  "premiumtimesng.com",
  "thecitizen.co.tz",
  "monitor.co.ug",
  // Latin America
  "bbc.com/mundo",
  "buenosairesherald.com",
  "batimes.com.ar",
  "riotimesonline.com",
  "brazilian.report",
  "mexiconewsdaily.com",
  // Europe (continent)
  "spiegel.de",
  "zeit.de",
  "elpais.com",
  "lefigaro.fr",
  "rfi.fr",
  "repubblica.it",
  "ansa.it",
  "thelocal.de",
  "thelocal.se",
  "thelocal.fr",
  "irishtimes.com",
  "rte.ie",
]);

export type CountryNews = {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO 8601
  language: string;
};

type GdeltArticle = {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string; // "YYYYMMDDTHHMMSSZ"
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
};

function parseSeenDate(s: string): string {
  // GDELT: "20260525T034553Z"
  if (!s || s.length < 15) return new Date().toISOString();
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(
    9,
    11,
  )}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString();
}

/**
 * Fetch up to `count` recent reputable English-language news articles
 * mentioning the given country. Results are deduplicated by host so a single
 * outlet doesn't fill all three slots.
 *
 * `iso2` should be ISO 3166-1 alpha-2 (e.g. "FR", "JP"). GDELT's
 * `sourcecountry:` accepts the FIPS 10-4 code; we let the search query carry
 * the country name instead, which is more reliably matched.
 */
function hostMatchesAllowlist(domain: string): boolean {
  const d = domain.toLowerCase();
  if (REPUTABLE_DOMAINS.has(d)) return true;
  // Also accept "us.cnn.com" if "cnn.com" is on the list (any subdomain).
  for (const allowed of REPUTABLE_DOMAINS) {
    if (d === allowed || d.endsWith("." + allowed)) return true;
  }
  return false;
}

export async function fetchCountryNews(
  iso2: string,
  countryName: string,
  count = 3,
): Promise<CountryNews[]> {
  // Broad GDELT query — language + country name only. Trust filtering
  // happens in post-processing against REPUTABLE_DOMAINS.
  const q = `"${countryName}" sourcelang:eng`;
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${encodeURIComponent(q)}` +
    `&format=json` +
    `&maxrecords=75` + // ~25 reputable + plenty of headroom for filtering
    `&sort=hybridrel` +
    `&timespan=24h`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 6 }, // 6h CDN cache
      headers: {
        "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
      },
    });
    if (!res.ok) {
      console.warn("[country-news] GDELT not ok", iso2, res.status);
      return [];
    }
    const text = await res.text();
    let json: { articles?: GdeltArticle[] };
    try {
      json = JSON.parse(text);
    } catch {
      console.warn(
        "[country-news] GDELT non-JSON for",
        iso2,
        "preview:",
        text.slice(0, 120),
      );
      return [];
    }
    const articles = json.articles ?? [];
    if (articles.length === 0) {
      console.warn("[country-news] GDELT 0 articles for", iso2);
    }

    const seenHosts = new Set<string>();
    const out: CountryNews[] = [];
    let allowMatches = 0;
    for (const a of articles) {
      if (!a.title || !a.url || !a.domain) continue;
      if (!hostMatchesAllowlist(a.domain)) continue;
      allowMatches += 1;
      if (seenHosts.has(a.domain)) continue;
      seenHosts.add(a.domain);
      out.push({
        title: a.title,
        url: a.url,
        source: a.domain,
        publishedAt: parseSeenDate(a.seendate),
        language: a.language || "English",
      });
      if (out.length >= count) break;
    }
    if (articles.length > 0 && allowMatches === 0) {
      console.warn(
        "[country-news] none of",
        articles.length,
        "articles matched allowlist for",
        iso2,
        "— sample hosts:",
        articles
          .slice(0, 5)
          .map((a) => a.domain)
          .join(", "),
      );
    }
    return out;
  } catch (e) {
    console.error("[country-news] fetch failed", iso2, e);
    return [];
  }
}
