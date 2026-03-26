# Handover

## Summary
Session 2: Major polish pass on Kettenreaktion. Fixed 19 broken levels, deployed to Vercel, added mobile optimizations, object type selector, yesterday's replay system, daily difficulty curve, service worker versioning, and several UX improvements. 8 commits pushed. All 27 tests pass, typecheck clean, both GH Pages and Vercel deployments working. Game is now beta-ready with all known issues from Session 1 resolved.

## Completed
- [x] Level audit: all 90 levels analyzed for solvability
- [x] 19 level fixes: widened narrow gaps (018/031/050), fixed isolated targets (005/009/017/027/053/057/058/060/075/079/080/087/089), enlarged tiny placement zones (058/060/080/087/088/089/090), added ramp for difficulty-1 level 012
- [x] Vercel deployment working (was failing in Session 1): dynamic base path via VITE_BASE_PATH env var
- [x] Mobile optimization: 30px touch offset, MAX_BODIES_MOBILE (30) enforced on touch devices
- [x] Object type selector UI: buttons in top-right when level allows multiple types
- [x] Yesterday's solution replay: body positions recorded during simulation, ReplayScene with animated playback, "Gestern" button on menu
- [x] Service worker v2: version-based cache, network-first for HTML, auto-update with controllerchange reload
- [x] ChainDetector: replaced setTimeout with timestamp-based Map dedup (no timer dependency)
- [x] Daily difficulty curve: Mon=easy(1-2), Tue-Thu=medium(2-3), Fri=hard(3-4), Sat=medium(2-3), Sun=challenge(4-5)
- [x] Menu shows today's result if already played ("NOCHMAL SPIELEN" button)
- [x] PWA manifest + index.html use relative paths for cross-deployment compatibility
- [x] LevelLoader.loadById() for replay scene level rendering
- [x] 3 new tests: 2 ChainDetector dedup tests, 1 DailySystem difficulty range test (27 total)

## In Progress
- [ ] Kenney CC0 asset integration — Not started. Procedural textures are shippable. Download Physics Pack + Impact Sounds if visual upgrade desired.
- [ ] Playtesting all 90 levels visually — Needs Playwright MCP. Code analysis done, but no visual verification yet.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| VITE_BASE_PATH env var for base path | Single codebase works on both GH Pages (/Kettenreaktion/) and Vercel (/) | Separate build configs | More complexity, easy to diverge |
| Timestamp Map for ChainDetector dedup | No timer dependency, works correctly when tab is backgrounded | Keep setTimeout | Known issue from Session 1, unreliable with tab-away |
| Filter levels by day-of-week difficulty | Matches GAMEPLAN spec, ensures Monday is easy and Sunday is hard | Random from all levels | Bad UX — difficulty 5 on Monday frustrates casual players |
| Record replay at ~20fps (every 3rd frame) | Good visual quality, reasonable storage (~300 frames max) | Every frame (60fps) | 3x storage, no visible quality gain |
| Relative paths in manifest/HTML | Works on any base path without build-time transformation | Absolute paths | Breaks on GH Pages subpath |

## Known Issues
- **Level solvability not visually verified**: 19 levels were fixed based on code analysis. Need Playwright MCP to actually play and confirm they're solvable.
- **Replay data in localStorage**: Large replays (~300 frames × N bodies) could grow localStorage. Currently capped at 300 frames per attempt. Old puzzle replays accumulate indefinitely.
- **GH Pages base path**: vite.config.ts defaults to `/Kettenreaktion/`. For custom domain, set `VITE_BASE_PATH=/`.
- **Phaser chunk size**: phaser.js chunk is 1.5MB (339KB gzipped). Expected for Phaser, no action needed.
- **No level repeat prevention**: DailySystem could pick the same level twice in a row if the seed hash collides within the difficulty pool. Low probability with 90 levels.

## Next Steps (Priority Order)
1. **Beta testing** — Post on r/webgames, Discord game-dev. Game is ready. Both deployments live.
2. **Custom domain** — Buy domain, configure DNS to Vercel (or GH Pages). Change VITE_BASE_PATH.
3. **Kenney asset integration** — Download Physics Pack + UI Pack + Impact Sounds. Replace procedural textures.
4. **Playwright MCP playtesting** — Configure MCP, visually verify all 90 levels are solvable.
5. **Leaderboard (Supabase)** — Phase 2 feature. Schema + RLS documented in docs/guides/SECURITY.md.
6. **GIF replay sharing** — Extend replay system to export as GIF (Phase 2, GAMEPLAN line 96).
7. **More levels** — Generate templates 091+ for additional months of content.
8. **Replay storage cleanup** — Prune replays older than 7 days to prevent localStorage bloat.

## Rollback Info
- Last known good state: commit `4dd8d32` (HEAD) — everything works, 27 tests pass, both deployments live
- Session 1 last good state: `01eeee4`
- If GH Pages base path issues: set `VITE_BASE_PATH=/` in env
- If Vercel needs clean slate: `rm -rf .vercel && vercel link --yes`
- If a level is broken: use `?level=N` to test, fix in LevelTemplates/2/3.ts
- All 8 session commits are incremental — can safely revert any single commit

## Files Modified This Session
### New Files
- `src/scenes/ReplayScene.ts` — Yesterday's solution replay viewer

### Modified Files
- `src/game/LevelTemplates.ts` — Fixed levels 005, 009, 012, 017, 018, 027, 031
- `src/game/LevelTemplates2.ts` — Fixed levels 050, 053, 057, 058, 060
- `src/game/LevelTemplates3.ts` — Fixed levels 075, 079, 080, 087, 088, 089, 090
- `src/game/ChainDetector.ts` — Replaced setTimeout with timestamp Map dedup
- `src/game/ChainDetector.test.ts` — Added 2 dedup tests
- `src/game/LevelLoader.ts` — Added loadById(), difficulty-filtered loadToday()
- `src/game/PhysicsManager.ts` — Mobile body limit enforcement
- `src/scenes/GameScene.ts` — Touch offset, object selector, replay recording
- `src/scenes/MenuScene.ts` — Yesterday button, today's result display
- `src/scenes/ResultScene.ts` — Pass replay data to storage
- `src/systems/DailySystem.ts` — getDailyDifficultyRange()
- `src/systems/DailySystem.test.ts` — Added difficulty range test
- `src/types/GameState.ts` — ReplayFrame type, replay/placement/levelId fields
- `src/main.ts` — Register ReplayScene
- `vite.config.ts` — Dynamic VITE_BASE_PATH
- `vercel.json` — VITE_BASE_PATH=/ in build command
- `index.html` — Relative manifest path, SW auto-update
- `public/sw.js` — Version-based caching, network-first for HTML
- `public/manifest.json` — Relative paths

---
**Last Updated:** 2026-03-26
