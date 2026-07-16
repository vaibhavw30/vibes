/*
 * Google Health API provider for the "staying active" feed. Server-only.
 * Powers /now, the home hero, and /about/training via src/lib/activity.ts.
 *
 * Replaces the Fitbit Web API (new-app registration closed July 2026; the legacy
 * API deprecates Sept 2026). Workouts logged in the Fitbit app sync into Google
 * Health, which we read here through the "exercise" data type.
 *
 * Unlike Fitbit, Google's PRODUCTION refresh token is STABLE (it doesn't rotate on
 * every use), so it lives in a plain env var — no datastore needed. We refresh the
 * short-lived access token server-side on each render, exactly like the Spotify
 * provider, and NEVER cache that token POST (cache: "no-store") or a stale token
 * yields a 401. NOTE: the refresh token only stays valid if the OAuth app is
 * PUBLISHED ("In production"); in "Testing" status Google expires it after 7 days.
 *
 * Any failure — missing creds, API down, empty data — returns the quiet-week
 * fallback with live:false, identical to a genuinely empty week. No surface breaks.
 */

import type { ActivitySession, ActivityWeek } from "./activity";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_URL =
  "https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Where the sessions are actually logged (Fitbit app → synced to Google Health).
const LOG_URL = "https://www.fitbit.com/activities";

const FALLBACK: ActivityWeek = {
  activityCount: 0,
  movingTimeMin: 0,
  distanceKm: 0,
  activities: [],
  live: false,
};

/** A fresh access token from the stable refresh token (Spotify-style). */
async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID as string,
      client_secret: CLIENT_SECRET as string,
      refresh_token: REFRESH_TOKEN as string,
      grant_type: "refresh_token",
    }),
    cache: "no-store", // never cache the token exchange (short-lived access token)
  });
  if (!res.ok) throw new Error(`Google token HTTP ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Google token response missing access_token");
  }
  return json.access_token;
}

/*
 * A Google Health "exercise" dataPoint (the subset we read), verified against live
 * data. `displayName` is Fitbit's friendly label ("Run"); `exerciseType` is the enum
 * ("RUNNING", "STRENGTH_TRAINING"). `activeDuration` ("1268s") is moving time
 * excluding pauses; distance lives in metricsSummary as MILLIMETERS.
 */
type RawExercisePoint = {
  exercise?: {
    exerciseType?: string;
    displayName?: string;
    activeDuration?: string; // seconds with an "s" suffix, e.g. "1268s"
    interval?: {
      startTime?: string; // RFC3339 (UTC), e.g. "2026-07-15T03:45:25Z"
      startUtcOffset?: string; // seconds with an "s" suffix, e.g. "-25200s" (PDT)
      endTime?: string;
      civilStartTime?: string; // "YYYY-MM-DDTHH:mm:ss" (no zone)
    };
    metricsSummary?: {
      distanceMillimeters?: number;
    };
  };
};

/** Minutes between two RFC3339 timestamps; 0 if either is missing/invalid. */
function toMinutes(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
  return ms > 0 ? Math.round(ms / 60000) : 0;
}

/** Prefer activeDuration ("1268s" → 21m); fall back to interval end−start. */
function durationMin(
  activeDuration?: string,
  start?: string,
  end?: string,
): number {
  if (activeDuration) {
    const secs = parseFloat(activeDuration); // "1268s" → 1268, "522.3s" → 522.3
    if (!Number.isNaN(secs) && secs > 0) return Math.round(secs / 60);
  }
  return toMinutes(start, end);
}

/** "-25200s" → -420 (minutes). Missing/invalid → 0 (render date as-is). */
function offsetMin(startUtcOffset?: string): number {
  if (!startUtcOffset) return 0;
  const secs = parseFloat(startUtcOffset); // "-25200s" → -25200
  return Number.isNaN(secs) ? 0 : Math.round(secs / 60);
}

/** "STRENGTH_TRAINING" → "Strength Training"; empty → "Workout". */
function activityLabel(type?: string): string {
  if (!type) return "Workout";
  return type
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Pure: a Google Health exercise point → our ActivitySession. */
export function mapExercisePoint(raw: RawExercisePoint): ActivitySession {
  const ex = raw.exercise ?? {};
  const start = ex.interval?.startTime ?? ex.interval?.civilStartTime ?? "";
  const mm = ex.metricsSummary?.distanceMillimeters ?? 0;
  return {
    name: ex.displayName || activityLabel(ex.exerciseType),
    type: ex.exerciseType ?? "Workout",
    distanceKm: Math.round((mm / 1_000_000) * 10) / 10,
    movingTimeMin: durationMin(
      ex.activeDuration,
      ex.interval?.startTime,
      ex.interval?.endTime,
    ),
    date: start,
    utcOffsetMin: offsetMin(ex.interval?.startUtcOffset),
    url: LOG_URL,
  };
}

/** Pure: raw exercise points + a "now" timestamp → the rolling-7-day rollup. */
export function summarizeWeek(
  raw: RawExercisePoint[],
  nowMs: number,
): ActivityWeek {
  const activities = raw
    .map(mapExercisePoint)
    .filter((a) => a.date && nowMs - new Date(a.date).getTime() <= WEEK_MS)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return {
    activityCount: activities.length,
    movingTimeMin: activities.reduce((s, a) => s + a.movingTimeMin, 0),
    distanceKm:
      Math.round(activities.reduce((s, a) => s + a.distanceKm, 0) * 10) / 10,
    activities,
    live: true,
  };
}

/** Server-only. Google Health implementation of getActivityWeek: the last 7 days
 *  of logged exercise as a weekly rollup; quiet-week fallback on any failure. */
export async function getGoogleHealthWeek(): Promise<ActivityWeek> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return FALLBACK;
  try {
    const token = await getAccessToken();
    const after = new Date(Date.now() - WEEK_MS).toISOString().slice(0, 10);
    // Google Health filters exercise by civil start time; summarizeWeek re-windows.
    const filter = `exercise.interval.civil_start_time >= "${after}"`;
    const url = `${DATA_URL}?pageSize=25&filter=${encodeURIComponent(filter)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Google Health HTTP ${res.status}`);
    const json = (await res.json()) as { dataPoints?: RawExercisePoint[] };
    return summarizeWeek(json.dataPoints ?? [], Date.now());
  } catch (err) {
    console.error("[google-health] live fetch failed, using fallback:", err);
    return FALLBACK;
  }
}
