# Handover

## Summary
Session 10 was a massive game-feel and visual identity session: **7 commits, 4 production deploys**. Deployed the streak backend endpoint to the VM. Built material themes (wood/stone/metal) with 9 procedural textures + themed collision audio. Added HUD attempt pips + live timer, 7/7 daily mutations, daily bet predictions, combo text popups, impact ripples, photon gallery (shareable trail art), near-miss juice, celebration overhaul with confetti rain, and 4 new chain achievements (23 total). Every level now looks, sounds, and feels distinct. Bundle grew from 280KB to 305KB. 1,733 tests pass. Game is deployed and live at kettenreaktion.crelvo.dev.

## Completed This Session
- [x] Deploy streak backend endpoint to VM (scp kettenreaktion.js + docker rebuild)
- [x] Visual polish pass — consistent FONT_UI, title glow halos, intro panels, difficulty borders
- [x] HUD attempt pips — 3 animated gold→grey circles replace "Versuche: 2/3" text
- [x] HUD live timer — elapsed seconds with white→yellow→red color shift at 30s limit
- [x] Material-differentiated collision audio (wood knock, metal ring, rubber thud, stone crunch)
- [x] Menu ambient drone (C2+G2 detuned sines, breathing LFO, 2s fade-in)
- [x] Button hover sound (subtle 40ms tick) + hover glow line
- [x] Button staggered entrance animations (delay config, slide-up + fade-in)
- [x] Enhanced success jingle (reverb tail — sustained chord 800ms decay)
- [x] Enhanced fail sound (lowpass-filtered noise burst underneath tones)
- [x] 7/7 daily mutations — Sonntags-Schwebe (0.3g), Montags-Masse (1.5g), Mittwochs-Mix (1.5bounce+0.3friction), Samstags-Chaos (0.5g+1.8bounce) join existing Tue/Thu/Fri
- [x] 9 themed procedural textures — platform/ramp/floor tiles for wood/stone/metal
- [x] PhysicsManager wired to level.theme for texture selection + border colors
- [x] Stronger theme background tints (warm amber wood, cool grey stone, dark blue metal)
- [x] Collision audio wired to level.theme (playMaterialImpact replaces generic playImpact)
- [x] Mutation forecast on ResultScene ("Morgen: 🌙 Sonntags-Schwebe")
- [x] getTomorrowsMutation() exported from DailyMutation
- [x] Photon Gallery — TrailRenderer.exportArtAsImage() renders to canvas JPEG
- [x] "Kunstwerk teilen" button on ResultScene (Web Share API → fallback download)
- [x] bestChainLength persisted in GameStorage for achievement tracking
- [x] 4 new achievements: Kettenreaktion (chain 5), Kettensaege (chain 10), Kettenmeister (chain 15), Harter Brocken (hard solve) — 23 total
- [x] Daily Bet (Tages-Wette) — predict "Schaffe ich!" and "Kette > 5" before playing
- [x] Prediction results shown on ResultScene with ✅/❌ badges
- [x] Prediction badges in share card emoji output
- [x] Combo text popups at every chain link >= 2 ("3x", "5x", "10x") at collision points
- [x] Near-miss enhancements — pulsing red ring + 8-particle red burst
- [x] Impact ripple rings at significant collisions (speed-scaled, 300ms fade)
- [x] Background brightness pulse on heavy impacts (speed > 5)
- [x] Target hit overhaul — 6-point spark ring + expanding golden ring
- [x] Placement burst particles — 12-particle blue pop on object placement
- [x] All-targets celebration overhaul — 12-point shower, confetti rain (rainbow), chain sub-text
- [x] Enhanced dust emitter — 6 particles, upward arc, longer life
- [x] Result scene win/lose atmosphere (golden glow + rising particles vs cool dust)
- [x] Per-row score count-up animation on result breakdown
- [x] StatsScene: 6 stat cards in 3-column grid (adds best chain + total score)
- [x] SW cache bumped to v9

## Completed in Previous Sessions (Still Working)
- [x] 210 levels (batches 1-8) including 12 mixed-constraint levels
- [x] All 42 enhancement plan sections complete
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox with 50-object cap
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek
- [x] 23-badge achievement system (was 19)
- [x] PWA shortcuts and challenge URLs
- [x] Level editor (EditorScene) with HTML panel + drag-to-move + undo
- [x] Monthly themed events framework
- [x] Wipe scene transitions with edge accent
- [x] Spatial audio panning
- [x] NaN camera guards (multi-layer defense)
- [x] Dramatic near-miss camera (slow-mo + zoom + vignette + ring + particles)
- [x] Weekly physics mutations — now 7/7 days active
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)
- [x] Server-validated streaks with grace period

## In Progress
- [ ] Beta testing — game is feature-complete, deployed, and has backend. Ready to post from BETA-POSTS.md.
- [ ] Not pushed to origin — 18 local commits ahead of remote. Push when ready.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| 9 procedural textures (3 themes × 3 types) | Level theme field exists on all 210 levels (72 wood/60 stone/78 metal), even distribution | Sprite-based textures | Adds asset files, increases bundle, breaks procedural aesthetic |
| Texture fallback to unthemed | Safety against missing texture keys | Hard crash on missing texture | Would break if any theme key has a typo |
| Daily bet as 4-second auto-dismiss overlay | Non-intrusive, doesn't block gameplay | Modal dialog requiring click to dismiss | Would slow down experienced players |
| Predictions stored as scene state, not localStorage | Ephemeral by design — only matters for current session | Persisted prediction history | Over-engineering for a fun optional feature |
| Combo text at every chain >= 2 | Immediate feedback creates game-feel "juice" | Only at milestones (5, 10, 15) | Too sparse — player misses the building momentum |
| bestChainLength in GameStorage | Required for chain achievements, simple addition | Compute from puzzle history | History doesn't store chain length per puzzle |
| 3-column StatsScene layout | Fits 6 stats cleanly, balanced visual weight | Keep 2-column with scroll | 600px viewport doesn't scroll well |
| Menu ambient as static method on AudioManager | Consistent with existing static API pattern | MusicEngine plays on menu | MusicEngine is simulation-specific, would need redesign |
| Prediction badges in share card | Social proof + differentiator for daily bet engagement | Separate share text for bets | Would require two share buttons or complex toggle |
| Material audio wired to level.theme directly | Direct string match between theme ('wood') and ImpactMaterial ('wood') | Mapping table | Unnecessary indirection when types overlap |

## Known Issues
- **Bloom performance** — up to 4 PostFX bloom instances per level (checked: not a real issue)
- **Editor limitations** — no constraint editing, no width/height/angle editing for placed objects
- **Gravity Flip + constraints** — seesaw pivot visual fixed, but full physics untested on Friday
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares on certain OS
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible via Playwright
- **appManager server.js** modified locally — needs to stay in sync with VM copy
- **All 7 days have mutations** — new players never experience baseline physics. Consider making first week mutation-free per player.
- **Daily bet auto-dismisses in 4s** — if player is slow reading, they miss it. May need "skip" button or longer timeout.
- **18 commits not pushed** — local master is ahead of origin/master by 18 commits

## Next Steps (Priority Order)
1. **Push to origin** — `git push origin master` (18 commits ahead)
2. **Beta testing** — Post from BETA-POSTS.md. Game is deployed with full backend.
3. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX, update nginx + SSL
4. **Gravity Flip + constraints full test** — Wait for a Friday
5. **Level theme visualization gap** — Wood/stone/metal textures are in but could be more distinct. Consider adding theme-specific particle tints to EventManager themes.
6. **Replay Director** — Multiple camera angles for replay viewing (follow-ball, overview, artistic)
7. **Butterfly Effect** — Side-by-side replay comparison (your attempt vs best)
8. **Editor constraint editing** — Add UI for ropes, springs, seesaws in editor panel
9. **Bell target type** — Defined in types but never used. Add distinct visual + chime sound.
10. **New player mutation exemption** — First week plays without mutations for baseline experience

## Rollback Info
- Last known good: `1cf33fc` (HEAD) — 1,733 tests pass, 305KB bundle
- Pre-session 10: `157c7f7` — session 9 handover commit
- Pre-material-themes: `0725499` — before themed textures + physics wiring
- Pre-daily-bet: `e1707ca` — before predictions + combo text
- Pre-visual-polish: `ee3c8b1` — first commit this session
- If daily bet breaks: remove `predictions` field from GameScene + ResultScene, revert to no overlay
- If material textures break: PhysicsManager has fallback to unthemed `platform_tile`/`ramp_tile`/`floor_tile`
- If menu ambient annoys: remove `AudioManager.startMenuAmbient()` call from MenuScene.create()

## Files Created This Session
- None (all changes to existing files)

## Files Modified This Session
- `src/ui/HUD.ts` — Attempt pips (gold→grey circles), live timer with color interpolation
- `src/ui/Button.ts` — Entrance animations (delay config), hover sound, hover glow line
- `src/systems/AudioManager.ts` — Material impacts (wood/metal/rubber/stone), hover sound, menu ambient, enhanced success/fail
- `src/systems/DailyMutation.ts` — 4 new mutations (Sun/Mon/Wed/Sat), getTomorrowsMutation()
- `src/systems/ShareManager.ts` — Prediction badges in share card output
- `src/systems/AchievementManager.ts` — 4 new chain/difficulty achievements (23 total)
- `src/systems/StorageManager.ts` — bestChainLength in defaults
- `src/types/GameState.ts` — bestChainLength field in GameStorage
- `src/game/PhysicsManager.ts` — Theme field, themed texture selection with fallback, border/highlight per theme
- `src/game/TrailRenderer.ts` — exportArtAsImage() for Photon Gallery (canvas JPEG export)
- `src/game/SceneTransition.ts` — Leading edge accent line on wipe transitions
- `src/scenes/BootScene.ts` — 9 new themed texture generators + title glow + beta badge
- `src/scenes/GameScene.ts` — Daily bet overlay, combo text, impact ripples, bg pulse, placement particles, target hit overhaul, near-miss particles, celebration overhaul, material audio wiring, timer integration, theme tint strengthening
- `src/scenes/MenuScene.ts` — Menu ambient start, button delays, shutdown() stops ambient
- `src/scenes/ResultScene.ts` — Win/lose atmosphere, score count-up, prediction results, mutation forecast, photon gallery button, bestChainLength tracking
- `src/scenes/StatsScene.ts` — 6 stat cards (3-column), best chain + total score
- `src/scenes/PracticeScene.ts` — Difficulty-colored card border, FONT_UI consistency
- `src/scenes/ReplayScene.ts` — Control panel background, FONT_UI consistency
- `src/scenes/ZenScene.ts` — FONT_UI consistency
- `src/scenes/EditorScene.ts` — FONT_UI consistency
- `public/sw.js` — Cache version bumped to v9
- `C:\Users\kreyh\Projekte\appManager\dashboard\routes\kettenreaktion.js` — Deployed to VM (streak endpoint was already in file from session 9)

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ → http://127.0.0.1:9091/api/kr/ (Dockfolio dashboard container)
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`
- **Backend deploy:** scp route file + server.js to VM, then `cd /home/deploy/appmanager && docker compose build dashboard && docker compose up -d dashboard`
- **SSH works without agent** — Windows OpenSSH handles keys directly

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements (URLs updated)
- `docs/GAMEPLAN.md` — game design source of truth (Phase 3 objects: magnet, bomb, portal)
- `C:\Users\kreyh\Projekte\appManager\CLAUDE.md` — VM deploy guide, nginx config template, SSH rules

---
**Last Updated:** 2026-03-31 (Session 10 — 7 commits, visual identity + game feel + engagement + deployment)
