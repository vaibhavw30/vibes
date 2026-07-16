import { Activity, Route, Timer } from "lucide-react";
import {
  activityIcon,
  type IconType,
} from "@/components/live/activity-icons";
import {
  formatDuration,
  type ActivitySession,
  type ActivityWeek,
} from "@/lib/activity";

/*
 * Presentational panel for /about/training. Server component (pure render of an
 * ActivityWeek). This-week stat cards on top, a recent-sessions list below. Both
 * ride the "Daydream sky" frosted glass: .frost sets ONLY blur + shadow, so each
 * surface MUST also carry a bg-bg-* fill or it washes out over the painting — the
 * stat tiles use bg-bg-2 (crisp for the numbers), the list its own bg-bg-1 panel.
 * Frames around SESSIONS + active time (lifting has no distance); the distance card
 * and per-row distance appear only when there's a distance sport in the mix. Each
 * stat and each session carries a small circular icon badge (health-app idiom).
 * Days render in the session's OWN local time (utcOffsetMin), so a late workout
 * never reads a day late on a UTC server. A quiet week gets an honest empty state.
 * No motion of its own; the subpage wraps it in a Reveal.
 */

/** The session's local calendar day, formatted from the true UTC instant + its
 *  own offset (via a UTC-anchored shift) so the label is correct on any server. */
function localDay(iso: string, utcOffsetMin: number): string {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t)) return "";
  return new Date(t + utcOffsetMin * 60_000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function IconBadge({ icon: Icon, size }: { icon: IconType; size: "sm" | "lg" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent ${
        size === "lg" ? "size-9" : "size-8"
      }`}
    >
      <Icon className="size-4" aria-hidden={true} />
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconType;
}) {
  return (
    <div className="frost rounded-xl border border-border bg-bg-2 px-4 py-4">
      <IconBadge icon={icon} size="sm" />
      <p className="mt-3 font-serif text-[1.9rem] leading-none text-text-hi">
        {value}
      </p>
      <p className="mt-2 font-mono text-mono uppercase tracking-wider text-text-lo">
        {label}
      </p>
    </div>
  );
}

function SessionRow({ activity }: { activity: ActivitySession }) {
  const day = localDay(activity.date, activity.utcOffsetMin);
  return (
    <li>
      <a
        href={activity.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3.5 py-3 transition-colors"
      >
        <IconBadge icon={activityIcon(activity.type)} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body text-text-mid group-hover:text-text-hi">
            {activity.name}
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-text-lo">
            {formatDuration(activity.movingTimeMin)}
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
}: ActivityWeek) {
  return (
    <div>
      {!live && (
        <p className="mb-6 font-mono text-mono uppercase tracking-wider text-text-lo">
          Showing a recent snapshot ·{" "}
          <a
            href="https://www.fitbit.com/activities"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            logged on Fitbit
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
            <StatCard label="Sessions" value={String(activityCount)} icon={Activity} />
            <StatCard
              label="Active time"
              value={formatDuration(movingTimeMin)}
              icon={Timer}
            />
            {distanceKm > 0 && (
              <StatCard label="Distance" value={`${distanceKm} km`} icon={Route} />
            )}
          </div>

          <div className="mt-12">
            <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
              This week <span className="text-accent">· logged on Fitbit</span>
            </h2>
            <ul className="frost mt-3 divide-y divide-border rounded-xl border border-border bg-bg-1 px-5">
              {activities.map((a, i) => (
                <SessionRow key={`${a.date}-${i}`} activity={a} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
