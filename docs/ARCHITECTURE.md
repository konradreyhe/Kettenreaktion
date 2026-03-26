# Architecture

## Overview

Kettenreaktion follows **Clean/Hexagonal Architecture** principles (per PRINCIPLES.md). Business logic is independent of the game framework, UI, and infrastructure.

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│              PRESENTATION                    │
│  Scenes (Boot, Menu, Game, Result, HowTo)   │
│  HUD, Modal, Streak UI                      │
├─────────────────────────────────────────────┤
│              APPLICATION                     │
│  PhysicsManager, ChainDetector,             │
│  ScoreCalculator, LevelLoader,              │
│  ReplayRecorder                             │
├─────────────────────────────────────────────┤
│              DOMAIN                          │
│  Types (Level, GameObject, GameState)        │
│  Constants (Physics, Game)                   │
│  Interfaces (Repository contracts)           │
├─────────────────────────────────────────────┤
│              INFRASTRUCTURE                  │
│  DailySystem, StorageManager,               │
│  ShareManager, Supabase client              │
└─────────────────────────────────────────────┘
```

**Dependency rule:** Each layer only depends on the layer below it. Never upward.

## Module Responsibilities (SRP)

| Module | Single Responsibility |
|--------|----------------------|
| `BootScene` | Asset preloading only |
| `MenuScene` | Start screen UI and navigation |
| `GameScene` | Orchestrate gameplay loop (delegates to services) |
| `ResultScene` | Display results, sharing, countdown |
| `HowToScene` | Tutorial/instructions display |
| `LevelLoader` | Parse JSON into Phaser/Matter.js objects |
| `PhysicsManager` | Create/destroy/manage Matter.js bodies |
| `ChainDetector` | Track collision events, count chain length |
| `ScoreCalculator` | Compute score from game results |
| `ReplayRecorder` | Capture frames, generate GIF |
| `DailySystem` | Date seed, puzzle number, UTC reset |
| `StorageManager` | localStorage read/write (single source) |
| `ShareManager` | Generate share text, invoke share APIs |

## Data Flow

```
User Input (click/tap in placement zone)
    │
    ▼
GameScene.placeObject()
    │
    ▼
PhysicsManager.createBody() ──► Matter.js simulation runs
    │
    ▼
ChainDetector.onCollision() ◄── Matter.js collision events
    │
    ▼
ScoreCalculator.calculate(targets, chain, attempts)
    │
    ▼
ResultScene.show(score, chain, streak)
    │
    ▼
ShareManager.generateEmojiResult() ──► Clipboard / Web Share API
StorageManager.save() ──► localStorage
```

## Composition Pattern (No Inheritance)

Per PRINCIPLES.md: **Composition > Inheritance**.

```typescript
// GameScene composes services — does NOT extend a "BaseGameScene"
class GameScene extends Phaser.Scene {
  private physicsManager: PhysicsManager;    // has-a
  private chainDetector: ChainDetector;      // has-a
  private scoreCalculator: ScoreCalculator;  // has-a
  private replayRecorder: ReplayRecorder;    // has-a
}
```

Services are injected/created in `create()`, not inherited.

## State Management

Game state flows through a simple, explicit pipeline — no global state store.

| State | Owner | Storage |
|-------|-------|---------|
| Current level data | `GameScene` (in-memory) | Loaded from JSON per session |
| Physics bodies | `PhysicsManager` (in-memory) | Created/destroyed per attempt |
| Attempt count | `GameScene` (in-memory) | Reset per puzzle |
| Streak, history | `StorageManager` | localStorage (`kettenreaktion_v1`) |
| Daily seed | `DailySystem` | Computed (deterministic, not stored) |
| Leaderboard | Supabase (Phase 2) | Remote DB |

## Key Design Decisions

### Why Phaser 3 + Matter.js (not custom engine)?
- Phaser has native Matter.js integration — no glue code
- Largest community = best docs + most LLM training data
- Sufficient for 20-60 physics bodies (our max)

### Why localStorage first, Supabase later?
- **YAGNI:** MVP needs zero backend. Streak + history work offline.
- Supabase added in Phase 2 only when leaderboard is needed.
- Anonymous UUID — no auth system needed.

### Why JSON level format (not code)?
- Levels are data, not logic — clean separation
- AI can generate levels from a schema prompt
- Seed variations allow one template to produce many daily puzzles
- Headless validation possible without running the game

### Why fixed timestep?
- **Determinism:** All players see identical physics for the same puzzle
- `matter.world.setFPS(60)` + `fixedDelta: 16.666ms`
- No `Math.random()` in physics code — seed-based only

## Boundaries and Contracts

```
Scene ←→ Service:    TypeScript interfaces in src/types/
Service ←→ Storage:  GameStorage interface (src/types/GameState.ts)
Service ←→ Level:    Level interface (src/types/Level.ts)
Game ←→ Browser:     Web Share API, Clipboard API, localStorage
Game ←→ Supabase:    REST API via @supabase/supabase-js (Phase 2)
```

## Performance Constraints

| Platform | Max Bodies | Target FPS | Max Load Time |
|----------|-----------|------------|---------------|
| Desktop | 60 | 60 | < 2s |
| Mobile | 30 | 60 | < 3s (4G) |

Enforced via `enableSleeping: true`, simple shapes only on mobile, texture atlas for reduced draw calls.

---
**Last Updated:** 2026-03-26
