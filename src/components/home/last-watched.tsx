import { getRecentFilms } from "@/lib/letterboxd";

/*
 * Home personality breadcrumb (brand spec: "a tasteful live detail"). Server
 * component — fetches the single most recent Letterboxd film (shared ISR cache
 * with /about/movies) and renders one quiet line. Falls back honestly to the most
 * recent snapshot film. No motion of its own; the hero wraps it in a fade.
 */
export async function LastWatched() {
  const { films } = await getRecentFilms(1);
  const film = films[0];
  if (!film) return null;

  const full = film.rating != null ? "★".repeat(Math.floor(film.rating)) : "";
  const half = film.rating != null && film.rating % 1 ? "½" : "";

  return (
    <p className="mt-8 font-mono text-mono uppercase tracking-widest text-text-lo">
      <span className="text-text-lo/80">Last watched · </span>
      <a
        href={film.filmUrl}
        target="_blank"
        rel="noreferrer"
        className="text-text-mid underline-offset-4 transition-colors hover:text-accent"
      >
        {film.title}
        {film.rating != null && (
          <span
            className="ml-1.5"
            style={{ color: "#8a6410" }}
            aria-label={`${film.rating} out of 5`}
          >
            {full}
            {half}
          </span>
        )}
      </a>
    </p>
  );
}
