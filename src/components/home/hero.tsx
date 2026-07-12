"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { heroHeadline, heroRoles, heroSublinePrefix } from "@/content/site";

/*
 * Home hero — the LCP element is plain text. The signature interactive moment
 * (Phase 4) is the "Liquidity" depth field, lazy-loaded (ssr:false) so it lands
 * only on the client, in its own chunk, and never gates the hero-text LCP. The
 * sub-line's final word cycles through heroRoles on a masked vertical slide
 * (transform + opacity only). Under prefers-reduced-motion the cycle stops, the
 * first role renders static, and the field paints a single frame.
 */
const LiquidityField = dynamic(
  () => import("./liquidity-field").then((m) => m.LiquidityField),
  { ssr: false },
);

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
    <section className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-center overflow-hidden px-6 pt-28 pb-20">
      <LiquidityField />

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 font-mono text-mono uppercase tracking-widest text-text-lo"
      >
        Georgia Tech · Computer Science
      </motion.p>

      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        className="relative z-10 mt-6 max-w-[15ch] text-hero font-serif text-text-hi"
      >
        {heroHeadline}
      </motion.h1>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
        className="relative z-10 mt-7 flex flex-wrap items-baseline gap-x-[0.4ch] text-h3 text-text-mid"
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
    </section>
  );
}
