# Sift web workspace

The workspace is at `dist/app/`. It uses the same command handlers, user IDs,
SQLite store and background runners as the Telegram bot. It is a static HTML,
CSS and JavaScript client; there are no runtime frontend dependencies or paid
services introduced here.

## Views

- Discover: description input, draft review, source status, saved candidate checks.
- My agent: current rules, unresolved instructions, audit and scan controls.
- Watchlist: prepare, review and control the bot's fixed-pool liquidity monitors.
- Alerts: recorded calls and saved discovery/monitor reports, with Copy CA.
- Performance: all-call paper observations, delivery counts and missing horizons.
- Groups: existing owner destinations and the bot's admin-verified controls.
- Account menu: sign-out and quick navigation, with follow-ups and UTC quiet
  hours inside a closed notification-preferences disclosure. There is no settings page.

The main screen has no filter strip or mode switch. Token checks start with a
market snapshot; additional evidence types are tucked inside a disclosure. Saved
screening rules and notification preferences are never replaced with UI defaults.

Reviews appear in a dialog using the bot's original explanations and controls.
Draft acceptance, approval and scan activation remain separate actions. Existing
unresolved instructions are retained. The app does not invent evidence, remove
screening requirements, or infer a safe coin from a successful API request.

The rabbit and city scene use the approved reference artwork directly (`reference-art.jpg`), with animated particles and actual account labels overlaid at runtime. The source image is unchanged; its example token rows are not used as app data.

The pixel rabbit animation is decorative. Its motion is independent of market
activity. It supports pointer interaction, pause and reduced motion.

## Connect the backend

The shared backend is merged into the `codex/live-discovery-check` branch of
[Sift-bot](https://github.com/Damianonyx/Sift-bot/tree/codex/live-discovery-check).
The bot must run on Node 24. In that bot's local configuration, set:

```dotenv
SIFT_WEB_ENABLED=true
SIFT_WEB_ROOT=../SiftAgent/dist/app
SIFT_WEB_PORT=3000
SIFT_WEB_HOST=127.0.0.1
SIFT_WEB_ORIGIN=http://localhost:3000
```

`SIFT_WEB_ROOT` is relative to the bot process directory, or can be absolute.
Keep the existing bot token, tester allowlist and data directory. Start the bot
once with `npm start`. Do not start a second polling process or copy its database
into this repository. Send `/web` privately to @SiftAgentbot and open its link.

On Codespaces, forward port 3000 and configure its exact HTTPS origin in
`SIFT_WEB_ORIGIN`, with `SIFT_WEB_HOST=0.0.0.0`. Keep the forwarded port private
while testing as its owner. Codespaces access authentication is separate from
Sift's tester authentication. Other testers need a reachable deployment later;
this change does not migrate hosting or provision an always-on service.

[Open the existing Codespace](https://effective-carnival-wr5j9v5g9775c95q9.github.dev/).

## Vercel and origins

The public [web app](https://siftagent-five.vercel.app/app/) is linked from the
official website. It opens without the Vercel login used to protect branch previews.
The existing Vercel static deployment serves `/app/` as a signed-out interface.
It cannot run the long-lived polling bot or access its SQLite database. A static
deployment alone is **not** a working backend. For this milestone, the bot's
optional HTTP server serves the same `dist/app` files alongside `/api` on one
origin. The Telegram sign-in link points to that runtime.

When hosting is configured later, the app and `/api` must share one trusted HTTPS
origin (directly or through a reverse proxy). No cross-origin cookie workaround,
bot token in frontend code, or permissive CORS is used. Do not add the Telegram
token to Vercel frontend configuration.

## Access and privacy

Private `/web` links are random, single-use and expire after five minutes. The
server derives identity from Telegram, not a browser-supplied user ID. Sessions
expire after eight hours and use HttpOnly, SameSite=Strict cookies; HTTPS uses
Secure cookies. No tokens are stored in localStorage. Login fragments are removed
from the browser URL before data requests. A bot restart expires sessions.

Requests require the configured Host, same-origin POSTs, a session CSRF token,
tester access and bounded input. Review actions are session-bound and expire.
Commands retain ownership, revision and admin checks from the bot. `/web logout`
revokes all that user's web sessions. Signing out does not stop their scans.
No chat transcripts or personal screenshots are bundled with this app.

## Verification

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node scripts/verify-workspace-static.cjs
SIFT_BOT_ROOT=../Sift-bot node scripts/verify-workspace.cjs
```

The integration test uses the real web server, store, parser, approval controls,
monitoring controls and discovery runner with **synthetic provider/Telegram
adapters and an isolated in-memory database**. It checks sign-in (including an
already-open tab), rules, separate activation, saved results, Copy CA, monitors,
all views, sign-out, mobile layouts and reduced motion. It never sends Telegram
messages or inspects a user's real database. Artifacts are gitignored.

Live activation with the operator's bot token, public HTTPS routing and real
testers has not been verified by these tests. No new positive risk-evidence
coverage is implied by this interface.
