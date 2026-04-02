# Handover

## Summary
Session 15 picked up from a crashed session that had partially implemented trajectory prediction. Fixed the gravity bug (Matter.js Verlet `delta^2` factor was missing), verified visually, committed. Also added ResultScene/MenuScene shutdown cleanup, streak milestone celebrations (7/30/100 days), silenced Vite chunk warning, and deployed everything to production. 5 commits on master, 1,865 tests pass, build clean.

## Completed This Session
- [x] Trajectory prediction arc — fixed gravity bug (`g * scale` → `g * scale * delta^2`), verified visually via Playwright
- [x] ResultScene shutdown() — destroy countdown timer on scene stop
- [x] MenuScene countdown timer leak — destroy on shutdown (same pattern)
- [x] Streak milestone celebrations — golden text + emoji badge + glow ring at 7/30/100 days
- [x] Vite chunkSizeWarningLimit raised to 1500KB (Phaser is inherently ~1479KB)
- [x] Deploy all changes to production (kettenreaktion.crelvo.dev)

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All 42 enhancement plan sections complete
- [x] 20+ bug fixes from Session 13 quality audit
- [x] Level validator (structural checks for 225 levels)
- [x] Lighthouse a11y/perf improvements
- [x] Material themes (wood/stone/metal) with 9 procedural textures
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox, interactive tutorial, replay scrubber
- [x] 23-badge achievement system, PWA shortcuts, level editor
- [x] Monthly themed events, wipe scene transitions
- [x] Spatial audio panning + material-differentiated collision audio
- [x] NaN camera guards, dramatic near-miss camera
- [x] 7/7 daily physics mutations, ghost placement sharing
- [x] Backend API (result, stats, heatmap, streak, leaderboard)
- [x] GIF replay export, server-validated streaks, daily bet predictions
- [x] Combo text popups, impact ripples, celebration overhaul
- [x] Photon Gallery, HUD attempt pips, Butterfly Effect comparison
- [x] Global leaderboard (top 10 + own rank on ResultScene)
- [x] Ball motion trail, failure drama, placement shockwave ring
- [x] Trajectory prediction arc (dotted path preview during hover)
- [x] Streak milestone celebrations (7/30/100 days)

## In Progress
- [ ] **Beta testing** — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts. This is a manual task.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Gravity = g * scale * delta^2 | Matter.js Verlet applies acceleration * delta^2 per step. Raw g*scale=0.001 produced ~3px drop over 90 steps | Use raw gravity value | Ball barely moved — dots clustered in 3px range |
| Graphics-based milestone ring | Phaser Arc radius can't be reliably tweened | Tween Arc.radius directly | Unreliable with Phaser's Arc game object |
| chunkSizeWarningLimit: 1500 | Phaser is 1479KB — warning is noise, not actionable | manualChunks (already done) | Already splitting Phaser; the chunk IS Phaser |

## Known Issues
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible (canvas-based input)
- **Phaser bundle size** — 340KB gzipped, inherent to library. Lighthouse perf limited.
- **Leaderboard untested with real data** — endpoint works (returns empty array), needs real player data to verify display

## Next Steps (Priority Order)
1. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
2. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX (manual task)
3. **Test leaderboard with real data** — Play a few games to populate and verify display
4. **Consider level difficulty curve** — Audit whether 225 levels have a smooth progression
5. **Mobile touch testing** — Verify trajectory prediction works well on touch devices
6. **Performance profiling** — Test on low-end mobile devices (trajectory simulation adds per-frame work)

## Rollback Info
- Last known good: `d7a5961` (HEAD) — 1,865 tests pass, 225 levels, all deployed
- Pre-session 15: `5915d24` — Session 14 final handover commit
- Pre-trajectory: `5915d24` — before trajectory prediction
- Server backup: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js.bak` (pre-leaderboard)

## Files Modified This Session
- `src/game/TrajectoryPredictor.ts` — Fixed gravity calculation (new file from crashed session)
- `src/scenes/GameScene.ts` — TrajectoryPredictor integration (from crashed session)
- `src/scenes/ResultScene.ts` — Added shutdown() with countdown timer cleanup
- `src/scenes/MenuScene.ts` — Countdown timer cleanup in shutdown(), streak milestone celebrations
- `vite.config.ts` — Raised chunkSizeWarningLimit to 1500KB

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/
- **API source:** /home/deploy/appmanager/dashboard/routes/kettenreaktion.js
- **Deploy:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases and milestones

---
**Last Updated:** 2026-04-02 (Session 15 — trajectory prediction, timer cleanup, milestone celebrations, deploy)
