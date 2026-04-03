# Handover

## Summary
Session 17 was a user-reported bug investigation session. The user tested on mobile and reported: (1) menu text too hard to read, (2) weird moving lines during gameplay, (3) visual chaos when placing objects. Using Playwright MCP microscope analysis, we discovered the root cause of the moving lines: **Flip Friday (today) flips gravity and mirrors Y coordinates, causing the rope constraint in puzzle #9881 "Pendelwippe" to explode on first physics frame — rope segments fly thousands of pixels off-screen at 800+ px/frame, and constraint visuals draw lines from on-screen anchors to these distant bodies.** Fixed all three issues, deployed to production. 1 commit, 1,865 tests pass, build clean. **Most important for next session: the Flip Friday rope explosion is SYMPTOM-FIXED (bodies get caught, visuals clipped) but NOT ROOT-CAUSE-FIXED — the rope still breaks with flipped gravity. Any level with rope constraints will be broken on Fridays. Need to fix `mirrorLevelY()` or rope creation to handle inverted gravity properly.**

## Completed This Session
- [x] Menu text contrast improved — ~15 text elements brightened (subtitle, countdown, stats, footer links, toggle icons, disabled button, hint text, yesterday button)
- [x] Style.ts constants updated: textMuted `#8888aa`→`#aaaacc`, textDim `#555577`→`#7777aa`, textSubtle `#333355`→`#555588`
- [x] Runaway body detection runs every frame including pre-simulation (was only during simulation after 1500ms delay)
- [x] Rope constraint visual clips to game bounds (200px margin) — skips drawing segments that are OOB
- [x] Spring constraint visual clips to game bounds — skips drawing if either body OOB
- [x] Spring line alpha reduced from 0.7 to 0.5 (less visual noise)
- [x] Trail renderer alpha halved on touch devices (0.4→0.2)
- [x] Mobile placement: no camera shake on touch, subtler flash (60ms vs 80ms, dimmer)
- [x] All deployed to production (kettenreaktion.crelvo.dev)

## Completed in Previous Sessions (Still Working)
- [x] 225 levels (batches 1-8) including bomb, portal, magnet levels
- [x] All session 16 fixes (streak timezone, button drag-away, physics explosion, GIF worker, etc.)
- [x] Core loop polish (chain timeout 3s, trajectory visibility, failure feedback, near-miss, result skip)
- [x] Backend API, GIF replay, PWA, achievements, monthly events

## In Progress
- [ ] **Flip Friday rope fix (ROOT CAUSE)** — `mirrorLevelY()` flips constraint anchors but rope creation doesn't handle the inverted positions. Rope segments start with extreme tension and explode. Current fix catches runaway bodies and clips visuals, but the rope/pendulum mechanic is non-functional on Fridays. Need to either: fix rope segment initial positioning in `createRope()`, or add damping on first few frames, or skip rope constraints on flip days.
- [ ] **Launch blockers** — custom domain not purchased, leaderboard untested with real data, beta posts not published
- [ ] **Real device mobile testing** — user tested briefly, found the three issues we fixed. Still needs thorough testing of touch drag-to-aim feel, placement accuracy, performance on low-end devices.

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Catch OOB bodies every frame pre-simulation | Rope explosion happens on level load before `isSimulating=true`; old check only ran during simulation | Only check during simulation | Doesn't catch pre-simulation explosions like the rope blowup |
| Remove 1500ms delay for OOB check | Rope bodies reach 5000+ px distance within 500ms; 1500ms far too late | Reduce to 500ms | Still too late; bodies move at 800px/frame, reach OOB threshold in ~1 frame |
| Clip constraint visuals to bounds | Even with OOB catch, there's a 1-2 frame window where bodies are OOB before being caught | Hide constraint visuals entirely during first 500ms | Would hide legitimate constraint animations |
| Symptom-fix (catch+clip) not root-cause-fix | Root cause is complex (rope creation + gravity flip interaction). Symptom fix prevents visual chaos immediately | Fix `mirrorLevelY()` to handle ropes properly | Needs careful analysis of Matter.js worldConstraint behavior with inverted gravity; risky to change during the session |
| Boost global Style.ts constants | textMuted/textDim/textSubtle used across many scenes | Only fix MenuScene colors | Would leave dim text in other scenes using the same constants |
| No camera shake on mobile | Users finger covers placement point; shake feels disorienting on touch | Reduce shake amount | Even small shake on mobile feels bad because the finger provides a reference point |
| Trail alpha 0.2 on touch (vs 0.4 desktop) | Mobile screens are smaller, trails create more visual noise | Disable trails entirely on mobile | Trails add satisfying visual feedback; just need to be subtler |

## Known Issues
- **Flip Friday breaks rope constraints** — Any level with rope constraints will have non-functional ropes on Fridays. The rope/weight flies off-screen and gets frozen as static. Level is still playable (other objects work) but the rope mechanic is missing. Affects puzzle #9881 "Pendelwippe" today.
- **Seesaw also gets caught by OOB check** — The seesaw in Pendelwippe is connected to the rope via constraints; when the rope explodes, it pulls the seesaw out too. This makes the seesaw disappear from the level on Flip Friday.
- **Emoji rendering in buttons** — platform-dependent, some emojis render as squares
- **Playwright can't interact with Phaser input** — must use scene.input.emit() or scene manager directly
- **Phaser bundle size** — 340KB gzipped, Lighthouse perf capped at ~70-80
- **Energy graph + camera follow disabled on touch devices** — isTouchDevice() returns true on laptops with touchscreens too
- **Yesterday level dedup has wrong pool** — uses full pool instead of yesterday's difficulty-filtered pool

## Next Steps (Priority Order)

**FOCUS: Fix Flip Friday rope root cause, then launch blockers.**

### Must fix
1. **Fix rope creation for flipped gravity** — The `createRope()` in PhysicsManager.ts positions segments between `bodyA.position` and `anchorB`. When gravity is flipped, the weight body is mirrored but the rope segments start with positions that create extreme constraint tension. Options:
   - Add a settling phase: create rope segments with zero stiffness, then ramp up stiffness over 500ms
   - Position rope segments at the anchor point and let them drape naturally
   - Use Matter.js composite chains instead of manual segment creation
   - Skip rope constraints on Flip Friday (easiest but loses gameplay)

### Launch blockers (from previous handover)
2. **Custom domain** — Buy kettenreaktion.de, configure DNS (manual task)
3. **Real device mobile testing** — Continue testing touch experience with today's fixes
4. **Leaderboard with real data** — Play multiple games to populate and verify
5. **Soft launch posts** — BETA-POSTS.md ready, just needs publishing
6. **Lighthouse audit** — Run on production, address quick wins

### DO NOT
- Add new features, game modes, or UI screens
- Refactor or clean up working code
- Optimize things that aren't measurably slow

## Rollback Info
- Last known good (pre-session 17): `9d3f073` — Session 16 final
- Current HEAD: `88f3d6c` — Session 17, 1 commit, all deployed
- Pre-session 16: `08d9413`

## Files Modified This Session
- `src/constants/Style.ts` — Brightened textMuted (#8888aa→#aaaacc), textDim (#555577→#7777aa), textSubtle (#333355→#555588)
- `src/scenes/MenuScene.ts` — Brightened ~15 hardcoded colors: sound/colorblind icons (#666688→#8888aa), stats (#6666aa→#8888bb), countdown (#6666aa→#8888bb), footer links (#333355→#555588, hover #5555aa→#7777bb), separator (#222244→#444466), disabled button (#555577→#7777aa), yesterday button (#777799→#9999bb), hint (#88aacc→#aaccee)
- `src/scenes/GameScene.ts` — Added `catchRunawayBodies()` method called every frame (pre-simulation too); moved OOB check out of 1500ms-delayed block; mobile placement: no camera shake on touch, subtler flash
- `src/game/PhysicsManager.ts` — Rope visual bounds-clipping (skip OOB segments), spring visual bounds-clipping (skip if body OOB), spring alpha 0.7→0.5
- `src/game/TrailRenderer.ts` — Added `alphaMultiplier` (0.2 on touch, 0.4 on desktop) for subtler mobile trails

## Infrastructure
- **Production URL:** https://kettenreaktion.crelvo.dev
- **VM:** deploy@91.99.104.132
- **Webroot:** /home/deploy/kettenreaktion.crelvo.dev/
- **Deploy:** `VITE_BASE_PATH=root npm run build && scp -r ./dist/* deploy@91.99.104.132:/home/deploy/kettenreaktion.crelvo.dev/`

## Key Reference Docs
- `CLAUDE.md` — Project rules, conventions, AND priority rules
- `PRINCIPLES.md` — Engineering principles
- `docs/GAMEPLAN.md` — Game design source of truth

---
**Last Updated:** 2026-04-03 (Session 17 — 1 commit: Flip Friday rope fix, menu contrast, mobile polish)
