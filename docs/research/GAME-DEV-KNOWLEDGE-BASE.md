# Game Development Knowledge Base

**Purpose:** Game-agnostic research distilled from 6 deep research threads. Use this to brainstorm, evaluate, and plan any new browser/web game project.

**Source:** Kettenreaktion research (March 2026) — competitor analysis, virality, game feel, monetization, tech, creative features.

---

## Table of Contents

1. [What Makes Daily Games Go Viral](#1-what-makes-daily-games-go-viral)
2. [Daily Game Landscape & Competitor Patterns](#2-daily-game-landscape--competitor-patterns)
3. [Game Feel / Juice — Universal Principles](#3-game-feel--juice--universal-principles)
4. [Sharing & Virality Mechanics](#4-sharing--virality-mechanics)
5. [Retention & Engagement Mechanics](#5-retention--engagement-mechanics)
6. [Monetization Models for Solo Devs](#6-monetization-models-for-solo-devs)
7. [Free-Tier Hosting Architecture](#7-free-tier-hosting-architecture)
8. [Legal Requirements (Germany)](#8-legal-requirements-germany)
9. [Tech Stack Recommendations](#9-tech-stack-recommendations)
10. [Launch Strategy Playbook](#10-launch-strategy-playbook)
11. [Feature Ideas That Work Across Games](#11-feature-ideas-that-work-across-games)
12. [AI-Friendly Development Approach](#12-ai-friendly-development-approach)
13. [Key Statistics & Numbers](#13-key-statistics--numbers)

---

## 1. What Makes Daily Games Go Viral

### The Five Pillars (Proven by Wordle)

Wordle went from 90 players to 3 million in 8 weeks — entirely without paid advertising.

| Pillar | How It Works | Universal Lesson |
|--------|-------------|------------------|
| **Simplicity** | Rules understood in 30 seconds. Zero learning curve. | Your core mechanic must be explainable in one sentence. |
| **Strategic Scarcity** | One puzzle per day. Prevents burnout, builds anticipation. | Do NOT offer unlimited play at launch. Scarcity drives desire. |
| **Frictionless Access** | No signup, no app download, works in browser immediately. | Must be instant-play. No login wall. No app store. |
| **Social Sharing** | Spoiler-free result format (emoji grid). 500K daily tweets at peak. | Your share format IS your marketing. Design it before building the game. |
| **Shared Experience** | Everyone worldwide solves the same puzzle on the same day. | Universal puzzle = universal conversation. |

### The Viral Flywheel

```
Player completes puzzle
        |
        v
Share prompt appears (one tap, low friction)
        |
        +---> Text result (Twitter, WhatsApp, SMS)
        +---> Visual replay/image (Twitter, Discord, Reddit, TikTok)
        +---> Challenge link ("Beat my score!")
        |
        v
Friend sees share on social feed
        |
        v
Clicks link -> lands on game -> plays puzzle
        |
        v
Completes puzzle -> sees share prompt -> LOOP REPEATS
```

**K-factor goal:** Each player should bring in >1 new player over their lifetime. If K > 1, growth is exponential.

### Why Wordle Declined (Cautionary Lessons)

- Interest dropped 91% between Feb-Sep 2022
- Proliferation of copycat games diluted attention
- Perceived difficulty changes after acquisition eroded trust
- Cheating tools undermined the social contract
- **Lesson:** A daily game needs ongoing novelty. Single-mechanic games have a ceiling.

---

## 2. Daily Game Landscape & Competitor Patterns

### Existing Daily Games — What Works

| Game | Input | Feedback | Attempts | Share Format | Key Hook |
|------|-------|----------|----------|-------------|----------|
| Wordle | Type word | Color tiles | 6 | Emoji grid | Simplicity |
| Connections | Tap groups | Color reveal | 4 mistakes | Color grid | Pattern recognition |
| Strands | Find words | Highlight | Unlimited + hints | Emoji grid | Discovery |
| Spelling Bee | Type words | Points + rank | Unlimited | Rank title | Progression |
| Contexto | Type word | Proximity rank | Unlimited | Guess count | Semantic AI |
| Globle | Type country | Globe colors | Unlimited | Emoji map | Geography |
| Immaculate Grid | Type player | Rarity % | 9 | Rarity grid | Uniqueness |
| Bandle | Type song | Audio reveal | 6 | Score | Progressive reveal |
| Nodes | Connect dots | Low-poly art | Unlimited | Completed art | Aesthetic calm |

### Proven Mechanics Worth Stealing

1. **Rarity scoring** (Immaculate Grid): "Only 3% of players did what you did" — adds uniqueness dimension
2. **Progressive ranks within a session** (Spelling Bee): Multiple "win" moments per puzzle
3. **Hint system earned through gameplay** (Strands): Find non-theme words to earn hints — no purchase needed
4. **Color-coded difficulty within a puzzle** (Connections): Yellow/Green/Blue/Purple creates drama
5. **Progressive reveal** (Bandle): Each step reveals more — builds suspense

### What Goes Viral: Common Patterns

1. **Constraint creates conversation** — limited attempts give everyone the same stakes
2. **Universal accessibility** — no expertise required, no app download
3. **Social proof loop** — see results -> try game -> share results -> others see
4. **Daily cadence** — creates ritual behavior; weekly or unlimited doesn't create the same habit
5. **Spoiler-free sharing** — results can be discussed without ruining others' experience

### Anti-Patterns (What NOT to Do)

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Paywall the daily puzzle | Kills viral sharing loop |
| Unlimited retries | Removes scarcity, kills sharing |
| Mandatory signup | Friction kills conversion |
| Intrusive ads | 46.8% cite ads as biggest frustration |
| Difficulty spikes | Alienates casual players |
| Answer leaks | Undermines the social contract |
| Pay-to-win hints | Undermines skill-based satisfaction |

---

## 3. Game Feel / Juice -- Universal Principles

### What Is Juice?

Small effects that make player actions feel satisfying without changing gameplay. Every action should produce visual + audio + camera feedback.

### The Juice Checklist (Adapt to Any Game)

| Moment | Visual | Audio | Camera |
|--------|--------|-------|--------|
| Player acts | Scale pop (0->1 with Bounce ease) | Soft thud | Subtle zoom-in |
| Action starts | Fades, objects wake | Tension sound | Slight pull-back |
| Success moment | Star burst particles, flash | Chime (rising pitch) | Flash white |
| Failure moment | Fade effect | Silence beat | -- |
| Big success | Screen-wide particle celebration | Victory fanfare | Zoom + shake |
| Score reveal | Number counter tween | Tick-tick-tick | -- |

### Escalation Pattern

Effects should intensify as the player progresses through a sequence:

```
Step 1:   Small spark, soft thud, no shake
Step 3:   Medium sparks, louder impact, micro-shake
Step 5:   Large sparks + glow, heavy thud, noticeable shake
Step 8:   Particle trails, rising pitch, camera follow
Step 10+: Screen bloom, full celebration audio, everything maxed
```

### Key Juice Techniques

- **Squash & Stretch**: Objects deform on impact, then spring back
- **Screen shake**: Intensity proportional to event significance (0.002-0.015 range)
- **Particle bursts**: Sparks on collision, confetti on victory, dust puffs on landing
- **Trailing particles**: Behind moving objects for visual paths
- **Camera follow**: Pan to follow the action
- **Sound pitch escalation**: Each successive hit plays a slightly higher pitch
- **Hit stop / Freeze frames**: Brief pause (50-100ms) on significant impacts
- **Vignette tightening**: Edges darken during intense moments for focus

### Performance Budget for Juice

- Max 200 active particles at any time
- Max 3 simultaneous tweens per object
- Disable Post-FX on low-end devices (check `renderer.type === Phaser.CANVAS`)
- Always provide "Reduced Motion" mode (respect `prefers-reduced-motion`)

---

## 4. Sharing & Virality Mechanics

### Share Format Priority

1. **Emoji text** — always available, zero friction, universal (fits in any chat)
2. **Visual replay (GIF/MP4)** — the differentiator for visual games
3. **Score card image** — generated as OG image for link previews (1200x630px)
4. **Direct challenge link** — "Can you beat my score?" with link to same puzzle

### Emoji Share Design Rules

- Keep to 3-4 lines maximum — compact = shareable
- Must be spoiler-free — show pattern, not solution
- Must be visually readable by non-players
- Must create curiosity — people who don't play should wonder "what is this?"
- Include game name, puzzle number, and URL

### GIF/MP4 Replay (for Visual Games)

**Why this matters:** Video-first social media. GIFs auto-play in feeds. "Oddly satisfying" content gets massive organic reach.

**Technical approach:**
- Record at 30fps (not 60) — halves work with minimal visual difference for sharing
- Target: 3-8 seconds (short = shareable)
- MP4 primary (~200-500KB), GIF fallback (~2-5MB)
- Downscale to 720p max for recording
- Encode AFTER gameplay, not during
- Add branding overlay (logo, puzzle number, URL)
- Use `canvas-record` (npm) with WebCodecs for hardware-accelerated encoding

### Web Share API

- 92%+ global browser support (including mobile)
- Gap: Firefox desktop
- Must be triggered by user gesture (click/tap)
- Must be served over HTTPS
- Always implement clipboard copy as fallback

### Social Media Optimization

All platforms use **1200x630px** (1.91:1 ratio) for link preview images. Keep under 1MB. Set OG tags and Twitter Cards. Posts with optimized OG images see 40-60% higher click-through rates.

### Structured Data (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Your Game Name",
  "genre": ["Puzzle", "Casual"],
  "gamePlatform": "Web Browser",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
}
```

Pages with structured data get ~30% more clicks in search results. AI search (Google SGE, Bing Chat, Perplexity) increasingly relies on structured data.

---

## 5. Retention & Engagement Mechanics

### Streaks

Table stakes for daily games. But alone they create anxiety more than joy. Pair with forgiving mechanics.

- Display current streak prominently
- Show max streak in stats
- Milestones at 7, 30, 100, 365 days with badges
- **Streak freeze**: Allow 1 missed day per week without breaking streak (Duolingo model — proven to increase long-term retention)
- **Comeback mechanic**: If streak breaks, offer a "Second Chance" bonus puzzle within 24 hours to restore it

### Achievement System

Proven retention mechanic — 22% improvement per gamification research. Examples:
- First completion, first perfect score, streak milestones
- Game-specific achievements (creative/unusual plays)
- Display on dedicated page and optionally in share text

### Weekly Challenges

Creates medium-term engagement loop beyond daily. Special bonus objective each week with a badge reward. Reuses existing infrastructure.

### Score Tiers

Multiple "win" levels within each puzzle:
- Bronze: Minimum success
- Silver: Good performance
- Gold: Excellent
- Perfect/Diamond: Top percentile

### Personal Best Tracking

"New Personal Best!" celebrations. Show improvement over time: "You've improved 23% since last week."

### Rarity Score

After solving, show: "Only X% of players did what you did." Adds creativity/uniqueness dimension.

### Statistics Dashboard

Proven retention driver across all daily games:
- Games played, win rate, streaks, average score
- Score distribution histogram
- Calendar/history view color-coded by performance

### Seasonal Events

Limited-time puzzles with unique mechanics/themes. Drive social sharing and press mentions. Holiday specials, anniversary celebrations.

### End-of-Year Wrapped

Annual summary inspired by Spotify Wrapped. Shareable as generated image. High viral potential.

---

## 6. Monetization Models for Solo Devs

### The Golden Rule

> The daily puzzle is always free, always the same for everyone, always shareable. Monetization happens AROUND the core experience, never INSIDE it.

### What Players Accept vs Reject

**Accept:**
- Cosmetic purchases (themes, skins, effects)
- Ad-free subscriptions
- Rewarded ads (opt-in)
- One-time tip/donation
- Archive access (past puzzles)
- Detailed stats/analytics

**Reject:**
- Pay-to-win (hints that trivialize the puzzle)
- Aggressive interstitial ads
- Loot boxes / gacha
- Paywalling core gameplay
- Manipulative FOMO tactics

### Revenue Models by Growth Stage

| DAU | Strategy | Monthly Revenue (est.) | Monthly Cost |
|-----|----------|----------------------|--------------|
| 0-100 | Free, Ko-fi donations only | $0-10 | $0 |
| 100-1K | Ko-fi + privacy-friendly analytics | $10-50 | $0 |
| 1K-10K | Single banner ad + optional subscription ($2.99/mo) | $170-500 | $0-25 |
| 10K-100K | Gaming ad networks + subscription + sponsorships | $1,000-6,000 | $25-75 |
| 100K+ | Direct ad sales + licensing + media partnerships | $9,000-30,000+ | $50-200 |

### Recommended Subscription Tier

**"GameName+" at $2.99/month or $24.99/year:**
- Ad-free experience
- Puzzle archive
- Detailed statistics dashboard
- Custom visual themes
- At 2% conversion with 10K DAU: ~200 subscribers = ~$600/month

### Ad Strategy (When Ready)

| Phase | Trigger | Format |
|-------|---------|--------|
| Phase 1 | Launch | No ads |
| Phase 2 | 1K+ DAU | Single banner below game |
| Phase 3 | 5K+ DAU | Add optional rewarded ad |
| Phase 4 | 10K+ DAU | Add tasteful interstitial (max 1/session) |

**Gaming-specific ad networks:** AdinPlay/Venatus, PlayWire, Applixir (browser game rewarded video)

### Donation Platforms

| Platform | Fee | Best For |
|----------|-----|----------|
| Ko-fi | 0% (free tier) | Zero-fee tips, game devs |
| Buy Me a Coffee | 5% | Simple tipping |
| GitHub Sponsors | 0% | Developer audience |
| Patreon | 5-12% | Ongoing memberships |

**Reality check:** Donations alone won't sustain a project. Conversion rate drops as audience grows (early adopters donate more).

---

## 7. Free-Tier Hosting Architecture

### The Zero-Cost Stack

```
[Player Browser]
       |
  [Cloudflare CDN] — free, unlimited bandwidth, DDoS protection
       |
  [Cloudflare Pages] — free static hosting, unlimited bandwidth, commercial use OK
       |
  [Supabase Free] — 500MB database, unlimited API requests
```

### Why NOT Vercel Hobby

**Vercel Hobby plan prohibits commercial use.** Any monetization (ads, donations, subscriptions) violates terms. Use Cloudflare Pages instead.

### Cost at Scale

| DAU | Hosting | Database | CDN | Total |
|-----|---------|----------|-----|-------|
| 100 | $0 | $0 | $0 | **$0** |
| 1,000 | $0 | $0 | $0 | **$0** |
| 10,000 | $0 | $0-25 | $0 | **$0-25** |
| 50,000 | $0 | $25 | $0 | **$25** |
| 100,000 | $0 | $25-50 | $0 | **$25-50** |

### Optimization Strategies

- **Assets**: Sprite sheets, WebP format, OGG audio, font subsetting. Target <500KB initial load.
- **Caching**: Immutable assets with content-hash filenames (1 year cache). Daily data with 24h cache.
- **Database**: Client-side caching in localStorage. Batch writes. Pagination.
- **Target**: 95%+ cache hit ratio (returning players load ~0 bytes from origin)

### App Store Strategy

1. **Launch as PWA** — $0, full control, instant updates
2. **At 10K DAU:** Google Play via TWA ($25 one-time)
3. **At 50K+ DAU:** Consider iOS via Capacitor ($99/year) — only if revenue justifies Apple review risk

---

## 8. Legal Requirements (Germany)

### Mandatory for ALL German Websites (Even Hobby Projects)

1. **Impressum** — Full name, address, contact (email). Required by TMG Section 5.
2. **Datenschutzerklaerung** — What data is collected, legal basis, retention periods, user rights. Must be in German.

### Cookie/Tracking Rules (TTDSG + GDPR)

- **Essential cookies** (game state via localStorage): No consent needed
- **Analytics/Ad cookies**: Consent required BEFORE setting them
- **Cookie walls not allowed** in Germany
- **Fines: up to 300,000 EUR** (TTDSG) or 20M EUR / 4% revenue (GDPR)

### Practical Approach

- **No ads, no analytics = no consent banner needed** (only use localStorage for game state)
- Add analytics/ads only when revenue justifies the legal complexity
- Use **contextual ads** (not tracking-based) to minimize GDPR complexity
- Use **cookie-free analytics** (Umami, Plausible) — no consent needed

### Tax (Kleinunternehmerregelung)

- Under 22,000 EUR annual revenue: no VAT collection required
- Simplifies early monetization enormously
- Must still declare income in tax return

---

## 9. Tech Stack Recommendations

### For Browser Games (2025-2026)

| Component | Recommended | Why |
|-----------|------------|-----|
| Language | TypeScript (strict mode) | Type safety, IDE support, no `any` |
| Build tool | Vite 5+ | Fast HMR, good Phaser support, tree-shaking |
| Game engine | Phaser 3.90+ | Mature, huge community, 14 built-in WebGL FX |
| Physics | Matter.js (via Phaser) | Integrated, deterministic with fixed timestep |
| Hosting | Cloudflare Pages | Free, unlimited, commercial OK |
| CDN | Cloudflare (free) | 300+ edge locations, automatic |
| Database | Supabase (free tier) | Real-time, auth, 500MB free |
| Analytics | Umami (self-hosted) or Plausible | Cookie-free, GDPR-compliant, tiny script |
| Testing | Vitest (unit) + Playwright (visual/E2E) | Fast, canvas screenshot support |

### PWA Setup

Use `vite-plugin-pwa` with:
- **Cache-First** for static assets (sprites, audio, fonts)
- **Stale-While-Revalidate** for daily puzzle data
- **Network-First** for leaderboard/API calls

### Testing Strategy

| Test Type | Tool | What to Test | Priority |
|-----------|------|-------------|----------|
| Unit | Vitest | Game logic (scoring, detection, levels) | Must-do |
| Visual regression | Playwright | Canvas screenshots at key states | Should-do |
| Integration | Playwright | User flows, scene transitions | Should-do |
| Performance | Lighthouse CI | Load time, FCP, TTI | Should-do |

### Bundle Optimization

- Separate game engine into its own cacheable chunk
- Dynamic imports for non-critical scenes
- Asset compression (WebP sprites, OGG audio, font subsetting)
- Drop `console.log` in production
- Target: <500KB initial load

---

## 10. Launch Strategy Playbook

### Pre-Launch (6-3 Months Before)

1. **Build in public** — Share development on Twitter with #indiedev #gamedev
2. **Discord server** (invite-only at first — creates exclusivity)
3. **Landing page** with email signup
4. **Seed 50-100 beta testers** from Discord/Reddit
5. **Prepare press kit** — description, screenshots, GIF/video demos, developer story

### Launch Week

1. **Micro-influencer seeding** (1K-50K followers in puzzle/casual gaming niche) — higher engagement than large channels
2. **Press outreach** 3-4 weeks before, personalized pitches
3. **Community launch**: Reddit (r/WebGames, r/puzzlegames, r/IndieGaming), Product Hunt (Tue-Thu), Twitter thread
4. **Cross-promotion** with other daily game devs

### Post-Launch

1. **Engage every social share** in the first 30 days
2. **Fix bugs immediately** — broken games kill viral momentum
3. **Track K-factor** (share-to-new-player conversion) obsessively
4. **Content machine**: daily retweets of player results, weekly retrospectives, monthly stats

### Content Calendar Template

| Day | Content |
|-----|---------|
| Monday | Dev update / behind the scenes |
| Tuesday | Puzzle/game design spotlight |
| Wednesday | Community replay/result highlight |
| Thursday | Tips / strategy hints |
| Friday | Weekly challenge announcement |
| Saturday | Best-of weekly compilation (TikTok/Reels) |
| Sunday | Community spotlight |

### Critical Success Factors

1. Share prompt at the perfect moment — when dopamine is highest
2. Sharing must be ONE tap
3. Visual share format is the differentiator vs text-only games
4. Launch with all sharing mechanics working perfectly — one first impression
5. SEO: structured data, /how-to-play page, /about page, archive as unique URLs

---

## 11. Feature Ideas That Work Across Games

### High Impact / Low Effort

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| Slow-motion replay | S | High | Massive wow factor, improves shareability |
| Colorblind palette + shape markers | S | High | 8% of male players, ethical requirement |
| Near-miss indicator | S | High | Turns frustration into learning |
| Challenge a friend via URL | S | High | Viral loop: solve -> challenge -> friend plays |
| Streak freeze | S | High | Prevents #1 cause of abandonment |
| Score tiers (Bronze/Silver/Gold) | S | High | Multiple win moments per puzzle |
| Emoji share enhancement | S | High | Differentiates from Wordle clones |

### Medium Effort / High Impact

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| Achievement badges | M | High | Proven 22% retention improvement |
| Personal placement/result heatmap | M | High | Self-insight, encourages experimentation |
| Weekly challenges | M | High | Medium-term engagement beyond daily |
| Ghost of previous attempt | M | High | Learning between attempts |
| Global result heatmap | M | High | Social data visualization, "was I normal?" |
| Practice / sandbox mode | M | High | Catches bounced users wanting low-stakes play |

### Accessibility (Do These First)

| Feature | Effort | Notes |
|---------|--------|-------|
| Colorblind palettes + shape markers | S | Pair every color with a unique shape |
| Reduced motion mode | S | Respect `prefers-reduced-motion`, disable particles/shake |
| Screen reader support for results | S | ARIA labels on score, streak, UI elements |
| High contrast mode | S | Thicker outlines, brighter targets, darker backgrounds |

### Fun/Novelty (Post-Launch)

- April Fools' puzzles with absurd rules
- Impossible puzzles (quarterly joke — "Everyone failed today!")
- Chaos mode (randomized physics parameters, just for laughs)
- "What If?" mode (toggle parameters and re-simulate)
- End-of-year Wrapped (annual summary, shareable image)

---

## 12. AI-Friendly Development Approach

### Design Principles for AI-Driven Development

This project was built almost entirely by an AI developer (Claude Code). These principles make that work:

#### 1. Use Only Existing High-Quality Assets

- **Kenney Asset Packs** (CC0, public domain): Free, professional, consistent style
- No AI-generated art needed — Kenney provides sprites, UI, audio, fonts
- Consistent visual style without needing a human artist
- Other CC0/free asset sources: OpenGameArt, Itch.io asset packs, Google Fonts

#### 2. Structure Code So AI Can Test It

- **Deterministic rendering**: Fixed seeds, fixed timestep, no `Math.random()` in gameplay
- **Playwright MCP integration**: AI can launch the game, take screenshots, click, and verify
- **Canvas-based**: Playwright can screenshot canvas games for visual regression testing
- **Expose game state**: `window.__gameReady`, `window.__gameState` for programmatic testing
- **Fixed viewport**: Always test at same resolution for screenshot comparison

#### 3. AI Self-Testing Via Slash Commands

Custom Claude Code commands (`.claude/commands/`) for automated QA:
- `/game-tester` — AI plays the game via Playwright, takes screenshots, finds bugs
- `/game-completionist` — AI reads source code then plays every path
- `/game-design-audit` — AI evaluates game design quality
- `/asset-quality-audit` — AI screenshots every asset in-game and evaluates quality
- `/visual-verify` — AI verifies UI changes via screenshots
- `/iterate-visual` — AI iteratively improves UI using visual feedback loop

#### 4. Architecture for AI Comprehension

- **Clean separation**: Scenes (presentation) -> Services (logic) -> Types (domain)
- **TypeScript strict mode**: AI benefits from type information for accurate edits
- **Path aliases**: `@/*` maps to `src/*` for clear imports
- **One file = one responsibility**: AI can read and edit files independently
- **Constants files**: No magic numbers — AI can find and update values reliably
- **Levels as TypeScript**: Define levels in `.ts` files, not JSON — AI can generate and validate them with type checking

#### 5. Documentation Strategy

- **CLAUDE.md**: AI-facing quick reference (code style, rules, project structure)
- **PRINCIPLES.md**: Engineering principles (source of truth for HOW to build)
- **docs/**: Architecture, components, guides — AI reads these to understand context
- **Inline comments only where logic isn't obvious** — AI reads the code itself

---

## 13. Key Statistics & Numbers

### Market Data (2025-2026)

- HTML5 gaming market: $31B+ (projected $40B+ by 2027)
- Puzzle games: 18% 30-day retention (vs 13% industry average)
- 82% of players prefer free games with ads over paid games
- 46.8% cite ads as biggest frustration
- Daily challenge features increase retention by up to 40%
- Apps combining streaks + milestones see 40-60% higher DAU
- Social features: 70% higher player satisfaction
- Gamification (achievements): 22% retention improvement

### Wordle Growth Numbers

- 90 players -> 300,000 in 8 weeks
- 23.5 million score tweets from 2.1 million unique users (Dec 2021-Feb 2022)
- Acquired by NYT for "low seven figures" ($1-5M estimated)
- NYT Games: 1M+ premium subscribers, $11.2M in-app revenue in Q2 2024

### Revenue Benchmarks

- Browser game banner ad eCPM: ~$1.50
- Rewarded video eCPM (web): $3-10
- Ad-free subscription conversion: 2-5% of ad-viewing users
- Donation conversion: 0.05-2% (higher for early adopters)
- Ko-fi tip fee: 0% (free tier)

### Social Media

- 74% of gaming Redditors are NOT on Discord, 64% NOT on Twitch — Reddit reaches a unique audience
- 30%+ of top indie games in 2024 attributed visibility to short-form video (TikTok/Reels)
- Posts with optimized OG images: 40-60% higher click-through
- Structured data: ~30% more clicks in search results

### Privacy & Analytics

- Umami: 2KB script, cookie-free, GDPR-compliant, self-hostable for free
- Plausible: <1KB script, best managed option
- Both require no consent banner when used without cookies

---

## How to Use This Document

1. **Brainstorming a new game?** Start with Section 2 (competitor landscape) and Section 11 (feature ideas). Look for unoccupied niches.
2. **Evaluating an idea?** Check it against Section 1 (viral pillars) and Section 5 (retention mechanics).
3. **Planning the build?** Use Section 9 (tech stack), Section 12 (AI-friendly dev), and Section 7 (hosting).
4. **Planning launch?** Follow Section 10 (launch playbook) and Section 4 (sharing mechanics).
5. **Planning monetization?** Follow Section 6 (monetization models) and Section 8 (legal requirements).

---

*Compiled from 6 parallel deep research threads, March 2026. Sources cited in individual research documents under `docs/research/`.*
