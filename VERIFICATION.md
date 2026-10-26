# Verification

Checked on 2026-10-21 for the Gloam-structure rebuild.

- Real Chromium checks passed at 320, 390, 650, 768, 1024 and 1440px.
- No horizontal page overflow, overlapping hero columns or clipped hero tagline.
- The original canvas simulation animates, scatters, pauses and resumes.
- Reduced-motion preferences start the simulation paused; the supplied mascot remains visible if canvas or JavaScript is unavailable.
- Walkthrough tabs, arrow-key navigation, next-step controls and feature shortcuts work.
- Mobile navigation opens and closes, supports Escape, closes on selection and resets after desktop resizing.
- FAQ disclosure controls work. No browser JavaScript errors or missing local resources were observed.
- Local asset references, in-page links, unique IDs and JavaScript syntax pass.
- Desktop/mobile screenshots were captured for visual review.

Browser evidence: [successful verification run](https://github.com/Damianonyx/SiftAgent/actions/runs/39647991719).
Screenshots are attached to that run and expire after seven days; the workflow can produce new ones.

The layout adapts Gloam’s announcement, framed hero, product introduction, interactive demo, evidence, use-case, documentation and footer structure. All product copy and branding are Sift’s; the supplied mascot, banner and local pixel font are retained.

The website is static. Demonstrations are illustrative and do not run Telegram discovery, monitoring, trading or AI requests. The existing Vercel configuration still serves `dist/` without a build, install step or environment variables.

Not validated: a physical iOS/Android device or other browser engines. Browser checks do not validate Telegram bot or provider behavior.


## Web workspace · 2026-10-26

- Chromium: signed-out layout and connected browser-to-bot flows pass at 320, 390, 768 and 1440px.
- Verified with synthetic data: one-use sign-in, shared criteria, explicit approval and activation, discovery results, Copy CA, monitor setup, navigation, logout and reduced motion.
- The approved rabbit artwork is rendered directly from the reference; no replacement character is used.
- The companion Sift-bot suite passes 279 tests, including eight HTTP/auth/shared-state tests.
- Live Telegram sessions and public HTTPS routing remain unverified. Static Vercel hosting alone does not activate the bot API.
- No paid API, hosting migration or live-account data was used in verification.
