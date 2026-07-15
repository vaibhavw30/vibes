# Letterboxd Live-Data Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/about/movies` `ComingLive` placeholder with a live poster grid from Vaibhav's public Letterboxd RSS feed, and add one live "last watched" breadcrumb near the home hero — both from one server-side data layer, both failing gracefully to a static snapshot.

**Architecture:** A single server-only data module (`src/lib/letterboxd.ts`) fetches the public RSS with a browser User-Agent (the default fetcher gets a 403), parses it with a zero-dependency string parser into a typed `Film[]`, and returns `{ films, live }` — falling back to a baked-in snapshot of real recent films on any failure. Two server components consume it: the `/about/movies` page (full grid) and a home `LastWatched` breadcrumb.

**Tech Stack:** Next.js 16 (App Router, server components, ISR via `fetch` `next.revalidate`), React 19, TypeScript, Tailwind v4, `next/image`. No new dependencies.

## Global Constraints

- **This is a customized Next.js** — read `node_modules/next/dist/docs/` before using any unfamiliar API; heed deprecation notices. (AGENTS.md)
- **No new npm dependencies.** RSS is parsed by hand (`server-only` is NOT installed — do not import it).
- **Design source of truth:** `docs/DESIGN_HANDOFF.md` ("Daydream sky" light theme). Reuse tokens: `--accent #2a67a6`, `text-hi`, `text-mid`, `text-lo`, `bg-1`/`bg-2`, `border`/`border-strong`, `.frost` surface, `.measure`. Type: `font-serif` (titles), `font-mono` (labels/dates), `text-small`/`text-mono`.
- **Performance law:** animate `transform`/`opacity`/`color` only; every motion path gates on reduced-motion (`motion-reduce:` utilities) and collapses to static.
- **Quality floor:** never render a broken/empty state. Fetch failure → static fallback with an honest "recent snapshot" note; broken poster → title tile.
- **Content honesty:** all films/ratings/dates are real (live feed or the real-data fallback). Never fabricate.
- **Server-only fetch:** `src/lib/letterboxd.ts` is imported ONLY from server components — never from a `"use client"` file.
- **Verify each task:** `npm run lint` and `npm run build` must be clean before commit. There is no unit-test runner in this repo; the parser is verified with a throwaway Node script against a saved real RSS sample, and UI is verified in the browser preview.

---

## File Structure

- **Create** `src/lib/letterboxd.ts` — types, `parseFilms(xml)`, `getRecentFilms(limit)`, `FALLBACK_FILMS`. One responsibility: turn the feed into typed data.
- **Create** `src/components/about/movies-grid.tsx` — presentational grid + `StarRating`. One responsibility: render `Film[]`.
- **Modify** `src/app/about/movies/page.tsx` — async server component rendering the grid.
- **Create** `src/components/home/last-watched.tsx` — the one-line home breadcrumb.
- **Modify** `src/app/page.tsx` — render `<LastWatched />` under the hero.
- **Modify** `next.config.ts` — add `images.remotePatterns` for `a.ltrbxd.com`.
- **Modify** `.env.example` — note the `vaibzz` default + browser-UA requirement.

---

## Task 1: Letterboxd data layer

**Files:**
- Create: `src/lib/letterboxd.ts`
- Modify: `.env.example`
- Verify: throwaway Node script against a saved RSS sample (below)

**Interfaces:**
- Produces:
  - `type Film = { title: string; year: string | null; rating: number | null; liked: boolean; watchedDate: string; filmUrl: string; posterUrl: string | null; rewatch: boolean }`
  - `function parseFilms(xml: string): Film[]` (pure)
  - `async function getRecentFilms(limit?: number): Promise<{ films: Film[]; live: boolean }>` (default `limit = 12`)
- Consumes: nothing.

- [ ] **Step 1: Create the data module**

Create `src/lib/letterboxd.ts` with exactly this content:

```ts
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
```

- [ ] **Step 2: Write the throwaway parser verification script**

Create `scratch-letterboxd-check.mjs` at the repo root (temporary — deleted in Step 5):

```js
// Verifies parseFilms against a real saved RSS sample. Not committed.
import { readFileSync } from "node:fs";

// Inline a copy of parseFilms' logic OR import via a tiny transpile. Simplest:
// re-implement the two helpers + parseFilms here by copy, then assert. To avoid
// drift, instead import the compiled module is overkill — copy the three funcs:
const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'");
const tag = (item, name) => {
  const m = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : null;
};
function parseFilms(xml) {
  const items = xml.split("<item>").slice(1).map((s) => s.split("</item>")[0]);
  const films = [];
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
      rating,
      liked: tag(item, "letterboxd:memberLike") === "Yes",
      watchedDate: tag(item, "letterboxd:watchedDate") ?? "",
      filmUrl: tag(item, "link"),
      posterUrl: poster ? poster[1] : null,
      rewatch: tag(item, "letterboxd:rewatch") === "Yes",
    });
  }
  return films;
}

const xml = readFileSync(process.argv[2], "utf8");
const films = parseFilms(xml);
console.log("parsed", films.length, "films");
console.log(JSON.stringify(films.slice(0, 2), null, 2));
const f = films[0];
const ok =
  films.length >= 4 &&
  f.title === "Good Will Hunting" &&
  f.year === "1997" &&
  f.rating === 5 &&
  f.liked === true &&
  f.watchedDate === "2026-07-06" &&
  f.posterUrl?.startsWith("https://a.ltrbxd.com/") &&
  f.filmUrl?.includes("good-will-hunting");
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
```

- [ ] **Step 3: Run the verification against the saved sample**

A real RSS sample was saved earlier this session at the scratchpad path below. If it is gone, re-fetch it first:

```bash
# Re-fetch only if the sample is missing:
curl -sS -A "Mozilla/5.0 AppleWebKit/537.36" \
  "https://letterboxd.com/vaibzz/rss/" -o /tmp/lbxd.xml

node scratch-letterboxd-check.mjs /tmp/lbxd.xml
```

Expected output: `parsed 12 films` (count may vary), the first two films as JSON, and a final `PASS`.

If it prints `FAIL`, fix `parseFilms` in `src/lib/letterboxd.ts` AND the copy in the script until it passes (they must stay identical).

- [ ] **Step 4: Update `.env.example`**

In `.env.example`, replace the `LETTERBOXD_USERNAME=` line's block with:

```
# ── Letterboxd (High priority) ───────────────────────────────────────────────
# No auth. Public RSS feed parsed at build/ISR. Powers /about/movies + home breadcrumb.
# Defaults to "vaibzz" if unset. NOTE: Letterboxd 403s a default fetcher UA — the
# server fetch sends a browser User-Agent (see src/lib/letterboxd.ts).
LETTERBOXD_USERNAME=
```

- [ ] **Step 5: Delete the scratch script and commit**

```bash
rm -f scratch-letterboxd-check.mjs
git add src/lib/letterboxd.ts .env.example
git commit -m "feat: Letterboxd data layer (server fetch, RSS parse, static fallback)"
```

---

## Task 2: `/about/movies` live poster grid

**Files:**
- Create: `src/components/about/movies-grid.tsx`
- Modify: `src/app/about/movies/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `Film`, `getRecentFilms` from `src/lib/letterboxd.ts`.
- Produces: `function MoviesGrid({ films, live }: { films: Film[]; live: boolean })`.

- [ ] **Step 1: Allow Letterboxd's poster host in `next/image`**

In `next.config.ts`, add an `images` block to `nextConfig` (keep the existing `turbopack` block):

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "*.ltrbxd.com" },
    ],
  },
};
```

- [ ] **Step 2: Create the grid component**

Create `src/components/about/movies-grid.tsx`:

```tsx
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
              className="absolute inset-0 overflow-hidden text-gold"
              style={{ width: `${fill * 100}%` }}
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
```

- [ ] **Step 3: Wire the grid into the movies page**

Replace the entire contents of `src/app/about/movies/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { InterestSubpage } from "@/components/about/interest-subpage";
import { MoviesGrid } from "@/components/about/movies-grid";
import { getRecentFilms } from "@/lib/letterboxd";

export const metadata: Metadata = {
  title: "Movies",
  description: "Everything I watch, logged on Letterboxd.",
};

export default async function MoviesPage() {
  const { films, live } = await getRecentFilms(12);
  return (
    <InterestSubpage
      eyebrow="About · Film"
      title="Everything I watch."
      intro="I log every film on Letterboxd. It's the closest thing I keep to a diary, and I'm not above rating something five stars for reasons I can't defend."
    >
      <MoviesGrid films={films} live={live} />
    </InterestSubpage>
  );
}
```

- [ ] **Step 4: Lint, build, and verify in the browser**

```bash
npm run lint && npm run build
```

Expected: both clean (no errors). Then, with the dev server running (`next dev`, port 3000), open `http://localhost:3000/about/movies` in the browser preview and verify:
- Poster grid renders (2 cols mobile → 4 cols desktop), newest film first.
- Posters load through `next/image` (check no broken images; `read_network_requests` shows 200s from `a.ltrbxd.com`).
- Star ratings show correct fills; year + liked heart present where applicable.
- No console errors; server logs show NO `403` and NO "using fallback" line (confirms the live fetch + browser UA works).
- Reduced-motion + mobile width: grid reflows to 2 cols, hover lift disabled.

If the server log shows the fallback line, the live fetch failed — inspect the logged error (likely the UA header) before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/components/about/movies-grid.tsx src/app/about/movies/page.tsx next.config.ts
git commit -m "feat: live Letterboxd poster grid on /about/movies"
```

---

## Task 3: Home "last watched" breadcrumb

**Files:**
- Create: `src/components/home/last-watched.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getRecentFilms` from `src/lib/letterboxd.ts`.
- Produces: `async function LastWatched()` (a server component, no props).

- [ ] **Step 1: Read the home page to find the insertion point**

Read `src/app/page.tsx` in full. It currently renders `<Hero />` first inside `<main>` (or a fragment). The breadcrumb goes directly after `<Hero />` so it reads as a quiet detail under the hero. Note the exact JSX wrapper (fragment vs `<main>`) so Step 3 inserts cleanly.

- [ ] **Step 2: Create the breadcrumb component**

Create `src/components/home/last-watched.tsx`:

```tsx
import { getRecentFilms } from "@/lib/letterboxd";

/*
 * Home personality breadcrumb (brand spec: "a tasteful live detail"). Server
 * component — fetches the single most recent Letterboxd film (shared ISR cache
 * with /about/movies) and renders one quiet line. Falls back honestly to the most
 * recent snapshot film. No motion.
 */
export async function LastWatched() {
  const { films } = await getRecentFilms(1);
  const film = films[0];
  if (!film) return null;
  return (
    <p className="mt-10 font-mono text-mono uppercase tracking-wider text-text-lo">
      <span className="text-text-lo/80">Last watched · </span>
      <a
        href={film.filmUrl}
        target="_blank"
        rel="noreferrer"
        className="text-text-mid underline-offset-4 transition-colors hover:text-accent"
      >
        {film.title}
        {film.rating != null && (
          <span className="ml-1.5 text-gold" aria-label={`${film.rating} out of 5`}>
            {"★".repeat(Math.floor(film.rating))}
            {film.rating % 1 ? "½" : ""}
          </span>
        )}
      </a>
    </p>
  );
}
```

- [ ] **Step 3: Render the breadcrumb under the hero**

In `src/app/page.tsx`, add the import and place `<LastWatched />` immediately after `<Hero />`. Example (match the file's actual wrapper from Step 1):

```tsx
import { Hero } from "@/components/home/hero";
import { LastWatched } from "@/components/home/last-watched";
// ...other imports unchanged...

export default function HomePage() {
  return (
    <>
      <Hero />
      <LastWatched />
      {/* ...rest of the sections unchanged... */}
    </>
  );
}
```

If placing it inside the fragment causes it to sit outside the hero's horizontal padding, wrap it: `<div className="mx-auto w-full max-w-... px-6"><LastWatched /></div>` matching the hero/section container width used elsewhere in `page.tsx` (copy the wrapper the neighboring section uses). Keep the fetch in the server component — do NOT move it into `Hero` (a client component).

- [ ] **Step 4: Lint, build, verify in the browser**

```bash
npm run lint && npm run build
```

Expected: clean. Then open `http://localhost:3000/` and verify:
- A quiet "Last watched · <film> ★★★★★" line renders under the hero, aligned with the hero content width.
- The film links to its Letterboxd page.
- No console errors; server log shows no fallback line (live fetch OK).
- Reduced motion: line is static and legible. Mobile width: line wraps/reads fine, no overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/last-watched.tsx src/app/page.tsx
git commit -m "feat: live 'last watched' Letterboxd breadcrumb on home"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** data layer (Task 1) ✔; `/about/movies` grid + `next.config` posters (Task 2) ✔; home breadcrumb (Task 3) ✔; browser-UA fetch ✔ (Task 1 code + verified in Task 2/3); ISR 3600 ✔ (Task 1); fallback + honest snapshot note ✔ (Task 1 + Task 2 Step 2); poster-missing tile ✔ (Task 2); a11y star aria-label + alt text ✔ (Task 2); reduced-motion ✔ (Task 2/3). Out-of-scope items (Chess/YouTube/Spotify/Strava/Recipes, carousel film panel, reviews text, pagination) correctly untouched.
- **Placeholder scan:** no TBD/TODO; every code step shows complete code; the one "match the actual wrapper" note (Task 3 Step 3) is a real conditional with the exact fallback wrapper given.
- **Type consistency:** `Film` shape identical across `letterboxd.ts`, `movies-grid.tsx`, `last-watched.tsx`; `getRecentFilms` returns `{ films, live }` consumed consistently; `parseFilms` copy in the scratch script matches the module (Task 1 Step 3 enforces this).
