import Phaser from 'phaser';
import { BODY_PROPERTIES } from '../constants/Physics';
import type { Level, StaticObject, ObjectType } from '../types/Level';
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

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

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

    // Add glow ring behind
    const size = this.getSizeForType(type);
    const glow = this.scene.add
      .circle(x, y, size.width * 0.8, 0x44aaff, 0.25)
      .setDepth(14);

    // Follow the sprite
    this.scene.events.on('update', () => {
      if (sprite.active) {
        glow.setPosition(sprite.x, sprite.y);
      } else {
        glow.destroy();
      }
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

  private buildFloor(w: number, h: number): void {
    const floorH = 20;
    const tileSprite = this.scene.add
      .tileSprite(w / 2, h - floorH / 2, w, floorH, 'platform_tile')
      .setDepth(5);

    // Top edge line
    const edge = this.scene.add.graphics().setDepth(7);
    edge.lineStyle(2, 0x88aaaa, 0.3);
    edge.moveTo(0, h - floorH);
    edge.lineTo(w, h - floorH);
    edge.strokePath();

    const body = this.scene.matter.add.rectangle(w / 2, h - floorH / 2, w, floorH, {
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
