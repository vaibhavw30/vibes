/*
 * Fitbit Web API provider for the "staying active" feed (Phase 6). Server-only.
 * Powers /now, the home hero, and /about/training via src/lib/activity.ts.
 *
 * Fitbit rotates its refresh token on every refresh (single-use — the old one
 * dies), so a static env var can't hold it. We persist the token state in Upstash
 * Redis (src/lib/redis.ts) instead:
 *   - Redis holds { access_token, refresh_token, expires_at } as one JSON blob.
 *   - A render reuses the cached access token while it's valid (~8h life), so we
 *     refresh only a few times a day — the rotation race is effectively a non-issue.
 *   - The FIRST refresh token comes from FITBIT_REFRESH_TOKEN (a seed minted by
 *     scripts/fitbit-auth.mjs); after the first refresh, Redis is the source of
 *     truth and the env seed is ignored.
 *
 * Any failure — missing creds, no datastore, API down, or a lost rotation race —
 * returns the quiet-week fallback with `live: false`. NOTE: the Fitbit Web API is
 * slated for deprecation in Sept 2026; this file is the provider we'll swap for the
 * Google Health API then (see src/lib/activity.ts).
 */

import type { ActivitySession, ActivityWeek } from "./activity";
import { redisConfigured, redisGet, redisSet } from "./redis";

const CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const SEED_REFRESH_TOKEN = process.env.FITBIT_REFRESH_TOKEN;

const TOKEN_URL = "https://api.fitbit.com/oauth2/token";
const TOKEN_KEY = "fitbit:token";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const EXPIRY_BUFFER_MS = 60 * 1000; // refresh a minute before actual expiry

const FALLBACK: ActivityWeek = {
  activityCount: 0,
  movingTimeMin: 0,
  distanceKm: 0,
  activities: [],
  live: false,
};

type TokenState = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
};

async function loadTokenState(): Promise<TokenState | null> {
  const raw = await redisGet(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenState;
  } catch {
    return null;
  }
}

/** Exchange a refresh token for a fresh access+refresh pair and persist it. */
async function refresh(refreshToken: string): Promise<TokenState> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store", // never cache token exchange (rotation + short life)
  });
  if (!res.ok) throw new Error(`Fitbit token HTTP ${res.status}`);
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!json.access_token || !json.refresh_token) {
    throw new Error("Fitbit token response missing fields");
  }
  const state: TokenState = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + (json.expires_in ?? 28800) * 1000,
  };
  await redisSet(TOKEN_KEY, JSON.stringify(state));
  return state;
}

/** A valid access token: cached from Redis when live, otherwise refreshed
 *  (rotating the token in Redis). Handles the rare concurrent-refresh race by
 *  re-reading Redis for a token another render just stored. */
async function getAccessToken(): Promise<string> {
  const state = await loadTokenState();
  if (state && Date.now() < state.expires_at - EXPIRY_BUFFER_MS) {
    return state.access_token;
  }
  const refreshToken = state?.refresh_token ?? SEED_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("Fitbit: no refresh token (seed or stored)");
  try {
    return (await refresh(refreshToken)).access_token;
  } catch (err) {
    // Lost the rotation race? Another render may have just stored a fresh token.
    const reread = await loadTokenState();
    if (reread && Date.now() < reread.expires_at - EXPIRY_BUFFER_MS) {
      return reread.access_token;
    }
    throw err;
  }
}

/** The subset of Fitbit's activity-log entry we read. */
type RawFitbitActivity = {
  logId: number;
  activityName?: string;
  duration?: number; // milliseconds
  distance?: number; // km (metric — we omit Accept-Language)
  startTime?: string; // ISO
};

/** Pure: a Fitbit activity-log entry → our ActivitySession. */
export function mapFitbitActivity(raw: RawFitbitActivity): ActivitySession {
  return {
    name: raw.activityName || "Workout",
    type: raw.activityName || "Workout",
    distanceKm: Math.round((raw.distance ?? 0) * 10) / 10,
    movingTimeMin: Math.round((raw.duration ?? 0) / 60000),
    date: raw.startTime ?? "",
    url: "https://www.fitbit.com/activities",
  };
}

/** Pure: raw activities + a "now" timestamp → the rolling-7-day rollup. */
export function summarizeWeek(
  raw: RawFitbitActivity[],
  nowMs: number,
): ActivityWeek {
  const activities = raw
    .map(mapFitbitActivity)
    .filter((a) => a.date && nowMs - new Date(a.date).getTime() <= WEEK_MS)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return {
    activityCount: activities.length,
    movingTimeMin: activities.reduce((sum, a) => sum + a.movingTimeMin, 0),
    distanceKm:
      Math.round(activities.reduce((sum, a) => sum + a.distanceKm, 0) * 10) / 10,
    activities,
    live: true,
  };
}

/** Server-only. Fitbit implementation of getActivityWeek: last 7 days of logged
 *  activity as a weekly rollup; quiet-week fallback on any failure or missing setup. */
export async function getFitbitWeek(): Promise<ActivityWeek> {
  if (!CLIENT_ID || !CLIENT_SECRET || !redisConfigured()) return FALLBACK;
  try {
    const token = await getAccessToken();
    // afterDate needs a YYYY-MM-DD 7 days back; ask ascending and cap the page.
    const after = new Date(Date.now() - WEEK_MS).toISOString().slice(0, 10);
    const res = await fetch(
      // Fitbit requires sort=asc when afterDate is used; summarizeWeek re-sorts.
      `https://api.fitbit.com/1/user/-/activities/list.json?afterDate=${after}&sort=asc&offset=0&limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) throw new Error(`Fitbit activities HTTP ${res.status}`);
    const json = (await res.json()) as { activities?: RawFitbitActivity[] };
    return summarizeWeek(json.activities ?? [], Date.now());
  } catch (err) {
    console.error("[fitbit] live fetch failed, using fallback:", err);
    return FALLBACK;
  }
}
