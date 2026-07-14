# Beyond-code → Interest Panel carousel — design spec

**Date:** 2026-07-14
**Scope:** Replace the four cloud-shaped cards in the home "Beyond code" section
with a single frosted-glass panel that auto-advances through the four interests
(Chess · Film · Kitchen · Debate), one at a time, each with its own color theme
and a line-art illustration. Reskin only — no IA, copy, content-model, or route
changes beyond swapping the presentation of already-shown facts.

## Motivation

The cloud cards read as tacky/clip-art (hard scallop, sticker feel) and the row
of four fights the calm painting. The experience timeline's single frosted panel
(`experience-strip.tsx`) is the aesthetic the owner likes: one grounded surface
floating over the sky. This section adopts that same surface, but as a carousel.

## Component structure

- **New file:** `src/components/home/interest-panel.tsx` — a client component
  (`"use client"`) exporting `<InterestPanel />`. Owns all carousel state and the
  per-interest data. One focused unit: given nothing, renders the whole panel.
- **`beyond-code.tsx`** shrinks to the section shell only: `<SectionHeading>`
  (eyebrow "Beyond code", title "The rest of it.", CTA About me → /about) wrapped
  in `<Reveal>`, then `<InterestPanel />`. The four `*Card` components and
  `CLOUD_VARIANTS`/`CloudSkin` are deleted.
- **`globals.css`:** delete the entire `.cloud-*` block (lines ~201–284). Add a
  small `.interest-*` block only if a mask/utility is genuinely needed; prefer
  inline styles + Tailwind utilities to keep it token-driven.

### Data model (inside interest-panel.tsx)

A local `const INTERESTS: Interest[]` array, order = Chess, Film, Kitchen, Debate.
Each entry:

```
type Interest = {
  id: string;                 // "chess" | "film" | "kitchen" | "debate"
  tab: string;                // short tab label: "Chess" | "Film" | "Kitchen" | "Debate"
  label: string;              // panel eyebrow: "Chess", "Kitchen → garden", ...
  meta: string;               // right-side meta: "chess.com · rapid", "@vaibzz", ...
  href: string;               // /about/chess, /about/movies, /about/cooking, /about
  theme: Theme;               // color set (see below)
  Illustration: FC;           // duotone line-art SVG for this interest
  caption: string;            // the one-line voice caption (unchanged copy)
  Body: FC;                   // the bespoke middle content (stat, sparkline, etc.)
};
```

Content is exactly today's confirmed facts (no new claims):
- **Chess** — stat `1177` + `FIDE ~1300`, decorative "hovering" sparkline,
  caption "Hovering around 1300, stubbornly." Illustration: rook.
- **Film** — `@vaibzz`, Letterboxd three-dot mark + wordmark, caption "Logging
  everything I watch on Letterboxd." Illustration: film strip + popcorn.
- **Kitchen → garden** — honest "Photo coming soon" slot, caption "Cooking pulled
  me into a garden, then beekeeping, then pollinator advocacy." Illustration: pot + whisk.
- **Debate** — stat `#19` + `in the country` + gold `#3 · Berkeley Invitational
  (Varsity PF)`, caption "Ranked #19 in the country, once upon a time."
  Illustration: lectern/podium.

## Color themes ("soft wash + bold accents")

The panel stays light frosted glass. A theme provides: `accent` (bold — used for
the illustration stroke, active tab, edge bar, progress bar, the big number),
`wash` (a very soft tint laid over the frost as a radial/linear glow), and an
optional `accent2` (Film only, for the orange/blue duotone).

| id      | accent (bold)        | wash (soft)                     | accent2         |
|---------|----------------------|---------------------------------|-----------------|
| chess   | green `#2f7d54`      | mint, ~6–8% over frost          | —               |
| film    | blue `#2f7db0`       | cool blue, soft                 | orange `#e0812f`|
| kitchen | terracotta `#c0553a` | warm red, soft                  | —               |
| debate  | gold `#8a6410`       | warm gold, soft                 | —               |

Accents are chosen to hold AA as text on frosted white for the big number/labels;
the `wash` never carries text. Illustration duotone = accent stroke + a pale
tint fill (accent at low alpha), except Film which uses accent(blue) + accent2(orange).

## Layout

Single `.frost` panel: `rounded-2xl border border-border/70`, generous padding
(`p-6 sm:p-10`), min-height so slides don't jump (`min-h-[300px]` desktop). A thin
theme edge bar down the left (absolute, 3px, accent, rounded). The soft `wash`
is an absolutely-positioned tinted layer inside the panel (below content).

- **Tab rail** (top of panel): a `role="tablist"` row — `Chess · Film · Kitchen ·
  Debate`. Active tab in its theme accent with a thin **progress bar** beneath it
  that fills over the autoplay interval (doubles as the timer). Inactive tabs muted
  (`text-text-lo`), hover → `text-text-mid`.
- **Slide body** (below rail): two columns on `sm+` — left = illustration
  (~140–180px), right = eyebrow+meta row, `Body`, caption. On mobile: illustration
  stacks above content, tabs wrap. The whole slide is wrapped in a `<Link href>` so
  it stays clickable through to the subpage (preserving today's behavior), EXCEPT
  interactive controls (tabs) which stop propagation.

## Interaction / motion

- **Autoplay:** advance every **5.5s**. A single `setInterval`/timeout driving
  `active` index; progress bar animates 0→100% over the interval.
- **Pause:** on pointer-enter / focus-within of the panel, and after any manual
  tab selection. **Resume:** on pointer-leave / blur (manual selection resumes
  autoplay once the pointer leaves, so "not touching it → auto-advance" holds).
- **Transition:** `AnimatePresence` cross-slide — outgoing slide exits
  `x: -24, opacity: 0`, incoming enters `x: 24 → 0, opacity: 1`, ~0.42s
  `[0.22,1,0.36,1]`. Direction-aware (advance vs. tab-jump uses index delta sign).
  The theme wash + edge bar + tab colors cross-fade via CSS transition on color.
- **Reduced motion (`useReducedMotion`):** NO autoplay (static, defaults to Chess
  or last-selected), transition collapses to a simple opacity crossfade (no x),
  progress bar hidden. Tabs still switch instantly. Animate transform/opacity/color
  only (performance law).

## Accessibility

- Tab rail = `role="tablist"`; each tab `role="tab"`, `aria-selected`,
  `aria-controls` → the panel `id`; panel region `role="tabpanel"`,
  `aria-labelledby` the active tab. Arrow-Left/Right move between tabs (roving
  tabindex). Tabs are real `<button>`s.
- Autoplay is decorative; it pauses on focus so keyboard users aren't yanked.
- The slide `<Link>` keeps an accessible name (interest label). Illustrations are
  `aria-hidden`.

## Content honesty (unchanged rule)

Every value shown is Vaibhav's real, confirmed data. The Kitchen photo stays an
explicit "Photo coming soon" placeholder until a real image is supplied. The chess
sparkline stays decorative (not a real rating history) — keep the existing comment
to that effect near the data.

## Out of scope

- No real Kitchen photo (still pending from owner).
- No live Chess.com / Letterboxd data feeds (that's a later phase).
- No changes to the interest subpages themselves.

## Testing / verification

- `npm run lint` + `tsc` (build) clean.
- Browser: autoplay advances; hover pauses + resumes on leave; each tab jumps and
  recolors; progress bar tracks the timer; keyboard arrows move tabs; mobile stacks;
  reduced-motion (emulate) shows a static, autoplay-off panel that still tab-switches.
- Visual: screenshot each of the four themes (tall-viewport technique to defeat the
  preview scroll-freeze) to confirm color + illustration read.
