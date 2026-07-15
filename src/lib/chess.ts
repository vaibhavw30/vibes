/*
 * Chess.com live-data layer (Phase 6, module #2). Server-only: import ONLY from
 * server components. Uses Chess.com's open public API (no auth) with a browser
 * User-Agent — same convention as the Letterboxd layer; the API rejects some
 * default fetcher UAs and it costs nothing to be safe. Ratings come from /stats;
 * recent games are walked back from the monthly archives (newest first). Any
 * failure returns a real-data fallback with `live: false` so the page is never
 * broken/empty.
 */

export type Rating = {
  current: number | null;
  best: number | null;
  games: number;
};

export type Ratings = {
  blitz: Rating;
  bullet: Rating;
  rapid: Rating;
};

export type Game = {
  result: "W" | "L" | "D";
  format: string; // "blitz" | "bullet" | "rapid" | "daily"
  myRating: number;
  opponent: string;
  opponentRating: number;
  color: "white" | "black";
  url: string; // chess.com game link
  endTime: number; // unix seconds
};

export type ChessProfile = { ratings: Ratings; recentGames: Game[]; live: boolean };

const USERNAME = (process.env.CHESSCOM_USERNAME || "nemoblob").toLowerCase();
const BASE = `https://api.chess.com/pub/player/${USERNAME}`;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// A "win" is unambiguous; these specific results are draws; everything else
// (resigned, checkmated, timeout, abandoned, ...) is a loss for the player.
const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

// Real snapshot (captured 2026-07-14) — an honest fallback when live fetch fails.
const FALLBACK: ChessProfile = {
  ratings: {
    blitz: { current: 1241, best: 1421, games: 1415 },
    bullet: { current: 1315, best: 1408, games: 311 },
    rapid: { current: 980, best: 980, games: 44 },
  },
  recentGames: [
    {
      result: "W",
      format: "blitz",
      myRating: 1241,
      opponent: "evgeniikulikov81",
      opponentRating: 1175,
      color: "black",
      url: "https://www.chess.com/game/live/171580694596",
      endTime: 1784064618,
    },
    {
      result: "W",
      format: "blitz",
      myRating: 1224,
      opponent: "umeshray99",
      opponentRating: 1233,
      color: "white",
      url: "https://www.chess.com/game/live/171580558100",
      endTime: 1784064101,
    },
    {
      result: "W",
      format: "blitz",
      myRating: 1200,
      opponent: "luizfilho1010",
      opponentRating: 1181,
      color: "white",
      url: "https://www.chess.com/game/live/171580330528",
      endTime: 1784063658,
    },
    {
      result: "L",
      format: "blitz",
      myRating: 1177,
      opponent: "L1mb",
      opponentRating: 1190,
      color: "white",
      url: "https://www.chess.com/game/live/169913778950",
      endTime: 1780955469,
    },
    {
      result: "W",
      format: "blitz",
      myRating: 1198,
      opponent: "abinow",
      opponentRating: 930,
      color: "white",
      url: "https://www.chess.com/game/live/167364951632",
      endTime: 1776288670,
    },
  ],
  live: false,
};

function normalizeResult(raw: string): "W" | "L" | "D" {
  if (raw === "win") return "W";
  if (DRAW_RESULTS.has(raw)) return "D";
  return "L";
}

type RawSide = { username: string; rating: number; result: string };
type RawGame = {
  white: RawSide;
  black: RawSide;
  time_class: string;
  end_time: number;
  url: string;
  rated?: boolean;
};

/** Pure: one archive game (raw API shape) → our Game, from the player's POV.
 *  Returns null for unrated games (we only surface rated play). */
export function mapGame(raw: RawGame, username: string): Game | null {
  if (!raw.rated) return null;
  const meIsWhite = raw.white.username.toLowerCase() === username;
  const me = meIsWhite ? raw.white : raw.black;
  const opp = meIsWhite ? raw.black : raw.white;
  return {
    result: normalizeResult(me.result),
    format: raw.time_class,
    myRating: me.rating,
    opponent: opp.username,
    opponentRating: opp.rating,
    color: meIsWhite ? "white" : "black",
    url: raw.url,
    endTime: raw.end_time,
  };
}

function readRating(
  stats: Record<string, { last?: { rating?: number }; best?: { rating?: number }; record?: { win?: number; loss?: number; draw?: number } }>,
  key: string,
): Rating {
  const s = stats[key];
  const rec = s?.record;
  const games = rec ? (rec.win ?? 0) + (rec.loss ?? 0) + (rec.draw ?? 0) : 0;
  return {
    current: s?.last?.rating ?? null,
    best: s?.best?.rating ?? null,
    games,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Chess.com HTTP ${res.status} (${url})`);
  return (await res.json()) as T;
}

/** Server-only. Fetches live ratings + recent rated games (ISR hourly); on any
 *  failure returns the real-data fallback with `live: false`. */
export async function getChessProfile(gameLimit = 5): Promise<ChessProfile> {
  try {
    const stats = await fetchJson<Record<string, never>>(`${BASE}/stats`);
    const ratings: Ratings = {
      blitz: readRating(stats, "chess_blitz"),
      bullet: readRating(stats, "chess_bullet"),
      rapid: readRating(stats, "chess_rapid"),
    };

    // Walk monthly archives newest-first until we have enough rated games.
    const { archives } = await fetchJson<{ archives: string[] }>(
      `${BASE}/games/archives`,
    );
    const games: Game[] = [];
    for (const url of [...archives].reverse()) {
      const { games: raw } = await fetchJson<{ games: RawGame[] }>(url);
      for (const g of raw) {
        const mapped = mapGame(g, USERNAME);
        if (mapped) games.push(mapped);
      }
      if (games.length >= gameLimit) break;
    }
    games.sort((a, b) => b.endTime - a.endTime);

    if (ratings.blitz.current == null && !games.length) {
      throw new Error("no ratings or games parsed");
    }
    return { ratings, recentGames: games.slice(0, gameLimit), live: true };
  } catch (err) {
    console.error("[chess.com] live fetch failed, using fallback:", err);
    return {
      ...FALLBACK,
      recentGames: FALLBACK.recentGames.slice(0, gameLimit),
    };
  }
}
