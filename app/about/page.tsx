import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Awe Inbox surfaces one breathtaking planetary event per day from NASA EONET. Founded on the research of Dacher Keltner's lab at UC Berkeley.",
};

export default function AboutPage() {
  return (
    <main id="main" className="relative w-full px-6 py-32 md:px-20 md:py-48">
      <article className="mx-auto w-full max-w-[42rem]">
        <div className="small-caps mb-10 text-[var(--color-faded)]">
          The manifesto
        </div>

        <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]">
          Awe Inbox
        </h1>

        <div className="prose-reflection mt-12">
          <p>
            Every day, the Earth performs something extraordinary. A volcano
            breathes for the first time in a century. An iceberg the size of a
            city detaches and begins its slow journey south. A bloom of
            phytoplankton paints the North Atlantic in spirals visible from
            orbit.
          </p>
          <p>
            Most of these moments pass unwatched. The ones that do reach us
            arrive packaged as crisis, framed for fear.
          </p>
          <p>
            This site is a small correction. Once a day, we surface one event —
            chosen not for its threat, but for its grandeur. Then we get out of
            the way.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-24 text-[var(--color-paper)]">
          Why awe?
        </h2>

        <div className="prose-reflection mt-8">
          <p>
            Dacher Keltner and his colleagues at UC Berkeley&apos;s Greater Good
            Science Center have spent two decades studying awe — the emotion we
            feel in the presence of something vast enough to require a
            recalibration of our mental maps. The findings are remarkable. Awe
            lowers inflammation. It quiets the inner critic. It dilates our
            perception of time, leaving us feeling less hurried. It softens the
            boundaries of the self and inclines us toward generosity.
          </p>
          <p>
            Crucially, not all awe is equal. There is a threat-based variant —
            the awe of approaching catastrophe — that produces vigilance and
            anxiety instead. The disasters that dominate the daily news mostly
            elicit this kind. So we filter them out. Awe Inbox surfaces only
            what Keltner&apos;s lab calls the reward variant: vast, mysterious,
            beautiful, slow.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-24 text-[var(--color-paper)]">
          How it works
        </h2>

        <div className="prose-reflection mt-8">
          <p>
            Event data comes from NASA&apos;s Earth Observatory Natural Event
            Tracker (EONET). Satellite imagery comes from NASA GIBS, primarily
            MODIS Terra. We score events daily for geological grandeur, scale,
            remoteness, and rarity, and exclude anything threatening populated
            places.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-24 text-[var(--color-paper)]">
          How to use it
        </h2>

        <div className="prose-reflection mt-8">
          <p>
            Visit once. Look slowly. Then close the tab. That is the entire
            ritual.
          </p>
          <p>
            Awe Inbox has no notifications, no metrics, no infinite scroll, no
            engagement loop. It does not want your time. It wants to give you
            back a little of your own.
          </p>
        </div>

        <nav
          aria-label="Footer links"
          className="mono mt-32 flex flex-wrap items-center gap-x-6 gap-y-3 text-[var(--color-faded)]"
        >
          <Link
            href="/privacy"
            className="underline underline-offset-[6px] decoration-transparent hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
          >
            Privacy
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/colophon"
            className="underline underline-offset-[6px] decoration-transparent hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
          >
            Colophon
          </Link>
          <span aria-hidden="true">·</span>
          <a
            href="https://eonet.gsfc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-[6px] decoration-transparent hover:decoration-[var(--color-paper)] transition-[text-decoration-color] duration-300"
          >
            NASA EONET ↗
          </a>
        </nav>

        <div className="mt-16">
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
