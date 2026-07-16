import type { ReactNode } from "react";
import { Activity, Music, Swords } from "lucide-react";
import { activityIcon, type IconType } from "@/components/live/activity-icons";
import type { NowPlaying } from "@/lib/spotify";
import type { ChessProfile } from "@/lib/chess";
import { formatDuration, type ActivityWeek } from "@/lib/activity";

/*
 * Themed live-data cards for /now. Each external source gets a roomy frosted card
 * in the same idiom as the /about/training panel, differentiated by a DISCIPLINED
 * per-source tint (a deliberate, scoped amendment to the "one accent" rule in
 * DESIGN_HANDOFF §3.5 — contained to this strip, where the cards genuinely
 * represent outside brands). The tint touches only a slim left spine + the glyph
 * badge; ALL body text stays neutral ink, so nothing reads as a colored template.
 * Marks are neutral lucide glyphs, not brand logos. Server components (pure
 * render); the page wraps them in a Reveal. Home keeps the compact breadcrumb
 * lines — this richer treatment is /now only.
 */

type Theme = { ink: string; bg: string; edge: string };

// Deepened for AA-as-graphic on frosted white; bg/edge are low-alpha brand tints.
const SPOTIFY: Theme = {
  ink: "#1a7a3c",
  bg: "rgba(29, 185, 84, 0.14)",
  edge: "rgba(29, 185, 84, 0.6)",
};
const CHESS: Theme = {
  ink: "#475569",
  bg: "rgba(71, 85, 105, 0.14)",
  edge: "rgba(71, 85, 105, 0.55)",
};
const HEALTH: Theme = {
  ink: "#0c7d83",
  bg: "rgba(15, 140, 148, 0.14)",
  edge: "rgba(15, 140, 148, 0.6)",
};

const RESULT_WORD = { W: "won", L: "lost", D: "drew" } as const;
const FITBIT_URL = "https://www.fitbit.com/activities";

/** Frosted card shell — a link-out with a slim tinted left spine. */
function SourceCard({
  edge,
  href,
  children,
}: {
  edge: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="frost group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-bg-1 px-5 py-4 transition-colors hover:bg-bg-2"
      style={{ borderLeftColor: edge, borderLeftWidth: 3 }}
    >
      {children}
    </a>
  );
}

/** Small tinted eyebrow: a neutral glyph in the source ink + a mono source label. */
function Eyebrow({
  icon: Icon,
  ink,
  children,
}: {
  icon: IconType;
  ink: string;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 font-mono text-mono uppercase tracking-widest text-text-lo">
      <Icon className="size-3.5" aria-hidden={true} />
      <span style={{ color: ink }}>{children}</span>
    </p>
  );
}

/** 64px tinted square holding a glyph — the imagery slot when there's no picture. */
function GlyphTile({ icon: Icon, theme }: { icon: IconType; theme: Theme }) {
  return (
    <span
      className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border"
      style={{ background: theme.bg, color: theme.ink }}
    >
      <Icon className="size-7" aria-hidden={true} />
    </span>
  );
}

/** CSS-checkerboard clipart — the chess "imagery" slot (parallels album art). */
function MiniBoard() {
  return (
    <span
      className="size-16 shrink-0 overflow-hidden rounded-lg border border-border"
      style={{
        backgroundColor: "#eef2f6",
        backgroundImage:
          "repeating-conic-gradient(#64748b 0% 25%, #eef2f6 0% 50%)",
        backgroundSize: "25% 25%",
      }}
      aria-hidden={true}
    />
  );
}

export function SpotifyCard({ np }: { np: NowPlaying }) {
  const eyebrow = np.isPlaying ? "Listening now" : "Last played";
  return (
    <SourceCard edge={SPOTIFY.edge} href={np.url}>
      {np.albumArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={np.albumArt}
          alt=""
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : (
        <GlyphTile icon={Music} theme={SPOTIFY} />
      )}
      <div className="min-w-0 flex-1">
        <Eyebrow icon={Music} ink={SPOTIFY.ink}>
          {eyebrow}
        </Eyebrow>
        <p className="mt-1.5 truncate text-body text-text-hi transition-colors group-hover:text-accent">
          {np.track}
        </p>
        <p className="truncate font-mono text-[0.72rem] uppercase tracking-wider text-text-lo">
          {np.artist}
          {np.album ? ` · ${np.album}` : ""}
        </p>
      </div>
    </SourceCard>
  );
}

export function ChessCard({ chess }: { chess: ChessProfile }) {
  const blitz = chess.ratings.blitz.current;
  if (blitz == null) return null;

  const recent = chess.recentGames.slice(0, 5);
  const w = recent.filter((g) => g.result === "W").length;
  const l = recent.filter((g) => g.result === "L").length;
  const d = recent.filter((g) => g.result === "D").length;
  const record = [
    w ? `${w}W` : "",
    l ? `${l}L` : "",
    d ? `${d}D` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const last = recent[0];

  return (
    <SourceCard edge={CHESS.edge} href="https://www.chess.com/member/nemoblob">
      <MiniBoard />
      <div className="min-w-0 flex-1">
        <Eyebrow icon={Swords} ink={CHESS.ink}>
          Chess · Chess.com
        </Eyebrow>
        <p className="mt-1.5 truncate text-body text-text-hi transition-colors group-hover:text-accent">
          {blitz} blitz
        </p>
        <p className="truncate font-mono text-[0.72rem] uppercase tracking-wider text-text-lo">
          {record ? `${record} last ${recent.length}` : "recent form"}
          {last ? ` · ${RESULT_WORD[last.result]} vs ${last.opponent}` : ""}
        </p>
      </div>
    </SourceCard>
  );
}

export function TrainingCard({ week }: { week: ActivityWeek }) {
  const { activityCount, movingTimeMin, distanceKm, activities } = week;

  if (activityCount === 0) {
    return (
      <SourceCard edge={HEALTH.edge} href={FITBIT_URL}>
        <GlyphTile icon={Activity} theme={HEALTH} />
        <div className="min-w-0 flex-1">
          <Eyebrow icon={Activity} ink={HEALTH.ink}>
            Staying active · Fitbit
          </Eyebrow>
          <p className="mt-1.5 text-body text-text-mid">A quiet week</p>
          <p className="font-mono text-[0.72rem] uppercase tracking-wider text-text-lo">
            Sessions show up here as I log them
          </p>
        </div>
      </SourceCard>
    );
  }

  const noun = activityCount === 1 ? "session" : "sessions";
  return (
    <SourceCard edge={HEALTH.edge} href={activities[0]?.url ?? FITBIT_URL}>
      <GlyphTile icon={Activity} theme={HEALTH} />
      <div className="min-w-0 flex-1">
        <Eyebrow icon={Activity} ink={HEALTH.ink}>
          Staying active · Fitbit
        </Eyebrow>
        <p className="mt-1.5 truncate text-body text-text-hi transition-colors group-hover:text-accent">
          {activityCount} {noun} · {formatDuration(movingTimeMin)}
          {distanceKm > 0 ? ` · ${distanceKm} km` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activities.map((a, i) => {
            const Icon = activityIcon(a.type);
            return (
              <span
                key={`${a.date}-${i}`}
                className="flex size-7 items-center justify-center rounded-md border border-border"
                style={{ background: HEALTH.bg, color: HEALTH.ink }}
              >
                <Icon className="size-3.5" aria-hidden={true} />
              </span>
            );
          })}
        </div>
      </div>
    </SourceCard>
  );
}
