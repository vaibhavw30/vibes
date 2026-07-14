# Interest Panel Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four cloud cards in the home "Beyond code" section with one frosted-glass carousel panel that auto-advances through Chess · Film · Kitchen · Debate, each with its own color theme and line-art illustration.

**Architecture:** A new client component `interest-panel.tsx` owns a local `INTERESTS` data array (illustration + theme + bespoke body + copy per interest) and all carousel state (active index, autoplay timer, pause). `beyond-code.tsx` shrinks to the section shell + `<InterestPanel/>`. The cloud CSS is deleted. Motion via `motion/react` `AnimatePresence`, gated on `useReducedMotion`, animating transform/opacity/color only.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 (`@theme inline`, no config file), motion@12 (`motion/react`), lucide-react.

## Global Constraints

- Reskin only — do NOT change IA, copy, content model, or interaction structure beyond swapping this section's presentation. (AGENTS.md / CLAUDE.md)
- Read `docs/DESIGN_HANDOFF.md` before styling; current theme is light "Daydream sky".
- Animate transform + opacity (and color for theme cross-fade) ONLY. (performance law, STYLE.md)
- Every motion path gates on `useReducedMotion()` and collapses to a static end-state. Nothing is gated on motion.
- Content honesty: only Vaibhav's real, confirmed facts. Chess `1177` + `FIDE ~1300`; Film `@vaibzz` + Letterboxd; Kitchen "Photo coming soon" placeholder; Debate `#19` in the country + gold `#3 · Berkeley Invitational (Varsity PF)`. The chess sparkline is decorative, not a real history.
- Real routes preserved: /about/chess, /about/movies, /about/cooking, /about.
- Tokens: `--accent #2a67a6`, gold `#8a6410`, `text-hi #1b2735`, `text-mid #41505f`, `text-lo #64717f`, `--border rgba(27,39,53,.14)`. `.frost` = blur(14px) saturate(118%) + float shadow.
- No test framework in repo. Verification per task = `npm run lint` clean, `npm run build` clean, and browser checks via the Browser pane (dev server `seed`).

---

### Task 1: Static single-slide panel + remove clouds

Build `interest-panel.tsx` rendering ONE interest statically (no tabs/autoplay yet): illustration, eyebrow+meta, bespoke body, caption, theme edge bar + wash, wrapped in a `<Link>`. Wire it into `beyond-code.tsx`, delete the four cloud cards, and delete the cloud CSS.

**Files:**
- Create: `src/components/home/interest-panel.tsx`
- Modify: `src/components/home/beyond-code.tsx` (replace card bodies with shell + `<InterestPanel/>`)
- Modify: `src/app/globals.css` (delete `.cloud-*` block, ~lines 201–284, and its header comment)

**Interfaces:**
- Produces: `export function InterestPanel(): JSX.Element` — self-contained, no props.
- Produces (internal, used by later tasks): `type Interest`, `const INTERESTS: Interest[]`, `type Theme`, illustration components `RookIcon/FilmIcon/PotIcon/PodiumIcon`, body components `ChessBody/FilmBody/KitchenBody/DebateBody`, and shared class consts `labelCls/metaCls/captionCls`.

- [ ] **Step 1: Create `interest-panel.tsx` with types, themes, and shared classes**

```tsx
"use client";

import type { FC } from "react";
import Link from "next/link";

/*
 * Home "Beyond code" — a single frosted-glass carousel panel that advances
 * through Vaibhav's four interests, one at a time, each with its own color theme
 * and line-art illustration. Replaces the earlier cloud cards. Every value is a
 * real, confirmed fact (see per-interest notes); the chess sparkline is
 * decorative, and the kitchen photo is an honest "coming soon" placeholder.
 */

type Theme = {
  accent: string; // bold: illustration stroke, big number, active tab, edge bar, progress
  tint: string; // pale fill for duotone illustration (accent at low alpha)
  wash: string; // soft radial glow laid over the frost (never carries text)
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
const captionCls = "max-w-[34ch] text-small leading-relaxed text-text-mid";
```

- [ ] **Step 2: Add the four duotone line-art illustrations**

Single-weight strokes in `theme.accent`, a pale `theme.tint` fill. ~132px box, `aria-hidden`. Film uses `theme.accent2` for the popcorn.

```tsx
function RookIcon({ theme }: { theme: Theme }) {
  return (
    <svg viewBox="0 0 100 100" width="132" height="132" fill="none" aria-hidden="true"
      stroke={theme.accent} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path fill={theme.tint}
        d="M30 34V24h8v6h8v-6h8v6h8v-6h8v10l-6 6v22l6 8v6H30v-6l6-8V40l-6-6Z" />
      <path d="M40 62h20M38 74h24" />
    </svg>
  );
}

function FilmIcon({ theme }: { theme: Theme }) {
  const o = theme.accent2 ?? theme.accent;
  return (
    <svg viewBox="0 0 100 100" width="132" height="132" fill="none" aria-hidden="true"
      strokeLinejoin="round" strokeLinecap="round">
      {/* film strip */}
      <g stroke={theme.accent} strokeWidth="2.4">
        <rect x="20" y="22" width="42" height="56" rx="4" fill={theme.tint} />
        <path d="M20 34h42M20 66h42" />
        <g fill={theme.accent} stroke="none">
          <rect x="24" y="25" width="5" height="5" rx="1" /><rect x="53" y="25" width="5" height="5" rx="1" />
          <rect x="24" y="70" width="5" height="5" rx="1" /><rect x="53" y="70" width="5" height="5" rx="1" />
        </g>
      </g>
      {/* popcorn box */}
      <g stroke={o} strokeWidth="2.4">
        <path fill={theme.tint} d="M60 52l4 30h16l4-30Z" />
        <path d="M63 60h18" />
        <g fill={o} stroke="none">
          <circle cx="64" cy="48" r="5" /><circle cx="72" cy="44" r="5" /><circle cx="80" cy="48" r="5" /><circle cx="76" cy="51" r="4" />
        </g>
      </g>
    </svg>
  );
}

function PotIcon({ theme }: { theme: Theme }) {
  return (
    <svg viewBox="0 0 100 100" width="132" height="132" fill="none" aria-hidden="true"
      stroke={theme.accent} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path fill={theme.tint} d="M26 50h48v14a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10Z" />
      <path d="M20 50h60M26 44h48" />
      <path d="M30 44l4-8M46 44l2-8M62 44l4-8" />
      {/* whisk */}
      <path d="M70 30l6-14" stroke={theme.accent} />
      <path d="M74 18c4 2 4 8 0 12M70 20c-4 2-4 8 0 12" />
    </svg>
  );
}

function PodiumIcon({ theme }: { theme: Theme }) {
  return (
    <svg viewBox="0 0 100 100" width="132" height="132" fill="none" aria-hidden="true"
      stroke={theme.accent} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path fill={theme.tint} d="M38 40h24l-4 34H42Z" />
      <path d="M34 40h32M46 74h8M50 74v10M40 84h20" />
      <path d="M50 40V28" />
      <path fill={theme.tint} d="M50 16l14 6-14 6-14-6Z" />
    </svg>
  );
}
```

- [ ] **Step 3: Add the four body components (bespoke middle content, real data)**

```tsx
function ChessBody() {
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[2rem] leading-none text-text-hi">1177</span>
        <span className={metaCls}>FIDE ~1300</span>
      </div>
      {/* Decorative "hovering" trace — oscillates around a level, not a climb. */}
      <svg viewBox="0 0 140 44" preserveAspectRatio="none"
        className="mt-2.5 h-[34px] w-full max-w-[220px] overflow-visible" aria-hidden="true">
        <polyline points="4,24 16,20 28,26 40,21 52,25 64,19 76,24 88,21 100,26 112,20 124,24 136,22"
          fill="none" stroke="#2f7d54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className="flex h-[70px] max-w-[260px] items-center justify-center rounded-[9px] border border-dashed border-border px-6"
      style={{ background: "linear-gradient(140deg,#f0e6d0,#dbe6c8)" }}>
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
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em]" style={{ color: "#8a6410" }}>
        #3 · Berkeley Invitational (Varsity PF)
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Add the `INTERESTS` array**

```tsx
const INTERESTS: Interest[] = [
  {
    id: "chess", tab: "Chess", label: "Chess", meta: "chess.com · rapid",
    href: "/about/chess",
    theme: { accent: "#2f7d54", tint: "rgba(47,125,84,0.12)", wash: "rgba(47,125,84,0.07)" },
    Illustration: RookIcon, Body: ChessBody,
    caption: "Hovering around 1300, stubbornly.",
  },
  {
    id: "film", tab: "Film", label: "Film", meta: "@vaibzz",
    href: "/about/movies",
    theme: { accent: "#2f7db0", tint: "rgba(47,125,176,0.12)", wash: "rgba(47,125,176,0.07)", accent2: "#e0812f" },
    Illustration: FilmIcon, Body: FilmBody,
    caption: "Logging everything I watch on Letterboxd.",
  },
  {
    id: "kitchen", tab: "Kitchen", label: "Kitchen → garden", meta: "off-screen",
    href: "/about/cooking",
    theme: { accent: "#c0553a", tint: "rgba(192,85,58,0.12)", wash: "rgba(192,85,58,0.07)" },
    Illustration: PotIcon, Body: KitchenBody,
    caption: "Cooking pulled me into a garden, then beekeeping, then pollinator advocacy.",
  },
  {
    id: "debate", tab: "Debate", label: "Debate", meta: "National circuit",
    href: "/about",
    theme: { accent: "#8a6410", tint: "rgba(138,100,16,0.12)", wash: "rgba(138,100,16,0.08)" },
    Illustration: PodiumIcon, Body: DebateBody,
    caption: "Ranked #19 in the country, once upon a time.",
  },
];
```

- [ ] **Step 5: Add the static `InterestPanel` (renders `INTERESTS[0]` only for now)**

```tsx
export function InterestPanel() {
  const active = INTERESTS[0];
  const { theme } = active;
  const Illustration = active.Illustration;
  const Body = active.Body;
  return (
    <div className="frost relative mt-12 overflow-hidden rounded-2xl border border-border/70">
      {/* theme wash + left edge bar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 80% at 12% 0%, ${theme.wash}, transparent 60%)` }} />
      <span aria-hidden="true" className="absolute inset-y-3 left-0 w-[3px] rounded-full"
        style={{ background: theme.accent }} />
      <Link href={active.href}
        className="relative block px-6 py-8 sm:px-10 sm:py-10"
        aria-label={`${active.label} — more`}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="shrink-0"><Illustration theme={theme} /></div>
          <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div className="flex items-center gap-3">
              <span className={labelCls}>{active.label}</span>
              <span className={metaCls}>{active.meta}</span>
            </div>
            <Body />
            <p className={captionCls}>{active.caption}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `beyond-code.tsx` to the shell + panel**

Replace the entire file with:

```tsx
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { InterestPanel } from "@/components/home/interest-panel";

/*
 * "Beyond code" — a single frosted carousel panel (see interest-panel.tsx) that
 * advances through the four facets of the person. Replaces the earlier cloud
 * cards. Every value shown is a real, confirmed fact.
 */
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
      <InterestPanel />
    </section>
  );
}
```

- [ ] **Step 7: Delete the cloud CSS from `globals.css`**

Remove the block that starts with the comment `"Beyond code" cloud-shaped cards.` (~line 201) through the end of the `.cloud-d { --cloud: ... }` rule (~line 284). Leave the `.viz-draw` block above and the reduced-motion block below intact.

- [ ] **Step 8: Verify lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors; `beyond-code.tsx` no longer imports lucide `ArrowUpRight`/`Reveal`item; no unused `.cloud-*` references remain.

- [ ] **Step 9: Verify static render in the browser**

Start/verify dev server `seed`; scroll to Beyond code (use the tall-viewport technique to defeat the preview scroll-freeze). Confirm: one frosted panel, rook illustration in green, "Chess / chess.com · rapid", 1177 + FIDE ~1300 + sparkline, caption, green edge bar + wash. No console errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/home/interest-panel.tsx src/components/home/beyond-code.tsx src/app/globals.css
git commit -m "Beyond-code: static interest panel, remove cloud cards"
```

---

### Task 2: Tab rail + manual switching (a11y)

Add the `Chess · Film · Kitchen · Debate` tab rail with ARIA tablist semantics, roving-tabindex keyboard nav, and click-to-switch. No autoplay yet.

**Files:**
- Modify: `src/components/home/interest-panel.tsx`

**Interfaces:**
- Consumes: `INTERESTS`, `Interest`, `Theme` from Task 1.
- Produces (internal): `active` index state; a `<TabRail>` inline section; `select(i, "manual")` handler used by Task 3.

- [ ] **Step 1: Convert `InterestPanel` to stateful with an active index**

Add imports and state; derive the active interest from index:

```tsx
import { useId, useState } from "react";
// ...
export function InterestPanel() {
  const [index, setIndex] = useState(0);
  const baseId = useId();
  const active = INTERESTS[index];
  const { theme } = active;
  // ...unchanged render, but panel region gets:
  //   id={`${baseId}-panel`} role="tabpanel"
  //   aria-labelledby={`${baseId}-tab-${active.id}`}
}
```

- [ ] **Step 2: Add the tab rail above the slide**

Render inside the panel, above the `<Link>`. Active tab in `theme.accent`; a thin track under the rail with an accent fill under the active tab (progress bar comes in Task 3 — for now a static full-width underline on the active tab).

```tsx
<div role="tablist" aria-label="Interests"
  className="relative flex flex-wrap gap-x-5 gap-y-1 border-b border-border/60 px-6 pt-5 sm:px-10">
  {INTERESTS.map((it, i) => {
    const selected = i === index;
    return (
      <button key={it.id} role="tab" type="button"
        id={`${baseId}-tab-${it.id}`}
        aria-selected={selected}
        aria-controls={`${baseId}-panel`}
        tabIndex={selected ? 0 : -1}
        onClick={() => setIndex(i)}
        onKeyDown={(e) => onTabKey(e, i)}
        className="relative -mb-px pb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] transition-colors"
        style={{ color: selected ? it.theme.accent : undefined }}
      >
        <span className={selected ? "" : "text-text-lo hover:text-text-mid"}>{it.tab}</span>
        {selected && (
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full"
            style={{ background: it.theme.accent }} />
        )}
      </button>
    );
  })}
</div>
```

- [ ] **Step 3: Add roving-tabindex keyboard handler**

```tsx
function onTabKey(e: React.KeyboardEvent, i: number) {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();
  const dir = e.key === "ArrowRight" ? 1 : -1;
  const next = (i + dir + INTERESTS.length) % INTERESTS.length;
  setIndex(next);
  const el = document.getElementById(`${baseId}-tab-${INTERESTS[next].id}`);
  (el as HTMLButtonElement | null)?.focus();
}
```

- [ ] **Step 4: Verify lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Verify switching in the browser**

Click each tab → panel content, illustration, colors, edge bar, wash all change to that interest. Focus a tab, press ArrowLeft/ArrowRight → moves and recolors. `aria-selected` correct in the accessibility tree (read_page).

- [ ] **Step 6: Commit**

```bash
git add src/components/home/interest-panel.tsx
git commit -m "Interest panel: tab rail + keyboard switching"
```

---

### Task 3: Autoplay + progress bar + pause/resume + reduced motion

Auto-advance every 5.5s with a progress bar under the active tab; pause on hover/focus-within and after manual selection; resume when the pointer leaves / focus exits; disable autoplay entirely under reduced motion.

**Files:**
- Modify: `src/components/home/interest-panel.tsx`

**Interfaces:**
- Consumes: `index`/`setIndex`, tab rail from Task 2.
- Produces (internal): `paused` state, `useReducedMotion()` gate, a keyed progress-bar element consumed visually only.

- [ ] **Step 1: Add reduced-motion + paused state and the autoplay effect**

```tsx
import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
const AUTOPLAY_MS = 5500;
// inside component:
const reduce = useReducedMotion();
const [paused, setPaused] = useState(false);
useEffect(() => {
  if (reduce || paused) return;
  const id = setInterval(() => setIndex((p) => (p + 1) % INTERESTS.length), AUTOPLAY_MS);
  return () => clearInterval(id);
}, [reduce, paused, index]);
```

(Depending on `index` restarts the timer after a manual jump, so the full interval applies to the new slide.)

- [ ] **Step 2: Wire pause/resume on the panel root**

On the outer panel `div` add:

```tsx
onMouseEnter={() => setPaused(true)}
onMouseLeave={() => setPaused(false)}
onFocusCapture={() => setPaused(true)}
onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}
```

- [ ] **Step 3: Replace the active-tab underline with an animated progress bar**

Under the active tab, when not reduced and not paused, a bar that fills 0→100% over `AUTOPLAY_MS`, keyed on `index` so it restarts each slide. When reduced OR paused, show a static full underline instead.

```tsx
{selected && (
  reduce || paused ? (
    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full"
      style={{ background: it.theme.accent }} />
  ) : (
    <motion.span key={index} aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left rounded-full"
      style={{ background: it.theme.accent }}
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
      transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} />
  )
)}
```

Add `import { motion, useReducedMotion } from "motion/react";`.

- [ ] **Step 4: Verify lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Verify autoplay in the browser**

With a normal viewport at the section: panel advances ~every 5.5s; progress bar tracks it. Hover the panel → advancing stops and progress freezes; move away → resumes. Click a tab → jumps, progress restarts, and after moving the pointer away autoplay continues. Emulate reduced motion (`resize_window` colorScheme not enough — use DevTools emulate or verify the code path) → no autoplay, static underline.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/interest-panel.tsx
git commit -m "Interest panel: autoplay, progress bar, pause/resume, reduced-motion"
```

---

### Task 4: Slide cross-fade transition

Wrap the slide body in `AnimatePresence` so switching cross-slides (direction-aware) with a color cross-fade, collapsing to opacity-only under reduced motion.

**Files:**
- Modify: `src/components/home/interest-panel.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces (internal): `dirRef` tracking advance direction for enter/exit x sign.

- [ ] **Step 1: Track direction on index change**

```tsx
const prevIndex = useRef(0);
let dir = 1;
// compute on render: compare index to prevIndex.current
// simplest: store direction when setting index. Add a helper:
const go = (next: number) => {
  dirRef.current = next > index || (index === INTERESTS.length - 1 && next === 0) ? 1 : -1;
  setIndex(next);
};
const dirRef = useRef(1);
```

Replace `setIndex(i)` in the tab click, `setIndex(next)` in the key handler, and the autoplay `setIndex` with `go(...)` (autoplay always dir=1).

- [ ] **Step 2: Wrap the slide `<Link>` content in `AnimatePresence`**

The panel chrome (wash, edge bar, tab rail) stays outside; only the slide body animates. Edge-bar + wash colors transition via CSS `transition: background-color/background` on those elements (add `transition-[background] duration-500`).

```tsx
<AnimatePresence mode="wait" custom={dirRef.current} initial={false}>
  <motion.div key={active.id}
    custom={dirRef.current}
    initial={reduce ? { opacity: 0 } : (d: number) => ({ opacity: 0, x: 24 * d })}
    animate={{ opacity: 1, x: 0 }}
    exit={reduce ? { opacity: 0 } : (d: number) => ({ opacity: 0, x: -24 * d })}
    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    className="relative block px-6 py-8 sm:px-10 sm:py-10">
    {/* the two-column slide content that was inside <Link> */}
  </motion.div>
</AnimatePresence>
```

Note: `initial`/`exit` as functions require the variants form; if function-form isn't supported inline, define `const slideVariants = {...}` using `custom` and pass `variants={slideVariants}`. Keep the `<Link>` as the outer wrapper OR make the whole `motion.div` the link via `Link` `asChild`-style — since Next `Link` doesn't support `asChild`, wrap `motion.div` INSIDE `<Link legacyBehavior={false}>`; simplest: keep `<Link>` static wrapping `AnimatePresence`, and put `href` on the Link. Verify clicks still route.

- [ ] **Step 3: Add color transitions to wash + edge bar**

On the wash div and edge-bar span add `className="... transition-[background] duration-500"` (and `background-color` for the bar). Confirm they morph rather than snap.

- [ ] **Step 4: Verify lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Verify transitions in the browser**

Autoplay and tab clicks cross-slide (right-going advance slides left-out/right-in; ArrowLeft reverses). Colors cross-fade smoothly. Under reduced motion it's a plain opacity crossfade with no x. Clicking a slide still navigates to the subpage.

- [ ] **Step 6: Screenshot all four themes**

Use the tall-viewport technique. Capture Chess (green/rook), Film (blue+orange/film+popcorn), Kitchen (terracotta/pot), Debate (gold/podium). Confirm each color + illustration reads well over the painting; check AA of the big number/labels on frost.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/interest-panel.tsx
git commit -m "Interest panel: direction-aware slide transition + color cross-fade"
```

---

## Self-Review

- **Spec coverage:** component structure (T1), data model (T1), themes (T1), layout (T1), tab rail + a11y (T2), autoplay/pause/progress/reduced-motion (T3), transition + color cross-fade (T4), content honesty (T1 data), cloud CSS removal (T1). All spec sections mapped.
- **Placeholder scan:** all steps carry real code; no TBD/TODO.
- **Type consistency:** `Interest`/`Theme`/`INTERESTS` defined in T1 and consumed by name in T2–T4; `go()`/`dirRef`/`paused`/`index` names consistent across tasks.
- **Known risk flagged inline:** T4 Step 2 — Next `<Link>` + `motion.div` composition (no `asChild`); the plan specifies keeping `<Link>` as the outer static wrapper around `AnimatePresence` so routing is preserved. Verify in T4 Step 5.
