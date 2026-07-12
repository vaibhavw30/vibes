import type { Variants } from "motion/react";

/*
 * Shared motion vocabulary — keep consistent across the site (STYLE.md §4).
 * Performance law: animate ONLY transform + opacity. Never layout properties.
 *
 * Every consumer must gate these with `useReducedMotion()` from motion/react
 * and fall back to a static end-state. See useReveal() below for the pattern.
 */

// Scroll reveal: fade + 12–20px rise, ease-out, 400–600ms.
export const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stagger container for grouped children (~60–80ms between children).
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

// Card hover: subtle scale, no bounce (150ms). Use as a `whileHover` target.
export const cardHover = {
  scale: 1.015,
  transition: { duration: 0.15, ease: "easeOut" as const },
};

// Static end-state to swap in when prefers-reduced-motion is set.
export const staticVisible: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};
