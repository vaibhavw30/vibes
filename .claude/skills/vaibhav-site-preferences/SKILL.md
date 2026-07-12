---
name: vaibhav-site-preferences
description: Vaibhav Wudaru's personal site preferences, voice, content rules, and hard constraints. Use on EVERY task touching his personal website (vaibhavwudaru.com) — components, copy, project data, live-data modules, About/interest pages. Encodes the locked decisions from the PRD so every session stays on-brand: the "build from noticed problems" through-line, the project "why" statements, tag taxonomy, no-resume-download rule, BoxIt privacy, live-data list, and his writing voice. Read alongside dark-editorial-motion and the PRD/STYLE docs.
---

# Vaibhav's site preferences

Personal-brand and content rules for `vaibhavwudaru.com`. Pair with the `dark-editorial-motion` skill (the look/motion) and `PRD.md` / `STYLE.md` (the spec). This file is the "who and what" — voice, content, and hard constraints specific to Vaibhav.

## Who this is for

Vaibhav Wudaru — Georgia Tech CS student (4.0, Math minor, grad May 2028). Works across **software engineering, machine learning research, and quantitative finance**, plus real range: founding engineer (OddsAreOn), SWE intern (DataMorph), researcher (Trustworthy Robotics; incoming EPIC), incoming quant (GTSF). Outside code: cooking, poker, chess (~1300), basketball, fantasy football, piano, film, competitive debate (#19 nationally). Based between the Bay Area and Atlanta.

## The through-line (shapes all copy)

**Vaibhav builds from noticed problems.** Every serious project started as something he observed and wanted to fix. Never state this as a slogan — let it show through the project "why" statements and the About voice.

## Hard constraints (never violate)

- **No downloadable resume anywhere on the site.** Not in nav, footer, or any page.
- **Conversion is GitHub + LinkedIn only.** No contact form, no email requirement.
- **The `boxit` repo is PRIVATE — never expose it.** BoxIt appears only as a "coming soon" card linking to `boxit.best` (the live product), described from resume facts (peer-to-peer college storage marketplace; React Native + AWS Lambda + Supabase/Postgres + Stripe Connect; GPS geo-fenced handshake; edu-email auth). Redacted/lock visual treatment.
- **Never fabricate.** No invented metrics, motivations, or facts. If a project's "why" or a metric is unknown, leave a clearly-marked `TODO(vaibhav)` — don't guess.
- **Honesty on contributions:** on FirstWave/EMS, Vaibhav was frontend lead (React + Mapbox dashboard + FastAPI integration), not the ML pipeline author. Represent real roles accurately; flag forks (clearRx, aquatic-sustainability) for confirmation and only include where he contributed.

## The signature content feature: project "why" statements

Every project carries a mission statement about **the problem that motivated it**, not the tech. Brief on the card, full story on the detail page. Known "why"s (source of truth — keep the substance, refine tone into his voice):
- **Tariff modelling:** fascinated by how huge macro movements ripple through sectors and reshape market structure.
- **EquiTable:** noticed Atlanta's food-insecurity problem driven by disconnected food banks and lack of understanding; wanted to bridge that gap.
- **BoxIt:** as an out-of-state student, saw college storage is expensive, inconvenient, and low-trust — and that students would want to earn money hosting storage.
- Other projects: draft a "why" from the repo README + resume context in his voice, for his review. Never invent motivation.

## Tag taxonomy (controlled — don't expand casually)

- **Type tag — exactly one:** `Internship` · `Founding` · `Research` · `Personal` · `Hackathon`. Color-code visuals off this (max 5 colors).
- **Domain tags — 1 to 3:** `Quant` · `ML/AI` · `Systems/Backend` · `Full-Stack` · `Data` · `Infra/Cloud` · `Frontend` · `Applied-Research`. Neutral color. Cap at 3 per card.

## Work architecture

Default to **Model 1**: an Experience section (real roles — internship, founding, research, incoming quant) separate from a Projects grid (self-driven builds). You may refine after enumerating repos, but preserve the professional/personal distinction so the internship and founding roles aren't flattened into hackathon builds. **Enumerate GitHub (`github.com/vaibhavw30`) as step one** via `gh`/API — public repos and the private `boxit` — rather than hardcoding a list.

## Hero & positioning

- **Headline (large serif):** "Building the things I imagined as a kid."
- **Sub-line (sans):** "Georgia Tech CS student interested in ___" where ___ **cycles/animates** through: software development → machine learning → quantitative finance → research → and more.
- Personality breadcrumb somewhere on home (a tasteful live detail — now-playing, last film, or chess rating).

## Voice

- **Home:** tasteful, mostly sharp; small personal breadcrumbs allowed.
- **Work/Experience:** sharp, plain, professional. Real metrics, no fluff.
- **About / interests:** full personality — warm, specific, lightly winking. This is where the person shows.
- Apply humanizer discipline: no AI-isms, no significance inflation, no rule-of-three padding, vary sentence rhythm, have opinions, first person where natural. Specific over clever. Sentence case. Active voice.
- Real personal material to draw on (accurately): cooking with whole ingredients → sustainable garden → beekeeping → farmers'-market pollinator advocacy; competitive debate (#19 nationally, #3 Berkeley); poker (top-30 quant-club tournament); chess (~1300); basketball; fantasy football; piano.

## Live-data modules (fail gracefully; secrets server-side only)

- **Letterboxd** (RSS `letterboxd.com/USERNAME/rss/`, no auth) — film grid, powers `/about/movies` + a home breadcrumb.
- **YouTube** (Data API) — project demos. **No videos recorded yet — build with placeholders**, wire real IDs later.
- **Chess.com** (public API) — rating + recent games, home tile + `/about/chess`.
- **Spotify** (OAuth + server-side refresh) — now-playing / top tracks.
- **Strava** (OAuth + server-side refresh) — recent activity.
- **Recipes** — manual photo gallery from a repo folder, powers `/about/cooking`.
- **ESPN Fantasy** — STRETCH only; don't build the brittle integration, but mention fantasy football as an interest so it's represented.

Every module needs a tasteful static fallback for when the API is empty/down. Never render a broken/empty state. Keys/tokens in Vercel env vars; document in `.env.example`.

## Pages

`/` home (scrolling), `/projects` (filterable grid), `/projects/[slug]` (detail + full "why" + demo), `/about` (expansive, personal, interest subpages like `/about/movies`, `/about/cooking`), `/now` (current focus). You decide which interests get full subpages vs inline tiles based on available content/live-data.

## When unsure

Prefer the quieter option. Protect the specificity of the "why" statements and the About voice — they're the soul of the site. If a choice would make the site read as a generic dark template, pull identity back into typography and the one signature moment instead.
