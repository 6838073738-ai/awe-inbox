import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[100dvh] w-full items-center justify-center px-6"
    >
      <div className="max-w-[40rem]">
        <div className="small-caps mb-6 text-[var(--color-faded)]">
          Not found
        </div>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--color-paper)]">
          The page you are looking for is no longer here.
        </h1>
        <p className="prose-reflection mt-8">
          Events drift through the inbox each day. Some have passed. The one
          you wanted may have been replaced by today&apos;s.
        </p>
        <div className="mono mt-12 text-[var(--color-faded)]">
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
