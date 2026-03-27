# Game Juice and Polish Research

> Research findings for making Kettenreaktion's chain reactions feel SATISFYING.
> Covers Phaser 3.90 capabilities, implementation patterns, and accessibility.

**Last Updated:** 2026-03-26

---

## Table of Contents

1. [Core Juice Techniques](#1-core-juice-techniques)
2. [Phaser 3 Built-in Effects (FX Pipeline)](#2-phaser-3-built-in-effects-fx-pipeline)
3. [Camera Effects](#3-camera-effects)
4. [Particle Systems](#4-particle-systems)
5. [Tweens and Easing](#5-tweens-and-easing)
6. [Chain Reaction Feel](#6-chain-reaction-feel)
7. [Sound Design](#7-sound-design)
8. [Hit Stop / Freeze Frames](#8-hit-stop--freeze-frames)
9. [UI Micro-Animations](#9-ui-micro-animations)
10. [CSS/Canvas Visual Tricks](#10-csscanvas-visual-tricks)
11. [Loading and Transitions](#11-loading-and-transitions)
12. [Accessibility](#12-accessibility)
13. [Performance Budget](#13-performance-budget)
14. [Implementation Priority](#14-implementation-priority)

---

## 1. Core Juice Techniques

"Juice" = small effects that make player actions feel satisfying without changing gameplay. The goal: every collision, target hit, and chain link should produce visual + audio feedback that rewards the player.

### The Juice Checklist for Kettenreaktion

| Moment | Visual | Audio | Camera |
|--------|--------|-------|--------|
| Object placed | Scale pop (0 -> 1 with Bounce ease) | Soft "thud" | Subtle zoom-in |
| Simulation starts | Placement zone fades, objects wake | Tension sound | Slight pull-back |
| First collision | Squash on impact, spark particles | Impact thud | Micro-shake |
| Chain continues | Escalating glow, trail particles | Rising pitch | -- |
| Target hit | Star burst particles, flash | Chime (pitch rises per target) | Flash white |
| Chain breaks | Fade effect on last moving object | Silence beat | -- |
| All targets hit | Screen-wide particle celebration | Victory fanfare | Zoom + shake |
| Score reveal | Number counter tween | Tick-tick-tick | -- |
| New high score | Glow effect on score | Extra flourish | -- |

---

## 2. Phaser 3 Built-in Effects (FX Pipeline)

Phaser v3.60+ introduced a WebGL-only FX pipeline with 14 built-in shader effects. These work on game objects (Pre-FX) and cameras (Post-FX).

### Available Effects

| Effect | Use in Kettenreaktion |
|--------|----------------------|
| **Glow** | Highlight targets, active chain objects, placement zone |
| **Bloom** | Post-target-hit celebration, "energy" feel |
| **Blur** | Background blur during score reveal, depth of field |
| **Shadow** | Drop shadows on all physics objects for depth |
| **Shine** | Sweeping highlight on targets before simulation |
| **Vignette** | Darken edges during simulation for focus |
| **Pixelate** | Scene transition effect |
| **Wipe/Reveal** | Scene transitions between Menu/Game/Result |
| **ColorMatrix** | Grayscale for "used" attempts, sepia for nostalgia |
| **Barrel** | Subtle lens distortion on big impacts |

### Pre-FX vs Post-FX

- **Pre-FX**: Applied to the game object's texture before rendering. More efficient. Works on: Image, Sprite, TileSprite, Text, RenderTexture, Video.
- **Post-FX**: Applied after rendering in a full-canvas buffer. Works on ALL game objects and cameras. More expensive.
- **Rule of thumb**: Always prefer Pre-FX when possible.

### Implementation Examples

```typescript
// Glow on a target star (Pre-FX, efficient)
const star = this.add.sprite(x, y, 'star');
const glowFx = star.preFX.addGlow(0xffff00, 4, 0, false, 0.1, 32);

// Animate glow pulsing
this.tweens.add({
  targets: glowFx,
  outerStrength: 8,
  yoyo: true,
  repeat: -1,
  duration: 800,
  ease: 'Sine.easeInOut'
});

// Bloom on camera when all targets hit (Post-FX)
const bloomFx = this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 1, 2, 4);
this.tweens.add({
  targets: bloomFx,
  strength: 0,
  duration: 1500,
  ease: 'Cubic.easeOut',
  onComplete: () => this.cameras.main.postFX.remove(bloomFx)
});

// Vignette during simulation for focus
const vignette = this.cameras.main.postFX.addVignette(0.5, 0.5, 0.3, 0.5);

// Shadow on physics objects for depth
physicsSprite.preFX.addShadow(2, 2, 0.06, 1, 0x000000, 6);

// Shine sweep on target before simulation starts
const shineFx = targetSprite.preFX.addShine(0.5, 0.2, 5, false);

// ColorMatrix: grayscale an "already used" attempt indicator
attemptIcon.preFX.addColorMatrix().grayscale(0.8);
```

### Stacking Effects

Effects can be stacked and ordered. A blur + bloom stack creates a dreamy glow:

```typescript
sprite.preFX.addBlur(1, 2, 2, 1);
sprite.preFX.addBloom(0xffffff, 1, 1, 1, 1.5);
```

### Controlling Effects

```typescript
effect.setActive(false);         // Disable temporarily
gameObject.preFX.remove(effect); // Remove permanently
gameObject.preFX.clear();        // Remove all effects
gameObject.preFX.disable();      // Disable the FX component
```

---

## 3. Camera Effects

Phaser 3 cameras have built-in effects that require zero art assets.

### Available Camera Effects

```typescript
// Screen shake on collision impact
// duration (ms), intensity (0-1), force (override existing?)
this.cameras.main.shake(150, 0.005);

// Stronger shake for big chain moments
this.cameras.main.shake(250, 0.01);

// White flash when target is hit
this.cameras.main.flash(200, 255, 255, 255);

// Colored flash (golden for star collection)
this.cameras.main.flash(150, 255, 215, 0);

// Fade out to black for scene transition
this.cameras.main.fadeOut(500, 0, 0, 0);

// Fade in from black when scene starts
this.cameras.main.fadeIn(800, 0, 0, 0);

// Zoom to action area when simulation starts
this.cameras.main.zoomTo(1.15, 800, 'Cubic.easeInOut');

// Pan to follow the chain reaction
this.cameras.main.pan(targetX, targetY, 600, 'Cubic.easeOut');

// Reset zoom after simulation
this.cameras.main.zoomTo(1, 500, 'Cubic.easeOut');

// Rotate (subtle tilt on big impact)
this.cameras.main.rotateTo(0.02, true, 100, 'Linear');
// Then reset:
this.cameras.main.rotateTo(0, true, 200, 'Cubic.easeOut');
```

### Camera Effect Events

```typescript
this.cameras.main.on('camerashakecomplete', () => {
  // Shake finished
});

this.cameras.main.on('camerafadeincomplete', () => {
  // Scene is fully visible
});

this.cameras.main.on('camerazoomcomplete', () => {
  // Zoom animation done
});
```

### Chain Reaction Camera Strategy

```typescript
// Follow the "leading edge" of the chain reaction
// by tracking the most recently colliding body
function followChainLeader(camera: Phaser.Cameras.Scene2D.Camera, body: MatterBody): void {
  camera.pan(body.position.x, body.position.y, 400, 'Sine.easeOut');
}

// Escalating shake based on chain length
function chainShake(camera: Phaser.Cameras.Scene2D.Camera, chainLength: number): void {
  const intensity = Math.min(0.003 + chainLength * 0.001, 0.015);
  const duration = Math.min(80 + chainLength * 20, 300);
  camera.shake(duration, intensity);
}
```

---

## 4. Particle Systems

Phaser 3.60+ uses `scene.add.particles()` directly (the old `ParticleEmitterManager` was removed).

### Particle Emitter Basics

```typescript
// Create an emitter (stopped by default with frequency: -1)
const sparks = this.add.particles(0, 0, 'particle', {
  speed: { min: 50, max: 200 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.6, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 400,
  blendMode: 'ADD',
  frequency: -1,          // Only emit on explode() call
  quantity: 12,
  tint: [0xffff00, 0xff8800, 0xff4400]
});
```

### Specific Effects for Kettenreaktion

#### Impact Sparks (on collision)

```typescript
const impactSparks = this.add.particles(0, 0, 'spark', {
  speed: { min: 30, max: 150 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.4, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 300,
  blendMode: 'ADD',
  frequency: -1,
  quantity: 6,
  tint: 0xffffff
});

// On each collision event:
function onCollision(x: number, y: number): void {
  impactSparks.setPosition(x, y);
  impactSparks.explode();
}
```

#### Target Hit Celebration

```typescript
const starBurst = this.add.particles(0, 0, 'star-particle', {
  speed: { min: 80, max: 250 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.8, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 800,
  blendMode: 'ADD',
  frequency: -1,
  quantity: 20,
  tint: [0xffdd00, 0xffaa00, 0xffffff],
  rotate: { min: 0, max: 360 }
});

// When a target is hit:
function onTargetHit(x: number, y: number): void {
  starBurst.setPosition(x, y);
  starBurst.explode();
}
```

#### Trailing Particles (behind moving objects)

```typescript
const trail = this.add.particles(0, 0, 'dot', {
  speed: 0,
  scale: { start: 0.3, end: 0 },
  alpha: { start: 0.5, end: 0 },
  lifespan: 500,
  blendMode: 'ADD',
  frequency: 30,           // Emit every 30ms while active
  follow: dynamicSprite,   // Follow a moving sprite
  tint: 0x88ccff
});

// Start/stop trail with simulation
trail.start();
trail.stop();
```

#### Victory Confetti (all targets hit)

```typescript
const confetti = this.add.particles(0, 0, 'confetti', {
  x: { min: 0, max: this.scale.width },
  y: -20,
  speedY: { min: 100, max: 300 },
  speedX: { min: -50, max: 50 },
  scale: { min: 0.3, max: 0.8 },
  rotate: { min: 0, max: 360 },
  lifespan: 3000,
  frequency: 50,
  quantity: 3,
  tint: [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff],
  gravityY: 150,
  duration: 2000           // Emit for 2 seconds then stop
});
```

#### Dust Puff (on object landing)

```typescript
const dustPuff = this.add.particles(0, 0, 'dust', {
  speed: { min: 10, max: 40 },
  angle: { min: 160, max: 380 },   // Spread upward
  scale: { start: 0.5, end: 0.1 },
  alpha: { start: 0.6, end: 0 },
  lifespan: 600,
  frequency: -1,
  quantity: 5,
  tint: 0xccbbaa,
  gravityY: -20
});
```

### Gravity Wells

Phaser particles support gravity wells for attraction effects:

```typescript
emitter.createGravityWell({
  x: targetX,
  y: targetY,
  power: 2,
  epsilon: 100,
  gravity: 50
});
```

---

## 5. Tweens and Easing

Tweens are the workhorse for all non-particle animations.

### Available Easing Functions

Phaser 3 provides these easing functions (usable as strings in tween configs):

| Category | Variants | Best For |
|----------|----------|----------|
| `Linear` | -- | Constant speed, timers |
| `Quad` | easeIn, easeOut, easeInOut | Gentle acceleration |
| `Cubic` | easeIn, easeOut, easeInOut | Smooth camera moves |
| `Quart` | easeIn, easeOut, easeInOut | Snappy UI |
| `Quint` | easeIn, easeOut, easeInOut | Dramatic reveals |
| `Sine` | easeIn, easeOut, easeInOut | Pulsing, breathing |
| `Expo` | easeIn, easeOut, easeInOut | Explosive starts |
| `Circ` | easeIn, easeOut, easeInOut | Circular motion |
| `Back` | easeIn, easeOut, easeInOut | Overshoot, springy UI |
| `Bounce` | easeIn, easeOut, easeInOut | Landing, dropping |
| `Elastic` | easeIn, easeOut, easeInOut | Wobbly, rubber-band |
| `Stepped` | (v, steps) | Pixel-art, discrete steps |

### Recommended Easings for Kettenreaktion

```typescript
// Object placement: pop into existence
'Back.easeOut'     // Slight overshoot feels snappy

// Score counter
'Cubic.easeOut'    // Smooth deceleration

// UI element entrance
'Back.easeOut'     // Bouncy, playful

// Camera zoom
'Cubic.easeInOut'  // Smooth both directions

// Pulse/glow loop
'Sine.easeInOut'   // Smooth, organic breathing

// Victory bounce
'Bounce.easeOut'   // Physical, satisfying

// Alert/warning
'Elastic.easeOut'  // Attention-grabbing wobble
```

### Tween Patterns for Game Juice

#### Squash and Stretch on Impact

```typescript
function squashAndStretch(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Sprite,
  impactVelocity: number
): void {
  const intensity = Math.min(impactVelocity / 10, 0.3);

  scene.tweens.chain({
    targets: target,
    tweens: [
      // Squash (flatten on impact)
      {
        scaleX: 1 + intensity,
        scaleY: 1 - intensity,
        duration: 50,
        ease: 'Quad.easeOut'
      },
      // Stretch (bounce back past normal)
      {
        scaleX: 1 - intensity * 0.5,
        scaleY: 1 + intensity * 0.5,
        duration: 80,
        ease: 'Quad.easeOut'
      },
      // Settle to normal
      {
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Elastic.easeOut'
      }
    ]
  });
}
```

#### Object Placement Pop

```typescript
function placementPop(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite): void {
  sprite.setScale(0);
  scene.tweens.add({
    targets: sprite,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}
```

#### Score Counter Animation

```typescript
function animateScore(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  targetScore: number
): void {
  const counter = { value: 0 };
  scene.tweens.add({
    targets: counter,
    value: targetScore,
    duration: 1500,
    ease: 'Cubic.easeOut',
    onUpdate: () => {
      text.setText(Math.floor(counter.value).toString());
    }
  });
}
```

#### Floating Score Popup

```typescript
function floatingScore(scene: Phaser.Scene, x: number, y: number, points: number): void {
  const text = scene.add.text(x, y, `+${points}`, {
    fontSize: '24px',
    fontFamily: 'monospace',
    color: '#ffdd00',
    stroke: '#000000',
    strokeThickness: 3
  });

  scene.tweens.add({
    targets: text,
    y: y - 60,
    alpha: 0,
    scale: 1.5,
    duration: 1000,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy()
  });
}
```

#### Pulsing Highlight (for targets, buttons)

```typescript
function pulseHighlight(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    scaleX: 1.08,
    scaleY: 1.08,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}
```

#### Staggered UI Element Entrance

```typescript
function staggerEntrance(scene: Phaser.Scene, elements: Phaser.GameObjects.GameObject[]): void {
  elements.forEach((el) => {
    (el as Phaser.GameObjects.Components.Transform).setScale(0);
  });

  scene.tweens.add({
    targets: elements,
    scaleX: 1,
    scaleY: 1,
    duration: 400,
    ease: 'Back.easeOut',
    delay: scene.tweens.stagger(100)
  });
}
```

### Tween Chaining

```typescript
// Sequential animations using chain()
scene.tweens.chain({
  targets: sprite,
  tweens: [
    { y: '-=30', duration: 200, ease: 'Quad.easeOut' },
    { y: '+=30', duration: 300, ease: 'Bounce.easeOut' },
    { alpha: 0, duration: 500, ease: 'Linear' }
  ]
});
```

---

## 6. Chain Reaction Feel

This is the core of Kettenreaktion. The chain reaction must ESCALATE in intensity.

### Escalation Pattern

As the chain grows longer, effects should intensify:

```
Chain Link 1:  Small spark, soft thud, no shake
Chain Link 3:  Medium sparks, louder impact, micro-shake
Chain Link 5:  Large sparks + glow, heavy thud, noticeable shake
Chain Link 8:  Particle trails, rising pitch, camera follow
Chain Link 10+: Screen bloom, full celebration audio, everything maxed
```

### Implementation Strategy

```typescript
interface ChainFeedback {
  particleCount: number;
  shakeIntensity: number;
  shakeDuration: number;
  soundVolume: number;
  soundPitch: number;
  glowStrength: number;
  trailsEnabled: boolean;
}

function getChainFeedback(chainLength: number): ChainFeedback {
  const t = Math.min(chainLength / 10, 1); // Normalize 0-1 over 10 links

  return {
    particleCount: Math.floor(4 + t * 16),          // 4 -> 20
    shakeIntensity: 0.002 + t * 0.008,               // 0.002 -> 0.01
    shakeDuration: 80 + t * 170,                      // 80ms -> 250ms
    soundVolume: 0.3 + t * 0.7,                       // 0.3 -> 1.0
    soundPitch: 1.0 + t * 0.5,                        // 1.0 -> 1.5 (semitones up)
    glowStrength: t * 8,                               // 0 -> 8
    trailsEnabled: chainLength >= 5
  };
}
```

### Visual Escalation

```typescript
function onChainCollision(
  scene: Phaser.Scene,
  x: number, y: number,
  chainLength: number
): void {
  const fb = getChainFeedback(chainLength);

  // Particles scale with chain
  sparks.setPosition(x, y);
  sparks.setConfig({ quantity: fb.particleCount });
  sparks.explode();

  // Camera shake scales with chain
  if (fb.shakeIntensity > 0.003) {
    scene.cameras.main.shake(fb.shakeDuration, fb.shakeIntensity);
  }

  // Enable trails on long chains
  if (fb.trailsEnabled) {
    trailEmitter.start();
  }

  // Glow on colliding objects
  if (fb.glowStrength > 0) {
    const glow = collidingSprite.preFX.addGlow(0xffaa00, fb.glowStrength, 0);
    scene.tweens.add({
      targets: glow,
      outerStrength: 0,
      duration: 500,
      onComplete: () => collidingSprite.preFX.remove(glow)
    });
  }
}
```

### The "Combo Meter" Visual

Even without a literal combo counter, the background or scene atmosphere should shift:

```typescript
// Subtle background color shift as chain grows
function updateAtmosphere(scene: Phaser.Scene, chainLength: number): void {
  const t = Math.min(chainLength / 10, 1);

  // Vignette tightens with intensity
  if (vignetteFx) {
    vignetteFx.radius = 0.8 - t * 0.3;  // 0.8 -> 0.5
  }

  // Background tint shifts warmer
  const warmth = Math.floor(t * 40);
  scene.cameras.main.setBackgroundColor(
    Phaser.Display.Color.GetColor(30 + warmth, 30, 50 - warmth)
  );
}
```

---

## 7. Sound Design

### Principles for Puzzle Games

1. **Every action needs audio feedback** -- placement, collision, target hit, score reveal.
2. **Rising pitch = escalation** -- each chain link should sound slightly higher.
3. **Silence is a tool** -- a beat of silence before the victory sound makes it hit harder.
4. **Layer, do not replace** -- add sounds on top of each other for richness.
5. **Keep sounds short** -- 100-500ms for impacts, 1-2s for celebrations.

### Sound Categories

| Category | Examples | Notes |
|----------|----------|-------|
| **UI** | Button click, menu open/close, tab switch | Subtle, consistent |
| **Placement** | Object drop, confirmation tone | Satisfying "thunk" |
| **Collision** | Impact thud, clank, bounce | Vary by material |
| **Chain** | Ascending tones per link | Rising pitch pattern |
| **Target** | Chime, bell, sparkle | Distinct from collisions |
| **Victory** | Fanfare, celebration | Emotional payoff |
| **Failure** | Soft descending tone | Not punishing |
| **Ambient** | Subtle background hum | Sets mood |
| **Timer** | Tick sound, urgency tone | Tension builder |

### Pitch Escalation for Chain Reactions

Use Phaser's built-in sound rate (playback speed = pitch):

```typescript
// Phaser sound with rate control for pitch shifting
function playChainSound(scene: Phaser.Scene, chainLength: number): void {
  // Musical scale: each chain link goes up roughly a semitone
  const baseRate = 1.0;
  const semitone = Math.pow(2, 1 / 12);
  const rate = baseRate * Math.pow(semitone, Math.min(chainLength, 12));

  const sound = scene.sound.add('impact', {
    volume: Math.min(0.3 + chainLength * 0.05, 1.0),
    rate: rate
  });
  sound.play();
  sound.once('complete', () => sound.destroy());
}
```

### Satisfying Chain Reaction Audio Pattern

Inspired by Lumines (rising musical intensity) and Candy Crush (escalating chimes):

```typescript
// Pre-define a pentatonic scale for pleasant chain sounds
const CHAIN_NOTES: number[] = [
  1.0,    // C
  1.122,  // D
  1.260,  // E
  1.498,  // G
  1.682,  // A
  2.0,    // C (octave up)
  2.245,  // D (octave up)
  2.520,  // E (octave up)
];

function playChainNote(scene: Phaser.Scene, chainIndex: number): void {
  const noteIndex = chainIndex % CHAIN_NOTES.length;
  const octaveBoost = Math.floor(chainIndex / CHAIN_NOTES.length);
  const rate = CHAIN_NOTES[noteIndex] * Math.pow(2, octaveBoost);

  scene.sound.play('chain-note', {
    volume: Math.min(0.4 + chainIndex * 0.04, 1.0),
    rate: Math.min(rate, 4.0)  // Cap at 4x to avoid distortion
  });
}
```

### Sound Design Tips

- Use **OGG format** (best compression + browser support).
- Keep the total audio payload under **500KB** for fast loading.
- Use a **single impact sample** pitched up/down for variety.
- Add a **50-100ms silence** before the victory sound for dramatic pause.
- Layer a quiet **reverb tail** on chain sounds for richness.

---

## 8. Hit Stop / Freeze Frames

Hit stop (also called hitstop, hitlag, or freeze frame) is a brief pause on impact. Research shows that ~100ms of stillness between impacts increases perceived strength by about 30%.

### Implementation in Phaser 3

```typescript
// Pause physics for a brief moment on significant impacts
function hitStop(scene: Phaser.Scene, durationMs: number = 80): void {
  // Pause Matter.js world
  scene.matter.world.pause();

  // Resume after duration
  scene.time.delayedCall(durationMs, () => {
    scene.matter.world.resume();
  });
}
```

### Scaled Hit Stop

```typescript
function scaledHitStop(scene: Phaser.Scene, chainLength: number): void {
  if (chainLength < 3) return; // Only freeze on significant chains

  // Longer freeze for bigger chain moments
  const duration = Math.min(40 + chainLength * 10, 150);
  hitStop(scene, duration);
}
```

### Selective Freeze (More Sophisticated)

Instead of freezing the entire world, slow down time:

```typescript
function slowMotionImpact(scene: Phaser.Scene, durationMs: number = 200): void {
  // Slow physics to 10% speed
  scene.matter.world.engine.timing.timeScale = 0.1;

  // Also slow tweens/particles for consistency
  scene.tweens.timeScale = 0.1;

  scene.time.delayedCall(durationMs, () => {
    // Restore normal speed
    scene.tweens.add({
      targets: scene.matter.world.engine.timing,
      timeScale: 1,
      duration: 100,
      ease: 'Quad.easeOut'
    });
    scene.tweens.timeScale = 1;
  });
}
```

### When to Use Hit Stop in Kettenreaktion

- **Target hit**: 80-100ms freeze + camera flash
- **Final target hit**: 150ms freeze + slow-motion resume
- **Heavy object landing**: 50ms freeze if velocity > threshold
- **Chain link 5+**: Brief 40ms micro-freeze per impact

---

## 9. UI Micro-Animations

### Object Placement Feedback

```typescript
// Ghost preview follows cursor with slight lag (lerp)
function updateGhostPreview(
  ghost: Phaser.GameObjects.Sprite,
  pointerX: number,
  pointerY: number
): void {
  ghost.x = Phaser.Math.Linear(ghost.x, pointerX, 0.3);
  ghost.y = Phaser.Math.Linear(ghost.y, pointerY, 0.3);
}

// Placement zone highlight when cursor enters
function onZoneEnter(zone: Phaser.GameObjects.Zone, ghost: Phaser.GameObjects.Sprite): void {
  ghost.setAlpha(0.8);
  ghost.setTint(0x44ff44); // Green = valid

  // Subtle pulse
  scene.tweens.add({
    targets: ghost,
    scaleX: 1.05,
    scaleY: 1.05,
    duration: 200,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
}

// Invalid zone: red tint + shake
function onZoneInvalid(ghost: Phaser.GameObjects.Sprite): void {
  ghost.setTint(0xff4444);
  scene.tweens.add({
    targets: ghost,
    x: ghost.x + 5,
    duration: 50,
    yoyo: true,
    repeat: 3,
    ease: 'Linear'
  });
}
```

### Countdown / Simulation Start

```typescript
// 3-2-1-GO countdown with scale animation
function playCountdown(scene: Phaser.Scene, onComplete: () => void): void {
  const labels = ['3', '2', '1', 'GO!'];
  let index = 0;

  const text = scene.add.text(
    scene.scale.width / 2,
    scene.scale.height / 2,
    '',
    { fontSize: '64px', fontFamily: 'monospace', color: '#ffffff' }
  ).setOrigin(0.5);

  function showNext(): void {
    if (index >= labels.length) {
      text.destroy();
      onComplete();
      return;
    }

    text.setText(labels[index]);
    text.setScale(2);
    text.setAlpha(1);

    scene.tweens.add({
      targets: text,
      scaleX: 1,
      scaleY: 1,
      alpha: 0.5,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        index++;
        showNext();
      }
    });
  }

  showNext();
}
```

### Score Reveal

```typescript
function revealScore(scene: Phaser.Scene, scores: ScoreResult): void {
  const items = [
    { label: 'Targets', value: scores.baseScore },
    { label: 'Chain', value: scores.chainBonus },
    { label: 'Efficiency', value: scores.efficiencyBonus },
    { label: 'Time', value: scores.timeBonus },
  ];

  items.forEach((item, i) => {
    const row = scene.add.text(100, 200 + i * 50, `${item.label}: 0`, {
      fontSize: '28px',
      color: '#ffffff'
    });
    row.setAlpha(0);

    // Staggered entrance
    scene.tweens.add({
      targets: row,
      alpha: 1,
      x: 120,
      duration: 300,
      delay: i * 200,
      ease: 'Back.easeOut'
    });

    // Counter animation
    const counter = { value: 0 };
    scene.tweens.add({
      targets: counter,
      value: item.value,
      duration: 800,
      delay: i * 200 + 300,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        row.setText(`${item.label}: ${Math.floor(counter.value)}`);
      }
    });
  });

  // Total score with emphasis
  scene.time.delayedCall(items.length * 200 + 1200, () => {
    const total = scene.add.text(100, 200 + items.length * 50 + 30,
      `TOTAL: ${scores.total}`, {
        fontSize: '36px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 4
      });
    total.setScale(0);
    scene.tweens.add({
      targets: total,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Glow on total
    total.preFX.addGlow(0xffdd00, 4, 0, false, 0.1, 24);
  });
}
```

### Button Interactions

```typescript
function juicyButton(scene: Phaser.Scene, button: Phaser.GameObjects.Sprite): void {
  button.setInteractive({ useHandCursor: true });

  button.on('pointerover', () => {
    scene.tweens.add({
      targets: button,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 150,
      ease: 'Back.easeOut'
    });
  });

  button.on('pointerout', () => {
    scene.tweens.add({
      targets: button,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Cubic.easeOut'
    });
  });

  button.on('pointerdown', () => {
    scene.tweens.add({
      targets: button,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 80,
      ease: 'Quad.easeIn'
    });
  });

  button.on('pointerup', () => {
    scene.tweens.add({
      targets: button,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Elastic.easeOut'
    });
  });
}
```

### Streak Display Animation

```typescript
function animateStreak(scene: Phaser.Scene, streakCount: number): void {
  // Fire emoji or flame icon per streak day
  const icons: Phaser.GameObjects.Sprite[] = [];

  for (let i = 0; i < streakCount; i++) {
    const icon = scene.add.sprite(50 + i * 30, 50, 'flame');
    icon.setScale(0);
    icons.push(icon);
  }

  scene.tweens.add({
    targets: icons,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut',
    delay: scene.tweens.stagger(80)
  });
}
```

---

## 10. CSS/Canvas Visual Tricks

These work alongside Phaser's WebGL renderer for the HTML wrapper.

### Glow Effects via CSS (for UI overlays)

```css
/* Glowing button */
.game-button {
  box-shadow:
    0 0 10px rgba(255, 200, 0, 0.5),
    0 0 20px rgba(255, 200, 0, 0.3),
    0 0 40px rgba(255, 200, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.game-button:hover {
  box-shadow:
    0 0 15px rgba(255, 200, 0, 0.7),
    0 0 30px rgba(255, 200, 0, 0.5),
    0 0 60px rgba(255, 200, 0, 0.2);
}
```

### Background Gradients

```css
/* Subtle animated background behind the game canvas */
.game-container {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Performance Notes

- CSS `box-shadow` blur values above 20px hurt rendering performance.
- Use `transform` and `opacity` for CSS animations (GPU-accelerated).
- Canvas `shadowBlur` is expensive -- avoid in per-frame draw calls.
- Phaser's WebGL FX pipeline is more performant than raw CSS for in-game effects.

---

## 11. Loading and Transitions

### Loading Screen Best Practices

1. **Show progress** for loads > 4 seconds (use Phaser's loader progress event).
2. **Animate something** to prove the game is not frozen.
3. **Show gameplay tips** or puzzle hints while loading.
4. **Use `ease-out` for progress bar** fill to feel faster at the start.

```typescript
// BootScene loading bar
class BootScene extends Phaser.Scene {
  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height / 2 - 60, 'KETTENREAKTION', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Progress bar
    const barBg = this.add.rectangle(width / 2, height / 2 + 20, 300, 20, 0x333333);
    const barFill = this.add.rectangle(width / 2 - 150, height / 2 + 20, 0, 16, 0xffdd00);
    barFill.setOrigin(0, 0.5);

    // Loading dots animation
    const dots = this.add.text(width / 2, height / 2 + 60, '', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);

    let dotCount = 0;
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        dotCount = (dotCount + 1) % 4;
        dots.setText('Loading' + '.'.repeat(dotCount));
      }
    });

    // Progress handler
    this.load.on('progress', (value: number) => {
      barFill.width = 296 * value;
    });

    this.load.on('complete', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.on('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
```

### Scene Transitions

```typescript
// Smooth transition between scenes
function transitionToScene(
  currentScene: Phaser.Scene,
  targetScene: string,
  data?: Record<string, unknown>
): void {
  // Fade out
  currentScene.cameras.main.fadeOut(400, 0, 0, 0);

  currentScene.cameras.main.on('camerafadeoutcomplete', () => {
    currentScene.scene.start(targetScene, data);
  });
}

// In the receiving scene's create():
function onSceneStart(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(600, 0, 0, 0);
}
```

### Wipe Transition (using FX)

```typescript
// Wipe transition out
const wipe = scene.cameras.main.postFX.addWipe(0, 0, 0);
scene.tweens.add({
  targets: wipe,
  progress: 1,
  duration: 600,
  ease: 'Cubic.easeInOut',
  onComplete: () => {
    scene.scene.start('NextScene');
  }
});
```

---

## 12. Accessibility

### Reduced Motion

Detect and respect the user's OS-level reduced motion preference:

```typescript
// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Listen for changes (user toggles setting mid-game)
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
motionQuery.addEventListener('change', (e) => {
  gameConfig.reducedMotion = e.matches;
});

// Apply throughout the codebase:
function applyJuice(scene: Phaser.Scene): void {
  if (prefersReducedMotion()) {
    // Skip: screen shake, particle effects, squash/stretch
    // Keep: score counters, essential feedback (color changes)
    return;
  }
  // Apply full juice
}
```

### What to Disable in Reduced Motion Mode

| Effect | Reduced Motion Alternative |
|--------|---------------------------|
| Screen shake | Skip entirely |
| Particle explosions | Simple opacity flash |
| Squash/stretch | Skip, use instant scale |
| Bouncing UI | Instant appearance |
| Background animation | Static gradient |
| Hit stop/slow-mo | Skip |
| Trail particles | Skip |
| Pulsing highlights | Static highlight with border |

### What to KEEP in Reduced Motion Mode

- Color changes (feedback without motion)
- Sound effects (audio is unaffected)
- Score counter (use instant set instead of tween)
- Text-based feedback ("Target Hit!")
- Static glow effects (not animated)

### Colorblind Mode

```typescript
interface ColorblindPalette {
  success: number;    // Target hit
  warning: number;    // Low time
  danger: number;     // Failed attempt
  highlight: number;  // Active/selected
  neutral: number;    // Default
}

const PALETTES: Record<string, ColorblindPalette> = {
  normal: {
    success: 0x44ff44,
    warning: 0xffaa00,
    danger: 0xff4444,
    highlight: 0xffdd00,
    neutral: 0xcccccc
  },
  deuteranopia: {
    success: 0x4488ff,   // Blue instead of green
    warning: 0xffcc00,
    danger: 0xff6644,
    highlight: 0xffdd00,
    neutral: 0xcccccc
  },
  protanopia: {
    success: 0x4488ff,   // Blue instead of green
    warning: 0xffcc00,
    danger: 0xff8844,
    highlight: 0xffdd00,
    neutral: 0xcccccc
  }
};
```

### Additional Accessibility Patterns

```typescript
// Pair colors with shapes/icons -- never rely on color alone
// Good: Green checkmark for success, Red X for failure
// Bad: Green circle for success, Red circle for failure

// Add ARIA labels to the game canvas wrapper
const gameDiv = document.getElementById('game-container');
if (gameDiv) {
  gameDiv.setAttribute('role', 'application');
  gameDiv.setAttribute('aria-label', 'Kettenreaktion - Daily Physics Puzzle');
}

// Announce game state changes to screen readers
function announceToScreenReader(message: string): void {
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }
  announcer.textContent = message;
}

// Usage:
announceToScreenReader('Target 2 of 3 hit! Chain length: 5');
announceToScreenReader('Puzzle complete! Score: 1250');
```

### Settings Menu Accessibility Options

Provide an in-game settings panel with these toggles:

| Setting | Default | Description |
|---------|---------|-------------|
| Reduced Motion | Auto-detect | Disable screen shake, particles, animations |
| Colorblind Mode | Off | Deuteranopia / Protanopia / Tritanopia |
| Sound Volume | 80% | Master volume slider |
| Sound Effects | On | Toggle SFX independently |
| Music | On | Toggle background music |
| High Contrast | Off | Stronger outlines, higher contrast colors |

---

## 13. Performance Budget

### Target: 60fps on Mid-Range Mobile (2022 Android)

| Resource | Budget |
|----------|--------|
| Active particles (max) | 100 simultaneous |
| Active tweens (max) | 20 simultaneous |
| FX effects per object (max) | 2 stacked |
| Camera Post-FX (max) | 2 simultaneously |
| Bloom steps | 2-3 (not 4+) |
| Blur quality | Low or Medium |
| Sound files loaded | 15-20 |
| Total audio payload | < 500KB |

### Performance Safety Patterns

```typescript
// Object pool for particles (reuse, do not recreate)
// Phaser particle emitters already handle this internally.

// Limit active effects
const MAX_ACTIVE_GLOWS = 5;
let activeGlows = 0;

function addGlowSafe(sprite: Phaser.GameObjects.Sprite): Phaser.FX.Glow | null {
  if (activeGlows >= MAX_ACTIVE_GLOWS) return null;
  activeGlows++;
  const glow = sprite.preFX.addGlow(0xffaa00, 4, 0);
  return glow;
}

// Clean up FX after use
function removeGlowSafe(sprite: Phaser.GameObjects.Sprite, glow: Phaser.FX.Glow): void {
  sprite.preFX.remove(glow);
  activeGlows--;
}

// Detect low-end devices and reduce effects
function isLowEndDevice(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return true;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  // Basic heuristic -- can be refined
  return /Mali-4|Adreno 3|PowerVR SGX/i.test(renderer);
}

// Adjust quality based on device capability
function getQualityLevel(): 'low' | 'medium' | 'high' {
  if (isLowEndDevice()) return 'low';
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return 'low';
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return 'medium';
  return 'high';
}
```

### Quality Level Presets

```typescript
interface JuiceQuality {
  particles: boolean;
  particleCount: number;
  screenShake: boolean;
  glowEffects: boolean;
  bloomEffect: boolean;
  trailEffects: boolean;
  squashStretch: boolean;
  hitStop: boolean;
  postFX: boolean;
}

const QUALITY_PRESETS: Record<string, JuiceQuality> = {
  low: {
    particles: true,
    particleCount: 4,
    screenShake: false,
    glowEffects: false,
    bloomEffect: false,
    trailEffects: false,
    squashStretch: false,
    hitStop: false,
    postFX: false
  },
  medium: {
    particles: true,
    particleCount: 10,
    screenShake: true,
    glowEffects: true,
    bloomEffect: false,
    trailEffects: false,
    squashStretch: true,
    hitStop: true,
    postFX: false
  },
  high: {
    particles: true,
    particleCount: 20,
    screenShake: true,
    glowEffects: true,
    bloomEffect: true,
    trailEffects: true,
    squashStretch: true,
    hitStop: true,
    postFX: true
  }
};
```

---

## 14. Implementation Priority

Ordered by impact-to-effort ratio. Implement top-to-bottom.

### Tier 1: Essential (MVP Polish)

These take < 1 day each and make the biggest difference:

1. **Camera shake on collision** -- 3 lines of code, huge impact feel
2. **Object placement pop** -- Back.easeOut scale tween, instant satisfaction
3. **Sound on every action** -- placement, collision, target hit, score
4. **Score counter animation** -- tween-based counting, not instant
5. **Camera flash on target hit** -- 1 line, clear feedback
6. **Scene fade transitions** -- fadeIn/fadeOut between scenes

### Tier 2: Important (Post-MVP)

These take 1-3 days and add significant polish:

7. **Impact particles** -- sparks on collision, star burst on target hit
8. **Squash and stretch** -- on physics body collisions
9. **Escalating chain pitch** -- rising notes per chain link
10. **Floating score popups** -- "+100" text floats up on target hit
11. **Button hover/press animations** -- scale tweens on interactive elements
12. **Reduced motion support** -- respect OS preference

### Tier 3: Polish (When Core is Solid)

These take 3-5 days but make the game feel premium:

13. **Glow FX on targets** -- pulsing glow pre-simulation
14. **Hit stop on big impacts** -- brief physics pause
15. **Chain trail particles** -- trail behind fast-moving chain objects
16. **Victory confetti** -- particle celebration on all-targets-hit
17. **Vignette during simulation** -- focus attention on action
18. **Colorblind mode** -- alternative color palettes
19. **Staggered score reveal** -- sequential line-by-line with sound

### Tier 4: Premium (Pre-Launch)

20. **Bloom on celebrations** -- camera post-FX on victory
21. **Slow-motion on final target** -- time scale reduction
22. **Background atmosphere shift** -- color/vignette escalation with chain
23. **Screen reader announcements** -- ARIA live regions
24. **Quality auto-detection** -- device capability presets
25. **Countdown animation** -- 3-2-1-GO before simulation

---

## Sources

### Game Juice Theory
- [Squeezing More Juice Out of Your Game Design - GameAnalytics](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design)
- [Squeezing More Juice Out of Your Game Design - Gamedeveloper](https://www.gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-)
- [Game Feel in Pygame: Juice, Screenshake, and Micro-Animations](https://slicker.me/python/game_feel_pygame.htm)
- [Making a Game Feel "Juicy" with Simple Effects - Medium](https://medium.com/@yemidigitalcash/when-you-play-a-great-game-it-feels-good-d23761b6eccf)
- [3 Basic Skills for Game Juice - Jason Tu](https://jasont.co/juice-techniques/)

### Hit Stop / Impact Feel
- [A More Realistic HitStop](https://www.ahmadmohammadnejad.com/sandbox/a-more-realistic-hitstop)
- [Hitstop/Hitfreeze/Hitlag Analysis - CritPoints](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- [Research on Screen Shake and Hit Stop Effects - Oreate AI](https://www.oreateai.com/blog/research-on-the-mechanism-of-screen-shake-and-hit-stop-effects-on-game-impact/decf24388684845c565d0cc48f09fa24)
- [Thinking About Hitstop - Sakurai / Source Gaming](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)

### Phaser 3 API
- [Phaser 3 FX System Documentation](https://docs.phaser.io/phaser/concepts/fx)
- [Phaser 3 Camera API](https://docs.phaser.io/api-documentation/class/cameras-scene2d-camera)
- [Phaser 3 Glow FX Pipeline](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-glowfxpipeline)
- [Phaser 3 Bloom FX](https://docs.phaser.io/api-documentation/class/fx-bloom)
- [Phaser 3 Particle Emitter](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter)
- [Phaser 3 Particles Concept](https://docs.phaser.io/phaser/concepts/gameobjects/particles)
- [Phaser 3 Particle Trail Effect - Ourcade](https://blog.ourcade.co/posts/2020/how-to-make-particle-trail-effect-phaser-3/)
- [Phaser 3 Ease Equations Example](https://phaser.io/examples/v3.85.0/tweens/eases/view/ease-equations)
- [Rex Rainbow Phaser 3 Notes - Particles](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
- [Rex Rainbow Phaser 3 Notes - Tweens](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tween/)
- [Rex Rainbow Phaser 3 Notes - Camera Effects](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera-effects/)
- [Rex Rainbow Phaser 3 Notes - Easing Functions](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ease-function/)
- [Rex Rainbow Phaser 3 Notes - Built-in Shader Effects](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shader-builtin/)

### Sound Design
- [Lumines Arise Sound Design Interview - Bandcamp](https://daily.bandcamp.com/features/hydelic-takako-ishida-lumines-arise-interview)
- [Unpacking: 14,000 Audio Files - Kotaku](https://kotaku.com/hit-puzzle-game-unpacking-features-14-000-audio-fil-1848000220)
- [Audio for Web Games - MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games)
- [Web Audio API Pitch Shifting](https://zpl.fi/pitch-shifting-in-web-audio-api/)
- [Dynamic Sound with the Web Audio API - SitePoint](https://www.sitepoint.com/dynamic-sound-with-the-web-audio-api/)

### Accessibility
- [Accessible Web Animation WCAG Explained - CSS-Tricks](https://css-tricks.com/accessible-web-animation-the-wcag-on-animation-explained/)
- [Animation and Motion Accessibility - web.dev](https://web.dev/learn/accessibility/motion)
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Using Media Queries for Accessibility - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries_for_accessibility)
- [Design Accessible Animation - Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)

### Loading and Transitions
- [Game Design Rules: Loading Screens - Gamedeveloper](https://www.gamedeveloper.com/design/game-design-rules-loading-screens)
- [Use Transition Screens in Your Games - Medium](https://medium.com/@FredericRP/use-transition-screens-in-your-games-unity-f8742fea219b)
- [Efficient Animation for Web Games - MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Efficient_animation_for_web_games)

### Matter.js
- [Matter.js Rendering Wiki](https://github.com/liabru/matter-js/wiki/Rendering)
- [Matter.Render API Documentation](https://brm.io/matter-js/docs/classes/Render.html)

### CSS/Canvas Effects
- [Creating Glow Effects with CSS - Coder's Block](https://codersblock.com/blog/creating-glow-effects-with-css/)
- [CSS Glow Effect Examples - Subframe](https://www.subframe.com/tips/css-glow-effect-examples)
