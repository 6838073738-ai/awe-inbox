/**
 * Server-side skeleton that renders the instant a user clicks a country
 * flag, while the page's data fetches (Wikipedia, World Bank, GDELT, Yahoo
 * Finance) are still in flight on the server. Keeps the layout shape so
 * there's no jump when the real content swaps in.
 */
export default function Loading() {
  return (
    <main className="mx-auto max-w-[920px] px-6 md:px-10 py-16 md:py-24">
      <div className="mono text-[12px] tracking-[0.12em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
        ← back to globe
      </div>

      {/* Hero */}
      <header className="mt-10 flex items-center gap-6 md:gap-8">
        <div
          className="shrink-0 skeleton-shimmer"
          style={{
            width: 86,
            height: 86,
            borderRadius: 999,
          }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div
            className="skeleton-shimmer rounded-[3px]"
            style={{ height: "clamp(2rem, 5vw, 3.6rem)", width: "55%" }}
            aria-hidden="true"
          />
          <div
            className="skeleton-shimmer rounded-[2px] mt-4"
            style={{ height: 14, width: "32%" }}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Summary */}
      <section className="mt-12 space-y-3" aria-hidden="true">
        <div
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 14, width: "92%" }}
        />
        <div
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 14, width: "88%" }}
        />
        <div
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 14, width: "78%" }}
        />
        <div
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 14, width: "65%" }}
        />
      </section>

      {/* Indicators */}
      <section className="mt-14" aria-hidden="true">
        <div
          className="skeleton-shimmer rounded-[2px]"
          style={{ height: 11, width: 90 }}
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className="skeleton-shimmer rounded-[2px]"
                style={{ height: 10, width: "55%" }}
              />
              <div
                className="skeleton-shimmer rounded-[2px]"
                style={{ height: 16, width: "70%" }}
              />
            </div>
          ))}
        </div>
      </section>

      <p
        className="mt-16 mono text-[11px] text-[color-mix(in_oklab,var(--color-paper)_42%,transparent)]"
        role="status"
      >
        Loading today's signals — Wikipedia, World Bank, GDELT, Yahoo
        Finance…
      </p>
    </main>
  );
}
