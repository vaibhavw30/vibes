#!/usr/bin/env node
/*
 * One-time helper to mint the SEED Fitbit refresh token for the "Staying active"
 * feed. Zero dependencies (Node built-ins only). Nothing is stored — your client
 * id/secret come from the environment at run time, and the refresh token is
 * printed to YOUR terminal so you can paste it into .env.local / Vercel.
 *
 * Fitbit rotates refresh tokens, so this seed is only the STARTING point — once the
 * app runs, it stores the rotating token in Upstash Redis and the seed is ignored.
 *
 * Prerequisites (you do this once, logged in as yourself):
 *   1. dev.fitbit.com → Register an App (Manage → Register an app).
 *        - OAuth 2.0 Application Type: Personal
 *        - Callback URL: http://127.0.0.1:8888/callback
 *        - Default Access Type: Read Only
 *   2. Copy the OAuth 2.0 Client ID and Client Secret.
 *
 * Run it:
 *   FITBIT_CLIENT_ID=xxxx FITBIT_CLIENT_SECRET=yyyy node scripts/fitbit-auth.mjs
 *
 * Then: open the printed URL, click Allow, and copy the refresh token it prints.
 */

import http from "node:http";

const CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "activity";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env. Run:\n  FITBIT_CLIENT_ID=xxxx FITBIT_CLIENT_SECRET=yyyy node scripts/fitbit-auth.mjs",
  );
  process.exit(1);
}

const authUrl =
  "https://www.fitbit.com/oauth2/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: SCOPE,
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
    const tokenRes = await fetch("https://api.fitbit.com/oauth2/token", {
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
    console.log(`FITBIT_CLIENT_ID=${CLIENT_ID}`);
    console.log(`FITBIT_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`FITBIT_REFRESH_TOKEN=${json.refresh_token}\n`);
    console.log("(then add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)\n");
  } catch (err) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error("\n✗ Token exchange failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nFitbit auth helper running.");
  console.log("\n1) Open this URL in your browser and click Allow:\n");
  console.log(`   ${authUrl}\n`);
  console.log("2) The refresh token will print here after you approve.\n");
});
