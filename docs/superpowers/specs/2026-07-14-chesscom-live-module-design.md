# Chess.com live-data module — design

**Date:** 2026-07-14
**Status:** Approved (Option A)
**Phase:** 6 — Live-data modules (module #2, after Letterboxd)

## Goal

Light up `/about/chess` with live Chess.com data (ratings + recent games) and
correct the home carousel's Chess panel, which currently shows a stale, wrong
stat. Mirrors the Letterboxd module: zero new dependencies, server-side fetch,
ISR cache, graceful static fallback — never a broken or empty state.

## Context / the correction

The account is **`nemoblob`** ("Vaibhav Wudaru", verified live). Real ratings:

| Format | Current | Best | Games |
|--------|---------|------|-------|
| Blitz  | 1241 | 1421 | 1,415 |
| Bullet | 1315 | 1408 | 311 |
| Rapid  | 980  | 980  | 44 |

The home carousel currently reads **"1177 · FIDE ~1300 · chess.com · rapid"** —
wrong on both counts: rapid is the least-played format, and 1177 matches nothing
current (it was a mid-stream blitz rating months ago). Blitz is the real main
format. The `/about/chess` copy ("parked around 1300") is honest and stays.

## Decisions (locked)

- **No auth, no deps.** Chess.com's public API is open JSON. Fetch with a browser
  User-Agent (same convention as Letterboxd; the API rejects some default UAs and
  it costs nothing to be safe), `next: { revalidate: 3600 }`.
- **Data layer** `src/lib/chess.ts`, server-fetch convention (import only from
  server components; `server-only` package is not installed).
- **Ratings:** show all three time controls, **led by blitz** (his real main
  format). Each card: current rating, best, game count.
- **Recent games:** last ~5 **rated** games from the most recent monthly
  archive(s), newest first, normalized to W / L / D. Each row: result chip,
  format, opponent + their rating, his rating at the time, link to the game on
  chess.com. Losses included (the intro copy promises this).
- **Home carousel (Option A — corrected static):** the client carousel stays
  untouched structurally; only `ChessBody`'s static values are corrected to a
  truthful, non-staling line — **peak blitz 1421**, meta `chess.com · blitz`.
  A peak doesn't go stale, so static is honest here. This mirrors the Letterboxd
  precedent (the carousel Film panel stayed static; live data lived on the
  subpage / a dedicated home surface). No data threaded into the client carousel.
- **Fallback:** real snapshot baked in (today's ratings + a few real recent
  games, one of them a loss), shown with an honest "recent snapshot" note when
  the live fetch fails. Never a broken/empty state.
- **Theme:** chess accent is the existing carousel green `#2f7d54`. Result chips:
  win = green `#2f7d54`, loss = a muted red, draw = neutral `text-lo`. Applied
  inline (same pattern as the gold `#8a6410` precedent — there is no `gold`/`win`
  Tailwind token). Reduced-motion gated; aria-labels on chips.

## Data shapes

```ts
type Rating = { current: number | null; best: number | null; games: number };

type Ratings = { blitz: Rating; bullet: Rating; rapid: Rating };

type Game = {
  result: "W" | "L" | "D";
  format: string;          // "blitz" | "bullet" | "rapid" | "daily"
  myRating: number;
  opponent: string;
  opponentRating: number;
  color: "white" | "black";
  url: string;             // chess.com game link
  endTime: number;         // unix seconds
};

type ChessProfile = { ratings: Ratings; recentGames: Game[]; live: boolean };

getChessProfile(gameLimit = 5): Promise<ChessProfile>;
```

Result normalization: `"win"` → W; `agreed | repetition | stalemate |
insufficient | 50move | timevsinsufficient` → D; everything else (resigned,
checkmated, timeout, abandoned, ...) → L.

## API endpoints

- `https://api.chess.com/pub/player/nemoblob/stats` — ratings (`chess_blitz`,
  `chess_bullet`, `chess_rapid`, each `.last.rating`, `.best.rating`, `.record`).
- `https://api.chess.com/pub/player/nemoblob/games/archives` — list of monthly
  archive URLs; walk from newest until ≥ `gameLimit` rated games collected.
- `https://api.chess.com/pub/player/{month}` archive — `.games[]` with
  `white`/`black` (`username`, `rating`, `result`), `time_class`, `end_time`,
  `url`, `rated`.

Username configurable via `process.env.CHESSCOM_USERNAME || "nemoblob"`.

## Files

- **Create** `src/lib/chess.ts` — data layer (fetch + parse + fallback).
- **Create** `src/components/about/chess-live.tsx` — presentational ratings row +
  recent-games list (server component, pure render).
- **Modify** `src/app/about/chess/page.tsx` — `async`, call `getChessProfile`,
  render `<ChessLive>`; drop `ComingLive`.
- **Modify** `src/components/home/interest-panel.tsx` — correct `ChessBody`
  static values + the chess interest's `meta` string.
- **Modify** `.env.example` — document `CHESSCOM_USERNAME` (default `nemoblob`).

## Out of scope (YAGNI)

Puzzle/tactics rating, opening names, win-rate charts, per-game accuracy, live
threading into the client carousel (Option B, declined), FIDE (chess.com has none
for him — the "~1300" reference is dropped, not invented).

## Testing / verification

- `parseGames` / result-normalization checked against a saved real archive sample.
- Lint + production build clean; `/about/chess` shows `Revalidate 1h`.
- Browser: ratings + games render, chips correct, links resolve, no console
  errors, no fallback note when live. Reduced-motion + fallback path spot-checked.
