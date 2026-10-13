# Verification

Checked on 2026-10-13.

- JavaScript syntax and local asset/anchor references pass.
- Stub-DOM checks exercised navigation, walkthrough controls, particle frame scheduling, pause/resume, offscreen suspension, reduced motion, and unavailable-image/canvas fallbacks.
- The hero uses the supplied mascot and follows the uploaded screen recording's centered layout, dark background, particle field and text reveal.
- Deployment is configured as a static website, with `dist/` as the output directory and no install/build command or environment variables.

Real browser rendering and touch interactions have not been validated in this environment. Vercel deployment and domain setup must be verified after import.

Product demonstrations are illustrative. The website does not run the Telegram bot, scans, monitoring, trading or AI requests.
