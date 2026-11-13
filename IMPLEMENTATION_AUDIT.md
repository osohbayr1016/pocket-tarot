# Pocket Tarot — Evidence-based audit and implementation notes
Audit date: 2026-11-13
Branch: \`feat/offline-tarot-foundation\`
Baseline main: \`da72df580a9ab7481906f308fc30b7fb6cee30a7\`

## Baseline findings and status

| Severity | Finding in baseline | Resolution in this branch |
|---|---|---|
| P0 | Components import missing \`src/app/data/tarotCards\` and \`tarotSpreads\` | Added 78-card catalog and 5 complete spreads |
| P0 | Tarot, horoscope, daily fortune, guidance and dream UI rely on backend AI endpoints | Replaced six user-facing flows with local deterministic logic |
| P0 | Tracked \`back-end/config.production.env\` contains credential-shaped values | Removed tracked file, strengthened ignore rules, documented rotation; history remains exposed |
| P1 | Card art missing; UI renders emojis and text in place of historic illustrations | Added 78 real RWS images, verified local filenames, reusable card UI and artwork downloader |
| P1 | \`sort(() => Math.random() - 0.5)\` is biased | Implemented Web Crypto uniform random integers and Fisher–Yates; guards duplicate cards |
| P1 | Reversed cards drawn from \`Math.random()\` / inconsistent behavior | Added independent 50/50 reversal for each dealt card |
| P1 | Daily "lucky" elements are fixed lists with no user-specific calculation | Date- and birth-day-dependent deterministic symbolic values, clearly marked entertainment |
| P1 | Legacy UI is congested, backend-dependent and inaccessible in places | Replaced with simpler responsive tabbed navigation, semantic buttons, labels, input validation, card library |
| P1 | No engine-level verification | Added unit tests and GitHub Actions pipeline for tests/typecheck/build/78 images |

## Accuracy and product boundaries

- Card images: 78 Rider–Waite–Smith cards, historically illustrated by Pamela Colman Smith.
- Card meanings: succinct original Mongolian interpretive descriptions, not scientific claims. Tarot interpretations vary by tradition and reader; professional editorial review is recommended.
- Zodiac: conventional tropical sun-sign calendar boundaries, not an astronomical birth chart. Year-dependent cusp precision, birth time, timezone and ephemeris are **not implemented**.
- Dream guidance: explicitly rule-based, with a transparent no-match fallback; not an AI model.
- No runtime Gemini/OpenAI/other model calls from redesigned frontend. Legacy \`back-end/\` still contains separate server endpoints, but the new frontend does not invoke them.
- No guaranteed accuracy of predictions; no predictive validity can be asserted.

## Release checks

1. GitHub Actions: Node 22, install, \`npm test\`, \`npm run typecheck\`, \`npm run build\`, assert 78 local JPG assets.
2. Browser manual smoke checks: one-card draw, all five spreads, 10-card reveal, reversal, local saved reading, date boundary invalid inputs, 12 zodiac signs, smartphone navigation and modal keyboard behavior.
3. Privacy: review localStorage behavior and add export/clear UI for users. Confirm no network AI requests with DevTools.
4. Security: rotate any previously exposed database/API/JWT credentials, inspect full git history and deployment platform variables. Deleting a file from HEAD does not revoke secrets.
5. Product: review Mongolian content and labels with a tarot practitioner; consider optional offline PWA packaging and verified ephemeris before advanced astrology claims.

**Do not market this project as "100% correct predictions" or "100% bug-free".** Report each release gate by observed results.
