"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { heroHeadline, heroRoles, heroSublinePrefix } from "@/content/site";
import { PaperPlane } from "@/components/home/paper-plane";

/*
 * Home hero — "Daydream sky" (Home - Polished). The site-wide fixed painting
 * (layout.tsx, faded to 0.45 for content legibility) is re-layered here at 0.55
 * with a bottom mask fade + cursor parallax so the hero reads vivid. The ink
 * headline is the LCP element (plain text, never gated on the image). The sub-line's
 * final word cycles through heroRoles on a masked vertical slide.
 *
 * Signature interactive moment: <PaperPlane> — a cursor-following paper airplane
 * (spring physics, static frame under reduced motion). It supersedes the removed
 * LiquidityField in the hero; the field component is kept at ./liquidity-field.tsx.
 */
const CYCLE_MS = 2400;

export function Hero({ breadcrumb }: { breadcrumb?: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % heroRoles.length),
      CYCLE_MS,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const role = reduce ? heroRoles[0] : heroRoles[index];

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[88svh] w-full items-center overflow-hidden"
    >
      {/* Vivid hero copy of the painting: scaled for parallax headroom, faded out
          toward the bottom so it hands off to the site-wide background. */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat [transition:transform_.18s_ease-out] [will-change:transform]"
        style={{
          backgroundImage: "url('/hero-park.jpg')",
          opacity: 0.55,
          transform: "scale(1.06)",
          WebkitMaskImage:
            "linear-gradient(180deg,#000 0%,#000 62%,transparent 100%)",
          maskImage: "linear-gradient(180deg,#000 0%,#000 62%,transparent 100%)",
        }}
      />
      {/* Soft, left-weighted light scrim behind the headline for legibility. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(247,250,252,0.74) 0%, rgba(247,250,252,0.42) 32%, rgba(247,250,252,0.08) 58%, rgba(247,250,252,0) 76%)",
        }}
      />

      <PaperPlane containerRef={heroRef} bgRef={bgRef} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-mono uppercase tracking-widest text-text-lo"
        >
          Georgia Tech · Computer Science
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="mt-6 max-w-[15ch] text-hero font-serif text-text-hi"
        >
          {heroHeadline}
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
          className="mt-7 flex flex-wrap items-baseline gap-x-[0.4ch] text-h3 text-text-mid"
        >
          <span>{heroSublinePrefix}</span>
          <span className="relative inline-flex overflow-hidden py-[0.15em]">
            {reduce ? (
              <span className="font-serif italic text-accent">{role}</span>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={role}
                  initial={{ y: "0.9em", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-0.9em", opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif italic text-accent"
                >
                  {role}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        </motion.p>

        {breadcrumb && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
          >
            {breadcrumb}
          </motion.div>
        )}
      </div>
    </section>
  );
}
