# Artwork provenance and licensing review — Pocket Tarot

## Current packaged files
- **78 historical Rider–Waite–Smith illustrations** (22 Major, 56 Minor) as JPEGs plus size-optimized WebP derivatives under `front-end/public/tarot/rws/`.
- Original artwork: **Pamela Colman Smith (1878–1951)**, published by **Rider & Company (1909)**, with the Tarot designed by Arthur Edward Waite.
- Import source: `https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px`.
- The upstream project attributes its collection to **Steve P.**, who cleaned/restored scans of an early Pam-A printing from `https://steve-p.org/cards/RWSa.html`.
- Upstream metadata: `https://github.com/mixvlad/TarotCards/blob/main/tarot/rider-waite/metadata.json`.
- Upstream credits/licensing claims: `https://github.com/mixvlad/TarotCards/blob/main/SOURCES.md`.
- Local importer: `front-end/scripts/download-rws.mjs`.

## Legal status / remaining sign-off
- The **original 1909 illustrations** are generally treated as public domain in the US and many life-plus-70 jurisdictions: Smith died in 1951, so those rights generally expired by 2022.
- That does **not** automatically clear every newer recoloring, deck-back, trademark, brand presentation, typography, packaging, or scan/restoration, nor every country.
- Upstream declares this historical set public domain, but that is an **upstream attribution claim, not a license audit by this project**. Do not infer that upstream repository's MIT license applies to modern editions of every historical image.
- **Commercial release gate:** compare several bundled samples to their claimed historical originals, confirm no later editions were inadvertently mixed, check any restoration/reproduction terms, then obtain a jurisdiction-specific review for commercial distribution (particularly the target country's rules).
- Avoid use of modern deck packaging and protected brand marks in app icons/advertising. Describe the deck factually as "1909 Pamela Colman Smith illustrations."

## Implementation obligations
1. Keep this provenance file and user-visible artist credit.
2. Do not replace images with a commercially sold later recolored deck without an independent license.
3. If a file cannot be cleared, replace it with a verified public-domain scan or separately licensed original illustration.
4. When refreshing images, verify origin and hash each file, review diffs, and rerun the 78-card asset and Playwright checks.
5. Keep the user's journal and backup files separate from any third-party asset imports.

**Status:** source and historic attribution documented; final commercial rights sign-off **pending**. This is not legal advice.
