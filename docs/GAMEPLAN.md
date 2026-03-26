# Game Plan

> Source of truth for WHAT we build. For HOW we build, see [PRINCIPLES.md](../PRINCIPLES.md).

## Core Loop

```
Open game → See today's puzzle → Place ONE object in the zone →
Watch chain reaction → See score → Share result → Come back tomorrow
```

**The moment the chain reaction starts and dominoes fall must feel SATISFYING. Everything else is secondary.**

## Game Mechanics

### One Puzzle Per Day
- Same puzzle for all players worldwide (UTC date as seed)
- 3 attempts per puzzle (enough to learn, not enough for brute-force)
- UTC 00:00 reset
- Puzzle number increments from launch date (August 1, 2026)

### Level Anatomy
Every level has exactly three elements:

1. **Setup Objects** — Static and pre-placed dynamic objects. Player cannot move them.
2. **Placement Zone** — Highlighted area where the player places their object.
3. **Targets** — Stars/bells that must be hit by the chain reaction.

### Player Actions
1. Move cursor/finger within placement zone (preview ghost shown)
2. Click/tap to confirm placement
3. Watch physics simulation (3-8 seconds)
4. See result: targets hit, chain length, score

### Object Types

**MVP (Phase 1) — only these:**

| Object | Type | Key Properties |
|--------|------|---------------|
| Ball | Dynamic | Low friction, high bounce |
| Domino | Dynamic | High friction, low bounce |
| Crate | Dynamic | High friction, medium bounce |
| Weight | Dynamic | Very heavy, low bounce |
| Platform | Static | Immovable surface |
| Ramp (30/45/60) | Static | Angled surface |

**Phase 2 — add when core is proven:**

| Object | Type | Notes |
|--------|------|-------|
| Seesaw | Constraint | Pivot + two bodies |
| Spring | Constraint | Bounce launcher |

**Phase 3 — add if engagement warrants:**

| Object | Type | Notes |
|--------|------|-------|
| Rope/Chain | Composite | Matter.Composites.chain() |
| Magnet | Special | applyForce() in update loop |
| Bomb | Special | Explosion radius + force |
| Portal | Special | Teleport body to exit portal |

> **YAGNI:** Phase 2/3 objects are documented for vision, NOT for implementation now.

## Scoring

```
Base Score       = (Targets hit) x 100
Chain Bonus      = (Chain length) x 50
Efficiency Bonus = max(0, (3 - attempts used)) x 200
Time Bonus       = max(0, 30 - seconds) x 10

Max per level: ~1,500 points
```

## Streak System
- Consecutive days played (not necessarily solved)
- Stored in localStorage
- Displayed on menu and result screens
- Lost if a day is skipped

## Sharing

After solving (or failing), the player can share:

```
Kettenreaktion #42
Versuche: 2/3  |  Score: 1.240
Streak: 7 Tage
kettenpuzzle.com
```

- Mobile: Web Share API (native share sheet)
- Desktop: Copy to clipboard
- Phase 2: GIF replay of best attempt

## Level Design

### Template Categories

| Category | Difficulty | Count (Launch) |
|----------|-----------|----------------|
| Domino Chains | 1-2 | 25 |
| Rube Goldberg | 2-3 | 25 |
| Precision Physics | 3-4 | 20 |
| Special Objects | 4-5 | 20 (Phase 2) |

**Launch requirement:** 90 templates minimum (3 months of daily puzzles).

### Daily Difficulty Curve
- Monday: Easy (difficulty 1-2)
- Tuesday-Thursday: Medium (difficulty 2-3)
- Friday: Hard (difficulty 3-4)
- Saturday: Medium (difficulty 2-3)
- Sunday: Special challenge (difficulty 4-5, Phase 2)

### Level JSON Format
Defined in `src/types/Level.ts`. Key fields:
- `id`, `name`, `difficulty`, `theme`
- `placementZone` (position, size, allowed objects)
- `staticObjects`, `dynamicObjects`, `targets`
- `seed_variations` (per-field min/max offsets for daily variety)

### Validation Rule
A level is valid if >10% of 100 random placements within the zone hit at least one target. Enforced by `LevelValidator.ts`.

## Visual Style
- Kenney asset packs (CC0) — physics sprites, UI elements, icons, particles
- Background: `#1a1a2e` (dark blue)
- Font: "Press Start 2P" (Google Font, hosted locally)
- Retro-casual feel, clean UI, satisfying particle effects on hits

## Audio
- Collision sounds: Kenney Impact Sounds (wood, stone, metal)
- Target hit: Jingle sound
- Chain reaction escalation: Rising confirmation sounds
- UI: Kenney Interface Sounds (clicks, hovers)
- iOS Safari: AudioContext activated on first user gesture

## Feedback Systems

| Feature | Purpose |
|---------|---------|
| Preview Ghost | Shows object before placement |
| Fast-Miss indicator | "Knapp!" when ball passes within 5px of target |
| Chain visualization | Real-time chain length counter during simulation |
| Replay (Phase 2) | Best attempt saved as GIF |

## Pivot Criteria

| Timeframe | Signal | Action |
|-----------|--------|--------|
| 4 weeks beta | < 20% daily return rate | Rethink core mechanic |
| 2 weeks live | > 80% bounce in 30s | Improve onboarding |
| 1 month live | < 100 DAU despite marketing | Evaluate pivot options |

**Pivot options:**
1. Multi-placement instead of one (more freedom, less daily constraint)
2. Endless mode alongside daily puzzle

---
**Last Updated:** 2026-03-26
