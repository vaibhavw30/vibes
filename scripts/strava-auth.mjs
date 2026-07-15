#!/usr/bin/env node
/*
 * One-time helper to mint a Strava refresh token for the "Staying active" feed.
 * Zero dependencies (Node built-ins only). Nothing is stored — your client
 * id/secret come from the environment at run time, and the refresh token is
 * printed to YOUR terminal so you can paste it into .env.local / Vercel.
 *
 * Prerequisites (you do this once, logged in as yourself):
 *   1. strava.com/settings/api → create an application.
 *   2. Set "Authorization Callback Domain" EXACTLY to:  127.0.0.1
 *   3. Copy the Client ID and Client Secret.
 *
 * Run it:
 *   STRAVA_CLIENT_ID=xxxx STRAVA_CLIENT_SECRET=yyyy node scripts/strava-auth.mjs
 *
 * Then: open the printed URL, click Authorize, and copy the refresh token it
 * prints. Put all three (id, secret, refresh token) in .env.local — never commit.
 *
 * Scope: activity:read_all — needed to count private sessions too. Drop to
 * activity:read if you only want public activities.
 */

import http from "node:http";

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "activity:read_all";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env. Run:\n  STRAVA_CLIENT_ID=xxxx STRAVA_CLIENT_SECRET=yyyy node scripts/strava-auth.mjs",
  );
  process.exit(1);
}

const authUrl =
  "https://www.strava.com/oauth/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    approval_prompt: "force",
    scope: SCOPE,
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
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });
    const json = await tokenRes.json();
    if (!tokenRes.ok || !json.refresh_token) {
      throw new Error(JSON.stringify(json));
    }

    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end("Done. You can close this tab and return to your terminal.");

    console.log("\n✓ Success. Add these to .env.local (do NOT commit):\n");
    console.log(`STRAVA_CLIENT_ID=${CLIENT_ID}`);
    console.log(`STRAVA_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`STRAVA_REFRESH_TOKEN=${json.refresh_token}\n`);
    console.log(`(granted scopes: ${json.scope ?? "n/a"})\n`);
  } catch (err) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error("\n✗ Token exchange failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nStrava auth helper running.");
  console.log("\n1) Open this URL in your browser and click Authorize:\n");
  console.log(`   ${authUrl}\n`);
  console.log("2) The refresh token will print here after you approve.\n");
});
