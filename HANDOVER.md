# Handover

## Summary
Session 14 was a multi-focus session: bug fixes (6), visual polish (4 iterations), leaderboard feature (server + client), game design audit, and game feel improvements (3). All 6 known bugs from Session 13 handover fixed. Added global leaderboard (top 10 + own rank) to ResultScene with new server endpoint. Conducted comprehensive game design audit (7.4/10 — strong juice/polish, daily format works, but core verb is passive). Implemented 3 audit recommendations: ball motion trail, failure drama, placement shockwave ring. All work committed, pushed, and deployed to production. 6 commits on master, 1,865 tests pass, build clean.

## Completed This Session
- [x] Push Session 13's 10 commits to origin
- [x] Fix ButterflyScene level mismatch — yesterday's replay uses its own levelId
- [x] Fix MenuScene sound toggle — reads AudioManager.isEnabled() on re-entry
- [x] Fix StatsScene tooltip leak — shared ref, destroy before recreating
- [x] Fix ReplayExporter canvas context — guard getContext('2d') instead of non-null assertion
- [x] Fix prediction toggle — `!null` was `true`, skipping `false` state on first tap
- [x] Fix magic number — ResultScene uses POINTS_PER_SAVED_ATTEMPT constant
- [x] Visual polish: brighter SPIELEN button + glow, platform drop shadows, star target glow, background dot grid
- [x] Leaderboard API endpoint: GET /api/kr/leaderboard (top 10 + own rank)
- [x] Leaderboard UI on ResultScene: compact ranked list with highlighted "you" row
- [x] Game design audit (7.4/10) with detailed improvement roadmap
- [x] Ball motion trail — fading blue particles behind player object during simulation
- [x] Failure drama — dark flash + camera sag when attempt ends without hitting targets
- [x] Placement shockwave ring — expanding blue ring at placement point
- [x] Deploy all changes to production (5 deploys total)

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

## In Progress
- [ ] **Beta testing** — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts. This is a manual task.
- [ ] **Trajectory prediction arc** — highest-impact design improvement from game audit. Not started. Would show dotted parabolic arc during hover in placement zone.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Leaderboard replaces histogram in primary viz slot | Top 10 is more engaging than score distribution bars | Histogram alongside leaderboard | Not enough horizontal space; leaderboard + heatmap is better |
| Platform drop shadows at 15% opacity, 3px offset | Subtle depth without distracting from gameplay | Heavier shadows / blur | Out of place in the game's clean aesthetic |
| Guard canvas context with throw/postMessage | GIF button already handles errors with 'Fehler' label | Keep non-null assertion | Crash instead of graceful degradation |
| Prediction toggle: null->true->false cycle | !null===true was skipping false on first tap | Three-state cycle (null->true->false->null) | Two states sufficient, null means unanswered |
| Dark flash for failure (not desaturation) | Phaser's postFX.remove() typing doesn't accept ColorMatrix | desaturate via ColorMatrix PostFX | TypeScript error: ColorMatrix not assignable to Controller type |
| Ball trail at speed>0.5 threshold, every other frame | Prevents trail spam when ball is stationary or barely moving | Continuous emission | Too many particles, performance concern for mobile |
| Server leaderboard via Python patch script | Node.js not installed on host (all Docker) | sed inline edit | SQL backtick content gets mangled by shell escaping |
| Docker image rebuild for leaderboard | Route file is baked into image, not volume-mounted | Docker restart only | Container uses stale image, route not picked up |

## Known Issues
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible (canvas-based input)
- **Phaser bundle size** — 340KB gzipped, inherent to library. Lighthouse perf limited.
- **ResultScene no shutdown()** — countdown timer not explicitly destroyed (Phaser handles it on scene stop, but defensive cleanup is better)
- **Leaderboard untested with real data** — endpoint works (returns empty array), needs real player data to verify display

## Next Steps (Priority Order)
1. **Trajectory prediction arc** — Show dotted parabolic arc during hover in placement zone. Biggest design improvement from audit. Medium effort (~4hrs). Would simulate ~2 seconds of ball physics and draw the predicted path.
2. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
3. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX (manual task)
4. **Add ResultScene shutdown()** — Store and destroy countdown timer event
5. **Test leaderboard with real data** — Play a few games to populate and verify display
6. **Consider Vite manualChunks** — Split Phaser from game code to reduce chunk size warning
7. **Streak milestone celebrations** — Special badge animations at 7/30/100-day streaks on menu

## Rollback Info
- Last known good: `9d7555a` (HEAD) — 1,865 tests pass, 225 levels, all deployed
- Pre-game-feel: `4d9f4bc` — before ball trail, failure drama, placement ring
- Pre-leaderboard: `fa63ce9` — before leaderboard feature
- Pre-session 14: `bd6852a` — Session 13 handover commit
- Server backup: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js.bak` (pre-leaderboard)

## Files Modified This Session
- `src/scenes/ButterflyScene.ts` — Accept separate levelIdB for replay B's level
- `src/scenes/MenuScene.ts` — Sound toggle init from AudioManager, brighter play button glow
- `src/scenes/ResultScene.ts` — Leaderboard display, POINTS_PER_SAVED_ATTEMPT, fetchLeaderboard
- `src/scenes/StatsScene.ts` — Tooltip leak fix (shared ref pattern)
- `src/scenes/GameScene.ts` — Prediction toggle fix, star glow, dot grid, ball trail, failure drama, placement ring, trail emitter
- `src/game/PhysicsManager.ts` — Platform drop shadows
- `src/systems/ApiClient.ts` — LeaderboardData types, fetchLeaderboard()
- `src/systems/ReplayExporter.ts` — Canvas context null guard
- `src/systems/ReplayExporter.worker.ts` — Canvas context null guard
- Server: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js` — Leaderboard endpoint added

## Game Design Audit Summary (for reference)
- **Overall: 7.4/10** — Strong polish/juice, solid daily format, passive core verb
- **Strengths:** Celebration stack (5/6 feedback channels), daily scarcity model, 225 levels, mutation system
- **Weaknesses:** Core verb is single click + passive watching, failure is anticlimactic (now fixed), no trajectory preview
- **#1 improvement:** Trajectory prediction arc (transforms "guess" into "aim")
- **Reference games:** Wordle (daily format), Angry Birds (physics placement), Amazing Alex (chain reaction)

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
**Last Updated:** 2026-04-01 (Session 14 — 6 bug fixes, visual polish, leaderboard, game audit, feel improvements)
