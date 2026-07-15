# Spotify live-data module + `/now` page — design

**Date:** 2026-07-14
**Status:** Approved (defaults + honesty)
**Phase:** 6, module #3 (OAuth). Third live-data module after Letterboxd and Chess.com.

## Goal

Build the Spotify now-playing live-data layer and surface it by building out the
`/now` page (currently a `PageStub`). The page becomes a low-maintenance "now
page" (the convention): a small live strip (listening + chess) plus a short,
hand-written **current focus** section.

## Non-goals

- No top-tracks / listening-history grid (YAGNI — the now-playing line is enough).
- No client-side Spotify calls. All auth and fetch are server-side.
- No new dependencies (zero-dependency convention; secrets server-side only).
- The OAuth **authorization** (login, consent, token mint) is the user's action,
  not the agent's. The agent ships code + a helper script + written steps only.

## Architecture

Mirror the proven `letterboxd.ts` / `chess.ts` shape: a server-only data layer
that fetches on the server with ISR, and **always** returns a usable result —
`live: true` on success, a truthful static snapshot with `live: false` on any
failure or missing credentials. The page never renders a broken/empty state.

```
src/lib/spotify.ts            server-only data layer (OAuth refresh + fetch + fallback)
src/components/now/now-playing.tsx   presentational listening line (server component)
src/app/now/page.tsx          rewritten: live strip (listening + chess) + current focus
scripts/spotify-auth.mjs      zero-dep local helper to mint a refresh token (user runs once)
.env.example                  refine the Spotify block notes
```

## Data layer — `src/lib/spotify.ts`

### Types

```ts
export type NowPlaying = {
  isPlaying: boolean;      // true = playing right now; false = most recent track
  track: string;
  artist: string;
  album: string;
  albumArt: string | null; // URL of the smallest sufficient image, or null
  url: string;             // open.spotify.com track link
  live: boolean;           // false = static fallback (no creds / API down)
};
```

### Auth (server-side refresh-token flow)

- Read `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` from
  env. If any is missing → return the static fallback (no network call).
- `POST https://accounts.spotify.com/api/token` with
  `Authorization: Basic base64(client_id:client_secret)`,
  body `grant_type=refresh_token&refresh_token=...`. Returns a short-lived
  `access_token`. Cache the token request with `next: { revalidate: 30 }` so we
  don't hammer the token endpoint.

### Fetch (with graceful chain)

1. `GET https://api.spotify.com/v1/me/player/currently-playing` with the bearer
   token, `next: { revalidate: 30 }`.
   - `200` + an `item` → `isPlaying: true`, map the track.
   - `204` (nothing playing) → fall through to step 2.
2. `GET https://api.spotify.com/v1/me/player/recently-played?limit=1` →
   `isPlaying: false`, map `items[0].track`.
3. Any thrown error / non-ok / empty → static fallback (`live: false`).

`albumArt` = `item.album.images` — pick a small image (last in the array is
smallest) or `null`. `url` = `item.external_urls.spotify`.

### Export

```ts
export async function getNowPlaying(): Promise<NowPlaying>;
```

### Fallback (honest static snapshot)

A real, recently-played track (captured now, `live: false`) so the line reads
"Last played · …" and is never empty. `TODO(vaibhav)`: confirm/replace the
placeholder track with a genuinely representative one before ship.

## Component — `src/components/now/now-playing.tsx`

Server component, presentational, pure render of a `NowPlaying`. Matches the
"last watched" breadcrumb idiom (quiet mono eyebrow + a line). Structure:

- A small mono uppercase eyebrow: `LISTENING NOW` when `isPlaying`, else
  `LAST PLAYED`.
- A line: `{track}` · `{artist}` — the whole thing is an `<a>` to `url`
  (`target="_blank" rel="noreferrer"`), hover lifts to `text-text-hi`.
- Optional small square album art (`next/image` or plain `<img>` with fixed
  size, `alt=""` decorative) to the left if `albumArt` is present.
- No `live: false` badge on the line itself (keeps it quiet); honesty is carried
  by the "Last played" label + the page-level note (see below).
- Animate color only; no entrance motion of its own (the page wraps sections in
  `Reveal`).

## Page — `src/app/now/page.tsx`

Rewrite the stub into an `async` server component.

- **Metadata:** keep title "Now", description as-is.
- **Header:** eyebrow "Now", title "What I'm on right now.", a dateline
  (`Updated July 2026`), and one sentence explaining the now-page convention
  (adapted from the stub's existing note copy).
- **Live strip** (two quiet lines in a frosted panel or simple stack):
  - Listening → `<NowPlaying {...await getNowPlaying()} />`
  - Chess → a compact one-liner from `await getChessProfile(1)`: e.g.
    "Chess · {blitz.current} blitz · last game {W/L/D} vs {opponent}". Reuse the
    existing lib; render inline (no need for the full `ChessLive` panel here).
- **Current focus:** a short hand-written section — a few labelled lines
  (Building / Next / Off-screen). Drafted ONLY from confirmed facts, with
  `TODO(vaibhav)` blanks where the current real status is unknown. The user edits
  before ship. Draft:
  - **Building** — this site (vaibhavwudaru.com), in the open.
  - **Next** — heading into research at Georgia Tech's EPIC lab and a quant seat
    at GTSF. `TODO(vaibhav): confirm timing / phrasing.`
  - **Right now** — `TODO(vaibhav): what you're actually spending this summer on
    (internship? project? course?) — I won't guess.`
  - **Off-screen** — chess (stuck ~1300 and stubborn about it), cooking from the
    garden, piano. `TODO(vaibhav): trim to what's true this month.`
- **Honesty note:** a small mono line at the bottom of the live strip when either
  feed is a fallback — reuse the established pattern ("Showing a recent
  snapshot").

## OAuth setup — the user's steps (documented, agent does not perform)

Delivered as `scripts/spotify-auth.mjs` (zero-dep, Node built-ins only) + steps:

1. Create an app at developer.spotify.com/dashboard (user's login). Add redirect
   URI `http://127.0.0.1:8888/callback`. Copy Client ID + Client Secret.
2. Run `SPOTIFY_CLIENT_ID=… SPOTIFY_CLIENT_SECRET=… node scripts/spotify-auth.mjs`.
   The script prints an authorize URL (scopes
   `user-read-currently-playing user-read-recently-played`), starts a local
   server on `127.0.0.1:8888`, the **user** opens the URL and clicks Authorize,
   the script catches the redirect, exchanges the code, and prints the
   **refresh token**.
3. User pastes all three values into `.env.local` (gitignored) and later into
   Vercel env vars. Never committed.

The script never stores secrets; client id/secret come from env at run time, the
refresh token is only printed to the user's terminal.

## Constraints (carried from project rules)

- Never fabricate: the current-focus prose is drafted from confirmed facts with
  explicit `TODO(vaibhav)` markers; the user owns the final words.
- Fail gracefully: every path returns a usable `NowPlaying`; page never breaks.
- Secrets server-side only; documented in `.env.example`; keys in Vercel env vars.
- Reskin discipline: no IA/interaction changes beyond building out an existing,
  already-planned page. Daydream-sky tokens only; animate transform/opacity/color.
- Zero new dependencies.

## Verification

- Build/lint clean.
- `/now` renders with the static fallback (no token) — listening + chess lines +
  focus section, no console/build errors, `Revalidate` shown on the route.
- After the user mints a token: confirm the listening line goes live (no fallback
  log line; a real track appears).
