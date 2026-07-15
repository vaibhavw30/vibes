#!/usr/bin/env node
/*
 * One-time helper to mint a Spotify refresh token for the /now listening line.
 * Zero dependencies (Node built-ins only). Nothing is stored — your client
 * id/secret come from the environment at run time, and the refresh token is
 * printed to YOUR terminal so you can paste it into .env.local / Vercel.
 *
 * Prerequisites (you do this once, logged in as yourself):
 *   1. developer.spotify.com/dashboard → Create app.
 *   2. In the app's settings, add this Redirect URI EXACTLY:
 *        http://127.0.0.1:8888/callback
 *   3. Copy the Client ID and Client Secret.
 *
 * Run it:
 *   SPOTIFY_CLIENT_ID=xxxx SPOTIFY_CLIENT_SECRET=yyyy node scripts/spotify-auth.mjs
 *
 * Then: open the printed URL, click Authorize, and copy the refresh token it
 * prints. Put all three (id, secret, refresh token) in .env.local — never commit.
 */

import http from "node:http";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env. Run:\n  SPOTIFY_CLIENT_ID=xxxx SPOTIFY_CLIENT_SECRET=yyyy node scripts/spotify-auth.mjs",
  );
  process.exit(1);
}

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
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
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64",
    );
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
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
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
    console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}\n`);
  } catch (err) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error("\n✗ Token exchange failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nSpotify auth helper running.");
  console.log("\n1) Open this URL in your browser and click Authorize:\n");
  console.log(`   ${authUrl}\n`);
  console.log("2) The refresh token will print here after you approve.\n");
});
