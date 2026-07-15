# About "Beyond the work" → self-playing interest board — design spec

**Date:** 2026-07-14
**Scope:** Replace the static 8-tile interests grid on `/about` ("Beyond the
work" section) with a faint 4×4 board whose tiles are pieces: left alone it plays
itself (a piece slides to an open square every ~2s); hovering/focusing the board
stalls it. Reskin/presentation only — content (`src/content/about.ts`) is
untouched; all facts stay real.

## Motivation

Vaibhav's own About copy frames his hobbies as "games that keep score but hide a
lot of judgment underneath." A game-board motif for the interests is his metaphor,
not a graft. The home page already has one signature interactive moment (the
sliding interest carousel); this gives the About page its own, in the same calm
"alive objects on a calm canvas" spirit.

## Decisions (locked with owner)

- **Abstract board, cards ARE the pieces** — keep the 8 interest tiles; no literal
  chess set.
- **4×4 square board** = 16 cells, 8 tiles + 8 empty. Square arrangement, square
  cells. Board capped so it stays tidy on the wide column.
- **Faint checker tint** — alternating cells get a barely-there cool tint (~4–6%),
  so "board" reads without a loud Staunton board.
- **Contrast by square parity** — a tile on a DARK square gets bolder + more opaque
  text and slightly more opaque frosting; on a LIGHT square it's lighter/airier.
  Restyles as pieces land on new squares.
- **Playful / game-in-progress** cadence (~1.8–2.2s per move), but **hover/focus
  stalls** the whole board.
- Reduced-motion and touch/mobile → static, scannable grid (no autoplay).

## Component structure

- **New:** `src/components/about/interest-board.tsx` (`"use client"`), exporting
  `InterestBoard({ interests }: { interests: Interest[] })` where `Interest` is the
  type from `@/content/about`. Owns: cell grid, tile→cell positions, the move loop,
  hover/focus stall, reduced-motion gate. Renders a shared `Tile` for both the
  board (sm+) and the mobile fallback grid.
- **Modify:** `src/app/about/page.tsx` — replace the `RevealStagger` interests grid
  + local `InterestTile` with `<Reveal><InterestBoard interests={interests} /></Reveal>`.
  Keep the "Beyond the work / What I get up to otherwise." heading. Delete the local
  `InterestTile` (its styling moves into the board's `Tile`). `ArrowUpRight` import
  moves with it.
- **No CSS/token changes required** — inline styles + Tailwind utilities. `about.ts`
  untouched.

### Data / geometry

- `COLS = 4`, `ROWS = 4`. A cell is `{ r, c }` (0-indexed). `parity(cell) = (r + c) % 2`;
  parity `1` = **dark** square.
- `INITIAL: number[]` — a fixed, visually-balanced starting placement mapping each
  of the 8 interests (by index) to a cell index `r*COLS + c`, spread across the
  board (not clustered), leaving 8 empties. Example set (tune in browser):
  `[0, 2, 5, 7, 8, 10, 13, 15]`.
- State: `positions: number[]` (interest index → current cell index). Derive empties
  as the 8 cell indices not in `positions`.

## Layout

- **Board (≥ sm):** `div` centered, `mx-auto w-full max-w-[680px] aspect-square`,
  `relative`.
  - **Checker layer** (behind): absolute `inset-0`, `grid grid-cols-4 grid-rows-4`,
    16 divs; dark cells get `background: rgba(27,39,53,0.05)` (tune 4–6%), light
    cells transparent. `rounded-2xl overflow-hidden` on the board so the checker
    reads as one board. Pointer-events none, `aria-hidden`.
  - **Tile layer:** `grid grid-cols-4 grid-rows-4 gap-2` (tune) filling `inset-0`;
    each tile placed via `style={{ gridColumnStart: c+1, gridRowStart: r+1 }}`.
    (Verify checker cells sit under tiles; adjust gap/insets live.)
- **Mobile (< sm):** `grid grid-cols-2 gap-4` static list of the same 8 tiles, no
  checker, no motion (a 4×4 board with ~80px cells is unreadable on phones).
  Board container is `hidden sm:block`; mobile grid is `sm:hidden`.

### Tile (shared)

Frosted card, same family as today. Given `interest` + `dark: boolean`:
- Container: `frost rounded-xl border p-4 sm:p-5 flex h-full flex-col justify-between
  transition-[background-color,border-color,color] duration-500`.
- **Dark square:** `bg-bg-2` (0.82), `border-border-strong`; label
  `text-text-mid font-medium`; blurb `text-text-mid font-medium`.
- **Light square:** `bg-bg-1/70` (lighter), `border-border`; label `text-text-lo`;
  blurb `text-text-mid/85 font-normal`.
- Header row: mono uppercase label + `ArrowUpRight` (only when `interest.href`,
  `text-text-lo group-hover:text-accent`).
- Blurb: `mt-4 text-small leading-relaxed`.
- **Linked tiles** (`interest.href`) render as `<Link href>` with `group` and, only
  when the board is stalled/`pointer:fine`, the existing hover lift
  (`hover:-translate-y-0.5`); inline tiles render as a non-interactive `div` (as
  today — no affordance implying a link that isn't there). On mobile always pass
  `dark=false` (no board → no parity).

## Motion / interaction

- Built on **Motion `layout`**: each board tile is a `motion.div` with `layout`.
  Changing its `gridColumnStart`/`gridRowStart` makes Motion FLIP-animate the move
  with **transform only** (performance law). `transition={{ layout: { duration: 0.5,
  ease: [0.22, 1, 0.36, 1] } }}`.
- **Move loop** (board, not reduced, not paused): `setInterval` ~2000ms (add per-
  tick jitter by varying via a counter, since `Math.random` is fine at runtime in
  the browser). Each tick `makeMove(positions)`:
  1. `empties` = cells not occupied.
  2. Pick a random empty target cell.
  3. Candidate movers = occupied tiles whose cell is a legal step to the target:
     **rook step** (Manhattan distance 1) or **knight** (offset {2,1}/{1,2}).
     Prefer rook steps; ~20% of the time choose a knight candidate if any exist.
  4. If candidates exist, set that tile's position to the target; else retry a few
     times, else skip this tick.
- **Stall:** `onPointerEnter`/`onFocusCapture` → `paused = true`; `onPointerLeave`/
  `onBlurCapture` (when focus fully leaves) → `paused = false`. Loop effect depends
  on `[paused, reduce]` and clears its interval when paused. Stalled = stationary →
  linked tiles are easy to click.
- **Reduced motion (`useReducedMotion()`):** no interval; tiles render at their
  `INITIAL` cells; `layout` still on but nothing changes position. Parity styling
  still applies. Full content, instantly.

## Accessibility

- Tiles render in **fixed DOM order** (interest order); only their *visual* grid
  position animates, so tab order and screen-reader order stay stable and sensible.
- Board container: `role="group"` + `aria-label="Interests"`. The shuffle is
  decorative; checker layer `aria-hidden`.
- Focusing any linked tile stalls the board (focus-within), so keyboard users don't
  chase a moving target.
- Linked tiles keep an accessible name (the label). Icons `aria-hidden`.

## Content honesty

No content change. Every label/blurb is Vaibhav's real, confirmed copy from
`about.ts` (chess ~1300, debate #19 / #3 Berkeley, poker top-30, etc.).

## Out of scope

- No change to `about.ts`, the narrative, or the interest subpages.
- No new interests; no live data.
- The home carousel is untouched (the two surfaces stay deliberately different —
  teaser carousel vs. full board).

## Testing / verification

- `npm run lint` + `npm run build` clean.
- Browser (desktop viewport, tall-viewport technique to defeat preview scroll-
  freeze): board renders as a square 4×4 with faint checker; pieces slide between
  open squares every ~2s (transform-only, smooth); hover/focus stalls and resumes on
  leave; tiles on dark squares read bolder/more opaque; linked tiles navigate when
  stalled. Emulate reduced motion → static board. Mobile width → static 2-col grid,
  no motion.
