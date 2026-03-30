# Handover

## Summary
Session 8 started with visual verification of wipe transitions, found and fixed a critical NaN camera bug, then brainstormed and implemented three creative features. **Fixed:** NaN camera corruption causing permanent blank screens. **Added:** (1) Dramatic near-miss camera with slow-mo zoom + vignette pulse, (2) Weekly physics mutations (Gummi-Dienstag = 2x bounce, Eis-Donnerstag = zero friction, Flip-Freitag = gravity flip), (3) Ghost placement sharing via URL params so friends can see where you placed. **210 total levels, 1,712 tests pass, 272KB bundle. 6 commits.**

## Completed This Session
- [x] Visual verification of all wipe transitions across 7+ scene paths
- [x] Fix NaN camera corruption in CameraFX.followAction() — was causing permanent blank screens
- [x] NaN guard in CameraFX.resetCamera() — snap to defaults instead of broken tween from NaN
- [x] Defensive optional chaining on body.velocity in GameScene collision FX
- [x] Defensive b.speed guard in GameScene energy graph sampling
- [x] Defensive velocity guard in TrailRenderer.update()
- [x] "KNAPP!" dramatic near-miss camera — slow-mo zoom, vignette pulse, red glow, bigger text
- [x] Weekly physics mutations system (DailyMutation.ts) — Gummi-Dienstag, Eis-Donnerstag, Flip-Freitag
- [x] Mutation badges in level intro overlay and HUD label
- [x] Ghost placement sharing — ?p=type,x,y URL param shows friend's placement as pulsing hint
- [x] Share URLs include placement data for ghost comparison
- [x] Production build verification (272KB bundle, zero errors)
- [x] Full gameplay flow test (place, simulate, retry, result, menu, ghost placement)

## Completed in Previous Sessions (Still Working)
- [x] 210 levels (batches 1-8) including 12 mixed-constraint levels
- [x] All 42 enhancement plan sections complete
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox with 50-object cap
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek
- [x] 19-badge achievement system
- [x] PWA shortcuts and challenge URLs
- [x] Level editor (EditorScene) with HTML panel
- [x] Monthly themed events framework
- [x] Wipe scene transitions (verified working)
- [x] Spatial audio panning
- [x] Chain path directional arrows in share card

## In Progress
- [ ] Beta testing — game is feature-complete and stability-hardened. Posts ready in BETA-POSTS.md.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| NaN guard at body iteration level | Prevents any single bad body from corrupting the entire camera | Guard only at camera assignment | NaN could still propagate through centroid math |
| Optional chaining on velocity (?.x ?? 0) | Matter.js bodies can briefly have undefined velocity during creation | No guard | Crash or NaN propagation |
| Snap camera to 0,0,1 on NaN instead of tween | Tweening from NaN to 0 produces NaN forever | Tween with fallback | Phaser tweens can't handle NaN start values |

## Known Issues
- **Rope initial swing** — rope segments settle on creation causing slight pendulum motion
- **Seesaw density** — hardcoded at 0.005; some levels may need different values
- **Bloom performance** — up to 5 PostFX bloom instances per level. Monitor on low-end mobile.
- **Interactive tutorial** — ball may miss star at extreme edge of zone; retry flow handles it
- **Achievement emoji rendering** — some emoji may not render in Phaser canvas text on all platforms
- **Editor limitations** — no drag-to-move, no undo, no constraint editing
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics behavior untested on a Friday

## Next Steps (Priority Order)
1. **Beta testing** — Post from BETA-POSTS.md to r/webgames, Discord, IndieGaming
2. **Custom domain** — Buy kettenreaktion.de, configure DNS, update VITE_BASE_PATH
3. **Supabase leaderboard** — Phase 2 of ROADMAP.md. Global leaderboard backend.
4. **Gravity Flip + constraints full test** — wait for a Friday, play constraint levels
5. **Editor enhancements** — drag-to-move, undo, constraint editing (only if users request)
6. **Real percentile** — replace pseudo-percentile with actual data from Supabase (after Phase 2)

## Rollback Info
- Last known good: `68b2fac` (HEAD) — 1,712 tests pass, 272KB bundle
- Pre-brainstorm features: `2337f90` — NaN fixes only, 269KB bundle
- Pre-session 8: `18834bb` — session 7 handover commit
- Session 7 last good: `8d989e4` — 1,712 tests pass, 268KB bundle
- If mutations cause issues: remove DailyMutation.ts import and mutation code blocks in GameScene
- If near-miss camera is too dramatic: revert checkNearMisses() to simple text popup (pre-brainstorm commit)
- If wipe transitions break: revert `SceneTransition.ts` and all scene imports (commit `c15cefb` is pre-wipe)

## Files Created This Session
- `src/systems/DailyMutation.ts` — weekly physics mutations (bounce/friction/gravity per day-of-week)

## Files Modified This Session
- `src/game/CameraFX.ts` — NaN guards in followAction(), body velocity optional chaining, resetCamera() NaN recovery
- `src/scenes/GameScene.ts` — NaN guards, dramatic near-miss camera, mutation integration, ghost placement rendering
- `src/scenes/MenuScene.ts` — ghost placement URL parsing (?p=type,x,y), pass to GameScene on SPIELEN
- `src/scenes/ResultScene.ts` — include placement in challenge URL
- `src/systems/ShareManager.ts` — placement param in share URLs
- `src/game/TrailRenderer.ts` — defensive velocity optional chaining

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — 100% complete, all 42 sections implemented
- `BETA-POSTS.md` — ready-to-post community announcements for 6 platforms
- `CLAUDE.md` — project rules and conventions (source of truth)
- `PRINCIPLES.md` — engineering principles
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases (Phase 1 MVP complete, Phase 2 = Supabase)

---
**Last Updated:** 2026-03-30 (Session 8 — 6 commits, NaN fix + 3 creative features)
