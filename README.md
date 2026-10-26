# Sift Agent

**Sift through the noise. Find your signal.**

Sift is building a personal AI agent for discovering and monitoring
memecoins based on your criteria, directly through Telegram.

Your criteria. Your agent. Every call explained.

## About this repository

This repository contains the Sift website and private web workspace. The page follows a product-first
structure inspired by Gloam, using Sift’s own branding, copy and simulation:

- A spacious hero with Sift’s original interactive pixel mascot.
- Scatter, pause/resume and reduced-motion controls for the simulation.
- A brief introduction, three product pillars and an interactive Telegram walkthrough.
- Evidence principles, research use cases, data sources and private-test FAQs.
- Direct web app entry points in the navigation, hero, closing section and footer.
- Links to the Telegram bot and GitBook documentation.
- A responsive layout for mobile and desktop.

## Project status

Sift is in development and private testing, starting with Solana.

Supported market checks, rule-based discovery, selected on-chain evidence
checks and market monitoring are being tested. Coverage varies by source
and pool type. Complete bundle detection and universal lock verification
are not available. Hosted AI interpretation depends on bot configuration.

No wallet connection. No custody. No trade execution.

## Website development

The new web app is at `dist/app/`. It shares Sift-bot's backend instead of
duplicating the screening engine. See [WEB_APP.md](WEB_APP.md) for sign-in,
setup, security boundaries and verified functionality. A static Vercel deploy
shows the interface; functional sessions require the bot's optional web server.

Built with HTML, CSS and JavaScript.

Website files are in `dist/`. No installation or build step is required.

To preview locally, run:

    python -m http.server 4173 --directory dist

Then open http://localhost:4173 in your browser.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import `Damianonyx/SiftAgent`.
2. Keep **Root Directory** at the repository root (`./`).
3. Use **Other** for the framework preset. The included `vercel.json` sets
   `dist` as the output directory and skips installation and build commands.
4. No environment variables are needed. Select **Deploy**.

This deploys the website. The Telegram bot runs separately.

After deployment, open the Vercel project's **Settings → Domains** to connect
a domain you own. Follow the DNS records Vercel supplies for that domain.

Configuration reference: [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Files

- `dist/index.html`: page content and links.
- `dist/styles.css`: responsive site styling.
- `dist/hero.css`: editorial hero and interactive simulation panel.
- `dist/app.js`: particle animation, menu and walkthrough controls.
- `dist/assets/`: supplied brand images and local font.
- `scripts/package-preview.py`: optional offline HTML and source ZIP packaging.
- `vercel.json`: static deployment configuration.
- `scripts/verify-browser.cjs`: real Chromium layout and interaction checks.
- `.github/workflows/website-checks.yml`: browser checks and screenshot artifacts.
- `scripts/verify-deployment.cjs`: confirms the production URL serves the current files.

The website has no API keys, wallet connection or live token-data requests.
Animation supports reduced-motion preferences and pause controls.
See [VERIFICATION.md](VERIFICATION.md) for checks and remaining validation.

## Browser verification

The website remains dependency-free at runtime. Browser checks use Playwright
as development tooling only:

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node scripts/verify-browser.cjs
```

Checks cover 320–1440px layouts, the particle simulation, menu and walkthrough
controls, reduced motion, and unavailable-canvas/JavaScript fallbacks.
Screenshots are written to `artifacts/browser/` and uploaded by GitHub Actions.

## Links

- [Official website](https://siftagent-five.vercel.app/)
- [Web app](https://siftagent-five.vercel.app/app/) — Telegram sign-in requires the running bot web backend.
- [Telegram bot](https://t.me/SiftAgentbot)
- [Documentation](https://siftagent.gitbook.io/sift/)
- [Bot repository](https://github.com/Damianonyx/Sift-bot)
