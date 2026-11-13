# Pocket Tarot

**Tarot & astrology-inspired reflection, computed locally without AI or runtime API calls.**

An offline-first Next.js 15 / React 19 experience in Mongolian. The browser draws cards, interprets traditional card meanings, validates dates, computes conventional Western tropical zodiac sun signs, and stores user readings **on the same device**.

> Tarot and astrology are cultural/interpretive traditions, not scientific methods of predicting personal events. This application makes no claims about guaranteed future outcomes. Medical, legal, financial, and safety decisions require appropriate professional evidence.

## Available experiences

- **78-card Rider–Waite–Smith deck**: 22 Major Arcana, 56 Minor Arcana, actual historical card art.
- **Five readings**: one card, past/present/possible direction, love, career, Celtic Cross (10).
- **Reading engine**: unbiased Fisher–Yates shuffle via Web Crypto, no duplicate cards, upright/reversed drawn independently.
- **Interpretation**: Mongolian card meanings with spread position labels, deterministic, fully local.
- **Zodiac**: all 12 conventional tropical sun-sign date ranges and Gregorian date validation.
- **Daily reflection**: date-dependent, repeatable local symbolic prompt; lucky numbers/colors are **entertainment, not forecasts**.
- **Dream journal**: transparent keyword-based interpretations; not AI or clinical analysis.
- **Personal guidance**: structured reflection, not generated professional advice.
- **Privacy**: optional readings stored in browser localStorage; no login or network account needed.

## Run the frontend

Requirements: Node.js 22+, npm, network once to fetch publicly hosted artwork *if missing*.

\`\`\`bash
cd front-end
npm ci --legacy-peer-deps
npm run assets:sync   # skips already-installed card files
npm run dev
\`\`\`

Open http://localhost:3000. Actual images are committed under \`front-end/public/tarot/rws\`, so on this repo version assets sync is a no-op. Re-download is possible using \`npm run assets:sync\` if an image is missing.

To build and test:

\`\`\`bash
cd front-end
npm test
npm run typecheck
npm run build
\`\`\`

After the frontend is built, readings, images, and astrology calculations make no backend or AI requests. **This is not yet a packaged offline-installable PWA**; serving/loading the website initially still requires a web server or local Next.js instance.

## Artwork provenance

78 Rider–Waite–Smith historical illustrations (1909), illustrated by **Pamela Colman Smith** under the direction of **A. E. Waite**. Local JPEG files sourced from the Rider–Waite deck maintained in [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px). They document this edition as public domain; verify applicable copyright rules before distributing in a particular jurisdiction. The included asset sync tool only downloads assets during installation/build, never during card readings.

The \`front-end/public/tarot/card-placeholder.svg\` fallback is original to this project.

## Project structure

- \`front-end/src/app/data/tarotCards.ts\` — the complete card catalog.
- \`front-end/src/app/data/tarotSpreads.ts\` — 5 spreads and position definitions.
- \`front-end/src/app/lib/offlineEngine.ts\` — reusable local computation.
- \`front-end/src/app/components/\` — accessible responsive reading UI.
- \`front-end/tests/offline.test.mjs\` — deterministic card/zodiac tests.
- \`front-end/public/tarot/rws/\` — 78 local JPG assets.
- \`back-end/\` — **legacy optional backend**, no longer called by the redesigned frontend. Before deploying this legacy server, audit its authentication, rate limiting, and credentials.

## Known limitations

- Sun-sign boundaries are conventional approximations; exact zodiac ingress, ascendant, houses, moon sign, transits, natal aspects require an ephemeris plus birth time and location. None are claimed here.
- Dream interpretation is simple keyword matching; it does not understand novel free text the way a language model would.
- Browser storage is device-local and may be erased by browser settings. It is not encrypted, backed up, or shared with another device.
- Unit tests are not a proof of 100% correctness; perform live browser, accessibility, cross-device and deployment tests before production release.
- If you're using the old backend: any credentials that were once committed must be rotated, even after deletion. See \`SECURITY.md\`.

See \`IMPLEMENTATION_AUDIT.md\` for engineering scope and release blockers.
