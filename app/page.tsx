import type { Metadata } from "next";
import Link from "next/link";
import { Globe } from "@/components/Globe";
import { getGlobePoints } from "@/lib/globe-data";

export async function generateMetadata(): Promise<Metadata> {
  const points = await getGlobePoints();
  return {
    title: "Awe Inbox",
    description: `${points.length} planetary events unfolding right now, plotted on the Earth they're happening to. Drawn from NASA EONET.`,
    openGraph: {
      title: "Awe Inbox",
      description: `${points.length} planetary events unfolding right now.`,
      type: "website",
    },
  };
}

export default async function Home() {
  const points = await getGlobePoints();
  const generatedAt = new Date().toISOString();

  return (
    <main id="main" className="flex h-[100dvh] w-full flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-5">
        <div className="flex items-baseline gap-3 min-w-0">
          <Link
            href="/"
            className="font-display text-[1.05rem] tracking-[-0.01em] text-[var(--color-paper)] whitespace-nowrap"
          >
            Awe&nbsp;Inbox
          </Link>
          <span className="mono text-[0.7rem] text-[color-mix(in_oklab,var(--color-paper)_38%,transparent)] whitespace-nowrap hidden sm:inline">
            {points.length} events · {generatedAt.slice(0, 10)}
          </span>
        </div>

        <nav className="mono flex items-center gap-x-3 sm:gap-x-5 md:gap-x-6 text-[0.65rem] sm:text-[0.72rem] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
          <Link
            href="/solar-system"
            className="hover:text-[var(--color-paper)] transition-colors duration-200 whitespace-nowrap"
          >
            Solar&nbsp;System
          </Link>
          <Link
            href="/about"
            className="hover:text-[var(--color-paper)] transition-colors duration-200"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[var(--color-paper)] transition-colors duration-200 hidden xs:inline sm:inline"
          >
            Privacy
          </Link>
          <Link
            href="/colophon"
            className="hover:text-[var(--color-paper)] transition-colors duration-200 hidden sm:inline"
          >
            Colophon
          </Link>
        </nav>
      </header>

      {/* Globe fills the remaining viewport */}
      <div className="relative flex-1 min-h-0">
        {points.length > 0 ? (
          <Globe textureUrl="/api/world-texture" points={points} />
        ) : (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-[36rem] text-center">
              <div className="small-caps text-[var(--color-faded)] mb-6">
                Awe Inbox
              </div>
              <h1 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--color-paper)]">
                The Earth is quiet today.
              </h1>
              <p className="prose-reflection mx-auto mt-8">
                No event currently rises to the level we look for. Return
                tomorrow.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom footer line — hidden on small screens where the canvas +
          pause button already pack the viewport. */}
      <footer className="pointer-events-none relative z-20 hidden md:flex items-end justify-between px-6 pb-3 md:px-10 md:pb-4">
        <span className="mono text-[0.7rem] text-[color-mix(in_oklab,var(--color-paper)_38%,transparent)]">
          Hover an icon. Click for the close-up.
        </span>
        <span className="mono text-[0.7rem] text-[color-mix(in_oklab,var(--color-paper)_38%,transparent)]">
          NASA EONET · MODIS · GIBS
        </span>
      </footer>
    </main>
  );
}
