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
  seed_variations?: Record<string, SeedVariation>;
}
