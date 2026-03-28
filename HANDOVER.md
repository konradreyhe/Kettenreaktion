# Handover

## Summary
Session 5 continued from the session 4 handover. Pushed all pending commits, then focused on polish and content for beta readiness. GIF export moved to Web Worker for non-blocking encoding. Added 30 new levels (121-150, total now 150 = 5 months of content). Self-hosted the Orbitron font (eliminates Google Fonts CDN dependency, faster boot). Fixed 17 duplicate level names across batches 4-5. Added comprehensive level validation tests (1,205 new assertions). Updated og:image. Bumped service worker cache version. Full game flow tested via Playwright — all scenes render correctly with zero console errors. **4 commits pushed to origin.** The game is fully beta-ready.

## Completed
- [x] Pushed session 4's 7 pending commits to origin
- [x] GIF export moved to Web Worker — non-blocking via OffscreenCanvas, animated loading dots, sync fallback
- [x] ReplayExporter.worker.ts — separate worker file bundled as 11KB chunk
- [x] ReplayExporter.export() now async (Promise<Blob>) with automatic worker/sync selection
- [x] ResultScene updated for async export + animated "Erstelle GIF." dots
- [x] 30 new levels (t121-t150): 6 easy, 6 medium, 6 hard, 6 very hard, 6 expert
- [x] LevelTemplates5.ts created and registered in LevelLoader
- [x] Total level count: 150 (5 months of daily content)
- [x] Visual playtested levels t091, t109, t113, t116, t120, t139, t150 via Playwright
- [x] Self-hosted Orbitron font — woff2 (11.8KB) with preload, no more Google Fonts CDN
- [x] Fixed 17 duplicate level names across batches 4 and 5
- [x] Level validation tests — 1,205 assertions (structure, bounds, unique IDs/names, difficulty coverage)
- [x] Updated og:image with current menu screenshot
- [x] Bumped service worker cache version to v3
- [x] Full game flow tested: Boot → Menu → Game → HowTo → Stats → Practice — all clean, zero errors

## In Progress
- [ ] Beta testing — game is feature-complete and polished, needs public feedback
- [ ] Custom domain — buy domain, configure DNS, set VITE_BASE_PATH=/
- [ ] Cloudflare Pages migration — needed before monetization

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Web Worker for GIF encoding | Non-blocking UX, 200-500ms encode doesn't freeze UI | Keep sync on main thread | Blocks UI, noticeable on slower devices |
| Automatic sync fallback in ReplayExporter | OffscreenCanvas not universal, graceful degradation | Worker-only | Would break on older browsers |
| Self-host Orbitron woff2 | Eliminates CDN dependency, faster boot, works offline | Keep Google Fonts CDN | External dependency, extra DNS lookup, privacy concern |
| Don't pre-cache font in SW | Vite hashes font file, SW hash-based rule caches it automatically | Pre-cache with static path | Path mismatch with Vite hashed output |
| Rename batch 4-5 duplicates, keep batch 1-3 originals | Batch 1-3 shipped first, changing them could affect existing players | Rename all occurrences | More churn, batch 1-3 are established |

## Known Issues
- **Playwright canvas clicks unreliable** — Phaser WebGL canvas doesn't respond to Playwright mouse events. Use `window.__PHASER_GAME__` to navigate scenes programmatically in dev mode.
- **Gravity Flip mirror doesn't account for object height offsets** — static objects use `flipY(obj.y + objH)` which may be slightly off for tall ramps. Needs visual testing on a real Friday.
- **Energy seismograph + camera zoom disabled on ALL touch devices** — includes tablets that could handle them. Could add a performance tier system later.
- **New levels (121-150) not fully visually playtested** — spot-checked t139 and t150 via Playwright. All levels compile, load, and pass validation tests.
- **Phaser chunk is 1.4MB** — expected for the engine, gzips to 340KB. Could code-split further but not critical.

## Next Steps (Priority Order)
1. **Beta testing** — post on r/webgames, Discord game-dev servers, indie-dev communities. Game is feature-complete with 150 levels, GIF sharing, accessibility, legal compliance.
2. **Custom domain** — buy kettenreaktion.de (or similar), configure DNS, update VITE_BASE_PATH
3. **Cloudflare Pages migration** — needed before monetization (Vercel Hobby restricts commercial use)
4. **Gravity Flip Friday live test** — wait for actual Friday UTC, verify mirrored levels play correctly
5. **Visual playtest remaining new levels** — especially difficulty 4-5 levels (t139-t150)
6. **More levels (151+)** — for additional months of content
7. **Advent Calendar** — December special event (25 themed puzzles), plan months ahead

## Rollback Info
- Last known good state: commit `63f318a` (HEAD) — everything works, 1232 tests pass, build clean
- Session 4 last good state: `f822054`
- Session 3 last good state: `7abeab0`
- Session 2 last good state: `f4e1b91`
- Session 1 last good state: `01eeee4`
- If GIF Worker causes issues: revert `b41010a` (returns to sync encoding)
- If new levels have issues: revert `910285b` (returns to 120 levels)
- If font self-hosting causes issues: revert `d262c6d` (restore Google Fonts CDN in index.html)

## Files Modified This Session
### New Files
- `src/systems/ReplayExporter.worker.ts` — Web Worker for GIF encoding with OffscreenCanvas
- `src/game/LevelTemplates5.ts` — 30 new levels (t121-t150), all difficulty tiers
- `src/game/LevelLoader.test.ts` — Level validation tests (1,205 assertions)
- `assets/fonts/orbitron-latin.woff2` — Self-hosted Orbitron variable font

### Modified Files
- `src/systems/ReplayExporter.ts` — async export(), worker+sync fallback, kept sync drawing methods
- `src/scenes/ResultScene.ts` — animated loading dots, await async export()
- `src/game/LevelLoader.ts` — imports and registers BATCH_5 from LevelTemplates5
- `src/game/LevelTemplates4.ts` — renamed 8 duplicate level names
- `src/game/LevelTemplates5.ts` — renamed 9 duplicate level names
- `index.html` — self-hosted font @font-face + preload, removed Google Fonts CDN links
- `public/og-image.jpg` — updated menu screenshot
- `public/sw.js` — bumped cache version to v3

---
**Last Updated:** 2026-03-28 (Session 5 end)
