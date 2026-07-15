import Image from "next/image";
import type { Film } from "@/lib/letterboxd";

/*
 * Presentational poster grid for /about/movies. Server component (pure render of
 * fetched data). Posters hot-link Letterboxd's CDN via next/image; a missing
 * poster degrades to a frosted title tile (never a broken image). All hover motion
 * is transform/opacity and reduced-motion-gated.
 */

function StarRating({ rating }: { rating: number }) {
  // rating is 0.5–5.0 in 0.5 steps. Render 5 slots: full / half / empty.
  const label = `${rating} out of 5`;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={label}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i)); // 0, 0.5, or 1
        return (
          <span
            key={i}
            aria-hidden="true"
            className="relative block h-3 w-3 text-[0.75rem] leading-none"
          >
            <span className="absolute inset-0 text-border-strong">★</span>
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%`, color: "#8a6410" }}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

function PosterCard({ film }: { film: Film }) {
  return (
    <a
      href={film.filmUrl}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <div className="frost relative aspect-[2/3] overflow-hidden rounded-xl border border-border transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title}${film.year ? ` (${film.year})` : ""} poster`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 22vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center">
            <span className="font-serif text-body text-text-hi">
              {film.title}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <p className="truncate font-serif text-body text-text-hi">
          {film.title}
          {film.liked && (
            <span className="ml-1.5 text-accent" aria-label="liked" role="img">
              ♥
            </span>
          )}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-mono text-text-lo">
            {film.year ?? ""}
          </span>
          {film.rating != null && <StarRating rating={film.rating} />}
        </div>
      </div>
    </a>
  );
}

export function MoviesGrid({
  films,
  live,
}: {
  films: Film[];
  live: boolean;
}) {
  return (
    <div>
      {!live && (
        <p className="mb-6 font-mono text-mono uppercase tracking-wider text-text-lo">
          Showing a recent snapshot ·{" "}
          <a
            href="https://letterboxd.com/vaibzz/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            @vaibzz on Letterboxd
          </a>
        </p>
      )}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
        {films.map((film) => (
          <li key={film.filmUrl}>
            <PosterCard film={film} />
          </li>
        ))}
      </ul>
    </div>
  );
}
