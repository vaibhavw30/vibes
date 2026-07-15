/*
 * Letterboxd live-data layer (Phase 6, module #1). Server-only: import ONLY from
 * server components. Fetches the public RSS feed with a browser User-Agent (the
 * default fetcher UA gets a 403 from Letterboxd) and parses it by hand — the feed
 * shape is fixed, so no XML-parser dependency. Any failure returns a real-data
 * fallback with `live: false` so the page is never broken/empty.
 */

export type Film = {
  title: string;
  year: string | null;
  rating: number | null; // 0.5–5.0, or null if unrated
  liked: boolean;
  watchedDate: string; // "YYYY-MM-DD"
  filmUrl: string;
  posterUrl: string | null;
  rewatch: boolean;
};

const USERNAME = process.env.LETTERBOXD_USERNAME || "vaibzz";
const RSS_URL = `https://letterboxd.com/${USERNAME}/rss/`;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Real recent entries (captured 2026-07-14) — an honest snapshot when live fails.
const FALLBACK_FILMS: Film[] = [
  {
    title: "Good Will Hunting",
    year: "1997",
    rating: 5,
    liked: true,
    watchedDate: "2026-07-06",
    filmUrl: "https://letterboxd.com/vaibzz/film/good-will-hunting/",
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/5/1/6/2/1/51621-good-will-hunting-0-600-0-900-crop.jpg?v=acb4766abd",
    rewatch: false,
  },
  {
    title: "Se7en",
    year: "1995",
    rating: 4.5,
    liked: false,
    watchedDate: "2026-07-06",
    filmUrl: "https://letterboxd.com/vaibzz/film/se7en/",
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/5/1/3/4/5/51345-se7en-0-600-0-900-crop.jpg?v=76a14ef6b4",
    rewatch: false,
  },
  {
    title: "Sicario",
    year: "2015",
    rating: 4,
    liked: false,
    watchedDate: "2026-06-13",
    filmUrl: "https://letterboxd.com/vaibzz/film/sicario-2015/",
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/1/9/7/6/2/8/197628-sicario-0-600-0-900-crop.jpg?v=06d4163bb2",
    rewatch: false,
  },
  {
    title: "Parasite",
    year: "2019",
    rating: 4,
    liked: true,
    watchedDate: "2026-06-13",
    filmUrl: "https://letterboxd.com/vaibzz/film/parasite-2019/",
    posterUrl:
      "https://a.ltrbxd.com/resized/film-poster/4/2/6/4/0/6/426406-parasite-0-600-0-900-crop.jpg?v=8f5653f710",
    rewatch: false,
  },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

function tag(item: string, name: string): string | null {
  const m = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : null;
}

/** Pure: RSS XML string → Film[]. Keeps only real film logs (those with a
 *  filmTitle), so profile/list entries are skipped. */
export function parseFilms(xml: string): Film[] {
  const items = xml
    .split("<item>")
    .slice(1)
    .map((s) => s.split("</item>")[0]);
  const films: Film[] = [];
  for (const item of items) {
    const title = tag(item, "letterboxd:filmTitle");
    if (!title) continue;
    const ratingRaw = tag(item, "letterboxd:memberRating");
    const rating = ratingRaw ? Number.parseFloat(ratingRaw) : null;
    const desc = tag(item, "description") ?? "";
    const poster = desc.match(/<img src="([^"]+)"/);
    films.push({
      title: decodeEntities(title),
      year: tag(item, "letterboxd:filmYear"),
      rating: rating != null && Number.isFinite(rating) ? rating : null,
      liked: tag(item, "letterboxd:memberLike") === "Yes",
      watchedDate: tag(item, "letterboxd:watchedDate") ?? "",
      filmUrl: tag(item, "link") ?? `https://letterboxd.com/${USERNAME}/`,
      posterUrl: poster ? poster[1] : null,
      rewatch: tag(item, "letterboxd:rewatch") === "Yes",
    });
  }
  return films;
}

/** Server-only. Fetches + parses the live feed (ISR hourly); on any failure
 *  returns the real-data fallback with `live: false`. */
export async function getRecentFilms(
  limit = 12,
): Promise<{ films: Film[]; live: boolean }> {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Letterboxd HTTP ${res.status}`);
    const xml = await res.text();
    const films = parseFilms(xml);
    if (!films.length) throw new Error("no film items parsed");
    return { films: films.slice(0, limit), live: true };
  } catch (err) {
    console.error("[letterboxd] live fetch failed, using fallback:", err);
    return { films: FALLBACK_FILMS.slice(0, limit), live: false };
  }
}
