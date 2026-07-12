import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { aboutBody, aboutLead, aboutThroughLine, interests } from "@/content/about";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Builder since childhood — plus cooking, a garden and beehives, chess, poker, debate, and film. The person behind the resume.",
};

/*
 * /about (Phase 5) — personality turned all the way up, in Vaibhav's voice. The
 * narrative and interest blurbs are DRAFT copy (src/content/about.ts) built only
 * from confirmed facts, for his edit. Interests split into full subpages (movies,
 * chess, cooking — live data / gallery in Phase 6) and honest inline tiles.
 */
export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-28 pt-32">
      <header className="max-w-2xl">
        <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
          About
        </p>
        <h1 className="mt-4 text-h1 font-serif text-text-hi">
          The person behind the resume.
        </h1>
        <p className="measure mt-6 text-h3 leading-relaxed text-text-mid">
          {aboutLead}
        </p>
      </header>

      <div className="mt-16 space-y-8">
        <Reveal>
          <p className="measure text-body leading-relaxed text-text-mid">
            {aboutBody[0]}
          </p>
        </Reveal>

        <Reveal>
          <blockquote className="measure border-l-2 border-accent/50 py-1 pl-6">
            <p className="font-serif text-h3 italic leading-relaxed text-text-hi">
              {aboutThroughLine}
            </p>
          </blockquote>
        </Reveal>

        {aboutBody.slice(1).map((para) => (
          <Reveal key={para.slice(0, 24)}>
            <p className="measure text-body leading-relaxed text-text-mid">
              {para}
            </p>
          </Reveal>
        ))}
      </div>

      <section className="mt-24">
        <Reveal>
          <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
            Beyond the work
          </p>
          <h2 className="mt-3 text-h2 font-serif text-text-hi">
            What I get up to otherwise.
          </h2>
        </Reveal>

        <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <RevealItem key={interest.slug} className="h-full">
              <InterestTile interest={interest} />
            </RevealItem>
          ))}
        </RevealStagger>
      </section>
    </main>
  );
}

function InterestTile({ interest }: { interest: (typeof interests)[number] }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono text-mono uppercase tracking-wider text-text-lo">
          {interest.label}
        </span>
        {interest.href && (
          <ArrowUpRight
            className="size-4 text-text-lo transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-6 text-small leading-relaxed text-text-mid">
        {interest.blurb}
      </p>
    </>
  );

  // Full-subpage interests link out; inline ones are a static tile (no hover lift,
  // no affordance that implies a link that isn't there).
  if (interest.href) {
    return (
      <Link
        href={interest.href}
        className="group flex h-full flex-col justify-between rounded-xl border border-border bg-bg-1 p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-bg-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-bg-1/60 p-5">
      {body}
    </div>
  );
}
