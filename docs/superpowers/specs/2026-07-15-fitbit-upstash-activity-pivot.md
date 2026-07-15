# "Staying active" — Fitbit + Upstash pivot (from Strava)

**Date:** 2026-07-15
**Status:** Built
**Supersedes:** the Strava data source in `2026-07-15-strava-staying-active-design.md`
(UI/surfaces from that spec are unchanged).

## Why the pivot

Strava gated its API behind a paid subscription, so it's out. After surveying free
options (Fitbit ✓ but deprecating; Google Fit dead; wger ✓ but manual), the owner
chose **Fitbit Web API** for the runway it has, accepting its **Sept 2026
deprecation**, with a planned pivot to the **Google Health API** afterward. The
data layer is provider-abstracted so that swap is one file.

## Architecture

- **`src/lib/activity.ts`** — provider-agnostic contract: `ActivityWeek`,
  `ActivitySession`, `formatDuration`, and the single swap line
  `export { getFitbitWeek as getActivityWeek } from "./fitbit"`. All UI depends
  only on this. The Google Health pivot changes only this file + a new provider.
- **`src/lib/fitbit.ts`** — the current provider. Reads the last 7 days of logged
  activity, rolls up sessions + active time (+ distance where applicable).
- **`src/lib/redis.ts`** — minimal Upstash REST client over `fetch` (no npm
  dependency), used solely to persist Fitbit's rotating refresh token.

## The token problem (the reason Upstash exists)

Fitbit rotates its refresh token on every refresh (single-use; the old one dies),
so a static env var can't hold it. Solution:
- Redis key `fitbit:token` holds `{ access_token, refresh_token, expires_at }`.
- A render reuses the cached access token while valid (~8h life) — so refreshes
  happen only a few times a day, making the rotation race negligible.
- On refresh, the new pair is written back to Redis.
- **Bootstrap:** the first refresh token comes from `FITBIT_REFRESH_TOKEN` (a seed
  from `scripts/fitbit-auth.mjs`); after the first refresh, Redis is authoritative.
- **Race guard:** if a refresh fails (another render rotated the token first),
  re-read Redis for a freshly-stored valid access token before giving up.

## Data mapping

- Endpoint: `GET /1/user/-/activities/list.json?afterDate={7d-ago}&sort=asc&limit=50`
  (Fitbit requires `sort=asc` with `afterDate`; `summarizeWeek` re-sorts desc).
- Distances are metric (km) because we omit `Accept-Language`.
- `activityName` (e.g. "Weights", "Run") → session label; "Weights"/"WeightTraining"/
  "Workout" render as "Lift" in the panel.

## Fallback / graceful degradation

Missing creds, no datastore, API down, or a lost rotation race → the quiet-week
fallback (`live: false`), identical to a genuinely empty week. No surface ever
breaks. Verified: all three surfaces render "a quiet week" with no env set.

## Env vars

`FITBIT_CLIENT_ID`, `FITBIT_CLIENT_SECRET`, `FITBIT_REFRESH_TOKEN` (seed),
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Documented in `.env.example`.

## Owner setup (one-time)

1. Fitbit: dev.fitbit.com → Register an app (Personal, callback
   `http://127.0.0.1:8888/callback`, Read Only) → `node scripts/fitbit-auth.mjs`.
2. Upstash: console.upstash.com → free Redis DB → copy REST URL + token.

## Verification

- Lint + `tsc` clean; no residual Strava references.
- All three surfaces render the quiet-week fallback (no creds).
- Pure rollup logic unit-checked: 7-day windowing, session/time/distance sums,
  newest-first ordering, duration formatting all correct.
