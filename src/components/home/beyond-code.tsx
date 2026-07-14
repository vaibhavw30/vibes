import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";

/*
 * "Beyond code" — cloud-shaped cards (Home - Polished), one per facet of the
 * person, each masked into a fluffy cloud (see .cloud-* in globals.css). Every
 * line is a real fact; nothing here is invented. Deliberately HONEST placeholders
 * where the design mock guessed specifics we can't yet verify:
 *   - Chess: 1177 chess.com rapid + ~1300 FIDE are Vaibhav's real, confirmed
 *     numbers (static, not a live feed — so no "Live" pill). The sparkline is
 *     decorative and drawn to read as "hovering", not a real rating history.
 *   - Film: no fabricated Letterboxd handle; posters are abstract placeholders.
 *   - Kitchen: an explicit empty photo slot until Vaibhav supplies a real image.
 *   - Debate: "#19 in the country" only (confirmed); the mock's "#3 at Berkeley"
 *     is dropped as unverified.
 * Real routes are preserved (/about/*), not the mock's #anchors.
 */

const CLOUD_VARIANTS = ["cloud-a", "cloud-b", "cloud-c", "cloud-d"] as const;

function CloudSkin() {
  return (
    <div className="cloud-skin" aria-hidden="true">
      <span className="cloud-edge" />
      <span className="cloud-fill" />
    </div>
  );
}

const cardBase =
  "cloud-card group flex h-full flex-col justify-between gap-4 transition-transform duration-200 ease-out motion-reduce:transition-none";

const labelCls =
  "font-mono text-mono uppercase tracking-[0.1em] text-text-lo";
const metaCls =
  "font-mono text-[0.6rem] uppercase tracking-[0.06em] text-text-lo";
const lineCls = "mx-auto max-w-[26ch] text-small leading-relaxed text-text-mid";

function ChessCard() {
  return (
    <Link href="/about/chess" className={`${cardBase} ${CLOUD_VARIANTS[0]}`}>
      <CloudSkin />
      <div className="flex items-center justify-between">
        <span className={labelCls}>Chess</span>
        <span className={metaCls}>chess.com · rapid</span>
      </div>
      <div>
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-serif text-[2rem] leading-none text-text-hi">
            1177
          </span>
          <span className={metaCls}>FIDE ~1300</span>
        </div>
        <svg
          viewBox="0 0 140 44"
          preserveAspectRatio="none"
          className="mt-2.5 h-[38px] w-full overflow-visible"
          aria-hidden="true"
        >
          {/* Decorative "hovering" trace — oscillates around a level, not a climb. */}
          <polyline
            points="4,24 16,20 28,26 40,21 52,25 64,19 76,24 88,21 100,26 112,20 124,24 136,22"
            fill="none"
            stroke="#2a67a6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="136" cy="22" r="2.6" fill="#2a67a6" />
        </svg>
        <p className={`${lineCls} mt-3`}>Hovering around 1300, stubbornly.</p>
      </div>
    </Link>
  );
}

const POSTERS = [
  "linear-gradient(150deg,#3a5a7a,#20303f)",
  "linear-gradient(150deg,#c98a4b,#8a5424)",
  "linear-gradient(150deg,#6a7f5a,#3a4a2f)",
  "linear-gradient(150deg,#8a5a7f,#4a2f44)",
];

function FilmCard() {
  return (
    <Link href="/about/movies" className={`${cardBase} ${CLOUD_VARIANTS[1]}`}>
      <CloudSkin />
      <div className="flex items-center justify-between">
        <span className={labelCls}>Film</span>
        <ArrowUpRight
          className="size-4 text-text-lo transition-colors group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
      <div>
        <div className="mb-4 flex items-center justify-center gap-2">
          <svg width="42" height="16" viewBox="0 0 42 16" aria-hidden="true">
            <circle cx="11" cy="8" r="8" fill="#FF8000" style={{ mixBlendMode: "multiply" }} />
            <circle cx="21" cy="8" r="8" fill="#00E054" style={{ mixBlendMode: "multiply" }} />
            <circle cx="31" cy="8" r="8" fill="#40BCF4" style={{ mixBlendMode: "multiply" }} />
          </svg>
          <span className="font-mono text-[0.72rem] text-text-mid">Letterboxd</span>
        </div>
        <div className="mx-auto flex max-w-[212px] items-end justify-center gap-2">
          {POSTERS.map((bg, i) => (
            <div
              key={i}
              className="aspect-[2/3] flex-1 rounded-[5px] transition-transform duration-200 ease-out group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
              style={{
                background: bg,
                boxShadow: "0 6px 14px -8px rgba(27,39,53,.5)",
              }}
            />
          ))}
        </div>
        <p className={`${lineCls} mt-3`}>Logging everything I watch on Letterboxd.</p>
      </div>
    </Link>
  );
}

function KitchenCard() {
  return (
    <Link href="/about/cooking" className={`${cardBase} ${CLOUD_VARIANTS[2]}`}>
      <CloudSkin />
      <div className="flex items-center justify-between">
        <span className={labelCls}>Kitchen → garden</span>
        <ArrowUpRight
          className="size-4 text-text-lo transition-colors group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
      {/* Honest empty state until a real food/garden photo is supplied. */}
      <div
        className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[9px] border border-dashed border-border"
        style={{ background: "linear-gradient(140deg,#e6d8bf,#cdd8b8)" }}
      >
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-text-lo/80">
          Photo coming soon
        </span>
      </div>
      <p className={lineCls}>
        Cooking pulled me into a garden, then beekeeping, then pollinator advocacy.
      </p>
    </Link>
  );
}

function DebateCard() {
  return (
    <Link href="/about" className={`${cardBase} ${CLOUD_VARIANTS[3]}`}>
      <CloudSkin />
      <div className="flex items-center justify-between">
        <span className={labelCls}>Debate</span>
        <span className={metaCls}>National circuit</span>
      </div>
      <div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-serif text-[3rem] leading-[0.9] text-text-hi">#19</span>
          <span className={metaCls}>in the country</span>
        </div>
        <p className={`${lineCls} mt-3.5`}>Ranked #19 in the country, once upon a time.</p>
      </div>
    </Link>
  );
}

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

      <RevealStagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <RevealItem className="h-full">
          <ChessCard />
        </RevealItem>
        <RevealItem className="h-full">
          <FilmCard />
        </RevealItem>
        <RevealItem className="h-full">
          <KitchenCard />
        </RevealItem>
        <RevealItem className="h-full">
          <DebateCard />
        </RevealItem>
      </RevealStagger>
    </section>
  );
}
