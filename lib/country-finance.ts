import "server-only";
import YahooFinance from "yahoo-finance2";
import { getStockTickers } from "./country-stocks";

// yahoo-finance2 v3 dropped the default singleton — must instantiate now.
// One module-level instance is fine; it holds session cookies/crumbs.
const yahooFinance = new YahooFinance();
const yfAny = yahooFinance as unknown as {
  suppressNotices?: (notices: string[]) => void;
};
yfAny.suppressNotices?.(["yahooSurvey", "ripHistorical"]);

export type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  changePercent: number;
  exchange: string | null;
};

/**
 * Fetch a price snapshot for a country's top tickers from Yahoo Finance.
 * Returns the three best performers today (sorted by changePercent desc).
 * Yahoo is unofficial but free; quote() handles batching internally.
 */
export async function fetchCountryStocks(
  iso2: string,
  count = 3,
): Promise<StockQuote[]> {
  const tickers = getStockTickers(iso2);
  if (tickers.length === 0) return [];
  try {
    const results = await yahooFinance.quote(tickers, {
      fields: [
        "symbol",
        "shortName",
        "longName",
        "regularMarketPrice",
        "regularMarketChangePercent",
        "currency",
        "fullExchangeName",
      ],
    });
    type AnyQuote = {
      symbol?: string;
      shortName?: string;
      longName?: string;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
      currency?: string;
      fullExchangeName?: string;
    };
    const arr: AnyQuote[] = Array.isArray(results)
      ? (results as AnyQuote[])
      : [results as AnyQuote];
    const quotes: StockQuote[] = [];
    for (const r of arr) {
      const price = r.regularMarketPrice;
      const changePct = r.regularMarketChangePercent;
      if (typeof price !== "number" || !Number.isFinite(price)) continue;
      quotes.push({
        symbol: r.symbol ?? "",
        name: r.longName || r.shortName || r.symbol || "",
        price,
        currency: r.currency || "USD",
        changePercent:
          typeof changePct === "number" && Number.isFinite(changePct)
            ? changePct
            : 0,
        exchange: r.fullExchangeName ?? null,
      });
    }
    quotes.sort((a, b) => b.changePercent - a.changePercent);
    return quotes.slice(0, count);
  } catch (e) {
    console.error("[country-finance] yahoo quote failed", iso2, e);
    return [];
  }
}
