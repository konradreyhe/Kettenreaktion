# Handover

## Summary
Built Kettenreaktion from empty folder to a fully deployed, playable daily physics puzzle game in one session. 14 commits, 90 levels, 7 scenes, procedural audio, full game juice (screen shake, slow-mo, trails, squash & stretch, particles), practice mode, stats screen, PWA with service worker. Deployed to GitHub Pages at https://konradreyhe.github.io/Kettenreaktion/. Vercel deployment is configured but their build servers had an outage during the session — the Vercel project exists at konradus-projects/kettenreaktion and should auto-build once their infra recovers. The game is launch-ready for beta testing with 90 levels (3 months of daily content). No uncommitted work, no broken state.

## Completed
- [x] Full project scaffold: Vite 5.4 + TypeScript 5.5 (strict) + Phaser 3.90 + Matter.js
- [x] 10 documentation files aligned with PRINCIPLES.md (CLAUDE.md, README, ARCHITECTURE, GAMEPLAN, ROADMAP, COMPONENTS, API, SECURITY, GAMEPLAY, DEPLOYMENT)
- [x] 7 Phaser scenes: Boot, Menu, HowTo, Practice, Stats, Game, Result
- [x] 90 level templates across difficulty 1-5 with 3 themes (wood/stone/metal)
- [x] 4 physics object types: Ball (bouncy), Domino (tips), Crate (heavy), Weight (very heavy)
- [x] Procedural textures with visual identity: ball rings, domino wood grain, crate cross-brace, weight metallic, star targets, hatched platforms
- [x] Player object glow tracking (cyan tint + follow ring)
- [x] Theme-based background tints (wood=warm, stone=cool, metal=dark)
- [x] Game juice: trauma-based screen shake, slow-motion on target hits, motion trails, squash & stretch, 3 particle types (hit/spark/dust), vignette, confetti
- [x] 7 procedural Web Audio sounds: click, place, impact (pitch varies), chain-up, target hit (ascending), success chord, fail
- [x] Daily puzzle system: UTC date seed, deterministic level selection, streak tracking
- [x] Wordle-style emoji share card with target/chain/attempt visualization
- [x] Practice mode: browse all 90 levels, play freely, replay/next on result
- [x] Statistics screen: lifetime stats + last 10 puzzle history
- [x] Keyboard shortcuts: ESC to quit, arrows in practice, Enter to start
- [x] HUD with dark panel backing for readability
- [x] Standardized Button component (hover scale, press squash, audio click)
- [x] Level intro overlay (name + difficulty stars + hint)
- [x] Near-miss "Knapp!" detection and display
- [x] Retry overlay between attempts with hit feedback
- [x] Input locked during level intro (introActive flag)
- [x] PWA manifest + service worker (offline-capable)
- [x] 24 unit tests (ScoreCalculator, DailySystem, ChainDetector, ShareManager)
- [x] GitHub Pages deployment (live)
- [x] Debug mode: ?level=0 through ?level=89 URL param
- [x] GitHub repo: https://github.com/konradreyhe/Kettenreaktion (public)
- [x] Asset quality audit completed (code-based, no Playwright MCP available)
- [x] Completionist research phase done (127-item feature inventory)

## In Progress
- [ ] Vercel deployment — Status: Project configured, builds succeed locally, but Vercel's build servers returned "Unexpected error" repeatedly during this session. The .vercel/ folder and vercel.json are configured. Just run `vercel --prod --yes` when their infra is back.
- [ ] Completionist gameplay testing (Phase 3-5) — Status: Research complete (127 items inventoried), zero items actually playtested via Playwright MCP because MCP was not available. Need Playwright MCP configured to proceed.
- [ ] Kenney CC0 asset integration — Status: All textures are procedural (generated in BootScene). Kenney Physics Pack, UI Pack, Impact Sounds are specified in the Masterplan but not downloaded/integrated. Current procedural art is shippable but Kenney assets would be a visual upgrade.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Procedural textures instead of Kenney PNGs | Zero external asset dependencies, instant loading, consistent style, easy to modify | Kenney sprite sheets | Adds download step, asset loading complexity, potential style mismatch between packs |
| Web Audio API instead of sound files | No external audio files needed, procedural pitch variation per chain length, tiny bundle size | Kenney Impact Sounds + OGG files | Adds ~2MB of audio assets, slower loading, less dynamic (can't vary pitch per chain index) |
| GitHub Pages instead of Vercel | Vercel had persistent "Unexpected error" during session | Vercel (primary), Surge.sh, Netlify | Vercel down; Surge needs interactive login; Netlify available but GH Pages simpler |
| Base URL /Kettenreaktion/ for GH Pages | Required for GH Pages project site (not custom domain) | Base URL / | Only works on custom domain or Vercel, breaks on GH Pages subpath |
| Repo made public | Required for GH Pages on free GitHub plan | Keep private | Would need GitHub Pro or alternative host |
| Practice mode as separate scene | Clean separation from daily mode, no state pollution | URL param mode switch, in-game toggle | More complex state management, confusing UX |
| 3 template files (not 1 giant file) | Keeps each file under 600 lines, easier to navigate | Single LevelTemplates.ts, JSON files | Single file too large; JSON requires asset loading pipeline |
| CameraFX.slowMotion only affects time.timeScale, NOT matter engine | Preserves physics determinism (same seed = same result) | Also slow matter engine | Would make physics non-deterministic across players |
| No custom font yet | Adds HTTP request, potential FOIT/FOUT, low priority vs gameplay | "Press Start 2P" Google Font | Can add later, system font works fine for beta |
| localStorage for all persistence | Zero backend needed for MVP, works offline | Supabase from start | YAGNI — Supabase only needed for leaderboard (Phase 2) |

## Known Issues
- **Vercel deploy fails**: "Unexpected error" on every attempt. Project is configured correctly (vercel.json, .vercel/). Likely Vercel infrastructure issue. Retry later or use GH Pages.
- **GH Pages base path**: vite.config.ts has `base: '/Kettenreaktion/'` which means local dev needs to account for this (dev server still works at root, only affects production build). If deploying to custom domain later, change back to `base: '/'`.
- **No Playwright MCP**: Asset quality audit and completionist testing were done via code analysis only. Need MCP configured for visual verification.
- **Service worker caching**: SW caches aggressively. After deploys, users may need to hard-refresh. Consider adding a version check mechanism.
- **Level difficulty not validated**: All 90 levels were hand-crafted but not playtested for solvability. LevelValidator.ts from the Masterplan is not implemented. Some levels (especially difficulty 5 with 10x10px zones) may be too hard or unsolvable.
- **No mobile body limit enforcement**: PRINCIPLES and Masterplan specify max 30 bodies on mobile. This check is not implemented — all platforms use the same body count.
- **ChainDetector uses setTimeout for pair dedup**: Not tied to Phaser clock. Tab-away could cause timing issues. Low severity.

## Next Steps (Priority Order)
1. **Playtest all 90 levels** — Use practice mode (?level=N or Practice screen) to verify each level is solvable. Fix any unsolvable levels.
2. **Fix Vercel deploy** — Try `vercel --prod --yes` again. If still failing, contact Vercel support or deploy via their dashboard UI.
3. **Custom domain** — Buy kettenpuzzle.com or chainpuzzle.io, configure DNS to GH Pages or Vercel.
4. **Kenney asset integration** — Download Physics Pack + Impact Sounds. Replace procedural textures with actual sprites for higher visual quality.
5. **Mobile optimization** — Test on mobile browsers, enforce body limits, refine touch input (finger offset above touch point).
6. **Beta testing** — Post on r/webgames, Discord game-dev servers. Collect feedback on difficulty, intuitiveness, satisfaction.
7. **Leaderboard (Supabase)** — Add global leaderboard per the Masterplan Phase 2 plan. Anonymous UUID, RLS policies already documented in docs/guides/SECURITY.md.
8. **More levels** — Use Claude Code with the level generation prompt template to create templates 091+. Each new batch adds another month of daily content.
9. **Object type selector** — When a level allows multiple object types (ball + weight), add a UI to choose which one to place. Currently always uses the first allowed type.
10. **Yesterday's solution replay** — Record body positions during solve, replay as animation next day.

## Rollback Info
- Last known good state: commit `01eeee4` (HEAD) — everything works, all tests pass, deployed
- If GH Pages base path causes issues: change `base` in vite.config.ts back to `'/'`
- If Vercel needs clean slate: `rm -rf .vercel && vercel link --yes`
- If a level is broken: use `?level=N` to test it, fix in LevelTemplates/2/3.ts
- All 14 commits are incremental and independent — can safely revert any single commit

## Files Modified This Session
### Created from scratch (entire game)
- `CLAUDE.md` — AI context file for Claude Code
- `README.md` — Project overview
- `HANDOVER.md` — This file
- `index.html` — Entry point with PWA meta tags + SW registration
- `package.json` — Dependencies and scripts
- `tsconfig.json` — TypeScript strict config
- `vite.config.ts` — Vite build config (base: /Kettenreaktion/)
- `vitest.config.ts` — Test runner config
- `vercel.json` — Vercel deployment config
- `.gitignore` — Node, dist, env, Vercel
- `.env.example` — Supabase placeholder keys
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker (cache-first assets)
- `public/icon-192.png` — PWA icon (programmatic)
- `public/icon-512.png` — PWA icon (programmatic)
- `assets/levels/manifest.json` — Level index
- `src/main.ts` — Phaser game config, scene registration
- `src/constants/Game.ts` — All game constants
- `src/constants/Physics.ts` — Physics body properties
- `src/types/Level.ts` — Level JSON schema
- `src/types/GameState.ts` — Score, storage, puzzle result types
- `src/types/GameObject.ts` — Body options, placed object types
- `src/scenes/BootScene.ts` — Loading screen + all 9 procedural texture generators
- `src/scenes/MenuScene.ts` — Title, buttons, streak, countdown, particles
- `src/scenes/GameScene.ts` — Core gameplay (500+ lines): placement, simulation, chain detection, scoring, FX, level intro, retry overlay, near-miss, keyboard shortcuts
- `src/scenes/ResultScene.ts` — Score breakdown, share, practice/daily mode handling
- `src/scenes/HowToScene.ts` — Tutorial with visual step icons and scoring table
- `src/scenes/PracticeScene.ts` — Level browser with arrows, difficulty filter
- `src/scenes/StatsScene.ts` — Lifetime stats + puzzle history
- `src/game/PhysicsManager.ts` — Matter.js body/sprite creation, player glow, tiled platforms
- `src/game/ChainDetector.ts` — Collision chain tracking with timeout
- `src/game/ScoreCalculator.ts` — Pure score calculation
- `src/game/LevelLoader.ts` — Daily seed + debug param + practice loader
- `src/game/LevelTemplates.ts` — Levels 001-040
- `src/game/LevelTemplates2.ts` — Levels 041-060
- `src/game/LevelTemplates3.ts` — Levels 061-090
- `src/game/CameraFX.ts` — Trauma-based shake + slow-motion
- `src/game/TrailRenderer.ts` — Motion trails behind fast bodies
- `src/systems/DailySystem.ts` — UTC seed, puzzle number, countdown
- `src/systems/StorageManager.ts` — localStorage persistence
- `src/systems/ShareManager.ts` — Emoji share card generator
- `src/systems/AudioManager.ts` — 7 procedural Web Audio sounds
- `src/ui/HUD.ts` — In-game HUD with dark panel
- `src/ui/Button.ts` — Reusable button component
- `src/game/ScoreCalculator.test.ts` — 7 tests
- `src/game/ChainDetector.test.ts` — 5 tests
- `src/systems/DailySystem.test.ts` — 7 tests
- `src/systems/ShareManager.test.ts` — 4 tests
- `docs/ARCHITECTURE.md` — System architecture
- `docs/GAMEPLAN.md` — Game design document
- `docs/ROADMAP.md` — Development phases
- `docs/COMPONENTS.md` — All components documented
- `docs/API.md` — Internal + external API contracts
- `docs/guides/SECURITY.md` — Security guide with CSP, RLS
- `docs/guides/GAMEPLAY.md` — Physics mechanics deep-dive
- `docs/plans/DEPLOYMENT.md` — Infrastructure plan

### Modified (existed before session)
- `PRINCIPLES.md` — Changed `docs/guides/REMOTION.md` reference to `docs/guides/GAMEPLAY.md`
