# Verification

## Public website · 2026-10-26

The page uses an open editorial layout inspired by AllScale with Sift’s own
copy, yellow palette and approved rabbit artwork. It is a static site; the
product previews are illustrative and do not execute scans or trades.

Verified in real Chromium:

- Responsive layouts at 320, 390, 650, 768, 1024 and 1440px, without horizontal overflow.
- Visible app entry point on mobile, working navigation, keyboard dismissal and FAQ disclosures.
- Website-to-workspace navigation from the header, hero, product preview and closing section.
- The same rabbit artwork on the website and app, with working pause/resume controls.
- Reduced-motion preferences and usable canvas/JavaScript fallbacks.
- Local fonts and assets load without browser errors; no external font requests.

The page states that Solana is available today and other chains are planned.
No additional chain integration is implied by the chain-neutral headline.

## Shared web workspace

Verified using the real bot web server and handlers with synthetic providers,
a recording Telegram adapter and an isolated in-memory database:

- One-use sign-in, HttpOnly session cookie and removal of the login fragment.
- Description review, rule approval and separate scan activation.
- Saved runner results and Copy CA.
- Monitor review and start, desktop navigation and mobile account navigation.
- Notification preferences remain unchanged when opened. An explicit preference
  edit updates the shared account without modifying approved screening rules.
- Advanced controls are disclosed in the account dialog; there is no settings
  page or main-screen filter strip.
- Sign-out, visible artwork, motion controls and responsive layouts.

The companion Sift-bot suite previously passed 279 tests. This interface change
does not modify the bot backend. The public Vercel deployment serves static
files; live Telegram sign-in and shared data still require activation of the
bot web server and the same-origin API connection. Browser tests use no paid
APIs, real Telegram messages or user database.

Not validated: physical devices or non-Chromium engines. Synthetic integration
tests do not establish live provider reliability or complete risk coverage.
