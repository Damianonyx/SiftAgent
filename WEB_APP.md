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

Draft reviews link directly to supported mappings. Scope choices open a preview;
applying a mapping still requires a separate action, followed by approval. The
empty discovery view identifies drafts awaiting clarification and policies that
require evidence Sift cannot currently establish. No scope is selected by default.

Saved checks distinguish failed required rules, unknown evidence, source failures,
matches and matches with warnings. Select a result to see the recorded rule
outcomes and observed values without making a fresh provider request. A separate
button requests a new token check. Unapproved drafts are not used for saved checks.

Background refreshes preserve the monitor form, including focus and cursor
position. Unsaved monitor inputs stay in memory across views and clear on sign-out
or session expiry. A failed refresh shows a connection notice and the last loaded
time instead of claiming the backend is connected. Closing a pending report does
not cancel a submitted action; a late response cannot reopen it or replace a newer
dialog. Review the saved state to confirm the outcome.

The rabbit and city scene use the approved reference artwork directly (`reference-art.jpg`), with animated particles and actual account labels overlaid at runtime. The source image is unchanged; its example token rows are not used as app data.

The pixel rabbit animation is decorative. Its motion is independent of market
activity. It supports pointer interaction, pause and reduced motion.

## Install identity

The website and workspace share `dist/app/manifest.webmanifest`. The installed
name is **Sift**, the launch URL is `/app/`, and the launch background is yellow.
The icon set uses the full-body black pixel rabbit on yellow, including an Apple
touch icon and a padded maskable icon for Android. The workspace's animated
rabbit scene is unchanged.

The browser and operating system control the launch-screen layout. Existing
shortcuts may retain their old name or icon; removing the shortcut and installing
again from `/app/` refreshes them. Installation still requires network access and
does not activate the bot backend or add offline support.

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

On Codespaces, use `npm run start:web` from the bot repository. It sets the exact
forwarded HTTPS origin automatically and binds to loopback port 3000. Stop the
previous bot terminal first, then keep the forwarded port private while testing
as its owner. Codespaces access authentication is separate from Sift's tester
authentication. Other testers need a reachable deployment later; this change
does not migrate hosting or provision an always-on service.

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
SIFT_BOT_ROOT=../Sift-bot node scripts/verify-workspace-proxy.cjs
SIFT_BOT_ROOT=../Sift-bot node scripts/verify-workspace-recovery.cjs
```

The integration test uses the real web server, store, parser, approval controls,
monitoring controls and discovery runner with **synthetic provider/Telegram
adapters and an isolated in-memory database**. It checks sign-in (including an
already-open tab), rules, separate activation, saved results, Copy CA, monitors,
all views, sign-out, mobile layouts and reduced motion. It never sends Telegram
messages or inspects a user's real database. Artifacts are gitignored.

The proxy regression also requires OpenSSL. It uses disposable localhost TLS
and the same isolated bot fixture to check browser sign-in, Secure/HttpOnly
cookies, commands and logout when a tunnel rewrites both Host and Origin. A
cross-origin browser login remains rejected even if its Origin is rewritten.
The test certificate is deleted afterwards; no TLS checks are disabled in Sift.

The recovery regression uses a phone browser profile to exercise scope previews,
mapping and approval, incomplete evidence blocking delivery, saved-result details,
refresh while typing, a simulated connection outage, delayed report responses,
session revocation and isolation of unsaved inputs between accounts. All data and
deliveries remain synthetic and local to the test runtime.

Live activation with the operator's bot token, public HTTPS routing and real
testers has not been verified by these tests. No new positive risk-evidence
coverage is implied by this interface.
