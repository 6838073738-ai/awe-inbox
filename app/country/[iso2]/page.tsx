import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUNTRY_LABELS, getFlagSvg } from "@/lib/country-flags";
import {
  fetchWikipediaSummary,
  fetchRestCountries,
  fetchWorldBankSnapshot,
} from "@/lib/country-info";
import { fetchCountryNews, type CountryNews } from "@/lib/country-news";
import { fetchCountryStocks } from "@/lib/country-finance";

export const revalidate = 3600;

type Params = { iso2: string };

function findCountry(rawIso2: string) {
  const iso2 = rawIso2.toUpperCase();
  return COUNTRY_LABELS.find((c) => c.iso2 === iso2) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { iso2 } = await params;
  const country = findCountry(iso2);
  if (!country) return { title: "Country — Awe Inbox" };
  return {
    title: `${country.name} — Awe Inbox`,
    description: `Today's news and economic signals for ${country.name}, cited from reputable sources.`,
  };
}

function fmtNumber(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

function fmtCurrency(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: n >= 100 ? 0 : 2,
    }).format(n);
  } catch {
    return `${currency} ${fmtNumber(n)}`;
  }
}

function fmtBig(n: number): string {
  if (n >= 1_000_000_000_000)
    return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${fmtNumber(n)}`;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const SECTION_LABEL =
  "small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5";
const FOOTNOTE =
  "mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]";
const SOURCE_LINK =
  "underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200";

function HeroSkeleton() {
  return (
    <header
      className="mt-10 flex items-center gap-6 md:gap-8"
      aria-hidden="true"
    >
      <div
        className="shrink-0 skeleton-shimmer"
        style={{ width: 86, height: 86, borderRadius: 999 }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="skeleton-shimmer rounded-[3px]"
          style={{ height: "clamp(2rem, 5vw, 3.6rem)", width: "55%" }}
        />
      </div>
    </header>
  );
}

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 14, width: `${90 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

// === Async section components ===
// Each one fires its own fetch in parallel. The page-level <Suspense>
// boundaries below stream them in as each one resolves, so the page shell
// renders instantly even though Wikipedia/World Bank/GDELT/Yahoo
// collectively take 3-10s.

async function Hero({
  iso2,
  fallbackName,
  flagSvg,
}: {
  iso2: string;
  fallbackName: string;
  flagSvg: string | null;
}) {
  const rc = await fetchRestCountries(iso2);
  return (
    <header className="mt-10 flex items-center gap-6 md:gap-8">
      {flagSvg ? (
        <div
          className="shrink-0"
          style={{
            width: 86,
            height: 86,
            borderRadius: 999,
            overflow: "hidden",
            border:
              "1.5px solid color-mix(in oklab, var(--color-paper) 50%, transparent)",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--color-ink) 90%, transparent), 0 8px 26px color-mix(in oklab, var(--color-ink) 70%, transparent)",
          }}
          dangerouslySetInnerHTML={{ __html: flagSvg }}
          aria-hidden="true"
        />
      ) : null}
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.018em] text-[var(--color-paper)]">
          {rc?.name ?? fallbackName}
        </h1>
        {rc?.officialName && rc.officialName !== rc.name ? (
          <p className="mt-2 mono text-[12px] tracking-[0.08em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            {rc.officialName}
          </p>
        ) : null}
        {rc ? (
          <p className="mt-3 mono text-[12px] tracking-[0.08em] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
            {[rc.capital, rc.subregion ?? rc.region]
              .filter(Boolean)
              .join(" · ")}
            {rc.population
              ? ` · pop ${fmtNumber(rc.population)}`
              : ""}
          </p>
        ) : null}
      </div>
    </header>
  );
}

async function Summary({ countryName }: { countryName: string }) {
  const wiki = await fetchWikipediaSummary(countryName);
  if (!wiki || !wiki.extract) return null;
  return (
    <section className="mt-12">
      <p className="prose-reflection text-[17px] leading-[1.65]">
        {wiki.extract}
      </p>
      <p className={`mt-3 ${FOOTNOTE}`}>
        Source:{" "}
        <a
          href={wiki.url}
          target="_blank"
          rel="noopener noreferrer"
          className={SOURCE_LINK}
        >
          Wikipedia — {wiki.title}
        </a>
      </p>
    </section>
  );
}

async function Indicators({ iso2 }: { iso2: string }) {
  const wb = await fetchWorldBankSnapshot(iso2);
  if (wb.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className={SECTION_LABEL}>Indicators</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
        {wb.map((i) => (
          <div key={i.indicator} className="flex flex-col gap-1.5">
            <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
              {i.label}{" "}
              {i.year ? <span className="opacity-70">({i.year})</span> : null}
            </dt>
            <dd className="mono text-[var(--color-paper)] text-[15px]">
              {i.unit === "USD" && i.value !== null
                ? fmtBig(i.value)
                : i.value !== null
                  ? `${fmtNumber(i.value, { maximumFractionDigits: 2 })} ${i.unit}`
                  : "—"}
            </dd>
          </div>
        ))}
      </dl>
      <p className={`mt-5 ${FOOTNOTE}`}>
        Source:{" "}
        <a
          href={`https://data.worldbank.org/country/${iso2.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className={SOURCE_LINK}
        >
          World Bank Open Data
        </a>
      </p>
    </section>
  );
}

async function News({
  iso2,
  countryName,
}: {
  iso2: string;
  countryName: string;
}) {
  const news = await fetchCountryNews(iso2, countryName, 8);
  if (news.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className={SECTION_LABEL}>Today</h2>
      <ul className="space-y-5">
        {news.map((n) => (
          <li
            key={n.url}
            className="border-b border-[color-mix(in_oklab,var(--color-paper)_10%,transparent)] pb-4 last:border-0"
          >
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="font-display text-[18px] leading-[1.3] text-[var(--color-paper)] group-hover:text-[color-mix(in_oklab,var(--color-paper)_80%,var(--accent))]">
                {n.title}
              </h3>
              <p className="mt-1.5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)]">
                {n.source} · {fmtDate(n.publishedAt)}
              </p>
            </a>
          </li>
        ))}
      </ul>
      <p className={`mt-5 ${FOOTNOTE}`}>
        Headlines via{" "}
        <a
          href="https://www.gdeltproject.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={SOURCE_LINK}
        >
          GDELT
        </a>
        , filtered to a curated list of reputable English-language outlets
        (BBC, Reuters, AP, The Guardian, NYT, FT, Al Jazeera, …).
      </p>
    </section>
  );
}

async function Markets({ iso2 }: { iso2: string }) {
  const stocks = await fetchCountryStocks(iso2, 5);
  if (stocks.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className={SECTION_LABEL}>Markets</h2>
      <ul className="divide-y divide-[color-mix(in_oklab,var(--color-paper)_10%,transparent)]">
        {stocks.map((s) => (
          <li
            key={s.symbol}
            className="py-3 flex items-baseline justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="font-display text-[16px] text-[var(--color-paper)] truncate">
                {s.name}
              </div>
              <div className="mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)]">
                {s.symbol}
                {s.exchange ? ` · ${s.exchange}` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="mono text-[14px] text-[var(--color-paper)]">
                {fmtCurrency(s.price, s.currency)}
              </div>
              <div
                className="mono text-[11px]"
                style={{
                  color:
                    s.changePercent >= 0
                      ? "color-mix(in oklab, #6dd6a4 90%, var(--color-paper))"
                      : "color-mix(in oklab, #ec8c8c 90%, var(--color-paper))",
                }}
              >
                {s.changePercent >= 0 ? "+" : ""}
                {s.changePercent.toFixed(2)}%
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className={`mt-5 ${FOOTNOTE}`}>
        Market data via Yahoo Finance public quote endpoints. Stock
        selection is a curated short-list of widely-tracked listings per
        country; not an index, not investment advice.
      </p>
    </section>
  );
}

async function References({
  iso2,
  countryName,
}: {
  iso2: string;
  countryName: string;
}) {
  // References pulls from all the same upstreams. We let it run last so
  // the cached results from the parallel section fetches above are
  // already warm by the time this one resolves.
  const [wiki, news] = await Promise.all([
    fetchWikipediaSummary(countryName),
    fetchCountryNews(iso2, countryName, 8),
  ]);
  const items: Array<{ label: string; href: string; suffix?: string }> = [];
  if (wiki) {
    items.push({
      label: wiki.url,
      href: wiki.url,
      suffix: `— Wikipedia, "${wiki.title}."`,
    });
  }
  items.push({
    label: `https://data.worldbank.org/country/${iso2.toLowerCase()}`,
    href: `https://data.worldbank.org/country/${iso2.toLowerCase()}`,
    suffix: "— World Bank Open Data.",
  });
  items.push({
    label: "REST Countries v3",
    href: `https://restcountries.com/v3.1/alpha/${iso2.toLowerCase()}`,
    suffix:
      "— country basics (capital, languages, currency, population).",
  });
  const newsItems: CountryNews[] = news;

  return (
    <section className="mt-16">
      <h2 className={SECTION_LABEL}>References</h2>
      <ol className="list-decimal pl-5 space-y-1.5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
        {items.map((it, i) => (
          <li key={`ref-${i}`}>
            <a
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOURCE_LINK} break-all`}
            >
              {it.label}
            </a>{" "}
            {it.suffix}
          </li>
        ))}
        {newsItems.map((n, i) => (
          <li key={`news-${i}`}>
            {n.source} —{" "}
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOURCE_LINK} break-all`}
            >
              {n.title}
            </a>{" "}
            ({fmtDate(n.publishedAt)}).
          </li>
        ))}
      </ol>
      <p className="mt-6 mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
        Page regenerated every hour. Underlying data is the most recent
        available at request time; values reflect the latest year each
        indicator reports, not always the current calendar year.
      </p>
    </section>
  );
}

export default async function CountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { iso2: rawIso2 } = await params;
  const country = findCountry(rawIso2);
  if (!country) notFound();

  const iso2 = country.iso2;
  const flagSvg = getFlagSvg(iso2);

  return (
    <main className="mx-auto max-w-[920px] px-6 md:px-10 py-16 md:py-24">
      <Link
        href="/"
        className="mono text-[12px] tracking-[0.12em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] hover:text-[var(--color-paper)] transition-colors"
      >
        ← back to globe
      </Link>

      <Suspense fallback={<HeroSkeleton />}>
        <Hero
          iso2={iso2}
          fallbackName={country.name}
          flagSvg={flagSvg}
        />
      </Suspense>

      <Suspense
        fallback={
          <section className="mt-12">
            <SectionSkeleton lines={4} />
          </section>
        }
      >
        <Summary countryName={country.name} />
      </Suspense>

      <Suspense
        fallback={
          <section className="mt-14">
            <SectionSkeleton lines={3} />
          </section>
        }
      >
        <Indicators iso2={iso2} />
      </Suspense>

      <Suspense
        fallback={
          <section className="mt-14">
            <SectionSkeleton lines={5} />
          </section>
        }
      >
        <News iso2={iso2} countryName={country.name} />
      </Suspense>

      <Suspense
        fallback={
          <section className="mt-14">
            <SectionSkeleton lines={4} />
          </section>
        }
      >
        <Markets iso2={iso2} />
      </Suspense>

      <Suspense
        fallback={
          <section className="mt-16">
            <SectionSkeleton lines={3} />
          </section>
        }
      >
        <References iso2={iso2} countryName={country.name} />
      </Suspense>
    </main>
  );
}
