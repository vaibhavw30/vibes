"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import { reveal, staggerContainer, staticVisible } from "@/lib/motion";

/*
 * Scroll-reveal wrappers built on the shared motion vocabulary (src/lib/motion).
 * Performance law: these animate transform + opacity only. Every wrapper gates on
 * useReducedMotion() and collapses to a static end-state — nothing is gated on
 * motion, so reduced-motion users get the full page, instantly.
 */

type DivProps = ComponentPropsWithoutRef<typeof motion.div>;

/** Single element: fade + rise once when it scrolls into view. */
export function Reveal({ children, ...props }: DivProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? staticVisible : reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its RevealItem children as the group enters view. */
export function RevealStagger({ children, ...props }: DivProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? staticVisible : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Child of RevealStagger — inherits the visible state from the parent. */
export function RevealItem({ children, ...props }: DivProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? staticVisible : reveal} {...props}>
      {children}
    </motion.div>
  );
}
