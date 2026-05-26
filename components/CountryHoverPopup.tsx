"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  iso2: string;
  name: string;
  news: Array<{
    title: string;
    url: string;
    source: string;
    publishedAt: string;
  }>;
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
    currency: string;
    changePercent: number;
    exchange: string | null;
  }>;
};

const cache = new Map<string, Snapshot>();
const inflight = new Map<string, Promise<Snapshot | null>>();

async function loadSnapshot(iso2: string): Promise<Snapshot | null> {
  if (cache.has(iso2)) return cache.get(iso2)!;
  if (inflight.has(iso2)) return inflight.get(iso2)!;
  const p = (async () => {
    try {
      const res = await fetch(`/api/country/${iso2}/snapshot`, {
        cache: "force-cache",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Snapshot;
      cache.set(iso2, data);
      return data;
    } catch {
      return null;
    } finally {
      inflight.delete(iso2);
    }
  })();
  inflight.set(iso2, p);
  return p;
}

export function CountryHoverPopup({
  iso2,
  name,
  x,
  y,
}: {
  iso2: string;
  name: string;
  x: number;
  y: number;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(() => cache.get(iso2) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(iso2));

  useEffect(() => {
    let alive = true;
    if (cache.has(iso2)) {
      setSnap(cache.get(iso2)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadSnapshot(iso2).then((s) => {
      if (!alive) return;
      setSnap(s);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [iso2]);

  // Position the popup so it doesn't run off the viewport edges
  const W = 320;
  const PAD = 16;
  const viewportW =
    typeof window !== "undefined" ? window.innerWidth : 1080;
  const viewportH =
    typeof window !== "undefined" ? window.innerHeight : 1920;
  let left = x + 18;
  if (left + W + PAD > viewportW) left = x - W - 18;
  if (left < PAD) left = PAD;
  let top = y - 12;
  // Rough max height — keep on screen
  const maxH = 360;
  if (top + maxH > viewportH - PAD) top = viewportH - maxH - PAD;
  if (top < PAD) top = PAD;

  return (
    <div
      className="country-popup fixed z-40 pointer-events-none"
      style={{ left, top, width: W }}
      role="tooltip"
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="font-display text-[1.05rem] leading-tight text-[var(--color-paper)]">
          {snap?.name ?? name}
        </h3>
        <span className="mono text-[10px] tracking-[0.14em] text-[color-mix(in_oklab,var(--color-paper)_45%,transparent)]">
          {iso2}
        </span>
      </div>

      {loading ? (
        <div className="mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)]">
          loading today's signals…
        </div>
      ) : null}

      {snap && snap.news.length > 0 ? (
        <section className="mb-3">
          <h4 className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)] mb-1.5">
            Headlines
          </h4>
          <ul className="space-y-1.5">
            {snap.news.map((n) => (
              <li
                key={n.url}
                className="text-[12.5px] leading-[1.35] text-[var(--color-paper)]"
              >
                <span className="block">{n.title}</span>
                <span className="mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
                  {n.source}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {snap && snap.stocks.length > 0 ? (
        <section>
          <h4 className="small-caps text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)] mb-1.5">
            Top movers today
          </h4>
          <ul className="space-y-1">
            {snap.stocks.map((s) => (
              <li
                key={s.symbol}
                className="flex items-baseline justify-between gap-3 text-[12px]"
              >
                <span className="mono text-[var(--color-paper)] truncate">
                  {s.symbol}
                </span>
                <span
                  className="mono"
                  style={{
                    color:
                      s.changePercent >= 0
                        ? "color-mix(in oklab, #6dd6a4 90%, var(--color-paper))"
                        : "color-mix(in oklab, #ec8c8c 90%, var(--color-paper))",
                  }}
                >
                  {s.changePercent >= 0 ? "+" : ""}
                  {s.changePercent.toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {snap && snap.news.length === 0 && snap.stocks.length === 0 && !loading ? (
        <div className="mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)]">
          no live signals today
        </div>
      ) : null}

      <div className="mt-3 mono text-[10px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]">
        click for full country page →
      </div>
    </div>
  );
}
