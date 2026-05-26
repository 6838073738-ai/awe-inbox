import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colophon",
  description: "The people, datasets, and tools behind Awe Inbox.",
};

export default function ColophonPage() {
  return (
    <main id="main" className="relative w-full px-6 py-32 md:px-20 md:py-48">
      <article className="mx-auto w-full max-w-[42rem]">
        <div className="small-caps mb-10 text-[var(--color-faded)]">
          Colophon
        </div>

        <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]">
          Credits
        </h1>

        <div className="prose-reflection mt-12">
          <p>
            With gratitude to{" "}
            <a
              href="https://greatergood.berkeley.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dacher Keltner and the Greater Good Science Center
            </a>{" "}
            at UC Berkeley, whose research into awe shaped both the product and
            the curation rules behind it.
          </p>
          <p>
            Event data is provided by{" "}
            <a
              href="https://eonet.gsfc.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NASA&apos;s Earth Observatory Natural Event Tracker (EONET)
            </a>
            . Satellite imagery is rendered through{" "}
            <a
              href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs"
              target="_blank"
              rel="noopener noreferrer"
            >
              NASA GIBS
            </a>{" "}
            and the MODIS instrument teams aboard the Terra and Aqua
            satellites, with VIIRS aboard Suomi NPP as a fallback.
          </p>
          <p>
            City data — used by the population-proximity filter that
            distinguishes reward-awe from threat-awe — comes from{" "}
            <a
              href="https://www.geonames.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              GeoNames
            </a>{" "}
            and is licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Creative Commons Attribution 4.0
            </a>
            . Country borders and label points are from{" "}
            <a
              href="https://www.naturalearthdata.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Natural Earth
            </a>{" "}
            (public domain). Country flags are rendered from the{" "}
            <a
              href="https://www.npmjs.com/package/country-flag-icons"
              target="_blank"
              rel="noopener noreferrer"
            >
              country-flag-icons
            </a>{" "}
            package.
          </p>
          <p>
            On the <Link href="/solar-system">Solar System</Link> page,
            planet, Sun, Moon, and starfield textures are by{" "}
            <a
              href="https://www.solarsystemscope.com/textures/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solar System Scope
            </a>{" "}
            (Tomas Slavinskas, CC-BY 4.0). Planetary positions are computed
            with{" "}
            <a
              href="https://github.com/cosinekitty/astronomy"
              target="_blank"
              rel="noopener noreferrer"
            >
              astronomy-engine
            </a>
            , a JavaScript port of NASA JPL&apos;s ephemeris calculations.
            The warped grid beneath the planets is a visualisation of
            gravitational potential — a simplified, non-relativistic
            stand-in for spacetime curvature in the spirit of Einstein&apos;s
            rubber-sheet metaphor.
          </p>
          <p>
            Country detail pages cite{" "}
            <a
              href="https://en.wikipedia.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
            </a>
            ,{" "}
            <a
              href="https://data.worldbank.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              World Bank Open Data
            </a>
            , and{" "}
            <a
              href="https://restcountries.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              REST Countries
            </a>
            . Today&apos;s headlines are surfaced via the{" "}
            <a
              href="https://www.gdeltproject.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GDELT Project
            </a>{" "}
            and filtered to a curated allowlist of reputable English-language
            outlets. Stock quotes are pulled from Yahoo Finance via the
            unofficial{" "}
            <a
              href="https://github.com/gadicc/node-yahoo-finance2"
              target="_blank"
              rel="noopener noreferrer"
            >
              yahoo-finance2
            </a>{" "}
            package and are illustrative — not investment advice.
          </p>
          <p>
            Typography is set in{" "}
            <a
              href="https://fonts.google.com/specimen/Fraunces"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fraunces
            </a>{" "}
            by Undercase Type,{" "}
            <a
              href="https://rsms.me/inter/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inter Tight
            </a>{" "}
            by Rasmus Andersson, and{" "}
            <a
              href="https://www.jetbrains.com/lp/mono/"
              target="_blank"
              rel="noopener noreferrer"
            >
              JetBrains Mono
            </a>
            .
          </p>
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
            ,{" "}
            <a
              href="https://www.framer.com/motion/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Framer Motion
            </a>
            ,{" "}
            <a
              href="https://lenis.darkroom.engineering/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lenis
            </a>
            , and deployed on{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel
            </a>
            .
          </p>
        </div>

        <div className="mt-32">
          <Link
            href="/"
            className="mono inline-flex items-center gap-3 text-[var(--color-paper)] underline decoration-[color-mix(in_oklab,var(--color-faded)_55%,transparent)] underline-offset-[6px] hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
            style={{ textDecorationThickness: "1px" }}
          >
            <span aria-hidden="true">←</span>
            Back to today
          </Link>
        </div>
      </article>
    </main>
  );
}
