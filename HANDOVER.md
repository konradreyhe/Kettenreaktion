# Handover

## Summary
Session 11 was a short housekeeping session. Pushed 19 accumulated local commits (sessions 8-10) to origin. Cleaned up 10 leftover screenshot JPGs and `.playwright-mcp/` directory from previous visual testing. Updated BETA-POSTS.md to correct level count from 150 to 210 (actual count across 8 TypeScript batch files). All changes committed and pushed. Game is deployed and live at kettenreaktion.crelvo.dev. 1,733 tests pass. Git is clean and in sync with origin.

## Completed This Session
- [x] Pushed 19 local commits to origin (sessions 8-10 work)
- [x] Cleaned up 10 leftover `v2-*.jpg` screenshot files from project root
- [x] Cleaned up `.playwright-mcp/` directory from project root
- [x] Updated BETA-POSTS.md — all "150 levels" references corrected to "210 levels"
- [x] Committed and pushed BETA-POSTS.md update

## Completed in Previous Sessions (Still Working)
- [x] 210 levels (batches 1-8) including 12 mixed-constraint levels
- [x] All 42 enhancement plan sections complete
- [x] Material themes (wood/stone/metal) with 9 procedural textures + themed collision audio
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox with 50-object cap
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek
- [x] 23-badge achievement system
- [x] PWA shortcuts and challenge URLs
- [x] Level editor (EditorScene) with HTML panel + drag-to-move + undo
- [x] Monthly themed events framework
- [x] Wipe scene transitions with edge accent
- [x] Spatial audio panning + material-differentiated collision audio
- [x] NaN camera guards (multi-layer defense)
- [x] Dramatic near-miss camera (slow-mo + zoom + vignette + ring + particles)
- [x] 7/7 daily physics mutations
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)
- [x] Server-validated streaks with grace period
- [x] Daily bet predictions with result badges
- [x] Combo text popups, impact ripples, celebration overhaul
- [x] Photon Gallery (shareable trail art)
- [x] HUD attempt pips + live timer

## In Progress
- [ ] Beta testing — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts for Reddit (r/webgames, r/IndieGaming, r/playmygame), Discord, Twitter/X, and Hacker News. Just needs manual posting.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Leave manifest.json as-is (stale, shows 10 levels) | No code references it — levels load from TypeScript batch files directly | Update manifest to list all 210 | Dead file, updating it adds maintenance burden for zero benefit |
| Delete screenshot files rather than gitignore | One-time cleanup, no pattern of screenshots being generated in project root | Add *.jpg to .gitignore | Would prevent legitimate image assets; screenshots were a one-off from visual testing |

## Known Issues
- **manifest.json is stale** — shows 10 templates, actual count is 210 in TypeScript. No code uses it.
- **Editor limitations** — no constraint editing, no width/height/angle editing for placed objects
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics untested on Friday mutation
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares on certain OS
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible via Playwright
- **All 7 days have mutations** — new players never experience baseline physics. Consider first-week exemption.
- **Daily bet auto-dismisses in 4s** — slow readers may miss it

## Next Steps (Priority Order)
1. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
2. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX, update nginx + SSL
3. **Gravity Flip + constraints full test** — Wait for a Friday
4. **Level theme visualization gap** — Wood/stone/metal could be more distinct. Consider theme-specific particle tints in EventManager.
5. **Replay Director** — Multiple camera angles for replay viewing (follow-ball, overview, artistic)
6. **Butterfly Effect** — Side-by-side replay comparison (your attempt vs best)
7. **Editor constraint editing** — Add UI for ropes, springs, seesaws in editor panel
8. **Bell target type** — Defined in types but never used. Add distinct visual + chime sound.
9. **New player mutation exemption** — First week plays without mutations for baseline experience

## Rollback Info
- Last known good: `feff0b1` (HEAD) — 1,733 tests pass, clean git, in sync with origin
- Pre-session 11: `5ac1c37` — session 10 handover commit
- Pre-session 10: `157c7f7` — session 9 handover commit

## Files Modified This Session
- `BETA-POSTS.md` — Updated all "150 levels" references to "210 levels" (7 occurrences across 6 platform drafts)

## Files Deleted This Session
- `v2-01-menu.jpg` through `v2-10-zone-fixed.jpg` — 10 leftover screenshots from visual testing
- `.playwright-mcp/` directory — leftover Playwright MCP config

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/ (Dockfolio dashboard container)
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`
- **Backend deploy:** scp route file + server.js to VM, then `cd /home/deploy/appmanager && docker compose build dashboard && docker compose up -d dashboard`

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements (updated this session)
- `docs/GAMEPLAN.md` — game design source of truth
- `C:\Users\kreyh\Projekte\appManager\CLAUDE.md` — VM deploy guide, nginx config template

---
**Last Updated:** 2026-03-31 (Session 11 — housekeeping, push to origin, beta post updates)
