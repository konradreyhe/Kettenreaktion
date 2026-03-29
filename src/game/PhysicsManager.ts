import Phaser from 'phaser';
import { BODY_PROPERTIES, MAX_BODIES_MOBILE, MAX_BODIES_DESKTOP } from '../constants/Physics';
import type { Level, StaticObject, ObjectType, LevelConstraint } from '../types/Level';
import type { BodyOptions } from '../types/GameObject';

interface TrackedObject {
  sprite: Phaser.GameObjects.GameObject;
  body: MatterJS.BodyType;
}

/** Single source of truth for creating and managing physics-synced game objects. */
export class PhysicsManager {
  private scene: Phaser.Scene;
  private tracked: TrackedObject[] = [];
  private rawBodies: MatterJS.BodyType[] = [];
  private rawConstraints: MatterJS.ConstraintType[] = [];
  private constraintGraphics: Phaser.GameObjects.Graphics[] = [];
  private constraintUpdateFns: (() => void)[] = [];
  private glowCleanups: (() => void)[] = [];
  /** Map dynamic object IDs to their Matter bodies for constraint lookup. */
  private dynamicBodyMap: Map<string, MatterJS.BodyType> = new Map();
  private gravityFlipped = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private get maxBodies(): number {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return isMobile ? MAX_BODIES_MOBILE : MAX_BODIES_DESKTOP;
  }

  buildLevel(level: Level, gravityFlipped = false): void {
    this.clearLevel();
    this.gravityFlipped = gravityFlipped;
    this.buildFloor(level.world.width, level.world.height, gravityFlipped);
    this.buildWalls(level.world.width, level.world.height);

    for (const obj of level.staticObjects) {
      this.createStaticBody(obj);
    }

    const bodyLimit = this.maxBodies;
    for (const obj of level.dynamicObjects) {
      if (this.tracked.length >= bodyLimit) break;
      const sprite = this.createDynamicSprite(obj.type, obj.x, obj.y);
      this.dynamicBodyMap.set(obj.id, sprite.body as MatterJS.BodyType);
    }

    // Build constraints after all bodies exist
    if (level.constraints) {
      for (const constraint of level.constraints) {
        this.createConstraint(constraint, level);
      }
    }
  }

  /** Create a dynamic Matter sprite — auto-syncs position + rotation. */
  createDynamicSprite(
    type: ObjectType,
    x: number,
    y: number,
    overrides?: BodyOptions
  ): Phaser.Physics.Matter.Sprite {
    const props = { ...BODY_PROPERTIES[type], ...overrides };
    const size = this.getSizeForType(type);

    const sprite = this.scene.matter.add.sprite(x, y, type, undefined, {
      friction: props.friction,
      frictionAir: props.frictionAir,
      restitution: props.restitution,
      density: props.density,
      label: type,
      shape: type === 'ball' || type === 'weight'
        ? { type: 'circle', radius: size.width / 2 }
        : undefined,
    });

    sprite.setDisplaySize(size.width, size.height);
    sprite.setDepth(10);

    this.tracked.push({ sprite, body: sprite.body as MatterJS.BodyType });
    return sprite;
  }

  /** Create a player-placed object with a distinct glow. */
  createPlayerObject(
    type: ObjectType,
    x: number,
    y: number
  ): Phaser.Physics.Matter.Sprite {
    const sprite = this.createDynamicSprite(type, x, y);
    sprite.setDepth(15);

    // Cyan tint to distinguish player's object
    sprite.setTint(0x88ccff);

    // Add glow ring behind — tracked so it's cleaned up properly
    const size = this.getSizeForType(type);
    const glow = this.scene.add
      .circle(x, y, size.width * 0.8, 0x44aaff, 0.25)
      .setDepth(14);

    // Follow the sprite via tracked update callback (cleaned up in clearLevel)
    const updateFn = () => {
      if (sprite.active && !sprite.body) {
        glow.destroy();
        this.scene.events.off('update', updateFn);
      } else if (sprite.active) {
        glow.setPosition(sprite.x, sprite.y);
      }
    };
    this.scene.events.on('update', updateFn);
    this.glowCleanups.push(() => {
      glow.destroy();
      this.scene.events.off('update', updateFn);
    });

    return sprite;
  }

  /** Create a static body with tiled texture visual. */
  private createStaticBody(obj: StaticObject): void {
    const height = obj.height ?? 20;
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + height / 2;
    const angleDeg = obj.angle ?? 0;

    // Choose tile texture based on type
    const tileKey = obj.type === 'ramp' ? 'ramp_tile' : 'platform_tile';
    const borderColor = obj.type === 'ramp' ? 0x6666aa : 0x77aaaa;

    // Tiled sprite for textured look
    const tileSprite = this.scene.add
      .tileSprite(cx, cy, obj.width, height, tileKey)
      .setAngle(angleDeg)
      .setDepth(5);

    // Border outline on top
    const border = this.scene.add.graphics().setDepth(6);
    border.lineStyle(1.5, borderColor, 0.5);
    border.strokeRect(
      cx - obj.width / 2,
      cy - height / 2,
      obj.width,
      height
    );
    // Note: border won't rotate with angle — for angled objects we skip it
    if (angleDeg !== 0) {
      border.clear();
    }

    // Top surface highlight for platforms
    if (obj.type === 'platform' && angleDeg === 0) {
      const highlight = this.scene.add.graphics().setDepth(7);
      highlight.lineStyle(2, 0xaadddd, 0.25);
      highlight.moveTo(cx - obj.width / 2, cy - height / 2);
      highlight.lineTo(cx + obj.width / 2, cy - height / 2);
      highlight.strokePath();
    }

    // Physics body
    const body = this.scene.matter.add.rectangle(cx, cy, obj.width, height, {
      isStatic: true,
      friction: BODY_PROPERTIES['static'].friction ?? 0.5,
      restitution: BODY_PROPERTIES['static'].restitution ?? 0.1,
      angle: Phaser.Math.DegToRad(angleDeg),
      label: obj.type,
    });

    this.tracked.push({ sprite: tileSprite, body });
  }

  private buildFloor(w: number, h: number, flipped = false): void {
    const floorH = 20;
    const floorY = flipped ? floorH / 2 : h - floorH / 2;
    const edgeY = flipped ? floorH : h - floorH;

    const tileSprite = this.scene.add
      .tileSprite(w / 2, floorY, w, floorH, 'floor_tile')
      .setDepth(5);

    const edge = this.scene.add.graphics().setDepth(7);
    // Edge highlight on the side facing the play area
    edge.lineStyle(2, 0x7a9a8a, 0.4);
    edge.moveTo(0, edgeY);
    edge.lineTo(w, edgeY);
    edge.strokePath();
    edge.lineStyle(1, 0x000000, 0.2);
    edge.moveTo(0, edgeY + (flipped ? -2 : 2));
    edge.lineTo(w, edgeY + (flipped ? -2 : 2));
    edge.strokePath();

    const body = this.scene.matter.add.rectangle(w / 2, floorY, w, floorH, {
      isStatic: true, friction: 0.5, restitution: 0.1, label: 'floor',
    });

    this.tracked.push({ sprite: tileSprite, body });
  }

  private buildWalls(w: number, h: number): void {
    const wallOpts = { isStatic: true, label: 'wall', friction: 0.3, restitution: 0.2 };
    this.rawBodies.push(this.scene.matter.add.rectangle(-10, h / 2, 20, h, wallOpts));
    this.rawBodies.push(this.scene.matter.add.rectangle(w + 10, h / 2, 20, h, wallOpts));
    this.rawBodies.push(this.scene.matter.add.rectangle(w / 2, -10, w, 20, wallOpts));
  }

  /** Build just floor + walls — for Zen mode or other sandbox scenes. */
  buildMinimalWorld(w: number, h: number): void {
    this.clearLevel();
    this.buildFloor(w, h);
    this.buildWalls(w, h);
  }

  /** Create a physics constraint from level data. */
  private createConstraint(def: LevelConstraint, level: Level): void {
    switch (def.type) {
      case 'seesaw':
        this.createSeesaw(def, level);
        break;
      case 'spring':
        this.createSpring(def);
        break;
      case 'rope':
        this.createRope(def);
        break;
    }
  }

  /** Seesaw: pin a static platform so it can rotate around its center. */
  private createSeesaw(def: LevelConstraint, level: Level): void {
    if (def.staticIndex === undefined) return;
    const staticObj = level.staticObjects[def.staticIndex];
    if (!staticObj) return;

    const height = staticObj.height ?? 20;
    const cx = staticObj.x + staticObj.width / 2;
    const cy = staticObj.y + height / 2;

    // Remove the existing static body for this platform and replace with dynamic
    // Find and remove the static body that was already created
    const existingIdx = this.tracked.findIndex((t) => {
      const pos = t.body.position;
      return Math.abs(pos.x - cx) < 2 && Math.abs(pos.y - cy) < 2 && t.body.isStatic;
    });

    if (existingIdx >= 0) {
      const existing = this.tracked[existingIdx];
      this.scene.matter.world.remove(existing.body);
      existing.sprite.destroy();
      this.tracked.splice(existingIdx, 1);
    }

    // Create dynamic body for the seesaw plank
    const tileSprite = this.scene.add
      .tileSprite(cx, cy, staticObj.width, height, 'platform_tile')
      .setDepth(5);

    const body = this.scene.matter.add.rectangle(cx, cy, staticObj.width, height, {
      isStatic: false,
      friction: 0.5,
      restitution: 0.1,
      density: 0.005,
      label: 'seesaw',
    });

    this.tracked.push({ sprite: tileSprite, body });

    // Pin constraint: pivot at center
    // Use Phaser's constraint with the body pinned to a fixed point
    // pointA = {0,0} (center of body), pointB = world position
    const pivot = this.scene.matter.add.worldConstraint(body, 0, 1, {
      pointA: { x: 0, y: 0 },
      pointB: { x: cx, y: cy },
      damping: 0.05,
    });
    this.rawConstraints.push(pivot);

    // Sync sprite to body each frame
    const updateFn = () => {
      tileSprite.setPosition(body.position.x, body.position.y);
      tileSprite.setAngle(Phaser.Math.RadToDeg(body.angle));
    };
    this.scene.events.on('update', updateFn);
    this.constraintUpdateFns.push(updateFn);

    // Visual pivot marker (triangle — flips direction with gravity)
    const gfx = this.scene.add.graphics().setDepth(8);
    gfx.fillStyle(0x88aacc, 0.6);
    if (this.gravityFlipped) {
      gfx.fillTriangle(cx - 8, cy - 12, cx + 8, cy - 12, cx, cy - 2);
    } else {
      gfx.fillTriangle(cx - 8, cy + 12, cx + 8, cy + 12, cx, cy + 2);
    }
    gfx.lineStyle(1, 0xaaccee, 0.4);
    gfx.strokeCircle(cx, cy, 4);
    this.constraintGraphics.push(gfx);
  }

  /** Spring: elastic connection between two bodies or body and anchor point. */
  private createSpring(def: LevelConstraint): void {
    const bodyA = def.bodyA ? this.dynamicBodyMap.get(def.bodyA) : null;
    const bodyB = def.bodyB ? this.dynamicBodyMap.get(def.bodyB) : null;
    const stiffness = def.stiffness ?? 0.05;
    const length = def.length;

    if (bodyA && bodyB) {
      const constraint = this.scene.matter.add.constraint(bodyA, bodyB, length, stiffness);
      this.rawConstraints.push(constraint);
      this.addSpringVisual(constraint, bodyA, bodyB);
    } else if (bodyA && def.anchorB) {
      const constraint = this.scene.matter.add.worldConstraint(bodyA, length, stiffness, {
        pointA: { x: 0, y: 0 },
        pointB: { x: def.anchorB.x, y: def.anchorB.y },
      });
      this.rawConstraints.push(constraint);
      this.addSpringVisualAnchored(constraint, bodyA, def.anchorB);
    }
  }

  /** Visual: draw a zigzag spring line between two bodies. */
  private addSpringVisual(
    constraint: MatterJS.ConstraintType,
    bodyA: MatterJS.BodyType,
    bodyB: MatterJS.BodyType
  ): void {
    const gfx = this.scene.add.graphics().setDepth(4);
    this.constraintGraphics.push(gfx);

    const updateFn = () => {
      gfx.clear();
      this.drawSpringLine(gfx, bodyA.position, bodyB.position);
    };
    this.scene.events.on('update', updateFn);
    this.constraintUpdateFns.push(updateFn);
  }

  /** Visual: draw a spring line between body and static anchor. */
  private addSpringVisualAnchored(
    constraint: MatterJS.ConstraintType,
    body: MatterJS.BodyType,
    anchor: { x: number; y: number }
  ): void {
    const gfx = this.scene.add.graphics().setDepth(4);
    this.constraintGraphics.push(gfx);

    // Anchor dot
    const dot = this.scene.add.circle(anchor.x, anchor.y, 4, 0x88aacc, 0.6).setDepth(8);
    this.constraintGraphics.push(dot as unknown as Phaser.GameObjects.Graphics);

    const updateFn = () => {
      gfx.clear();
      this.drawSpringLine(gfx, body.position, anchor);
    };
    this.scene.events.on('update', updateFn);
    this.constraintUpdateFns.push(updateFn);
  }

  /** Draw a zigzag spring between two points. */
  private drawSpringLine(
    gfx: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const coils = 8;
    const amplitude = 6;
    const nx = -dy / dist;
    const ny = dx / dist;

    gfx.lineStyle(2, 0x66aadd, 0.7);
    gfx.beginPath();
    gfx.moveTo(from.x, from.y);

    for (let i = 1; i <= coils; i++) {
      const t = i / (coils + 1);
      const px = from.x + dx * t;
      const py = from.y + dy * t;
      const side = i % 2 === 0 ? 1 : -1;
      gfx.lineTo(px + nx * amplitude * side, py + ny * amplitude * side);
    }

    gfx.lineTo(to.x, to.y);
    gfx.strokePath();
  }

  /** Rope: chain of small bodies connected by stiff constraints. */
  private createRope(def: LevelConstraint): void {
    const segments = def.segments ?? 8;
    const bodyA = def.bodyA ? this.dynamicBodyMap.get(def.bodyA) : null;
    const anchorA = def.anchorA;
    const bodyB = def.bodyB ? this.dynamicBodyMap.get(def.bodyB) : null;
    const anchorB = def.anchorB;

    // Determine start and end positions
    const startX = bodyA ? bodyA.position.x : anchorA?.x ?? 0;
    const startY = bodyA ? bodyA.position.y : anchorA?.y ?? 0;
    const endX = bodyB ? bodyB.position.x : anchorB?.x ?? 0;
    const endY = bodyB ? bodyB.position.y : anchorB?.y ?? 0;

    const segBodies: MatterJS.BodyType[] = [];
    const segSize = 6;
    const stiffness = def.stiffness ?? 0.8;

    // Create segment bodies along the line
    for (let i = 0; i < segments; i++) {
      const t = (i + 1) / (segments + 1);
      const sx = startX + (endX - startX) * t;
      const sy = startY + (endY - startY) * t;

      const segBody = this.scene.matter.add.circle(sx, sy, segSize / 2, {
        density: 0.001,
        friction: 0.2,
        restitution: 0.0,
        label: 'rope_segment',
      });
      segBodies.push(segBody);
      this.rawBodies.push(segBody);
    }

    // Connect start to first segment
    const firstSeg = segBodies[0];
    if (bodyA) {
      this.rawConstraints.push(
        this.scene.matter.add.constraint(bodyA, firstSeg, undefined, stiffness)
      );
    } else if (anchorA) {
      this.rawConstraints.push(
        this.scene.matter.add.worldConstraint(firstSeg, undefined, stiffness, {
          pointA: { x: 0, y: 0 },
          pointB: { x: anchorA.x, y: anchorA.y },
        })
      );
    }

    // Connect segments to each other
    for (let i = 0; i < segBodies.length - 1; i++) {
      this.rawConstraints.push(
        this.scene.matter.add.constraint(segBodies[i], segBodies[i + 1], undefined, stiffness)
      );
    }

    // Connect last segment to end
    const lastSeg = segBodies[segBodies.length - 1];
    if (bodyB) {
      this.rawConstraints.push(
        this.scene.matter.add.constraint(lastSeg, bodyB, undefined, stiffness)
      );
    } else if (anchorB) {
      this.rawConstraints.push(
        this.scene.matter.add.worldConstraint(lastSeg, undefined, stiffness, {
          pointA: { x: 0, y: 0 },
          pointB: { x: anchorB.x, y: anchorB.y },
        })
      );
    }

    // Visual: draw rope line through segments each frame
    const gfx = this.scene.add.graphics().setDepth(4);
    this.constraintGraphics.push(gfx);

    const updateFn = () => {
      gfx.clear();
      gfx.lineStyle(3, 0x886644, 0.8);
      gfx.beginPath();

      const sX = bodyA ? bodyA.position.x : anchorA?.x ?? 0;
      const sY = bodyA ? bodyA.position.y : anchorA?.y ?? 0;
      gfx.moveTo(sX, sY);

      for (const seg of segBodies) {
        gfx.lineTo(seg.position.x, seg.position.y);
      }

      const eX = bodyB ? bodyB.position.x : anchorB?.x ?? 0;
      const eY = bodyB ? bodyB.position.y : anchorB?.y ?? 0;
      gfx.lineTo(eX, eY);
      gfx.strokePath();
    };
    this.scene.events.on('update', updateFn);
    this.constraintUpdateFns.push(updateFn);
  }

  clearLevel(): void {
    // Clean up glow follow callbacks
    for (const cleanup of this.glowCleanups) {
      cleanup();
    }
    this.glowCleanups = [];

    // Clean up constraint visuals and update callbacks
    for (const fn of this.constraintUpdateFns) {
      this.scene.events.off('update', fn);
    }
    this.constraintUpdateFns = [];
    for (const gfx of this.constraintGraphics) {
      gfx.destroy();
    }
    this.constraintGraphics = [];

    // Remove constraints
    for (const c of this.rawConstraints) {
      this.scene.matter.world.removeConstraint(c);
    }
    this.rawConstraints = [];

    for (const obj of this.tracked) {
      if (obj.sprite instanceof Phaser.Physics.Matter.Sprite) {
        obj.sprite.destroy();
      } else {
        this.scene.matter.world.remove(obj.body);
        obj.sprite.destroy();
      }
    }
    for (const body of this.rawBodies) {
      this.scene.matter.world.remove(body);
    }
    this.tracked = [];
    this.rawBodies = [];
    this.dynamicBodyMap.clear();
  }

  private getSizeForType(type: ObjectType): { width: number; height: number } {
    switch (type) {
      case 'ball': return { width: 28, height: 28 };
      case 'domino': return { width: 16, height: 48 };
      case 'crate': return { width: 40, height: 40 };
      case 'weight': return { width: 34, height: 34 };
      default: return { width: 40, height: 20 };
    }
  }
}
