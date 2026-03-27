# Handover

## Summary
Session 4 focused on the top priorities from the session 3 handover: GIF replay export (#1 viral feature), mobile performance, Gravity Flip Friday fix, new levels, and visual polish. 6 commits, all clean. The GIF export works — players can download/share animated GIF replays of their chain reactions (283KB avg). Mobile performance was optimized by disabling the energy seismograph and camera zoom on touch devices. Gravity Flip Friday was fundamentally broken (all levels impossible with inverted gravity) — fixed by mirroring level geometry vertically. Added 30 new levels (091-120) bringing total to 120. Menu polished with pulsing play button glow and 3-button row layout. All 27 tests pass, typecheck clean, build clean. **6 commits not yet pushed to origin.** The game is ready for beta testing — all technical priorities are addressed.

## Completed
- [x] GIF replay export — ReplayExporter renders to offscreen 400x300 canvas, encodes via gifenc (5KB lib, ~283KB output)
- [x] "Replay als GIF" button on ResultScene with Web Share API file support + download fallback
- [x] gifenc type declarations for strict TypeScript
- [x] Phaser game instance exposed in dev mode (`window.__PHASER_GAME__`) for automated testing
- [x] vite/client types added to tsconfig for import.meta.env support
- [x] ResultScene button layout polish — GIF button same width as share, deep navy color, cohesive hierarchy
- [x] Practice mode buttons compacted — "Herausfordern" and "Zurueck" side by side
- [x] Mobile performance: energy seismograph disabled on touch devices (per-frame body iteration + graph redraw)
- [x] Mobile performance: progressive zoom camera disabled on touch devices (per-frame centroid calc)
- [x] Mobile performance: energyHistory capped at 300 entries (prevent unbounded memory growth)
- [x] CameraFX.followAction() optimized — merged dual loop into single pass
- [x] Gravity Flip Friday fix — mirrorLevelY() flips all level coordinates vertically
- [x] Floor renders at top when gravity flipped (PhysicsManager.buildFloor accepts flipped param)
- [x] 30 new levels (t091-t120): 6 easy, 6 medium, 6 hard, 6 very hard, 6 expert
- [x] LevelTemplates4.ts created and registered in LevelLoader
- [x] Menu: pulsing glow animation behind SPIELEN button
- [x] Menu: 3-button secondary row (Uebung | Anleitung | Statistik) — no more orphaned Anleitung
- [x] Menu: "Gestern ansehen" button centered below trio when replay data exists

## In Progress
- [ ] Push 6 commits to origin — ready to push, just needs `git push`
- [ ] Beta testing — game is feature-complete and polished, needs public feedback
- [ ] Custom domain — buy domain, configure DNS, set VITE_BASE_PATH=/

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| gifenc for GIF encoding | 5KB, zero deps, synchronous, modern ES module | canvas-record (MP4) | Complex dependency, encoding issues, mobile compat — session 3 already rejected this |
| Offscreen Canvas 2D for GIF rendering | No Phaser dependency, works independently, simple | Capture Phaser canvas directly | Would include UI elements (HUD, overlays), need clean render |
| 400x300 GIF at ~10fps | Good balance of quality vs file size (283KB avg) | 720p or 480p | Too large for GIF format, would be 2MB+ |
| Disable seismograph + camera on mobile via isTouchDevice() | Simplest check, already used in PhysicsManager | Media query for screen size | Touch detection more reliable for performance gating |
| Mirror level Y for Gravity Flip | All 90 levels instantly compatible, identical gameplay but upside down | Create dedicated flip levels | Would need 90 new levels, massive effort |
| Mirror level Y for Gravity Flip | Works automatically for new levels too | Add gravityFlipCompatible flag per level | Requires manual auditing of every level |
| 30 levels in LevelTemplates4.ts | Separate file per batch, consistent with existing pattern | Add to existing files | Would make files too long, harder to maintain |
| 3-button menu row | Clean symmetry, no orphaned elements | Keep 2+1 layout | Asymmetric, "Anleitung" looked like an afterthought |

## Known Issues
- **6 commits not pushed** — run `git push` to publish to origin
- **Playwright canvas clicks unreliable** — Phaser WebGL canvas doesn't respond to Playwright mouse events. Use `window.__PHASER_GAME__` to navigate scenes programmatically in dev mode.
- **Boot screen slow with Google Font** — Orbitron loads from CDN (~20KB, cached after first load)
- **Gravity Flip mirror doesn't account for object height offsets** — static objects use `flipY(obj.y + objH)` which may be slightly off for tall ramps. Needs visual testing on a real Friday.
- **Energy seismograph + camera zoom disabled on ALL touch devices** — includes tablets that could handle them. Could add a performance tier system later.
- **GIF export runs synchronously** — blocks UI for 200-500ms during encoding. Could move to Web Worker for large replays.
- **New levels (091-120) not visually playtested in full** — spot-checked t091 and t115 via Playwright. All levels compile and load correctly.
- **og:image not updated** — still shows old screenshot from session 3

## Next Steps (Priority Order)
1. **Push to origin** — `git push` (6 commits ready)
2. **Beta testing** — post on r/webgames, Discord game-dev servers, indie-dev communities. The game is feature-complete with 120 levels, GIF sharing, accessibility, legal compliance.
3. **Custom domain** — buy kettenreaktion.de (or similar), configure DNS, update VITE_BASE_PATH
4. **Cloudflare Pages migration** — needed before monetization (Vercel Hobby restricts commercial use)
5. **Visual playtest new levels** — especially difficulty 4-5 levels (t109-t120) to verify they're solvable
6. **Gravity Flip Friday live test** — wait for actual Friday UTC, verify mirrored levels play correctly
7. **GIF export polish** — add loading spinner, move encoding to Web Worker for non-blocking UX
8. **More levels (121+)** — for additional months of content
9. **Advent Calendar** — December special event (25 themed puzzles), plan months ahead

## Rollback Info
- Last known good state: commit `0fa5b51` (HEAD) — everything works, 27 tests pass, build clean
- Session 3 last good state: `7abeab0`
- Session 2 last good state: `f4e1b91`
- Session 1 last good state: `01eeee4`
- All 6 session commits are incremental — can safely `git revert` any single commit
- If GIF export causes issues: remove gifenc dependency, revert `6438276`
- If mobile perf changes cause issues: revert `e56f6f9` (re-enables all effects)
- If Gravity Flip mirror is wrong: revert `4ed24c0` (returns to broken-but-simple flip)
- If new levels have issues: revert `a3006fa` (returns to 90 levels)

## Files Modified This Session
### New Files
- `src/systems/ReplayExporter.ts` — GIF export: offscreen canvas rendering + gifenc encoding + share/download
- `src/types/gifenc.d.ts` — TypeScript declarations for gifenc library
- `src/game/LevelTemplates4.ts` — 30 new levels (t091-t120), all difficulty tiers

### Modified Files
- `package.json` — added gifenc dependency
- `package-lock.json` — lockfile update for gifenc
- `tsconfig.json` — added `"types": ["vite/client"]` for import.meta.env support
- `src/main.ts` — expose `__PHASER_GAME__` in dev mode for automated testing
- `src/scenes/ResultScene.ts` — "Replay als GIF" button (220px, navy blue), compacted practice mode buttons (Herausfordern + Zurueck side by side), adjusted spacing
- `src/scenes/MenuScene.ts` — pulsing glow behind SPIELEN button, 3-button secondary row (Uebung | Anleitung | Statistik), centered "Gestern ansehen" button
- `src/scenes/GameScene.ts` — `isGravityFlipped` flag, `mirrorLevelY()` method, skip seismograph + camera zoom on mobile, cap energyHistory at 300
- `src/game/CameraFX.ts` — merged dual loop in followAction() into single pass (centroid + spread in one iteration)
- `src/game/PhysicsManager.ts` — `buildLevel()` accepts `gravityFlipped` param, `buildFloor()` renders at top when flipped
- `src/game/LevelLoader.ts` — imports and registers BATCH_4 from LevelTemplates4

---
**Last Updated:** 2026-03-27 (Session 4 end)
