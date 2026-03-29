# Handover

## Summary
Session 7 completed the ENTIRE enhancement plan (all 6 phases, 42 sections). Added spatial audio, 12 mixed-constraint levels, level editor, visual polish (shine, ColorMatrix, wipe transitions), percussion layer, challenge scores, monthly events, chain path sharing, and more. **210 total levels, 1,712 tests pass, 268KB bundle. 11 commits pushed and deployed.**

## Completed
- [x] Spatial audio panning — StereoPannerNode in playImpact/playChainUp/playTargetHit based on collision x
- [x] 12 mixed-constraint levels batch 8 (t199-t210): 4 seesaw+spring, 4 rope+seesaw, 4 spring+rope
- [x] Visual playtest mixed-constraint levels — all 12 verified in browser, physics interactions correct
- [x] Zen Mode 50-object cap — prevents FPS drops from unbounded placement
- [x] Seesaw pivot triangle flips with gravity on Gravity Flip Friday
- [x] Level editor (EditorScene) — 9 tools, snap-to-grid, HTML side panel, JSON export, test-play
- [x] Editor feature flag: ?editor URL param and Ctrl+Shift+E keyboard shortcut
- [x] GameScene accepts custom editor levels via init data
- [x] Service worker cache v7
- [x] Placement zone shine sweep animation (masked diagonal light bar)
- [x] ColorMatrix warm color grade during chain reactions (WebGL)
- [x] Post-solve difficulty percentile ("Besser als X% der Spieler")
- [x] Monthly themed events framework (4 seasons: Apr, Jul, Oct, Dec)
- [x] Chain path directional arrows in share card (from replay data)
- [x] Percussion layer in MusicEngine at chain 10+ (filtered noise kick + hi-hat)
- [x] Challenge URL with score param ("beat this score" competition)
- [x] PhysicsManager.buildMinimalWorld() refactor, ZenScene uses it
- [x] Wipe transitions replacing all fadeIn/fadeOut across 10 scenes
- [x] SceneTransition utility class (wipeIn/wipeOut with direction control)

## In Progress
- [ ] Beta testing — game is feature-complete, ALL enhancement plan items done

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Editor as separate Phaser scene + HTML panel | Clean separation, DOM for form controls, canvas for preview | All-canvas editor | Forms/inputs much harder in canvas |
| ?editor URL param auto-launches editor | Skip menu, direct to editor | Editor button in menu | Clutters menu for a dev/power-user feature |
| Ctrl+Shift+E hidden shortcut | Quick access without URL param | Menu button | Keep menu clean for regular players |
| 50-object Zen cap | Prevents FPS drops while still generous | No cap | 100+ objects causes noticeable slowdown |
| gravityFlipped stored on PhysicsManager | Seesaw pivot needs it, avoids passing through every method | Pass as param to each constraint method | More parameters, more noise |
| Editor kept simple (YAGNI) | No drag-resize, no undo, no snap-to-grid beyond basic | Full-featured editor | Premature complexity, no user demand yet |

## Known Issues
- **Rope initial swing** — rope segments settle on creation causing slight pendulum motion
- **Seesaw density** — hardcoded at 0.005; some levels may need tuning
- **Bloom performance** — up to 5 PostFX bloom instances per level. Monitor on low-end mobile
- **Interactive tutorial** — ball may miss star at extreme edge of zone; retry handles it
- **Achievement emoji rendering** — some emoji may not render in Phaser canvas text on all platforms
- **Editor limitations** — no drag-to-move objects, no undo, no constraint editing. Adequate for basic level creation

## Next Steps (Priority Order)
1. **Beta testing** — Post from BETA-POSTS.md to r/webgames, Discord, etc. Game is feature-complete.
2. **Custom domain** — Buy kettenreaktion.de, configure DNS, update VITE_BASE_PATH
3. **Gravity Flip + constraints full test** — wait for Friday, verify all constraint types with inverted gravity
4. **Editor enhancements** — drag-to-move, undo, constraint editing (only if users request it)
5. **Monthly themed events** — seasonal variations framework

## Rollback Info
- Last known good: `46e31df` (HEAD) — 1,712 tests pass, 268KB bundle, deployed
- Session 6 last good: `72f34a3` — 1,616 tests pass, 198 levels
- Session 5 last good: `a7d3a0e`
- If EditorScene crashes: remove from main.ts scene array, remove MenuScene Ctrl+Shift+E handler
- If MusicEngine crashes: remove imports from GameScene.ts, MenuScene.ts, ZenScene.ts
- If constraints crash: remove constraint methods from PhysicsManager.ts, remove batch 7+8 from LevelLoader
- If PostFX crash: remove all postFX.add*() calls and isWebGL guards from GameScene.ts
- Service worker: revert CACHE_VERSION to 6 in public/sw.js

## Files Created This Session
- `src/game/LevelTemplates8.ts` — 12 mixed-constraint levels (t199-t210)
- `src/scenes/EditorScene.ts` — level editor with HTML panel, 9 tools, test-play
- `src/systems/EventManager.ts` — monthly themed events framework
- `src/game/SceneTransition.ts` — wipe transition utility (wipeIn/wipeOut)

## Files Modified This Session
- `src/systems/AudioManager.ts` — spatial audio panning via StereoPannerNode + xToPan() helper
- `src/systems/MusicEngine.ts` — percussion layer at chain 10+ (kick + hi-hat)
- `src/systems/ShareManager.ts` — chain path arrows from replay data
- `src/scenes/GameScene.ts` — spatial audio, editorLevel, shine, ColorMatrix, events, percentile, challenge score, wipe transitions
- `src/scenes/ResultScene.ts` — difficulty percentile, replay in share, challenge URL with score, wipe transitions
- `src/scenes/MenuScene.ts` — ?editor param, Ctrl+Shift+E, event banner, challenge score param, wipe transitions
- `src/scenes/ZenScene.ts` — 50-object cap, PhysicsManager refactor, wipe transitions
- `src/scenes/BootScene.ts` — wipe transition
- `src/scenes/HowToScene.ts` — wipe transitions
- `src/scenes/PracticeScene.ts` — wipe transitions
- `src/scenes/ReplayScene.ts` — wipe transitions
- `src/scenes/StatsScene.ts` — wipe transitions
- `src/game/PhysicsManager.ts` — gravityFlipped, seesaw pivot fix, buildMinimalWorld()
- `src/game/CameraFX.ts` — warmShift/resetColorShift for ColorMatrix
- `src/game/ScoreCalculator.ts` — estimatePercentile method
- `src/game/LevelLoader.ts` — batch 8 import
- `src/game/LevelLoader.test.ts` — updated for 210 levels
- `src/main.ts` — EditorScene registration
- `public/sw.js` — cache version 7

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — implementation guide for remaining work
- `BETA-POSTS.md` — ready-to-post community announcements
- `CLAUDE.md` — project rules and conventions
- `docs/GAMEPLAN.md` — game design source of truth

---
**Last Updated:** 2026-03-29 (Session 7 — 11 commits, enhancement plan 100% complete)
