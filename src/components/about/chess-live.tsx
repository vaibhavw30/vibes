import type { ChessProfile, Game, Rating } from "@/lib/chess";

/*
 * Presentational live panel for /about/chess. Server component (pure render of
 * fetched data). Blitz leads — it's the real main format. Recent games show the
 * losses too (the intro copy promises it). All color is applied inline (the
 * daydream-sky palette has no green/red/win token — same pattern as the gold
 * carousel precedent). No motion of its own; the subpage wraps it in a Reveal.
 */

const CHESS_GREEN = "#2f7d54";
const LOSS_RED = "#b0553f";

const FORMATS: { key: keyof ChessProfile["ratings"]; label: string }[] = [
  { key: "blitz", label: "Blitz" },
  { key: "bullet", label: "Bullet" },
  { key: "rapid", label: "Rapid" },
];

function RatingCard({ label, rating }: { label: string; rating: Rating }) {
  return (
    <div className="frost rounded-xl border border-border px-4 py-4">
      <p className="font-mono text-mono uppercase tracking-wider text-text-lo">
        {label}
      </p>
      <p className="mt-2 font-serif text-[1.9rem] leading-none text-text-hi">
        {rating.current ?? "—"}
      </p>
      <p className="mt-2 font-mono text-[0.7rem] text-text-lo">
        {rating.best != null && (
          <span style={{ color: CHESS_GREEN }}>peak {rating.best}</span>
        )}
        {rating.games > 0 && (
          <span className="text-text-lo">
            {rating.best != null ? " · " : ""}
            {rating.games.toLocaleString()} games
          </span>
        )}
      </p>
    </div>
  );
}

function ResultChip({ result }: { result: Game["result"] }) {
  const color =
    result === "W" ? CHESS_GREEN : result === "L" ? LOSS_RED : undefined;
  const label = result === "W" ? "Win" : result === "L" ? "Loss" : "Draw";
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-border font-mono text-[0.7rem] font-medium text-text-lo"
      style={
        color
          ? { color, borderColor: `${color}55`, backgroundColor: `${color}14` }
          : undefined
      }
      role="img"
      aria-label={label}
    >
      {result}
    </span>
  );
}

function GameRow({ game }: { game: Game }) {
  return (
    <li>
      <a
        href={game.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 py-3 transition-colors hover:text-text-hi"
      >
        <ResultChip result={game.result} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body text-text-mid group-hover:text-text-hi">
            vs {game.opponent}{" "}
            <span className="font-mono text-[0.72rem] text-text-lo">
              ({game.opponentRating})
            </span>
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-text-lo">
            {game.format} · as {game.color} · {game.myRating}
          </span>
        </span>
      </a>
    </li>
  );
}

export function ChessLive({ ratings, recentGames, live }: ChessProfile) {
  return (
    <div>
      {!live && (
        <p className="mb-6 font-mono text-mono uppercase tracking-wider text-text-lo">
          Showing a recent snapshot ·{" "}
          <a
            href="https://www.chess.com/member/nemoblob"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            nemoblob on Chess.com
          </a>
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {FORMATS.map(({ key, label }) => (
          <RatingCard key={key} label={label} rating={ratings[key]} />
        ))}
      </div>

      {recentGames.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
            Recent games
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {recentGames.map((game) => (
              <GameRow key={game.url} game={game} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
