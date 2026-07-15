import { formatDuration, type StravaWeek } from "@/lib/strava";

/*
 * Shared "Staying active" breadcrumb line, reused on /now and the home hero.
 * Server component, pure render of a StravaWeek. Mono line in the "last watched"
 * idiom. Lifting has no distance, so the unit is sessions + active time; distance
 * is appended only when a distance sport is in the mix. A quiet week (nothing
 * logged) renders as a calm plain-text line, never "0 km" or an empty gap.
 */
export function StayingActiveLine({ week }: { week: StravaWeek }) {
  const { activityCount, movingTimeMin, distanceKm, activities } = week;

  if (activityCount === 0) {
    return (
      <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
        <span className="text-text-lo/80">Staying active · </span>
        <span className="text-text-mid">a quiet week</span>
      </p>
    );
  }

  const noun = activityCount === 1 ? "session" : "sessions";
  const href = activities[0]?.url ?? "https://www.strava.com";

  return (
    <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
      <span className="text-text-lo/80">Staying active · </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-text-mid underline-offset-4 transition-colors hover:text-accent"
      >
        {activityCount} {noun} this week
        <span className="text-text-lo">
          {" · "}
          {formatDuration(movingTimeMin)}
          {distanceKm > 0 ? ` · ${distanceKm} km` : ""}
        </span>
      </a>
    </p>
  );
}
