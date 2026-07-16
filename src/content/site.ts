/*
 * Site-level content constants — single source of truth for locked copy.
 */

/** Hero headline (large serif). Locked, owner sign-off 2026-07. */
export const heroHeadline = "Building the things I imagined as a kid.";

/**
 * Hero sub-line word-cycle (LOCKED, owner sign-off 2026-07).
 * Rendered as: "Georgia Tech CS student interested in ___" where ___ cycles
 * through these in order (mask/typewriter reveal, reduced-motion static fallback).
 * Keep the list tight and true — don't pad with interests he didn't name.
 */
export const heroRoles = [
  "software development",
  "machine learning",
  "quantitative finance",
  "research",
] as const;

export const heroSublinePrefix = "Georgia Tech CS student interested in";

/** Conversion links (GitHub + LinkedIn ONLY — hard constraint). */
export const social = {
  github: "https://github.com/vaibhavw30",
  linkedin: "https://www.linkedin.com/in/vaibhavwudaru/",
} as const;

/**
 * A social link is only rendered once it holds a real URL. LinkedIn is still a
 * TODO, so the UI hides it rather than shipping a broken link — swap the value
 * above and it appears everywhere automatically.
 */
export const hasLinkedin = !social.linkedin.startsWith("TODO");

/** Primary nav destinations (Home lives on the wordmark). No resume — ever. */
export const navLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
] as const;
