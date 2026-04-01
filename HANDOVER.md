# Handover

## Summary
Session 13 was a quality-focused session. Fixed 20+ bugs across the entire codebase found through systematic auditing — critical gameplay bugs (mutations never applied, solved flag wrong, portal velocity zeroed), resource leaks (6 separate leak sources in GameScene/HowToScene/ReplayScene), data integrity issues (gamesPlayed inflation, localStorage crashes, puzzle number collisions), and UI bugs (button overlaps, HUD chain not resetting, share silent failure). Also added a structural level validator, Lighthouse accessibility/performance improvements (viewport meta, color contrast, loading screen, dynamic imports), and 5 new tests. 9 commits on master, 1,865 tests pass, build clean. Needs push.

## Completed This Session
- [x] 20+ bug fixes across GameScene, ReplayScene, ButterflyScene, PracticeScene, HowToScene, ResultScene, StorageManager, DailySystem, ShareManager, CameraFX, HUD, PhysicsManager, LevelLoader
- [x] Critical: applyMutationToPhysics moved after setupLevel (bounce/friction mutations now work)
- [x] Critical: solved flag requires all targets hit (was: any single target)
- [x] Critical: portal teleportation preserves velocity (was: zeroed momentum)
- [x] Critical: score timer uses frame delta instead of Date.now (immune to tab backgrounding)
- [x] Resource leaks: magnet bodies tracked, shutdown cleans portals/targets/magnets, pointermove handler stored, keyboard listeners removed in replay scenes, HowToScene shutdown added
- [x] Data: gamesPlayed/totalScore deduplication, localStorage try-catch, puzzle number pre/post-launch offset
- [x] UI: ResultScene dynamic button stacking, HUD chain text/color reset, ShareManager returns success boolean
- [x] Code: 7 any-casts consolidated into getAllMatterBodies helper, bomb __exploded uses typed Set
- [x] Level validator (structural checks for all 225 levels — constraints, portals, bounds, targets)
- [x] Lighthouse: viewport meta (allow zoom), color contrast (#99aabb = 7.17:1), HTML loading screen, dynamic imports, scene-level code splitting
- [x] 5 new tests for storage dedup, puzzle numbering, quota handling

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All 42 enhancement plan sections complete
- [x] Material themes (wood/stone/metal) with 9 procedural textures + themed collision audio
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox with 50-object cap
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek + Director camera modes
- [x] 23-badge achievement system
- [x] PWA shortcuts and challenge URLs
- [x] Level editor with constraints + portals + magnets + bombs + property editing
- [x] Monthly themed events framework
- [x] Wipe scene transitions with edge accent
- [x] Spatial audio panning + material-differentiated collision audio
- [x] NaN camera guards (multi-layer defense)
- [x] Dramatic near-miss camera (slow-mo + zoom + vignette + ring + particles)
- [x] 7/7 daily physics mutations (new player exemption for first 7 games)
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)
- [x] Server-validated streaks with grace period
- [x] Daily bet predictions with result badges
- [x] Combo text popups, impact ripples, celebration overhaul
- [x] Photon Gallery (shareable trail art)
- [x] HUD attempt pips + live timer
- [x] Butterfly Effect (side-by-side replay comparison)
- [x] Bell, bomb, portal, magnet object types
- [x] Editor magnet strength/radius sliders (was listed as missing — already implemented)

## In Progress
- [ ] Beta testing — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts.
- [ ] **Needs push** — 9 commits on master, not yet pushed to origin.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Structural level validator (not physics sim) | Headless Matter.js diverges from Phaser's integrated physics — ball trajectories differ significantly | Headless Matter.js solvability simulation | Ball never reaches targets from placement zone in standalone Matter.js; 206/225 levels "unsolvable" despite working in game. Physics integration differences are fundamental. |
| Dynamic imports for Phaser + scenes | Allows HTML loading screen to paint before heavy JS blocks main thread | Synchronous imports | Blocks FCP/LCP for 2.9s while Phaser evaluates |
| Frame delta for sim timer instead of Date.now() | Immune to tab backgrounding inflating score timer | Date.now() | Keeps ticking when tab hidden but physics paused |
| Bomb setStatic + move off-world instead of world.remove | Preserves body array indices for replay recording | world.remove | Shifts array indices, corrupting all subsequent replay frames |
| getAllMatterBodies() helper | Single point for the localWorld.bodies any-cast, removes 6 eslint-disable comments | Inline any-casts | 7 duplicate patterns across GameScene |
| buttonY dynamic stacking in ResultScene | Prevents overlap when multiple buttons visible (GIF + trail art + WhatsApp + butterfly) | Fixed Y positions | Buttons overlap when multiple conditional buttons render |
| ShareManager returns boolean | Caller can show appropriate feedback (success vs failure) | Void return with silent fail | User gets false "Kopiert!" even when nothing was copied |

## Known Issues
- **ButterflyScene level mismatch** — passes today's levelId for yesterday's replay backdrop. Bodies appear to float through platforms that weren't there. Needs separate levelId per replay.
- **StatsScene tooltip leak** — rapid hover creates multiple tooltip objects before cleanup fires. Store tooltip ref and destroy at start of pointerover.
- **MenuScene sound toggle desync** — initializes `soundOn = true` regardless of AudioManager state on re-entry.
- **ReplayExporter canvas context** — non-null assertion on getContext('2d') could crash if browser exhausts canvas context limit.
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares.
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible.
- **Phaser bundle size** — 340KB gzipped, inherent to the library. Lighthouse perf score limited.
- **Redirect in Lighthouse** — 3.3s intermittent redirect, server-side issue not fixable in code.

## Next Steps (Priority Order)
1. **Push 9 commits** — `git push origin master`
2. **Deploy to production** — `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`
3. **Fix ButterflyScene level mismatch** — store yesterday's levelId in replay data, pass separately
4. **Fix MenuScene sound toggle** — init from AudioManager.isEnabled()
5. **Fix StatsScene tooltip leak** — store ref, destroy existing before creating new
6. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
7. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX
8. **Supabase leaderboard** — Top 10 + own rank on ResultScene (API + UI)

## Rollback Info
- Last known good: `f7d63d2` (HEAD) — 1,865 tests pass, 225 levels, all bugs fixed
- Pre-session 13: `2e694d2` — 1,853 tests pass, session 12 handover
- Pre-session 12: `65c44bb` — 1,733 tests pass, 210 levels

## Files Modified This Session
- `index.html` — Viewport meta (allow zoom), color contrast fix, HTML loading screen
- `src/main.ts` — Dynamic imports for Phaser + all scenes, loading screen dismiss
- `src/game/LevelValidator.ts` — **NEW** structural level validator
- `src/game/LevelValidator.test.ts` — **NEW** 7 tests for validator
- `src/game/PhysicsManager.ts` — Track magnet body/sprite in this.tracked for cleanup
- `src/game/CameraFX.ts` — Additive shake offset instead of absolute setScroll
- `src/game/LevelLoader.ts` — Anti-repeat uses template IDs from full pool
- `src/scenes/GameScene.ts` — 10+ fixes: mutation ordering, solved flag, portal velocity, sim timer, bomb handling, shutdown cleanup, explodedBombs Set, ghostMoveHandler, getAllMatterBodies helper
- `src/scenes/ResultScene.ts` — Dynamic button Y stacking, share failure feedback
- `src/scenes/ReplayScene.ts` — Keyboard cleanup in shutdown, hide sprites for missing bodies
- `src/scenes/ButterflyScene.ts` — Keyboard cleanup in shutdown, hide sprites for missing bodies
- `src/scenes/PracticeScene.ts` — Guard navigate() against empty filter
- `src/scenes/HowToScene.ts` — Added shutdown() for Matter.js body cleanup
- `src/systems/StorageManager.ts` — gamesPlayed/totalScore dedup, localStorage try-catch
- `src/systems/DailySystem.ts` — Pre-launch puzzle number offset (10000+)
- `src/systems/ShareManager.ts` — share() returns boolean, clipboard try-catch
- `src/systems/DailySystem.test.ts` — Pre-launch puzzle number test
- `src/systems/StorageManager.test.ts` — 4 tests: dedup, totalScore adjustment, quota handling
- `src/ui/HUD.ts` — Chain text/color reset on 0 and between attempts
- `src/constants/Physics.ts` — Added frictionAir to seesaw body properties

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases and milestones

---
**Last Updated:** 2026-04-01 (Session 13 — 20+ bug fixes, quality audit, Lighthouse improvements)
