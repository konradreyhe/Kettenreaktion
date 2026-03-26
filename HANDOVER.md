# Handover

## Summary
Session 2: Major polish pass on Kettenreaktion. Fixed 19 broken levels, deployed to Vercel, added mobile optimizations, object type selector, yesterday's replay system, daily difficulty curve, service worker versioning, SEO, daily puzzle lock, and many UX improvements. 15 commits pushed (total 29 in repo). All 27 tests pass, typecheck clean, both GH Pages and Vercel deployments live. Game is production-ready for beta testing.

## Completed
- [x] Level audit: all 90 levels analyzed, 19 fixed (gaps, isolated targets, tiny zones)
- [x] Vercel deployment working + dynamic base path (VITE_BASE_PATH env var)
- [x] Mobile optimization: touch offset (30px), body limit enforcement (30 mobile / 60 desktop)
- [x] Object type selector UI for levels with multiple allowed objects
- [x] Yesterday's solution replay (body position recording + ReplayScene + "Gestern" button)
- [x] Service worker v2: version-based cache, network-first HTML, auto-update + reload
- [x] ChainDetector: replaced setTimeout with timestamp Map (no timer dependency)
- [x] Daily difficulty curve: Mon=easy, Tue-Thu=medium, Fri=hard, Sat=medium, Sun=challenge
- [x] Menu shows today's result and "ABGESCHLOSSEN" when puzzle completed
- [x] Replay storage cleanup: prune replays older than 7 days on boot
- [x] Stats improvements: solve rate, best streak, avg score
- [x] Share URL fixed to actual GH Pages URL
- [x] SEO: robots.txt, sitemap.xml, enhanced meta tags, canonical URL, noscript fallback
- [x] Daily puzzle lock: "completed" flag prevents unlimited replays
- [x] Level intro shows allowed objects and target count
- [x] Tab visibility handling: physics pauses when tab hidden
- [x] Error boundary: friendly message on crash instead of blank screen
- [x] ResultScene: dynamic level count instead of hardcoded 90
- [x] PWA paths: relative paths for cross-deployment compatibility
- [x] LevelLoader.loadById() for replay level rendering
- [x] 3 new tests: ChainDetector dedup (2) + DailySystem difficulty range (1)

## In Progress
- [ ] Playwright MCP configured but needs session restart to load — visual iteration pending
- [ ] Kenney CC0 asset integration — not started, procedural textures are shippable

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| VITE_BASE_PATH env var | Single codebase for GH Pages + Vercel | Separate configs | Complexity |
| Timestamp Map for dedup | No timer dependency, works with tab-away | setTimeout | Unreliable |
| Day-of-week difficulty filter | Matches GAMEPLAN spec | Random from all | Bad UX |
| Replay at ~20fps (300 frame cap) | Good quality, reasonable storage | 60fps | 3x storage |
| Completed flag for puzzle lock | Prevents score manipulation | Allow unlimited | Unfair vs other players |
| Physics pause on visibility | Prevents time jumps | Ignore | Physics desync |

## Known Issues
- **No visual playtesting**: 19 levels fixed by code analysis only. Need Playwright MCP to verify.
- **Replay localStorage size**: Capped at 300 frames, pruned after 7 days. Should be fine.
- **Phaser chunk 1.5MB**: Expected, no action needed (339KB gzipped).
- **No og:image**: Need a screenshot/logo for social sharing preview.

## Next Steps (Priority Order)
1. **Visual iteration** — Restart session with Playwright MCP, run `/iterate-visual`
2. **Beta testing** — Post on r/webgames, Discord. Both deployments live.
3. **Custom domain** — Buy domain, update DNS + base path
4. **Kenney assets** — Download Physics Pack + Impact Sounds for visual upgrade
5. **Supabase leaderboard** — Phase 3 feature
6. **GIF replay sharing** — Extend replay to exportable GIF
7. **og:image** — Create a game screenshot for social media previews

## Rollback Info
- HEAD: `641abc2` — everything works, 27 tests pass
- Session 1 good state: `01eeee4`
- If base path issues: set `VITE_BASE_PATH=/`
- If Vercel clean slate: `rm -rf .vercel && vercel link --yes`
- All 15 session commits are incremental — safe to revert individually

## Files Modified This Session
### New Files
- `src/scenes/ReplayScene.ts` — Yesterday's solution replay
- `public/robots.txt` — SEO
- `public/sitemap.xml` — SEO

### Modified Files
- `src/game/LevelTemplates.ts` — 7 level fixes
- `src/game/LevelTemplates2.ts` — 5 level fixes
- `src/game/LevelTemplates3.ts` — 7 level fixes
- `src/game/ChainDetector.ts` — Timestamp Map dedup
- `src/game/ChainDetector.test.ts` — 2 new dedup tests
- `src/game/LevelLoader.ts` — loadById(), difficulty filter
- `src/game/PhysicsManager.ts` — Mobile body limit
- `src/scenes/GameScene.ts` — Touch offset, selector, replay, intro, visibility
- `src/scenes/MenuScene.ts` — Yesterday button, result display, puzzle lock
- `src/scenes/ResultScene.ts` — Replay data, completed flag, dynamic level count
- `src/scenes/BootScene.ts` — Replay pruning on startup
- `src/scenes/StatsScene.ts` — Computed stats (solve rate, best streak)
- `src/systems/DailySystem.ts` — getDailyDifficultyRange()
- `src/systems/DailySystem.test.ts` — Difficulty range test
- `src/systems/StorageManager.ts` — pruneOldReplays(), getComputedStats()
- `src/systems/ShareManager.ts` — Fixed share URL
- `src/systems/ShareManager.test.ts` — Updated URL assertion
- `src/types/GameState.ts` — ReplayFrame, completed flag, replay fields
- `src/main.ts` — Register ReplayScene
- `vite.config.ts` — Dynamic VITE_BASE_PATH
- `vercel.json` — VITE_BASE_PATH=/ build command
- `index.html` — SEO tags, noscript, error boundary, relative paths
- `public/sw.js` — Version-based caching, auto-update
- `public/manifest.json` — Relative paths

---
**Last Updated:** 2026-03-26
