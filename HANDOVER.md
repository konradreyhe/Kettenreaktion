# Handover

## Summary
Session 16 was a deep core-game-quality pass. 8 commits, all pushed and deployed to kettenreaktion.crelvo.dev. Fixed 6 real bugs (streak timezone, button drag-away, physics explosion, GIF worker errors, slow-mo stacking, aggressive error handler). Added 6 core-loop polish items (chain timeout, trajectory visibility, failure feedback, live near-miss, result skip, near-miss constant). Made 5 performance fixes (body cache, energy array, multi-touch guard, camera bounds, touch detection cache). Fixed 3 infrastructure issues (SW error caching, cache headers, loading screen timeout). 1,865 tests pass, build clean. **Most important for next session: core game quality is now solid. Focus on launch blockers (custom domain, real-device testing, leaderboard with real data, soft launch posts). See CLAUDE.md "Current Focus".**

## Completed This Session
- [x] Chain timeout increased from 2s to 3s — fairer for physics arcs between bounces
- [x] Trajectory preview enhanced — connecting trail line, brighter dots (0.7→0.12 alpha), larger entry dot as aiming anchor
- [x] Failure feedback improved — warm red flash, 0.5x slow-mo for 500ms, context-aware encouragement per attempt ("Beobachte die Physik..." / "Fast! Noch eine Chance!")
- [x] Physics boundary check — bodies beyond 500px from game world made static, prevents infinite simulation from runaway physics
- [x] Near-miss detection moved to during simulation — throttled 5x/sec, deduplicated per-target, fires "KNAPP!" while action happens
- [x] Result screen tap-to-skip — tapping during reveal animations fast-forwards all tweens
- [x] Streak timezone bug fixed — Date parsing now uses explicit UTC (`Date.parse('...T00:00:00Z')`) instead of `new Date('YYYY-MM-DD')` which parsed as local midnight
- [x] Button drag-away fixed — onClick now fires on pointerup (not pointerdown), so dragging off cancels the action
- [x] Slow-mo stacking fixed — CameraFX.slowMotion() now replaces current effect if new speed is more dramatic, cancels previous recovery timer
- [x] Camera follow clamped — followAction filters out-of-bounds bodies (200px margin) from centroid calculation
- [x] NEAR_MISS_PX consolidated — was 5 (used as 5+15=20), now self-documenting 20
- [x] Body cache per frame — getAllMatterBodies() called once instead of 3x per update
- [x] Energy graph array fix — slice(-300) → shift() to avoid per-frame allocation
- [x] Multi-touch guard — reject secondary touch pointers (pointerId != 1) in all placement handlers
- [x] isTouchDevice() cached — avoids DOM check every frame
- [x] GIF worker error handling — detects worker error messages and falls back to sync export
- [x] Service worker only caches response.ok — prevents caching 5xx errors after bad deploys
- [x] Cache-Control headers for HTML/SW/manifest — 1 hour must-revalidate, prevents stale CDN content
- [x] Loading screen 10s safety timeout — removes loading screen even if Phaser 'ready' event never fires
- [x] Global error handler only triggers pre-canvas — non-fatal JS errors no longer nuke the page
- [x] All changes deployed to production (kettenreaktion.crelvo.dev)

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] Trajectory prediction with gravity fix (g * scale * delta^2)
- [x] Touch drag-to-aim for mobile
- [x] All 42 enhancement plan sections complete
- [x] 20+ bug fixes from Session 13 quality audit
- [x] Material themes, PostFX pipeline, MusicEngine, spatial audio
- [x] Backend API (result, stats, heatmap, streak, leaderboard) with 5s timeouts
- [x] GIF replay export, server-validated streaks, daily bet predictions
- [x] PWA with service worker, achievements, monthly events
- [x] Combo popups, impact ripples, celebration overhaul, streak milestones

## In Progress
- [ ] **Launch blockers** — custom domain not purchased, leaderboard untested with real data, beta posts not published
- [ ] **Real device mobile testing** — touch drag-to-aim untested on real phones/tablets
- [ ] **Lighthouse > 90** — limited by Phaser bundle (340KB gzip). HTML/CSS/fonts already optimized. Score likely 70-80.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Chain timeout 2s → 3s | Physics arcs between bounces often took >2s, breaking chains unfairly | Keep at 2s | Too tight for realistic trajectories; 4s+ considered too generous |
| Trail line between trajectory dots | Isolated dots were hard to read, especially on dark backgrounds | Glow/bloom on dots only | More expensive GPU-wise, trail line is simpler and clearer |
| Failure slow-mo 0.5x for 500ms | Lets player see what went wrong without feeling sluggish | Full speed (no slow-mo) | Failures felt instant and confusing; 0.25x too slow |
| Make bodies static at 500px OOB | Bodies flying thousands of px never sleep, causing infinite sim | Remove bodies entirely | Removing could break Phaser references; static is safer |
| Near-miss during sim (throttled 5x/sec) | Players need to see "KNAPP!" while action happens | Keep at end-of-sim only | Feedback fires after scene transition — useless |
| pointerup for button onClick | pointerdown fires even when dragging away from button | Require pointerup inside bounds | Phaser's pointerup on interactive objects already checks bounds |
| UTC Date.parse for streak | new Date('YYYY-MM-DD') parses as local midnight, not UTC | Store timestamps instead | More complex, date strings are simpler and used everywhere |
| SW response.ok check before cache | 5xx errors were being cached, persisting after deployment fixes | Custom error page in SW | Overkill — just don't cache errors |
| 10s loading screen timeout | If Phaser fails silently, users stuck on loading screen forever | No timeout (trust Phaser) | Can't trust external library to always fire events |
| Error handler canvas check | Global error replaced entire body on ANY JS error | Remove error handler entirely | Need it for fatal startup errors when canvas hasn't loaded |
| BootScene has no network assets | All textures generated procedurally — no asset load errors possible | Add error handlers anyway | Nothing to fail — no network loads in preload() |

## Known Issues
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — dispatched DOM events don't trigger Phaser's internal input system. Must use scene.input.emit() or scene manager directly for automated testing.
- **Phaser bundle size** — 340KB gzipped, inherent to library. Lighthouse perf score capped at ~70-80.
- **Leaderboard untested with real data** — endpoint works (returns empty array), needs real players
- **Touch drag-to-aim untested on real devices** — works in theory, needs real phone testing
- **GIF replay URL** — shows kettenreaktion.crelvo.dev, must change to kettenreaktion.de when domain purchased
- **Yesterday level dedup has wrong pool** — LevelLoader compares today's level against a random level from the full pool using yesterday's seed, not yesterday's difficulty-filtered pool. Low impact — consecutive days usually have different difficulty ranges.
- **Energy graph + camera follow disabled on touch devices** — isTouchDevice() returns true on laptops with touchscreens too. Desktop users with touch-capable laptops miss these features.

## Next Steps (Priority Order)

**FOCUS: Launch blockers. Core game is solid. See CLAUDE.md "Current Focus".**

### Launch blockers (must do before launch)
1. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX (manual task)
2. **Real device mobile testing** — Test on actual phones: touch drag-to-aim feel, placement accuracy, performance
3. **Leaderboard with real data** — Play multiple games to populate, verify display and ranking
4. **Soft launch posts** — Use BETA-POSTS.md for Reddit/Discord/Twitter/HN (manual task)
5. **Lighthouse audit** — Run real Lighthouse on production, address any quick wins

### Polish (if time)
6. **Level quality play-test** — Play through representative levels from each difficulty tier
7. **Improve result screen** — scoring tooltips, show all components even if 0
8. **Yesterday dedup fix** — Use yesterday's difficulty pool for dedup check (minor)

### DO NOT
- Add new features, game modes, or UI screens
- Refactor or clean up working code
- Optimize things that aren't measurably slow

## Rollback Info
- Last known good (pre-session 16): `08d9413` — Session 15 final, 1,865 tests pass
- Current HEAD: `5f418f3` — Session 16 final, 1,865 tests pass, all deployed
- Pre-session 15: `5915d24`
- Server backup: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js.bak`

## Files Modified This Session
- `src/constants/Game.ts` — CHAIN_TIMEOUT_MS 2000→3000, NEAR_MISS_PX 5→20 (was used as 5+15)
- `src/game/TrajectoryPredictor.ts` — Higher alpha (0.7/0.12), trail line between dots, larger entry dot
- `src/scenes/GameScene.ts` — Failure slow-mo + encouragement, physics OOB check, live near-miss (throttled, deduplicated), body cache per frame, energy array shift(), multi-touch guard, isTouchDevice cache, near-miss uses NEAR_MISS_PX directly
- `src/scenes/ResultScene.ts` — Tap-to-skip reveal animations (pointerdown → tweens.each complete)
- `src/systems/StorageManager.ts` — UTC Date.parse for streak comparison instead of new Date()
- `src/ui/Button.ts` — onClick on pointerup instead of pointerdown (prevents drag-away activation)
- `src/game/CameraFX.ts` — slowMotion replaces if more dramatic, cancel previous timer; followAction filters OOB bodies (200px margin)
- `src/systems/ReplayExporter.ts` — Worker error message type guard, fallback to sync on non-ArrayBuffer
- `src/main.ts` — 10s safety timeout for loading screen removal
- `public/sw.js` — response.ok check before caching, cache version 9→10
- `vercel.json` — Cache-Control headers for HTML/SW/manifest (1hr must-revalidate)
- `index.html` — Error handler only fires before canvas exists (prevents nuking page on non-fatal errors)

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/
- **API source:** /home/deploy/appmanager/dashboard/routes/kettenreaktion.js
- **Deploy:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — Project rules, conventions, AND priority rules (read "Current Focus" first!)
- `PRINCIPLES.md` — Engineering principles
- `BETA-POSTS.md` — Ready-to-post community announcements
- `docs/GAMEPLAN.md` — Game design source of truth
- `docs/ROADMAP.md` — Development phases and milestones

---
**Last Updated:** 2026-04-03 (Session 16 — 8 commits: core loop polish, 6 bug fixes, 5 perf fixes, 3 infra fixes)
