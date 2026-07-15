/*
 * Minimal Upstash Redis client over its REST API — no npm dependency, just fetch
 * (keeps the project's zero-dependency rule intact while adding the service). Used
 * only to persist Fitbit's rotating refresh token, which can't live in a static
 * env var. Commands go as a JSON array in the POST body; Upstash replies { result }.
 * Server-only; never cached.
 */

const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Whether an Upstash datastore is configured (both env vars present). */
export function redisConfigured(): boolean {
  return Boolean(URL_ && TOKEN);
}

async function command(args: string[]): Promise<unknown> {
  const res = await fetch(URL_ as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`Upstash error: ${json.error}`);
  return json.result ?? null;
}

/** GET key → string value, or null if unset. */
export async function redisGet(key: string): Promise<string | null> {
  const result = await command(["GET", key]);
  return typeof result === "string" ? result : null;
}

/** SET key = value. */
export async function redisSet(key: string, value: string): Promise<void> {
  await command(["SET", key, value]);
}
