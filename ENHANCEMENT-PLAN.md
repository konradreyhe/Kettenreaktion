# Kettenreaktion — Comprehensive Enhancement Plan

Below is the complete, detailed implementation plan covering all six phases. Every item includes what it is, why it matters, which files to create or modify, technical approach with specific APIs and methods, dependencies, complexity, and pseudo-code where helpful.

---

## Table of Contents

- Phase 1: Visual Polish (Phaser FX Pipeline)
- Phase 2: Physics Expansion (Matter.js Constraints)
- Phase 3: Procedural Music System
- Phase 4: Zen Mode
- Phase 5: Social and Engagement
- Phase 6: Content and Quality of Life
- Appendix A: Shared Infrastructure Changes
- Appendix B: Testing Strategy Summary

---

## Phase 1: Visual Polish (Phaser FX Pipeline)

### 1.1 Bloom on Star Targets (Pulsing Glow Before Hit)

**What:** Replace the current manual `Phaser.GameObjects.Arc` glow circle on star targets with a proper Phaser PostFX bloom effect that pulses in intensity.

**Why:** The current glow (line 582-596 of GameScene.ts) is a flat circle tween. Real bloom creates light bleed around the edges of the star sprite, making targets feel luminous and valuable. This is the single most impactful visual upgrade because targets are the player's primary focus.

**Files to modify:**
- `src/scenes/GameScene.ts` -- setupLevel() target creation section (lines 581-650)

**Technical approach:**
Phaser 3.60+ includes a built-in PostFX pipeline. Each `Phaser.GameObjects.Sprite` has access to `sprite.postFX.addBloom()`. The bloom effect accepts: `color` (hex), `offsetX`, `offsetY`, `blurStrength`, `strength`, `glowColor`.

```typescript
// Pseudo-code: Replace current target glow in setupLevel()
const sprite = this.add.sprite(target.x, target.y, 'star').setDisplaySize(26, 26).setDepth(15);

// Add bloom PostFX
const bloom = sprite.postFX.addBloom(0xffdd00, 0, 0, 1, 1.2, 0xffdd00);

// Pulse the bloom strength with a tween
this.tweens.add({
  targets: bloom,
  strength: { from: 0.8, to: 1.8 },
  blurStrength: { from: 0.8, to: 1.5 },
  duration: 700,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
});
```

**Important consideration:** The Phaser PostFX pipeline requires `Phaser.AUTO` or `Phaser.WEBGL` renderer. The current config in `main.ts` uses `Phaser.AUTO`, which falls back to Canvas on very old browsers. PostFX effects silently degrade to no-op on Canvas, so no explicit fallback code is needed. However, the existing manual glow circle should remain as a secondary visual for Canvas-only devices.

**Performance guard:** Bloom uses a full-screen shader pass per bloom instance. With up to 5 targets per level, this is 5 separate bloom passes. Optimization: Only add bloom PostFX if `this.renderer.type === Phaser.WEBGL`. On Canvas, keep the existing Arc glow.

**Dependencies:** None -- built into Phaser 3.60+, and the project uses 3.90.0.

**Complexity:** S

**Accessibility:** The bloom does not change game information. `prefersReducedMotion()` should disable the tween (static bloom is fine).

**Rollback:** Remove `postFX.addBloom()` calls. The existing Arc glow remains as fallback.

---

### 1.2 Glow on Placed Object During Simulation

**What:** Add a PostFX glow to the player's placed sprite during physics simulation, replacing the current cyan `setTint(0x88ccff)` + manual circle glow in PhysicsManager.createPlayerObject().

**Why:** The current approach (lines 76-105 of PhysicsManager.ts) draws a static circle that follows the body. A PostFX glow moves inherently with the sprite, looks correct when rotating, and creates actual light bleed rather than a flat colored disc.

**Files to modify:**
- `src/game/PhysicsManager.ts` -- createPlayerObject() method

**Technical approach:**
```typescript
// In createPlayerObject, after creating the sprite:
const sprite = this.createDynamicSprite(type, x, y);
sprite.setDepth(15);

// Replace setTint + manual glow with PostFX
if (this.scene.renderer.type === Phaser.WEBGL) {
  sprite.postFX.addGlow(0x44aaff, 4, 0, false, 0.15, 16);
} else {
  // Canvas fallback: keep existing tint approach
  sprite.setTint(0x88ccff);
}
```

Remove the manual glow circle creation, the `updateFn` event listener, and the `glowCleanups` array entries for this glow. This eliminates the per-frame position sync overhead.

**Dependencies:** None.

**Complexity:** S

**Rollback:** Revert to previous tint + circle approach.

---

### 1.3 Vignette Intensifying During Chain Reactions

**What:** Make the existing vignette darken and color-shift as the chain length increases, creating a cinematic narrowing-focus effect.

**Why:** The current vignette (drawVignette(), lines 445-464 of GameScene.ts) is static at alpha 0.4. During chain reactions, the game already shifts background color (lines 342-348). An intensifying vignette amplifies the "tunnel vision" feeling of an escalating chain.

**Files to modify:**
- `src/scenes/GameScene.ts` -- update() method, drawVignette() method

**Technical approach:**
The vignette is a `Phaser.GameObjects.Graphics` at depth 90 with alpha 0.4. During update(), when chain >= 2, tween the vignette alpha based on chain length:

```typescript
// In update(), after the background color shift block (line 348):
if (this.vignette) {
  const vignetteAlpha = 0.4 + Math.min(0.35, chain * 0.025);
  this.vignette.setAlpha(vignetteAlpha);
}
```

Reset in endSimulation():
```typescript
if (this.vignette) {
  this.tweens.add({ targets: this.vignette, alpha: 0.4, duration: 500 });
}
```

**Alternative (PostFX Vignette):** Phaser 3.60+ has `camera.postFX.addVignette(x, y, radius, strength)`. This is cleaner than the manual graphics approach. However, replacing the existing manual vignette is a bigger change. Recommendation: Keep the manual vignette for now but add alpha modulation. Phase out to PostFX vignette in a future cleanup pass.

**Dependencies:** None.

**Complexity:** S

**Accessibility:** `prefersReducedMotion()` should skip the vignette intensity change (keep static at 0.4).

---

### 1.4 Bokeh Slow-Mo on Final Target Hit

**What:** When the last target in a level is hit, apply a depth-of-field bokeh blur effect combined with the existing slow-motion, creating a dramatic freeze-frame moment.

**Why:** The celebrateAllTargets() method (lines 960-1034) already does slow-mo, rings, and particles. Adding a radial bokeh blur makes it feel like a cinematic "everything else fades, just the moment matters" shot. This is the peak emotional moment of the game.

**Files to modify:**
- `src/scenes/GameScene.ts` -- celebrateAllTargets() method
- `src/game/CameraFX.ts` -- add bokeh method

**Technical approach:**
Phaser 3.60+ supports `camera.postFX.addBokeh(radius, amount, contrast)`. Add a `bokeh()` method to CameraFX:

```typescript
// CameraFX.ts -- new method
bokeh(radius: number = 0.5, amount: number = 1.0, durationMs: number = 800): void {
  const cam = this.scene.cameras.main;
  if (this.scene.renderer.type !== Phaser.WEBGL) return;
  
  const fx = cam.postFX.addBokeh(radius, amount, 0.3);
  
  // Tween amount up for dramatic effect, then remove
  this.scene.tweens.add({
    targets: fx,
    amount: { from: 0, to: amount },
    duration: 300,
    ease: 'Quad.easeIn',
  });
  
  this.scene.time.delayedCall(durationMs, () => {
    this.scene.tweens.add({
      targets: fx,
      amount: 0,
      duration: 400,
      onComplete: () => cam.postFX.remove(fx),
    });
  });
}
```

Then in `celebrateAllTargets()`, after `this.cameraFX.slowMotion(0.15, 800)`:
```typescript
if (!AccessibilityManager.prefersReducedMotion()) {
  this.cameraFX.bokeh(0.5, 1.0, 800);
}
```

**Dependencies:** WebGL renderer.

**Complexity:** M

**Accessibility:** Skip entirely when `prefersReducedMotion()` is true.

**Performance:** Bokeh is a per-pixel shader. Applied only for approximately 1 second during the celebration, so impact is negligible.

---

### 1.5 Shine on Placement Zone

**What:** Add a subtle animated shine/sweep effect across the placement zone to make it visually inviting before the player places their object.

**Why:** The current placement zone (lines 527-558 of GameScene.ts) is a semi-transparent rectangle with a pulsing border. Adding a diagonal light sweep draws the eye and communicates "place here" without text.

**Files to modify:**
- `src/scenes/GameScene.ts` -- setupLevel() after placement zone creation

**Technical approach:**
Create a narrow rectangle (the "shine bar") that moves diagonally across the placement zone using a tween, masked to the zone bounds:

```typescript
// After placing placementZoneRect and placementZoneBorder:
const zone = this.level.placementZone;
const shine = this.add.rectangle(
  zone.x - 30, zone.y + zone.height / 2,
  20, zone.height + 40,
  0xffffff, 0.08
).setDepth(3).setAngle(20);

// Mask to zone bounds
const maskGfx = this.make.graphics();
maskGfx.fillRect(zone.x, zone.y, zone.width, zone.height);
const mask = maskGfx.createGeometryMask();
shine.setMask(mask);

// Sweep animation
this.tweens.add({
  targets: shine,
  x: zone.x + zone.width + 30,
  duration: 2000,
  delay: 500,
  repeat: -1,
  repeatDelay: 3000,
  ease: 'Sine.easeInOut',
});

// Store reference for cleanup (destroy in setupLevel reset)
```

**Dependencies:** None.

**Complexity:** S

**Accessibility:** Skip the animation when `prefersReducedMotion()` is true.

---

### 1.6 ColorMatrix Warm Shift During Chains

**What:** Replace the manual RGB background color shift (lines 342-348 of GameScene.ts) with a Phaser PostFX ColorMatrix on the camera, producing a cinematic warm color grade across all game objects.

**Why:** The current approach only changes the background color. A ColorMatrix applies to everything rendered by the camera -- sprites, particles, UI -- creating a unified warm grade that looks professional. It replaces the manual `setBackgroundColor` with `Phaser.Display.Color.GetColor(r, g, b)` calculation.

**Files to modify:**
- `src/scenes/GameScene.ts` -- update() chain color shift block, endSimulation()
- `src/game/CameraFX.ts` -- add colorShift method

**Technical approach:**
Phaser 3.60+ has `camera.postFX.addColorMatrix()` which returns a `Phaser.FX.ColorMatrix`. The ColorMatrix has methods like `warmth()`, `sepia()`, `brightness()`, `saturate()`.

```typescript
// CameraFX.ts -- new properties and methods
private colorMatrix: Phaser.FX.ColorMatrix | null = null;

warmShift(intensity: number): void {
  const cam = this.scene.cameras.main;
  if (this.scene.renderer.type !== Phaser.WEBGL) return;
  
  if (!this.colorMatrix) {
    this.colorMatrix = cam.postFX.addColorMatrix();
  }
  
  this.colorMatrix.reset();
  if (intensity > 0) {
    // Warm shift: increase red, decrease blue
    this.colorMatrix.brightness(1 + intensity * 0.05);
    this.colorMatrix.saturate(intensity * 0.3);
    // Custom matrix for warmth
    this.colorMatrix.multiply([
      1 + intensity * 0.1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1 - intensity * 0.1, 0, 0,
      0, 0, 0, 1, 0,
    ]);
  }
}

resetColorShift(): void {
  if (this.colorMatrix) {
    this.colorMatrix.reset();
  }
}
```

In GameScene update(), replace lines 342-348:
```typescript
if (chain >= 2) {
  const t = Math.min(1, chain / 15);
  this.cameraFX.warmShift(t);
} else {
  this.cameraFX.resetColorShift();
}
```

In endSimulation(), call `this.cameraFX.resetColorShift()`.

**Dependencies:** WebGL renderer. On Canvas, silently no-op (keep existing background color fallback).

**Complexity:** M

**Accessibility:** This is purely cosmetic. No accessibility concern beyond reduced motion (which is already gating the vignette).

---

### 1.7 Wipe Transitions Between Scenes

**What:** Replace the current `camera.fadeIn/fadeOut` scene transitions with horizontal or radial wipe transitions for a more polished feel.

**Why:** Every scene currently uses `this.cameras.main.fadeIn(300, 26, 26, 46)` / `fadeOut`. A wipe transition feels more game-like and professional. Different scenes can use different wipe directions.

**Files to create:**
- `src/game/SceneTransition.ts` -- reusable transition helper

**Files to modify:**
- `src/scenes/GameScene.ts` -- create() and all scene.start() calls
- `src/scenes/MenuScene.ts` -- same
- `src/scenes/ResultScene.ts` -- same
- `src/scenes/StatsScene.ts` -- same
- `src/scenes/PracticeScene.ts` -- same
- `src/scenes/HowToScene.ts` -- same
- `src/scenes/ReplayScene.ts` -- same

**Technical approach:**
Create a reusable `SceneTransition` utility that draws a full-screen rectangle and tweens it as a mask:

```typescript
// src/game/SceneTransition.ts
export class SceneTransition {
  /** Wipe out: cover screen left-to-right, then start next scene. */
  static wipeOut(
    scene: Phaser.Scene,
    targetScene: string,
    data?: object,
    direction: 'left' | 'right' | 'down' = 'right',
    duration: number = 400,
  ): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const rect = scene.add.rectangle(
      direction === 'right' ? -w : direction === 'left' ? w * 2 : w / 2,
      direction === 'down' ? -h : h / 2,
      w, h, 0x1a1a2e
    ).setDepth(999).setOrigin(0.5);

    const targetProps: Record<string, number> = {};
    if (direction === 'right' || direction === 'left') targetProps.x = w / 2;
    if (direction === 'down') targetProps.y = h / 2;

    scene.tweens.add({
      targets: rect,
      ...targetProps,
      duration,
      ease: 'Quad.easeInOut',
      onComplete: () => scene.scene.start(targetScene, data),
    });
  }

  /** Wipe in: uncover screen (called in create() of target scene). */
  static wipeIn(
    scene: Phaser.Scene,
    direction: 'left' | 'right' | 'up' = 'right',
    duration: number = 400,
  ): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const rect = scene.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e)
      .setDepth(999);

    const targetProps: Record<string, number> = {};
    if (direction === 'right') targetProps.x = w * 2;
    if (direction === 'left') targetProps.x = -w;
    if (direction === 'up') targetProps.y = -h;

    scene.tweens.add({
      targets: rect,
      ...targetProps,
      duration,
      ease: 'Quad.easeInOut',
      onComplete: () => rect.destroy(),
    });
  }
}
```

Then replace fadeIn/fadeOut calls across scenes. Example in MenuScene:
```typescript
// Old: this.cameras.main.fadeIn(300, 26, 26, 46);
SceneTransition.wipeIn(this, 'right', 400);
```

**Dependencies:** None.

**Complexity:** M (touches many files, but each change is trivial)

**Accessibility:** No accessibility concern -- the transition is the same duration as the current fade.

**Rollback:** Revert to fadeIn/fadeOut.

---

### Phase 1 Test Updates

- No new unit tests needed (PostFX effects are visual-only, not testable in Vitest)
- Add manual visual regression checks via Playwright screenshots if Playwright MCP is set up
- Verify WebGL fallback by testing with `?forceCanvas=1` URL parameter (add Canvas renderer forcing in `main.ts` for debugging)

### Phase 1 Performance Considerations

- PostFX bloom on 5 targets = 5 shader passes. On low-end mobile GPUs this could drop frames. Mitigation: Only apply bloom on desktop (check `!this.isTouchDevice()`) or limit to 2 targets maximum.
- ColorMatrix is a single pass -- negligible cost.
- Bokeh is expensive but only active for about 1 second.
- All PostFX silently no-op on Canvas renderer.

---

## Phase 2: Physics Expansion (Matter.js Constraints)

### 2.1 Level Schema Extension

**What:** Extend the `Level` interface in `src/types/Level.ts` to support constraint-based objects: seesaws, springs, and ropes.

**Why:** The current schema only supports static objects (platforms/ramps) and simple dynamic objects (ball/domino/crate/weight). Constraints require pairs of bodies connected by a pivot point, distance, or chain.

**Files to modify:**
- `src/types/Level.ts` -- add constraint types
- `src/constants/Physics.ts` -- add constraint physics defaults

**Technical approach:**

```typescript
// Add to Level.ts:

export type ConstraintType = 'seesaw' | 'spring' | 'rope';

export interface LevelConstraint {
  id: string;
  type: ConstraintType;
  /** Anchor point in world coordinates */
  x: number;
  y: number;
  /** Constraint-specific properties */
  properties: SeesawProps | SpringProps | RopeProps;
}

export interface SeesawProps {
  type: 'seesaw';
  /** Total beam width */
  width: number;
  /** Beam height (thickness) */
  height: number;
  /** Initial angle in degrees */
  angle?: number;
}

export interface SpringProps {
  type: 'spring';
  /** ID of the body this spring connects to (or 'world' for fixed anchor) */
  bodyA: string; // 'world' or a dynamicObject ID
  bodyB: string; // a dynamicObject ID
  /** Rest length in pixels */
  length: number;
  /** Spring stiffness (0-1), default 0.1 */
  stiffness: number;
  /** Damping (0-1), default 0.05 */
  damping?: number;
}

export interface RopeProps {
  type: 'rope';
  /** Anchor body ('world' for fixed) */
  anchorBody: string;
  /** End body (dynamic object ID) */
  endBody: string;
  /** Total rope length */
  length: number;
  /** Number of segments */
  segments: number;
}

// Extend the Level interface:
export interface Level {
  // ... existing fields ...
  constraints?: LevelConstraint[];
}
```

Add to `src/constants/Physics.ts`:
```typescript
export const CONSTRAINT_DEFAULTS = {
  seesaw: { friction: 0.3, density: 0.002, angularStiffness: 0.02 },
  spring: { stiffness: 0.1, damping: 0.05 },
  rope: { segmentRadius: 4, segmentDensity: 0.001, stiffness: 0.8 },
};
```

**Dependencies:** None.

**Complexity:** S

---

### 2.2 PhysicsManager Constraint Creation Methods

**What:** Add methods to PhysicsManager for creating seesaw, spring, and rope constraints using Phaser's Matter.js integration.

**Why:** Per the project's architecture (CLAUDE.md: "Create Matter.js bodies ONLY via PhysicsManager wrapper"), all physics body creation must go through this class.

**Files to modify:**
- `src/game/PhysicsManager.ts` -- add three new creation methods

**Technical approach:**

**Seesaw (Revolute Constraint):**
A seesaw is a rectangular body pinned to a fixed point in the world. In Matter.js this is a "constraint" where `pointA` is the world anchor and `bodyB` is the beam.

```typescript
createSeesaw(x: number, y: number, props: SeesawProps): void {
  const beam = this.scene.matter.add.rectangle(
    x, y, props.width, props.height,
    {
      density: CONSTRAINT_DEFAULTS.seesaw.density,
      friction: CONSTRAINT_DEFAULTS.seesaw.friction,
      label: 'seesaw_beam',
      angle: props.angle ? Phaser.Math.DegToRad(props.angle) : 0,
    }
  );

  // Pin to world at the center point
  this.scene.matter.add.constraint(
    beam as any, // bodyA
    undefined,   // bodyB (world)
    0,           // length (0 = pin joint)
    1,           // stiffness (rigid)
    {
      pointA: { x: 0, y: 0 },    // center of beam
      pointB: { x, y },           // world anchor
    }
  );

  // Visual: beam sprite + pivot marker
  const sprite = this.scene.add
    .rectangle(x, y, props.width, props.height, 0x778899)
    .setDepth(10);

  const pivot = this.scene.add
    .circle(x, y, 5, 0xaabbcc, 0.8)
    .setDepth(11);

  // Sync sprite rotation with body each frame
  this.scene.events.on('update', () => {
    sprite.setPosition(beam.position.x, beam.position.y);
    sprite.setRotation(beam.angle);
  });

  this.tracked.push({ sprite, body: beam });
}
```

**Spring (Distance Constraint with Stiffness):**
```typescript
createSpring(props: SpringProps, bodyMap: Map<string, MatterJS.BodyType>): void {
  const bodyA = props.bodyA === 'world' ? null : bodyMap.get(props.bodyA);
  const bodyB = bodyMap.get(props.bodyB);
  if (!bodyB) return;

  const constraint = this.scene.matter.add.constraint(
    bodyA as any ?? (bodyB as any), // Matter needs a body; use bodyB if world
    bodyB as any,
    props.length,
    props.stiffness,
    {
      damping: props.damping ?? CONSTRAINT_DEFAULTS.spring.damping,
      label: 'spring',
      ...(props.bodyA === 'world'
        ? { pointA: { x: bodyB.position.x, y: bodyB.position.y - props.length } }
        : {}),
    }
  );

  // Visual: draw spring coils in update
  const gfx = this.scene.add.graphics().setDepth(8);
  this.scene.events.on('update', () => {
    this.drawSpringVisual(gfx, constraint);
  });
}

private drawSpringVisual(gfx: Phaser.GameObjects.Graphics, constraint: MatterJS.ConstraintType): void {
  gfx.clear();
  const pA = constraint.pointA; // world or body-relative
  const pB = constraint.pointB;
  const bodyA = constraint.bodyA;
  const bodyB = constraint.bodyB;

  const ax = bodyA ? bodyA.position.x + pA.x : pA.x;
  const ay = bodyA ? bodyA.position.y + pA.y : pA.y;
  const bx = bodyB ? bodyB.position.x + pB.x : pB.x;
  const by = bodyB ? bodyB.position.y + pB.y : pB.y;

  // Draw zigzag coil between points
  const coils = 8;
  const amplitude = 6;
  gfx.lineStyle(2, 0x88aacc, 0.7);
  gfx.beginPath();
  gfx.moveTo(ax, ay);
  for (let i = 1; i <= coils; i++) {
    const t = i / (coils + 1);
    const mx = ax + (bx - ax) * t;
    const my = ay + (by - ay) * t;
    const sign = i % 2 === 0 ? 1 : -1;
    const perpX = -(by - ay);
    const perpY = bx - ax;
    const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    gfx.lineTo(mx + (perpX / len) * amplitude * sign, my + (perpY / len) * amplitude * sign);
  }
  gfx.lineTo(bx, by);
  gfx.strokePath();
}
```

**Rope (Chain of Connected Small Bodies):**
```typescript
createRope(
  anchorX: number, anchorY: number,
  props: RopeProps,
  bodyMap: Map<string, MatterJS.BodyType>,
): void {
  const segLen = props.length / props.segments;
  const r = CONSTRAINT_DEFAULTS.rope.segmentRadius;
  const segments: MatterJS.BodyType[] = [];

  for (let i = 0; i < props.segments; i++) {
    const sx = anchorX;
    const sy = anchorY + i * segLen;
    const seg = this.scene.matter.add.circle(sx, sy, r, {
      density: CONSTRAINT_DEFAULTS.rope.segmentDensity,
      friction: 0.3,
      label: `rope_seg_${i}`,
    });
    segments.push(seg);
  }

  // Connect segments with constraints
  for (let i = 0; i < segments.length; i++) {
    const prevBody = i === 0
      ? (props.anchorBody === 'world' ? null : bodyMap.get(props.anchorBody))
      : segments[i - 1];

    const opts: any = {
      stiffness: CONSTRAINT_DEFAULTS.rope.stiffness,
      length: segLen,
      label: 'rope_link',
    };

    if (i === 0 && props.anchorBody === 'world') {
      opts.pointA = { x: anchorX, y: anchorY };
    }

    this.scene.matter.add.constraint(
      prevBody as any ?? segments[i] as any,
      segments[i] as any,
      segLen,
      CONSTRAINT_DEFAULTS.rope.stiffness,
      opts,
    );
  }

  // Connect end body
  const endBody = bodyMap.get(props.endBody);
  if (endBody && segments.length > 0) {
    this.scene.matter.add.constraint(
      segments[segments.length - 1] as any,
      endBody as any,
      segLen,
      CONSTRAINT_DEFAULTS.rope.stiffness,
    );
  }

  // Visual: draw line through segment centers in update
  const gfx = this.scene.add.graphics().setDepth(8);
  this.scene.events.on('update', () => {
    gfx.clear();
    gfx.lineStyle(2, 0x886644, 0.6);
    gfx.beginPath();
    gfx.moveTo(segments[0].position.x, segments[0].position.y);
    for (let i = 1; i < segments.length; i++) {
      gfx.lineTo(segments[i].position.x, segments[i].position.y);
    }
    gfx.strokePath();
  });

  // Track all segments for cleanup
  for (const seg of segments) {
    this.rawBodies.push(seg);
  }
}
```

**Dependencies:** Level schema extension (2.1).

**Complexity:** L

**Performance:** Ropes add `segments` bodies (typically 6-10) plus constraints. The MAX_BODIES_MOBILE limit (30) must account for these. Cap rope segments at 6 on mobile.

---

### 2.3 buildLevel Integration

**What:** Extend `PhysicsManager.buildLevel()` to process the new `constraints` array from the level schema.

**Files to modify:**
- `src/game/PhysicsManager.ts` -- buildLevel() method

**Technical approach:**
After building static and dynamic objects, create a body map from dynamic object IDs to their Matter bodies, then iterate constraints:

```typescript
buildLevel(level: Level, gravityFlipped = false): void {
  this.clearLevel();
  this.buildFloor(level.world.width, level.world.height, gravityFlipped);
  this.buildWalls(level.world.width, level.world.height);

  for (const obj of level.staticObjects) {
    this.createStaticBody(obj);
  }

  // Build body map for constraint references
  const bodyMap = new Map<string, MatterJS.BodyType>();
  for (const obj of level.dynamicObjects) {
    if (this.tracked.length >= this.maxBodies) break;
    const sprite = this.createDynamicSprite(obj.type, obj.x, obj.y);
    bodyMap.set(obj.id, sprite.body as MatterJS.BodyType);
  }

  // Process constraints
  if (level.constraints) {
    for (const c of level.constraints) {
      switch (c.properties.type) {
        case 'seesaw':
          this.createSeesaw(c.x, c.y, c.properties);
          break;
        case 'spring':
          this.createSpring(c.properties, bodyMap);
          break;
        case 'rope':
          this.createRope(c.x, c.y, c.properties, bodyMap);
          break;
      }
    }
  }
}
```

**Dependencies:** 2.1, 2.2.

**Complexity:** M

---

### 2.4 Visual Rendering for Constraints

**What:** Create distinct visual renderers for each constraint type: pivot markers for seesaws, coil lines for springs, catenary lines for ropes.

**Why:** Without visuals, the player cannot understand what the constraint does. Each type needs an immediately recognizable visual metaphor.

**Files to create:**
- `src/game/ConstraintRenderer.ts` -- standalone renderer class

**Technical approach:**
Extract the visual drawing from PhysicsManager into a dedicated class following SRP:

```typescript
export class ConstraintRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setDepth(8);
  }

  update(constraints: MatterJS.ConstraintType[]): void {
    this.graphics.clear();
    for (const c of constraints) {
      switch (c.label) {
        case 'spring': this.drawSpring(c); break;
        case 'rope_link': this.drawRopeSegment(c); break;
        // Seesaw pivot is static -- drawn once in create
      }
    }
  }

  drawPivotMarker(x: number, y: number): void {
    // Triangle base + circle on top
    this.scene.add.circle(x, y, 5, 0xaabbcc, 0.8).setDepth(11);
    const gfx = this.scene.add.graphics().setDepth(10);
    gfx.fillStyle(0x8899aa, 0.6);
    gfx.fillTriangle(x - 8, y + 10, x + 8, y + 10, x, y);
  }

  // ... spring coil and rope methods as described in 2.2
}
```

**Dependencies:** 2.2.

**Complexity:** M

---

### 2.5 New Levels Using Constraints (18 Levels)

**What:** Create 18 new levels: 6 seesaw-focused, 6 spring-focused, 6 rope-focused.

**Why:** New mechanics need dedicated levels that teach the mechanic, then challenge the player.

**Files to create:**
- `src/game/LevelTemplates7.ts` -- 18 constraint levels (t181-t198)

**Files to modify:**
- `src/game/LevelLoader.ts` -- import BATCH_7
- `src/game/LevelLoader.test.ts` -- update count assertion

**Technical approach:**
Each batch of 6 follows a difficulty curve: 2 easy (difficulty 2), 2 medium (difficulty 3), 2 hard (difficulty 4).

Example seesaw level:
```typescript
{
  id: 't181', name: 'Wippe', difficulty: 2, theme: 'metal',
  world: { width: 800, height: 600 },
  placementZone: { x: 50, y: 50, width: 100, height: 150, allowedObjects: ['weight'] },
  staticObjects: [{ type: 'platform', x: 0, y: 580, width: 800, height: 20 }],
  dynamicObjects: [
    { id: 'd1', type: 'ball', x: 500, y: 430 },
  ],
  targets: [{ id: 't1', type: 'star', x: 650, y: 200, points: 100 }],
  constraints: [{
    id: 'c1', type: 'seesaw', x: 400, y: 450,
    properties: { type: 'seesaw', width: 200, height: 12 },
  }],
}
```

The seesaw acts as a catapult: the player drops a weight on one end, launching the ball on the other end toward the target.

**Dependencies:** 2.1, 2.2, 2.3.

**Complexity:** L (content creation is time-intensive but mechanically simple)

---

### Phase 2 Test Updates

**New tests to add:**
- `src/game/PhysicsManager.test.ts` -- test constraint creation (mock scene context)
- `src/game/LevelLoader.test.ts` -- update assertion for 198 total levels
- `src/types/Level.test.ts` -- validate constraint schema types compile correctly

**Performance considerations:**
- Rope segments increase body count. On mobile (MAX_BODIES_MOBILE = 30), a 10-segment rope eats 1/3 of the budget. Cap at 6 segments on mobile.
- Spring and seesaw constraints add minimal overhead (1-2 extra constraint solver iterations per frame).

**Accessibility:**
- New constraint visuals must have sufficient contrast. The pivot marker, spring coils, and rope lines should all be visible against the dark background.
- Colorblind mode should not affect constraint colors (they are not color-coded for game information).

**Rollback:** Remove BATCH_7 import from LevelLoader. Remove constraint processing from buildLevel. Schema extension is backward-compatible (constraints is optional).

---

## Phase 3: Procedural Music System

### 3.1 MusicEngine Class Architecture

**What:** Create a new `MusicEngine` class that manages layered Web Audio synthesis for ambient and reactive music.

**Why:** The current AudioManager (src/systems/AudioManager.ts) handles short one-shot sound effects. Music requires persistent oscillator nodes, gain mixing, and state management across the simulation lifecycle. SRP demands a separate class.

**Files to create:**
- `src/systems/MusicEngine.ts` -- main music synthesis engine

**Files to modify:**
- `src/scenes/GameScene.ts` -- instantiate and drive MusicEngine
- `src/scenes/MenuScene.ts` -- add music toggle to settings
- `src/systems/AudioManager.ts` -- expose AudioContext reference for sharing

**Technical approach:**

```typescript
// src/systems/MusicEngine.ts

/** Layer identifiers for the music system. */
type LayerId = 'drone' | 'arpeggio' | 'pad' | 'percussion';

interface MusicLayer {
  id: LayerId;
  nodes: AudioNode[];
  gainNode: GainNode;
  active: boolean;
}

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private layers: Map<LayerId, MusicLayer> = new Map();
  private masterGain: GainNode | null = null;
  private enabled = true;
  private isPlaying = false;

  // Pentatonic scale (same as AudioManager for consistency)
  private static readonly PENTATONIC = [
    262, 294, 330, 392, 440, 523, 587, 659, 784, 880,
  ];

  init(ctx: AudioContext): void {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(ctx.destination);
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (this.masterGain) {
      this.masterGain.gain.value = on ? 0.3 : 0;
    }
  }

  /** Start the ambient drone layer. Called when simulation begins. */
  startSimulation(): void { /* see 3.2 */ }

  /** Update layers based on current chain length. Called each frame. */
  updateChain(chainLength: number): void { /* see 3.3, 3.4, 3.5 */ }

  /** Trigger the all-targets crescendo. */
  crescendo(): void { /* see 3.6 */ }

  /** Stop all layers. Called when simulation ends. */
  stop(): void {
    for (const layer of this.layers.values()) {
      layer.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.5);
      this.ctx!.setTimeout?.(() => {
        for (const node of layer.nodes) {
          if (node instanceof OscillatorNode) node.stop();
        }
      }, 600);
    }
    this.layers.clear();
    this.isPlaying = false;
  }

  destroy(): void {
    this.stop();
    this.masterGain?.disconnect();
  }
}
```

**Dependencies:** AudioManager must expose its AudioContext so MusicEngine reuses it (no double AudioContext).

**Complexity:** L (entire subsystem)

---

### 3.2 Ambient Drone Layer

**What:** A low sine wave oscillator with LFO modulation that plays during the entire simulation as a tension bed.

**Why:** The game currently has no music during simulation -- only discrete sound effects. An ambient drone creates an atmospheric foundation.

**Technical approach (inside MusicEngine):**

```typescript
startSimulation(): void {
  if (!this.ctx || !this.masterGain || !this.enabled) return;
  this.isPlaying = true;

  // Drone: low sine + LFO amplitude modulation
  const droneGain = this.ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.connect(this.masterGain);

  const osc = this.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 65; // Low C2

  // LFO for gentle pulsing
  const lfo = this.ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.3; // Very slow pulse
  const lfoGain = this.ctx.createGain();
  lfoGain.gain.value = 0.02; // Subtle modulation
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.connect(droneGain);
  osc.start();
  lfo.start();

  // Fade in
  droneGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);

  this.layers.set('drone', {
    id: 'drone',
    nodes: [osc, lfo],
    gainNode: droneGain,
    active: true,
  });
}
```

**Complexity:** S

---

### 3.3 Chain-Reactive Arpeggio

**What:** A pentatonic arpeggio that adds notes as the chain grows. At chain 1, a single note plays. At chain 5, five notes cycle in sequence.

**Why:** This creates a direct audio mapping of the chain reaction, reinforcing the "building momentum" feeling.

**Technical approach:**

```typescript
updateChain(chainLength: number): void {
  if (!this.ctx || !this.masterGain || !this.isPlaying) return;

  // Arpeggio: starts at chain 1, adds notes up to chain length
  if (chainLength >= 1 && !this.layers.has('arpeggio')) {
    const arpGain = this.ctx.createGain();
    arpGain.gain.value = 0;
    arpGain.connect(this.masterGain);
    arpGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.3);

    this.layers.set('arpeggio', {
      id: 'arpeggio',
      nodes: [],
      gainNode: arpGain,
      active: true,
    });
  }

  // Play next arpeggio note
  if (chainLength >= 1) {
    const noteIdx = Math.min(chainLength - 1, MusicEngine.PENTATONIC.length - 1);
    const freq = MusicEngine.PENTATONIC[noteIdx];
    this.playArpeggioNote(freq);
  }

  // Pad at chain 5+ (see 3.4)
  if (chainLength >= 5) this.activatePadLayer();

  // Percussion at chain 10+ (see 3.5)
  if (chainLength >= 10) this.activatePercussionLayer();
}

private playArpeggioNote(freq: number): void {
  if (!this.ctx || !this.masterGain) return;
  const arpLayer = this.layers.get('arpeggio');
  if (!arpLayer) return;

  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(arpLayer.gainNode);
  gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
  osc.start();
  osc.stop(this.ctx.currentTime + 0.4);
}
```

**Complexity:** M

---

### 3.4 Pad Layer at Chain 5+

**What:** When the chain reaches 5, introduce a warm pad of detuned sine oscillators.

```typescript
private activatePadLayer(): void {
  if (this.layers.has('pad')) return;
  if (!this.ctx || !this.masterGain) return;

  const padGain = this.ctx.createGain();
  padGain.gain.value = 0;
  padGain.connect(this.masterGain);

  // Three detuned oscillators for "pad" warmth
  const baseFreq = 130; // C3
  const detunes = [0, 3, -3]; // Cents
  const oscs: OscillatorNode[] = [];

  for (const det of detunes) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    osc.detune.value = det;
    osc.connect(padGain);
    osc.start();
    oscs.push(osc);
  }

  padGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.5);

  this.layers.set('pad', { id: 'pad', nodes: oscs, gainNode: padGain, active: true });
}
```

**Complexity:** S

---

### 3.5 Percussion at Chain 10+

**What:** Filtered noise bursts synchronized to collision events when chain length exceeds 10.

```typescript
private activatePercussionLayer(): void {
  if (this.layers.has('percussion')) return;
  if (!this.ctx || !this.masterGain) return;

  const percGain = this.ctx.createGain();
  percGain.gain.value = 0.05;
  percGain.connect(this.masterGain);

  this.layers.set('percussion', {
    id: 'percussion',
    nodes: [],
    gainNode: percGain,
    active: true,
  });
}

/** Called from GameScene collision handler when chain >= 10. */
triggerPercussionHit(): void {
  if (!this.ctx) return;
  const percLayer = this.layers.get('percussion');
  if (!percLayer) return;

  const bufSize = this.ctx.sampleRate * 0.03;
  const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }

  const source = this.ctx.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter for pitched percussion
  const filter = this.ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800 + Math.random() * 400;
  filter.Q.value = 5;

  source.connect(filter);
  filter.connect(percLayer.gainNode);
  source.start();
}
```

**Complexity:** S

---

### 3.6 All-Targets Crescendo

**What:** When all targets are hit, all active music layers swell to a climax, then fade.

```typescript
crescendo(): void {
  if (!this.ctx) return;

  for (const layer of this.layers.values()) {
    layer.gainNode.gain.linearRampToValueAtTime(
      layer.gainNode.gain.value * 3,
      this.ctx.currentTime + 0.3,
    );
  }

  // Add a high shimmering tone
  const shimmer = this.ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = 1047; // C6
  const shimGain = this.ctx.createGain();
  shimmer.connect(shimGain);
  shimGain.connect(this.masterGain!);
  shimGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
  shimGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
  shimmer.start();
  shimmer.stop(this.ctx.currentTime + 2);

  // Fade all layers after crescendo
  this.ctx.setTimeout?.(() => this.stop(), 2000);
}
```

**Complexity:** S

---

### 3.7 Spatial Audio Panning

**What:** Pan sounds left/right based on the X position of the collision or target hit.

**Files to modify:**
- `src/systems/AudioManager.ts` -- add panning support
- `src/systems/MusicEngine.ts` -- add panning for arpeggio notes

**Technical approach:**
Add a `StereoPannerNode` in the audio chain:

```typescript
// AudioManager.ts -- new method
static playImpactAt(chainIndex: number, worldX: number): void {
  const ctx = AudioManager.getCtx();
  if (!ctx) return;

  // Pan: -1 (left) to +1 (right) based on X position
  const pan = (worldX / GAME_WIDTH) * 2 - 1;
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, pan));

  // ... existing playImpact logic, but connect through panner ...
  // osc.connect(gain) -> gain.connect(panner) -> panner.connect(ctx.destination)
}
```

Then in GameScene collision handler, replace `AudioManager.playImpact(newChain)` with:
```typescript
const cx = (bodyA.position.x + bodyB.position.x) / 2;
AudioManager.playImpactAt(newChain, cx);
```

**Complexity:** M

---

### 3.8 Music Toggle in Settings

**What:** Add a music-specific toggle separate from the existing sound toggle in MenuScene.

**Files to modify:**
- `src/scenes/MenuScene.ts` -- add music toggle button
- `src/systems/MusicEngine.ts` -- setEnabled() reads from localStorage

**Technical approach:**
Store preference in localStorage key `kettenreaktion_music`:

```typescript
// In MenuScene, next to the existing sound toggle:
let musicOn = localStorage.getItem('kettenreaktion_music') !== '0';
const musicBtn = this.add
  .text(GAME_WIDTH - 80, 20, musicOn ? '\u{266B}' : '\u{1F507}', {
    fontSize: '20px', color: '#666688',
  })
  .setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);

musicBtn.on('pointerdown', () => {
  musicOn = !musicOn;
  localStorage.setItem('kettenreaktion_music', musicOn ? '1' : '0');
  MusicEngine.instance?.setEnabled(musicOn);
  musicBtn.setText(musicOn ? '\u{266B}' : '\u{1F507}');
});
```

**Complexity:** S

---

### Phase 3 Test Updates

**New tests:**
- `src/systems/MusicEngine.test.ts` -- test layer activation logic with mocked AudioContext
- `src/systems/AudioManager.test.ts` -- test panning calculation

**Performance:** Web Audio oscillators are extremely lightweight. 10 simultaneous oscillators use negligible CPU. The main concern is garbage collection from creating/destroying oscillators -- use object pools for short notes if profiling shows GC spikes.

**Accessibility:** Music must default to OFF for screen reader users (check `prefersReducedMotion()`). The toggle must be keyboard-accessible.

**Rollback:** Remove MusicEngine instantiation from GameScene. All sound effects continue to work through AudioManager.

---

## Phase 4: Zen Mode

### 4.1 ZenScene

**What:** A new Phaser Scene for an open-ended, pressure-free sandbox mode.

**Why:** The daily puzzle has constraints (3 attempts, time pressure, zone restrictions). Zen Mode lets players experiment freely, creating abstract art from physics trails. This serves the "endless mode" pivot option mentioned in GAMEPLAN.md.

**Files to create:**
- `src/scenes/ZenScene.ts` -- the zen mode scene

**Files to modify:**
- `src/main.ts` -- register ZenScene in the scene array
- `src/scenes/MenuScene.ts` -- add "Zen" button

**Technical approach:**

```typescript
// src/scenes/ZenScene.ts
export class ZenScene extends Phaser.Scene {
  private physicsManager!: PhysicsManager;
  private trailRenderer!: TrailRenderer;
  private musicEngine!: MusicEngine;
  private selectedType: ObjectType = 'ball';
  private placedObjects: Phaser.Physics.Matter.Sprite[] = [];

  constructor() {
    super({ key: 'ZenScene' });
  }

  create(): void {
    // No HUD, no score, no timer, no attempt limit
    this.physicsManager = new PhysicsManager(this);
    this.trailRenderer = new TrailRenderer(this);
    // Use MusicEngine for ambient music (drone + pad always on)
    this.musicEngine = new MusicEngine();
    this.musicEngine.init(AudioManager.getContext());
    this.musicEngine.startAmbient(); // Special ambient-only mode

    // Build minimal world: just floor and walls
    this.physicsManager.buildMinimalWorld(GAME_WIDTH, GAME_HEIGHT);

    this.drawBackgroundGrid();

    // Object type selector (always visible)
    this.createPersistentSelector();

    // Click anywhere to place
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.y < 60) return; // Avoid selector area
      this.placeObject(ptr.x, ptr.y);
    });

    // Clear button
    new Button(this, {
      x: 70, y: GAME_HEIGHT - 25, text: 'Loeschen',
      width: 100, height: 30, fontSize: '11px',
      color: 0x553333, hoverColor: 0x664444, textColor: '#cc8888',
      onClick: () => this.clearAll(),
    });

    // Screenshot button
    new Button(this, {
      x: 200, y: GAME_HEIGHT - 25, text: 'Screenshot',
      width: 110, height: 30, fontSize: '11px',
      color: 0x335533, hoverColor: 0x446644, textColor: '#88cc88',
      onClick: () => this.saveScreenshot(),
    });

    // Back button
    new Button(this, {
      x: GAME_WIDTH - 70, y: GAME_HEIGHT - 25, text: 'Zurueck',
      width: 100, height: 30, fontSize: '11px',
      color: 0x222233, hoverColor: 0x2a2a44, textColor: '#777799',
      onClick: () => this.scene.start('MenuScene'),
    });

    // ESC to exit
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  update(): void {
    this.trailRenderer.update();
  }

  private placeObject(x: number, y: number): void {
    const sprite = this.physicsManager.createDynamicSprite(this.selectedType, x, y);
    this.placedObjects.push(sprite);
    this.trailRenderer.track(
      sprite.body as MatterJS.BodyType,
      this.getTrailColor(this.selectedType),
    );
    AudioManager.playPlace();
  }

  private clearAll(): void {
    this.physicsManager.clearLevel();
    this.physicsManager.buildMinimalWorld(GAME_WIDTH, GAME_HEIGHT);
    this.trailRenderer.clear();
    this.placedObjects = [];
  }

  private saveScreenshot(): void {
    // Render trail art first
    this.trailRenderer.renderArt();

    // Use Phaser's built-in snapshot
    this.renderer.snapshot((image: HTMLImageElement) => {
      const link = document.createElement('a');
      link.download = `zen-${Date.now()}.png`;
      link.href = (image as HTMLImageElement).src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  shutdown(): void {
    this.physicsManager.clearLevel();
    this.trailRenderer.destroy();
    this.musicEngine.stop();
  }
}
```

**PhysicsManager changes:** Add a `buildMinimalWorld(w, h)` method that builds only floor and walls (no level data needed).

**TrailRenderer changes:** In Zen Mode, the `maxPoints` should be set much higher (e.g., 120) and segments should persist (never age out), creating permanent art trails. Add a `setPersistent(true)` method.

**Dependencies:** Phase 3 MusicEngine (optional -- can stub with silent engine).

**Complexity:** M

---

### 4.2 Persistent Trail Renderer

**What:** Extend TrailRenderer with a "persistent" mode where trail points never expire, building up an abstract art piece.

**Files to modify:**
- `src/game/TrailRenderer.ts` -- add persistent mode

**Technical approach:**
```typescript
// Add to TrailRenderer:
private persistent = false;

setPersistent(on: boolean): void {
  this.persistent = on;
  if (on) {
    this.maxPoints = 999999; // Effectively infinite
  } else {
    this.maxPoints = 12;
  }
}

// In update(), modify the aging logic:
if (!this.persistent) {
  for (let i = points.length - 1; i >= 0; i--) {
    points[i].age++;
    if (points[i].age > this.maxPoints) {
      points.splice(i, 1);
    }
  }
}
```

**Performance concern:** Unlimited trail points will grow linearly. After 10 minutes of play at 60fps with 5 bodies, that is approximately 180,000 points. The `update()` drawing loop iterates all points each frame. Mitigation: Use `artSegments` for persistent drawing (already written to a `Graphics` object once) and switch from real-time trail to batched art every 100 frames.

**Complexity:** S

---

### Phase 4 Test Updates

**New tests:**
- No unit tests for ZenScene (scene logic is presentation-only)
- Manual playtest checklist: object placement works everywhere, objects accumulate, screenshot saves valid PNG, clear button removes all objects, back button returns to menu

**Accessibility:** Zen Mode has no time pressure or failure states, making it inherently accessible. The persistent selector must be keyboard-navigable (1/2/3/4 keys for object types).

**Rollback:** Remove ZenScene from `main.ts` scene array and the menu button.

---

## Phase 5: Social and Engagement

### 5.1 Challenge Tokens (Shareable URL with Puzzle Seed)

**What:** A system that generates shareable URLs encoding a specific level and optional constraints, so players can challenge friends to beat their score on a specific puzzle.

**Why:** The existing `?challenge=N` parameter in MenuScene (lines 20-29) already supports this for level index. Extend it to include the player's score as a "beat this" target.

**Files to modify:**
- `src/scenes/MenuScene.ts` -- parse extended challenge params
- `src/scenes/ResultScene.ts` -- generate challenge URL
- `src/systems/ShareManager.ts` -- add challenge URL generation

**Technical approach:**
URL format: `?challenge=42&score=850&name=Max`

```typescript
// ShareManager.ts -- new method
static generateChallengeURL(levelIndex: number, score: number, playerName?: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams();
  params.set('challenge', String(levelIndex));
  params.set('score', String(score));
  if (playerName) params.set('name', playerName);
  return `${base}?${params.toString()}`;
}
```

In MenuScene, when a challenge URL is detected with a score, show a "Beat X's score of Y!" banner before starting the level.

**Dependencies:** None.

**Complexity:** S

---

### 5.2 Post-Solve Difficulty Percentile

**What:** After solving a puzzle in daily mode, show a simulated difficulty percentile ("Harder than 73% of puzzles this week").

**Why:** This adds a social comparison element without requiring a backend. The percentile is deterministic based on the level's difficulty rating and the player's performance relative to the theoretical max score.

**Files to modify:**
- `src/scenes/ResultScene.ts` -- add percentile display
- `src/game/ScoreCalculator.ts` -- add percentile calculation

**Technical approach:**
Since there is no backend yet, compute a pseudo-percentile from the score relative to the level's theoretical maximum:

```typescript
// ScoreCalculator.ts -- new method
static estimatePercentile(score: number, totalTargets: number, difficulty: number): number {
  const maxScore = totalTargets * 100 + 15 * 50 + 2 * 200 + 25 * 10; // ~2,050 theoretical max
  const ratio = score / maxScore;
  // Adjust by difficulty: harder levels have lower average scores
  const difficultyFactor = 0.3 + difficulty * 0.1; // 0.4 to 0.8
  const percentile = Math.min(99, Math.round(ratio / difficultyFactor * 100));
  return percentile;
}
```

Display in ResultScene after the score counter animation:
```typescript
const percentile = ScoreCalculator.estimatePercentile(data.score.total, data.totalTargets, level.difficulty);
this.add.text(cx, 355, `Besser als ${percentile}% der Spieler`, {
  fontSize: '11px', color: '#8888aa',
}).setOrigin(0.5);
```

When Supabase is added (Phase 3 of ROADMAP.md), replace with real percentile from aggregate data.

**Dependencies:** None.

**Complexity:** S

---

### 5.3 Monthly Themed Events Framework

**What:** A data-driven system for monthly themed events that modify the game's visual style and level selection.

**Files to create:**
- `src/systems/EventManager.ts` -- event configuration and activation

**Files to modify:**
- `src/scenes/GameScene.ts` -- apply event theme
- `src/scenes/MenuScene.ts` -- show event banner

**Technical approach:**

```typescript
// src/systems/EventManager.ts
interface GameEvent {
  id: string;
  name: string;
  /** Month (1-12) */
  month: number;
  /** Style overrides */
  theme: {
    bgColor: string;
    accentColor: string;
    particleTints: number[];
    bannerText: string;
  };
}

const EVENTS: GameEvent[] = [
  {
    id: 'advent', name: 'Adventskalender', month: 12,
    theme: {
      bgColor: '#1a0a0a',
      accentColor: '#ff4444',
      particleTints: [0xff4444, 0x44ff44, 0xffffff, 0xffdd00],
      bannerText: 'Adventskalender 2026',
    },
  },
  // Add more events per month
];

export class EventManager {
  static getCurrentEvent(): GameEvent | null {
    const month = new Date().getUTCMonth() + 1;
    return EVENTS.find((e) => e.month === month) ?? null;
  }
}
```

GameScene applies event theme in `create()` if an event is active. MenuScene shows the event banner text.

**Dependencies:** None.

**Complexity:** M

---

### 5.4 Enhanced Emoji Sharing with Chain Path Visualization

**What:** Extend ShareManager to include a visual chain path using directional arrows.

**Files to modify:**
- `src/systems/ShareManager.ts` -- enhance generateEmojiResult

**Technical approach:**
Add a chain direction row that shows the path of the chain reaction using arrow emojis:

```typescript
// New method in ShareManager:
static buildChainPath(replayFrames: ReplayFrame[]): string {
  if (!replayFrames || replayFrames.length < 2) return '';

  const arrows: string[] = [];
  // Sample 6 evenly-spaced frames
  const step = Math.max(1, Math.floor(replayFrames.length / 6));
  for (let i = step; i < replayFrames.length && arrows.length < 6; i += step) {
    const prev = replayFrames[i - step][0]; // First body position
    const curr = replayFrames[i][0];
    const dx = curr[0] - prev[0];
    const dy = curr[1] - prev[1];
    const angle = Math.atan2(dy, dx);

    // Map angle to arrow emoji
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) arrows.push('\u27A1');      // right
    else if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) arrows.push('\u2B07'); // down
    else if (angle > -3 * Math.PI / 4 && angle <= -Math.PI / 4) arrows.push('\u2B06'); // up
    else arrows.push('\u2B05'); // left
  }

  return arrows.join('');
}
```

Add to share output: `'\u{1F3AF} ' + buildChainPath(replayFrames)` line.

**Dependencies:** Replay data must be passed to ShareManager (already available in ResultScene).

**Complexity:** S

---

### 5.5 PWA Shortcuts

**What:** Add PWA shortcuts to the web app manifest for "Play Today" and "Practice" actions.

**Files to modify:**
- `public/manifest.json` -- add shortcuts array

**Technical approach:**
```json
{
  "shortcuts": [
    {
      "name": "Heute spielen",
      "short_name": "Spielen",
      "url": "/Kettenreaktion/",
      "icons": [{ "src": "/Kettenreaktion/icons/play-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Uebungsmodus",
      "short_name": "Uebung",
      "url": "/Kettenreaktion/?mode=practice",
      "icons": [{ "src": "/Kettenreaktion/icons/practice-192.png", "sizes": "192x192" }]
    }
  ]
}
```

MenuScene needs to check for `?mode=practice` and auto-navigate to PracticeScene.

**Dependencies:** PWA manifest (already exists).

**Complexity:** S

---

### Phase 5 Test Updates

**New tests:**
- `src/systems/ShareManager.test.ts` -- test challenge URL generation, chain path visualization
- `src/game/ScoreCalculator.test.ts` -- test percentile estimation
- `src/systems/EventManager.test.ts` -- test current event detection

**Rollback:** Each feature is independent and can be reverted individually.

---

## Phase 6: Content and Quality of Life

### 6.1 Interactive Tutorial (Guided Playable Level)

**What:** Replace the current text-only HowToScene with a guided, playable tutorial level that walks the player through the game mechanics step by step.

**Why:** The current HowToScene (src/scenes/HowToScene.ts) is a static text list. Players learn better by doing.

**Files to modify:**
- `src/scenes/HowToScene.ts` -- complete rewrite to interactive mode

**Technical approach:**
The tutorial runs a simplified GameScene-like flow with overlaid instruction text:

Step 1: "Siehst du die gruene Zone? Klicke hinein!" (placement zone highlighted, arrow pointing at it)
Step 2: Player clicks in zone, ball is placed
Step 3: "Schau zu! Die Kugel rollt..." (simulation plays)
Step 4: "Die Kugel hat den Stern getroffen! +100 Punkte" (target hit)
Step 5: "Jetzt bist du bereit. Viel Spass!" (transition to menu)

```typescript
// HowToScene.ts restructured as a state machine:
private tutorialStep = 0;
private readonly STEPS = [
  { text: 'Klicke in die gruene Zone!', action: 'waitForClick' },
  { text: 'Gut! Die Physik startet...', action: 'simulate' },
  { text: '+100 Punkte! Stern getroffen!', action: 'waitForHit' },
  { text: 'Bereit! Viel Spass!', action: 'complete' },
];
```

Use a pre-built simple tutorial level (one ramp, one ball placement, one star) stored in a constant:

```typescript
const TUTORIAL_LEVEL: Level = {
  id: 'tutorial', name: 'Tutorial', difficulty: 1, theme: 'wood',
  world: { width: 800, height: 600 },
  placementZone: { x: 300, y: 100, width: 200, height: 150, allowedObjects: ['ball'] },
  staticObjects: [
    { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
    { type: 'ramp', x: 350, y: 350, width: 200, angle: -15 },
  ],
  dynamicObjects: [],
  targets: [{ id: 't1', type: 'star', x: 600, y: 555, points: 100 }],
};
```

The scene uses PhysicsManager, ChainDetector, and a subset of GameScene logic (placement, simulation) but with tutorial overlays.

**Dependencies:** PhysicsManager, ChainDetector.

**Complexity:** L

---

### 6.2 Replay Scrubber

**What:** Add play/pause, rewind, speed controls, and a draggable scrub bar to ReplayScene.

**Why:** The current ReplayScene (src/scenes/ReplayScene.ts) plays at fixed speed with no controls beyond "restart". Players want to study their replays frame-by-frame.

**Files to modify:**
- `src/scenes/ReplayScene.ts` -- add transport controls

**Technical approach:**
Add a transport bar at the bottom of the replay with these controls:

```typescript
// Transport controls
const transportY = GAME_HEIGHT - 60;

// Play/Pause button
const playPauseBtn = this.add.text(cx - 60, transportY, '\u25B6', {
  fontSize: '20px', color: '#8888cc',
}).setInteractive({ useHandCursor: true }).setDepth(50);

playPauseBtn.on('pointerdown', () => {
  this.isPlaying = !this.isPlaying;
  playPauseBtn.setText(this.isPlaying ? '\u23F8' : '\u25B6');
});

// Rewind button
const rewindBtn = this.add.text(cx - 100, transportY, '\u23EA', {
  fontSize: '20px', color: '#8888cc',
}).setInteractive({ useHandCursor: true }).setDepth(50);

rewindBtn.on('pointerdown', () => {
  this.frameIndex = 0;
  this.isPlaying = false;
  playPauseBtn.setText('\u25B6');
  this.updateDots();
});

// Speed selector: 0.5x, 1x, 2x
let speedMultiplier = 1;
const speedBtn = this.add.text(cx + 60, transportY, '1x', {
  fontSize: '14px', color: '#8888cc',
}).setInteractive({ useHandCursor: true }).setDepth(50);

speedBtn.on('pointerdown', () => {
  const speeds = [0.5, 1, 2];
  const idx = (speeds.indexOf(speedMultiplier) + 1) % speeds.length;
  speedMultiplier = speeds[idx];
  speedBtn.setText(`${speedMultiplier}x`);
  // Update timer delay
  if (this.playTimer) {
    this.playTimer.delay = 50 / speedMultiplier;
  }
});

// Draggable scrub bar
const barBg = this.add.rectangle(cx, transportY + 25, 400, 10, 0x333355, 0.5)
  .setInteractive({ draggable: false, useHandCursor: true }).setDepth(50);

barBg.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
  const relX = ptr.x - (cx - 200);
  const progress = Math.max(0, Math.min(1, relX / 400));
  this.frameIndex = Math.floor(progress * (this.replayFrames.length - 1));
  this.updateDots();
});

// Step forward/backward with arrow keys
this.input.keyboard?.on('keydown-LEFT', () => {
  this.frameIndex = Math.max(0, this.frameIndex - 1);
  this.isPlaying = false;
  playPauseBtn.setText('\u25B6');
  this.updateDots();
});

this.input.keyboard?.on('keydown-RIGHT', () => {
  this.frameIndex = Math.min(this.replayFrames.length - 1, this.frameIndex + 1);
  this.isPlaying = false;
  playPauseBtn.setText('\u25B6');
  this.updateDots();
});
```

Extract `updateDots()` from the timer callback so it can be called from scrubber interactions:

```typescript
private updateDots(): void {
  if (this.frameIndex >= this.replayFrames.length) return;
  const frame = this.replayFrames[this.frameIndex];
  for (let i = 0; i < Math.min(frame.length, this.dots.length); i++) {
    const d = this.dots[i] as Phaser.GameObjects.Sprite;
    d.setPosition(frame[i][0], frame[i][1]);
    if (frame[i][2] !== undefined) d.setRotation(frame[i][2]);
  }
}
```

**Dependencies:** None.

**Complexity:** M

---

### 6.3 Practice Mode Enhancement

**What:** Add best score tracking, completion indicators, and a working difficulty filter to PracticeScene.

**Why:** The current PracticeScene (src/scenes/PracticeScene.ts) has no score memory, no completion checkmarks, and the difficulty filter only jumps to the next matching level rather than filtering the list.

**Files to modify:**
- `src/scenes/PracticeScene.ts` -- add tracking and filtering
- `src/systems/StorageManager.ts` -- add practice score storage

**Technical approach:**

Add to GameStorage:
```typescript
export interface GameStorage {
  // ... existing ...
  practiceScores?: Record<string, { score: number; solved: boolean }>;
}
```

In PracticeScene, show completion status in the preview card:
```typescript
private updatePreview(): void {
  const level = LevelLoader.loadByIndex(this.currentIndex);
  this.levelNameText.setText(level.name);

  const practiceData = StorageManager.load().practiceScores?.[level.id];
  if (practiceData) {
    const statusIcon = practiceData.solved ? '\u2705' : '\u{1F534}';
    this.statusText.setText(`${statusIcon} Best: ${practiceData.score}`);
  } else {
    this.statusText.setText('Noch nicht gespielt');
  }

  // ... existing difficulty display ...
}
```

For the difficulty filter, maintain a filtered indices array:
```typescript
private filteredIndices: number[] = [];
private activeFilter: number | null = null;

private applyFilter(difficulty: number | null): void {
  this.activeFilter = difficulty;
  if (difficulty === null) {
    this.filteredIndices = Array.from({ length: this.totalLevels }, (_, i) => i);
  } else {
    this.filteredIndices = [];
    for (let i = 0; i < this.totalLevels; i++) {
      const level = LevelLoader.loadByIndex(i);
      if (level.difficulty === difficulty) {
        this.filteredIndices.push(i);
      }
    }
  }
  this.currentFilterIndex = 0;
  if (this.filteredIndices.length > 0) {
    this.currentIndex = this.filteredIndices[0];
    this.updatePreview();
  }
}
```

Navigation arrows then step through `filteredIndices` instead of raw indices.

Record practice scores in ResultScene when `isPractice === true`:
```typescript
if (isPractice) {
  const practiceScores = StorageManager.load().practiceScores ?? {};
  const existing = practiceScores[data.levelId ?? ''];
  if (!existing || data.score.total > existing.score) {
    practiceScores[data.levelId ?? ''] = {
      score: data.score.total,
      solved: data.solved,
    };
    StorageManager.save({ practiceScores });
  }
}
```

**Dependencies:** None.

**Complexity:** M

---

### 6.4 Level Editor (Basic HTML Overlay)

**What:** A basic level editor accessible from the menu that lets players create levels using the existing JSON schema, with a visual canvas preview.

**Why:** User-generated content extends the game's lifespan. The editor uses the existing Level interface, so created levels are compatible with the game engine.

**Files to create:**
- `src/scenes/EditorScene.ts` -- Phaser scene for visual editing
- `src/ui/EditorPanel.ts` -- HTML overlay for property editing

**Files to modify:**
- `src/main.ts` -- register EditorScene
- `src/scenes/MenuScene.ts` -- add "Editor" button (hidden behind feature flag)

**Technical approach:**

The editor has two components:
1. A Phaser scene showing the game canvas with click-to-place objects
2. An HTML overlay panel (absolutely positioned div) for property editing

```typescript
// EditorScene.ts -- high-level structure
export class EditorScene extends Phaser.Scene {
  private editorLevel: Level;
  private selectedTool: 'platform' | 'ramp' | 'ball' | 'domino' | 'crate' | 'weight' | 'star' | 'zone' = 'platform';
  private editorObjects: EditorObject[] = [];
  private htmlPanel: HTMLDivElement | null = null;

  constructor() {
    super({ key: 'EditorScene' });
  }

  create(): void {
    // Initialize empty level
    this.editorLevel = {
      id: `custom_${Date.now()}`,
      name: 'Neues Level',
      difficulty: 1,
      theme: 'wood',
      world: { width: GAME_WIDTH, height: GAME_HEIGHT },
      placementZone: { x: 100, y: 100, width: 200, height: 200, allowedObjects: ['ball'] },
      staticObjects: [],
      dynamicObjects: [],
      targets: [],
    };

    this.drawGrid();
    this.createHTMLPanel();
    this.setupInput();

    // Click to place selected object type
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      this.placeEditorObject(ptr.x, ptr.y);
    });
  }

  private createHTMLPanel(): void {
    this.htmlPanel = document.createElement('div');
    this.htmlPanel.id = 'editor-panel';
    this.htmlPanel.style.cssText = `
      position: absolute; top: 0; right: 0;
      width: 250px; height: 100%;
      background: #1a1a2eee; color: #aaaacc;
      font-family: monospace; font-size: 12px;
      padding: 16px; overflow-y: auto; z-index: 100;
    `;
    // Tool buttons, property fields, export button
    this.htmlPanel.innerHTML = `
      <h3 style="color:#fff">Level Editor</h3>
      <div id="tools">...</div>
      <div id="properties">...</div>
      <button id="export-json">JSON exportieren</button>
      <button id="test-level">Level testen</button>
    `;
    document.body.appendChild(this.htmlPanel);

    // Export button handler
    document.getElementById('export-json')?.addEventListener('click', () => {
      const json = JSON.stringify(this.editorLevel, null, 2);
      navigator.clipboard.writeText(json);
    });

    // Test button handler
    document.getElementById('test-level')?.addEventListener('click', () => {
      // Store level in sessionStorage, start GameScene with it
      sessionStorage.setItem('editor_level', JSON.stringify(this.editorLevel));
      this.scene.start('GameScene', { editorLevel: this.editorLevel });
    });
  }

  shutdown(): void {
    this.htmlPanel?.remove();
    this.htmlPanel = null;
  }
}
```

The editor is deliberately kept simple (YAGNI): no drag-to-resize, no undo history, no snap-to-grid. Players place objects by clicking, edit properties in the side panel, and export as JSON.

**Feature flag:** Gate behind `?editor=1` URL parameter or a hidden key combo (Ctrl+Shift+E) to keep it out of the main flow until polished.

**Dependencies:** None.

**Complexity:** L

---

### Phase 6 Test Updates

**New tests:**
- `src/scenes/HowToScene.test.ts` -- test tutorial state machine transitions (mock Phaser scene)
- `src/systems/StorageManager.test.ts` -- test practice score persistence
- `src/scenes/ReplayScene.test.ts` -- test frame scrubbing logic

**Performance:** The level editor HTML overlay uses DOM elements, which is fine for an editing tool. The canvas and DOM do not interfere.

**Accessibility:**
- Interactive tutorial must work with keyboard only (Enter to place, no mouse required)
- Replay scrubber must be keyboard-navigable (arrow keys already planned)
- Level editor HTML panel needs proper labels and tab order

**Rollback:** Each feature is in a separate file and can be removed from the scene registry independently.

---

## Appendix A: Shared Infrastructure Changes

### A.1 WebGL Detection Helper

Multiple Phase 1 features need to check for WebGL support before using PostFX:

```typescript
// Add to src/game/RenderUtils.ts (new file)
export function isWebGL(scene: Phaser.Scene): boolean {
  return scene.renderer.type === Phaser.WEBGL;
}
```

### A.2 AudioManager Context Sharing

Phase 3 requires MusicEngine to share the AudioContext with AudioManager:

```typescript
// Add to AudioManager.ts:
static getContext(): AudioContext | null {
  return AudioManager.ctx;
}
```

### A.3 PhysicsManager Minimal World

Phase 4 (Zen Mode) needs a world without a full Level:

```typescript
// Add to PhysicsManager.ts:
buildMinimalWorld(w: number, h: number): void {
  this.clearLevel();
  this.buildFloor(w, h);
  this.buildWalls(w, h);
}
```

---

## Appendix B: Testing Strategy Summary

| Phase | New Test Files | Modified Test Files | Test Type |
|-------|---------------|-------------------|-----------|
| 1 | None | None | Visual regression via Playwright screenshots |
| 2 | PhysicsManager.test.ts | LevelLoader.test.ts | Unit (constraint creation, level count) |
| 3 | MusicEngine.test.ts | AudioManager.test.ts | Unit (layer logic, panning math) |
| 4 | None | None | Manual playtest checklist |
| 5 | EventManager.test.ts | ShareManager.test.ts, ScoreCalculator.test.ts | Unit |
| 6 | StorageManager additions | StorageManager.test.ts | Unit (practice scores) |

**Total estimated new assertions:** approximately 40-60 across all phases.

**Performance monitoring:** After each phase, run Lighthouse and verify:
- FPS stays at 60 on desktop, 55+ on mobile
- Load time stays under 3s on 4G
- Bundle size increase is under 50KB per phase (gzipped)

---

## Implementation Order and Dependencies

```
Phase 1.1-1.5 (independent, parallel)
  |
Phase 1.6 (depends on CameraFX)
  |
Phase 1.7 (touches all scenes -- do last in Phase 1)
  |
Phase 2.1 -> 2.2 -> 2.3 -> 2.4 -> 2.5
  |
Phase 3.1 -> 3.2 -> 3.3/3.4/3.5 (parallel) -> 3.6 -> 3.7 -> 3.8
  |
Phase 4.1 (depends on TrailRenderer, optionally MusicEngine)
  |
Phase 5.1-5.5 (all independent, parallel)
  |
Phase 6.1-6.4 (all independent, parallel)
```

Recommended session groupings for Claude Code sessions:
- Session 7: Phase 1 (all PostFX + transitions)
- Session 8: Phase 2.1-2.3 (schema + PhysicsManager constraints)
- Session 9: Phase 2.4-2.5 (renderers + 18 levels)
- Session 10: Phase 3 (entire music system)
- Session 11: Phase 4 (Zen Mode)
- Session 12: Phase 5 (social features)
- Session 13: Phase 6 (QoL features)

---

### Critical Files for Implementation
- `C:\Users\kreyh\Projekte\Kettenreaktion\src\scenes\GameScene.ts` -- hub for Phases 1, 2, 3 integration
- `C:\Users\kreyh\Projekte\Kettenreaktion\src\game\PhysicsManager.ts` -- Phase 2 constraint creation
- `C:\Users\kreyh\Projekte\Kettenreaktion\src\types\Level.ts` -- Phase 2 schema extension
- `C:\Users\kreyh\Projekte\Kettenreaktion\src\systems\AudioManager.ts` -- Phase 3 context sharing and spatial audio
- `C:\Users\kreyh\Projekte\Kettenreaktion\src\game\CameraFX.ts` -- Phase 1 bokeh, color matrix, and visual effects