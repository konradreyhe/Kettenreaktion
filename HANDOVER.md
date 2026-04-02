# Handover

## Summary
Session 15 picked up from a crashed session that left partial trajectory prediction code. Fixed the gravity bug, added touch drag-to-aim for mobile, fixed 4 memory/timer leaks, added streak milestone celebrations, removed 8 dead exports, added API request timeouts, fixed GIF branding URL, and updated CLAUDE.md with strict priority rules. 15 commits total, all pushed and deployed. 1,865 tests pass, build clean. **Most important for next session: CLAUDE.md now says CORE GAME FIRST — no new extras. Focus on making the existing core loop feel great, then launch blockers. Read CLAUDE.md "Current Focus" before doing anything.**

## Completed This Session
- [x] Trajectory prediction arc — fixed gravity bug (`g * scale` -> `g * scale * delta^2`), verified visually
- [x] Touch drag-to-aim — mobile users drag to aim with trajectory preview, release to place
- [x] ResultScene shutdown() — destroy countdown timer on scene stop
- [x] MenuScene countdown timer leak — destroy on shutdown
- [x] GameScene memory leaks — ghost sprites self-destruct after fade, shine mask destroyed on shutdown
- [x] Streak milestone celebrations — golden text + emoji badge + glow ring at 7/30/100 days
- [x] Vite chunkSizeWarningLimit raised to 1500KB (Phaser is inherently ~1479KB)
- [x] Dead code removal — 8 unused exports: hasMutation, TEXT_STROKE, GameEvent, PlacedObject, TargetState, GRAVITY_Y, SLEEP_THRESHOLD, FIXED_DELTA
- [x] API request timeouts — 5s AbortController timeout on all fetch calls
- [x] GIF branding URL fixed — was kettenreaktion.de (doesn't exist), now kettenreaktion.crelvo.dev
- [x] Game dev knowledge base committed (docs/research/GAME-DEV-KNOWLEDGE-BASE.md)
- [x] .playwright-mcp/ added to .gitignore
- [x] GameScene code audit — verified Phaser input events are scene-scoped (no manual cleanup needed)
- [x] Level difficulty audit — 225 levels verified, smooth Mon-easy to Sun-hard weekly curve
- [x] CLAUDE.md updated with strict priority rules: core game first, no new extras
- [x] All changes deployed to production (kettenreaktion.crelvo.dev)

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All 42 enhancement plan sections complete
- [x] 20+ bug fixes from Session 13 quality audit
- [x] Material themes, PostFX pipeline, MusicEngine, spatial audio
- [x] ZenScene, interactive tutorial, replay scrubber, level editor
- [x] 23-badge achievements, PWA, monthly events, wipe transitions
- [x] 7/7 daily physics mutations, ghost placement sharing
- [x] Backend API (result, stats, heatmap, streak, leaderboard)
- [x] GIF replay export, server-validated streaks, daily bet predictions
- [x] Combo popups, impact ripples, celebration overhaul
- [x] Photon Gallery, HUD attempt pips, Butterfly Effect comparison
- [x] Global leaderboard, ball trail, failure drama, placement ring

## In Progress
- [ ] **Core game quality** — trajectory prediction works but untested on real mobile devices
- [ ] **Launch prep** — custom domain not purchased, leaderboard untested with real data, beta posts not published

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Gravity = g * scale * delta^2 | Matter.js Verlet applies acceleration * delta^2 per step | Use raw gravity (g*scale=0.001) | Ball barely moved — 3px drop over 90 steps |
| Touch: pointerdown starts aim, pointerup places | Mobile has no hover — trajectory preview needs drag phase | Tap-to-place (no preview on mobile) | Defeats purpose of trajectory prediction on mobile |
| Graphics-based milestone ring animation | Reliable tween on plain object + redraw | Tween Phaser Arc.radius | Arc radius tweening is unreliable in Phaser |
| chunkSizeWarningLimit: 1500 | Phaser is 1479KB — warning is noise | manualChunks (already done) | Phaser IS the chunk, can't split further |
| 5s AbortController timeout on API | Prevents hanging on unresponsive server | No timeout | UI could wait indefinitely on slow/dead server |
| Phaser input events are scene-scoped | No manual removeListener needed | Add manual cleanup in shutdown | Unnecessary boilerplate, Phaser handles it |
| Core game first, no new extras | Game has accumulated extras while core launch items unfinished | Keep adding features | Dilutes quality of core experience |
| Delete unused exports completely | CLAUDE.md says no backwards-compat hacks | Keep unused exports "for later" | YAGNI principle, dead code is noise |

## Known Issues
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible (canvas-based)
- **Phaser bundle size** — 340KB gzipped, inherent to library. Lighthouse perf limited.
- **Leaderboard untested with real data** — endpoint works (returns empty array), needs real players
- **Touch drag-to-aim untested on real devices** — works in theory, needs real phone testing
- **GIF replay URL** — now shows kettenreaktion.crelvo.dev, must change to kettenreaktion.de when domain purchased

## Next Steps (Priority Order)

**FOCUS: Core game quality first. No new extras. See CLAUDE.md "Current Focus".**

### Core game (must do)
1. **Real device mobile testing** — Verify drag-to-aim, touch placement, trajectory feel on actual phones
2. **Performance profiling** — Test trajectory simulation on low-end mobile devices
3. **Level quality pass** — Play-test levels, ensure every level is solvable and fun
4. **Lighthouse > 90** — All categories (currently limited by Phaser bundle size)

### Launch blockers (must do)
5. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX (manual task)
6. **Test leaderboard with real data** — Play games to populate and verify display
7. **Soft launch** — Post from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)

### Do NOT prioritize
- New features, game modes, UI screens, cosmetics
- Refactoring or cleanup of working code
- Optimization of things that aren't measurably slow

## Rollback Info
- Last known good: `3450003` (HEAD) — 1,865 tests pass, 225 levels, all deployed
- Pre-session 15: `5915d24` — Session 14 final handover commit
- Pre-trajectory: `5915d24` — before trajectory prediction feature
- Server backup: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js.bak`

## Files Modified This Session
- `src/game/TrajectoryPredictor.ts` — Fixed gravity calculation (g * scale * delta^2), new file from crashed session
- `src/scenes/GameScene.ts` — TrajectoryPredictor integration, touch drag-to-aim, ghost sprite cleanup, shine mask cleanup
- `src/scenes/ResultScene.ts` — Added shutdown() with countdown timer cleanup
- `src/scenes/MenuScene.ts` — Countdown timer cleanup, streak milestone celebrations (7/30/100 days)
- `src/systems/ApiClient.ts` — Added fetchWithTimeout (5s AbortController)
- `src/systems/ReplayExporter.worker.ts` — Fixed GIF branding URL to current domain
- `src/systems/DailyMutation.ts` — Removed unused hasMutation()
- `src/systems/EventManager.ts` — Removed unused GameEvent export
- `src/constants/Style.ts` — Removed unused TEXT_STROKE
- `src/constants/Physics.ts` — Removed GRAVITY_Y, SLEEP_THRESHOLD, FIXED_DELTA
- `src/types/GameObject.ts` — Removed unused PlacedObject, TargetState interfaces
- `vite.config.ts` — Raised chunkSizeWarningLimit to 1500KB
- `.gitignore` — Added .playwright-mcp/
- `docs/research/GAME-DEV-KNOWLEDGE-BASE.md` — Game dev research doc (new file)
- `CLAUDE.md` — Added strict priority rules: core game first, no new extras. Updated level count to 225.
- `HANDOVER.md` — This file

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
**Last Updated:** 2026-04-02 (Session 15 — 15 commits: trajectory, touch aim, leaks, milestones, dead code, timeouts, priority rules)
