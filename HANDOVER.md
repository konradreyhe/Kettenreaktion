# Handover

## Summary
Session 8 was the biggest session yet: stability fixes, creative features, backend API, and production deployment. **Fixed a critical NaN camera bug** that caused permanent blank screens. **Added 3 creative features:** dramatic near-miss camera (slow-mo + zoom), weekly physics mutations (Gummi-Dienstag/Eis-Donnerstag/Flip-Freitag), and ghost placement sharing via URL. **Built and deployed a 3-route backend API** on the Dockfolio VM (POST results, GET stats, GET heatmap) with SQLite storage. **Deployed to production** at `kettenreaktion.crelvo.dev` with SSL, Plausible analytics, and API proxy. All URLs updated from GitHub Pages to production domain. **210 levels, 1,712 tests pass, 272KB bundle, 10 commits.**

## Completed This Session
- [x] Visual verification of all wipe transitions across 7+ scene paths
- [x] Fix NaN camera corruption in CameraFX.followAction() — permanent blank screen bug
- [x] NaN guards in CameraFX.resetCamera(), collision FX, energy graph, TrailRenderer
- [x] "KNAPP!" dramatic near-miss camera — slow-mo zoom + vignette pulse + shake + red glow text
- [x] Weekly physics mutations system (DailyMutation.ts) — Gummi-Dienstag (2x bounce), Eis-Donnerstag (zero friction), Flip-Freitag (gravity flip)
- [x] Mutation badges in level intro overlay and HUD label
- [x] Ghost placement sharing — ?p=type,x,y URL param shows friend's placement as pulsing hint
- [x] Share URLs include placement data for ghost comparison
- [x] Backend API routes (kettenreaktion.js) in appManager — 3 endpoints: POST /api/kr/result, GET /api/kr/stats, GET /api/kr/heatmap
- [x] SQLite table kr_daily_results with UNIQUE per player/day, score histogram, placement grid
- [x] ApiClient.ts — client-side service for submitting results and fetching stats
- [x] ResultScene integration — auto-submit scores, show global stats + percentile + heatmap top spots
- [x] Production deployment at kettenreaktion.crelvo.dev (nginx + SSL + Plausible analytics)
- [x] Vite base path fix for Windows bash (VITE_BASE_PATH=root sentinel)
- [x] All URLs updated from GitHub Pages to kettenreaktion.crelvo.dev (OG tags, share URLs, canonical)
- [x] Public path + CSRF exemptions for /api/kr/ in Dockfolio server.js

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

## In Progress
- [ ] Visual polish iteration — started but saved for next session. Object selector label clips on right edge. Secondary menu buttons could use icons.
- [ ] Beta testing — game is feature-complete, deployed, and has backend. Ready to post from BETA-POSTS.md.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| NaN guard at body iteration + camera assignment | Multi-layer defense: skip bad bodies AND recover if NaN reaches camera | Guard only at camera | NaN still propagates through centroid math |
| Snap camera to 0,0,1 on NaN (not tween) | Phaser tweens can't interpolate from NaN | Tween with fallback | Tweening NaN→0 stays NaN forever |
| VITE_BASE_PATH=root sentinel instead of '/' | Bash on Windows expands '/' to 'C:/Program Files/Git/' | Direct '/' value | Broken on Windows bash |
| Backend in Dockfolio (appManager) routes | Reuses existing Express + SQLite + Docker infra, no new services | Standalone Express app | Extra container, extra maintenance |
| /api/kr/ public path + CSRF exempt | Game is cross-origin static site, can't have session cookies | Require auth | Game has no login, anonymous players |
| Anonymous UUID player IDs (localStorage) | No accounts needed, privacy-friendly, works immediately | Server-generated IDs | Requires signup flow, kills onboarding |
| 3 routes only (result, stats, heatmap) | Minimal viable backend, covers 80% of social features | Full REST API with users/friends | Over-engineering for pre-beta |
| Weekly mutations as data-driven constants | Easy to add/modify, single file, no database | Per-level mutation configs | Over-complex, YAGNI |
| Dramatic near-miss: slow-mo + zoom + vignette | Creates TikTok-clippable moments, all systems already existed | Just bigger text | Not dramatic enough for sharing |
| Ghost placement as URL param (?p=) | Zero backend needed, works with clipboard sharing | Store in Supabase | No backend yet at time of implementation |

## Known Issues
- **Object selector "Objekt:" label** clips at right edge on wider viewports
- **Rope initial swing** — rope segments settle on creation causing slight pendulum motion
- **Seesaw density** — hardcoded at 0.005
- **Bloom performance** — up to 5 PostFX bloom instances per level
- **Editor limitations** — no drag-to-move, no undo, no constraint editing
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics untested on Friday
- **OG image** still references old URL path (og-image.jpg may need updating for new domain)
- **appManager server.js** modified locally — needs to stay in sync with VM copy

## Next Steps (Priority Order)
1. **Beta testing** — Post from BETA-POSTS.md. Game is deployed with backend, ready for real users.
2. **Visual polish** — Object selector positioning, secondary button icons, timer text size
3. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX, update nginx + SSL
4. **Heatmap visualization** — Currently shows text-only top spots. Add canvas-drawn heatmap overlay in ResultScene.
5. **Score histogram chart** — Draw bar chart of score distribution in ResultScene (data already available from API)
6. **Server-validated streaks** — Move streak tracking to backend (anonymous UUID already in place)
7. **Gravity Flip + constraints full test** — Wait for a Friday
8. **GIF replay export** — Highest-leverage viral feature (already in Enhancement Plan)

## Rollback Info
- Last known good: `97c2599` (HEAD) — 1,712 tests pass, 272KB bundle, deployed to kettenreaktion.crelvo.dev
- Pre-backend: `3735446` — before API client integration
- Pre-brainstorm features: `2337f90` — NaN fixes only, 269KB bundle
- Pre-session 8: `18834bb` — session 7 handover commit
- If mutations cause issues: remove DailyMutation.ts import and mutation code blocks in GameScene
- If near-miss camera too dramatic: revert checkNearMisses() to simple text popup (commit 2337f90)
- If backend breaks: game works fully offline — ApiClient silently fails, all features degrade gracefully
- appManager rollback: revert dashboard/server.js and remove dashboard/routes/kettenreaktion.js, rebuild container

## Files Created This Session
- `src/systems/DailyMutation.ts` — weekly physics mutations (bounce/friction/gravity per day-of-week)
- `src/systems/ApiClient.ts` — lightweight API client (submit results, fetch stats/heatmap)
- `C:\Users\kreyh\Projekte\appManager\dashboard\routes\kettenreaktion.js` — 3 Express routes for backend API

## Files Modified This Session
- `src/game/CameraFX.ts` — NaN guards in followAction(), body velocity optional chaining, resetCamera() NaN recovery
- `src/scenes/GameScene.ts` — NaN guards, dramatic near-miss camera, mutation integration, ghost placement rendering, simulate event emit
- `src/scenes/ResultScene.ts` — API submission, global stats display, percentile badge, heatmap spots, placement in challenge URL
- `src/scenes/MenuScene.ts` — ghost placement URL parsing (?p=type,x,y), parseGhostParam static method, pass to GameScene
- `src/systems/ShareManager.ts` — placement param in share URLs, updated base URL to kettenreaktion.crelvo.dev
- `src/game/TrailRenderer.ts` — defensive velocity optional chaining
- `index.html` — updated OG tags, canonical URL, twitter cards to kettenreaktion.crelvo.dev
- `vite.config.ts` — VITE_BASE_PATH=root sentinel for Windows bash compatibility
- `C:\Users\kreyh\Projekte\appManager\dashboard\server.js` — import + register KR routes, add /api/kr to PUBLIC_PATHS + CSRF_EXEMPT

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **Nginx config:** /home/deploy/nginx-configs/sites/kettenreaktion.crelvo.dev
- **SSL cert:** /etc/letsencrypt/live/kettenreaktion.crelvo.dev/ (auto-renew via certbot)
- **API proxy:** /api/kr/ → http://127.0.0.1:9091/api/kr/ (Dockfolio dashboard container)
- **Analytics:** Plausible injected via nginx sub_filter
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`
- **Backend deploy:** scp route file + server.js to VM, then `cd /home/deploy/appmanager && docker compose build dashboard && docker compose up -d dashboard`

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — 100% complete, all 42 sections implemented
- `BETA-POSTS.md` — ready-to-post community announcements
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `docs/GAMEPLAN.md` — game design source of truth
- `C:\Users\kreyh\Projekte\appManager\CLAUDE.md` — VM deploy guide, nginx config template, SSH rules

---
**Last Updated:** 2026-03-30 (Session 8 — 10 commits, NaN fix + creative features + backend API + production deploy)
