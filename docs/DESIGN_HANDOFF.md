# Design Handoff — vaibhavwudaru.com

**Status:** Complete audit of the *current* build (Phases 1–5), written as a design/engineering handoff. This is the exhaustive source of truth for a redesign: every token, style, component, interaction, motion spec, page layout, content rule, and the substance that must survive a reskin.

**Why this doc exists:** the current look reads too dark / black / drab. We're taking the visual layer back to the drawing board. This document exists so that redesign changes the **skin** (palette, surface treatment, imagery, density) without losing the **bones** (information architecture, interaction design, content substance, the voice, the one signature moment). Section 20 is the redesign brief; everything before it is the current reality, described precisely enough to rebuild or reskin from.

**How to read it:**
- Sections 1–2 — what the site *is* and how it's wired.
- Sections 3–6 — the design system (tokens + motion).
- Sections 7–9 — every component, including the interactive ones.
- Sections 10–11 — page-by-page specs and the content model.
- Sections 12–17 — responsive, a11y, states, edge cases, constraints, SEO.
- Sections 18–20 — live-data roadmap, open decisions, and the redesign brief.

Notation: values are given as both the **token** and the **raw value** so the doc survives a token rename. `bg-1` means the Tailwind utility; `--bg-1` means the CSS variable; both resolve to the same hex.

---

## 1. Product substance (what must survive a reskin)

### 1.1 What the site is

A personal site doing three equally-weighted jobs:

1. **Impress recruiters** (quant, SWE, ML) — credible, fast, real work shown with substance.
2. **Show projects + demos** — a living portfolio with real repos, write-ups, recorded demos (demos are placeholders until recorded).
3. **Personal expression** — the interests, the taste, the person behind the resume.

### 1.2 The through-line (shapes all copy)

**Vaibhav builds from noticed problems.** Every serious project started as something he observed and wanted to fix. This is never stated as a slogan — it shows through the project "why" statements and the About voice. On `/about` it is pulled out once as a serif aside: *"Almost everything I've built started as something I noticed and couldn't leave alone."*

This is load-bearing. A redesign may change how it looks but must keep the "why"-first framing of projects and the noticed-problems logic of the copy.

### 1.3 Who it's for / who it's by

Vaibhav Wudaru — Georgia Tech CS (4.0, Math minor, grad May 2028). Works across software engineering, ML research, and quant finance. Founding engineer (OddsAreOn), SWE intern (DataMorph), researcher (Trustworthy Robotics; incoming EPIC), incoming quant (GTSF). Outside code: cooking → garden → beekeeping → pollinator advocacy, debate (#19 nationally, #3 Berkeley), poker, chess (~1300), basketball, fantasy football, piano, film. Based between the Bay Area and Atlanta.

### 1.4 Voice calibration (per surface)

| Surface | Register |
|---|---|
| **Home** | Tasteful, mostly sharp. Small personal breadcrumbs allowed. |
| **Work / Experience / Projects** | Sharp, plain, professional. Real metrics, no fluff. |
| **About / interests** | Full personality — warm, specific, lightly winking. First person. This is where the person shows. |

Humanizer discipline everywhere: no AI-isms, no significance inflation, no rule-of-three padding, varied sentence rhythm, opinions, active voice, sentence case. Copy is design material; empty states are invitations, not apologies.

### 1.5 Hard constraints (never violate — see §16 for the full log)

- **No downloadable resume** anywhere (nav, footer, any page).
- **Conversion is GitHub + LinkedIn only.** No contact form, no email requirement.
- **The `boxit` repo is PRIVATE** — never exposed. BoxIt appears only as a "coming soon" card linking to `boxit.best`.
- **Never fabricate.** No invented metrics, motivations, or facts. Unknowns are `TODO(vaibhav)` and are omitted from render, never guessed.
- **Honesty on contributions** — e.g. FirstWave: frontend lead, not ML pipeline author. Forks flagged.

### 1.6 Information architecture

```
/                    Home — scrolling narrative
/projects            Full filterable project grid
/projects/[slug]     Project detail (full story + "why" + demo)   [SSG, 10 pages]
/about               Expansive personal page (personality lives here)
/about/movies        Interest subpage — Letterboxd-driven (Phase 6 data)
/about/chess         Interest subpage — Chess.com-driven (Phase 6 data)
/about/cooking       Interest subpage — recipe photo gallery (Phase 6 data)
/now                 Current focus (the "now page" convention) — stub, Phase 6
```

Global chrome (nav + footer) wraps every route from the root layout. Interest split: **movies, chess, cooking** get full subpages (each earns one via live data or a real gallery); **debate, poker, basketball, fantasy football, piano** are inline tiles on `/about` (represented, never padded into thin pages).

---

## 2. Tech stack & architecture

### 2.1 Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.10** (App Router, Turbopack) | Docs live in `node_modules/next/dist/docs/`. This build has breaking changes vs. older Next — verify APIs there before coding. |
| UI runtime | **React 19.2.4** | Async `params: Promise<{slug}>`, `generateStaticParams`, `generateMetadata`. |
| Language | **TypeScript** (strict) | `tsc --noEmit` is part of the gate. |
| Styling | **Tailwind CSS v4** | CSS-based config via `@theme inline` in `globals.css`. **No `tailwind.config.js`.** |
| Motion | **motion@12** (`motion/react`) | The library formerly called Framer Motion. `motion.*`, `AnimatePresence`, `useReducedMotion`, `layout`. |
| Smooth scroll | **lenis@1.3** | Global inertia scroll, gated off under reduced motion. |
| Icons | **lucide-react** | Brand icons (GitHub/LinkedIn) were dropped from this build → inlined in `src/components/icons.tsx`. Confirmed-present icons: `ArrowLeft`, `ArrowRight`, `ArrowUpRight`, `Lock`, `ExternalLink`, `Play`, `SlidersHorizontal`. |
| Fonts | `next/font/google` | Fraunces, Inter, IBM Plex Mono — self-hosted, `display: swap`. |
| Utility | `clsx` + `tailwind-merge` → `cn()` | shadcn-style class merge. |
| Analytics | `@vercel/analytics` | Light touch. |
| Deploy | Vercel | Secrets in env vars; `.env.example` committed. |

### 2.2 File structure (relevant paths)

```
src/
  app/
    layout.tsx                     Root layout: fonts, SmoothScroll, SiteNav, SiteFooter, skip link, metadata
    globals.css                    Tokens (@theme inline), base layer, reduced-motion backstop
    page.tsx                       Home composition
    projects/page.tsx              Projects grid page (server) → <ProjectsGrid>
    projects/[slug]/page.tsx       Project detail (SSG)
    about/page.tsx                 About narrative + interests
    about/movies/page.tsx          Interest subpage shell
    about/chess/page.tsx           Interest subpage shell
    about/cooking/page.tsx         Interest subpage shell
    now/page.tsx                   Now (PageStub)
  components/
    site-nav.tsx                   Fixed nav, scroll-state blur      [client]
    site-footer.tsx                Footer, conversion links          [server]
    icons.tsx                      Inline GitHub/LinkedIn SVG
    reveal.tsx                     Reveal / RevealStagger / RevealItem [client]
    section-heading.tsx            Shared section header
    tag-pill.tsx                   TypePill / DomainPill
    project-card.tsx               Project card (teaser + grid)
    page-stub.tsx                  Placeholder for unbuilt routes
    home/
      hero.tsx                     Hero + word-cycle + <LiquidityField> [client]
      liquidity-field.tsx          THE signature moment (canvas)      [client]
      selected-work.tsx            Featured projects teaser
      experience-strip.tsx         Experience rows
      beyond-code.tsx              Interests teaser tiles
    about/
      interest-subpage.tsx         Shared subpage shell + ComingLive
    providers/
      smooth-scroll.tsx            Lenis provider                    [client]
  content/
    schema.ts                      Project + Experience types, tag vocab
    site.ts                        Hero copy, social links, nav links
    projects.ts                    Project inventory (10)
    experience.ts                  Experience inventory (5)
    about.ts                       About draft copy + interests
  lib/
    fonts.ts                       next/font setup
    motion.ts                      Motion variants (reveal, stagger, cardHover, staticVisible)
    utils.ts                       cn()
docs/
  PRD.md                           Product spec (what)
  IMPLEMENTATION_PLAN.md           Phased plan + decisions log
  DESIGN_HANDOFF.md                This file
STYLE.md                           Design system spec (how it looks/moves)
```

### 2.3 Rendering model

- All pages are **static** (`○`) except `/projects/[slug]` which is **SSG** (`●`, 10 prerendered paths via `generateStaticParams`).
- The only client components are the ones that need interactivity/motion: `SiteNav`, `SmoothScroll`, `Reveal*`, `Hero`, `LiquidityField`, `ProjectsGrid`. Everything else is a server component.
- `LiquidityField` is imported with `dynamic(() => …, { ssr: false })` inside `Hero`, so it's a client-only lazy chunk that never gates hero-text LCP.

---

## 3. Design tokens — Color

All color is defined once in `src/app/globals.css` under `:root`, then mapped into Tailwind via `@theme inline`. `color-scheme: dark` is set on `:root`.

### 3.1 Full color table

| Token (CSS var) | Tailwind utility root | Hex | Usage |
|---|---|---|---|
| `--bg-0` | `bg-bg-0` | `#0a0b0d` | Page base. Body background. Nav blur tint when scrolled. |
| `--bg-1` | `bg-bg-1` | `#101216` | Raised surface — cards, metric tiles, inset panels. |
| `--bg-2` | `bg-bg-2` | `#16191f` | Higher surface — hovered cards, pill fills, lock badge. |
| `--bg-3` | `bg-bg-3` | `#1e222a` | Borders-as-fills, deepest inset panels. (Defined, lightly used.) |
| `--text-hi` | `text-text-hi` | `#ececec` | Primary headings + high-emphasis body. |
| `--text-mid` | `text-text-mid` | `#a8adb5` | Secondary text, body copy, descriptions. |
| `--text-lo` | `text-text-lo` | `#6b7079` | Muted — captions, metadata, mono labels, eyebrows. |
| `--border` | `border-border` | `#1f242c` | Hairline borders (default). |
| `--border-strong` | `border-border-strong` | `#2a313b` | Emphasized/hover borders. |
| `--accent` | `text-accent` / `bg-accent` | `#c8b6ff` | The ONE accent — soft violet. Links-on-hover, focus ring, active filter, incoming badge, signature-moment asks. **LOCKED** (owner sign-off 2026-07). |
| `--accent-muted` | `bg-accent-muted` | `color-mix(in oklab, var(--accent) 18%, transparent)` | Accent at ~18% — active chip fills, incoming badge bg, CTA button bg. |
| `--data-pos` | `text-data-pos` | `#5fcf9e` | "Up / positive" market tick — metric values, shipped-status dot, current badge, the bid side of the signature field. Quant/data contexts only. |
| `--data-neg` | `text-data-neg` | `#d9736b` | "Down / negative" tick. Defined; not yet used in UI. |

### 3.2 Type-tag colors (color-code visuals off the ONE type tag; max 5)

| Token | Hex | Tag | Notes |
|---|---|---|---|
| `--tag-internship` | `#9fb4ff` | Internship | Periwinkle. |
| `--tag-founding` | `#e8b04b` | Founding | Amber. |
| `--tag-research` | `#7dd3c0` | Research | Teal. |
| `--tag-personal` | `#c8b6ff` | Personal | Violet — intentionally the accent family. |
| `--tag-hackathon` | `#d9a0c8` | Hackathon | Muted magenta. |

### 3.3 Opacity-modifier conventions (how the palette is actually applied)

The palette is small; depth comes from **alpha modifiers** on a few base colors. Consistent patterns:

- **Type pills:** `text-tag-X border-tag-X/35 bg-tag-X/10` (full-strength text, 35% border, 10% fill).
- **Active type filter chip (grid):** `border-tag-X/50 bg-tag-X/12 text-tag-X`.
- **Domain pills:** `border-border bg-bg-2/60 text-text-lo` (neutral, no color).
- **Incoming badge:** `border-accent/35 bg-accent-muted text-accent`.
- **Current badge:** `border-data-pos/35 bg-data-pos/10 text-data-pos`.
- **Draft flag text:** `text-text-lo/70`.
- **Accent hairlines:** `/40`–`/50` borders (e.g. `border-accent/50` on the About pull-quote and CTA).

### 3.4 Accent swap mechanism

The accent is a **single-line change**: swap `--accent` in `globals.css` and rebuild; `--accent-muted` derives from it via `color-mix`, and every accent usage updates. Documented alternates (kept on file): `#7dd3c0` muted teal · `#e8b04b` warm amber · `#9fb4ff` periwinkle. **Note for the redesign:** because `Personal` tag == accent, changing the accent shifts the Personal tag color too unless decoupled.

### 3.5 Color rules

- One accent. A second color only appears as a **data tick** (`--data-pos`/`--data-neg`) in quant/live-data contexts.
- Text must pass **AA on `--bg-0`** — verify `--text-lo` (`#6b7079` on `#0a0b0d`) especially; it's the riskiest pairing and is used only for non-essential metadata.
- **No decorative gradients.** The only gradient in the build is inside the signature canvas (radial glow sprites + a faint mid-seam linear gradient), which is allowed as "depth behind the signature."

---

## 4. Design tokens — Typography

### 4.1 Font families

| Role | Family | CSS var | Tailwind | Config |
|---|---|---|---|---|
| Display / headline | **Fraunces** (variable serif) | `--font-fraunces` | `font-serif` | `axes: ["opsz","SOFT"]`, no weight pin (full variable range + optical sizing loads). |
| Body / UI | **Inter** | `--font-inter` | `font-sans` | Default body. |
| Utility / data | **IBM Plex Mono** | `--font-plex-mono` | `font-mono` | `weight: ["400","500"]`. Metrics, tags, labels, eyebrows, "terminal" flourishes. Used sparingly. |

All three are wired via `next/font/google` in `src/lib/fonts.ts`, concatenated into `fontVariables`, applied to `<html>`. `display: "swap"`. Fallbacks in `globals.css` base layer: serif → Georgia; sans → `ui-sans-serif, system-ui`.

**Documented alternate (not wired):** Pairing D swaps the display face to Playfair Display for more fashion-editorial drama — a one-import change in `fonts.ts`.

### 4.2 Fluid type scale

Defined as CSS vars in `globals.css`, mapped to Tailwind `text-*` via `@theme inline`.

| Token | Tailwind | Value | Usage | Leading / tracking |
|---|---|---|---|---|
| `--fs-hero` | `text-hero` | `clamp(2.75rem, 7vw, 6rem)` | Hero headline (serif). | tight (~1.05), `-0.02em` |
| `--fs-h1` | `text-h1` | `clamp(2rem, 4vw, 3.25rem)` | Page titles (About, Projects, detail). | `1.05`, `-0.02em` |
| `--fs-h2` | `text-h2` | `clamp(1.5rem, 2.5vw, 2.25rem)` | Section titles. | `1.05`, `-0.02em` |
| `--fs-h3` | `text-h3` | `1.25rem` | Card titles, experience org, pull-quote, lead. | `1.05` for headings; relaxed for prose. |
| `--fs-body` | `text-body` | `1.0625rem` (~17px) | Body copy. | `1.6` |
| `--fs-small` | `text-small` | `0.875rem` | Secondary/small copy, nav links, card blurbs. | `1.6`/relaxed |
| `--fs-mono` | `text-mono` | `0.8125rem` | Mono labels, tags, metrics, eyebrows. | — |

Sub-token sizes used inline (not in the scale): pill text `text-[0.68rem]`, draft flag `text-[0.62rem]`, stack chips `text-[0.72rem]`, filter chips `text-[0.7rem]`.

Base layer (`globals.css`): `h1,h2,h3 { font-family: serif; line-height: 1.05; letter-spacing: -0.02em; }`. Body: `line-height: 1.6`, `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`.

### 4.3 Typography rules

- **Two serif weights max** — don't ladder every weight. Italic Fraunces is used for the "why" statements and the About pull-quote.
- **Sentence case everywhere.** ALL CAPS only on tiny mono labels (`uppercase tracking-widest`).
- **Measure capped** at `~68ch` via the `.measure` utility (`max-width: 68ch`) — body copy never runs full width.
- Headlines get slight negative tracking; body gets generous leading.
- Mono is a flavor, not a workhorse — eyebrows, tags, metrics, timeframes, status labels. Everything narrative is Inter or Fraunces.

---

## 5. Design tokens — Spacing, radius, layout

### 5.1 Spacing scale

Baseline rem scale (from STYLE.md): `0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 / 8`. In practice Tailwind's default spacing is used; the rhythm choices that matter:

- **Section gutter:** `px-6` (1.5rem) on every page container.
- **Home "scene" vertical rhythm:** `py-24 sm:py-32` (6rem → 8rem) between home sections, so each reveal breathes.
- **Page top offset:** `pt-32` (8rem) on inner pages (clears the fixed nav + gives editorial air), `pb-28` (7rem) bottom.
- **Hero:** `min-h-[88svh]`, `pt-28 pb-20`.
- **Card padding:** `p-5` (tiles) / `p-6` (project cards).
- **Between stacked prose blocks:** `space-y-8` (About). **Between metric tiles:** `gap-4`. **Between grid cards:** `gap-5`.

### 5.2 Container widths

| Width | Tailwind | Used on |
|---|---|---|
| ~1152px | `max-w-6xl` | Nav, footer, home sections, `/projects`. The site's primary column. |
| ~896px | `max-w-4xl` | `/about` (long-form), `PageStub`. |
| ~768px | `max-w-3xl` | `/projects/[slug]`, interest subpages (reading width). |
| ~672px | `max-w-2xl` | About header block. |
| ~68ch | `.measure` | Any paragraph of body copy. |

All centered with `mx-auto w-full` and gutter `px-6`.

### 5.3 Radius, borders, z-index

| Concern | Value | Notes |
|---|---|---|
| Card radius | `rounded-xl` = `0.75rem` (12px) | Cards, tiles, metric boxes, panels, demo/tease slots. |
| Pill radius | `rounded-full` | Tag pills, filter chips, badges, lock badge (`size-12` circle). |
| Focus radius | `3px` | On the global focus ring. |
| Card border | `1px` hairline `--border` → `--border-strong` on hover | Never heavy shadow. |
| Accent border | `border-l-2 border-accent/50` | About pull-quote left rule. |
| Dashed border | `border-dashed border-border` | Empty/placeholder states (demo slot, ComingLive, empty grid). |
| `z-40` | Fixed nav |
| `z-10` | Hero text (above the signature canvas) |
| `z-50` | Skip-to-content link (on focus) |
| auto/0 | Signature canvas (`absolute inset-0`, behind hero text) |

### 5.4 Layout principles (load-bearing for the editorial feel)

- **Generous negative space** is the editorial signal — regions are deliberately not filled.
- **Asymmetry** over centered grids — offset headers (`max-w-2xl` header inside a `max-w-4xl` page), ragged reveal timing.
- **Cards** are `--bg-1` fill + hairline border + 12px radius; hover raises to `--bg-2` with a `-translate-y-1` transform, never a drop shadow.
- Grids: `sm:grid-cols-2` for teasers, `sm:grid-cols-2 lg:grid-cols-3` for the projects grid and interests grid.

---

## 6. Motion system

### 6.1 Stack & the performance law

- **Motion (motion@12)** — 90% of motion: enter/exit, scroll reveals, hover/tap, layout animations. Always gated with `useReducedMotion()`.
- **Lenis** — global smooth/inertia scroll ("the expensive feel"), disabled entirely under reduced motion.
- **GSAP + ScrollTrigger** — reserved for a scroll-driven signature only; **not currently used** (the signature is canvas/cursor-driven, not scroll-driven).

**Performance law (non-negotiable):** animate only `transform` and `opacity` (GPU compositor). Never animate `width/height/top/left/margin/padding`. Every animation in the build obeys this — the reveal moves `y` (transform) + `opacity`; cards use `translate-y`; the canvas paints to its own buffer.

### 6.2 Motion vocabulary (defined in `src/lib/motion.ts`)

| Name | Spec | Where |
|---|---|---|
| `reveal` | `hidden: {opacity:0, y:16}` → `visible: {opacity:1, y:0}`, `duration 0.5s`, `ease [0.22, 1, 0.36, 1]` | All scroll reveals (`Reveal`, `RevealItem`). |
| `staggerContainer` | `staggerChildren: 0.07`, `delayChildren: 0.05` | `RevealStagger` (grids/rows). |
| `cardHover` | `scale: 1.015`, `duration 0.15s`, `ease easeOut` | Available as a `whileHover` target (cards mostly use CSS hover instead — see §8.4). |
| `staticVisible` | `hidden` and `visible` both `{opacity:1, y:0}` | Swapped in under reduced motion. |

Additional inline motion specs:
- **Hero entrance:** eyebrow `y:12→0`; h1 & subline `y:16→0`; `duration 0.5–0.6s`, `ease [0.22,1,0.36,1]`, staggered by small `delay` (0.06 / 0.14).
- **Word-cycle sub-line:** the final word cycles every **2400ms**; each swap is a masked vertical slide — incoming `y:"0.9em"→0`, outgoing `y:"-0.9em"`, `opacity` cross-fade, `duration 0.42s`, `ease [0.22,1,0.36,1]`, `AnimatePresence mode="wait"`. Under reduced motion the cycle stops and the first role renders static.
- **Projects grid reflow:** `motion.div layout` + `AnimatePresence mode="popLayout"`; item enter `{opacity:0, scale:0.98}` → `{opacity:1, scale:1}`, exit reverse, `duration 0.24s ease-out`. `initial={false}` so first paint is instant. Under reduced motion `layout` is off and the transition collapses to `0`.
- **Card hover (CSS, not Motion):** `transition duration-200 ease-out`, `hover:-translate-y-1`, plus border/bg shift. `motion-reduce:transition-none motion-reduce:hover:translate-y-0`.
- **Icon nudges:** arrows translate `0.5px` on group hover, `motion-reduce` disables.
- **Nav backdrop:** `transition-colors duration-300` between transparent and `bg-bg-0/70 backdrop-blur-md`.

### 6.3 Reduced-motion contract

Three layers, all present:
1. **JS:** every animated component reads `useReducedMotion()` and swaps to a static end-state (`staticVisible`, `initial={false}`, `layout={!reduce}`).
2. **Tailwind:** `motion-reduce:*` utilities kill hover transforms/transitions on cards and icons.
3. **CSS backstop** (`globals.css`): a `@media (prefers-reduced-motion: reduce)` block forces `animation-duration`/`transition-duration` to `0.001ms` and disables smooth scroll globally — so anything animated purely in CSS also collapses.

The signature moment renders a **single static frame** under reduced motion (no rAF, no listeners). Nothing essential is ever gated on motion.

### 6.4 Known preview-pane caveat (dev note, not a product bug)

The in-app browser preview pane runs the page as a `document.hidden` document, which (a) freezes `requestAnimationFrame` and Motion's WAAPI mount animations and (b) never delivers `IntersectionObserver` callbacks. Consequences when verifying in that pane only: `whileInView` reveals sit at `opacity:0`, and the canvas loop won't tick. Both behave normally in a real browser. Verify via DOM/pixel inspection or force-opacity, not screenshots alone. (This is why the signature paints one synchronous frame on mount and after every resize — see §9.6.)

---

## 7. Global chrome

### 7.1 Root layout (`app/layout.tsx`)

- `<html lang="en">` carries the three font variables + `h-full`.
- `<body class="min-h-full antialiased">`.
- **Skip link** first in the DOM: `href="#main"`, visually hidden until focused, then `absolute left-4 top-4 z-50 rounded-md bg-bg-2 px-4 py-2 text-text-hi`.
- `<SmoothScroll>` wraps everything; inside it: `<SiteNav />`, then `<div id="main" class="flex min-h-dvh flex-col">` containing `{children}` (flex-1) and `<SiteFooter />`. `<Analytics />` last.
- **Metadata:** `metadataBase` from `NEXT_PUBLIC_SITE_URL` (default `https://vaibhavwudaru.com`); title template `"%s · Vaibhav Wudaru"`, default `"Vaibhav Wudaru"`; description "Georgia Tech CS student building from noticed problems — software, machine learning, and quant."; OpenGraph + Twitter `summary_large_image`.

### 7.2 SmoothScroll (`components/providers/smooth-scroll.tsx`) — client

Instantiates Lenis on mount **unless reduced motion**: `{ duration: 1.1, easing: t => Math.min(1, 1.001 - 2**(-10*t)), smoothWheel: true }`, driven by a `requestAnimationFrame` loop, torn down on unmount. Under reduced motion it returns children untouched (native instant scroll). Renders a passthrough fragment.

### 7.3 SiteNav (`components/site-nav.tsx`) — client

Fixed top bar, `z-40`, full-width, inner `max-w-6xl`, height `h-16`, gutter `px-6`.

| State | Trigger | Appearance |
|---|---|---|
| **Top** | `window.scrollY <= 8` | `bg-transparent`, `border-b border-transparent`. Sits over the hero. |
| **Scrolled** | `scrollY > 8` | `bg-bg-0/70 backdrop-blur-md`, `border-b border-border`. |

Transition: `transition-colors duration-300` (backdrop toggled by a boolean, no per-frame layout work). `scroll` listener is `{ passive: true }`, runs once on mount to set initial state, cleaned up on unmount.

Contents: wordmark "Vaibhav Wudaru" (serif, `text-base sm:text-lg`, `hover:text-accent`) linking home; nav list from `navLinks` (`Projects`, `About`, `Now`) as `text-small text-text-mid hover:text-text-hi`; then GitHub icon (always) + LinkedIn icon (only if `hasLinkedin`). Icons `size-[1.15rem]`, `text-text-mid hover:text-text-hi`, `aria-label`ed, open in new tab `rel="noreferrer"`. Gaps: `gap-4 sm:gap-6/7`.

### 7.4 SiteFooter (`components/site-footer.tsx`) — server

`border-t border-border`, inner `max-w-6xl px-6 py-14`, `flex-col sm:flex-row sm:items-end sm:justify-between`.
- Left: wordmark (serif `text-h3`, `hover:text-accent`) + a `text-small text-text-lo` line "Building from noticed problems — software, machine learning, and quant. Between the Bay Area and Atlanta."
- Right: the nav links repeated (`text-small`), then GitHub icon (always) + LinkedIn icon (only if `hasLinkedin`), `size-5`.

Conversion links are the only outward actions in the whole site. **No resume, no email, no form.**

---

## 8. Shared primitives (static + low-level components)

### 8.1 Reveal / RevealStagger / RevealItem (`components/reveal.tsx`) — client

Scroll-reveal wrappers over the motion vocabulary.

- `Reveal` — single element. `variants={reduce ? staticVisible : reveal}`, `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-12% 0px" }}`. Forwards all `motion.div` props.
- `RevealStagger` — container; `staggerContainer` variants, `viewport margin "-8% 0px"`. Children that are `RevealItem` inherit the visible state.
- `RevealItem` — child; `reveal`/`staticVisible` variants, no own `whileInView` (driven by parent).

**Behavior:** fade + 16px rise, once, when scrolled ~12% into view. Reduced motion → visible immediately. (Preview-pane: see §6.4.)

### 8.2 SectionHeading (`components/section-heading.tsx`) — server

Shared section header: mono uppercase eyebrow (`text-mono tracking-widest text-text-lo`) + serif `text-h2` title + optional inline CTA (`text-small text-text-mid hover:text-accent` with an `ArrowRight` that nudges on hover). Layout `flex flex-wrap items-end justify-between gap-4`. **No numbered eyebrows** (anti-template rule) unless content is genuinely sequential.

### 8.3 TypePill / DomainPill (`components/tag-pill.tsx`) — server

Shared base: `inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider`.
- **TypePill** — colored off the type tag via `typeStyle` map: `text-tag-X border-tag-X/35 bg-tag-X/10` (see §3.2 for the five colors).
- **DomainPill** — neutral: `border-border bg-bg-2/60 text-text-lo`. Always neutral, capped at 3 per card.

These are labels, not buttons — no hover state, no interactivity.

### 8.4 ProjectCard (`components/project-card.tsx`) — server

The reusable card (home teaser + projects grid). Renders a `next/link` to `/projects/[slug]`.

**Structure (top → bottom):**
1. Header row: `TypePill` (left) + right affordance.
   - Default: `ArrowUpRight` icon, `text-text-lo group-hover:text-accent`.
   - **Coming-soon variant** (BoxIt): a `Lock` icon + "Coming soon" mono label instead of the arrow.
2. Title — `font-serif text-h3 text-text-hi`.
3. "Why" — `font-serif text-small italic leading-relaxed text-text-mid line-clamp-4` (the `whyShort`).
4. Footer (pushed down with `mt-auto`): domain pills, plus a **draft flag** on the right (`text-[0.62rem] text-text-lo/70`, `title=` tooltip) when `whyStatus === "draft"`.

**States:**
| State | Trigger | Appearance |
|---|---|---|
| Default | — | `border-border bg-bg-1`, arrow affordance. |
| Hover | pointer | `-translate-y-1`, `border-border-strong`, `bg-bg-2`, arrow → accent. `transition duration-200 ease-out`. |
| Reduced motion | pref | No lift/transition (`motion-reduce:*`). |
| Coming-soon | `status === "coming-soon"` | Lock + "Coming soon" label; still links to detail (which handles the redacted tease). |
| Draft why | `whyStatus === "draft"` | "draft" flag in footer. |

Card fills its grid cell (`h-full flex flex-col`) so ragged copy lengths align.

### 8.5 PageStub (`components/page-stub.tsx`) — server

On-brand placeholder for unbuilt routes: centered `max-w-4xl min-h-dvh`, mono eyebrow + serif `text-h1` title + `.measure` note. Currently used by `/now` only.

### 8.6 InterestSubpage + ComingLive (`components/about/interest-subpage.tsx`) — server

Shared shell for `/about/*` interest pages:
- Back link "All of it" → `/about` (`ArrowLeft`, mono, nudges left on hover).
- Header: eyebrow (`About · X`), serif `text-h1` title, `.measure` intro paragraph.
- `children` wrapped in a `Reveal` at `mt-14`.

`ComingLive` — the honest static state for a module whose live data lands in Phase 6: `rounded-xl border border-dashed border-border bg-bg-1/60 px-6 py-16 text-center`, a `.measure` note in `text-small text-text-mid`. Reads as a deliberate placeholder, never a broken/empty state.

### 8.7 icons (`components/icons.tsx`) — server

`GitHubIcon` and `LinkedInIcon` — inline `viewBox="0 0 24 24"` SVGs, `fill="currentColor"`, `aria-hidden`, spreading `SVGProps` so `className`/`size-*` control sizing. Inlined because this lucide build dropped brand icons.

---

## 9. THE signature moment — Liquidity Field

`src/components/home/liquidity-field.tsx` — client, lazy-loaded behind the hero text. **This is the ONE loud thing.** Everything else stays quiet so this can carry identity alongside the typography.

### 9.1 Concept

A **market-depth chart rendered as living particle liquidity.** Green bids accumulate to the left of a drifting mid-price, violet asks to the right, forming the classic depth *valley* that rises into two walls of liquidity. The book *breathes* as orders arrive; the cursor *parts the liquidity* like a hand through water. It's abstract on purpose — evocative of an order book, never a chart you'd actually read. It marries the two candidate concepts (market-depth field + particle/vector field) into one: quant identity + flowing beauty.

### 9.2 Palette usage (strictly on-token)

- **Bid particles:** `--data-pos` (`#5fcf9e`), read at runtime from the CSS var.
- **Ask particles:** `--accent` (`#c8b6ff`), read at runtime.
- **Mid seam:** a faint vertical line, `rgba(236,236,236,0.5)` fading to transparent (a hint of `--text-hi`).
- No red. Both colors are straight off the palette, so an accent swap re-tints the field automatically.

### 9.3 Simulation model

- **Depth curve:** for a given x, `heightAt(x,t)` = a base rise away from the mid (`maxH * (|x−mid|/halfW)^1.28`) plus a few slow **gaussian "liquidity walls"** (5 bumps, each with position, amplitude, width, speed, phase, its amplitude modulated by a sine) — all multiplied by a slow global breath. The result is a valley at the mid rising into two textured walls.
- **Mid drift:** `midX = width*0.5 + sin(t*0.00018) * width*0.035` — the mid price wanders slightly.
- **Particles:** each has a home x (`hx`, biased toward the edges via `pow(rand,0.7)` so the walls read denser than the valley), a vertical fill ratio `r` (`pow(rand,0.82)`), a size (`7–19px`), and jitter phase/speed. Rendered y = `baseline − r*heightAt(hx)` plus small sinusoidal jitter. Side (bid/ask) is decided by whether `hx` is left/right of `midX`.
- **Cursor repulsion:** particles within `R = 130px` of the pointer are pushed outward by up to `PUSH = 46px`, falloff `((R−d)/R)^2`. Pointer tracked at window level (canvas is `pointer-events:none`); inactive when the pointer leaves the canvas rect.

### 9.4 Rendering pipeline

- **Glow sprites:** two 32×32 offscreen canvases (bid, ask), each a radial gradient from `rgba(color,0.85)` center → transparent, pre-rendered once. Particles are drawn with `drawImage` (cheap), **`source-over`** compositing (preserves hue, no white blow-out), per-particle `globalAlpha` in `~0.1–0.44 × twinkle`.
- **Counts:** desktop `min(1000, round(width*0.72))`; mobile (`width < 640`) `340`. `maxH = height*(mobile ? 0.44 : 0.52)`; `baseline = height*0.9`.
- **DPR:** capped at `2`; canvas backing store scaled, drawing done in CSS px.

### 9.5 Lifecycle & performance

- **Lazy-load:** `dynamic(() => import('./liquidity-field').then(m => m.LiquidityField), { ssr: false })` inside `Hero`. Client-only, separate chunk, never gates hero-text LCP.
- **Fade-in:** canvas starts `opacity:0` with `transition: opacity 1200ms ease-out`; set to `1` after the first painted frame.
- **Pause when unseen:** an `IntersectionObserver` stops the rAF loop when the hero scrolls out; `visibilitychange` stops it when the tab is hidden. The loop is *started* on mount (not gated on IO firing) so it runs even where IO is unreliable.
- **Reduced motion:** renders exactly one static frame at a representative timestamp (`draw(6200)`), attaches no rAF and no pointer listeners; only a `resize` handler that redraws the static frame.
- **Accessibility:** `aria-hidden="true"`, `pointer-events:none` — purely decorative, never blocks selecting or reading the hero text, invisible to screen readers.

### 9.6 Robustness note (a real fix, kept)

`resize()` sets `canvas.width`, which **clears the buffer**, then rebuilds particles — so it now **repaints one frame synchronously** at the end (and one is painted synchronously on mount). Without this, a resize that lands while the loop is paused (offscreen, or a hidden document) leaves the field blank until the next tick. This is a production robustness win, not just a preview-pane workaround.

### 9.7 Integration in Hero

Hero `<section>` is `relative overflow-hidden`; `<LiquidityField />` is the first child (`absolute inset-0`), and the three text blocks each get `relative z-10` so they paint above the canvas. The field occupies the lower portion + right side; the left-aligned headline reads cleanly over the dim, soft particles. Verified legible on desktop and at 375px.

---

## 10. Page specs

### 10.1 Home (`app/page.tsx`)

Composition: `<Hero /> <SelectedWork /> <ExperienceStrip /> <BeyondCode />`. Static content; nav + footer from layout. Scenes separated by `py-24 sm:py-32`.

**Hero (`home/hero.tsx`)** — `min-h-[88svh]`, `max-w-6xl`, `flex-col justify-center`, `pt-28 pb-20`, `relative overflow-hidden`.
- Eyebrow: "Georgia Tech · Computer Science" (mono, `text-text-lo`).
- Headline: `heroHeadline` = "Building the things I imagined as a kid." (serif `text-hero`, `max-w-[15ch]`).
- Sub-line: `heroSublinePrefix` + cycling word. Prefix "Georgia Tech CS student interested in"; roles cycle `software development → machine learning → quantitative finance → research` (accent italic serif). 2400ms cadence, masked slide (§6.2).
- Entrance animation on all three; `LiquidityField` behind.

**SelectedWork (`home/selected-work.tsx`)** — SectionHeading (eyebrow "Selected work", title "Things I built because I noticed something.", CTA → `/projects`) + `RevealStagger` grid `sm:grid-cols-2 gap-5` of the 4 `featuredProjects` as `ProjectCard`s.

**ExperienceStrip (`home/experience-strip.tsx`)** — SectionHeading (eyebrow "Experience", title "Where I've been putting the work.") + `RevealStagger` of rows. Each `Row`: `border-t` divider, `sm:grid-cols-[1fr_1.4fr]`; left = org (serif `text-h3`) + StatusBadge; right = role (`text-small font-medium`) + timeframe (mono, omitted if `TODO`) + one-liner (`.measure text-small`). **StatusBadge:** `incoming` → accent pill; `current` → data-pos pill; `past` → nothing.

**BeyondCode (`home/beyond-code.tsx`)** — SectionHeading (eyebrow "Beyond code", title "The rest of it.", CTA → `/about`) + `RevealStagger` grid `sm:grid-cols-2 lg:grid-cols-4 gap-4` of 4 tiles (Chess → `/about/chess`, Film → `/about/movies`, Kitchen→garden → `/about/cooking`, Debate → `/about`). Tiles are `Link`s: `bg-bg-1` card, mono label + `ArrowUpRight`, `text-small` line, hover raise `-translate-y-1`.

### 10.2 Projects grid (`app/projects/page.tsx` → `components/projects/projects-grid.tsx`)

Server page: `max-w-6xl pt-32 pb-28`, header (eyebrow "Projects", h1 "Things I built from problems I noticed.", `.measure` lead), then `<ProjectsGrid projects={projects} />`.

**ProjectsGrid** — client, the filterable grid.
- **Two filters, AND-combined:** Type (single-select, color-coded) + Domain (single-select, neutral). Each row **only offers tags present in the current inventory** (`TYPE_TAGS.filter(...)`, `DOMAIN_TAGS.filter(...)`), so no dead chips. Selection is local React state (not URL params).
- **Chips:** base `rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider`. Active type chip uses the tag color (`border-tag-X/50 bg-tag-X/12 text-tag-X`); the "All" type chip active uses accent (`border-accent/50 bg-accent-muted text-text-hi`); active domain chip `border-border-strong bg-bg-2 text-text-hi`; idle `border-border text-text-lo hover:border-border-strong hover:text-text-mid`. `aria-pressed` on each.
- **Filter row layout:** `FilterRow` — label (`w-16` mono) + wrapping chips; `flex-col sm:flex-row`.
- **Result count line:** "N projects" + inline "clear filters" button (shown only when a filter is active).
- **Grid:** `motion.div layout` + `AnimatePresence mode="popLayout"`, `sm:grid-cols-2 lg:grid-cols-3 gap-5`; items fade+scale on enter/exit (§6.2), reflow animates via `layout`. Reduced motion → instant.
- **Empty state:** when no project matches, a dashed panel "No projects match that combination yet." + a "Clear filters" button.

### 10.3 Project detail (`app/projects/[slug]/page.tsx`) — SSG

`generateStaticParams` from `projects`; `generateMetadata` (title + oneLiner). `max-w-3xl pt-32 pb-28`. Helper `clean(value)` returns `null` if the value is null **or** starts with `"TODO"` — so TODO fields never render.

**Sections (top → bottom):**
1. Back link "All projects" → `/projects`.
2. **Header (NOT motion-gated — renders immediately, it's above-fold primary content):** TypePill + StatusBadge; serif `text-h1` title; `.measure` oneLiner; meta line = `[role, timeframe, team].filter(Boolean).join("  ·  ")`; then link row — a "Source" pill (only when `clean(repoUrl)`), and for coming-soon a "Visit boxit.best" accent CTA (when `demoUrl`).
3. **Demo / tease slot** (Reveal): `ComingSoonTease` if coming-soon, else `DemoPlaceholder`.
4. **"Why I built it"** (Reveal): mono heading + a **draft flag** when `whyStatus === "draft"`; `whyFull` in `font-serif text-h3 italic`.
5. **Results** (Reveal, only if `metrics.length`): `<dl>` grid `sm:grid-cols-2` of metric tiles — label (mono `text-text-lo`) + value (serif `text-h3 text-data-pos`).
6. **Stack** (Reveal, only if `stack.length`): mono chips.
7. **Footer** (Reveal): domain pills + "Back to all projects".

**StatusBadge:** dot color by status — shipped → `bg-data-pos`, in-progress → `bg-accent`, coming-soon → `bg-text-lo`; label "Shipped/In progress/Coming soon".
**DemoPlaceholder:** `aspect-video` dashed box, `Play` icon + "Demo walkthrough coming soon" (no videos recorded yet).
**ComingSoonTease (BoxIt):** `relative overflow-hidden` panel with a decorative redacted-lines backdrop (6 bars at `opacity 0.06`, widths `[92,78,85,64,88,72]%`), a `Lock` badge, "In private beta", a line "The build is under wraps for now. The live product lives at boxit.best.", and a `boxit.best` link. **Never renders repoUrl.** Nothing here exposes internals.

### 10.4 About (`app/about/page.tsx`)

`max-w-4xl pt-32 pb-28`.
- **Header** (`max-w-2xl`): eyebrow "About", serif `text-h1` "The person behind the resume.", `.measure` lead in `text-h3 text-text-mid` (`aboutLead`).
- **Narrative** (`mt-16 space-y-8`): first paragraph (Reveal), then the **through-line pull-quote** (Reveal): `blockquote border-l-2 border-accent/50 pl-6`, serif `text-h3 italic text-text-hi`; then the remaining paragraphs, each in a Reveal, `.measure text-body text-text-mid`. All prose is DRAFT copy in `src/content/about.ts` for Vaibhav's edit.
- **Interests** (`mt-24`): mono eyebrow "Beyond the work" + serif `text-h2` "What I get up to otherwise." + `RevealStagger` grid `sm:grid-cols-2 lg:grid-cols-3 gap-4` of `InterestTile`s.
- **InterestTile:** mono label + blurb. If `interest.href` → a `Link` with `ArrowUpRight` and hover raise (movies, chess, cooking). If `href === null` → a **static** tile (`bg-bg-1/60`, no arrow, no lift) so there's no affordance implying a link that isn't there (debate, poker, basketball, fantasy football, piano).

### 10.5 Interest subpages (`/about/movies`, `/about/chess`, `/about/cooking`)

Each uses `InterestSubpage` (§8.6) with a voiced eyebrow/title/intro and a `ComingLive` note describing what the live module will show (Letterboxd grid / Chess.com rating+games / recipe photo gallery). These are Phase-5 shells; Phase 6 replaces the `ComingLive` child with the live module + static fallback.

### 10.6 Now (`app/now/page.tsx`)

Currently a `PageStub` (eyebrow "Now", title "What I'm on right now."). Phase 6 turns it into a living snapshot (hand-written current focus + light live data).

---

## 11. Content model & data

### 11.1 Schema (`src/content/schema.ts`)

**Controlled vocabulary (do not expand casually):**
- `TYPE_TAGS` (exactly one per project): `Internship · Founding · Research · Personal · Hackathon`.
- `DOMAIN_TAGS` (1–3 per project, neutral): `Quant · ML/AI · Systems/Backend · Full-Stack · Data · Infra/Cloud · Frontend · Applied-Research`.
- `ProjectStatus`: `shipped | in-progress | coming-soon`.

**`Project`** fields: `slug, title, oneLiner, whyShort, whyFull, whyStatus ("confirmed"|"draft"), typeTag, domainTags[], role|null, timeframe|null, team|null, stack[], metrics[{label,value}], repoUrl|null, demoUrl|null, youtubeUrl|null, status, coverImage|null, gallery[], featured?`.

**`Experience`** fields: `org, role, timeframe, typeTag (Internship|Founding|Research), oneLine, oneLineStatus ("confirmed"|"draft"), status ("current"|"past"|"incoming")`.

### 11.2 The provenance system (load-bearing content rule)

`whyStatus` / `oneLineStatus` mark whether copy is Vaibhav's own words (`confirmed`) or drafted from a README/resume for his review (`draft`). **The UI must visibly flag drafts** (the "draft" pill on cards and the detail "why" heading) so an unreviewed statement never ships as if confirmed. `TODO(vaibhav)` values are treated as unknown and **omitted from render** (`clean()` / `startsWith("TODO")` guards), never guessed. A redesign must preserve both behaviors — they encode the never-fabricate constraint.

### 11.3 Project inventory (10; source: `github.com/vaibhavw30` enumeration)

| Slug | Title | Type | Status | why | Featured | Notes |
|---|---|---|---|---|---|---|
| `boxit` | BoxIt | Personal | coming-soon | confirmed | ✓ | repoUrl **null** (private); boxit.best only; redacted tease. |
| `tariff-modelling` | Liberation Day and After | Personal | shipped | confirmed | ✓ | GTSF-affiliated; TODO tag decision (Personal↔Research). |
| `equitable` | EquiTable | Personal | shipped | confirmed | ✓ | role/team TODO (omitted). |
| `benchwarmer` | Benchwarmer | Personal | in-progress | confirmed | ✓ | C++ NBA predictor + Kalshi. |
| `firstwave` | FirstWave | Hackathon | shipped | draft | — | 2 metrics; role honesty = frontend lead. |
| `llm-activation-steering` | Steering Truth in LLMs | Research | in-progress | draft | — | = the Trustworthy Robotics role's repo. |
| `jobmaxxing` | jobmaxxing | Personal | in-progress | draft | — | — |
| `imc-prosperity` | IMC Prosperity 4 | Personal | shipped | draft | — | TODO tag (Personal↔Hackathon). |
| `clearrx` | clearRx | Hackathon | shipped | draft | — | FORK; co-built; contribution flagged. |
| `aquatic-sustainability` | Aquatic Sustainability | Research | shipped | draft | — | FORK; TODO tag + contribution. |

`featuredProjects` (home teaser) = the 4 marked featured. `draftWhyProjects` = the 6 with `whyStatus: "draft"`. Inventory has **no** Internship- or Founding-type projects (those live in Experience), so the grid's type filter omits those chips.

### 11.4 Experience inventory (5; `src/content/experience.ts`)

| Org | Role | Type | Status | Timeframe |
|---|---|---|---|---|
| DataMorph | Software Engineering Intern | Internship | past | Summer 2026 |
| OddsAreOn | Founding Engineer | Founding | past | TODO (omitted) |
| Trustworthy Robotics Lab | ML Researcher | Research | past | TODO (omitted) |
| GTSF | Quantitative Developer / Analyst | Research | incoming | Incoming |
| EPIC Lab · Georgia Tech | ML/Robotics Researcher (Prosthesis) | Research | incoming | Incoming |

All one-liners `confirmed`. TODO timeframes omitted, never guessed.

### 11.5 Site content (`src/content/site.ts`)

`heroHeadline` (locked), `heroRoles` (locked word-cycle list), `heroSublinePrefix`; `social` (github real, `linkedin` still `TODO(vaibhav)` → `hasLinkedin` is false → LinkedIn hidden site-wide until the URL lands); `navLinks` (Projects/About/Now — no resume).

### 11.6 About content (`src/content/about.ts`)

`aboutLead`, `aboutThroughLine` (the pull-quote), `aboutBody` (5 draft paragraphs), and `interests[]` (`{slug, label, blurb, href|null, live?}`). All prose is DRAFT in Vaibhav's voice, built only from confirmed facts, humanizer-disciplined, for his edit.

---

## 12. Responsive behavior

Mobile-first Tailwind; breakpoints used: `sm` (640px) and `lg` (1024px). Quality floor: **no horizontal scroll from 360px up** (verified 0px overflow at 375px on home/projects/detail/about).

| Region | Mobile (<640) | ≥640 (`sm`) | ≥1024 (`lg`) |
|---|---|---|---|
| Nav | tighter gaps (`gap-4`), wordmark `text-base` | `gap-6/7`, wordmark `text-lg` | — |
| Home section rhythm | `py-24` | `py-32` | — |
| Selected work | 1 col | 2 cols | 2 cols |
| Beyond code | 1 col | 2 cols | 4 cols |
| Projects grid | 1 col | 2 cols | 3 cols |
| Interests grid | 1 col | 2 cols | 3 cols |
| Filter rows | label stacks above chips (`flex-col`) | label inline (`flex-row`) | — |
| Experience row | stacked | `grid-cols-[1fr_1.4fr]` | — |
| Footer | stacked | row, ends aligned | — |
| Signature field | ~340 particles, `maxH 0.44h` | — (desktop counts) | — |
| Hero headline | wraps within `max-w-[15ch]` | — | — |

Type scale is fluid `clamp()`, so headings shrink continuously rather than at breakpoints.

---

## 13. Accessibility (quality floor — build silently, never regress)

- **Keyboard focus:** global `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px; }`. Every interactive element is a real `<a>`/`<button>`/`Link`. Nav/footer icons focus to `text-text-hi`.
- **Skip link** to `#main` (first tabstop).
- **Heading order:** one `<h1>` per page (hero/page title); sections use `<h2>`; cards/rows use `<h3>`. No skips.
- **ARIA:** icon-only links have `aria-label` (GitHub/LinkedIn); decorative icons + the signature canvas are `aria-hidden`; filter chips carry `aria-pressed`; the signature canvas is `pointer-events:none` and invisible to AT.
- **Reduced motion:** honored in three layers (§6.3); nothing essential gated on motion; the signature renders a static frame.
- **Contrast:** AA on `--bg-0`; `--text-lo` is used only for non-essential metadata; verify any new low-contrast pairing.
- **Semantics/alt:** semantic landmarks (`header`/`nav`/`main`/`footer`/`section`/`article`-like cards). Images (Phase 6 posters/photos) must ship alt text.

---

## 14. States catalog

| Surface | State | Treatment |
|---|---|---|
| Project card | default / hover / reduced-motion / coming-soon / draft-why | §8.4 |
| Projects grid | populated / filtered / **empty** (dashed panel + clear) | §10.2 |
| Project detail | shipped / in-progress / coming-soon (redacted tease) | §10.3 |
| Project "why" | confirmed / **draft** (visible flag) | §11.2 |
| Metrics | present (data-pos tiles) / absent (section omitted) | §10.3 |
| Demo slot | placeholder (`DemoPlaceholder`) / BoxIt tease (`ComingSoonTease`) | §10.3 |
| Experience row | past (no badge) / incoming (accent) / current (data-pos) | §10.1 |
| Interest tile | linked (hover raise) / inline (static) | §10.4 |
| Interest subpage | `ComingLive` placeholder → live module in Phase 6 | §8.6 |
| Nav | top (transparent) / scrolled (blurred) | §7.3 |
| LinkedIn link | hidden until real URL (`hasLinkedin`) | §11.5 |
| Live-data modules (Phase 6) | live / **graceful static fallback** (never broken/empty) | §18 |

Loading states: none needed yet (all content is static/SSG). Phase 6 live modules use ISR/server fetch, so the client sees resolved data or the static fallback — no client spinners.

---

## 15. Edge cases

- **Missing data:** any `null`/`TODO` field is omitted, not rendered blank (`clean()`); meta lines collapse (`.filter(Boolean)`); sections with empty arrays are skipped entirely.
- **Private repo:** BoxIt's `repoUrl` is `null` and there is no code path that renders a repo link for it — the tease is a distinct component.
- **Long strings:** card "why" is `line-clamp-4`; body copy capped at `.measure` (~68ch); titles wrap (no truncation on titles).
- **Filter combinations with zero results:** explicit empty state, not a blank grid.
- **No tags of a kind:** the grid never renders a filter chip for a tag absent from the inventory.
- **Slow/again resize:** signature repaints synchronously (§9.6); nav scroll listener is passive and idempotent.
- **Reduced motion + JS-off:** CSS backstop keeps everything at its static end-state; content is server-rendered so it's present without JS (except the signature canvas, which is decorative).

---

## 16. Hard constraints & decisions log

1. **No downloadable resume** anywhere. Ever.
2. **Conversion = GitHub + LinkedIn only.** No contact form, no email requirement.
3. **`boxit` repo never exposed** — teased via `boxit.best` "coming soon" card; redacted/lock treatment; `repoUrl` null.
4. **Never fabricate** — no invented metrics/motivations/facts; unknowns are `TODO(vaibhav)`, omitted from render; draft copy is visibly flagged.
5. **Contribution honesty** — real roles represented accurately (FirstWave = frontend lead; forks flagged: clearRx, aquatic-sustainability).
6. **Tag taxonomy is controlled** — exactly 1 type tag + 1–3 domain tags from the fixed vocabulary; color off the type tag (max 5 colors).
7. **Model 1 work architecture** — Experience (real roles) kept separate from Projects (self-driven builds); never flatten internships/founding into weekend builds.
8. **One signature moment** + a couple smaller ones; not a full WebGL game.
9. **YouTube launches with placeholders** (no videos recorded yet).
10. **ESPN Fantasy is stretch** — represented as an interest, integration not built.
11. **Every project has a "why"** (brief on card, full on detail) — the soul of the site; protect its specificity.
12. **Accent is one line** to swap; currently locked to `#c8b6ff`.

---

## 17. SEO, metadata, analytics

- Per-page `generateMetadata`/`metadata` (title via template `"%s · Vaibhav Wudaru"`, description, and detail pages set OG from the project). `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- OpenGraph + Twitter `summary_large_image` at the root; a default social card should be added in Phase 7.
- Vercel Analytics (privacy-friendly, light touch) mounted in the layout.
- Phase 7 to add: sitemap, robots, per-page OG images, Lighthouse ≥ 90 mobile pass.

---

## 18. Live-data roadmap (Phase 6 — context for the redesign)

Every module must **fail gracefully** to a static fallback (never a broken/empty state); secrets server-side only; fetch via route handlers / server components with ISR.

| Module | Source | Auth | Feeds | Priority |
|---|---|---|---|---|
| Letterboxd | RSS `letterboxd.com/USERNAME/rss/` | none | `/about/movies` grid + home breadcrumb | High |
| Chess.com | `api.chess.com/pub/player/USERNAME` | none | home tile + `/about/chess` | High |
| YouTube | Data API v3 | API key | project demo slots (placeholders now) | High (placeholder) |
| Spotify | Web API | OAuth + server refresh | now-playing / top tracks | Medium |
| Strava | Strava API | OAuth + server refresh | recent activity / running | Medium |
| Recipes | in-repo folder | none | `/about/cooking` gallery | Medium |
| ESPN Fantasy | unofficial | league cookie (fragile) | **don't build** — mention only | Stretch |

Needs from Vaibhav: Letterboxd + Chess.com usernames; Spotify/Strava app credentials + refresh tokens (his OAuth to run); confirm which live signals he's comfortable exposing. Keys in Vercel env; documented in `.env.example`.

---

## 19. Open decisions (need Vaibhav's input, tracked)

- **6 draft project "why"s** awaiting tone/sign-off: firstwave, llm-activation-steering, jobmaxxing, imc-prosperity, clearrx, aquatic-sustainability.
- **Tag calls:** tariff Personal↔Research; imc Personal↔Hackathon; aquatic Research↔Personal.
- **Blank fields:** role/team/timeframe TODOs on EquiTable, OddsAreOn, Trustworthy Robotics, etc.
- **Fork contribution notes:** clearRx, aquatic-sustainability.
- **LinkedIn URL** (site-wide LinkedIn hidden until provided).
- **About narrative** is draft voice — his to edit.
- **Live-data credentials/usernames** (§18).

---

## 20. Redesign brief — reskin without losing the bones

**The problem:** the current execution reads too dark / black / drab. The dark-editorial system is disciplined and consistent, but the overall impression is heavy and low-energy — closer to the "near-black + one accent" AI-default look than intended, despite the layered palette. We want to take the visual layer back to the drawing board.

### 20.1 What is load-bearing (keep through any reskin)

These are the bones. A redesign changes how they look, not whether they exist:

- **The through-line** ("builds from noticed problems") and the **"why"-first** framing of every project.
- **Information architecture** (§1.6) and the **Model 1** split (Experience vs Projects).
- **Voice calibration** per surface + humanizer discipline (§1.4).
- **The provenance/never-fabricate system** — draft flags + TODO omission (§11.2).
- **The one signature moment** as a concept (market-depth-as-liquidity) — its *palette* can change (it reads from tokens), but the "one loud thing, everything else quiet" principle stays.
- **All hard constraints** (§16).
- **Interaction design** — word-cycle hero, filterable grid, scroll reveals, card hover-raise, nav scroll-blur, reduced-motion contract, the performance law (transform/opacity only).
- **The content** (copy, inventory, schema) — untouched by a reskin.
- **The quality floor** — responsive to 360px, AA contrast, keyboard focus, reduced motion, LCP = hero text.

### 20.2 What is skin (open to change)

- **Palette** — the whole near-black ramp, the accent, surface treatment, borders. This is the main lever.
- **Surface energy** — could move lighter, warmer, higher-contrast, more color, more texture, or a light/dark duality.
- **Typography treatment** — the Fraunces + Inter + Plex Mono pairing can stay or shift; type *is* allowed to carry more identity.
- **Density & imagery** — how much negative space, how much the film posters / recipe photos bring color in.
- **Depth cues** — currently flat hairlines + subtle surface steps; could gain more dimensionality.

### 20.3 Directions worth exploring (to be chosen with Vaibhav — not decided here)

Framed as options, each a departure from "dark + one accent":

- **Warm paper / light editorial** — off-white or warm-neutral base, ink-dark serif, one saturated accent; the film/recipe imagery pops against a bright ground. (Risk: the cream + high-contrast-serif + clay-accent combo is itself an AI tell — avoid clay/terracotta specifically.)
- **Light/dark duality** — a genuinely designed light theme as default with a dark counterpart, both first-class, so it's not "a dark site" at all.
- **Richer dark with real color** — keep dark but pull it away from near-black toward a deep saturated base (ink-blue / warm-charcoal) and let the type-tag palette and data ticks bring more life; more contrast, less grey.
- **Signature-forward** — let the liquidity field (or a new signature) set the color story, and derive the UI palette from it, so the identity is the moment, not the background.

### 20.4 Constraints on the new direction

- Must **avoid the three AI-default clusters** (cream+serif+clay; pure #000+neon; broadsheet hairline columns).
- Must keep **one primary accent** discipline (a second color only as a data tick), unless the new direction deliberately and coherently expands the palette.
- Must keep **AA contrast** and the full **reduced-motion / performance** contract.
- The **signature moment reads from tokens** — whatever the new bid/ask/accent colors are, the field re-tints for free.
- **Copy and IA don't move** — this is a reskin, not a re-architecture.

### 20.5 Suggested next step

Pick a direction in §20.3 (or a blend), lock a new token system (4–6 surface hexes, accent, data ticks, type roles) as a first pass, critique it against the anti-template guardrails, then reskin `globals.css` + the surface treatments — the component structure and content in this doc stay put.

### 20.6 CHOSEN DIRECTION — "Daydream sky" (painterly light theme)

**Locked direction (owner, this session):** a **bright day sky rendered as a soft, slightly-faded oil painting**, used as the site background/theme. Owner is sourcing the background asset from Higgsfield.

**Why it's the right call:** it ties straight to the hero line *"Building the things I imagined as a kid"* — sky, looking up, daydreaming, imagination — so the visual is *about* the person, not decoration. It also clears all three AI-default tells at once (not dark+neon, not cream+clay, not broadsheet columns). It inverts the current problem: from heavy/dark/drab to light/airy/warm.

**The three load-bearing design decisions:**

1. **Legibility system = frosted-glass panels.** Content floats on semi-opaque light panels (`bg-white/50–70` + `backdrop-blur`) above the painting; hero text sits directly on a calm, bright region of the sky. This guarantees AA over a variable-brightness image and reads as gallery-light, not "text on a photo." A subtle top-of-viewport light scrim can protect the nav. **This is non-negotiable for accessibility** — never place body text directly on unmasked painterly regions.
2. **Signature field recolor (not removal).** Keep the market-depth-as-liquidity concept but retint from green/violet to **sky-native tones** — warm gold (bid) vs cool blue (ask), the field reading as light currents / wind over the sky. Because the field reads bid/ask/accent from CSS vars (§9.2), this is a token change plus a metaphor tweak, decided at build time.
3. **Painting placement (recommended model b):** the oil-painting owns the **hero** (full-bleed, `next/image`, responsive, lazy below the fold), then lower sections settle into a **solid/gradient sky-tint derived from the painting** — better performance and legibility across a long scroll than one fixed image behind everything. (Model a — one fixed sky behind all sections with frosted panels throughout — stays on the table.)

**New token system (first-pass targets — refine against the actual painting):**
- Surfaces: high-key sky base (soft powder/cerulean, e.g. `#dCEBF5`-ish) → lighter frosted panel whites (`#ffffff` at 55–70% + blur) → subtle warm cloud-cream mid-tones. Replace the near-black ramp entirely.
- Text: ink/charcoal, not pure black (e.g. `#1e2430` hi, softer mids) for warmth; verify AA on the *lightest scrim value*, not the raw painting.
- Accent: one sky-coherent accent — candidates: warm **golden amber** (sun), deep **cerulean**, or dusty **coral** (sunset). One, considered, not neon. (The current violet retires.)
- Data ticks: warm/cool pair that lives in a sky — gold up / blue down, or keep a green but a sage/muted one.
- Type-tag palette: re-derive 5 hues that sit on a light ground (the current dark-ground hues will look washed out on white).
- Type: Fraunces + Inter can stay; on a painterly warm ground the serif may want slightly more weight/contrast. Consider a hair more ink in headings.

**Asset guidance for Higgsfield (so it's web-usable):**
- Style: *bright daytime sky, soft impressionist oil painting, high-key, muted/desaturated, slightly faded vintage, gentle scattered clouds, lots of open sky, minimal busy detail.*
- Keep **high-key + low-contrast** (the "faded" look) so dark text survives on it. Avoid saturated punch, sun flare, storm tones, or a dark horizon/land strip.
- Composition: a **calmer, lighter region upper-left** for the headline; interesting cloud forms toward the right/edges.
- Deliverables: **wide ≥2560px** (16:9 or 21:9) for desktop + a **taller crop** for mobile (or one loose comp that crops both ways). Grab **2–3 variants**. Export high-res; we compress to webp/avif and possibly ship a faded/blurred derivative so it never fights content.

**Preserved from the current build (per §20.1):** all IA, interactions, copy, the provenance/never-fabricate system, the signature *concept*, and the full quality floor. This is a reskin — Appendix G (`:root` retint) + Appendix F (per-component touch-points) are the map. The frosted-panel legibility layer is the one genuinely *new* structural piece the light theme adds.

**Buildable now, before the asset lands:** the entire sky token system + frosted-panel surface primitive + component retints + field recolor can be built against a placeholder sky gradient, so the Higgsfield painting drops straight into a finished theme. That de-risks the image dependency and lets the reskin proceed in parallel.

---

## Appendix A — Complete class-string reference (per component/element/state)

Exact Tailwind for a faithful rebuild. Reskin note: the *structural* classes (layout, spacing, radius, flex/grid) stay; the *color* classes (`bg-*`, `text-*`, `border-*`) are the reskin surface.

### A.1 Layout shells
- Root main wrappers: `mx-auto w-full max-w-6xl px-6` (home/projects), `max-w-4xl` (about/stub), `max-w-3xl` (detail/subpages). Inner-page top/bottom: `pb-28 pt-32`.
- Home section: `mx-auto w-full max-w-6xl px-6 py-24 sm:py-32`.
- Hero section: `relative mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-center overflow-hidden px-6 pt-28 pb-20`.

### A.2 Nav (`site-nav.tsx`)
- Header: `fixed inset-x-0 top-0 z-40 transition-colors duration-300` + state:
  - scrolled: `border-b border-border bg-bg-0/70 backdrop-blur-md`
  - top: `border-b border-transparent bg-transparent`
- Inner nav: `mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6`.
- Wordmark: `shrink-0 whitespace-nowrap font-serif text-base tracking-tight text-text-hi transition-colors hover:text-accent sm:text-lg`.
- Link cluster: `flex items-center gap-4 sm:gap-7`; list `flex items-center gap-4 text-small text-text-mid sm:gap-6`; link `transition-colors hover:text-text-hi focus-visible:text-text-hi`.
- Icon link: `text-text-mid transition-colors hover:text-text-hi focus-visible:text-text-hi`; icon `size-[1.15rem]`.

### A.3 Footer (`site-footer.tsx`)
- `footer.border-t border-border`; inner `mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-end sm:justify-between`.
- Wordmark: `font-serif text-h3 text-text-hi transition-colors hover:text-accent`; tagline `mt-2 text-small text-text-lo`.
- Link list: `flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-text-mid`; icon `size-5`.

### A.4 Project card (`project-card.tsx`)
- Root link: `group flex h-full flex-col rounded-xl border border-border bg-bg-1 p-6 transition duration-200 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-bg-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0`.
- Title: `mt-4 font-serif text-h3 text-text-hi`.
- Why: `mt-2 font-serif text-small italic leading-relaxed text-text-mid line-clamp-4`.
- Footer: `mt-auto flex flex-wrap items-center gap-1.5 pt-5`.
- Coming-soon label: `inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-text-lo` (with `Lock` `size-3`).
- Arrow: `size-4 text-text-lo transition-colors group-hover:text-accent`.
- Draft flag: `ml-auto font-mono text-[0.62rem] uppercase tracking-wider text-text-lo/70`.

### A.5 Tag pills (`tag-pill.tsx`)
- Base: `inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider`.
- Type: `text-tag-{X} border-tag-{X}/35 bg-tag-{X}/10`.
- Domain: `border-border bg-bg-2/60 text-text-lo`.

### A.6 Filter chips (`projects-grid.tsx`)
- Base: `rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider transition-colors`.
- Idle: `border-border text-text-lo hover:border-border-strong hover:text-text-mid`.
- Active type: `border-tag-{X}/50 bg-tag-{X}/12 text-tag-{X}`; active "All" type: `border-accent/50 bg-accent-muted text-text-hi`; active domain: `border-border-strong bg-bg-2 text-text-hi`.
- FilterRow: `flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4`; label `w-16 shrink-0 font-mono text-mono uppercase tracking-widest text-text-lo/70`.
- Grid: `mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3`.
- Empty panel: `mt-10 rounded-xl border border-dashed border-border px-6 py-16 text-center`.

### A.7 Section heading (`section-heading.tsx`)
- Wrapper: `flex flex-wrap items-end justify-between gap-4`.
- Eyebrow: `font-mono text-mono uppercase tracking-widest text-text-lo`.
- Title: `mt-3 text-h2 font-serif text-text-hi`.
- CTA: `group inline-flex items-center gap-1.5 text-small text-text-mid transition-colors hover:text-accent` (+ `ArrowRight size-4 group-hover:translate-x-0.5 motion-reduce:...`).

### A.8 Experience row (`experience-strip.tsx`)
- Row: `border-t border-border py-6 first:border-t-0 sm:grid sm:grid-cols-[1fr_1.4fr] sm:gap-8`.
- Org: `font-serif text-h3 text-text-hi`; role `text-small font-medium text-text-mid`; timeframe `font-mono text-mono uppercase tracking-wider text-text-lo`; one-line `measure mt-2 text-small leading-relaxed text-text-mid`.
- Badge base: `inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider`; incoming `border-accent/35 bg-accent-muted text-accent`; current `border-data-pos/35 bg-data-pos/10 text-data-pos`.

### A.9 Interest tile (`about/page.tsx`)
- Linked: `group flex h-full flex-col justify-between rounded-xl border border-border bg-bg-1 p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-bg-2 motion-reduce:...`.
- Inline (static): `flex h-full flex-col justify-between rounded-xl border border-border bg-bg-1/60 p-5`.
- Label: `font-mono text-mono uppercase tracking-wider text-text-lo`; blurb `mt-6 text-small leading-relaxed text-text-mid`.

### A.10 Detail page (`projects/[slug]/page.tsx`)
- Back link: `group inline-flex items-center gap-1.5 font-mono text-mono uppercase tracking-wider text-text-lo transition-colors hover:text-text-hi` (+ `ArrowLeft size-3.5`).
- Title: `mt-5 text-h1 font-serif text-text-hi`; oneLiner `measure mt-4 text-body leading-relaxed text-text-mid`; meta `mt-5 font-mono text-mono text-text-lo`.
- Source pill: `inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-small text-text-mid transition-colors hover:border-border-strong hover:text-text-hi`.
- boxit CTA: `group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-muted px-4 py-1.5 text-small text-text-hi transition-colors hover:border-accent/70`.
- StatusBadge: `inline-flex items-center gap-2 font-mono text-mono uppercase tracking-wider text-text-lo`; dot `size-1.5 rounded-full {bg-data-pos|bg-accent|bg-text-lo}`.
- Why heading: `font-mono text-mono uppercase tracking-widest text-text-lo`; whyFull `measure mt-4 font-serif text-h3 italic leading-relaxed text-text-mid`.
- Metric tile: `rounded-xl border border-border bg-bg-1 px-5 py-4`; label `font-mono text-mono uppercase tracking-wider text-text-lo`; value `mt-2 font-serif text-h3 text-data-pos`.
- Stack chip: `rounded-full border border-border bg-bg-1 px-3 py-1 font-mono text-[0.72rem] text-text-mid`.
- DemoPlaceholder: `flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-1 text-center` (+ `Play size-7 text-text-lo`).
- ComingSoonTease: `relative overflow-hidden rounded-xl border border-border bg-bg-1`; backdrop bars `block h-3 rounded-full bg-text-hi` inside `absolute inset-0 ... opacity-[0.06]`; lock badge `inline-flex size-12 items-center justify-center rounded-full border border-border-strong bg-bg-2`.

### A.11 About pull-quote (`about/page.tsx`)
- `blockquote.measure border-l-2 border-accent/50 py-1 pl-6`; text `font-serif text-h3 italic leading-relaxed text-text-hi`.

### A.12 Interest subpage (`about/interest-subpage.tsx`)
- Main: `mx-auto w-full max-w-3xl px-6 pb-28 pt-32`.
- ComingLive: `rounded-xl border border-dashed border-border bg-bg-1/60 px-6 py-16 text-center`; note `measure mx-auto text-small leading-relaxed text-text-mid`.

---

## Appendix B — Complete copy inventory (every user-visible string)

Reskin note: copy does **not** change in a reskin. This is the authoritative string list.

### B.1 Global
- Wordmark: **Vaibhav Wudaru**
- Nav: **Projects**, **About**, **Now**
- Footer tagline: *"Building from noticed problems — software, machine learning, and quant. Between the Bay Area and Atlanta."*
- Skip link: **Skip to content**

### B.2 Hero
- Eyebrow: **Georgia Tech · Computer Science**
- Headline: **Building the things I imagined as a kid.**
- Sub-line: **Georgia Tech CS student interested in** + cycling: *software development → machine learning → quantitative finance → research*

### B.3 Home sections
- Selected work — eyebrow **Selected work**, title **Things I built because I noticed something.**, CTA **All projects**
- Experience — eyebrow **Experience**, title **Where I've been putting the work.**
- Beyond code — eyebrow **Beyond code**, title **The rest of it.**, CTA **About me**
  - Chess — *Hovering around 1300, stubbornly.* → `/about/chess`
  - Film — *Logging everything I watch on Letterboxd.* → `/about/movies`
  - Kitchen → garden — *Cooking pulled me into a garden, then beekeeping, then pollinator advocacy.* → `/about/cooking`
  - Debate — *Ranked #19 in the country, once upon a time.* → `/about`

### B.4 Projects page
- Eyebrow **Projects**, h1 **Things I built from problems I noticed.**
- Lead: *"Most of these started the same way — something bugged me enough to build the fix. Filter by what kind of work it was, or by the domain it lives in."*
- Filter labels: **Type**, **Domain**; result line **{N} project(s)** + **clear filters**
- Empty: **No projects match that combination yet.** + **Clear filters**

### B.5 Project detail (structural strings)
- **All projects** / **Source** / **Visit boxit.best** / **Why I built it** / **Results** / **Stack** / **Back to all projects**
- DemoPlaceholder: **Demo walkthrough coming soon**
- BoxIt tease: **In private beta** / *"The build is under wraps for now. The live product lives at boxit.best."* / **boxit.best**
- Status labels: **Shipped** / **In progress** / **Coming soon**
- Draft flag tooltip: *"Why is drafted from the repo — pending Vaibhav's review"*

### B.6 Project why-shorts (card copy)
- **BoxIt:** *"As an out-of-state student, I saw college storage was expensive, inconvenient, and low-trust — and that students would rather earn money hosting it."*
- **Liberation Day and After (tariff):** *"I'm fascinated by how huge macro movements ripple through sectors and reshape market structure."*
- **EquiTable:** *"I noticed Atlanta's food-insecurity problem was driven by disconnected food banks and a lack of understanding — I wanted to bridge that gap."*
- **Benchwarmer:** *"I've always been into the NBA and into predictions, and I wanted to bring real quantitative reasoning to it — not gut calls, but a backtested engine meeting live markets."*
- **FirstWave** (draft): *"Emergency demand is predictable — Friday nights in the Bronx, summer weekends in Brooklyn — but ambulances still sit and wait for the call instead of moving ahead of it."*
- **Steering Truth in LLMs** (draft): *"The standard ways to find a 'truth direction' in a model — linear probes, contrastive mean differences — leave signal on the table, so I tried to feature-engineer better directions and actually steer on them."*
- **jobmaxxing** (draft): *"Internship postings are scattered across a dozen boards and go stale fast — I was tired of refreshing all of them, so I built one feed that watches them for me."*
- **IMC Prosperity 4** (draft): *"I wanted to see whether my read on a market would actually hold up against a live order book — not just a clean backtest."*
- **clearRx** (draft): *"Whether two prescriptions interact shouldn't come down to a provider's memory — but a tool that answers it is only useful if you can trust the answer."*
- **Aquatic Sustainability** (draft): *"Clean water fails quietly in the places with the least data — I wanted a way to see watershed risk and water-access gaps on a map before they turn into emergencies."*

(Full `whyFull` stories live in `src/content/projects.ts` — too long to inline; treat that file as source of truth.)

### B.7 About page (draft voice — `src/content/about.ts`)
- Eyebrow **About**, h1 **The person behind the resume.**
- Lead: *"I'm Vaibhav. I build things because I keep noticing problems I can't quite let go of."*
- Pull-quote: *"Almost everything I've built started as something I noticed and couldn't leave alone."*
- Body ¶1: *"I've been building things since I was a kid. The only real difference now is that the things compile. Most of what I've made started the same way: I noticed something that bugged me, and building the fix turned out to be more interesting than complaining about it."*
- Body ¶2: *"At Georgia Tech I study computer science with a math minor, graduating in 2028. My work splits about three ways: software engineering, machine learning research, and quant finance. I like that they keep running into each other. So far that's meant founding-team engineering at a sports-odds startup, a software internship building natural-language data tooling, and research steering truth directions inside language models. Next, I'm joining Georgia Tech's $2.7M student-managed fund as a quant and the EPIC lab as a prosthesis researcher."*
- Body ¶3: *"Away from a screen, most of it comes back to food. I started cooking with whole ingredients, which made me want to grow a few of them, which turned into an actual garden. The garden got me into beekeeping. The bees got me standing at a farmers' market explaining to strangers why pollinators are worth caring about. I didn't see that chain coming when it started."*
- Body ¶4: *"I'm drawn to games that keep score but hide a lot of judgment underneath. I debated competitively and got as high as #19 in the country. I play poker, and once made the top 30 in my quant club's tournament. I'm parked around 1300 in chess and unreasonably stubborn about moving up. There's also basketball, too much fantasy football, and piano for when I want to think about nothing."*
- Body ¶5: *"I split my time between the Bay Area and Atlanta, and I'm always up for comparing notes on any of the above."*
- Interests eyebrow **Beyond the work**, title **What I get up to otherwise.**

### B.8 Interest tiles (About) — label / blurb / link
- **Film** — *"I log everything I watch on Letterboxd. It's the closest thing I keep to a diary."* → `/about/movies`
- **Chess** — *"Parked around 1300 and stubborn about it."* → `/about/chess`
- **Kitchen → garden** — *"Whole ingredients, mostly. It's how the garden and the bees started."* → `/about/cooking`
- **Debate** — *"Got as high as #19 in the country, and #3 at Berkeley."* (inline)
- **Poker** — *"Top 30 in my quant club's tournament."* (inline)
- **Basketball** — *"Pickup whenever I can find a run."* (inline)
- **Fantasy football** — *"I take it more seriously than the standings justify."* (inline)
- **Piano** — *"For when I want to think about nothing."* (inline)

### B.9 Interest subpage intros
- **Movies** — eyebrow *About · Film*, title **Everything I watch.**, intro *"I log every film on Letterboxd. It's the closest thing I keep to a diary, and I'm not above rating something five stars for reasons I can't defend."*, ComingLive *"The poster grid pulls straight from my Letterboxd feed once it's wired up — recent watches, ratings, and the occasional note. Until then, this is the placeholder holding its spot."*
- **Chess** — eyebrow *About · Chess*, title **Parked around 1300.**, intro *"I've been stuck near 1300 for a while and I'm stubborn about it. I keep playing anyway, mostly because losing a game I should have won is a very effective way to keep me up at night."*, ComingLive *"My live rating and a few recent games land here, straight from the Chess.com API — including the losses, which feels only fair."*
- **Cooking** — eyebrow *About · Kitchen*, title **Made from whole ingredients.**, intro *"Cooking with whole ingredients is what started the whole chain: a garden, then beehives, then me at a farmers' market talking to strangers about pollinators. This is where the food part lives."*, ComingLive *"A gallery of things I've actually made goes here — my own photos, warm and a little messy, on purpose. It fills in as I cook."*

---

## Appendix C — Token cross-reference (where each token is used)

| Token | Appears in |
|---|---|
| `--bg-0` | body base; nav scrolled tint (`/70`) |
| `--bg-1` | project cards, metric tiles, stack chips, demo/tease panels, linked interest tiles; `/60` on inline tiles, empty panels, ComingLive |
| `--bg-2` | card hover, domain pill fill (`/60`), active domain chip, lock badge |
| `--bg-3` | reserved (inset panels) |
| `--text-hi` | headings, card/detail titles, wordmark, pull-quote, active chip text, mid-seam hint |
| `--text-mid` | body copy, nav links (rest), card why, footer links, source pill |
| `--text-lo` | eyebrows, mono labels, metadata, timeframes, arrows (rest), draft flag (`/70`), status text |
| `--border` | all hairline borders, dashed placeholders |
| `--border-strong` | hover borders, lock badge ring, active domain chip |
| `--accent` | focus ring, hover link color, word-cycle word, incoming badge, pull-quote rule (`/50`), boxit CTA, in-progress status dot, **ask particles** |
| `--accent-muted` | incoming badge bg, active "All"/type chip bg, boxit CTA bg |
| `--data-pos` | metric values, shipped dot, current badge, **bid particles** |
| `--data-neg` | reserved |
| `--tag-*` (×5) | type pills, active type filter chips |

---

## Appendix D — Motion timing master table

| # | Element | Trigger | Property | Duration | Easing | Reduced-motion |
|---|---|---|---|---|---|---|
| 1 | Scroll reveal | in-view (once, −12%) | opacity + `y:16→0` | 500ms | `cubic-bezier(0.22,1,0.36,1)` | instant visible |
| 2 | Stagger children | container in-view | delay per child | 70ms stagger, 50ms delay | — | no stagger |
| 3 | Hero eyebrow | mount | opacity + `y:12→0` | 500ms | `[0.22,1,0.36,1]` | static |
| 4 | Hero h1 / subline | mount | opacity + `y:16→0` | 600ms (delay 60/140ms) | `[0.22,1,0.36,1]` | static |
| 5 | Word-cycle | 2400ms interval | masked `y` slide + opacity | 420ms | `[0.22,1,0.36,1]` | cycle off, first word static |
| 6 | Card hover | pointer | `translateY(-4px)` + border/bg | 200ms | ease-out | none (`motion-reduce`) |
| 7 | Icon nudge | group hover | `translateX(±2px)` | (transition-transform) | — | none |
| 8 | Nav backdrop | scroll >8px | bg + border + blur | 300ms | (colors) | n/a (not motion) |
| 9 | Grid reflow | filter change | `layout` + `scale/opacity` | 240ms | ease-out | `layout` off, instant |
| 10 | Signature field | rAF loop | canvas paint (transform/opacity feel) | 60fps | — | single static frame |
| 11 | Field fade-in | first frame | opacity 0→1 | 1200ms | ease-out | opacity 1 immediately |
| 12 | Lenis scroll | wheel/drag | inertia | ~1.1s glide | `1.001 − 2^(−10t)` | disabled |

---

## Appendix E — Page wireframes (ASCII, desktop)

```
HOME
┌───────────────────────────────────────────────┐
│ [Vaibhav Wudaru]        Projects About Now  GH │  ← fixed nav (transparent over hero)
├───────────────────────────────────────────────┤
│  GEORGIA TECH · COMPUTER SCIENCE               │
│  Building the things I                         │   hero (88svh)
│  imagined as a kid.                            │   ┌ liquidity field behind text ┐
│  Georgia Tech CS student interested in [word]  │   └ green bids · violet asks    ┘
├───────────────────────────────────────────────┤
│  SELECTED WORK              All projects →      │
│  Things I built because I noticed something.    │
│  ┌────────────┐ ┌────────────┐                 │   2-col featured cards
│  └────────────┘ └────────────┘                 │
├───────────────────────────────────────────────┤
│  EXPERIENCE                                     │
│  Where I've been putting the work.              │
│  ── DataMorph ····· role / timeframe / line     │   divided rows
│  ── OddsAreOn ····· …                           │
├───────────────────────────────────────────────┤
│  BEYOND CODE                About me →          │
│  The rest of it.                                │
│  ┌──┐┌──┐┌──┐┌──┐                               │   4 tiles
├───────────────────────────────────────────────┤
│  Vaibhav Wudaru      Projects About Now  GH LI  │   footer
└───────────────────────────────────────────────┘

PROJECTS
│ PROJECTS                                        │
│ Things I built from problems I noticed.         │
│ [lead]                                          │
│ Type   [All][Personal][Research][Hackathon]     │  ← only present tags
│ Domain [All][Quant][ML/AI][Full-Stack]…         │
│ 10 projects                                     │
│ ┌────┐┌────┐┌────┐                              │  3-col grid, animated reflow
│ └────┘└────┘└────┘                              │

PROJECT DETAIL (max-w-3xl)
│ ← All projects                                  │
│ [TypePill] ● Shipped                            │
│ Title (serif h1)                                │
│ oneLiner                                        │
│ role · timeframe · team                         │
│ [Source]  [Visit boxit.best]                    │
│ ┌ demo / tease slot (aspect-video) ┐            │
│ WHY I BUILT IT   (draft?)                       │
│ whyFull (serif italic)                          │
│ RESULTS  ┌ metric ┐┌ metric ┐                   │
│ STACK    ○ ○ ○ ○                                │
│ ── domain pills ──   Back to all projects       │

ABOUT (max-w-4xl)
│ ABOUT                                           │
│ The person behind the resume.                   │
│ lead (h3)                                       │
│ ¶ paragraph                                     │
│ ▏ pull-quote (accent rule)                      │
│ ¶ ¶ ¶ ¶                                         │
│ BEYOND THE WORK                                 │
│ What I get up to otherwise.                     │
│ ┌──┐┌──┐┌──┐  (linked: Film/Chess/Kitchen)      │
│ ┌──┐┌──┐┌──┐  (inline: Debate/Poker/…)          │
```

---

## Appendix F — Per-component reskin touch-points

For each component: what a reskin *changes* vs. what stays structural. "Change" = color/surface/type only; structure/behavior stays.

| Component | Reskin changes | Stays |
|---|---|---|
| Nav | bg/blur treatment, wordmark type, link colors | fixed position, scroll-threshold behavior, contents |
| Footer | surface, type | layout, conversion links (GH/LinkedIn only) |
| Project card | surface, border, accent-on-hover, why type | structure, hover-raise mechanic, clamp, draft/coming-soon logic |
| Tag pills | the tag color palette, neutral pill treatment | mono label form, taxonomy, cap at 3 |
| Filter chips | active/idle color treatment | AND-filter logic, present-only tags, animated grid |
| Section heading | eyebrow/title color + type | eyebrow+title+CTA structure, no-numbering rule |
| Experience row | divider color, badge colors | grid layout, status logic, TODO omission |
| Hero | palette of the field, text colors | word-cycle, layout, LCP-safe lazy field |
| Liquidity field | bid/ask/seam colors (auto from tokens) | the whole simulation, lifecycle, reduced-motion frame |
| Interest tiles | surface, accent | linked-vs-inline distinction |
| Detail sections | surfaces, metric/status colors | section order, clean() TODO handling, BoxIt tease |
| ComingLive / placeholders | surface/dash color | honest-placeholder role |
| Reveal system | — | motion vocabulary + reduced-motion contract |

---

## Appendix G — Annotated `globals.css` (current)

The single styling config. Structure:
1. `@import "tailwindcss";` + `@import "tw-animate-css";`
2. `:root` — `color-scheme: dark` + all raw tokens (§3, §4.2): surfaces, text, borders, accent (+ `color-mix` muted), data ticks, fluid type scale, tag colors.
3. `@theme inline` — maps every raw var to a Tailwind theme var (`--color-*`, `--text-*`, `--font-*`) so utilities like `bg-bg-1`, `text-h2`, `font-serif` resolve. **This block is Tailwind v4's config-in-CSS; there is no JS config file.**
4. `@layer base` — `html { scroll-behavior: auto }` (Lenis owns scroll); `body` base (bg-0, text-hi, Inter, 1.6 leading, antialiased); `h1,h2,h3` serif + tight leading + `-0.02em`; `:focus-visible` accent ring; `.measure { max-width: 68ch }`.
5. `@media (prefers-reduced-motion: reduce)` — global backstop forcing `animation-duration`/`transition-duration` ≈ 0 and `scroll-behavior: auto`.

**Reskin entry point:** almost the entire visual change happens in block 2 (`:root` tokens). Change the surface ramp, accent, and (optionally) the type scale/fonts there, and the `@theme inline` mapping + every component utility follow automatically. Structural CSS (blocks 4–5) mostly stays.

---

*End of handoff. Everything above describes the current build as of Phase 5. For the phased history and per-phase decisions, see `docs/IMPLEMENTATION_PLAN.md`; for the original product spec, `docs/PRD.md`; for the original design system, `STYLE.md`. The redesign brief is §20; the fastest reskin path is Appendix G (retint `:root`) plus Appendix F (per-component touch-points).*
