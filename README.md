# Sift Agent

**Sift through the noise. Find your signal.**

Sift is building a personal AI agent for discovering and monitoring
memecoins based on your criteria, directly through Telegram.

Your criteria. Your agent. Every call explained.

## About this repository

This repository contains the Sift website, featuring:

- Yellow-and-black branding with an animated pixel mascot.
- An introduction to Sift’s discovery and monitoring workflow.
- Current capabilities and development updates.
- Links to the Telegram bot and GitBook documentation.
- A responsive layout for mobile and desktop.

## Project status

Sift is in development and private testing, starting with Solana.

Supported market checks, rule-based discovery and market monitoring
are being tested. Conversational AI, verified liquidity protection,
developer activity and bundle analysis remain in development.

No wallet connection. No custody. No trade execution.

## Website development

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
- `dist/hero.css`: dark hero layout and text reveals.
- `dist/app.js`: particle animation, menu and walkthrough controls.
- `dist/assets/`: supplied brand images and local font.
- `scripts/package-preview.py`: optional offline HTML and source ZIP packaging.
- `vercel.json`: static deployment configuration.

The website has no API keys, wallet connection or live token-data requests.
Animation supports reduced-motion preferences and pause controls.
See [VERIFICATION.md](VERIFICATION.md) for checks and remaining validation.

## Links

- [Telegram bot](https://t.me/SiftAgentbot)
- [Documentation](https://siftagent.gitbook.io/sift/)
- [Bot repository](https://github.com/Damianonyx/Sift-bot)
