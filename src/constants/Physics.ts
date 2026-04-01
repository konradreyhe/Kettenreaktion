import type { BodyOptions } from '../types/GameObject';

export const GRAVITY_Y = 1.0;

export const BODY_PROPERTIES: Record<string, BodyOptions> = {
  ball: { friction: 0.01, frictionAir: 0.01, restitution: 0.7, density: 0.001 },
  domino: { friction: 0.4, frictionAir: 0.01, restitution: 0.05, density: 0.002 },
  crate: { friction: 0.6, frictionAir: 0.01, restitution: 0.2, density: 0.003 },
  weight: { friction: 0.3, frictionAir: 0.01, restitution: 0.1, density: 0.005 },
  bomb: { friction: 0.3, frictionAir: 0.01, restitution: 0.3, density: 0.002 },
  seesaw: { friction: 0.5, frictionAir: 0.01, restitution: 0.1, density: 0.005 },
  static: { isStatic: true, friction: 0.5, restitution: 0.1 },
};

export const SLEEP_THRESHOLD = 60;
export const MAX_BODIES_MOBILE = 30;
export const MAX_BODIES_DESKTOP = 60;
export const FIXED_DELTA = 16.666;
