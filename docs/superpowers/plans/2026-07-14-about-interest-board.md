# About Interest Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the static 8-tile interests grid on `/about` with a self-playing 4×4 board whose tiles are pieces that slide between open squares, stalling on hover/focus.

**Architecture:** A new client component `interest-board.tsx` owns cell geometry, tile→cell positions, the move loop, and the hover-stall; it renders a shared `Tile` for the board (sm+) and a static mobile grid. Motion via `motion/react` `layout` FLIP (transform-only), gated on `useReducedMotion`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, motion@12, lucide-react.

## Global Constraints

- Reskin/presentation only — `src/content/about.ts` and all copy untouched (real facts). (AGENTS.md / site-preferences)
- Animate transform + opacity (+ color transitions) ONLY. (performance law)
- Every motion path gates on `useReducedMotion()` and collapses to a static end-state.
- Tokens: `bg-1` rgba(255,255,255,.6), `bg-2` .82, `text-hi #1b2735`, `text-mid #41505f`, `text-lo #64717f`, `border`/`border-strong`. `.frost` = blur+shadow. `accent #2a67a6`.
- Geometry: `COLS=ROWS=4`; cell `{r,c}`; `parity=(r+c)%2`, `1`=dark.
- No component test framework; verify per task = `npm run lint` + `npm run build` clean + Browser pane checks (dev server `dev`, tall-viewport technique for the below-fold section).

---

### Task 1: Static board + Tile + mobile grid (no motion)

Build `interest-board.tsx` rendering the 4×4 board with checker tint, parity-styled tiles at fixed `INITIAL` cells, and a static mobile grid. Wire into `about/page.tsx`, remove the old `InterestTile`. No autoplay yet.

**Files:**
- Create: `src/components/about/interest-board.tsx`
- Modify: `src/app/about/page.tsx`

**Interfaces:**
- Produces: `export function InterestBoard({ interests }: { interests: Interest[] })` — `Interest` imported from `@/content/about`.
- Produces (internal, used by Task 2): `COLS`, `ROWS`, `INITIAL`, `cellRC(i)`, `parity(i)`, and `Tile({ interest, dark })`.

- [ ] **Step 1: Create the file with geometry + a parity-aware `Tile`**

```tsx
"use client";

import type { FC } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Interest } from "@/content/about";

/*
 * /about "Beyond the work" — the 8 interests as pieces on a faint 4×4 board.
 * Left alone it plays itself (a piece slides to an open square every ~2s, added
 * in the motion pass); hover/focus stalls it. A tile on a DARK square reads
 * bolder + more opaque; on a LIGHT square it's airier. Content is unchanged —
 * every blurb is real (src/content/about.ts). Board is a pointer:fine / sm+
 * enhancement; touch and reduced motion get a static, scannable grid.
 */

const COLS = 4;
const ROWS = 4;
// Balanced starting squares (cell index = r*COLS + c), 8 pieces on 16 squares.
const INITIAL = [0, 2, 5, 7, 8, 10, 13, 15];

const cellRC = (i: number) => ({ r: Math.floor(i / COLS), c: i % COLS });
const parity = (i: number) => {
  const { r, c } = cellRC(i);
  return (r + c) % 2; // 1 = dark
};

const Tile: FC<{ interest: Interest; dark: boolean }> = ({ interest, dark }) => {
  const base =
    "frost group flex h-full flex-col justify-between rounded-xl border p-4 sm:p-5 transition-[background-color,border-color,color,transform] duration-500 ease-out";
  const skin = dark
    ? "bg-bg-2 border-border-strong"
    : "bg-bg-1/70 border-border";
  const labelCls = dark
    ? "text-text-mid font-medium"
    : "text-text-lo font-normal";
  const blurbCls = dark ? "text-text-mid font-medium" : "text-text-mid/85";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={`font-mono text-mono uppercase tracking-wider ${labelCls}`}>
          {interest.label}
        </span>
        {interest.href && (
          <ArrowUpRight
            className="size-4 shrink-0 text-text-lo transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>
      <p className={`mt-4 text-small leading-relaxed ${blurbCls}`}>{interest.blurb}</p>
    </>
  );

  if (interest.href) {
    return (
      <Link
        href={interest.href}
        className={`${base} ${skin} hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-2 motion-reduce:hover:translate-y-0`}
      >
        {body}
      </Link>
    );
  }
  return <div className={`${base} ${skin}`}>{body}</div>;
};
```

- [ ] **Step 2: Add the static `InterestBoard` (board sm+, mobile grid, no motion yet)**

```tsx
export function InterestBoard({ interests }: { interests: Interest[] }) {
  // positions[interestIndex] = current cell index; static for now.
  const positions = INITIAL;

  return (
    <>
      {/* Board — square, faint checker, pointer:fine / sm+ enhancement. */}
      <div
        role="group"
        aria-label="Interests"
        className="relative mx-auto hidden aspect-square w-full max-w-[680px] sm:block"
      >
        {/* checker layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-2xl"
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <div
              key={i}
              style={{ background: parity(i) ? "rgba(27,39,53,0.05)" : "transparent" }}
            />
          ))}
        </div>
        {/* tile layer */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 p-0">
          {interests.map((interest, idx) => {
            const cell = positions[idx];
            const { r, c } = cellRC(cell);
            return (
              <div
                key={interest.slug}
                style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
              >
                <Tile interest={interest} dark={parity(cell) === 1} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — static 2-col grid, no board/motion. */}
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {interests.map((interest) => (
          <Tile key={interest.slug} interest={interest} dark={false} />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Wire into `about/page.tsx`, remove old `InterestTile`**

In `src/app/about/page.tsx`: replace the `RevealStagger`…`InterestTile` block and delete the local `InterestTile` function + now-unused `Link`/`ArrowUpRight`/`RevealItem`/`RevealStagger` imports (keep `Reveal`). New section body:

```tsx
import { InterestBoard } from "@/components/about/interest-board";
// ...
        <Reveal>
          <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
            Beyond the work
          </p>
          <h2 className="mt-3 text-h2 font-serif text-text-hi">
            What I get up to otherwise.
          </h2>
        </Reveal>

        <div className="mt-10">
          <InterestBoard interests={interests} />
        </div>
```

- [ ] **Step 4: Lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors; no unused imports left in `about/page.tsx`.

- [ ] **Step 5: Verify static render (browser)**

Dev server `dev`; go to `/about`. Confirm: square 4×4 board, faint checker on alternating cells, 8 tiles at balanced squares with 8 empties, tiles on dark squares visibly bolder/more opaque than on light. Resize to mobile → static 2-col grid, no board. No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/about/interest-board.tsx src/app/about/page.tsx
git commit -m "About: static interest board (4x4, checker, parity tiles)"
```

---

### Task 2: Self-play motion + stall + reduced motion

Add the move loop (Motion `layout` FLIP), hover/focus stall, and reduced-motion gating.

**Files:**
- Modify: `src/components/about/interest-board.tsx`

**Interfaces:**
- Consumes: `COLS`, `ROWS`, `INITIAL`, `cellRC`, `parity`, `Tile` from Task 1.
- Produces (internal): `positions` state, `paused` state, `makeMove()`.

- [ ] **Step 1: Make tiles `motion.div` with `layout`, add state + imports**

Add `import { useEffect, useState } from "react";` and `import { motion, useReducedMotion } from "motion/react";`. In `InterestBoard`, replace `const positions = INITIAL;` with:

```tsx
const reduce = useReducedMotion() ?? false;
const [positions, setPositions] = useState<number[]>(INITIAL);
const [paused, setPaused] = useState(false);
```

Wrap each board tile's placement div as a `motion.div` with `layout` and the FLIP transition (mobile grid tiles stay plain):

```tsx
<motion.div
  key={interest.slug}
  layout
  transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
  style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
>
  <Tile interest={interest} dark={parity(cell) === 1} />
</motion.div>
```

- [ ] **Step 2: Add `makeMove` and the loop effect**

Above the return:

```tsx
function makeMove(pos: number[]): number[] {
  const occupied = new Set(pos);
  const empties = Array.from({ length: COLS * ROWS }, (_, i) => i).filter(
    (i) => !occupied.has(i),
  );
  for (let tries = 0; tries < 8; tries++) {
    const target = empties[Math.floor(Math.random() * empties.length)];
    const { r: tr, c: tc } = cellRC(target);
    const movers = pos
      .map((cell, idx) => ({ idx, cell }))
      .filter(({ cell }) => {
        const { r, c } = cellRC(cell);
        const dr = Math.abs(r - tr);
        const dc = Math.abs(c - tc);
        const rook = dr + dc === 1;
        const knight = (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
        return rook || knight;
      });
    if (!movers.length) continue;
    // Prefer rook steps; take a knight ~20% of the time when available.
    const knights = movers.filter(({ cell }) => {
      const { r, c } = cellRC(cell);
      return Math.abs(r - tr) + Math.abs(c - tc) > 1;
    });
    const rooks = movers.filter((m) => !knights.includes(m));
    const pool = knights.length && Math.random() < 0.2 ? knights : rooks.length ? rooks : movers;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const next = pos.slice();
    next[pick.idx] = target;
    return next;
  }
  return pos;
}

useEffect(() => {
  if (reduce || paused) return;
  const id = setInterval(() => setPositions((p) => makeMove(p)), 2000);
  return () => clearInterval(id);
}, [reduce, paused]);
```

- [ ] **Step 3: Wire stall handlers on the board container**

On the board's outer `div` (the `role="group"` one) add:

```tsx
onPointerEnter={() => setPaused(true)}
onPointerLeave={() => setPaused(false)}
onFocusCapture={() => setPaused(true)}
onBlurCapture={(e) => {
  if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
}}
```

- [ ] **Step 4: Lint + build clean**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Verify motion (browser)**

`/about` at desktop width (tall-viewport technique): pieces slide between open squares every ~2s, smooth (transform-only). Hover anywhere on the board → all motion stalls; move pointer away → resumes. A tile that lands on a dark square firms up (bolder/opaque); light square softens. Tab to a linked tile → board stalls, tile navigates. Emulate reduced motion → static board, no moves. Mobile → static grid.

- [ ] **Step 6: Screenshot + commit**

Capture a board frame for the owner, then:

```bash
git add src/components/about/interest-board.tsx
git commit -m "About interest board: self-play move loop + hover stall + reduced-motion"
```

---

## Self-Review

- **Spec coverage:** board+checker+geometry (T1), parity contrast tiles (T1), mobile fallback (T1), page wiring (T1), move loop + knight/rook (T2), Motion layout FLIP (T2), stall (T2), reduced motion (T2), a11y fixed DOM order + group label (T1/T2), content untouched (T1). All mapped.
- **Placeholder scan:** all steps carry real code.
- **Type consistency:** `Interest` from `@/content/about`; `COLS/ROWS/INITIAL/cellRC/parity/Tile` defined T1, consumed T2; `positions`/`paused`/`makeMove` consistent.
- **Risk flagged:** checker-layer vs gapped tile-layer alignment — tune `gap`/tint live in T1 Step 5. Motion `layout` on grid-placed items animates position changes via transform (known-good); verify smoothness in T2 Step 5.
