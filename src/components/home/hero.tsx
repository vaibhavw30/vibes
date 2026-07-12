"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { heroHeadline, heroRoles, heroSublinePrefix } from "@/content/site";

/*
 * Home hero — "Daydream sky". The Higgsfield oil painting is a fixed, faded,
 * site-wide background (layout.tsx); the hero just lays a soft light scrim behind
 * the headline for legibility. The ink headline is the LCP element (plain text,
 * never gated on the image). The sub-line's final word cycles through heroRoles on
 * a masked vertical slide (transform + opacity).
 *
 * NOTE (pending Vaibhav / Claude Design): the LiquidityField signature moment was
 * removed from the hero — particles clash with the painting. The component is kept
 * at ./liquidity-field.tsx (and documented in DESIGN_HANDOFF §9) for reuse. The
 * "one interactive moment" question is open (e.g. a subtle parallax on the fixed
 * painting, or a sky-only field).
 */
const CYCLE_MS = 2400;

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

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
    <section className="relative flex min-h-[88svh] w-full items-center overflow-hidden">
      {/* The painting is the site-wide fixed background (layout.tsx). Here we only
          lay a soft, left-weighted light scrim behind the headline so the ink text
          stays AA-legible over the sky. Tune strength once the asset is in. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(247,250,252,0.72) 0%, rgba(247,250,252,0.4) 32%, rgba(247,250,252,0.08) 58%, rgba(247,250,252,0) 76%)",
        }}
      />

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
      </div>
    </section>
  );
}
