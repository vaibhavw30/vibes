#!/usr/bin/env node
/*
 * One-time helper to mint the Google Health API refresh token for the "Staying
 * active" feed. Zero dependencies (Node built-ins only). Nothing is stored — your
 * client id/secret come from the environment at run time, and the refresh token is
 * printed to YOUR terminal so you can paste it into .env.local / Vercel.
 *
 * Unlike Fitbit, Google's PRODUCTION refresh tokens are stable (they don't rotate
 * on every use), so this one token lives in a plain env var — no datastore needed.
 * NOTE: this only holds if the OAuth app is PUBLISHED ("In production"). In
 * "Testing" status Google expires refresh tokens after 7 days.
 *
 * Prerequisites (you do this once, logged in as yourself):
 *   1. console.cloud.google.com → create a project.
 *   2. Enable the Google Health API (APIs & Services → Library → "Google Health API").
 *   3. OAuth consent screen: User type External, add YOUR email under "Test users",
 *      add the scope
 *        https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly
 *      then PUBLISH the app ("In production") so refresh tokens don't expire in 7 days.
 *   4. Credentials → Create OAuth client ID → type "Web application" →
 *      Authorized redirect URI: http://127.0.0.1:8888/callback  (exact).
 *   5. Copy the Client ID and Client Secret.
 *
 * Run it:
 *   GOOGLE_CLIENT_ID=xxxx GOOGLE_CLIENT_SECRET=yyyy node scripts/google-health-auth.mjs
 *
 * Then: open the printed URL, click through the "unverified app" warning (Advanced →
 * Go to … (unsafe) — it's your own app), Allow, and copy the refresh token it prints.
 */

import http from "node:http";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE =
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env. Run:\n  GOOGLE_CLIENT_ID=xxxx GOOGLE_CLIENT_SECRET=yyyy node scripts/google-health-auth.mjs",
  );
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // ask for a refresh token
    prompt: "consent", // force the refresh token even on re-auth
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error || !code) {
    res.writeHead(400).end(`Authorization failed: ${error ?? "no code"}`);
    console.error(`\n✗ Authorization failed: ${error ?? "no code returned"}`);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const json = await tokenRes.json();
    if (!tokenRes.ok || !json.refresh_token) {
      // No refresh_token usually means you've authorized before without prompt=consent,
      // or the app is still in Testing with an already-issued token. This script forces
      // prompt=consent, so a missing token here points at a scope/publish misconfig.
      throw new Error(JSON.stringify(json));
    }

    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end("Done. You can close this tab and return to your terminal.");

    console.log("\n✓ Success. Add these to .env.local (do NOT commit):\n");
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${json.refresh_token}\n`);
  } catch (err) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error("\n✗ Token exchange failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nGoogle Health auth helper running.");
  console.log("\n1) Open this URL in your browser and approve:\n");
  console.log(`   ${authUrl}\n`);
  console.log(
    "   (You'll see an 'unverified app' warning — it's your own app.\n" +
      "    Click Advanced → Go to … (unsafe) → Allow.)\n",
  );
  console.log("2) The refresh token will print here after you approve.\n");
});
