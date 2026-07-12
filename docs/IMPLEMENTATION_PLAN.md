# Implementation Plan — vaibhavwudaru.com

Derived from `docs/PRD.md` + `STYLE.md` + the two skills in `.claude/skills/`.
Ordered into **independently-shippable phases**, each with acceptance criteria.
Every phase notes which **[CC-DECIDES]** calls it resolves and flags what needs
Vaibhav's input first.

**Governing rule (never regresses): calm canvas, alive objects.** Layout stays
editorial and restrained; energy concentrates in one signature moment. Animate
`transform`/`opacity` only. Respect `prefers-reduced-motion` everywhere.

---

## Locked hard constraints (carried into every phase)

1. **No downloadable resume anywhere** — not nav, footer, or any page.
2. **Conversion = GitHub + LinkedIn only.** No contact form, no email requirement.
3. **`boxIt` repo is PRIVATE — never exposed.** BoxIt appears only as a
   "coming soon" card linking to `boxit.best`, described from resume facts.
4. **Never fabricate** metrics or motivations. Unknown → `TODO(vaibhav)`.
5. **FirstWave honesty:** Vaibhav was **frontend lead** (React + Mapbox
   dashboard + FastAPI integration), not the ML-pipeline author.
6. **Model 1 work architecture:** Experience (roles) separate from Projects
   (self-driven builds) — never flatten the two.
7. **Tag taxonomy:** exactly **one** type tag + **1–3** domain tags, from the
   controlled vocabulary. Color off the type tag (≤5 colors); domain tags neutral.

---

## Build note — accent LOCKED (resolves STYLE.md [CC-DECIDES])

**Accent: `--accent: #c8b6ff` (soft violet) — LOCKED, owner sign-off 2026-07.**
Reasoning: the brief's biggest risk is reading as "near-black + one neon accent,"
the known AI tell. Violet is an off-tone that feels editorial rather than
product-y, it isn't the Claude terracotta tell, and it pairs cleanly with the
`--data-pos/--data-neg` ticks reserved for quant contexts. Standby alternates
(muted teal, warm amber, periwinkle) stay documented in `src/app/globals.css` as
a **one-line change** if we ever revisit — but this is the identity accent.

**Hero copy LOCKED (owner sign-off 2026-07)** — single source of truth in
`src/content/site.ts`: headline "Building the things I imagined as a kid."; the
word-cycle runs software development → machine learning → quantitative finance →
research.

---

## Phase 1 — Scaffold, tokens, fonts, route skeleton ✅ DONE

**Goal:** a deployable baseline that builds, runs, and encodes the design system.

- Next.js 16 (App Router) + TypeScript + Tailwind v4, npm, Turbopack.
- Motion stack installed: `motion`, `lenis`, `gsap` (reserved), `@vercel/analytics`.
  shadcn foundation (`components.json`, `cn()`, lucide, tw-animate-css).
- Tokens from STYLE.md as CSS vars + Tailwind `@theme` (`src/app/globals.css`):
  layered near-black surfaces, three text steps, borders, ONE accent, data ticks,
  type-tag colors, fluid `clamp()` type scale.
- Fonts via `next/font` (`src/lib/fonts.ts`): **Fraunces + Inter + IBM Plex Mono**;
  Playfair documented as the alternate.
- Routes as empty-but-valid pages with metadata: `/`, `/projects`,
  `/projects/[slug]`, `/about`, `/about/movies`, `/about/cooking`, `/now`.
- `.env.example` documenting Letterboxd / Chess.com / YouTube / Spotify / Strava /
  ESPN keys, secrets server-side only.
- Typed content model (`src/content/schema.ts`) + seed inventory
  (`projects.ts`, `experience.ts`) matching PRD §5.4.
- Quality floor wired: `prefers-reduced-motion` (CSS backstop + Lenis gate +
  motion helpers), accent focus-ring, skip link, Vercel Analytics.

**Acceptance:** `npm run build` + `npm run lint` clean; dev server serves all
routes 200; project detail pages SSG from the content model. ✅ All verified.

---

## Phase 2 — Home page (editorial layout, no live data yet) ✅ DONE

**Goal:** the scrolling home narrative, static data only.

**Built:** global `SiteNav` (transparent → `--bg-0` blur on scroll, GitHub only —
LinkedIn hidden until its URL lands, no resume) + `SiteFooter` in the root layout;
`Hero` with the word-cycling accent word (masked slide, reduced-motion static
fallback); `SelectedWork` (featured cards), `ExperienceStrip` (real roles),
`BeyondCode` (honest static interest tiles) — all wired through reusable
`ProjectCard` / `TypePill` / `DomainPill` / `Reveal` primitives. Build + lint
clean; 375px has no horizontal scroll; every section DOM- and visually verified.

> **Preview-pane caveat (not a bug):** the in-app browser pane does **not** deliver
> `IntersectionObserver` callbacks (confirmed with a raw IO test — zero callbacks),
> and its programmatic-scroll screenshots come back black. So `whileInView` scroll
> reveals stay at `opacity:0` *in that pane only* — they fire normally in real
> browsers. To eyeball below-the-fold sections there, force-reveal via injected CSS
> (`[style*="opacity"]{opacity:1!important;transform:none!important}`) and hide the
> hero so the target section sits at scroll 0. Don't "fix" the reveals for this.

- **Nav:** minimal, transparent → slight `--bg-0` blur on scroll. Home / Projects
  / About / Now + GitHub + LinkedIn icons. **No resume link.**
- **Hero:** serif headline "Building the things I imagined as a kid." + sub-line
  with the **word-cycling** bracket (software development → machine learning →
  quantitative finance → research → …). Mask/typewriter reveal, reduced-motion
  static fallback.
- **Selected work teaser:** 3–4 featured project cards (from `featuredProjects`),
  each with one-line "why" + tags + hover micro-interaction. CTA → `/projects`.
- **Experience strip:** the real roles, sharp and professional (Model 1).
- **Beyond code teaser:** compact tiles (static placeholders now; live in Phase 6).
- **Footer:** GitHub + LinkedIn only.
- Scroll reveals via Motion (fade + 12–20px rise, staggered), Lenis smooth scroll.

**Resolves [CC-DECIDES]:** home personality-breadcrumb slot (placeholder until
Phase 6 data). Accent + hero copy are already LOCKED (see build note above), so
Phase 2 has no open content/design inputs — it's ready to build.

**Acceptance:** home renders full narrative; word-cycle animates and has a static
fallback; keyboard-navigable; no layout-property animation; Lighthouse LCP = hero
text; mobile 360px clean.

---

## Phase 3 — Projects system ✅ DONE

**Goal:** the portfolio — grid, filtering, detail pages, "why", BoxIt tease.

**Built:** `/projects` is a filterable grid — a `ProjectsGrid` client component
([src/components/projects/projects-grid.tsx](../src/components/projects/projects-grid.tsx))
with two AND-combined filters (the color-coded type tag + a domain tag), each only
offering tags present in the inventory, a live result count with a "clear filters"
affordance, and a real empty state (Research + Quant → 0, verified). Cards reflow via
motion `layout` + fade, collapsing to an instant swap under reduced motion; the grid
renders visible on mount (`initial={false}`, not `whileInView`) so it never depends on
IntersectionObserver. `/projects/[slug]`
([src/app/projects/[slug]/page.tsx](../src/app/projects/%5Bslug%5D/page.tsx)) is the
full story — header (type pill + status dot, title, one-liner, TODO-stripped
role/timeframe/team meta, Source/live links), the full "why" with a `draft` flag when
unreviewed, a data-pos metrics band, a stack list, and a demo placeholder (no videos
yet). **BoxIt** renders a redacted "In private beta" tease: `repoUrl` is null and no
Source link is emitted (verified — nothing private leaks), the only door is boxit.best.
Content mechanism stays typed TS (no MDX). Build + lint clean; 10 project pages SSG;
zero horizontal overflow at 375px; TODO fields never render.

> **Decision — [CC-DECIDES] content mechanism:** resolved to **typed TS content
> collection** (not MDX). Structured fields (tags, metrics, provenance) are the whole
> value; MDX only earns its place if `whyFull`/write-ups grow long-form later.

> **Header not motion-gated:** the detail-page header renders immediately (no `Reveal`
> wrapper) — it's above-the-fold primary content, same principle as the hero being LCP.
> Below-fold sections still use `Reveal`/`whileInView` (invisible in the preview pane
> per the Phase 2 IntersectionObserver caveat; fine in real browsers).

**Still needs Vaibhav's input (flagged in UI, never guessed):** the 6 draft "why"s;
`TODO(vaibhav)` tag calls (tariff Personal→Research?, imc Personal→Hackathon?, aquatic
Research↔Personal) and role/team/timeframe blanks; fork-contribution notes (clearRx,
aquatic-sustainability). None of these block the system — they surface as drafts/omitted.

- Confirm content mechanism (**[CC-DECIDES]**): typed TS content collection
  (current) vs MDX. Recommendation: keep typed TS for structured fields; add MDX
  only if `whyFull`/write-ups grow long.
- `/projects`: filterable grid by type + domain tag; project cards per STYLE.md
  (serif title, italic/muted "why", colored type pill + neutral mono domain pills,
  hover raise).
- `/projects/[slug]`: full story — full "why", stack, metrics, demo slot, gallery.
- **BoxIt "coming soon"** card: locked/redacted visual, badge, links `boxit.best`,
  repoUrl stays null. Verify no private detail leaks.
- YouTube demo slots render as **placeholders** (no videos yet).

**Resolves [CC-DECIDES]:** content mechanism; project inventory finalized.
**Needs input:** fork decisions (clearRx, aquatic-sustainability, RecipeTinder);
all `TODO(vaibhav)` "why"s and tag confirmations; Experience timeframes/one-liners.

**Acceptance:** grid filters correctly; every card has a one-line "why"; BoxIt
tease leaks nothing; detail pages SSG; no fabricated content ships (TODOs visible
or filled, never guessed).

---

## Phase 4 — The ONE signature interactive moment ✅ DONE

**Goal:** the single loud thing. Everything around it stays quiet.

**Built:** `LiquidityField` (`src/components/home/liquidity-field.tsx`) — a
market-depth chart rendered as living particle liquidity, behind the hero text.
Green bids (`--data-pos`) accumulate left of a drifting mid-price, violet asks
(`--accent`) right, forming the classic depth valley that rises into two walls; the
book breathes via summed sines (a few slow gaussian "liquidity walls"), and the
cursor **parts the liquidity** with a soft radial repulsion. Both colors read
straight off the palette (no red); a faint white mid seam marks the mid price.
Wired into `hero.tsx` via `dynamic(() => …, { ssr: false })` so it's a client-only
lazy chunk that never touches the hero-text LCP; hero text gets `relative z-10`.

> **[CC-DECIDES] signature choice → hybrid of the top-two candidates.** Vaibhav
> asked for a mix of market-depth **and** particle/vector field; the depth chart
> *rendered as* a particle field is exactly that — quant identity + the flowing
> beauty, in one. Chess remains the deferred smaller second moment (Phase 5/6).

> **[CC-DECIDES] renderer → Canvas 2D (not R3F).** Delegated to CC. Canvas suits
> this site's calm/one-accent ethos (a WebGL particle storm risks generic "cool
> dev site"), holds 60fps on mobile trivially, adds ~0 bundle, and gives a dead
> -simple static frame. Upgrade path to shader glow stays open if ever wanted.

**Discipline baked in:** pre-rendered glow sprites + `source-over` (hue preserved,
no white blow-out); `pointer-events:none` (never blocks selecting hero text);
IntersectionObserver + `visibilitychange` pause the loop when unseen; one frame
painted **synchronously** on mount *and after every resize* so the field is never
blank before/without a rAF tick; `prefers-reduced-motion` → single static frame,
no rAF, no listeners.

> **Preview-pane caveat (reconfirmed):** the in-app pane runs the page as a
> `document.hidden` document, which freezes `requestAnimationFrame` (and framer
> WAAPI mount anims). Verified instead via canvas pixel-buffer inspection
> (litFrac + per-color pixel counts) and forced-opacity screenshots. Behaves
> normally in a real browser. The synchronous-repaint-on-resize fix this surfaced
> is a genuine production robustness win, not just a pane workaround.

**Verified:** field draws both palette colors in the correct valley/wall shape,
desktop + mobile; hero headline + cycling role word fully legible over it; 0px
horizontal overflow at 375px; `next build` clean (home static, field splits to its
own chunk); lint clean.

**Resolves [CC-DECIDES]:** signature choice + renderer (both above).
**Still needs Vaibhav's input:** none blocking. The smaller non-quant moment (a
chess flourish, per PRD) is intentionally deferred to land alongside chess.com
live data (Phase 6). Live-browser 60fps spot-check is his to eyeball on deploy.

**Acceptance:** ✅ canvas 2D holds 60fps by construction (≤1000 sprites desktop /
340 mobile, `drawImage` only); ✅ static fallback under reduced motion; ✅ hero text
LCP unaffected (lazy `ssr:false`); ✅ within palette (data-pos + accent + faint
white seam only).

---

## Phase 5 — About + interest subpages + voice/copy

**Goal:** turn personality all the way up; write in Vaibhav's voice.

- `/about`: long-form, specific, warm — builder-since-childhood, cooking →
  sustainability → beekeeping → pollinator advocacy, debate (#19 nationally),
  poker, chess (~1300), piano, basketball.
- Decide (**[CC-DECIDES]**) which interests are full subpages vs inline tiles.
  Recommendation: **full pages** = movies (Letterboxd) + cooking (photos) +
  chess (live data); **inline** = music, running, poker, fantasy, debate — until
  they earn a page.
- Apply **humanizer discipline**: no AI-isms, no significance inflation, no
  rule-of-three padding, varied rhythm, first person, opinions.

**Resolves [CC-DECIDES]:** interest subpage split.
**Needs input:** About copy is Vaibhav's voice — draft for review, he edits;
approve which interests get full pages.

**Acceptance:** copy reads as a specific person, passes humanizer check; subpage
split matches available content/data; AA contrast; correct heading order.

---

## Phase 6 — Live-data modules (priority order)

**Goal:** the alive layer. Every module **fails gracefully** to a static fallback;
secrets server-side only; fetch via route handlers / server components with ISR.

1. **Letterboxd** (High, no auth) → `/about/movies` grid + home breadcrumb.
2. **Chess.com** (High, no auth) → home tile + `/about/chess`.
3. **YouTube** (High, **placeholders**) → project demo slots, real IDs later.
4. **Spotify** (Medium, OAuth + server refresh) → now-playing / top tracks.
5. **Strava** (Medium, OAuth + server refresh) → recent activity / running.
6. **Recipes** (Medium, manual) → `/about/cooking` gallery from in-repo images.
7. **ESPN Fantasy** (Stretch) → **do not build**; a lightweight interest mention only.

**Resolves [CC-DECIDES]:** which breadcrumb the home hero uses (recommend last
film or now-playing). **Needs input:** Letterboxd + Chess.com usernames; Spotify +
Strava app credentials/refresh tokens (Vaibhav generates — the OAuth flow is his
to run); confirm he's OK exposing which live signals.

**Acceptance:** each module renders real data when up and a tasteful static state
when down/empty (no broken/empty states); no secret reaches the client; ISR caching
in place.

---

## Phase 7 — Polish, a11y, performance, SEO/OG, deploy

**Goal:** ship it to the quality floor.

- Accessibility audit: keyboard focus everywhere, alt text, heading order,
  reduced-motion honored by every animation incl. the signature.
- Performance: **Lighthouse ≥ 90 mobile**; LCP = hero text, heavy JS/WebGL
  lazy-loaded; verify no layout-property animation slipped in.
- SEO/OG: per-page OG tags + default social card, `<title>`/meta, sitemap, robots.
- Deploy to Vercel; env vars set in Vercel; `.env.example` current.

**Acceptance:** Lighthouse ≥ 90 mobile (perf + a11y), AA contrast verified against
`--bg-0`, all pages have OG + title, sitemap/robots present, production deploy live.

---

## Dependency order note

The suggested phasing holds: **2 (home) before 4 (signature)** because the
signature lives in/after the hero and needs the hero layout to exist first; **3
(projects) before 6 (live data)** because YouTube demo slots attach to project
cards; **live data (6) after About (5)** because the subpages that consume it need
to exist. Phases 2, 3, and 5 are the most parallelizable if needed.

---

## Open questions blocking later phases (see chat summary for the full list)

Tracked here so nothing regresses; Phase 2 only needs the hero word list + accent
sign-off, so the biggest batch (forks, "why"s, roles, usernames, OAuth creds) can
come after home is up.
