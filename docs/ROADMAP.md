# Roadmap

> Aligned with YAGNI: each phase builds only what's needed. No speculative features.

## Phase 1 — MVP (COMPLETE)

**Goal:** Playable daily physics puzzle with scoring and sharing.

- [x] Project scaffold (Vite + TypeScript + Phaser 3 + Matter.js)
- [x] PhysicsManager: Create/destroy Matter.js bodies
- [x] GameScene: Placement input, preview ghost, zone validation
- [x] ChainDetector: Track collisions, count chain length
- [x] ScoreCalculator: Scoring formula
- [x] Level system: 222 levels across 8 batch files
- [x] DailySystem: Date seed, puzzle number, UTC reset
- [x] StorageManager: localStorage, streak logic, puzzle history
- [x] ShareManager: Emoji text, clipboard + Web Share API
- [x] ResultScene: Score, streak, share, countdown
- [x] MenuScene, HowToScene, PracticeScene

---

## Phase 2 — Polish (COMPLETE)

**Goal:** Production quality. Mobile-optimized. 90+ levels. Beta test.

- [x] Particle effects on target/collision hits
- [x] Procedural audio: collisions, target hits, chain escalation
- [x] Material themes (wood/stone/metal) with themed textures + audio
- [x] Material-specific particle tints (hit/spark/dust/ripple)
- [x] Animated menu, smooth wipe scene transitions
- [x] Touch input refinement, responsive layout
- [x] PWA: manifest.json, service worker, add-to-homescreen
- [x] iOS Safari AudioContext handling
- [x] GIF replay export (Web Worker + OffscreenCanvas)
- [x] Replay scrubber with play/pause/speed/seek
- [x] Replay Director (3 camera modes: overview/follow/cinematic)
- [x] 218 validated level templates (difficulty 1-5)
- [x] Weekly physics mutations (7/7 days)
- [x] New player mutation exemption (first 7 games)
- [x] Interactive tutorial (HowToScene)
- [x] 23-badge achievement system
- [x] PostFX bloom/glow/vignette/bokeh pipeline
- [x] MusicEngine with layered drone/arpeggio/pad/percussion
- [x] ZenScene sandbox mode
- [x] Monthly themed events framework
- [x] Daily bet predictions with result badges
- [x] Ghost placement sharing via URL (?p=type,x,y)
- [x] Beta testing posts drafted (BETA-POSTS.md)

---

## Phase 3 — Launch (IN PROGRESS)

**Goal:** Public launch. SEO. Leaderboard. Marketing.

### Completed
- [x] Backend API (POST result, GET stats, GET heatmap, GET streak)
- [x] Server-validated streaks with grace period
- [x] Production deployment at kettenreaktion.crelvo.dev
- [x] Meta tags: og:title, og:description, og:image, Twitter cards
- [x] PWA shortcuts and challenge URLs
- [x] Level editor (EditorScene) with constraint + portal + bomb editing
- [x] Butterfly Effect (side-by-side replay comparison)
- [x] Photon Gallery (shareable trail art)

### Special Objects (Phase 3)
- [x] Seesaw (constraint pivot on platforms)
- [x] Spring (elastic connector between bodies)
- [x] Rope (segmented connector)
- [x] Bell target (copper bell with distinct chime)
- [x] Bomb (explosion applies blast force to nearby bodies)
- [x] Portal (linked pairs — bodies teleport between portals)
- [x] Magnet (static attractor, inverse-distance force on nearby bodies)

### Remaining
- [ ] Custom domain (kettenreaktion.de)
- [ ] Supabase leaderboard (Top 10 + own rank)
- [ ] Soft launch: Reddit, Discord, Twitter/X, Hacker News
- [ ] Product Hunt launch
- [ ] Contact Poki + CrazyGames
- [ ] Lighthouse > 90 all categories
- [ ] Enable AdSense if DAU > 1,000

---

## Future (Post-Launch, only if warranted)

These are ideas, NOT commitments. Build only when data supports it.

- Additional special object variants (repulsor, conveyor belt)
- User-generated content sharing (level editor export/import)
- Endless/challenge mode variants
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
**Last Updated:** 2026-04-01
