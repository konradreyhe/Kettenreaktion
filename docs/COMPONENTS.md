# Components

## Phaser Scenes

### BootScene
**Responsibility:** Asset preloading only.
- Loads all sprites, audio, fonts via `this.load.*`
- Shows loading bar
- Transitions to `MenuScene` on complete
- No game logic here

### MenuScene
**Responsibility:** Start screen UI and navigation.
- Animated title
- Play button -> `GameScene`
- How-To button -> `HowToScene`
- Streak display (from `StorageManager`)
- Puzzle number display

### GameScene
**Responsibility:** Orchestrate gameplay loop.
- Composes: `PhysicsManager`, `ChainDetector`, `ScoreCalculator`, `ReplayRecorder`
- Manages placement input (pointer events)
- Shows preview ghost in placement zone
- Runs physics simulation on placement confirm
- Tracks attempts (max 3)
- Transitions to `ResultScene` with score data

### ResultScene
**Responsibility:** Display results and sharing.
- Score breakdown: base + chain bonus + efficiency + time
- Streak display
- Share button (emoji text via `ShareManager`)
- GIF share button (Phase 2)
- Countdown timer to next puzzle (UTC midnight)
- Play again button (if attempts remaining)

### HowToScene
**Responsibility:** Tutorial/instructions.
- Visual step-by-step: place -> simulate -> score -> share
- Back button to `MenuScene`

---

## Game Services

### PhysicsManager
**Responsibility:** Create and manage Matter.js bodies.
```typescript
// Public API
createBody(type: ObjectType, x: number, y: number, options?: BodyOptions): MatterBody
destroyBody(body: MatterBody): void
buildLevel(level: Level): void
clearLevel(): void
```
- Single source of truth for physics body creation
- Applies constants from `constants/Physics.ts`
- Handles mobile vs desktop body limits
- Cleans up all bodies on level clear

### ChainDetector
**Responsibility:** Track chain reactions via collision events.
```typescript
// Public API
onCollision(event: Matter.IEventCollision): void
getChainLength(): number
reset(): void
```
- Subscribes to Matter.js collision events
- Chain timeout: 2000ms between impacts
- Only counts dynamic-to-dynamic collisions

### ScoreCalculator
**Responsibility:** Compute final score.
```typescript
// Public API
calculate(params: ScoreParams): ScoreResult
// ScoreParams: { targetsHit, totalTargets, chainLength, attempts, seconds }
// ScoreResult: { total, baseScore, chainBonus, efficiencyBonus, timeBonus }
```
- Pure function, no side effects
- All formulas use named constants

### LevelLoader
**Responsibility:** Parse level JSON into game objects.
```typescript
// Public API
load(seed: number): Level
loadFromJSON(json: LevelJSON): Level
```
- Reads from `assets/levels/templates/`
- Applies seed variations for daily uniqueness
- Validates level structure before returning

### ReplayRecorder (Phase 2)
**Responsibility:** Capture gameplay frames, generate GIF.
```typescript
// Public API
startRecording(canvas: HTMLCanvasElement): void
captureFrame(): void
generateGIF(): Promise<Blob>
```
- Uses gif.js with Web Worker
- Max 2s GIF, quality 10
- Fallback to screenshot if generation > 3s

---

## System Services

### DailySystem
**Responsibility:** Deterministic daily puzzle selection.
```typescript
// Public API (all static)
getTodaysSeed(): number       // UTC date as integer
getLevelIndex(seed, total): number  // Deterministic level pick
getPuzzleNumber(): number     // Days since launch
```
- UTC-based, no timezone issues
- Deterministic: same seed = same level worldwide
- No `Math.random()` — uses sin-based hash

### StorageManager
**Responsibility:** localStorage persistence.
```typescript
// Public API (all static)
save(data: Partial<GameStorage>): void
load(): GameStorage
getStreak(): number
recordPuzzle(puzzleNum: number, result: PuzzleResult): void
```
- Single localStorage key: `kettenreaktion_v1`
- Schema: streak, lastPlayedDate, totalScore, gamesPlayed, bestScore, puzzleHistory
- Merge-on-save pattern (read -> merge -> write)

### ShareManager
**Responsibility:** Generate share content and invoke share APIs.
```typescript
// Public API (all static)
generateEmojiResult(params: ShareParams): string
share(text: string): Promise<void>
```
- Web Share API on mobile (native share sheet)
- Clipboard API fallback on desktop
- No external dependencies

---

## UI Components

### HUD
- Score display (updates during simulation)
- Attempt counter (e.g., "2/3")
- Chain length indicator (grows during chain reaction)
- Positioned: top of screen, non-intrusive

### Modal
- Generic popup for messages
- Semi-transparent backdrop
- Close on tap/click outside
- Used for: "Knapp!" near-miss, streak milestone, first-time tutorial

### Streak
- Visual streak counter (flame icon + number)
- Appears on MenuScene and ResultScene
- Animates on increment

---

## Asset Manifest (Kenney CC0)

| Category | Package | Key Assets |
|----------|---------|------------|
| Physics sprites | Physics Assets Pack | ballGrey, elementWood_*, boxCrate, discus, elementGround_*, elementSlope_* |
| Icons | Game Icons | star_gold, bell |
| UI | UI Pack | blue_button00, panel_blue |
| Audio (collision) | Impact Sounds | impactWood_medium_000, impactStone_medium_000 |
| Audio (UI) | Interface Sounds | confirmation_001 |
| Audio (target) | Interface Sounds | jingles_PIZZA12 |
| Particles | Particle Pack | Explosions, sparks |

---
**Last Updated:** 2026-03-26
