import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";

/*
 * "Beyond code" teaser — a small, honest breadcrumb of the person. Static for
 * now; Phase 6 wires the live signals (Letterboxd film, Chess.com rating). Every
 * line here is a real fact (chess ~1300, debate #19 nationally, the cooking →
 * garden → beekeeping thread) — nothing invented, no fake "now playing".
 */

const tiles = [
  {
    label: "Chess",
    line: "Hovering around 1300, stubbornly.",
    href: "/about/chess",
  },
  {
    label: "Film",
    line: "Logging everything I watch on Letterboxd.",
    href: "/about/movies",
  },
  {
    label: "Kitchen → garden",
    line: "Cooking pulled me into a garden, then beekeeping, then pollinator advocacy.",
    href: "/about/cooking",
  },
  {
    label: "Debate",
    line: "Ranked #19 in the country, once upon a time.",
    href: "/about",
  },
] as const;

export function BeyondCode() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Beyond code"
          title="The rest of it."
          cta={{ href: "/about", label: "About me" }}
        />
      </Reveal>

      <RevealStagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <RevealItem key={tile.label} className="h-full">
            <Link
              href={tile.href}
              className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-border bg-bg-1 p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-bg-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-mono uppercase tracking-wider text-text-lo">
                  {tile.label}
                </span>
                <ArrowUpRight
                  className="size-4 text-text-lo transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
              <p className="text-small leading-relaxed text-text-mid">{tile.line}</p>
            </Link>
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}
