/*
 * Provider-agnostic "staying active" layer. The UI (StayingActiveLine, the
 * /about/training panel, the home + /now surfaces) depends ONLY on this file's
 * shape — never on a specific provider. Today the provider is Fitbit (src/lib/
 * fitbit.ts); when the Fitbit Web API is deprecated (Sept 2026) the pivot to the
 * Google Health API is a one-file swap: implement getActivityWeek there and
 * re-export it below. Everything downstream stays put.
 */

export type ActivitySession = {
  name: string;
  type: string; // "Weights" | "Run" | "Walk" | ... (provider's label)
  distanceKm: number; // 0 for non-distance sessions (e.g. lifting)
  movingTimeMin: number;
  date: string; // ISO start time
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
export { getFitbitWeek as getActivityWeek } from "./fitbit";

/** Shared formatter: minutes → "3h 20m" / "45m" / "0m". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
