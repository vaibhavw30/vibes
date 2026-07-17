import type { NowPlaying } from "@/lib/spotify";

/*
 * Presentational listening line for /now. Server component (pure render of a
 * NowPlaying). Mirrors the home "last watched" breadcrumb idiom — a quiet mono
 * eyebrow + one linked line, plus a small album thumbnail when Spotify gives us
 * one. "Listening now" when live-playing, else "Last played". No motion of its
 * own; the page wraps it in a Reveal. Honesty about a fallback snapshot is
 * carried at the page level, not on this line.
 */
export function NowPlayingLine({ np }: { np: NowPlaying }) {
  const eyebrow = np.isPlaying ? "Listening now" : "Last played";
  return (
    <div className="flex items-center gap-3">
      {np.albumArt && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={np.albumArt}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-md border border-border object-cover"
        />
      )}
      <p className="min-w-0 font-mono text-mono uppercase tracking-widest text-text-lo">
        <span className="text-text-lo/80">{eyebrow} · </span>
        <a
          href={np.url}
          target="_blank"
          rel="noreferrer"
          className="text-text-mid underline-offset-4 transition-colors hover:text-accent"
        >
          {np.track}
          <span className="text-text-lo"> · {np.artist}</span>
        </a>
      </p>
    </div>
  );
}
