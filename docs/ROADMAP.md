# Roadmap

> Aligned with YAGNI: each phase builds only what's needed. No speculative features.

## Phase 1 — MVP (Month 1-2)

**Goal:** Playable daily physics puzzle with scoring and sharing.

### Week 1-2: Project Setup + Physics Prototype
- [ ] `git init`, Vite + TypeScript + Phaser 3 scaffold
- [ ] `CLAUDE.md` in root (from template)
- [ ] Download Kenney Physics Pack, set up `assets/` structure
- [ ] `PhysicsManager.ts`: Create/destroy Matter.js bodies
- [ ] `BootScene.ts`: Preload 10 base assets
- [ ] **Deliverable:** Ball rolls down ramp, hits domino, 60 FPS, no console errors

### Week 3-4: Core Gameplay
- [ ] `GameScene.ts`: Placement input (mouse/touch), preview ghost, zone validation
- [ ] `ChainDetector.ts`: Track collisions, count chain length
- [ ] `ScoreCalculator.ts`: Implement scoring formula
- [ ] `constants/Physics.ts` + `constants/Game.ts`: All magic numbers extracted
- [ ] **Deliverable:** Full game loop — place, simulate, score, reset

### Week 5-6: Level System + First 10 Levels
- [ ] `src/types/Level.ts`: Level JSON schema
- [ ] `LevelLoader.ts`: JSON to Phaser/Matter.js objects
- [ ] `DailySystem.ts`: Date seed, puzzle number, UTC reset
- [ ] 10 hand-crafted level templates (difficulty 1-3)
- [ ] `assets/levels/manifest.json`
- [ ] **Deliverable:** Daily-changing level, deterministic for all players

### Week 7-8: Daily System + Sharing
- [ ] `StorageManager.ts`: localStorage schema, streak logic, puzzle history
- [ ] `ShareManager.ts`: Emoji text generator, clipboard + Web Share API
- [ ] `ResultScene.ts`: Score, streak, share button, countdown to next puzzle
- [ ] `MenuScene.ts`: Start screen, streak display, how-to button
- [ ] `HowToScene.ts`: Simple tutorial
- [ ] **Deliverable:** Complete daily game loop with sharing

### MVP Exit Criteria
- [ ] Core loop feels satisfying (the chain reaction moment)
- [ ] 10 levels, all validated as solvable
- [ ] Works on Chrome, Firefox, Safari (desktop + mobile)
- [ ] Lighthouse performance > 80
- [ ] Zero `any` types, zero linting errors

---

## Phase 2 — Polish (Month 3-4)

**Goal:** Production quality. Mobile-optimized. 90+ levels. Beta test.

### Week 9-10: UI/UX + Audio + Animations
- [ ] Particle effects on target hits (Kenney Particle Pack)
- [ ] Sound design: collisions, target hits, chain escalation
- [ ] Animated menu, smooth transitions between scenes
- [ ] Responsive layout: 800x600 desktop, 375x667 mobile
- [ ] "Press Start 2P" font, locally hosted

### Week 11-12: Mobile Optimization
- [ ] Touch input refinement: tap-to-place, gesture handling
- [ ] Performance: `enableSleeping`, max 30 bodies on mobile
- [ ] PWA: `manifest.json`, service worker, add-to-homescreen
- [ ] iOS Safari: AudioContext on first user gesture
- [ ] Lighthouse > 90, load time < 3s on 4G

### Week 13-14: Level Content + GIF Replay
- [ ] 90+ level templates (AI-assisted generation + validation)
- [ ] Difficulty distribution: 40% easy, 40% medium, 20% hard
- [ ] Weekday-based difficulty curve
- [ ] `ReplayRecorder.ts` + gif.js (Web Worker for performance)
- [ ] `LevelValidator.ts`: Automated solvability check

### Week 15-16: Beta Test
- [ ] 10 beta testers (r/webgames, Discord game-dev)
- [ ] Collect feedback: Is one-placement intuitive? Are levels fair?
- [ ] A/B test: 3 vs 5 attempts
- [ ] Bug tracking via GitHub Issues
- [ ] Fix critical issues, iterate on feedback

### Phase 2 Exit Criteria
- [ ] 90+ validated levels
- [ ] Stable 60 FPS on low-end Android
- [ ] PWA installable
- [ ] Beta tester daily return rate > 30%

---

## Phase 3 — Launch (Month 5-6)

**Goal:** Public launch. SEO. Leaderboard. Marketing.

### Week 17-18: Performance + SEO
- [ ] Vite bundle analysis, Phaser as separate chunk
- [ ] Meta tags: og:title, og:description, og:image
- [ ] `robots.txt`, `sitemap.xml`
- [ ] Lighthouse > 90 all categories

### Week 19-20: Supabase Leaderboard
- [ ] Supabase table: `daily_scores` (puzzle_number, score, attempts, country)
- [ ] Anonymous UUID (localStorage), no login required
- [ ] Leaderboard on ResultScene: Top 10 + own rank
- [ ] Rate limiting, input validation on all DB writes

### Week 21-22: Soft Launch
- [ ] Reddit: r/webgames, r/indiegaming, r/gamedev
- [ ] TikTok: 3 videos (best chain reaction, impossible level, BTS)
- [ ] Discord: game-dev servers, daily-game communities
- [ ] Gather metrics: DAU, retention, bounce rate

### Week 23-24: Full Launch
- [ ] Product Hunt (Tuesday launch)
- [ ] Contact Poki (developers.poki.com) + CrazyGames
- [ ] Press kit: screenshots, GIF demo, description
- [ ] Enable AdSense only if DAU > 1,000

### Phase 3 Exit Criteria
- [ ] Live on custom domain with SSL
- [ ] Leaderboard functional
- [ ] DAU tracking in place
- [ ] First marketing posts published

---

## Future (Post-Launch, only if warranted)

These are ideas, NOT commitments. Build only when data supports it.

- Special objects (seesaw, spring, magnet, bomb, portal)
- Level editor for user-generated content
- Endless/practice mode
- Freemium tier ($2.99/mo: unlimited attempts, dark mode)
- Poki/CrazyGames licensing deal

---

## Monetization Phases (reference only)

| DAU | Model | Expected |
|-----|-------|----------|
| 0-1k | Free | Focus on growth |
| 1k-10k | AdSense banner on result screen | $30-300/mo |
| 10k-100k | Poki/CrazyGames licensing | $2k-10k + rev share |
| 100k+ | Freemium | $2.99/mo premium tier |

---
**Last Updated:** 2026-03-26
