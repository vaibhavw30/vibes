/*
 * Strava live-data layer (Phase 6, module #4 — 2nd OAuth). Server-only: import
 * ONLY from server components. Powers the "Staying active" feed (gym/lifting
 * sessions, plus any runs/rides) on /now, the home hero, and /about/training.
 * Uses a long-lived refresh token exchanged for a short-lived access token
 * SERVER-SIDE (client id/secret/refresh token never reach the browser). Rolls the
 * last 7 days of activities into a weekly summary. Any failure — or missing
 * credentials — returns a calm "quiet week" fallback with `live: false`, so no
 * surface is ever broken/empty.
 *
 * Framing note: lifting has no distance, so the primary unit is SESSIONS + active
 * time; distance is only surfaced when a distance sport is in the mix.
 *
 * Setup (the account owner does this once): see scripts/strava-auth.mjs and the
 * Strava block in .env.example. Caveat: Strava may rotate the refresh token on
 * refresh; it's stable in practice, but if the feed goes stale, re-mint.
 */

export type StravaActivity = {
  name: string;
  type: string; // "WeightTraining" | "Run" | "Ride" | "Workout" | ...
  distanceKm: number; // 0 for non-distance sports
  movingTimeMin: number;
  date: string; // ISO start date
  url: string; // strava.com/activities/{id}
};

export type StravaWeek = {
  activityCount: number;
  movingTimeMin: number;
  distanceKm: number; // sum across the week (0 if all non-distance)
  activities: StravaActivity[]; // most-recent-first, within the last 7 days
  live: boolean; // false = static fallback (no creds / API down)
};

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

const TOKEN_URL = "https://www.strava.com/oauth/token";
const ACTIVITIES_URL =
  "https://www.strava.com/api/v3/athlete/activities?per_page=30";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// The honest current state (nothing logged yet) IS a quiet week — so the fallback
// and a genuinely empty live week render identically. Once creds + logged sessions
// exist, getStravaWeek returns live: true with real data.
const FALLBACK: StravaWeek = {
  activityCount: 0,
  movingTimeMin: 0,
  distanceKm: 0,
  activities: [],
  live: false,
};

/** The subset of Strava's SummaryActivity we read. */
type RawActivity = {
  id: number;
  name: string;
  type?: string;
  sport_type?: string;
  distance?: number; // meters
  moving_time?: number; // seconds
  start_date?: string; // ISO (UTC)
};

/** Pure: a raw Strava activity → our StravaActivity. */
export function mapActivity(raw: RawActivity): StravaActivity {
  return {
    name: raw.name,
    type: raw.sport_type || raw.type || "Workout",
    distanceKm: Math.round(((raw.distance ?? 0) / 1000) * 10) / 10,
    movingTimeMin: Math.round((raw.moving_time ?? 0) / 60),
    date: raw.start_date ?? "",
    url: `https://www.strava.com/activities/${raw.id}`,
  };
}

/** Pure: raw activities + a "now" timestamp → the rolling-7-day rollup. */
export function summarizeWeek(raw: RawActivity[], nowMs: number): StravaWeek {
  const activities = raw
    .map(mapActivity)
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

/** Exchange the refresh token for a short-lived access token (server-side). */
async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID as string,
      client_secret: CLIENT_SECRET as string,
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN as string,
    }),
    // Never cache the token exchange: a cached (stale/expired) access token — the
    // Data Cache persists across restarts — causes 401s downstream. The activities
    // GET below carries the ISR window instead.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Strava token HTTP ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Strava token response had no token");
  return json.access_token;
}

/** Server-only. Returns the last 7 days of activity as a weekly rollup; on any
 *  failure (or missing creds) returns the quiet-week fallback with `live: false`.
 *  ISR hourly — a weekly total doesn't need to be more real-time than that. */
export async function getStravaWeek(): Promise<StravaWeek> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return FALLBACK;
  try {
    const token = await getAccessToken();
    const res = await fetch(ACTIVITIES_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Strava activities HTTP ${res.status}`);
    const raw = (await res.json()) as RawActivity[];
    return summarizeWeek(raw, Date.now());
  } catch (err) {
    console.error("[strava] live fetch failed, using fallback:", err);
    return FALLBACK;
  }
}

/** Shared formatter: minutes → "3h 20m" / "45m" / "0m". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
