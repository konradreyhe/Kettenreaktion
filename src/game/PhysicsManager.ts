import Phaser from 'phaser';
import { BODY_PROPERTIES } from '../constants/Physics';
import type { Level, StaticObject, ObjectType } from '../types/Level';
import type { BodyOptions } from '../types/GameObject';

interface TrackedObject {
  sprite: Phaser.Physics.Matter.Sprite | Phaser.GameObjects.Rectangle;
  body: MatterJS.BodyType;
}

/** Single source of truth for creating and managing physics-synced game objects. */
export class PhysicsManager {
  private scene: Phaser.Scene;
  private tracked: TrackedObject[] = [];
  private rawBodies: MatterJS.BodyType[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Build all physics objects for a level. */
  buildLevel(level: Level): void {
    this.clearLevel();
    this.buildFloor(level.world.width, level.world.height);
    this.buildWalls(level.world.width, level.world.height);

    for (const obj of level.staticObjects) {
      this.createStaticBody(obj);
    }

    for (const obj of level.dynamicObjects) {
      this.createDynamicSprite(obj.type, obj.x, obj.y);
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
      shape: type === 'ball'
        ? { type: 'circle', radius: size.width / 2 }
        : undefined,
    });

    sprite.setDisplaySize(size.width, size.height);
    sprite.setDepth(10);

    this.tracked.push({ sprite, body: sprite.body as MatterJS.BodyType });
    return sprite;
  }

  /** Create a static body with a visual rectangle. */
  private createStaticBody(obj: StaticObject): void {
    const height = obj.height ?? 20;
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + height / 2;
    const angleDeg = obj.angle ?? 0;

    // Visual
    const color = obj.type === 'ramp' ? 0x555577 : 0x556666;
    const rect = this.scene.add
      .rectangle(cx, cy, obj.width, height, color)
      .setAngle(angleDeg)
      .setDepth(5);

    // Physics
    const body = this.scene.matter.add.rectangle(cx, cy, obj.width, height, {
      isStatic: true,
      friction: BODY_PROPERTIES['static'].friction ?? 0.5,
      restitution: BODY_PROPERTIES['static'].restitution ?? 0.1,
      angle: Phaser.Math.DegToRad(angleDeg),
      label: obj.type,
    });

    this.tracked.push({ sprite: rect, body });
  }

  /** Floor body. */
  private buildFloor(w: number, h: number): void {
    const rect = this.scene.add
      .rectangle(w / 2, h - 10, w, 20, 0x444466)
      .setDepth(5);

    const body = this.scene.matter.add.rectangle(w / 2, h - 10, w, 20, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.1,
      label: 'floor',
    });

    this.tracked.push({ sprite: rect, body });
  }

  /** Invisible walls to keep objects on-screen. */
  private buildWalls(w: number, h: number): void {
    const wallOpts = { isStatic: true, label: 'wall', friction: 0.3, restitution: 0.2 };

    // Left wall
    const left = this.scene.matter.add.rectangle(-10, h / 2, 20, h, wallOpts);
    this.rawBodies.push(left);

    // Right wall
    const right = this.scene.matter.add.rectangle(w + 10, h / 2, 20, h, wallOpts);
    this.rawBodies.push(right);

    // Ceiling
    const top = this.scene.matter.add.rectangle(w / 2, -10, w, 20, wallOpts);
    this.rawBodies.push(top);
  }

  /** Remove all bodies and sprites. */
  clearLevel(): void {
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
  }

  /** Returns default pixel dimensions for an object type. */
  private getSizeForType(type: ObjectType): { width: number; height: number } {
    switch (type) {
      case 'ball':
        return { width: 24, height: 24 };
      case 'domino':
        return { width: 12, height: 48 };
      case 'crate':
        return { width: 40, height: 40 };
      case 'weight':
        return { width: 32, height: 32 };
      default:
        return { width: 40, height: 20 };
    }
  }
}
