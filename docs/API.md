# API Reference

## Internal APIs (Module Contracts)

### Level JSON Schema

```typescript
interface Level {
  id: string;                    // e.g., "template_001"
  name: string;                  // e.g., "Der erste Dominostein"
  difficulty: 1 | 2 | 3 | 4 | 5;
  theme: 'wood' | 'stone' | 'metal';
  world: { width: number; height: number };
  placementZone: {
    x: number; y: number;
    width: number; height: number;
    allowedObjects: ObjectType[];
  };
  staticObjects: StaticObject[];
  dynamicObjects: DynamicObject[];
  targets: Target[];
  seed_variations?: Record<string, { min: number; max: number }>;
}

type ObjectType = 'ball' | 'domino' | 'crate' | 'weight' |
                  'platform' | 'ramp_30' | 'ramp_45' | 'ramp_60';

interface StaticObject {
  type: 'platform' | 'ramp';
  x: number; y: number;
  width: number; height?: number;
  angle?: number;
}

interface DynamicObject {
  id: string;
  type: ObjectType;
  x: number; y: number;
}

interface Target {
  id: string;
  type: 'star' | 'bell';
  x: number; y: number;
  points: number;
}
```

### GameStorage Schema (localStorage)

```typescript
interface GameStorage {
  streak: number;
  lastPlayedDate: string;         // ISO date "2026-03-26"
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  puzzleHistory: Record<number, PuzzleResult>;
}

interface PuzzleResult {
  score: number;
  attempts: number;
  solved: boolean;
  date: string;
}
```

Key: `kettenreaktion_v1`

### Score Calculation

```typescript
interface ScoreParams {
  targetsHit: number;
  totalTargets: number;
  chainLength: number;
  attempts: number;        // 1-3
  seconds: number;         // simulation time
}

interface ScoreResult {
  total: number;
  baseScore: number;       // targetsHit * 100
  chainBonus: number;      // chainLength * 50
  efficiencyBonus: number; // max(0, (3 - attempts)) * 200
  timeBonus: number;       // max(0, 30 - seconds) * 10
}
```

### Share Format

```
Kettenreaktion #<puzzleNumber>
Versuche: <attempts>/3  |  Score: <score>
Streak: <streak> Tage
kettenpuzzle.com
```

---

## External APIs

### Supabase (Phase 2 — NOT MVP)

**Table: `daily_scores`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated |
| puzzle_number | integer | From DailySystem |
| player_id | uuid | Anonymous, from localStorage |
| score | integer | Validated server-side |
| attempts | integer | 1-3 |
| country | text | Optional, from IP geolocation |
| created_at | timestamptz | Auto |

**Operations:**

```typescript
// Submit score (after puzzle completion)
POST /rest/v1/daily_scores
Body: { puzzle_number, player_id, score, attempts }

// Get today's leaderboard
GET /rest/v1/daily_scores?puzzle_number=eq.<num>&order=score.desc&limit=10

// Get player's rank
GET /rest/v1/rpc/get_player_rank
Body: { p_puzzle_number, p_player_id }
```

**Security (per PRINCIPLES.md):**
- Row Level Security (RLS) enabled
- Players can only INSERT their own scores
- Players can only READ leaderboard (no updates/deletes)
- Rate limit: max 3 submissions per puzzle per player
- Input validation: score range 0-2000, attempts 1-3

### Web Share API (Browser)

```typescript
// Mobile share
navigator.share({ text: shareText, url: 'https://kettenpuzzle.com' });

// Desktop fallback
navigator.clipboard.writeText(shareText);
```

### Clipboard API (Browser)

```typescript
navigator.clipboard.writeText(text): Promise<void>
```

---

## Physics Constants API

```typescript
const PHYSICS = {
  GRAVITY_Y: 1.0,
  BALL:    { friction: 0.01, frictionAir: 0.01, restitution: 0.7,  density: 0.001 },
  DOMINO:  { friction: 0.4,  frictionAir: 0.01, restitution: 0.05, density: 0.002 },
  CRATE:   { friction: 0.6,  frictionAir: 0.01, restitution: 0.2,  density: 0.003 },
  WEIGHT:  { friction: 0.3,  frictionAir: 0.01, restitution: 0.1,  density: 0.005 },
  STATIC:  { isStatic: true, friction: 0.5, restitution: 0.1 },
  SLEEP_THRESHOLD: 60,
  MAX_BODIES_MOBILE: 30,
  MAX_BODIES_DESKTOP: 60,
  FIXED_DELTA: 16.666,
};
```

---
**Last Updated:** 2026-03-26
