# Letterboxd live-data module — design spec

**Date:** 2026-07-14
**Phase:** 6 (Live-data modules), module #1 of the priority order.
**Scope:** Replace the `ComingLive` placeholder on `/about/movies` with a real
poster grid driven by Vaibhav's public Letterboxd RSS feed, and add one live
"last watched" personality breadcrumb near the home hero. Both read from a single
server-side data layer. No auth (public RSS). Every surface fails gracefully to a
static fallback — never a broken/empty state.

## Motivation

The interest subpages were built in Phase 5 as honest placeholders; Phase 6 is the
"alive layer." Letterboxd is module #1 because it needs **zero OAuth** (public RSS)
and lights up two surfaces at once — the `/about/movies` grid and the home
breadcrumb the brand spec asks for ("a tasteful live detail — now-playing, last
film, or chess rating"). Film is also already Vaibhav's real handle (`@vaibzz`),
and his own copy frames Letterboxd as "the closest thing I keep to a diary."

## Confirmed feed facts (verified this session)

- `https://letterboxd.com/vaibzz/rss/` returns **HTTP 200** with a browser
  `User-Agent`, but **HTTP 403** with a default/automated fetcher UA. **The server
  fetch MUST send a browser-like `User-Agent` header.** This is the single most
  important implementation detail.
- Feed is well-formed XML, ~12 `<item>`s (a rolling recent-watches window).
- Per-item fields available:
  - `<title>` — e.g. `Good Will Hunting, 1997 - ★★★★★` (rating may be absent)
  - `<link>` — canonical Letterboxd film-review URL
  - `<letterboxd:watchedDate>` — `YYYY-MM-DD`
  - `<letterboxd:rewatch>` — `Yes`/`No`
  - `<letterboxd:filmTitle>` — clean title (no year/stars)
  - `<letterboxd:filmYear>` — release year
  - `<letterboxd:memberRating>` — `0.5`–`5.0` (absent if unrated)
  - `<letterboxd:memberLike>` — `Yes`/`No`
  - `<description>` — HTML; first `<img src>` is the poster (host `a.ltrbxd.com`),
    remaining text is the review note (optional).
  - `<dc:creator>` — username.
- Feed also carries non-film items in some accounts (list entries). Filter to items
  that have a `<letterboxd:filmTitle>` so only real film logs render.

## Decisions (locked with owner)

- **RSS parsing: hand-rolled, zero new dependency.** The feed shape is fixed and
  simple; parse with targeted per-item extraction rather than adding an XML-parser
  dependency (AGENTS.md flags this is a customized Next.js — keep supply-chain
  surface at zero).
- **Posters: hot-linked from Letterboxd's CDN via `next/image`.** No repo bloat,
  always-current art. Requires a `remotePatterns` entry for `a.ltrbxd.com`.
- **Grid size: render the full RSS window (~12), newest first**, on `/about/movies`.
- **Caching: ISR `revalidate: 3600`** (hourly) on the fetch.
- **Fallback: a small baked-in `FALLBACK_FILMS` snapshot** (3–4 real recent films)
  renders if the fetch fails or returns zero film items. Page never shows an error.

## Architecture

### `src/lib/letterboxd.ts` (server-only)

- `export type Film = { title, year, rating (number|null), liked (boolean),
  watchedDate (string), filmUrl, posterUrl (string|null), rewatch (boolean) }`.
- `const USERNAME = process.env.LETTERBOXD_USERNAME || "vaibzz"`.
- `const FALLBACK_FILMS: Film[]` — 3–4 real entries from the current feed (so the
  fallback is honest, not invented).
- `export async function getRecentFilms(limit = 12): Promise<{ films: Film[]; live:
  boolean }>`:
  1. `fetch(rssUrl, { headers: { "User-Agent": <browser UA>, Accept: ... },
     next: { revalidate: 3600 } })`.
  2. On non-OK / throw / empty → return `{ films: FALLBACK_FILMS.slice(0, limit),
     live: false }` (log server-side; never throw to the page).
  3. Parse items; keep only those with a `filmTitle`; map to `Film`; slice `limit`;
     return `{ films, live: true }`.
- Parsing helpers are pure and unit-checkable (string in → `Film` out). Poster URL
  extracted from the first `<img src="...">` in `<description>`; rating parsed from
  `<letterboxd:memberRating>`; HTML entities in titles decoded minimally (`&amp;`
  `&#39;` `&quot;` etc.).
- **Never** import this from a client component (keeps the UA/fetch server-side; no
  secret involved but the pattern stays server-only per the phase rule).

### `src/components/about/movies-grid.tsx` (presentational)

- Server component (no `"use client"` — pure render of passed data). Props:
  `{ films: Film[]; live: boolean }`.
- Responsive poster grid in the frosted design language: `grid grid-cols-2
  sm:grid-cols-3 md:grid-cols-4 gap-4` (tune live). Each card:
  - `next/image` poster (2:3 aspect, rounded, subtle frost/border), wrapped in an
    `<a href={filmUrl} target="_blank" rel="noreferrer">` with a hover lift
    (transform/opacity only; `motion-reduce` no-op).
  - Under the poster: title (serif), year + watched date (mono, `text-text-lo`),
    and a **star rating** rendered as filled/half/empty glyphs when `rating != null`
    (aria-label `"3.5 out of 5"`); a small "liked" heart when `liked`.
  - Poster-missing fallback: a frosted tile with the film title centered (never a
    broken `<img>`).
- When `!live`, render a quiet mono note above the grid: "Showing a recent snapshot"
  + a link to `@vaibzz on Letterboxd` (honest that it's the fallback), reusing the
  existing link affordance. When `live`, no such note.

### `src/app/about/movies/page.tsx`

- Becomes `export default async function MoviesPage()`. Calls `getRecentFilms()`,
  renders `<InterestSubpage …><MoviesGrid films live /></InterestSubpage>`. Keeps
  the existing voiced eyebrow/title/intro. Drops the `ComingLive` import/usage.
- Metadata unchanged.

### Home breadcrumb — `LastWatched`

- A small async server component (co-located, e.g.
  `src/components/home/last-watched.tsx`) that calls `getRecentFilms(1)` and renders
  one quiet line: `Last watched · <film> <stars>` linking to that film's Letterboxd
  page. Mono/`text-text-lo`, sits under the hero sub-line (or wherever it reads as a
  tasteful breadcrumb — tune in browser). Reduced-motion safe (no motion). If the
  fallback is in play it still renders honestly (the most recent fallback film).
- Placement: rendered from `src/app/page.tsx` / `hero` area. The hero is a client
  component, so `LastWatched` is rendered as a server child passed in or placed as a
  sibling under the hero in `page.tsx` (decide during build to keep the fetch
  server-side; do not make the hero fetch).

### `next.config.ts`

- Add `images: { remotePatterns: [{ protocol: "https", hostname: "a.ltrbxd.com" }] }`.
  (Confirm the actual poster host from live data — `a.ltrbxd.com` observed; add
  `*.ltrbxd.com` if variants appear.)

### `.env.example`

- `LETTERBOXD_USERNAME` already present. Add an inline note that it defaults to
  `vaibzz` if unset, and that the fetch requires a browser UA (documented for future
  maintenance). No secret — safe to default.

## Data flow

```
Letterboxd RSS (public)
   │  server fetch (browser UA, ISR 3600s)
   ▼
src/lib/letterboxd.ts  ──parse──▶  { films: Film[], live: boolean }
   │                                   │
   ├─▶ /about/movies (server page) ──▶ MoviesGrid  ──▶ next/image posters (a.ltrbxd.com)
   └─▶ home LastWatched (getRecentFilms(1)) ──▶ one breadcrumb line
        (both fall back to FALLBACK_FILMS when the fetch fails)
```

## Error handling / quality floor

- Fetch failure, non-200, malformed XML, or zero film items → `FALLBACK_FILMS`,
  `live: false`; page renders normally with the honest "recent snapshot" note.
- Individual poster load failure → title-only frosted tile (CSS/onError fallback).
- No client-side fetch, no spinner, no layout-shift: server renders resolved data or
  the fallback (SSG/ISR).

## Accessibility

- Each poster link has an accessible name (film title + year); star rating exposed
  via `aria-label`, glyphs `aria-hidden`. Liked heart `aria-hidden` with the state
  folded into the label if used. External links `rel="noreferrer"`, and indicate
  new-tab in the accessible name or a visually-hidden hint.
- Heading order under the existing `<h1>`; grid is a list semantically if practical.
- All hover motion is transform/opacity and `motion-reduce`-gated.

## Content honesty

- All films, ratings, dates come straight from the live feed. `FALLBACK_FILMS` uses
  **real** recent entries (not invented), and the fallback state is labeled as a
  snapshot so it's never passed off as live.

## Out of scope

- Chess.com, YouTube, Spotify, Strava, Recipes (later Phase-6 modules).
- The home interest **carousel** film panel stays as-is (static teaser); this build
  touches the `/about/movies` grid + the hero breadcrumb only.
- No pagination / infinite scroll / full watch history — just the recent RSS window.
- No reviews page; review text from `<description>` is not rendered in v1 (title +
  rating + poster only) to keep the grid clean. (Can revisit.)

## Testing / verification

- `npm run lint` + `npm run build` clean.
- With network: `/about/movies` renders the real poster grid (posters load via
  `next/image`, correct ratings/dates, newest first); the home breadcrumb shows the
  latest film. Verify the fetch sends a browser UA (no 403 in server logs).
- Fallback path: simulate failure (e.g. temporary bad username/URL) → grid renders
  `FALLBACK_FILMS` with the "recent snapshot" note, no error, no layout shift.
- Poster fallback: force a broken poster URL → title tile, not a broken image.
- Reduced motion + mobile widths: grid reflows (2 cols mobile), no motion; breadcrumb
  legible.
