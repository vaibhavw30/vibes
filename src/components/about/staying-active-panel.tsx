import { formatDuration, type StravaActivity, type StravaWeek } from "@/lib/strava";

/*
 * Presentational panel for /about/training. Server component (pure render of a
 * StravaWeek). This-week stat cards on top, a recent-sessions list below. Frames
 * around SESSIONS + active time (lifting has no distance); the distance card and
 * per-row distance appear only when there's a distance sport in the mix. A quiet
 * week gets an honest, deliberate empty state — never a broken panel. No motion of
 * its own; the subpage wraps it in a Reveal.
 */

const ACCENT = "#2a67a6";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="frost rounded-xl border border-border px-4 py-4">
      <p className="font-mono text-mono uppercase tracking-wider text-text-lo">
        {label}
      </p>
      <p className="mt-2 font-serif text-[1.9rem] leading-none text-text-hi">
        {value}
      </p>
    </div>
  );
}

/** Human label for Strava's sport_type enum (e.g. "WeightTraining" → "Lift"). */
function sportLabel(type: string): string {
  if (type === "WeightTraining" || type === "Workout") return "Lift";
  // CamelCase → spaced ("TrailRun" → "Trail Run"), else pass through ("Run").
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function SessionRow({ activity }: { activity: StravaActivity }) {
  const day = activity.date
    ? new Date(activity.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";
  return (
    <li>
      <a
        href={activity.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-text-hi"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body text-text-mid group-hover:text-text-hi">
            {activity.name}
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-text-lo">
            {sportLabel(activity.type)} · {formatDuration(activity.movingTimeMin)}
            {activity.distanceKm > 0 ? ` · ${activity.distanceKm} km` : ""}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-wider text-text-lo">
          {day}
        </span>
      </a>
    </li>
  );
}

export function StayingActivePanel({
  activityCount,
  movingTimeMin,
  distanceKm,
  activities,
  live,
}: StravaWeek) {
  return (
    <div>
      {!live && (
        <p className="mb-6 font-mono text-mono uppercase tracking-wider text-text-lo">
          Showing a recent snapshot ·{" "}
          <a
            href="https://www.strava.com"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            logged on Strava
          </a>
        </p>
      )}

      {activityCount === 0 ? (
        <div className="frost rounded-xl border border-dashed border-border bg-bg-1/70 px-6 py-16 text-center">
          <p className="measure mx-auto text-small leading-relaxed text-text-mid">
            Nothing logged this week — just getting the habit going. Sessions show
            up here as I log them.
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${distanceKm > 0 ? 3 : 2}, minmax(0, 1fr))`,
            }}
          >
            <StatCard
              label="Sessions"
              value={String(activityCount)}
            />
            <StatCard label="Active time" value={formatDuration(movingTimeMin)} />
            {distanceKm > 0 && (
              <StatCard label="Distance" value={`${distanceKm} km`} />
            )}
          </div>

          <div className="mt-12">
            <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
              This week{" "}
              <span style={{ color: ACCENT }}>· logged on Strava</span>
            </h2>
            <ul className="mt-2 divide-y divide-border">
              {activities.map((a) => (
                <SessionRow key={a.url} activity={a} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
