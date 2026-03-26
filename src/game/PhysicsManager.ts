import Phaser from 'phaser';
import { BODY_PROPERTIES } from '../constants/Physics';
import type { Level, StaticObject, DynamicObject, ObjectType } from '../types/Level';
import type { BodyOptions } from '../types/GameObject';

/** Single source of truth for creating and managing Matter.js bodies. */
export class PhysicsManager {
  private scene: Phaser.Scene;
  private bodies: MatterJS.BodyType[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Build all physics objects for a level. */
  buildLevel(level: Level): void {
    this.clearLevel();
    this.buildFloor(level.world.width, level.world.height);

    for (const obj of level.staticObjects) {
      this.createStaticBody(obj);
    }

    for (const obj of level.dynamicObjects) {
      this.createDynamicBody(obj.type, obj.x, obj.y);
    }
  }

  /** Create a dynamic physics body at the given position. */
  createDynamicBody(
    type: ObjectType,
    x: number,
    y: number,
    overrides?: BodyOptions
  ): MatterJS.BodyType {
    const props = { ...BODY_PROPERTIES[type], ...overrides };
    const size = this.getSizeForType(type);

    let body: MatterJS.BodyType;

    if (type === 'ball') {
      body = this.scene.matter.add.circle(x, y, size.width / 2, {
        friction: props.friction,
        frictionAir: props.frictionAir,
        restitution: props.restitution,
        density: props.density,
        label: type,
      });
    } else {
      body = this.scene.matter.add.rectangle(
        x,
        y,
        size.width,
        size.height,
        {
          friction: props.friction,
          frictionAir: props.frictionAir,
          restitution: props.restitution,
          density: props.density,
          label: type,
        }
      );
    }

    this.bodies.push(body);
    return body;
  }

  /** Create a static body from a level object definition. */
  private createStaticBody(obj: StaticObject): MatterJS.BodyType {
    const props = BODY_PROPERTIES['static'];
    const height = obj.height ?? 20;

    const body = this.scene.matter.add.rectangle(
      obj.x + obj.width / 2,
      obj.y + height / 2,
      obj.width,
      height,
      {
        isStatic: true,
        friction: props.friction,
        restitution: props.restitution,
        angle: obj.angle ? Phaser.Math.DegToRad(obj.angle) : 0,
        label: obj.type,
      }
    );

    this.bodies.push(body);
    return body;
  }

  /** Create the floor/ground body. */
  private buildFloor(worldWidth: number, worldHeight: number): void {
    const floor = this.scene.matter.add.rectangle(
      worldWidth / 2,
      worldHeight - 10,
      worldWidth,
      20,
      {
        isStatic: true,
        friction: 0.5,
        restitution: 0.1,
        label: 'floor',
      }
    );
    this.bodies.push(floor);
  }

  /** Remove all bodies and clean up. */
  clearLevel(): void {
    for (const body of this.bodies) {
      this.scene.matter.world.remove(body);
    }
    this.bodies = [];
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
