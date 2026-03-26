import type { ObjectType } from './Level';

export interface BodyOptions {
  friction?: number;
  frictionAir?: number;
  restitution?: number;
  density?: number;
  isStatic?: boolean;
  angle?: number;
}

export interface PlacedObject {
  type: ObjectType;
  x: number;
  y: number;
  body: MatterJS.BodyType;
}

export interface TargetState {
  id: string;
  hit: boolean;
  sprite: Phaser.GameObjects.Sprite;
  body: MatterJS.BodyType;
}
