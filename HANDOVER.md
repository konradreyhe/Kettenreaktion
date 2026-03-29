# Handover

## Summary
Session 6 was a massive feature session that delivered ALL 6 phases of the enhancement plan. Starting from 150 levels and basic gameplay, the session added: 48 new levels (198 total, including 18 with seesaws/springs/ropes), Phaser PostFX pipeline (bloom/glow/vignette/bokeh), Matter.js constraint physics (3 new gameplay mechanics), procedural ambient music engine, Zen Mode sandbox, interactive tutorial, replay scrubber with play/pause/speed/seek, enhanced practice mode with difficulty filter and score tracking, 19-badge achievement system, chain milestone celebrations, HUD animations, PWA shortcuts, and challenge URLs. **8 commits pushed and auto-deployed to GitHub Pages. All 1,616 tests pass. 243KB bundle. Live at https://konradreyhe.github.io/Kettenreaktion/**

## Completed
- [x] 30 new levels batch 6 (t151-t180), 6 per difficulty tier
- [x] 18 constraint levels batch 7 (t181-t198): 6 seesaw, 6 spring, 6 rope
- [x] Level schema: `LevelConstraint` interface (seesaw/spring/rope) in Level.ts
- [x] Seesaw mechanic: worldConstraint pivot + triangle marker visual
- [x] Spring mechanic: elastic constraint + zigzag coil rendering
- [x] Rope mechanic: chain of segment bodies + line rendering
- [x] PostFX bloom on star targets (pulsing glow, WebGL with Canvas fallback)
- [x] PostFX glow on placed object during simulation
- [x] Camera vignette intensifying with chain length (0.15→0.50)
- [x] Bokeh depth-of-field on all-targets celebration
- [x] Chain milestone celebrations at chains 5/10/15/20 ("STARK!", "UNGLAUBLICH!", "WAHNSINN!", "LEGENDE!")
- [x] All-targets "PERFEKT!" celebration (gold rings, particles, slow-mo, bokeh)
- [x] MusicEngine: drone + arpeggio + pad layers evolving with chain length
- [x] Music crescendo on all-targets hit
- [x] ZenScene: click anywhere, infinite placement, 4 object types, trails, music
- [x] Interactive tutorial (HowToScene rewrite: guided playable level)
- [x] Replay scrubber (play/pause, rewind, speed 0.5x/1x/2x, clickable progress, keyboard)
- [x] Practice mode: working difficulty filter, best score tracking, constraint type display
- [x] Practice scores saved per level in localStorage
- [x] 19-badge achievement system (progression, streaks, scores, solve rate, special, practice)
- [x] Achievement toast notifications in ResultScene
- [x] Achievement badge grid in StatsScene with hover tooltips
- [x] Enhanced HUD (score flash, chain counter colors, attempt warnings)
- [x] Menu text overlap fix (dynamic Y spacing)
- [x] Joker emoji fix (text label instead of unrenderable U+1F0CF)
- [x] PWA shortcuts ("Heute spielen", "Zen-Modus") in manifest.json
- [x] PWA shortcut handlers (?play=today, ?mode=zen) in MenuScene
- [x] Challenge URL ?challenge=N support in LevelLoader
- [x] Zen button added to menu (4-button row)
- [x] Music toggle synced to sound toggle
- [x] Service worker cache v6
- [x] ENHANCEMENT-PLAN.md (2,167 lines, 6 phases, 42 sections)
- [x] BETA-POSTS.md (Reddit, Discord, Twitter, HN, r/IndieGaming, r/playmygame)
- [x] All 8 commits pushed and deployed to GitHub Pages
- [x] Live site verified working at https://konradreyhe.github.io/Kettenreaktion/

## In Progress
- [ ] Spatial audio panning — Was about to add StereoPannerNode to AudioManager.playImpact() so sounds pan based on collision x position. Not started yet.
- [ ] Mixed-constraint levels (batch 8, t199-t210) — 12 levels combining seesaw+spring+rope mechanics. Not started.
- [ ] Beta testing — game is feature-complete but no community posts published yet

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| worldConstraint for seesaws | Phaser API for pinning body to world point | null bodyB in constraint() | Crashes — Phaser constraint() doesn't accept null |
| pointA: {x:0, y:0} in worldConstraint | Required by Matter.js to calculate length from body center | Omit pointA | Causes "Cannot read properties of undefined" error |
| PostFX with WebGL detection | Graceful degradation for Canvas fallback | Force WebGL | Breaks on old browsers |
| postFX (not preFX) for bloom | postFX creates light bleed around object edges | preFX | Only affects object texture, no glow |
| C minor pentatonic for music | Moody, atmospheric feel matching dark blue theme | C major | Too cheerful for the aesthetic |
| Music starts on simulation, not placement | Placement is a quiet strategic moment; music accompanies the action | Start on scene load | Music during placement is distracting |
| Detuned oscillator pairs for drone | Creates warm, organic beating effect | Single oscillator | Too sterile/digital sounding |
| Arpeggio at chain 2, pad at chain 5 | Progressive layering rewards longer chains | All layers from start | No sense of building/progression |
| 19 achievements (not 30+) | Achievable set that doesn't overwhelm new players | 30+ granular achievements | Too many dilutes the excitement |
| ZenScene separate from GameScene | Clean separation; no flags/conditionals polluting game logic | Reuse GameScene with isZen flag | Would add complexity to already large GameScene |
| Practice scores in GameStorage | Single localStorage key, consistent with existing data model | Separate localStorage key | Fragmented storage, harder to manage |
| Replay scrubber with setInterval speed change | Simple, works reliably | Phaser time scale | Phaser time scale affects physics too |
| 4-button menu row | Fits Zen button without layout changes | Separate row below | Pushes content too far down |
| Level editor deferred (Phase 6.4) | High effort, low priority vs other features | Build now | YAGNI — no community requesting it yet |
| Wipe transitions deferred (Phase 1.7) | Touches all 9 scenes, current fades work well | Build now | Low ROI for high effort |

## Known Issues
- **Rope initial swing** — rope segments settle on creation causing slight pendulum motion. Could add physics sleep delay but actually creates interesting gameplay dynamics
- **Seesaw density** — hardcoded at 0.005; some levels may need different values for ideal responsiveness
- **Gravity Flip + constraints** — seesaws/springs/ropes untested when gravity inverts on Fridays. May behave unexpectedly
- **Zen Mode body limit** — no cap on placed objects; could cause FPS drop if 100+ placed
- **Bloom performance** — up to 5 PostFX bloom instances per level (one per star). Monitor on low-end mobile
- **Interactive tutorial** — ball may miss the star if placed at extreme edge of zone; retry flow handles it
- **Achievement emoji rendering** — some emoji in achievement icons may not render in Phaser canvas text on all platforms
- **Constraint levels in daily rotation** — constraint levels will appear in daily puzzles based on difficulty filtering; no special handling needed

## Next Steps (Priority Order)
1. **Spatial audio panning** — Add StereoPannerNode to playImpact/playChainUp. Pan value = (collision.x / GAME_WIDTH) * 2 - 1. ~20 lines in AudioManager.
2. **Mixed-constraint levels batch 8** — 12 levels (t199-t210) combining seesaw+spring, rope+seesaw, spring+rope. Use existing constraint system.
3. **Beta testing** — Post from BETA-POSTS.md to r/webgames, Discord, etc. Game is feature-complete.
4. **Custom domain** — Buy kettenreaktion.de, configure DNS, update VITE_BASE_PATH
5. **Visual playtest ALL constraint levels** — especially seesaw+rope levels t197-t198
6. **Gravity Flip + constraints test** — wait for Friday, verify seesaw/spring/rope behavior with inverted gravity
7. **Level editor** — Phase 6.4, behind ?editor=1 feature flag
8. **Monthly themed events** — seasonal variations framework

## Rollback Info
- Last known good: `72f34a3` (HEAD) — 1,616 tests pass, 243KB bundle, deployed
- Session 5 last good: `a7d3a0e`
- If MusicEngine crashes: remove imports from GameScene.ts, MenuScene.ts, ZenScene.ts
- If ZenScene crashes: remove from main.ts scene array
- If constraints crash: remove constraint methods from PhysicsManager.ts, remove batch 7 from LevelLoader
- If PostFX crash: remove all postFX.add*() calls and isWebGL guards from GameScene.ts
- If interactive tutorial crashes: revert HowToScene.ts to commit `a7d3a0e`
- If achievements crash: remove AchievementManager imports from ResultScene.ts + StatsScene.ts
- Service worker: revert CACHE_VERSION to 5 in public/sw.js

## Files Created This Session
- `src/game/LevelTemplates6.ts` — 30 standard levels (t151-t180)
- `src/game/LevelTemplates7.ts` — 18 constraint levels (t181-t198)
- `src/systems/AchievementManager.ts` — 19 achievements with check/unlock/query
- `src/systems/MusicEngine.ts` — procedural ambient music with layered synthesis
- `src/scenes/ZenScene.ts` — no-goal physics sandbox
- `BETA-POSTS.md` — beta community posts for 6 platforms
- `ENHANCEMENT-PLAN.md` — 2,167-line implementation plan (6 phases, 42 sections)

## Files Modified This Session
- `src/types/Level.ts` — added LevelConstraint interface
- `src/types/GameState.ts` — added achievements, practiceScores fields, bloom to TargetEntry
- `src/game/PhysicsManager.ts` — seesaw/spring/rope constraint creation + zigzag/line rendering + cleanup
- `src/game/LevelLoader.ts` — batch 6+7 imports, ?challenge param support
- `src/game/LevelLoader.test.ts` — updated for 198 levels
- `src/scenes/GameScene.ts` — PostFX (bloom/glow/vignette/bokeh), chain celebrations, all-targets celebration, music integration, WebGL detection, milestone tracking
- `src/scenes/ResultScene.ts` — achievement checking + toasts, practice score saving
- `src/scenes/StatsScene.ts` — achievement badge grid with hover tooltips, joker emoji fix
- `src/scenes/MenuScene.ts` — Zen button, music toggle, PWA shortcut handlers, text overlap fix, 4-button layout
- `src/scenes/HowToScene.ts` — complete rewrite to interactive guided tutorial
- `src/scenes/ReplayScene.ts` — scrubber controls (play/pause/rewind/speed/seek/keyboard)
- `src/scenes/PracticeScene.ts` — difficulty filter, best score display, constraint type info, practice stats
- `src/systems/AudioManager.ts` — added getContext(), isEnabled() for MusicEngine
- `src/ui/HUD.ts` — score flash animation, chain counter color escalation, attempt warning colors
- `src/main.ts` — ZenScene registration
- `public/manifest.json` — PWA shortcuts + categories
- `public/sw.js` — cache version 6
- `CLAUDE.md` — status updated to "Beta-ready"

## Key Reference Docs
- `ENHANCEMENT-PLAN.md` — THE implementation guide for remaining work
- `BETA-POSTS.md` — ready-to-post community announcements
- `CLAUDE.md` — project rules and conventions
- `docs/GAMEPLAN.md` — game design source of truth

---
**Last Updated:** 2026-03-29 (Session 6 end — 8 commits pushed)
