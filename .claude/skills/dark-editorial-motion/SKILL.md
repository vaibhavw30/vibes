---
name: dark-editorial-motion
description: Build distinctive dark, editorial, motion-rich web UI without the AI-default look. Use when building or restyling any page/section on a Next.js + Tailwind + Motion site that should feel editorial (big serif headlines, negative space, restraint) with concentrated interactive moments. Covers palette depth, type pairing discipline, the Motion/Lenis/GSAP stack, the animate-transform-and-opacity-only performance law, reduced-motion, and anti-template guardrails. Apply proactively whenever writing frontend components, animations, or layout for this kind of site.
---

# Dark editorial motion

Reusable guidance for building dark, editorial, moderately-animated sites that don't read as templated. Framework assumption: Next.js (App Router) + TypeScript + Tailwind + Motion (Framer Motion) + Lenis, with GSAP/ScrollTrigger reserved for one signature sequence.

## The one rule

**Calm canvas, alive objects.** Keep layout editorial and restrained — large serif headlines, generous negative space, one accent, slow deliberate reveals. Concentrate energy in a few interactive objects, never everywhere. If a section animates just to animate, cut it.

## Anti-template guardrails

AI-generated design clusters around three tells. Avoid them:
1. Cream (#F4F1EA) + high-contrast serif + terracotta/clay accent (~#D97757 is Claude's own accent — a dead giveaway).
2. Pure `#000` + a single bright acid-green/vermilion accent as the entire identity.
3. Broadsheet hairline-rule newspaper columns with zero radius.

This kind of site is closest to #2. Escape it by:
- Using a **layered near-black palette** (multiple steps: page / raised / higher / border), never flat `#000`.
- Letting **typography and one signature moment** carry identity, not a lone neon accent.
- Keeping the accent **restrained and considered** (an off-tone violet/teal/amber over a neon).
- Not defaulting to numbered eyebrows (01/02/03) unless content is genuinely sequential.

## Palette

Build dark with depth. Minimum four surface steps, three text steps, two border steps, one accent, optional data-tick pair:
```
--bg-0 page · --bg-1 card · --bg-2 hovered · --bg-3 inset/border-fill
--text-hi · --text-mid · --text-lo   (verify AA on --bg-0, esp. --text-lo)
--border · --border-strong
--accent (ONE) · --data-pos / --data-neg (quant contexts only, sparing)
```
No decorative gradients. A single subtle radial glow behind a hero signature is the only allowed exception.

## Typography

- Pair a **characterful display serif** (used with restraint, large, tight leading, slight negative tracking) with a **reliable body sans** (Inter is a safe body). Optionally a **mono** for metrics/tags/labels.
- Two display weights max. Fluid `clamp()` scale. Sentence case. Body measure capped ~68ch, leading ~1.6.
- Make the type treatment itself memorable — it's carrying the personality.

## Motion stack & law

- **Motion (Framer Motion):** enter/exit, scroll reveals, hover/tap, layout. Always wire `useReducedMotion`.
- **Lenis:** global smooth/inertia scroll — the "expensive feel," ~4KB.
- **GSAP + ScrollTrigger:** ONLY one signature scroll sequence. Avoid paid plugins (SplitText, ScrollSmoother).

**Performance law (non-negotiable):** animate only `transform` and `opacity` (GPU compositor). Never animate `width/height/top/left/margin/padding` — they trigger layout/paint and thrash. If you catch yourself animating layout properties, refactor to transforms.

Motion vocabulary — keep consistent across the site:
- Scroll reveal: fade + 12–20px rise, ease-out, 400–600ms, stagger children 60–80ms.
- Card hover: 150ms, scale 1.01–1.02 or bg/border shift. No bounce.
- Page transition: opacity/slide 200–300ms.
- Reduced motion: every animation needs a static end-state; signature moments render a static frame; nothing essential is gated on motion.

## Layout

- Generous negative space is the editorial signal — don't fill every region.
- Asymmetry over centered grids: offset headlines, ragged columns, deliberate imbalance.
- Large vertical rhythm between scroll "scenes" (6–8rem) so reveals breathe.
- Cards: raised surface + hairline border + ~12px radius; hover raises surface subtly, not via heavy shadow.

## Quality floor (build silently, never announce)

- Responsive to 360px, no horizontal scroll.
- Visible keyboard focus (accent ring).
- `prefers-reduced-motion` honored everywhere.
- AA contrast on the dark palette.
- Semantic HTML, alt text, correct heading order.
- Perf ≥ 90 mobile; LCP is hero text, not heavy JS/WebGL. Lazy-load the heavy interactive moment.

## CSS specificity caution

When writing Tailwind + custom CSS, watch selector specificity between type-based (`.section`) and element/utility selectors — they can cancel each other's paddings/margins between sections. Keep section spacing in one place.

## Process

Two passes. First brainstorm a compact token system (color 4–6 hexes, type 2–3 roles, layout concept, ONE signature element). Then critique it against the brief: if any part is what you'd produce for *any* similar site, revise it and note what changed. Only then build, deriving every color/type choice from the plan. Spend boldness in one place; keep everything around it quiet.
