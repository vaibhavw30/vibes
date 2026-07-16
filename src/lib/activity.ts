/*
 * Provider-agnostic "staying active" layer. The UI (StayingActiveLine, the
 * /about/training panel, the home + /now surfaces) depends ONLY on this file's
 * shape — never on a specific provider. The provider is the Google Health API
 * (src/lib/google-health.ts), which replaced Fitbit (new-app registration closed
 * July 2026). Swapping providers is a one-file change: implement getActivityWeek
 * elsewhere and re-export it below. Everything downstream stays put.
 */

export type ActivitySession = {
  name: string;
  type: string; // "Weights" | "Run" | "Walk" | ... (provider's label)
  distanceKm: number; // 0 for non-distance sessions (e.g. lifting)
  movingTimeMin: number;
  date: string; // ISO start time — the true UTC instant (sort/window on this)
  utcOffsetMin: number; // minutes to add to UTC for the session's LOCAL wall clock
  // (e.g. -420 for PDT). Display the day in local time so a late-evening workout
  // never reads a day late on a UTC server (Vercel). 0 = treat date as-is.
  url: string; // link back to the provider
};

export type ActivityWeek = {
  activityCount: number;
  movingTimeMin: number;
  distanceKm: number; // sum across the week (0 if all non-distance)
  activities: ActivitySession[]; // most-recent-first, within the last 7 days
  live: boolean; // false = static fallback (no creds / API down)
};

/** The current provider. Swap this line to change data sources. */
export { getGoogleHealthWeek as getActivityWeek } from "./google-health";

/** Shared formatter: minutes → "3h 20m" / "45m" / "0m". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
