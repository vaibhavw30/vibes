import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/reveal";

/*
 * Shared shell for the interest subpages (/about/movies, /about/chess,
 * /about/cooking). Each has a voiced intro and a placeholder panel; the live-data
 * module (Letterboxd, Chess.com) or photo gallery replaces `children` in Phase 6.
 */
export function InterestSubpage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-28 pt-32">
      <Link
        href="/about"
        className="group inline-flex items-center gap-1.5 font-mono text-mono uppercase tracking-wider text-text-lo transition-colors hover:text-text-hi"
      >
        <ArrowLeft
          className="size-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          aria-hidden="true"
        />
        All of it
      </Link>

      <header className="mt-8">
        <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-h1 font-serif text-text-hi">{title}</h1>
        <p className="measure mt-5 text-body leading-relaxed text-text-mid">
          {intro}
        </p>
      </header>

      <Reveal>
        <div className="mt-14">{children}</div>
      </Reveal>
    </main>
  );
}

/*
 * Honest static state for a module whose live data lands in Phase 6. Reads as a
 * deliberate placeholder, never a broken/empty state (the quality-floor rule).
 */
export function ComingLive({ note }: { note: string }) {
  return (
    <div className="frost rounded-xl border border-dashed border-border bg-bg-1/70 px-6 py-16 text-center">
      <p className="measure mx-auto text-small leading-relaxed text-text-mid">
        {note}
      </p>
    </div>
  );
}
