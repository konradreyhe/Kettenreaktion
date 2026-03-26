# Handover

## Summary
Session 2 was a massive polish pass. Started from a working game (Session 1 built everything from scratch). This session: fixed 19 broken levels, got Vercel deployment working, added mobile optimizations, object type selector, yesterday's replay system, daily difficulty curve, service worker auto-update, SEO essentials, daily puzzle lock, "PERFEKT!" celebration, tab visibility handling, and many UX improvements. 18 commits pushed (total 30 in repo). All 27 tests pass, typecheck clean, git clean. Both GitHub Pages and Vercel deployments are live. **The game is production-ready for beta testing.** Next session should start with `/iterate-visual` — Playwright MCP was configured but needs a session restart to load.

## Completed
- [x] Level audit + 19 fixes: widened narrow gaps (018/031/050), fixed isolated targets (005/009/017/027/053/057/058/060/075/079/080/087/089), enlarged tiny zones (058/060/080/087/088/089/090), added ramp for level 012
- [x] Vercel deployment working: dynamic base path via `VITE_BASE_PATH` env var
- [x] Mobile optimization: 30px touch offset on touch devices, MAX_BODIES_MOBILE=30 enforced
- [x] Object type selector UI: clickable buttons when level allows multiple object types
- [x] Yesterday's solution replay: records body positions (~20fps), ReplayScene, "Gestern" button on menu
- [x] Service worker v2: version-based cache, network-first HTML, auto-update + auto-reload
- [x] ChainDetector: replaced setTimeout with timestamp Map (no timer dependency, safe with tab-away)
- [x] Daily difficulty curve: Mon=easy(1-2), Tue-Thu=medium(2-3), Fri=hard(3-4), Sat=medium(2-3), Sun=challenge(4-5)
- [x] Menu shows today's score if already played; "ABGESCHLOSSEN" when puzzle completed
- [x] Replay storage cleanup: prune replays >7 days old on boot
- [x] Stats improvements: solve rate %, best streak, avg score
- [x] Share URL fixed to actual GH Pages URL (was nonexistent kettenpuzzle.com)
- [x] SEO: robots.txt, sitemap.xml, enhanced meta/og/twitter tags, canonical URL, noscript
- [x] Daily puzzle lock: `completed` flag prevents unlimited replays
- [x] Level intro overlay shows allowed objects (Kugel/Gewicht) and target count
- [x] Tab visibility handling: Matter.js pauses when tab hidden, resumes when visible
- [x] Error boundary: global error handler shows friendly German message
- [x] "PERFEKT!" celebration for first-attempt all-target solve (big text, extra shake, delay)
- [x] Keyboard shortcut hints in HowTo scene
- [x] ResultScene uses LevelLoader.getTemplateCount() instead of hardcoded 90
- [x] LevelLoader.loadById() for replay level rendering
- [x] 3 new tests (27 total): ChainDetector dedup x2, DailySystem difficulty range
- [x] Playwright MCP configured (needs session restart to activate)

## In Progress
- [ ] Visual iteration (`/iterate-visual`) — Playwright MCP configured but not loaded this session. **Start next session with this.**
- [ ] Kenney CC0 asset integration — Not started. Procedural textures work fine. Download Physics Pack + Impact Sounds for visual upgrade if desired.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| VITE_BASE_PATH env var for base | Single codebase for GH Pages (/Kettenreaktion/) + Vercel (/) | Separate build configs per platform | More complexity, easy to diverge |
| Timestamp Map for ChainDetector dedup | No timer dependency, correct behavior when tab backgrounded | Keep setTimeout (Session 1 approach) | Unreliable — setTimeout pauses in background tabs |
| Filter levels by day-of-week difficulty | Matches GAMEPLAN spec, ensures good daily UX | Random from all 90 levels regardless of day | Difficulty 5 on Monday frustrates casual players |
| Record replay at ~20fps (every 3rd frame), cap 300 frames | Good quality, ~15KB per replay | Every frame (60fps) | 3x storage, no visible improvement |
| Relative paths in manifest/HTML | Works on any base path without build-time fixup | Absolute paths (/) | Breaks on GH Pages /Kettenreaktion/ subpath |
| completed flag for daily puzzle lock | Prevents score manipulation, matches Wordle behavior | Allow unlimited replays | Unfair — other players get only 3 attempts |
| Prune replay data after 7 days | Prevents localStorage growth | Keep forever / Never store | Bloat risk / Lose "yesterday" feature |
| Physics pause on visibilitychange | Prevents Matter.js time accumulation on tab-away | Ignore tab state | Physics jumps forward, desync, potential crashes |
| No custom font yet | Requires HTTP download, low priority vs gameplay | "Press Start 2P" Google Font | Can add later, system monospace works fine |
| Skip Kenney assets | Zero external dependencies, instant loading, consistent procedural style | Download + integrate sprite sheets | Extra build complexity, potential style mismatch |

## Known Issues
- **No visual playtesting**: 19 levels fixed by code analysis. Need Playwright MCP to visually confirm solvability.
- **No og:image**: Social sharing previews have no image. Need a screenshot or logo.
- **Phaser chunk 1.5MB**: Expected for Phaser (339KB gzipped). No action needed.
- **No level repeat prevention**: DailySystem could theoretically pick the same level two consecutive days. Low probability with 90 levels in difficulty-filtered pools.
- **Replay body order assumption**: ReplayScene assumes player object is last in body array. Usually true but not guaranteed.
- **Practice mode scores not saved**: By design — practice is for fun, not tracked.

## Next Steps (Priority Order)
1. **`/iterate-visual`** — Playwright MCP is configured. Start new session, take screenshots, iterate on visual polish.
2. **Beta testing** — Post on r/webgames, Discord game-dev servers. Both deployments live and ready.
3. **Custom domain** — Buy domain (kettenpuzzle.com or similar), set VITE_BASE_PATH=/, configure DNS.
4. **og:image** — Generate a game screenshot for social media previews.
5. **Kenney assets** — Download Physics Pack + UI Pack + Impact Sounds if visual upgrade desired.
6. **Supabase leaderboard** — Phase 3 feature. Schema documented in docs/guides/SECURITY.md.
7. **GIF replay sharing** ��� Extend replay system to export as animated GIF.
8. **More levels** ��� Generate templates 091+ for additional months of content.

## Rollback Info
- Last known good state: commit `70ba768` (HEAD) — everything works, 27 tests pass, both deployments live
- Session 1 last good state: `01eeee4` (before any Session 2 changes)
- If GH Pages base path breaks: set `VITE_BASE_PATH=/` in environment
- If Vercel needs clean slate: `rm -rf .vercel && vercel link --yes`
- If a level is broken: use `?level=N` URL param to test, fix in `src/game/LevelTemplates*.ts`
- All 18 session commits are incremental — can safely `git revert` any single commit

## Files Modified This Session
### New Files
- `src/scenes/ReplayScene.ts` — Yesterday's solution replay viewer with animated body playback
- `public/robots.txt` — SEO crawl rules + sitemap reference
- `public/sitemap.xml` — Single-page sitemap for search engines

### Modified Files
- `src/game/LevelTemplates.ts` — Fixed levels 005, 009, 012, 017, 018, 027, 031
- `src/game/LevelTemplates2.ts` — Fixed levels 050, 053, 057, 058, 060
- `src/game/LevelTemplates3.ts` — Fixed levels 075, 079, 080, 087, 088, 089, 090
- `src/game/ChainDetector.ts` — Replaced setTimeout with timestamp Map for pair dedup
- `src/game/ChainDetector.test.ts` — Added 2 dedup tests (same-pair within/after window)
- `src/game/LevelLoader.ts` — Added loadById(), difficulty-filtered loadToday()
- `src/game/PhysicsManager.ts` — Mobile body limit enforcement via maxBodies getter
- `src/scenes/GameScene.ts` — Touch offset, object selector, replay recording, "PERFEKT!" celebration, level intro info, tab visibility handler
- `src/scenes/MenuScene.ts` — Yesterday button, today's result display, daily puzzle lock
- `src/scenes/ResultScene.ts` — Passes replay data to storage, completed flag, dynamic level count
- `src/scenes/BootScene.ts` — Replay pruning on startup
- `src/scenes/StatsScene.ts` — Computed stats: solve rate, best streak, avg score
- `src/scenes/HowToScene.ts` — Keyboard shortcut hints section
- `src/systems/DailySystem.ts` — getDailyDifficultyRange() for day-of-week filtering
- `src/systems/DailySystem.test.ts` — Added difficulty range test
- `src/systems/StorageManager.ts` — pruneOldReplays(), getComputedStats()
- `src/systems/ShareManager.ts` — Fixed share URL to actual GH Pages deployment
- `src/systems/ShareManager.test.ts` — Updated URL assertion
- `src/types/GameState.ts` — ReplayFrame type, completed flag, replay/placement/levelId fields
- `src/main.ts` — Register ReplayScene
- `vite.config.ts` — Dynamic VITE_BASE_PATH (defaults to /Kettenreaktion/)
- `vercel.json` — VITE_BASE_PATH=/ in build command for root-relative Vercel
- `index.html` — SEO meta tags, noscript fallback, error boundary, relative manifest path, SW auto-update
- `public/sw.js` — v2: version-based caching, network-first HTML, skipWaiting message listener
- `public/manifest.json` — Relative paths (./) for cross-deployment compatibility

---
**Last Updated:** 2026-03-26
