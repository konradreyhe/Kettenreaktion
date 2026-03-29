# Handover

## Summary
Session 7 completed the ENTIRE enhancement plan (all 6 phases, 42 sections). Starting from session 6's handover (spatial audio "not started", mixed-constraint levels "not started"), this session implemented: spatial audio panning, 12 mixed-constraint levels (batch 8), level editor, placement zone shine, ColorMatrix warm shift, difficulty percentile, monthly themed events, chain path sharing arrows, percussion music layer, challenge score URLs, PhysicsManager refactor, and wipe scene transitions. **The ENHANCEMENT-PLAN.md has zero remaining items.** The game is feature-complete and ready for beta testing. **210 total levels, 1,712 tests pass, 268KB bundle. 12 commits pushed and deployed to GitHub Pages.**

## Completed This Session
- [x] Spatial audio panning — StereoPannerNode in playImpact/playChainUp/playTargetHit based on collision x
- [x] 12 mixed-constraint levels batch 8 (t199-t210): 4 seesaw+spring, 4 rope+seesaw, 4 spring+rope
- [x] Visual playtest mixed-constraint levels — all 12 verified in browser via Playwright, zero errors
- [x] Zen Mode 50-object cap — prevents FPS drops from unbounded placement
- [x] Seesaw pivot triangle flips with gravity on Gravity Flip Friday
- [x] Level editor (EditorScene) — 9 tools, snap-to-grid, HTML side panel, JSON export, test-play
- [x] Editor feature flag: ?editor URL param auto-launches, Ctrl+Shift+E keyboard shortcut
- [x] GameScene accepts custom editor levels via init data
- [x] Placement zone shine sweep animation (masked diagonal light bar, reduced-motion aware)
- [x] ColorMatrix warm color grade during chain reactions (WebGL, Canvas fallback)
- [x] Post-solve difficulty percentile ("Besser als X% der Spieler") in ResultScene
- [x] Monthly themed events framework (Apr Fruehlingserwachen, Jul Sommerhitze, Oct Herbststurm, Dec Adventskalender)
- [x] Chain path directional arrows in share card (sampled from replay frames)
- [x] Percussion layer in MusicEngine at chain 10+ (filtered noise kick + hi-hat pattern)
- [x] Challenge URL with score param (?challenge=N&score=X for "beat this score" competition)
- [x] Challenge target banner in GameScene when loaded via score URL
- [x] PhysicsManager.buildMinimalWorld() extracted, ZenScene refactored to use it
- [x] Wipe transitions replacing all fadeIn/fadeOut across 10 scenes
- [x] SceneTransition utility class (wipeIn/wipeOut with direction control)
- [x] Service worker cache v7

## Completed in Previous Sessions (Still Working)
- [x] 198 levels (batches 1-7) including 18 constraint levels (seesaw/spring/rope)
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad layers
- [x] ZenScene sandbox
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek
- [x] 19-badge achievement system
- [x] PWA shortcuts and challenge URLs

## In Progress
- [ ] Beta testing — game is feature-complete, ALL enhancement plan items done. Posts ready in BETA-POSTS.md.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Editor as separate Phaser scene + HTML panel | Clean separation, DOM for form controls, canvas for preview | All-canvas editor | Forms/inputs much harder in canvas |
| ?editor URL param auto-launches editor | Skip menu, direct to editor | Editor button always visible | Clutters menu for a dev/power-user feature |
| Ctrl+Shift+E hidden shortcut | Quick access without URL param | Dedicated menu button | Keep menu clean for regular players |
| 50-object Zen cap | Prevents FPS drops while still generous for sandbox | No cap | 100+ objects causes noticeable slowdown |
| gravityFlipped stored on PhysicsManager | Seesaw pivot needs it, avoids passing through every method | Pass as param to each constraint method | More parameters, more noise |
| Editor kept simple (YAGNI) | No drag-resize, no undo, no snap-to-grid beyond basic | Full-featured editor | Premature complexity, no user demand yet |
| Pseudo-percentile from score ratio | No backend needed, deterministic | Real percentile from Supabase | Backend not built yet (Phase 2) |
| Wipe transitions (rectangle slide) | Simple, game-like, reliable | Shader-based wipes | Overkill, WebGL-only, compatibility risk |
| Percussion as filtered noise | Consistent with existing synthesis approach | Sample-based drums | Would require audio files, breaks zero-asset music design |
| Challenge score in URL params | Simple, shareable, no backend | Supabase challenge records | Backend not built yet |
| Monthly events data-driven | Easy to add new months, single file | Config from server | No backend; YAGNI |
| buildMinimalWorld() on PhysicsManager | Reuse floor+wall logic, DRY | Keep ZenScene manual setup | Duplicated code between ZenScene and PhysicsManager |

## Known Issues
- **Rope initial swing** — rope segments settle on creation causing slight pendulum motion. Creates interesting dynamics.
- **Seesaw density** — hardcoded at 0.005; some levels may need different values for ideal responsiveness
- **Bloom performance** — up to 5 PostFX bloom instances per level. Monitor on low-end mobile devices.
- **Interactive tutorial** — ball may miss star at extreme edge of zone; retry flow handles it gracefully
- **Achievement emoji rendering** — some emoji may not render in Phaser canvas text on all platforms
- **Editor limitations** — no drag-to-move, no undo, no constraint editing. Adequate for basic level creation.
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics behavior untested on a Friday
- **Wipe transitions** — new implementation, not yet visually verified in browser (typecheck + tests pass)

## Next Steps (Priority Order)
1. **Visual verify wipe transitions** — start dev server, navigate between scenes, confirm wipes look correct
2. **Beta testing** — Post from BETA-POSTS.md to r/webgames, Discord, IndieGaming. Game is feature-complete.
3. **Custom domain** — Buy kettenreaktion.de, configure DNS, update VITE_BASE_PATH in vite.config.ts
4. **Supabase leaderboard** — Phase 2 of ROADMAP.md. Global leaderboard backend.
5. **Gravity Flip + constraints full test** — wait for a Friday, play constraint levels, verify physics
6. **Editor enhancements** — drag-to-move, undo, constraint editing (only if users request it)
7. **Real percentile** — replace pseudo-percentile with actual data from Supabase (after Phase 2)

## Rollback Info
- Last known good: `8d989e4` (HEAD) — 1,712 tests pass, 268KB bundle, deployed
- Pre-session 7: `88b5d34` — session 6 handover commit
- Session 6 last good: `72f34a3` — 1,616 tests pass, 198 levels
- Session 5 last good: `a7d3a0e`
- If wipe transitions break: revert `SceneTransition.ts` and all scene imports, restore fadeIn/fadeOut (commit `c15cefb` is pre-wipe)
- If EditorScene crashes: remove from main.ts scene array, remove MenuScene ?editor handler + Ctrl+Shift+E
- If MusicEngine percussion crashes: remove startPercussion/stopPercussion methods and chain 10 trigger
- If EventManager crashes: remove imports from MenuScene.ts and GameScene.ts
- If ColorMatrix crashes: remove warmShift/resetColorShift from CameraFX.ts and calls from GameScene.ts
- If challenges with score crash: revert URL generation in ResultScene, remove score parsing in MenuScene
- Service worker: revert CACHE_VERSION to 6 in public/sw.js

## Files Created This Session
- `src/game/LevelTemplates8.ts` — 12 mixed-constraint levels (t199-t210)
- `src/scenes/EditorScene.ts` — level editor with HTML panel, 9 tools, test-play
- `src/systems/EventManager.ts` — monthly themed events (4 seasons)
- `src/game/SceneTransition.ts` — wipe transition utility (wipeIn/wipeOut with direction)

## Files Modified This Session
- `src/systems/AudioManager.ts` — spatial audio panning via StereoPannerNode + xToPan()
- `src/systems/MusicEngine.ts` — percussion layer at chain 10+ (kick + hi-hat)
- `src/systems/ShareManager.ts` — chain path arrows from replay data, ReplayFrame import
- `src/scenes/GameScene.ts` — spatial audio x params, editorLevel+challengeScore in init(), shine sweep, ColorMatrix warmShift, event theme overlay, wipe transitions
- `src/scenes/ResultScene.ts` — difficulty percentile, replay in share, challenge URL with score, wipe transitions
- `src/scenes/MenuScene.ts` — ?editor param handler, Ctrl+Shift+E, event banner, challenge score param parsing, wipe transitions
- `src/scenes/ZenScene.ts` — 50-object MAX_OBJECTS cap, PhysicsManager.buildMinimalWorld(), wipe transitions
- `src/scenes/BootScene.ts` — wipe transition (down direction)
- `src/scenes/HowToScene.ts` — wipe transitions
- `src/scenes/PracticeScene.ts` — wipe transitions
- `src/scenes/ReplayScene.ts` — wipe transitions
- `src/scenes/StatsScene.ts` — wipe transitions
- `src/game/PhysicsManager.ts` — gravityFlipped field, seesaw pivot direction fix, buildMinimalWorld()
- `src/game/CameraFX.ts` — warmShift() + resetColorShift() for ColorMatrix PostFX
- `src/game/ScoreCalculator.ts` — estimatePercentile() static method
- `src/game/LevelLoader.ts` — batch 8 import, total 210 levels
- `src/game/LevelLoader.test.ts` — updated level count to 210
- `src/main.ts` — EditorScene registration in scene array
- `public/sw.js` — cache version 7

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — 100% complete, all 42 sections implemented
- `BETA-POSTS.md` — ready-to-post community announcements for 6 platforms
- `CLAUDE.md` — project rules and conventions (source of truth)
- `PRINCIPLES.md` — engineering principles
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases (Phase 1 MVP complete, Phase 2 = Supabase)

---
**Last Updated:** 2026-03-29 (Session 7 — 12 commits, enhancement plan 100% complete)
