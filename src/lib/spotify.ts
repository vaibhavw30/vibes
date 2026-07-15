/*
 * Spotify live-data layer (Phase 6, module #3 — first OAuth module). Server-only:
 * import ONLY from server components. Uses the Web API with a long-lived refresh
 * token that is exchanged for a short-lived access token SERVER-SIDE on each
 * render (the client id/secret/refresh token never reach the browser). Reads the
 * "currently playing" track and falls back to the most recently played one when
 * nothing is on. Any failure — or missing credentials — returns a static snapshot
 * with `live: false`, so the /now page is never broken/empty.
 *
 * Setup (the account owner does this once): see scripts/spotify-auth.mjs and the
 * Spotify block in .env.example.
 */

export type NowPlaying = {
  isPlaying: boolean; // true = playing right now; false = most recent track
  track: string;
  artist: string;
  album: string;
  albumArt: string | null; // smallest sufficient image URL, or null
  url: string; // open.spotify.com track link
  live: boolean; // false = static fallback (no creds / API down)
};

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

// Honest static snapshot — shown until the account owner mints a refresh token,
// or whenever the live fetch fails. TODO(vaibhav): replace with a track you'd
// actually vouch for (this is a placeholder), or just wire the token and it's moot.
const FALLBACK: NowPlaying = {
  isPlaying: false,
  track: "Redbone",
  artist: "Childish Gambino",
  album: "\"Awaken, My Love!\"",
  albumArt: null,
  url: "https://open.spotify.com/track/0wXuerDYiBnERgIpbb3JBR",
  live: false,
};

/** The raw Spotify track shape we read from (both endpoints share it). */
type SpotifyTrack = {
  name: string;
  artists?: { name: string }[];
  album?: { name?: string; images?: { url: string }[] };
  external_urls?: { spotify?: string };
};

/** Pure: a raw Spotify track → our NowPlaying (minus the live/isPlaying flags,
 *  which the caller sets). Picks the smallest album image (last in the array). */
export function mapTrack(
  track: SpotifyTrack,
  isPlaying: boolean,
): Omit<NowPlaying, "live"> {
  const images = track.album?.images ?? [];
  return {
    isPlaying,
    track: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(", "),
    album: track.album?.name ?? "",
    albumArt: images.length ? images[images.length - 1].url : null,
    url: track.external_urls?.spotify ?? "https://open.spotify.com",
  };
}

/** Exchange the refresh token for a short-lived access token (server-side). */
async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN as string,
    }),
    // Never cache the token exchange: access tokens are short-lived, and a cached
    // (stale/expired) token — the Data Cache persists across restarts — causes 401s
    // downstream. The GET calls below carry the ISR window instead.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token HTTP ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Spotify token response had no token");
  return json.access_token;
}

/** Server-only. Returns the currently-playing track, or the most recently played
 *  one when nothing is on; on any failure (or missing creds) returns the static
 *  fallback with `live: false`. Near-live via short ISR (30s). */
export async function getNowPlaying(): Promise<NowPlaying> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return FALLBACK;
  try {
    const token = await getAccessToken();
    const auth = { Authorization: `Bearer ${token}` };

    // 1) Currently playing. 204 = nothing on right now → fall through to recent.
    const now = await fetch(NOW_PLAYING_URL, {
      headers: auth,
      next: { revalidate: 30 },
    });
    if (now.ok && now.status !== 204) {
      const data = (await now.json()) as { item?: SpotifyTrack | null };
      if (data.item) return { ...mapTrack(data.item, true), live: true };
    }

    // 2) Most recently played.
    const recent = await fetch(RECENT_URL, {
      headers: auth,
      next: { revalidate: 30 },
    });
    if (!recent.ok) throw new Error(`Spotify recent HTTP ${recent.status}`);
    const data = (await recent.json()) as {
      items?: { track: SpotifyTrack }[];
    };
    const track = data.items?.[0]?.track;
    if (!track) throw new Error("no recently-played track");
    return { ...mapTrack(track, false), live: true };
  } catch (err) {
    console.error("[spotify] live fetch failed, using fallback:", err);
    return FALLBACK;
  }
}
