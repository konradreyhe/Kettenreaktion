# Creative Feature Ideas for Kettenreaktion

> Brainstormed 2026-03-26. Research-informed feature ideas across 10 categories.
> Each idea includes: description, effort (S/M/L/XL), impact (low/medium/high), and timing (MVP / post-launch / long-term).
> Stars mark the best ratio of high impact to low effort.

---

## Table of Contents

1. [Game Mechanic Extensions](#1-game-mechanic-extensions)
2. [Meta-Game Systems](#2-meta-game-systems)
3. [Social Features](#3-social-features)
4. [Accessibility Features](#4-accessibility-features)
5. [Content Ideas](#5-content-ideas)
6. [Engagement Hooks](#6-engagement-hooks)
7. [Monetization Ideas](#7-monetization-ideas-ethical-non-p2w)
8. [Technical Features](#8-technical-features)
9. [Fun / Novelty Ideas](#9-fun--novelty-ideas)
10. [Data Visualization](#10-data-visualization)

---

## Priority Matrix (Top Picks)

| Idea | Effort | Impact | Timing | Why |
|------|--------|--------|--------|-----|
| Near-miss indicator enhancement | S | High | MVP | Already partially planned; makes failures feel close, drives retry |
| Slow-motion replay | S | High | MVP | Low code cost, massive "wow" factor, improves shareability |
| Colorblind palette + shape markers | S | High | MVP | Ethical obligation, widens audience, near-zero gameplay cost |
| Weekly challenge streak | S | High | Post-launch | Reuses existing streak infra, adds medium-term goal |
| Placement heatmap (personal) | M | High | Post-launch | Gives player insight, encourages experimentation |
| Emoji result enhancement (chain diagram) | S | High | MVP | Differentiates sharing from Wordle clones, free viral marketing |
| Practice / sandbox mode | M | High | Post-launch | Catches bounced users who want low-stakes play |
| Achievement badges | M | High | Post-launch | Proven retention driver across all daily games |
| Spring object | M | Medium | Post-launch | Already planned Phase 2; high fun-per-complexity ratio |
| Reverse engineering mode | M | High | Long-term | Unique mechanic no competitor has; high novelty |

---

## 1. Game Mechanic Extensions

### 1.1 New Placeable Object Types

#### Spring Launcher
**Description:** A coiled spring that, when struck by a moving object, launches it upward or in a set direction with amplified force. Inspired by The Incredible Machine's spring boards. The player could place a spring to redirect a falling ball upward into targets on a higher platform.
- **Effort:** M (new constraint body type in Matter.js, needs tuning)
- **Impact:** High (opens entire new puzzle category: vertical puzzles)
- **Timing:** Post-launch (already planned Phase 2)

#### Fan / Air Current
**Description:** A stationary fan that applies a constant directional force to nearby bodies. Creates "wind tunnels" that curve trajectories. Could have adjustable angle. Inspired by Crazy Machines' fan objects.
- **Effort:** M (applyForce in update loop within radius, visual particles)
- **Impact:** Medium (interesting but niche puzzle applications)
- **Timing:** Long-term

#### Magnet
**Description:** Attracts or repels metal-tagged objects within a radius. Creates curved, non-linear paths that feel magical. The Incredible Machine used magnets extensively for its most memorable puzzles.
- **Effort:** L (distance-based force calculation per frame, performance implications on mobile, needs metal/non-metal tagging)
- **Impact:** High (fundamentally new interaction type, "wow" moments)
- **Timing:** Long-term (already planned Phase 3)

#### Portal Pair
**Description:** Two linked circles -- object enters one, exits the other with preserved velocity vector (optionally rotated). Inspired by Portal (Valve). One of the most universally understood game mechanics.
- **Effort:** L (teleport body, preserve velocity, handle edge cases like partial overlap, visual effects)
- **Impact:** High (completely changes spatial reasoning, very shareable moments)
- **Timing:** Long-term (already planned Phase 3)

#### Explosive / Bomb
**Description:** When struck with sufficient force, explodes after a short fuse timer, applying radial force to all bodies within blast radius. Creates dramatic chain reactions. Crazy Machines featured explosives as a fan-favorite object.
- **Effort:** M (radial applyForce, particle effects, sound, fuse timer)
- **Impact:** High (most viscerally satisfying object type, great for sharing)
- **Timing:** Post-launch (high fun payoff for moderate effort)

#### Rope / Chain
**Description:** A flexible connection between two anchor points. Objects can swing from ropes, creating pendulum physics. Matter.js has built-in `Composites.chain()` for this.
- **Effort:** M (Matter.Composites.chain, rendering composite body, destruction on overload)
- **Impact:** Medium (interesting but narrow puzzle applications)
- **Timing:** Long-term

#### Conveyor Belt
**Description:** A surface that applies horizontal force to any object resting on it, moving objects in one direction. Common in factory/industrial themed puzzles. The mobile game "Belt Conve-meow" is built entirely around this mechanic.
- **Effort:** M (surface friction override + directional force, animated belt texture)
- **Impact:** Medium (good for industrial-themed weeks)
- **Timing:** Long-term

#### Balloon
**Description:** A dynamic object with negative gravity (floats upward). When attached to another object, reduces its effective weight. Can pop on contact with spikes. Featured prominently in The Incredible Machine.
- **Effort:** S (negative gravity on a body, pop on collision with tagged objects)
- **Impact:** Medium (fun and visually distinct, good for easy puzzles)
- **Timing:** Post-launch

#### Ice Surface
**Description:** A platform variant with near-zero friction. Objects slide across almost indefinitely, requiring careful momentum planning.
- **Effort:** S (just a platform with friction=0.01)
- **Impact:** Low-Medium (subtle mechanic, good for precision puzzles)
- **Timing:** Post-launch

#### Sticky Surface
**Description:** The opposite of ice -- objects that touch it stop completely (restitution=0, very high friction). Creates "catch zones" for stopping chain reactions at precise moments.
- **Effort:** S (platform with extreme friction + zero restitution)
- **Impact:** Low-Medium (useful puzzle element, not flashy)
- **Timing:** Post-launch

### 1.2 New Physics Interactions

#### Breakable Objects
**Description:** Crates or walls that shatter when hit with enough force, revealing paths or releasing trapped objects behind them. Force threshold determines break point.
- **Effort:** M (collision force check, body replacement with fragments, particle burst)
- **Impact:** High (adds discovery/surprise element, "what's behind the wall?")
- **Timing:** Post-launch

#### Liquid / Water Zones
**Description:** Rectangular zones where objects experience buoyancy and drag. Heavy objects sink, light objects float. Changes the physics puzzle vocabulary completely.
- **Effort:** XL (custom buoyancy simulation, visual water rendering, splash effects)
- **Impact:** Medium (impressive but very complex to balance)
- **Timing:** Long-term (only if game has proven audience)

#### Electricity / Circuit Chains
**Description:** Conductive objects pass an "electricity" state from one to another on contact. When current reaches a motor or switch, it activates a mechanism. Inspired by Crazy Machines Elements where metal conducts electricity.
- **Effort:** L (state propagation system, new visual layer, switch/motor objects)
- **Impact:** Medium (adds logic puzzle layer on top of physics)
- **Timing:** Long-term

### 1.3 New Target Types

#### Moving Targets
**Description:** Targets that move along a path (linear or circular). Requires timing the chain reaction to hit them at the right moment.
- **Effort:** S (path-following body with collision detection)
- **Impact:** High (adds timing dimension to spatial puzzles)
- **Timing:** Post-launch

#### Sequence Targets
**Description:** Targets that must be hit in a specific order (1, 2, 3...). Hitting them out of order resets the sequence. Forces players to think about chain reaction ordering.
- **Effort:** S (ordered hit tracking, visual numbering)
- **Impact:** Medium (adds puzzle depth at low cost)
- **Timing:** Post-launch

#### Timed Targets
**Description:** Targets that appear and disappear on a timer. The player must trigger the chain reaction so it reaches the target during its "visible" window.
- **Effort:** S (toggle visibility on interval, collision only when visible)
- **Impact:** Medium (synergizes well with moving targets)
- **Timing:** Post-launch

#### Multi-Hit Targets
**Description:** Targets that require being hit N times before they count as "solved." Encourages bouncing objects back and forth.
- **Effort:** S (hit counter per target, visual progress indicator)
- **Impact:** Medium (encourages creative bounce solutions)
- **Timing:** Post-launch

---

## 2. Meta-Game Systems

### 2.1 Achievement System
**Description:** A collection of badges/trophies earned by completing specific challenges. Examples: "First Try!" (solve on attempt 1), "Perfectionist" (max score), "Chain Master" (chain of 10+), "Week Warrior" (complete 7 consecutive days), "Demolition Expert" (use a bomb to hit 3 targets), "Pixel Perfect" (ball passes within 2px of target before hitting it). Display achievements on a dedicated page and optionally in the share text.
- **Effort:** M (achievement registry, condition checking, localStorage persistence, UI page)
- **Impact:** High (proven retention mechanic; 22% improvement per gamification research)
- **Timing:** Post-launch

### 2.2 Weekly Challenges
**Description:** Each week features a special bonus objective on top of the daily puzzle. Examples: "Speed Week" (complete all 7 puzzles in under 15s each), "Perfectionist Week" (all first-try solves), "Chain Week" (total chain length across the week > 50). Completing the weekly challenge awards a special badge.
- **Effort:** M (weekly tracking system, new UI element, badge rewards)
- **Impact:** High (creates medium-term engagement loop beyond daily)
- **Timing:** Post-launch

### 2.3 Monthly Themes
**Description:** Each month has a visual and mechanical theme. January: "Ice World" (slippery surfaces). April: "Spring Fever" (bouncy objects). October: "Spooky Physics" (gravity reversal). December: "Gift Wrap" (presents instead of crates). Themes affect level aesthetics and may introduce one special rule.
- **Effort:** L (themed asset packs, conditional physics rules, content planning pipeline)
- **Impact:** Medium (freshness, but high content overhead)
- **Timing:** Long-term

### 2.4 Seasonal Events
**Description:** Limited-time events during holidays. Valentine's Day: "Heart-shaped targets." Halloween: "Ghost objects that pass through walls." Christmas: "25-day advent calendar with bonus puzzles." New Year's: "Replay your best puzzle of the year."
- **Effort:** L (per-event custom content, time-limited logic, asset creation)
- **Impact:** Medium-High (drives social sharing, press mentions)
- **Timing:** Long-term (only after stable content pipeline)

### 2.5 Unlockable Cosmetics (Non-P2W)
**Description:** Earn visual customizations through play, never through payment (or offer both paths). Examples: ball skins (tennis ball, bowling ball, watermelon, eyeball), trail effects (sparkles, fire, rainbow, ink), celebration styles (confetti, fireworks, disco ball, pixel explosion), placement zone themes (neon glow, chalk outline, hologram). Earned via achievements, streaks, or weekly challenges.
- **Effort:** M (cosmetic registry, skin system, rendering variants, UI picker)
- **Impact:** Medium-High (self-expression, long-term collection goal)
- **Timing:** Post-launch

### 2.6 Player Titles / Ranks
**Description:** Cumulative score across all puzzles determines a player rank: "Anfaenger" (0-1000), "Tueftler" (1000-5000), "Kettenmeister" (5000-15000), "Physik-Genie" (15000+). Shown on result screen and in shared text.
- **Effort:** S (cumulative score tracking, title lookup table, display in UI)
- **Impact:** Medium (lightweight progression without complexity)
- **Timing:** Post-launch

---

## 3. Social Features

### 3.1 Friend Leaderboards
**Description:** Generate a unique group code. Share it with friends. Everyone in the group sees each other's daily scores on a mini-leaderboard. No login required -- just a code stored in localStorage, scores synced via Supabase. Inspired by how fitness apps handle friend groups.
- **Effort:** M (Supabase group table, group code generation, join flow, leaderboard UI)
- **Impact:** High (social competition is the #1 retention driver; 70% higher satisfaction per research)
- **Timing:** Post-launch (requires Supabase, Phase 3+)

### 3.2 Challenge a Friend
**Description:** After solving a puzzle, tap "Challenge" to generate a link. When a friend opens it, they see your score as a target to beat on the same puzzle. Creates head-to-head competition on the daily puzzle.
- **Effort:** S (URL parameter with score encoded, comparison UI on result screen)
- **Impact:** High (viral loop: player solves -> challenges friend -> friend plays -> challenges back)
- **Timing:** Post-launch

### 3.3 Enhanced Emoji Sharing (Chain Diagram)
**Description:** Instead of just score numbers, generate a visual emoji representation of the chain reaction path. Example:
```
Kettenreaktion #42
   [ball emoji] -> [box emoji] -> [box emoji]
                          |
                    [star emoji] [star emoji]
Score: 1.240 | Streak: 7
```
This differentiates Kettenreaktion shares from the sea of Wordle-style grid shares.
- **Effort:** S (algorithmic emoji layout from collision graph)
- **Impact:** High (unique, visually distinctive, drives curiosity clicks)
- **Timing:** MVP or Post-launch

### 3.4 Collaborative Weekly Puzzle
**Description:** One special puzzle per week where the global community contributes. Each player places one object, and the combined placements from all players create one massive chain reaction shown on Sunday. Uses averaged or most-common placement position.
- **Effort:** XL (server-side aggregation, replay rendering of combined result, complex UX)
- **Impact:** Medium (novel concept but hard to execute well)
- **Timing:** Long-term

### 3.5 Spectator / Replay Gallery
**Description:** After the daily puzzle closes (UTC midnight), show a gallery of anonymized replays from top-scoring players. "See how the #1 player solved it." Requires recording placement + physics seed, not full video.
- **Effort:** L (replay recording system, server storage, gallery UI, replay playback)
- **Impact:** Medium-High (educational, "aha" moments, extends daily engagement past solve)
- **Timing:** Long-term

### 3.6 "Yesterday's Solution" Replay
**Description:** Show an optimal solution replay for yesterday's puzzle. Already partially planned in GAMEPLAN.md. Lets players see what they missed and learn strategies.
- **Effort:** M (record one optimal solution per puzzle, replay engine)
- **Impact:** Medium (learning tool, reduces frustration from unsolved puzzles)
- **Timing:** Post-launch (already planned)

---

## 4. Accessibility Features

### 4.1 Colorblind Palettes
**Description:** Offer 3 palette modes: default, deuteranopia-friendly, and tritanopia-friendly. Swap color-coded elements (targets, zones, UI indicators) to accessible alternatives. Following AbleGamers guidelines: pair every color with a unique shape/symbol so color is never the sole information carrier.
- **Effort:** S (CSS custom properties for colors, shape overlays on key elements)
- **Impact:** High (8% of men are colorblind; ethical requirement for inclusive design)
- **Timing:** MVP

### 4.2 Slow-Motion Replay
**Description:** After each attempt, let the player replay the chain reaction at 0.25x, 0.5x, or 1x speed with scrubbing controls. Helps players understand what happened and plan their next attempt. Uses the existing physics state recording.
- **Effort:** S-M (store body positions per frame, replay with variable delta, scrub bar UI)
- **Impact:** High (learning aid + spectacle; replays in slow-mo are inherently shareable)
- **Timing:** MVP (even a basic version adds massive value)

### 4.3 Trajectory Preview / Hint System
**Description:** Optional "hint" button (limited uses per day, e.g., 1 hint per puzzle) that shows a dotted trajectory line for the placed object's first 0.5 seconds of motion. Does not show the full chain, just initial movement. Helps new players build intuition without spoiling the puzzle.
- **Effort:** M (simulate N frames, render trajectory dots, hint quota system)
- **Impact:** Medium-High (reduces frustration for new players, improves onboarding)
- **Timing:** Post-launch

### 4.4 Reduced Motion Mode
**Description:** For users with vestibular disorders or motion sensitivity. Disables: particle effects, screen shake, fast physics animations. Replaces with: static result indicators, gentle fade transitions, optional auto-skip of simulation (just show result).
- **Effort:** S (conditional rendering, `prefers-reduced-motion` media query, settings toggle)
- **Impact:** Medium (small audience but strong ethical case; respects OS preferences)
- **Timing:** MVP

### 4.5 Screen Reader Support for Results
**Description:** Ensure the result screen and sharing flow work with screen readers. ARIA labels on score, streak, attempts. Alt text for visual elements. The simulation itself is inherently visual, but results and menus should be fully accessible.
- **Effort:** S (ARIA attributes, semantic HTML for overlay elements)
- **Impact:** Medium (ensures results/menus are accessible even if gameplay is visual)
- **Timing:** MVP

### 4.6 One-Handed / Switch Control Mode
**Description:** Allow full gameplay with a single tap: auto-cycle through placement positions on a grid within the zone, tap to confirm. For players who cannot drag/position precisely.
- **Effort:** M (grid snapping, auto-cycle system, separate input mode)
- **Impact:** Low-Medium (small audience, but meaningful for those who need it)
- **Timing:** Long-term

### 4.7 High Contrast Mode
**Description:** Toggle that increases contrast for all game elements: thicker outlines, brighter targets, darker backgrounds. Uses `prefers-contrast` media query as default, with manual override.
- **Effort:** S (outline thickness parameter, contrast color set, settings toggle)
- **Impact:** Medium (improves experience for low-vision players)
- **Timing:** Post-launch

---

## 5. Content Ideas

### 5.1 Themed Puzzle Packs

#### Factory / Industrial
**Description:** Conveyor belts, gears, pistons, steam pipes. Visual aesthetic: steel and rust. Mechanical sounds. Could introduce the conveyor belt object type.
- **Effort:** L (themed assets, new object types, 20+ levels)
- **Impact:** Medium (content freshness)
- **Timing:** Long-term

#### Space / Zero Gravity
**Description:** Reduced or variable gravity zones. Objects float and drift. Asteroids as obstacles. Stars as targets. Could be a monthly theme or permanent difficulty-5 category.
- **Effort:** M (gravity multiplier per zone, space-themed Kenney assets exist)
- **Impact:** Medium-High (visually striking, novel physics feel)
- **Timing:** Post-launch

#### Underwater
**Description:** Drag/buoyancy physics. Objects fall slowly, float if light. Bubbles as visual effects. Sea creatures as decorative elements.
- **Effort:** L (buoyancy simulation, water drag, themed visuals)
- **Impact:** Medium (beautiful but complex physics tuning)
- **Timing:** Long-term

#### Kitchen / Cooking
**Description:** Food items instead of physics objects. Rolling fruits, toppling jars, spilling liquids. Lighthearted and approachable theme.
- **Effort:** M (reskinned objects, themed backgrounds, food-related Kenney assets)
- **Impact:** Medium (broad appeal, approachable aesthetic)
- **Timing:** Post-launch

### 5.2 Tutorial Campaign
**Description:** A 10-level guided sequence that teaches one mechanic per level. Level 1: "Place the ball on the ramp." Level 2: "Use the ball to knock over dominoes." Level 3: "Hit two targets with one chain." Each level has a text hint and highlighted placement suggestion. Available at any time, not tied to daily puzzle.
- **Effort:** M (10 curated levels, hint system, progression tracking, separate scene flow)
- **Impact:** High (dramatically improves onboarding and reduces bounce rate)
- **Timing:** Post-launch (high priority)

### 5.3 Story Mode (Narrative Wrapper)
**Description:** A 30-level story arc. A quirky inventor character needs to solve physics puzzles to fix their broken machine / save their village / deliver mail across a fantastical landscape. Dialogue between levels. Visual novel-style character portraits.
- **Effort:** XL (writing, character art, cutscene system, 30 curated levels, narrative branching)
- **Impact:** Medium (adds emotional hook but diverges from daily puzzle identity)
- **Timing:** Long-term (only if pivoting toward broader puzzle game)

### 5.4 User-Generated Levels
**Description:** In-game level editor. Players create puzzles, share them via URL. Community can rate and play shared levels. Requires: drag-and-drop object placement, zone definition, target placement, validation check, sharing infrastructure.
- **Effort:** XL (editor UI, validation, sharing backend, moderation, reporting)
- **Impact:** High (infinite content, community ownership, viral sharing potential)
- **Timing:** Long-term (already noted in roadmap as future idea)

### 5.5 Daily Level Variants
**Description:** Instead of one daily puzzle, offer 3 difficulty variants of the same layout: Easy (wide placement zone, 1 target), Medium (standard), Hard (tiny zone, 3 targets, tighter tolerances). Player can play all three. Score is summed.
- **Effort:** M (variant generation from base template, UI for difficulty selection, combined scoring)
- **Impact:** Medium-High (serves both casual and hardcore players simultaneously)
- **Timing:** Post-launch

---

## 6. Engagement Hooks

### 6.1 Daily Bonus for Consecutive Play
**Description:** Beyond the existing streak counter, award tangible bonuses for streak milestones. Day 7: unlock a ball skin. Day 30: unlock a trail effect. Day 100: unlock a special title. Creates concrete goals for streak maintenance. Research shows streak mechanics improve retention by 22%.
- **Effort:** S (milestone table, cosmetic unlock trigger, notification on unlock)
- **Impact:** High (transforms passive streak counter into active motivator)
- **Timing:** Post-launch

### 6.2 Weekly Wrap-Up Summary
**Description:** Every Sunday, show a "Your Week in Kettenreaktion" summary: total score, best puzzle, average attempts, comparison to global average, streak status. Shareable as an image or text. Email version requires opt-in email collection (Phase 3+).
- **Effort:** M (weekly aggregation from localStorage, summary UI, share image generation)
- **Impact:** Medium-High (reflection moment, shareable content, re-engagement on Sundays)
- **Timing:** Post-launch

### 6.3 "Puzzle of the Week" Community Vote
**Description:** At the end of each week, present the 7 daily puzzles and let players vote for their favorite. The winning puzzle gets a "Community Pick" badge. Results shown the following Monday. Simple thumbs-up/thumbs-down after each puzzle.
- **Effort:** M (vote collection via Supabase, weekly aggregation, results display)
- **Impact:** Medium (community engagement, sense of ownership)
- **Timing:** Long-term (requires Supabase + sufficient player base)

### 6.4 Comeback Mechanic
**Description:** If a player breaks their streak, offer a "Second Chance" within 24 hours: solve a special bonus puzzle to restore the streak. Only available once per streak break. Prevents the demoralizing "lost my 30-day streak" moment that causes permanent churn.
- **Effort:** S (grace period logic, bonus puzzle trigger, one-time flag per break)
- **Impact:** High (directly prevents the #1 cause of daily game abandonment)
- **Timing:** Post-launch (high priority)

### 6.5 Progressive Difficulty Within Attempts
**Description:** On attempt 1, the placement zone is standard. On attempt 2, the zone shrinks slightly (harder). On attempt 3, the zone expands (easier, "mercy round"). Creates natural difficulty curve within a single puzzle session.
- **Effort:** S (zone size modifier per attempt number)
- **Impact:** Medium (interesting design, but might confuse players who expect consistency)
- **Timing:** Long-term (needs playtesting)

### 6.6 Near-Miss Indicator Enhancement
**Description:** Expand the existing "Knapp!" indicator. When the ball passes close to a target without hitting it, show: a trail showing the closest approach, the distance in pixels, and a subtle arrow showing which direction to adjust. Makes failures feel informative rather than frustrating.
- **Effort:** S (distance calculation already exists, add directional arrow and distance display)
- **Impact:** High (turns frustration into learning; critical for retention)
- **Timing:** MVP

### 6.7 "Personal Best" Tracking
**Description:** For each puzzle, track the player's best score across their 3 attempts and highlight when they beat it or set a new personal best. Display personal best on the result screen alongside current score.
- **Effort:** S (max score comparison in StorageManager, result screen display)
- **Impact:** Medium (self-competition, satisfying micro-moments)
- **Timing:** MVP

---

## 7. Monetization Ideas (Ethical, Non-P2W)

> Principle: The core daily puzzle must ALWAYS be free with full functionality. Monetization adds convenience or cosmetics, never competitive advantage.

### 7.1 Cosmetic Shop (Earn or Buy)
**Description:** Ball skins, trail effects, celebration animations, and placement zone themes. All earnable through gameplay (achievements, streaks). Optionally purchasable for players who want them faster. Price: $0.99-$2.99 per cosmetic pack, or $4.99 for a "season pass" that unlocks all cosmetics for a month.
- **Effort:** L (payment integration, cosmetic rendering system, shop UI, entitlement management)
- **Impact:** Medium (small but ethical revenue stream)
- **Timing:** Long-term (only at scale; >10k DAU)

### 7.2 Ad-Free Tier
**Description:** If/when ads are introduced (planned at >1k DAU), offer a $1.99/month or $14.99/year ad-free tier. No gameplay differences. Just removes the banner ad on the result screen.
- **Effort:** M (payment/subscription integration, ad conditional rendering, entitlement check)
- **Impact:** Medium (conversion rates for ad-removal are typically 2-5% of ad-viewing users)
- **Timing:** Long-term (only after ads are live and DAU supports it)

### 7.3 Hint Tokens
**Description:** Free players get 1 hint per day (trajectory preview). Premium players ($1.99/mo) get 3 hints per day. Hints show the initial trajectory of the placed object for 0.5 seconds. Never shows full solution -- just assists intuition.
- **Effort:** M (hint system + token management + payment integration)
- **Impact:** Medium (ethical if hints are subtle and daily free allocation exists)
- **Timing:** Long-term

### 7.4 Custom Puzzle Creator (Premium)
**Description:** A level editor available to subscribers ($2.99/mo). Create puzzles, share via URL. Non-subscribers can PLAY shared puzzles for free but cannot create. This aligns monetization with content creation, not content consumption.
- **Effort:** XL (level editor + sharing infra + subscription management)
- **Impact:** Medium-High (if community creates content, it's self-sustaining)
- **Timing:** Long-term

### 7.5 "Tip Jar" / One-Time Support
**Description:** A simple "Buy me a coffee" style button. No recurring commitment, no feature gating. Players who enjoy the game can contribute $1-$5. Displayed subtly on the settings page.
- **Effort:** S (external link to Ko-fi or Buy Me a Coffee, or Stripe one-time payment)
- **Impact:** Low-Medium (low revenue but builds goodwill, zero friction)
- **Timing:** Post-launch

### 7.6 Branded / Sponsored Puzzles
**Description:** Partner with brands for special themed puzzles. "Today's puzzle is brought to you by [brand]." Brand logo appears as a target or background element. Must be tasteful and opt-in. Revenue: flat fee per sponsored day.
- **Effort:** M (sponsored content pipeline, brand asset integration, scheduling)
- **Impact:** Medium (potentially significant revenue at scale, but requires sales effort)
- **Timing:** Long-term (only at >50k DAU)

---

## 8. Technical Features

### 8.1 Offline Mode (PWA Enhancement)
**Description:** Pre-cache the next 3 days of puzzles when online. Service worker serves cached puzzles when offline. Scores sync to localStorage immediately, then to Supabase when reconnected. Critical for mobile users with intermittent connectivity.
- **Effort:** M (service worker caching strategy, offline-first localStorage, sync queue)
- **Impact:** Medium-High (prevents missed daily puzzles, improves perceived reliability)
- **Timing:** Post-launch (PWA already planned Phase 2)

### 8.2 Cross-Device Sync (Anonymous Account)
**Description:** Generate a unique sync code (6 alphanumeric characters). Enter it on another device to link progress. Syncs: streak, stats, achievements, cosmetics. No email/password required. Stored in Supabase with the anonymous UUID.
- **Effort:** M (sync code generation, Supabase row linking, merge conflict resolution)
- **Impact:** Medium-High (players switch between phone and desktop; losing progress kills retention)
- **Timing:** Post-launch (requires Supabase, Phase 3+)

### 8.3 Push Notifications for Daily Puzzle
**Description:** Browser Push Notification API. Daily reminder at a user-chosen time: "Today's Kettenreaktion is ready!" Also notify on streak danger: "Don't break your 15-day streak! Today's puzzle is waiting." Requires explicit opt-in. Respectful: max 1 notification per day.
- **Effort:** M (Push API registration, notification scheduling, time preference UI, service worker push handler)
- **Impact:** Medium-High (direct re-engagement channel, but many users block notifications)
- **Timing:** Post-launch

### 8.4 Performance Profiling Dashboard (Dev Tool)
**Description:** Internal-only tool that shows: FPS graph during simulation, body count, collision count, memory usage, and render time per frame. Helps identify performance bottlenecks before players report them.
- **Effort:** S (Phaser debug overlay, Matter.js event hooks, simple on-screen stats)
- **Impact:** Low (developer productivity, not player-facing)
- **Timing:** MVP (helps during development)

### 8.5 Deterministic Physics Replay via Seed
**Description:** Instead of recording every frame of physics, store only: puzzle ID + placement position + physics seed. Replay by re-simulating with identical initial conditions. Requires fixed timestep (already planned) and deterministic Matter.js config.
- **Effort:** M (ensure full determinism, test across browsers, seed management)
- **Impact:** High (enables replays, leaderboard verification, and spectator mode at minimal storage cost)
- **Timing:** Post-launch (foundational for many other features)

### 8.6 Analytics Integration
**Description:** Lightweight, privacy-respecting analytics. Track: DAU, puzzle completion rate, average attempts, average score, device type, bounce rate, share rate. Use Plausible (privacy-first) or self-hosted Umami. No cookies, no PII.
- **Effort:** S (script tag + event calls at key moments)
- **Impact:** High (data-driven decisions, pivot criteria monitoring)
- **Timing:** MVP

---

## 9. Fun / Novelty Ideas

### 9.1 April Fools' Puzzles
**Description:** On April 1st, the puzzle has absurd physics: reversed gravity, objects that grow/shrink on collision, targets that run away, or a "solution" that's impossible (with a surprise joke ending). Shared results could include a special April Fools emoji.
- **Effort:** S (one custom level with physics overrides, special date check)
- **Impact:** Medium-High (viral potential, memorable, builds brand personality)
- **Timing:** Post-launch (schedule for April 1 after first launch)

### 9.2 Impossible Puzzles (Joke Levels)
**Description:** Occasional puzzles that are literally unsolvable, with a humorous reveal after 3 failed attempts: "Congratulations! This puzzle was impossible. Everyone failed today. You're in good company." Shared as a special result. Maybe once per quarter.
- **Effort:** S (unsolvable level + special failure screen + share text)
- **Impact:** Medium (community bonding through shared failure, meme potential)
- **Timing:** Long-term (needs established community to land well)

### 9.3 Speedrun Timer
**Description:** Optional speedrun mode: timer starts when the puzzle loads, stops when the player places their object. Leaderboard for fastest placement-to-solve time. Separate from the main scoring system. Appeals to competitive players who want to solve daily puzzles as fast as possible.
- **Effort:** S (timer display, time recording, optional leaderboard entry)
- **Impact:** Medium (niche appeal but creates a second competitive dimension)
- **Timing:** Post-launch

### 9.4 Chaos Mode
**Description:** Unlockable after completing 30 daily puzzles. Same puzzle layout but with randomized physics: gravity direction changes every 2 seconds, friction randomized per surface, restitution (bounciness) randomized. Pure entertainment, no score tracking. Just for laughs.
- **Effort:** M (physics parameter randomization, mode toggle, unlock condition)
- **Impact:** Medium (hilarious, shareable, adds replay value to known puzzles)
- **Timing:** Long-term

### 9.5 Reverse Engineering Mode
**Description:** Given a completed chain reaction replay (the solution), the player must recreate the initial setup by placing objects. "You saw the result -- now figure out how it started." Completely inverts the puzzle logic. No other daily puzzle game does this.
- **Effort:** L (replay system, object placement validation, setup comparison logic, new scene flow)
- **Impact:** High (genuinely novel mechanic, differentiator, appeals to puzzle enthusiasts)
- **Timing:** Long-term

### 9.6 "What If?" Mode
**Description:** After solving (or failing) the daily puzzle, let players toggle physics parameters and re-simulate: "What if gravity was 2x?" "What if everything was bouncy?" Educational and entertaining. Shows how physics parameters affect outcomes.
- **Effort:** M (physics parameter sliders, re-simulation with modified params)
- **Impact:** Medium (educational, extends engagement post-solve)
- **Timing:** Long-term

### 9.7 Holiday / Calendar Specials
**Description:** On specific dates, the puzzle has thematic flair. New Year's: countdown timer target. Valentine's: heart-shaped targets. Halloween: spooky physics (objects leave ghost trails). Christmas: 25-day advent calendar with bonus mini-puzzles.
- **Effort:** S-M per holiday (themed assets, date-triggered overrides)
- **Impact:** Medium (seasonal engagement spikes, shareable novelty)
- **Timing:** Post-launch

### 9.8 "Ghost" of Your Previous Attempt
**Description:** On attempts 2 and 3, show a translucent "ghost" replay of your previous attempt overlaid on the current simulation. Helps players see exactly how their adjustment changed the outcome. Inspired by racing game ghost replays.
- **Effort:** M (record positions per frame on attempt N, render ghost on attempt N+1)
- **Impact:** High (dramatically improves learning between attempts, reduces frustration)
- **Timing:** Post-launch

---

## 10. Data Visualization

### 10.1 Placement Heatmap (Personal)
**Description:** After all 3 attempts, show a heatmap of where the player placed their object on each attempt, overlaid on the placement zone. Over time (across multiple daily puzzles), build a personal heatmap showing placement tendencies: "You tend to place in the upper-left. Try the bottom-right."
- **Effort:** M (canvas heatmap rendering, placement history in localStorage, aggregation)
- **Impact:** High (self-insight, encourages experimentation, "data as gameplay")
- **Timing:** Post-launch

### 10.2 Global Placement Heatmap
**Description:** After the daily puzzle closes, show an aggregate heatmap of where ALL players placed their objects. "Most players placed here. The #1 solution was here." Requires Supabase to collect anonymous placement data.
- **Effort:** M (placement data collection via Supabase, heatmap generation, display after UTC midnight)
- **Impact:** High (fascinating social data, "was I normal or creative?", drives next-day engagement)
- **Timing:** Post-launch (requires Supabase)

### 10.3 Global Solve Statistics
**Description:** After puzzle closes, show: "Today's puzzle was solved by 73% of players. Average score: 890. Average attempts: 2.1." Compare the player's performance to the global average.
- **Effort:** S-M (Supabase aggregation query, stats display on result screen after midnight)
- **Impact:** Medium-High (social comparison, "am I good at this?", validation)
- **Timing:** Post-launch (requires Supabase)

### 10.4 "How You Compare" Insights
**Description:** Personalized stats page showing: percentile rank (you scored better than 68% of players), strengths ("you excel at precision puzzles"), patterns ("you solve faster on Wednesdays"), and trends ("your average score has improved 15% this month").
- **Effort:** L (historical data analysis, percentile calculations, pattern detection, insights UI)
- **Impact:** Medium-High (deep personalization, retention through self-discovery)
- **Timing:** Long-term

### 10.5 End-of-Year Wrapped
**Description:** Annual summary inspired by Spotify Wrapped. "In 2026, you solved 247 puzzles, your longest streak was 43 days, your best score was 1,480, your most-used placement strategy was 'center-high.'" Shareable as a generated image.
- **Effort:** M (annual aggregation, image generation, share flow)
- **Impact:** High (massive viral potential, emotional connection, year-end engagement)
- **Timing:** Long-term (requires 6+ months of data)

### 10.6 Chain Reaction Diagram
**Description:** After each puzzle, show a visual graph of the chain reaction: which object hit which, in what order, with collision forces. A "physics family tree" of the chain reaction. Both educational and satisfying to review.
- **Effort:** M (collision event logging, graph rendering, interactive diagram UI)
- **Impact:** Medium (appeals to analytical players, unique feature)
- **Timing:** Post-launch

---

## Research Sources

- [The Incredible Machine](https://classicreload.com/dosx-the-incredible-machine.html) -- foundational Rube Goldberg puzzle game with springs, fans, pulleys, and explosives
- [Crazy Machines (Wikipedia)](https://en.wikipedia.org/wiki/Crazy_Machines) -- 200+ object types including electricity, weather, and explosives
- [Top Rube Goldberg games on itch.io](https://itch.io/games/tag-rube-goldberg) -- indie chain reaction games for mechanic inspiration
- [Gadgeteer (Steam)](https://store.steampowered.com/app/746560/Gadgeteer/) -- VR chain reaction puzzle game
- [Best Physics Puzzle Games (Glitchwave)](https://glitchwave.com/charts/top/game/all-time/g:physics-puzzle/) -- genre overview
- [Daily Puzzle Game Recommendations (Room Escape Artist)](https://roomescapeartist.com/2025/09/06/daily-puzzle-game-recommendations-guide/) -- daily puzzle game landscape
- [Gamification Boosts Engagement by 22% (Storyly)](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement) -- retention mechanics research
- [Social Features Players Expect (FoxAdvert)](https://foxadvert.com/en/digital-marketing-blog/mobile-gaming-in-2025-the-social-features-players-expect/) -- 70% higher satisfaction with social features
- [AbleGamers Colorblind Accessibility Guide](https://ablegamers.org/unlockingaccessibilitypuzzlegames/) -- shape+color pairing best practices
- [Colorblind-Friendly Game Design (Chris Fairfield)](https://chrisfairfield.com/unlocking-colorblind-friendly-game-design/) -- symbol-per-color approach
- [Daily Missions and Rewards in Puzzle Games (Gamigion)](https://www.gamigion.com/daily-missions-and-rewards-in-puzzle-games/) -- appointment mechanic research
- [How Game Design Impacts Retention (Badge Unlock)](https://www.badgeunlock.com/2025/12/03/how-game-design-impacts-player-engagement-and-drives-long-term-retention/) -- progression systems
- [Word Game Market Statistics 2026 (Crosswordle)](https://crosswordle.com/blog/word-game-state-of-play-2025) -- daily game market context
- [25 Best Wordle Alternatives (Crosswordle)](https://crosswordle.com/blog/wordle-alternatives) -- competitive landscape
- [Belt Conve-meow (App Store)](https://apps.apple.com/us/app/physics-puzzle-belt-conve-meow/id6503638973) -- conveyor belt puzzle mechanics
- [2025 Video Game Accessibility Recap (Access-Ability)](https://access-ability.uk/2025/12/05/2025-video-game-accessibility-recap/) -- accessibility trends

---

**Last Updated:** 2026-03-26
