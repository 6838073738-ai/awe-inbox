import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUNTRY_LABELS, getFlagSvg } from "@/lib/country-flags";
import {
  fetchWikipediaSummary,
  fetchRestCountries,
  fetchWorldBankSnapshot,
} from "@/lib/country-info";
import { fetchCountryNews } from "@/lib/country-news";
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

  const [wiki, rc, wb, news, stocks] = await Promise.all([
    fetchWikipediaSummary(country.name),
    fetchRestCountries(iso2),
    fetchWorldBankSnapshot(iso2),
    fetchCountryNews(iso2, country.name, 8),
    fetchCountryStocks(iso2, 5),
  ]);

  return (
    <main className="mx-auto max-w-[920px] px-6 md:px-10 py-16 md:py-24">
      <Link
        href="/"
        className="mono text-[12px] tracking-[0.12em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] hover:text-[var(--color-paper)] transition-colors"
      >
        ← back to globe
      </Link>

      {/* Hero — flag + name + capital + region */}
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
            {rc?.name ?? country.name}
          </h1>
          {rc?.officialName && rc.officialName !== rc.name ? (
            <p className="mt-2 mono text-[12px] tracking-[0.08em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
              {rc.officialName}
            </p>
          ) : null}
          <p className="mt-3 mono text-[12px] tracking-[0.08em] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
            {[rc?.capital, rc?.subregion ?? rc?.region]
              .filter(Boolean)
              .join(" · ")}
            {rc?.population
              ? ` · pop ${fmtNumber(rc.population)}`
              : ""}
          </p>
        </div>
      </header>

      {/* Wikipedia summary */}
      {wiki && wiki.extract ? (
        <section className="mt-12">
          <p className="prose-reflection text-[17px] leading-[1.65]">
            {wiki.extract}
          </p>
          <p className="mt-3 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            Source:{" "}
            <a
              href={wiki.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200"
            >
              Wikipedia — {wiki.title}
            </a>
          </p>
        </section>
      ) : null}

      {/* World Bank indicators */}
      {wb.length > 0 ? (
        <section className="mt-14">
          <h2 className="small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5">
            Indicators
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
            {wb.map((i) => (
              <div key={i.indicator} className="flex flex-col gap-1.5">
                <dt className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                  {i.label}{" "}
                  {i.year ? (
                    <span className="opacity-70">({i.year})</span>
                  ) : null}
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
          <p className="mt-5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            Source:{" "}
            <a
              href={`https://data.worldbank.org/country/${iso2.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200"
            >
              World Bank Open Data
            </a>
          </p>
        </section>
      ) : null}

      {/* News */}
      {news.length > 0 ? (
        <section className="mt-14">
          <h2 className="small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5">
            Today
          </h2>
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
          <p className="mt-5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            Headlines via{" "}
            <a
              href="https://www.gdeltproject.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200"
            >
              GDELT
            </a>
            , filtered to a curated list of reputable English-language
            outlets (BBC, Reuters, AP, The Guardian, NYT, FT, Al Jazeera, …).
          </p>
        </section>
      ) : null}

      {/* Stocks */}
      {stocks.length > 0 ? (
        <section className="mt-14">
          <h2 className="small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5">
            Markets
          </h2>
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
          <p className="mt-5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            Market data via Yahoo Finance public quote endpoints. Stock
            selection is a curated short-list of widely-tracked listings per
            country; not an index, not investment advice.
          </p>
        </section>
      ) : null}

      {/* References — gather every external source link */}
      <section className="mt-16">
        <h2 className="small-caps text-[11px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] mb-5">
          References
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
          {wiki ? (
            <li>
              <a
                href={wiki.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200 break-all"
              >
                {wiki.url}
              </a>{" "}
              — Wikipedia, “{wiki.title}.”
            </li>
          ) : null}
          {wb.length > 0 ? (
            <li>
              <a
                href={`https://data.worldbank.org/country/${iso2.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200 break-all"
              >
                https://data.worldbank.org/country/{iso2.toLowerCase()}
              </a>{" "}
              — World Bank Open Data.
            </li>
          ) : null}
          {rc ? (
            <li>
              <a
                href={`https://restcountries.com/v3.1/alpha/${iso2.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200 break-all"
              >
                REST Countries v3
              </a>{" "}
              — country basics (capital, languages, currency, population).
            </li>
          ) : null}
          {news.map((n, i) => (
            <li key={`news-${i}`}>
              {n.source} —{" "}
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-200 break-all"
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
    </main>
  );
}
