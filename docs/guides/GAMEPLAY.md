# Gameplay Mechanics Deep-Dive

## Physics Engine Configuration

### Matter.js via Phaser 3
```typescript
physics: {
  default: 'matter',
  matter: {
    gravity: { y: 1.0 },
    enableSleeping: true,
    debug: false,              // true only in dev
    positionIterations: 6,
    velocityIterations: 4,
    constraintIterations: 2,
  }
}
```

### Determinism
All players must see identical physics for the same puzzle:
- **Fixed timestep:** `16.666ms` (60 FPS lock)
- **No `Math.random()`** in physics code — all randomness from daily seed
- **Sleep threshold:** 60 frames of inactivity before body sleeps
- **Validation:** Run level 100x headless, standard deviation < 5%

## Object Properties

### Ball
- Use case: Rolling, bouncing, triggering chain reactions
- Physics: `friction: 0.01, frictionAir: 0.01, restitution: 0.7, density: 0.001`
- Behavior: Rolls easily, bounces high, lightweight

### Domino
- Use case: Classic chain reaction element
- Physics: `friction: 0.4, frictionAir: 0.01, restitution: 0.05, density: 0.002`
- Behavior: Stands upright, tips when hit, low bounce

### Crate (Holzkiste)
- Use case: Obstacle, weight, platform creation
- Physics: `friction: 0.6, frictionAir: 0.01, restitution: 0.2, density: 0.003`
- Behavior: Heavy, grippy, moderate bounce

### Weight (Schweres Gewicht)
- Use case: Hammering, crushing, triggering seesaws
- Physics: `friction: 0.3, frictionAir: 0.01, restitution: 0.1, density: 0.005`
- Behavior: Very heavy, barely bounces

### Static Objects
- Platform: `isStatic: true, friction: 0.5, restitution: 0.1`
- Ramp: Same properties + angle (30/45/60 degrees)
- Cannot be moved by any force

## Chain Reaction Detection

### Algorithm
```
1. Subscribe to Matter.js collision events
2. On each dynamic-to-dynamic collision:
   a. Check time since last collision
   b. If < 2000ms: increment chain length
   c. If >= 2000ms: reset chain to 1
3. Chain length = longest unbroken sequence
```

### What Counts as a Chain Link
- Dynamic body hits another dynamic body
- Static collisions do NOT count (ball hitting a ramp is not a chain link)
- Same pair colliding again within 100ms is deduplicated

### Near-Miss Detection
- After simulation ends, check distance from each dynamic body to each unhit target
- If distance < 5px: trigger "Knapp!" (near-miss) animation
- Purely visual feedback, no score impact

## Placement System

### Placement Zone
- Rendered as a highlighted rectangle with dashed border
- Player's pointer/finger shows a **ghost preview** of the object
- Ghost snaps to valid positions within the zone
- Click/tap confirms placement

### Placement Rules
- Object must be fully within the placement zone bounds
- Only `allowedObjects` types can be placed (defined per level)
- Once placed, cannot be moved (placement is final for that attempt)
- Maximum 1 object per attempt

## Simulation Flow

```
1. Player confirms placement
2. Input disabled (isSimulating = true)
3. Physics simulation runs
4. ChainDetector tracks collisions in real-time
5. HUD updates chain length live
6. Simulation ends when:
   a. All bodies sleeping (no movement) OR
   b. 8 second timeout reached
7. Score calculated
8. Result shown (or attempt counter incremented)
```

### Simulation Timeout
- Max duration: 8 seconds
- If bodies still moving at 8s: force-end, score based on current state
- Prevents infinite loops (e.g., ball bouncing forever)

## Attempt System

| Attempt | State |
|---------|-------|
| 1st | Player places, simulation runs, sees result |
| 2nd | Level resets to initial state, player tries again with knowledge |
| 3rd | Final attempt, result is permanent for the day |

- After 3rd attempt (or if all targets hit earlier): transition to ResultScene
- Best score of all attempts is the daily score
- Cannot replay after 3 attempts until UTC midnight

## Seed Variation System

Each level template defines `seed_variations`:
```json
"seed_variations": {
  "domino_x_offset": { "min": -20, "max": 20 },
  "ramp_angle_offset": { "min": -5, "max": 5 }
}
```

The daily seed deterministically selects offsets within these ranges, making the same template play differently each day while remaining solvable (validated by LevelValidator).

## Mobile vs Desktop

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Input | Mouse hover + click | Touch + tap |
| Max bodies | 60 | 30 |
| Shapes | All | Simple only (rectangles, circles) |
| Preview | Follows mouse | Follows finger (offset above touch point) |
| Audio | Auto-play after first interaction | AudioContext on first gesture |

## Performance Budget

| Metric | Target |
|--------|--------|
| FPS | Stable 60 on target devices |
| Physics bodies | Max 60 (desktop) / 30 (mobile) |
| Load time | < 2s desktop, < 3s mobile (4G) |
| Bundle size | Phaser chunk ~1MB, game code < 200KB |
| Asset loading | Texture atlas, lazy audio |

---
**Last Updated:** 2026-03-26
