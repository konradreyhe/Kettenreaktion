# Handover

## Summary
Session 9 was a comprehensive polish and feature session: **10 commits** covering visual polish, new visualizations, server-validated streaks, editor improvements, beta readiness, and an asset quality audit. **Added score histogram bar chart and heatmap grid** to ResultScene using Phaser Graphics. **Built server-validated streaks** with new GET /api/kr/streak backend endpoint + client sync. **Enhanced the level editor** with drag-to-move and undo (Ctrl+Z). **Fixed 5 known issues** from the previous handover. **Added 21 StorageManager tests** and a first-time player onboarding prompt. **Cleaned up all remaining old GitHub Pages URLs.** 210 levels, 1,733 tests pass, 280KB bundle, 10 commits.

## Completed This Session
- [x] Fix object selector label clipping — moved from GAME_WIDTH-50 to GAME_WIDTH-75
- [x] Add Unicode icons to secondary menu buttons (target, question, yin-yang, chart)
- [x] Fix ShareManager test expecting old GitHub Pages URL
- [x] Score histogram bar chart in ResultScene (Phaser Graphics, blue→green gradient)
- [x] Heatmap grid visualization in ResultScene (8x6 or full 16x12 grid, orange→red heat)
- [x] Server-validated streaks — GET /api/kr/streak endpoint with grace period logic
- [x] Client fetchStreak() + StorageManager.syncServerStreak() for server→client sync
- [x] Extract seesaw body properties to BODY_PROPERTIES constant (was hardcoded 0.005)
- [x] Enhanced heatmap to use full grid data when available (not just topSpots)
- [x] Fix rope initial swing — frictionAir: 0.05 on segments dampens pendulum motion
- [x] Fix all remaining old GitHub Pages URLs (robots.txt, sitemap.xml, ShareManager, BETA-POSTS.md)
- [x] Add 21 StorageManager tests (streak logic, jokers, grace period, sync, scoring)
- [x] Bump service worker cache to v8
- [x] Level editor drag-to-move (select tool + drag, snapped to 20px grid)
- [x] Level editor undo (Ctrl+Z, 50-step history, full visual rebuild)
- [x] Undo button in editor panel with keyboard shortcut hint
- [x] First-time player tutorial prompt in MenuScene (text + pulsing button highlight)
- [x] Fix share URL missing https:// protocol
- [x] Add global error/unhandledrejection handlers in main.ts
- [x] Asset quality audit — 8 screenshots, 45 visual elements evaluated
- [x] Ghost preview ball visibility fix (0.6 opacity + pulse animation)
- [x] Equalized secondary menu button spacing (even 105px intervals)
- [x] Countdown timer text bumped from 10px to 11px

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
- [x] Level editor (EditorScene) with HTML panel + drag-to-move + undo
- [x] Monthly themed events framework
- [x] Wipe scene transitions (verified working)
- [x] Spatial audio panning
- [x] NaN camera guards (multi-layer defense)
- [x] Dramatic near-miss camera (slow-mo + zoom + vignette)
- [x] Weekly physics mutations (Gummi-Dienstag/Eis-Donnerstag/Flip-Freitag)
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)

## In Progress
- [ ] Deploy backend streak endpoint to VM (kettenreaktion.js modified locally, needs scp + docker rebuild)
- [ ] Beta testing — game is feature-complete, deployed, and has backend. Ready to post from BETA-POSTS.md.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Ghost preview pulse animation (0.6↔0.35 alpha) | Asset audit found ghost nearly invisible on dark green zone | Higher static opacity | Still easy to miss without motion |
| Equalized button spacing (cx±160, cx±55) | Previous 2+2 grouping implied false relationship | Keep original spacing | Looked unintentional |
| Server streak with 1-day grace period | Match client grace period logic exactly | Strict consecutive only | Would desync with client behavior |
| Undo as JSON snapshots (50-step) | Simple, correct, small memory footprint for editor | Command pattern | Over-complex for this use case |
| frictionAir: 0.05 for rope segments | 5x default dampens initial swing while allowing natural motion | Sleep on creation | Would prevent rope from moving at all initially |

## Known Issues
- **Bloom performance** — up to 4 PostFX bloom instances per level (checked: not a real issue)
- **Editor limitations** — no constraint editing, no width/height/angle editing for placed objects
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics untested on Friday
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares on certain OS
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible via Playwright
- **appManager server.js** modified locally — needs to stay in sync with VM copy

## Next Steps (Priority Order)
1. **Deploy to VM** — scp updated kettenreaktion.js + rebuild dashboard container for streak endpoint
2. **Beta testing** — Post from BETA-POSTS.md. Game is deployed with full backend.
3. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX, update nginx + SSL
4. **Gravity Flip + constraints full test** — Wait for a Friday
5. **Level theme visualization** — "wood"/"stone"/"metal" themes have no visual difference yet
6. **Editor constraint editing** — Add UI for ropes, springs, seesaws in editor panel

## Rollback Info
- Last known good: `5077086` (HEAD) — 1,733 tests pass, 280KB bundle
- Pre-session 9: `06508be` — session 8 handover commit
- Pre-asset-audit fixes: `e2f8501` — before ghost pulse + button spacing
- Pre-editor improvements: `426bde5` — before drag-to-move + undo
- Pre-streak feature: `b8a6cd9` — before server-validated streaks
- If streak endpoint breaks: game works fully offline — fetchStreak silently returns null
- If editor undo breaks: remove undoStack/pushUndo/undo methods, revert to click-only editor

## Files Created This Session
- `src/systems/StorageManager.test.ts` — 21 test cases for streak, joker, score, sync logic

## Files Modified This Session
- `src/scenes/GameScene.ts` — Object selector positioning (GAME_WIDTH-75), ghost preview pulse animation (0.6 alpha + tween)
- `src/scenes/MenuScene.ts` — Button icons, equalized spacing, first-time player prompt
- `src/scenes/ResultScene.ts` — Histogram bar chart, heatmap grid, server streak sync, countdown text size
- `src/systems/ApiClient.ts` — fetchStreak(), StreakData interface, HeatmapData grid field
- `src/systems/StorageManager.ts` — syncServerStreak() method
- `src/systems/ShareManager.ts` — https:// in share URL, old URL fix
- `src/constants/Physics.ts` — Added seesaw body properties
- `src/game/PhysicsManager.ts` — Seesaw uses constants, rope frictionAir: 0.05
- `src/scenes/EditorScene.ts` — Drag-to-move, undo (Ctrl+Z), undo button, redrawEntry()
- `src/main.ts` — Global error/unhandledrejection handlers
- `public/robots.txt` — Updated sitemap URL to production domain
- `public/sitemap.xml` — Updated canonical URL to production domain
- `public/sw.js` — Cache version bumped to v8
- `BETA-POSTS.md` — All play links updated to production domain
- `C:\Users\kreyh\Projekte\appManager\dashboard\routes\kettenreaktion.js` — GET /api/kr/streak endpoint (+93 lines)

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ → http://127.0.0.1:9091/api/kr/ (Dockfolio dashboard container)
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`
- **Backend deploy:** scp route file + server.js to VM, then `cd /home/deploy/appmanager && docker compose build dashboard && docker compose up -d dashboard`

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — 100% complete, all 42 sections implemented
- `BETA-POSTS.md` — ready-to-post community announcements (URLs updated)
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `docs/GAMEPLAN.md` — game design source of truth
- `C:\Users\kreyh\Projekte\appManager\CLAUDE.md` — VM deploy guide, nginx config template, SSH rules

---
**Last Updated:** 2026-03-30 (Session 9 — 10 commits, visual polish + histogram/heatmap + server streaks + editor drag/undo + beta readiness + asset audit)
