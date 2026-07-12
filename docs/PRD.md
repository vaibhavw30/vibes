# PRD — Vaibhav Wudaru Personal Site

**Status:** Master spec. This is the full picture, not a phased plan. Phased implementation plans get derived from this later (via a writing-plans pass).

**Owner:** Vaibhav Wudaru
**Domain:** `vaibhavwudaru.com` (or `.org` — decide before DNS; keep wordmark domain-agnostic)
**Host:** Vercel (frontend). Framework: Next.js (App Router) + TypeScript + Tailwind.
**Build partner:** Claude Code. Several sections deliberately hand autonomy to Claude Code — those are marked **[CC-DECIDES]**.

---

## 1. What this site is

A personal site that does three jobs, weighted equally:

1. **Impress recruiters** (quant, SWE, ML) — credible, fast, real work shown with substance.
2. **Show projects + demos** — a living portfolio with real repos, write-ups, and recorded demos.
3. **Personal expression** — the interests, the taste, the person behind the resume.

The organizing idea, discovered during planning and worth stating because it should shape copy everywhere: **Vaibhav builds from noticed problems.** Every serious project started as something he observed and wanted to fix. The site should make that legible without ever stating it as a slogan.

### Non-goals

- No resume download anywhere. The resume is **not** a downloadable asset on this site. (Explicit owner decision.)
- No blog/CMS in v1 (can come later).
- No contact form. Conversion is GitHub + LinkedIn links only.
- Not a full WebGL game. One signature interactive moment plus 2–3 smaller interactive moments — restraint over spectacle.

---

## 2. Design direction (summary; full detail in STYLE.md)

**Blend of "editorial dark" + "interactive playground."** Governing rule: **calm canvas, alive objects.** The layout stays editorial and restrained — large serif headlines, generous negative space, one accent color, slow deliberate scroll reveals. The energy concentrates in a few interactive objects, not everywhere.

- **Mood:** dark, moody, high-contrast. Moderate motion.
- **Type:** Fraunces + Inter (primary preference) or Playfair Display + Inter (alt). Kept flexible; STYLE.md specifies. **[CC-DECIDES]** final lock between the two after seeing them in context.
- **Motion stack:** Motion (formerly Framer Motion) as primary; Lenis for smooth scroll; GSAP + ScrollTrigger reserved for the ONE signature scroll sequence only. Animate `transform`/`opacity` only.
- **Caution:** "near-black + single bright accent" is a known AI-default look. Avoid the templated version by (a) using a refined multi-step dark palette rather than pure #000, (b) letting typography and the signature moment carry identity, (c) never leaning on a single neon accent as the whole personality. See STYLE.md.

---

## 3. Information architecture

Hybrid: a scrolling **Home** plus deep pages **About**, **Now**, **Projects**, and interest **subpages** under About.

```
/                 Home (scrolling narrative)
/projects         Full filterable project grid
/projects/[slug]  Project detail (full story + "why" + demo)
/about            Expansive personal page (personality lives here)
/about/movies     Interest subpage — Letterboxd-driven
/about/cooking    Interest subpage — recipe photo gallery
/about/[interest] Additional interest subpages [CC-DECIDES] which get their own page vs. inline
/now              What Vaibhav is working on / thinking about right now
```

**[CC-DECIDES]:** exact set of interest subpages. Candidates: movies, cooking, chess, music, running, basketball/fantasy. Some become full subpages; lighter ones stay inline on `/about`. Claude Code proposes the split based on how much content/live-data each has.

---

## 4. Home page — section by section

Home is a scrolling narrative. Each section is a "scene" with a scroll-triggered reveal (respecting reduced-motion).

### 4.1 Hero

- **Headline (large serif):** "Building the things I imagined as a kid."
- **Sub-line (sans):** "Georgia Tech CS student interested in `[software development]`" where the bracketed word **cycles/animates** through: software development → machine learning → quantitative finance → research → and more. (Word-cycling animation; typewriter or mask-reveal — see STYLE.md.)
- **Signature interactive moment lives here or immediately after** (see §6).
- Minimal nav: Home / Projects / About / Now, plus GitHub + LinkedIn icons.
- Personality breadcrumb: a small, tasteful live/personal detail (e.g. "currently listening to …" or "last watched …") tucked in — a hint of the personal layer without cluttering the hero. **[CC-DECIDES]** which breadcrumb.

### 4.2 Selected work (teaser)

- 3–4 highlighted projects as large editorial cards (not the full grid).
- Each card: title, one-line **"why"** (the problem that motivated it), type tag + domain tags, hover micro-interaction.
- CTA into `/projects`.

### 4.3 Experience strip

- The real roles, briefly: DataMorph (internship), OddsAreOn (founding engineer), Trustworthy Robotics (research), GTSF (incoming quant analyst/dev), EPIC (incoming). Role / org / timeframe / one line.
- This section carries recruiter credibility. Keep it sharp and professional.

### 4.4 Beyond code (interests teaser)

- A compact, alive preview of the personal layer: a few live modules (now-playing, last film, current chess rating) as small reactive tiles.
- CTA into `/about`.

### 4.5 Footer

- GitHub, LinkedIn. Email optional (owner: only GitHub + LinkedIn required). Built-with note optional. No resume link.

---

## 5. Projects

### 5.1 Architecture — **[CC-DECIDES]** with recommended default

**Recommended default (Model 1):** an **Experience** section (real roles, weighted) separate from a **Projects** grid (self-driven builds). Rationale: honestly separates a paid internship / founding role / research position from weekend builds; mirrors the resume's own logic. Claude Code may adjust after enumerating the repos, but should preserve the distinction between professional roles and personal projects.

### 5.2 Tag taxonomy (controlled vocabulary — do not expand casually)

Two tag types per project:

- **Type tag — exactly one:** `Internship` · `Founding` · `Research` · `Personal` · `Hackathon`
- **Domain tags — 1 to 3:** `Quant` · `ML/AI` · `Systems/Backend` · `Full-Stack` · `Data` · `Infra/Cloud` · `Frontend` · `Applied-Research`

Color-code visuals off the **type** tag (max 5 colors). Domain tags stay neutral. Cap domain tags at 3 per card to avoid clutter. Example — BoxIt: `Personal` (type) + `Systems/Backend`, `Full-Stack`, `Infra/Cloud` (domain).

### 5.3 The "why" statement (signature feature)

Every project has a mission statement — _why this problem_, not what tech.

- **On the card:** a brief one-liner.
- **On the detail page:** the full story.

Known "why"s (use verbatim as source of truth; refine tone, keep substance):

- **Tariff modelling:** fascination with how huge macro movements ripple through sectors and change market structure.
- **EquiTable:** noticed Atlanta's food-insecurity problem driven by a lack of understanding and connection between food banks; wanted to bridge that.
- **BoxIt:** as an out-of-state student, saw how expensive, inconvenient, and low-trust college storage is — and that students would want to earn money hosting storage themselves.
- Others: **[CC-DECIDES]** — Claude Code drafts a "why" per project from the repo README + resume context, in Vaibhav's voice, for his review. Never fabricate motivation; if unknown, leave a clearly-marked TODO for Vaibhav to fill.

### 5.4 Project data model

Each project is a structured record (MDX or a typed content collection — **[CC-DECIDES]** the mechanism):

```
slug, title, oneLiner, whyShort, whyFull,
typeTag, domainTags[],
role, timeframe, team,
stack[], metrics[],
repoUrl (nullable — private repos omit),
demoUrl (nullable), youtubeUrl (nullable),
status: "shipped" | "in-progress" | "coming-soon",
coverImage, gallery[]
```

### 5.5 GitHub enumeration — **[CC-DECIDES]**, required first step

Before hardcoding any project list, Claude Code must **enumerate all repos** on `github.com/vaibhavw30` via the `gh` CLI or GitHub API — public repos AND the private `boxit` repo (Vaibhav grants access). For each: pull README, primary language, stars, last-updated. Use this to build the project inventory rather than a static list, so the site stays current.

Known repos to expect (non-exhaustive; verify against the API): `benchwarmer` (NBA predictor), `FirstWave` (EMS staging), `EquiTable` (food rescue), `aquatic-sustainability` (GT Big Data watershed, fork), `clearRx` (Rx interaction dashboard, fork), `RecipeTinder` (fork), `tariff-modelling`, `nba-holistic-predictor`, plus others. **Forks:** include only if Vaibhav contributed meaningfully (e.g. clearRx, aquatic-sustainability); otherwise omit. Flag forks for Vaibhav's confirmation.

### 5.6 BoxIt tease (special case)

BoxIt's repo is private and must NOT be exposed. Render it as a **locked / "coming soon" card** in the appropriate category:

- Title: BoxIt. Status badge: "Coming soon."
- Link: `boxit.best` (external, the live product) — not the repo.
- Description drawn from resume: peer-to-peer college storage marketplace; React Native + AWS Lambda + Supabase (Postgres) + Stripe Connect; GPS geo-fenced handshake; edu-email auth.
- Visual treatment: redacted/blurred or lock-iconed to build intrigue. Tasteful, not gimmicky.

---

## 6. The signature interactive moment — **[CC-DECIDES]**

Spec **multiple** concepts; Claude Code builds ONE as the primary signature, and may add 1–2 smaller interactive moments elsewhere. At least one concept should tie to a **non-coding interest** so the signature isn't purely "quant guy."

Concept candidates (Claude Code picks + refines):

1. **Market-depth / order-book field** — an ambient, cursor-reactive visualization evoking market microstructure. On-brand for quant. WebGL or canvas.
2. **Particle/vector field** — cursor-reactive particle system that subtly forms shapes (e.g. resolves into his initials or a project glyph on interaction).
3. **Chess-driven moment** — an interactive board or a knight's-tour / opening-tree animation, tying to the chess interest. Non-coding-interest option.
4. **"EV table" toy** — a small interactive poker/EV or fantasy-football visualization the user can poke — ties to poker/fantasy interests. Non-coding-interest option.
5. **Generative moment from a real project** — e.g. an animated version of the tariff PCA factor collapse, or the EMS coverage-optimization map. Ties the signature to real work.

Requirements for whichever is chosen:

- 60fps, `transform`/`opacity` only, GPU-friendly.
- Fully degrades under `prefers-reduced-motion` (static fallback).
- Mobile-safe (either works on touch or gracefully simplifies).
- Never blocks content or hurts LCP — lazy-load, don't gate the hero text on it.
- GSAP + ScrollTrigger allowed here if it's a scroll sequence; otherwise Motion/canvas/R3F.

---

## 7. Live-data modules

All live modules must **fail gracefully** — if an API is down or returns nothing, render a tasteful static fallback, never a broken/empty state. Fetch server-side (Next.js route handlers or server components), cache/ISR where possible, never expose secrets client-side.

| Module           | Source                                         | Auth                                | Notes                                                                                                                                                                 | Priority           |
| ---------------- | ---------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Letterboxd**   | RSS: `letterboxd.com/USERNAME/rss/`            | none                                | Parse at build/ISR. Recent films, posters, star ratings, reviews. Powers `/about/movies` + a home breadcrumb.                                                         | High               |
| **YouTube**      | YouTube Data API v3                            | API key                             | Demos for projects. **No videos recorded yet — build with placeholders**, wire real IDs later.                                                                        | High (placeholder) |
| **Chess.com**    | Public API `api.chess.com/pub/player/USERNAME` | none                                | Current ratings, recent games. Powers a home tile + `/about/chess`. (Lichess API is an alt if he plays there.)                                                        | High               |
| **Spotify**      | Web API                                        | OAuth + refresh token (server-side) | Now-playing + top tracks. Real setup; owner OK with it.                                                                                                               | Medium             |
| **Strava**       | Strava API                                     | OAuth + refresh token (server-side) | Recent activity / running. Owner OK with it.                                                                                                                          | Medium             |
| **Recipes**      | Repo folder (manual)                           | none                                | Photo gallery of dishes he's made. Images live in-repo; he populates over time. Powers `/about/cooking`.                                                              | Medium             |
| **ESPN Fantasy** | Unofficial API                                 | league cookie, fragile              | **Stretch.** Don't build the full integration. Include a lightweight _mention_ of fantasy football as an interest so it's represented without the brittle dependency. | Stretch            |

Secrets: all API keys/tokens in Vercel env vars. A `.env.example` documents required keys. Never commit secrets. OAuth refresh flows (Spotify/Strava) run server-side only.

---

## 8. About & interest subpages

`/about` is where personality is turned up (per calibration: home = tasteful breadcrumbs, About = full personality, Work = sharp/professional).

- Longer-form intro in Vaibhav's voice — who he is beyond the resume: builder-since-childhood, the cooking→sustainability→beekeeping thread, competitive debate, poker, chess, basketball, fantasy football, piano.
- Interest subpages (**[CC-DECIDES]** which are full pages vs inline):
  - `/about/movies` — Letterboxd grid.
  - `/about/cooking` — recipe photo gallery (repo images) + short notes.
  - Others (chess, music, running) either full subpages (if live data justifies) or inline tiles.
- The personal writing should be specific and voiced, not generic. Reuse the real material: cooking with whole ingredients → sustainable garden → beekeeping → farmers'-market pollinator advocacy; debate (#19 nationally); poker; chess (1300).

---

## 9. Now page

`/now` — a living snapshot of current focus (the "now page" convention). What he's building, reading, learning, listening to right now. Can pull some live data (current Spotify/Chess) plus hand-written current-focus notes. Low-maintenance by design; a few lines he updates periodically.

---

## 10. Content & copy principles

- **Voice:** warm + lightly winking on personal surfaces; sharp and plain on Work. Active voice. Sentence case. Specific over clever.
- **Apply the humanizer discipline** (owner preference): no AI-isms, no significance inflation, no rule-of-three padding, vary sentence rhythm, have opinions, first person where natural.
- **The "why" statements are the soul** — protect their specificity. They're about problems noticed, not tech used.
- Copy is design material. Empty states are invitations. No filler.

---

## 11. Accessibility & quality floor (non-negotiable)

- Responsive to mobile (360px up).
- Visible keyboard focus everywhere.
- `prefers-reduced-motion` respected by every animation, including the signature moment (static fallback).
- Color contrast AA on the dark palette (verify text tokens against near-black).
- Semantic HTML, alt text on images, proper heading order.
- Lighthouse: performance ≥ 90 on mobile. LCP not gated on heavy JS/WebGL.

---

## 12. Analytics & SEO (brief — not a focus)

- Vercel Analytics (privacy-friendly) — light touch.
- Per-page OG tags + a default social card. Sensible `<title>`/meta. Sitemap + robots.
- That's it for v1. No heavy tracking.

---

## 13. Tech stack (summary)

- Next.js (App Router) + TypeScript + Tailwind.
- Motion (Framer Motion) + Lenis + GSAP/ScrollTrigger (signature only).
- shadcn/ui for base components, themed dark. Optional: React Three Fiber (signature), Lottie/Rive (accents).
- Content: MDX or typed content collections for projects **[CC-DECIDES]**.
- Deploy: Vercel. Secrets in env vars; `.env.example` committed.

---

## 14. Explicit decisions log (so nothing regresses)

- No downloadable resume, anywhere.
- Conversion = GitHub + LinkedIn only. No contact form.
- Private `boxit` repo never exposed; teased via `boxit.best` "coming soon" card.
- One signature interactive moment + 2–3 smaller; not a full WebGL game.
- YouTube launches with placeholders (no videos recorded yet).
- ESPN Fantasy is stretch; represent the interest lightly regardless.
- Every project has a "why" (brief on card, full on detail).
- Type tag (1) + domain tags (1–3) from the controlled vocabulary; color off type tag.
- Model 1 (Experience vs Projects) is the default; Claude Code may refine but preserves the professional/personal distinction.
- Claude Code enumerates GitHub as step one rather than using a hardcoded list.
