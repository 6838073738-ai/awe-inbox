import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Awe Inbox is designed to know as little about you as possible. This page exists to tell you exactly what that means.",
};

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export default function PrivacyPage() {
  return (
    <main id="main" className="relative w-full px-6 py-32 md:px-20 md:py-48">
      <article className="mx-auto w-full max-w-[42rem]">
        <div className="small-caps mb-10 text-[var(--color-faded)]">
          Privacy
        </div>

        <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]">
          Privacy
        </h1>

        <div className="prose-reflection mt-12">
          <p>
            Awe Inbox is designed to know as little about you as possible. This
            page exists to tell you exactly what that means.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          What we collect
        </h2>
        <div className="prose-reflection mt-8">
          <p>
            Nothing personal. We do not use analytics services, advertising
            trackers, fingerprinting, or third-party cookies. We do not assign
            you a user ID. We do not have an account system.
          </p>
          <p>
            Our hosting provider (Vercel) automatically receives standard
            request logs that include your IP address, browser user agent, and
            the URL you visited. These logs are retained for a short period for
            operational and security purposes and are not used to identify or
            profile visitors.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          What we do not do
        </h2>
        <div className="prose-reflection mt-8">
          <p>
            We do not run advertising. We do not sell or share data. We do not
            use behavioral analytics, heatmaps, session replay, or A/B testing
            tools. We do not embed third-party scripts from social networks. We
            do not place cookies that require consent under GDPR or ePrivacy
            rules.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          Data sources
        </h2>
        <div className="prose-reflection mt-8">
          <p>
            Natural event data is provided by NASA&apos;s Earth Observatory
            Natural Event Tracker (EONET). Satellite imagery is provided by
            NASA&apos;s Global Imagery Browse Services (GIBS). Both are public,
            US-government-produced datasets. Their use does not transmit any
            information about you to NASA.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          Your rights
        </h2>
        <div className="prose-reflection mt-8">
          <p>
            We do not collect anything that creates rights to exercise here. If
            you have any question about how this site handles data, write to
            us.
          </p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          Contact
        </h2>
        <div className="prose-reflection mt-8">
          {/* DEPLOYER: replace with your real address before launch */}
          <p>hello@aweinbox.example</p>
        </div>

        <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.2] tracking-[-0.012em] mt-20 text-[var(--color-paper)]">
          Changes
        </h2>
        <div className="prose-reflection mt-8">
          <p>
            If this policy changes, the prior version will remain accessible at
            /privacy/archive. This page was last updated on {BUILD_DATE}.
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
