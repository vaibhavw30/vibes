"use client";

import type { FC } from "react";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * Home "Beyond code" — a single frosted-glass carousel panel that advances
 * through Vaibhav's four interests, one at a time, each with its own color theme
 * and duotone line-art illustration. It replaces the earlier cloud-shaped cards
 * (which read as clip-art) and adopts the grounded frosted surface of the
 * experience timeline. Autoplay by default; hover / focus / a manual tab pick
 * pauses it, and it resumes once the pointer leaves. Reduced motion disables
 * autoplay and the slide, leaving an instant, tab-driven panel.
 *
 * Content honesty: every value is a real, confirmed fact —
 *   Chess:   1177 chess.com rapid + ~1300 FIDE (static; the sparkline is
 *            DECORATIVE, a "hovering" trace, not a real rating history).
 *   Film:    @vaibzz on Letterboxd.
 *   Kitchen: an explicit "Photo coming soon" slot until a real image is supplied.
 *   Debate:  #19 in the country and #3 at the Berkeley Invitational (Varsity PF).
 * Real routes are preserved (/about/*), not the mock's #anchors.
 */

const AUTOPLAY_MS = 5500;

type Theme = {
  accent: string; // bold: illustration stroke, big number, active tab, edge bar, progress
  tint: string; // pale fill for the duotone illustration (accent at low alpha)
  wash: string; // soft radial glow over the frost (never carries text)
  accent2?: string; // Film only: orange counterpart to the blue accent
};

type Interest = {
  id: string;
  tab: string;
  label: string;
  meta: string;
  href: string;
  theme: Theme;
  Illustration: FC<{ theme: Theme }>;
  Body: FC;
  caption: string;
};

const labelCls = "font-mono text-mono uppercase tracking-[0.1em] text-text-lo";
const metaCls = "font-mono text-[0.6rem] uppercase tracking-[0.06em] text-text-lo";
const captionCls =
  "font-serif text-[1.15rem] leading-snug text-text-mid sm:ml-auto sm:max-w-[22ch] sm:border-l sm:border-border/60 sm:pl-8 sm:text-left";

/* ── Illustrations: single-weight line-art, accent stroke + pale tint fill ── */

function RookIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="132"
      height="132"
      fill="none"
      aria-hidden="true"
      stroke={theme.accent}
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        fill={theme.tint}
        d="M30 34V24h8v6h8v-6h8v6h8v-6h8v10l-6 6v22l6 8v6H30v-6l6-8V40l-6-6Z"
      />
      <path d="M40 62h20M38 74h24" />
    </svg>
  );
}

function FilmIcon({ theme }: { theme: Theme }) {
  const o = theme.accent2 ?? theme.accent;
  return (
    <svg
      viewBox="0 0 100 100"
      width="132"
      height="132"
      fill="none"
      aria-hidden="true"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* film strip */}
      <g stroke={theme.accent} strokeWidth="2.4">
        <rect x="20" y="22" width="42" height="56" rx="4" fill={theme.tint} />
        <path d="M20 34h42M20 66h42" />
        <g fill={theme.accent} stroke="none">
          <rect x="24" y="25" width="5" height="5" rx="1" />
          <rect x="53" y="25" width="5" height="5" rx="1" />
          <rect x="24" y="70" width="5" height="5" rx="1" />
          <rect x="53" y="70" width="5" height="5" rx="1" />
        </g>
      </g>
      {/* popcorn box */}
      <g stroke={o} strokeWidth="2.4">
        <path fill={theme.tint} d="M60 52l4 30h16l4-30Z" />
        <path d="M63 60h18" />
        <g fill={o} stroke="none">
          <circle cx="64" cy="48" r="5" />
          <circle cx="72" cy="44" r="5" />
          <circle cx="80" cy="48" r="5" />
          <circle cx="76" cy="51" r="4" />
        </g>
      </g>
    </svg>
  );
}

function PotIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="132"
      height="132"
      fill="none"
      aria-hidden="true"
      stroke={theme.accent}
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path fill={theme.tint} d="M26 50h48v14a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10Z" />
      <path d="M20 50h60M26 44h48" />
      <path d="M30 44l4-8M46 44l2-8M62 44l4-8" />
      {/* whisk */}
      <path d="M70 30l6-14" />
      <path d="M74 18c4 2 4 8 0 12M70 20c-4 2-4 8 0 12" />
    </svg>
  );
}

function PodiumIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="132"
      height="132"
      fill="none"
      aria-hidden="true"
      stroke={theme.accent}
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path fill={theme.tint} d="M38 40h24l-4 34H42Z" />
      <path d="M34 40h32M46 74h8M50 74v10M40 84h20" />
      <path d="M50 40V28" />
      <path fill={theme.tint} d="M50 16l14 6-14 6-14-6Z" />
    </svg>
  );
}

/* ── Bodies: the bespoke middle content per interest (real data) ── */

function ChessBody() {
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[2rem] leading-none text-text-hi">1177</span>
        <span className={metaCls}>FIDE ~1300</span>
      </div>
      {/* Decorative "hovering" trace — oscillates around a level, not a climb. */}
      <svg
        viewBox="0 0 140 44"
        preserveAspectRatio="none"
        className="mt-2.5 h-[34px] w-full max-w-[220px] overflow-visible"
        aria-hidden="true"
      >
        <polyline
          points="4,24 16,20 28,26 40,21 52,25 64,19 76,24 88,21 100,26 112,20 124,24 136,22"
          fill="none"
          stroke="#2f7d54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="136" cy="22" r="2.6" fill="#2f7d54" />
      </svg>
    </>
  );
}

function FilmBody() {
  return (
    <div className="flex items-center gap-2">
      <svg width="42" height="16" viewBox="0 0 42 16" aria-hidden="true">
        <circle cx="11" cy="8" r="8" fill="#FF8000" style={{ mixBlendMode: "multiply" }} />
        <circle cx="21" cy="8" r="8" fill="#00E054" style={{ mixBlendMode: "multiply" }} />
        <circle cx="31" cy="8" r="8" fill="#40BCF4" style={{ mixBlendMode: "multiply" }} />
      </svg>
      <span className="font-mono text-[0.72rem] text-text-mid">Letterboxd</span>
    </div>
  );
}

function KitchenBody() {
  return (
    <div
      className="flex h-[70px] max-w-[260px] items-center justify-center rounded-[9px] border border-dashed border-border px-6"
      style={{ background: "linear-gradient(140deg,#f0e6d0,#dbe6c8)" }}
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-text-lo/80">
        Photo coming soon
      </span>
    </div>
  );
}

function DebateBody() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[2.4rem] leading-[0.9] text-text-hi">#19</span>
        <span className={metaCls}>in the country</span>
      </div>
      <span
        className="font-mono text-[0.6rem] uppercase tracking-[0.06em]"
        style={{ color: "#8a6410" }}
      >
        #3 · Berkeley Invitational (Varsity PF)
      </span>
    </div>
  );
}

const INTERESTS: Interest[] = [
  {
    id: "chess",
    tab: "Chess",
    label: "Chess",
    meta: "chess.com · rapid",
    href: "/about/chess",
    theme: { accent: "#2f7d54", tint: "rgba(47,125,84,0.12)", wash: "rgba(47,125,84,0.07)" },
    Illustration: RookIcon,
    Body: ChessBody,
    caption: "Hovering around 1300, stubbornly.",
  },
  {
    id: "film",
    tab: "Film",
    label: "Film",
    meta: "@vaibzz",
    href: "/about/movies",
    theme: {
      accent: "#2f7db0",
      tint: "rgba(47,125,176,0.12)",
      wash: "rgba(47,125,176,0.07)",
      accent2: "#e0812f",
    },
    Illustration: FilmIcon,
    Body: FilmBody,
    caption: "Logging everything I watch on Letterboxd.",
  },
  {
    id: "kitchen",
    tab: "Kitchen",
    label: "Kitchen → garden",
    meta: "garden · bees",
    href: "/about/cooking",
    theme: { accent: "#c0553a", tint: "rgba(192,85,58,0.12)", wash: "rgba(192,85,58,0.07)" },
    Illustration: PotIcon,
    Body: KitchenBody,
    caption: "Cooking pulled me into a garden, then beekeeping, then pollinator advocacy.",
  },
  {
    id: "debate",
    tab: "Debate",
    label: "Debate",
    meta: "National circuit",
    href: "/about",
    theme: { accent: "#8a6410", tint: "rgba(138,100,16,0.12)", wash: "rgba(138,100,16,0.08)" },
    Illustration: PodiumIcon,
    Body: DebateBody,
    caption: "Ranked #19 in the country, once upon a time.",
  },
];

const slideVariantsFor = (reduce: boolean) => ({
  enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : 24 * d }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : -24 * d }),
});

export function InterestPanel() {
  const reduce = useReducedMotion() ?? false;
  // index + slide direction travel together so the enter/exit x-sign is known at
  // render without reading a ref mid-render (react-hooks/refs).
  const [{ index, dir }, setSlide] = useState({ index: 0, dir: 1 });
  const [paused, setPaused] = useState(false);
  const baseId = useId();

  const active = INTERESTS[index];
  const { theme } = active;
  const Illustration = active.Illustration;
  const Body = active.Body;
  const panelId = `${baseId}-panel`;

  // Autoplay — advance while not paused / not reduced. Depending on `index`
  // restarts the interval after a manual jump so the full window applies anew.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => {
      setSlide((s) => ({ index: (s.index + 1) % INTERESTS.length, dir: 1 }));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduce, paused, index]);

  function go(next: number) {
    const d =
      next > index || (index === INTERESTS.length - 1 && next === 0) ? 1 : -1;
    setSlide({ index: next, dir: d });
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = (i + step + INTERESTS.length) % INTERESTS.length;
    go(next);
    const el = document.getElementById(`${baseId}-tab-${INTERESTS[next].id}`);
    (el as HTMLButtonElement | null)?.focus();
  }

  const slideVariants = slideVariantsFor(reduce);

  return (
    <div
      className="frost relative mt-12 overflow-hidden rounded-2xl border border-border/70"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      {/* Soft theme wash + bold left edge bar (both cross-fade on theme change). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-500"
        style={{ background: `radial-gradient(120% 80% at 12% 0%, ${theme.wash}, transparent 60%)` }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors duration-500"
        style={{ background: theme.accent }}
      />

      {/* Tab rail — kept OUTSIDE the slide's <Link> (buttons can't nest in <a>). */}
      <div
        role="tablist"
        aria-label="Interests"
        className="relative flex flex-wrap gap-x-5 gap-y-1 border-b border-border/60 px-6 pt-5 sm:px-10"
      >
        {INTERESTS.map((it, i) => {
          const selected = i === index;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              id={`${baseId}-tab-${it.id}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => go(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              className="relative -mb-px cursor-pointer pb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] transition-colors"
              style={selected ? { color: it.theme.accent } : undefined}
            >
              <span className={selected ? "" : "text-text-lo hover:text-text-mid"}>
                {it.tab}
              </span>
              {selected &&
                (reduce || paused ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-full"
                    style={{ background: it.theme.accent }}
                  />
                ) : (
                  <motion.span
                    key={index}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left rounded-full"
                    style={{ background: it.theme.accent }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                ))}
            </button>
          );
        })}
      </div>

      {/* The slide. <Link> wraps AnimatePresence so routing survives the swap. */}
      <Link
        href={active.href}
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="relative block"
        aria-label={`${active.label} — more`}
      >
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={active.id}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="px-6 py-8 sm:px-10 sm:py-9"
          >
            <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
              <div className="shrink-0">
                <Illustration theme={theme} />
              </div>
              <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
                <div className="flex items-center gap-3">
                  <span className={labelCls}>{active.label}</span>
                  <span className={metaCls}>{active.meta}</span>
                </div>
                <Body />
              </div>
              {/* The voice line, pulled to the right so the wide panel reads as a
                  composed spread rather than a left-hugging card. */}
              <p className={captionCls}>{active.caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </Link>
    </div>
  );
}
