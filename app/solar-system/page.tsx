import type { Metadata } from "next";
import Link from "next/link";
import { SolarSystem } from "@/components/SolarSystem";

export const metadata: Metadata = {
  title: "Solar System — Awe Inbox",
  description:
    "The Sun, Moon, and eight planets at compressed scale, with the warp of spacetime drawn beneath them. Positions from astronomy-engine, textures from Solar System Scope (CC-BY 4.0).",
};

export default function SolarSystemPage() {
  return (
    <main className="relative w-full" style={{ height: "100dvh" }}>
      {/* Quiet top bar — back link + title */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
        <Link
          href="/"
          className="mono text-[12px] tracking-[0.12em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)] hover:text-[var(--color-paper)] transition-colors pointer-events-auto"
        >
          ← back to globe
        </Link>
        <span className="font-display text-[15px] tracking-[-0.005em] text-[color-mix(in_oklab,var(--color-paper)_75%,transparent)] pointer-events-auto select-none">
          Solar System
        </span>
        <span className="mono text-[10px] tracking-[0.14em] text-[color-mix(in_oklab,var(--color-paper)_38%,transparent)] pointer-events-auto select-none hidden md:block">
          drag to orbit · scroll to zoom
        </span>
      </header>

      {/* The scene fills the viewport */}
      <SolarSystem />

      {/* Quiet attribution at the bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-10 py-4 pointer-events-none">
        <p className="mono text-[10px] tracking-[0.1em] text-[color-mix(in_oklab,var(--color-paper)_38%,transparent)] pointer-events-auto select-none">
          Planet textures · Solar System Scope (CC-BY 4.0) ·{" "}
          <Link href="/colophon" className="underline decoration-transparent hover:decoration-current transition-colors">
            colophon
          </Link>
          {" "}· positions · astronomy-engine (NASA JPL port)
        </p>
      </footer>
    </main>
  );
}
