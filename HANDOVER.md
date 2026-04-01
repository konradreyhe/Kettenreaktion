# Handover

## Summary
Session 14 continued from Session 13's quality audit. Fixed 6 more bugs (butterfly level mismatch, sound toggle desync, tooltip leak, canvas context crash, prediction toggle, magic number). Added visual polish (play button glow, platform shadows, star glow, background grid). Built and deployed the leaderboard feature (server endpoint + ResultScene UI — top 10 + own rank). 5 commits on master, 1,865 tests pass, build clean, deployed to production.

## Completed This Session
- [x] Push Session 13's 10 commits to origin
- [x] Fix ButterflyScene level mismatch — yesterday's replay uses its own levelId
- [x] Fix MenuScene sound toggle — reads AudioManager.isEnabled() on re-entry
- [x] Fix StatsScene tooltip leak — shared ref, destroy before recreating
- [x] Fix ReplayExporter canvas context — guard getContext('2d') instead of non-null assertion
- [x] Fix prediction toggle — `!null` → `true` skipped `false` state on first tap
- [x] Fix magic number — ResultScene uses POINTS_PER_SAVED_ATTEMPT constant
- [x] Visual polish: brighter SPIELEN button + glow, platform drop shadows, star target glow, background dot grid
- [x] Leaderboard API endpoint: GET /api/kr/leaderboard (top 10 + own rank)
- [x] Leaderboard UI on ResultScene: compact ranked list with highlighted "you" row
- [x] Deploy all changes to production (4 deploys)

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All 42 enhancement plan sections complete
- [x] 20+ bug fixes from Session 13 quality audit
- [x] Level validator (structural checks for 225 levels)
- [x] Lighthouse a11y/perf improvements (viewport meta, color contrast, loading screen, dynamic imports)
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
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak, GET leaderboard)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)
- [x] Server-validated streaks with grace period
- [x] Daily bet predictions with result badges
- [x] Combo text popups, impact ripples, celebration overhaul
- [x] Photon Gallery (shareable trail art)
- [x] HUD attempt pips + live timer
- [x] Butterfly Effect (side-by-side replay comparison)
- [x] Bell, bomb, portal, magnet object types
- [x] Global leaderboard (top 10 + own rank on ResultScene)

## In Progress
- [ ] Beta testing — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Leaderboard replaces histogram in primary viz slot | Top 10 is more engaging than score distribution bars | Histogram alongside leaderboard | Not enough horizontal space for both; leaderboard + heatmap is better |
| Platform drop shadows at 15% opacity, 3px offset | Subtle depth without distracting from gameplay | Heavier shadows / blur | Would look out of place in pixel-art-ish style |
| Guard canvas context with throw/postMessage | GIF button already handles errors with 'Fehler' label | Keep non-null assertion | Crash instead of graceful degradation |
| Prediction toggle: null→true→false cycle | First tap was skipping false (because !null===true) | Three-state cycle (null→true→false→null) | Two states sufficient — null means unanswered, not a third choice |

## Known Issues
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares.
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible.
- **Phaser bundle size** — 340KB gzipped, inherent to the library. Lighthouse perf score limited.
- **Redirect in Lighthouse** — 3.3s intermittent redirect, server-side issue not fixable in code.
- **ResultScene no shutdown()** — countdown timer event not explicitly destroyed (Phaser handles it on scene stop, but defensive shutdown would be better).

## Next Steps (Priority Order)
1. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
2. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX
3. **Add ResultScene shutdown()** — Store and destroy countdown timer event
4. **Test leaderboard with real data** — Play a few games to populate the leaderboard and verify display
5. **Consider manualChunks** — Vite warns about large chunks; could split Phaser from game code

## Rollback Info
- Last known good: `1c286ff` (HEAD) — 1,865 tests pass, 225 levels, leaderboard live
- Pre-session 14: `bd6852a` — Session 13 handover commit
- Pre-session 13: `2e694d2` — Session 12 handover
- Server backup: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js.bak` (pre-leaderboard)

## Files Modified This Session
- `src/scenes/ButterflyScene.ts` — Accept separate levelIdB for replay B's level
- `src/scenes/MenuScene.ts` — Sound toggle init from AudioManager, brighter play button glow
- `src/scenes/ResultScene.ts` — Leaderboard display, POINTS_PER_SAVED_ATTEMPT import, fetchLeaderboard
- `src/scenes/StatsScene.ts` — Tooltip leak fix (shared ref pattern)
- `src/scenes/GameScene.ts` — Prediction toggle fix, star glow increase, dot grid visibility
- `src/game/PhysicsManager.ts` — Platform drop shadows
- `src/systems/ApiClient.ts` — LeaderboardData types, fetchLeaderboard()
- `src/systems/ReplayExporter.ts` — Canvas context null guard
- `src/systems/ReplayExporter.worker.ts` — Canvas context null guard
- Server: `/home/deploy/appmanager/dashboard/routes/kettenreaktion.js` — Leaderboard endpoint

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/
- **API source:** /home/deploy/appmanager/dashboard/routes/kettenreaktion.js
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases and milestones

---
**Last Updated:** 2026-04-01 (Session 14 — 6 bug fixes, visual polish, leaderboard feature)
