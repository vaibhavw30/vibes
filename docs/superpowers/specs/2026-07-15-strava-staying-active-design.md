# Strava "Staying active" live-data module — design

**Date:** 2026-07-15
**Status:** Approved
**Phase:** 6, module #4 (2nd OAuth). Mirrors the Spotify module's shape.

## Goal

Surface a live "Staying active" feed from Strava (gym/lifting sessions, plus any
runs/rides) across three surfaces: the `/now` live strip, the home hero
breadcrumb, and a new `/about/training` subpage. Weekly rollup framing —
**sessions + active time** (lifting has no distance), with distance shown only
when there's a distance sport in the mix.

## Context / honesty notes

- **24GO / 24 Hour Fitness has no public API** — Strava is the only viable source.
  Strava natively supports `WeightTraining` / `Workout` activity types, logged
  via a watch or a manual entry.
- Vaibhav does not log lifts on Strava *yet* but will from now on. So the honest
  initial state is a **quiet week** (0 sessions); the module must render that as a
  deliberate, calm state ("a quiet week — nothing logged"), never "0 km" or empty.
- Same OAuth division of labor: the agent writes code + helper + steps; the user
  creates the Strava app and clicks Authorize.

## Non-goals

- No per-workout detail pages, maps, or splits (YAGNI).
- No calendar-week timezone gymnastics — "this week" = a rolling 7-day window.
- No new dependencies; secrets server-side only.

## Data layer — `src/lib/strava.ts`

### Types

```ts
export type StravaActivity = {
  name: string;
  type: string;         // "WeightTraining" | "Run" | "Ride" | "Workout" | ...
  distanceKm: number;   // 0 for non-distance sports
  movingTimeMin: number;
  date: string;         // ISO start date
  url: string;          // strava.com/activities/{id}
};

export type StravaWeek = {
  activityCount: number;
  movingTimeMin: number;
  distanceKm: number;   // sum across the week (0 if all non-distance)
  activities: StravaActivity[]; // most-recent-first, within the last 7 days
  live: boolean;        // false = no creds / API down
};
```

### Auth + fetch

- Env: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`. If any
  missing → static fallback (no network call).
- Token: `POST https://www.strava.com/oauth/token` with `grant_type=refresh_token`
  (+ client id/secret). `next: { revalidate: 3600 }`.
  - **Caveat:** Strava *may* rotate the refresh token on refresh. In practice it's
    stable for personal integrations; if the feed ever goes stale, re-mint. Noted
    in `.env.example`.
- Activities: `GET /api/v3/athlete/activities?per_page=30` with the bearer token,
  `next: { revalidate: 3600 }`.
- Filter to activities whose `start_date` is within the last 7 days (uses
  `new Date()` — allowed in server-component app code). Roll up count, moving time
  (sec→min), distance (m→km). Map each to `StravaActivity` (url =
  `https://www.strava.com/activities/{id}`).
- Any thrown error / non-ok → static fallback (`live: false`).

### Fallback

`{ activityCount: 0, movingTimeMin: 0, distanceKm: 0, activities: [], live: false }`
— which is exactly the honest current state (quiet week). Once creds + logged
sessions exist, `live: true` with real data.

### Export

```ts
export async function getStravaWeek(): Promise<StravaWeek>;
```

## Shared line component — `src/components/live/staying-active-line.tsx`

Pure render of a `StravaWeek`, reused by `/now` and the home hero. Mono line,
"last watched" idiom:

- `activityCount === 0` → `Staying active · a quiet week` (plain text, no link).
- else → `Staying active · {n} session{s} this week · {Hh Mm}` (+ ` · {km} km`
  only when `distanceKm > 0`). Linked to the most recent activity's URL.

A `formatDuration(min)` helper renders `"3h 20m"` / `"45m"`.

## `/about/training` subpage

- New route `src/app/about/training/page.tsx` — `async`, calls `getStravaWeek()`,
  renders inside `InterestSubpage` (eyebrow "About · Staying active", title +
  intro in Vaibhav's voice, drafted from confirmed facts).
- Panel `src/components/about/staying-active-panel.tsx`:
  - This-week stat cards (frost, like chess `RatingCard`): **Sessions**, **Active
    time**, and **Distance** (only when > 0).
  - Recent sessions list (like chess `GameRow`): name · type · time (· distance),
    date, linked to the activity.
  - Quiet-week empty state: honest line, "Nothing logged this week — just getting
    the habit going." Never a broken/empty panel.
  - `!live` note (mono), same pattern as chess.
- New interest tile in `src/content/about.ts`: `{ slug: "training", label:
  "Staying active", blurb: <draft, his voice>, href: "/about/training", live:
  true }`. Blurb drafted from confirmed facts (starting to log lifts), for his edit.

## Home hero breadcrumb

`src/app/page.tsx`: pass both breadcrumbs stacked into the hero's single slot —
`breadcrumb={<><LastWatched /><StayingActiveLine week={await getStravaWeek()} /></>}`.
Two tight mono lines. (Dial back to one if it reads heavy — flag for review.)

## OAuth setup — user's steps + `scripts/strava-auth.mjs`

Zero-dep helper mirroring the Spotify one:
1. Create an app at strava.com/settings/api. Set **Authorization Callback Domain**
   to `127.0.0.1`. Copy Client ID + Client Secret.
2. `STRAVA_CLIENT_ID=… STRAVA_CLIENT_SECRET=… node scripts/strava-auth.mjs` →
   prints an authorize URL (scope `activity:read_all`, redirect
   `http://127.0.0.1:8888/callback`) → user clicks Authorize → script exchanges
   the code and prints the refresh token.
3. Paste all three into `.env.local` (gitignored) and later Vercel env vars.

## `.env.example`

Refine the existing Strava block: setup steps, scope, callback-domain note, and
the refresh-token-rotation caveat.

## Constraints (carried)

- Never fabricate: subpage intro + tile blurb are drafted from confirmed facts,
  his edit before ship. Quiet-week state is truthful.
- Fail gracefully; secrets server-side only; zero new deps; reskin discipline;
  animate transform/opacity/color only.

## Verification

- Build/lint/types clean.
- With no token: all three surfaces render the calm "quiet week" state; no
  console/build errors.
- After the user mints a token + logs a session: the line/panel go live
  (`live: true`, real session count).
