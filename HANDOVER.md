# Handover

## Summary
Session 12 was a massive feature session. Implemented 17 features spanning new object types (bell, bomb, portal, magnet), replay enhancements (Director camera modes, Butterfly Effect comparison), editor improvements (constraints, portals, magnets, property editing), and gameplay polish (material particles, mutation exemption, daily bet timing, gravity flip fixes). Added 12 new levels (4 bomb, 4 portal, 4 magnet). Spread bell targets across all level batches. Updated CLAUDE.md, ROADMAP.md. Deleted stale manifest.json. 222 levels total, 1,829 tests pass. Git is dirty — needs commit.

## Completed This Session
- [x] Material-specific particle themes (wood/stone/metal tinted hit/spark/dust/ripple)
- [x] Replay Director (3 camera modes: overview/follow/cinematic + keyboard 1/2/3)
- [x] Bell target type (copper texture, sway animation, 3-harmonic chime)
- [x] 17 bell targets spread across batches 2-8
- [x] New player mutation exemption (gamesPlayed < 7 = baseline physics)
- [x] Butterfly Effect scene (side-by-side replay overlay comparison)
- [x] Editor constraint editing (seesaw/spring/rope tools with visual indicators)
- [x] Editor property editing (width/height/angle/type/points for selected objects)
- [x] Daily bet timing fix (4s to 6s + tap-to-dismiss)
- [x] Gravity flip constraint anchor fix (mirrorLevelY now flips anchorA/B and portals)
- [x] Bomb object type (explosion physics, blast force, texture, audio, 4 levels)
- [x] Portal object type (linked pairs, teleportation with cooldown, texture, whoosh audio, 4 levels)
- [x] Magnet object type (static attractor, inverse-distance force, texture, 4 levels)
- [x] Editor bomb/portal/magnet tools
- [x] Portal rendering in ReplayScene and ButterflyScene
- [x] Stale manifest.json + assets/levels/ directory deleted
- [x] CLAUDE.md updated (removed stale manifest refs, updated level info, current focus)
- [x] ROADMAP.md rewritten (all phases updated with completion status)

## Completed in Previous Sessions (Still Working)
- [x] 222 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All 42 enhancement plan sections complete
- [x] Material themes (wood/stone/metal) with 9 procedural textures + themed collision audio
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with drone + arpeggio + pad + percussion layers
- [x] ZenScene sandbox with 50-object cap
- [x] Interactive tutorial (HowToScene)
- [x] Replay scrubber with play/pause/speed/seek + Director camera modes
- [x] 23-badge achievement system
- [x] PWA shortcuts and challenge URLs
- [x] Level editor with constraints + portals + magnets + bombs
- [x] Monthly themed events framework
- [x] Wipe scene transitions with edge accent
- [x] Spatial audio panning + material-differentiated collision audio
- [x] NaN camera guards (multi-layer defense)
- [x] Dramatic near-miss camera (slow-mo + zoom + vignette + ring + particles)
- [x] 7/7 daily physics mutations (new player exemption for first 7 games)
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] GIF replay export (Web Worker + OffscreenCanvas, sync fallback)
- [x] Server-validated streaks with grace period
- [x] Daily bet predictions with result badges
- [x] Combo text popups, impact ripples, celebration overhaul
- [x] Photon Gallery (shareable trail art)
- [x] HUD attempt pips + live timer
- [x] Butterfly Effect (side-by-side replay comparison)

## In Progress
- [ ] Beta testing — game is feature-complete and deployed. BETA-POSTS.md has ready-to-post drafts.
- [ ] **Needs commit** — all session 12 changes are uncommitted.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Magnet as StaticObject (not dynamic) | Magnets are fixed attractors — no physics body, just force application | Dynamic magnet body | Would bounce around and be unpredictable |
| Portal cooldown 500ms | Prevents infinite teleport loops | No cooldown | Body would teleport back and forth every frame |
| Bomb detonates on any collision | Simpler, more predictable gameplay | Speed threshold | Confusing when bomb doesn't explode |
| Bell sways instead of pulses | Visual differentiation from star targets | Same pulse as star | Would look identical |
| 6s daily bet (was 4s) | Slow readers complained | Longer timer | Takes too long for experienced players |

## Known Issues
- **Editor magnet redraw** — magnet radius indicator circle not redrawn on undo (cosmetic only)
- **Editor limitations** — no magnet strength/radius editing in properties panel (uses defaults)
- **Gravity Flip + magnets** — magnet positions flip with other statics, but force direction stays "toward magnet" which should work correctly
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — automated gameplay testing not possible
- **Daily bet auto-dismisses in 6s** — still may be fast for some users

## Next Steps (Priority Order)
1. **Commit session 12 changes** — `git add` + commit + push
2. **Post beta announcements** — Copy from BETA-POSTS.md to Reddit/Discord/Twitter/HN (manual task)
3. **Custom domain** — Buy kettenreaktion.de, configure DNS at INWX
4. **Editor magnet properties** — Add strength/radius sliders to properties panel
5. **Gravity Flip + constraints full test** — Wait for a Friday
6. **Level validation** — Automated solvability check for all 222 levels
7. **Lighthouse audit** — Target > 90 all categories
8. **Supabase leaderboard** — Top 10 + own rank on ResultScene

## Rollback Info
- Last known good: `65c44bb` (HEAD before session 12) — 1,733 tests pass
- All session 12 changes are uncommitted — `git checkout .` would revert everything

## Files Modified This Session
- `CLAUDE.md` — Updated status, removed stale manifest refs, updated level info
- `HANDOVER.md` — This file
- `docs/ROADMAP.md` — Complete rewrite reflecting current state
- `src/types/Level.ts` — Added bomb to ObjectType, PortalPair interface, magnet to StaticObject
- `src/constants/Physics.ts` — Added bomb body properties
- `src/scenes/BootScene.ts` — Added genBell, genBomb, genPortal, genMagnet textures
- `src/scenes/GameScene.ts` — Material particles, bell/bomb/portal/magnet logic, mutation exemption, bet timing
- `src/scenes/ReplayScene.ts` — Replay Director camera modes, portal rendering
- `src/scenes/ResultScene.ts` — Butterfly Effect button
- `src/scenes/ButterflyScene.ts` — **NEW** side-by-side comparison scene
- `src/scenes/EditorScene.ts` — Constraint/portal/magnet/bomb tools, property editing
- `src/systems/AudioManager.ts` — Bell chime, bomb explosion, portal whoosh
- `src/game/PhysicsManager.ts` — Bomb circle shape, magnet static body creation
- `src/game/LevelTemplates2.ts` — 3 bell targets added
- `src/game/LevelTemplates3.ts` — 3 bell targets added
- `src/game/LevelTemplates4.ts` — 3 bell targets added
- `src/game/LevelTemplates5.ts` — 2 bell targets added (previous session)
- `src/game/LevelTemplates6.ts` — 3 bell targets added
- `src/game/LevelTemplates8.ts` — 2 bell + 4 bomb + 4 portal + 4 magnet levels
- `src/game/LevelLoader.test.ts` — Updated level count to 222
- `src/ui/Button.ts` — Added setStyle() method
- `src/main.ts` — Registered ButterflyScene

## Files Created This Session
- `src/scenes/ButterflyScene.ts` — Side-by-side replay comparison

## Files Deleted This Session
- `assets/levels/manifest.json` — Stale, no code referenced it
- `assets/levels/templates/` — Empty directory

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **API proxy:** /api/kr/ -> http://127.0.0.1:9091/api/kr/
- **Deploy process:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — project rules and conventions
- `PRINCIPLES.md` — engineering principles
- `BETA-POSTS.md` — ready-to-post community announcements
- `docs/GAMEPLAN.md` — game design source of truth
- `docs/ROADMAP.md` — development phases and milestones (updated this session)

---
**Last Updated:** 2026-04-01 (Session 12 — 17 features, 12 new levels, 3 new object types)
