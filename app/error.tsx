"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[awe-inbox] page error:", error);
  }, [error]);

  return (
    <main
      id="main"
      className="flex min-h-[100dvh] w-full items-center justify-center px-6"
    >
      <div className="max-w-[40rem]">
        <div className="small-caps mb-6 text-[var(--color-faded)]">
          Something paused
        </div>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]">
          A signal did not arrive.
        </h1>
        <p className="prose-reflection mt-8">
          We could not reach NASA&apos;s servers, or something else interrupted
          the page. The Earth is still doing its work.
        </p>
        <div className="mono mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[var(--color-faded)]">
          <button
            type="button"
            onClick={() => reset()}
            className="underline decoration-[color-mix(in_oklab,var(--color-faded)_55%,transparent)] underline-offset-[6px] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
            style={{ textDecorationThickness: "1px" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="underline decoration-[color-mix(in_oklab,var(--color-faded)_55%,transparent)] underline-offset-[6px] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
            style={{ textDecorationThickness: "1px" }}
          >
            ← Back to today
          </Link>
        </div>
      </div>
    </main>
  );
}
