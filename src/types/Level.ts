export type ObjectType =
  | 'ball'
  | 'domino'
  | 'crate'
  | 'weight'
  | 'platform'
  | 'ramp_30'
  | 'ramp_45'
  | 'ramp_60';

export interface StaticObject {
  type: 'platform' | 'ramp';
  x: number;
  y: number;
  width: number;
  height?: number;
  angle?: number;
}

export interface DynamicObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
}

export interface Target {
  id: string;
  type: 'star' | 'bell';
  x: number;
  y: number;
  points: number;
}

export interface PlacementZone {
  x: number;
  y: number;
  width: number;
  height: number;
  allowedObjects: ObjectType[];
}

export interface SeedVariation {
  min: number;
  max: number;
}

export interface LevelConstraint {
  type: 'seesaw' | 'spring' | 'rope';
  /** For seesaw: the static platform index to pivot. */
  staticIndex?: number;
  /** For spring/rope: IDs of the two dynamic objects to connect. */
  bodyA?: string;
  bodyB?: string;
  /** For spring: anchor to a static point instead of a body. */
  anchorA?: { x: number; y: number };
  anchorB?: { x: number; y: number };
  /** Spring stiffness (0-1). Default 0.05 for spring, 1 for rope. */
  stiffness?: number;
  /** Rope segment count. Default 8. */
  segments?: number;
  /** Rest length override. Auto-calculated from body positions if omitted. */
  length?: number;
}

export interface Level {
  id: string;
  name: string;
  difficulty: number;
  theme: 'wood' | 'stone' | 'metal';
  world: { width: number; height: number };
  placementZone: PlacementZone;
  staticObjects: StaticObject[];
  dynamicObjects: DynamicObject[];
  targets: Target[];
  constraints?: LevelConstraint[];
  seed_variations?: Record<string, SeedVariation>;
}
