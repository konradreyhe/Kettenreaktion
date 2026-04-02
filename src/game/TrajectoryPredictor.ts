import Phaser from 'phaser';
import { BODY_PROPERTIES } from '../constants/Physics';
import type { Level, ObjectType } from '../types/Level';

interface Obstacle {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  sin: number;
  cos: number;
  restitution: number;
  friction: number;
}

/** Number of simulation steps (~1.5 seconds at 60fps). */
const MAX_STEPS = 90;

/** Sample a point every N steps for drawing. */
const SAMPLE_INTERVAL = 2;

/** Skip re-simulation if cursor moved less than this (squared). */
const MOVE_THRESHOLD_SQ = 16;

/** Radius for circle collision (ball). */
const BALL_RADIUS = 14;

/** Dot styling. */
const DOT_COLOR = 0x88ccff;
const DOT_ALPHA_START = 0.5;
const DOT_ALPHA_END = 0.05;
const DOT_RADIUS = 2.5;

/**
 * Predicts and draws a trajectory arc for the player's ball during placement hover.
 *
 * Uses Verlet integration matching Matter.js physics + circle-vs-rotated-rectangle
 * collision detection against level geometry. Only simulates the placed ball — doesn't
 * predict interactions with existing dynamic objects.
 */
export class TrajectoryPredictor {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private obstacles: Obstacle[] = [];
  private lastX = -999;
  private lastY = -999;
  private gravityStep = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setDepth(12);
  }

  /** Build collision data from level geometry. Call once per level load. */
  setLevel(level: Level): void {
    this.obstacles = [];

    // Read gravity from the live engine (respects daily mutations)
    // Matter.js Verlet integration applies gravity as: acceleration * delta^2
    // where delta is the timestep in ms (~16.667 at 60fps)
    const world = this.scene.matter.world as Phaser.Physics.Matter.World & { engine: { gravity: { y: number; scale: number } } };
    const engine = world.engine;
    const delta = world.getDelta();
    this.gravityStep = engine.gravity.y * engine.gravity.scale * delta * delta;

    const w = level.world.width;
    const h = level.world.height;

    // Floor
    const floorH = 20;
    this.addRect(w / 2, h - floorH / 2, w, floorH, 0, 0.1, 0.5);

    // Walls + ceiling
    this.addRect(-10, h / 2, 20, h, 0, 0.2, 0.3);
    this.addRect(w + 10, h / 2, 20, h, 0, 0.2, 0.3);
    this.addRect(w / 2, -10, w, 20, 0, 0.2, 0.3);

    // Static objects from level data
    for (const obj of level.staticObjects) {
      if (obj.type === 'magnet') continue; // sensors, not solid
      const oh = obj.height ?? 20;
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + oh / 2;
      const angleDeg = obj.angle ?? 0;
      this.addRect(cx, cy, obj.width, oh, angleDeg, 0.1, 0.5);
    }
  }

  /** Update the prediction arc for a new cursor position. */
  update(x: number, y: number, objectType: ObjectType): void {
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    if (dx * dx + dy * dy < MOVE_THRESHOLD_SQ) return;
    this.lastX = x;
    this.lastY = y;

    const points = this.simulate(x, y, objectType);
    this.draw(points);
  }

  /** Clear the arc visual. */
  clear(): void {
    this.graphics.clear();
    this.lastX = -999;
    this.lastY = -999;
  }

  /** Clean up on scene shutdown. */
  destroy(): void {
    this.graphics.destroy();
    this.obstacles = [];
  }

  // ---------------------------------------------------------------------------
  // Simulation
  // ---------------------------------------------------------------------------

  private simulate(
    startX: number,
    startY: number,
    objectType: ObjectType
  ): Array<{ x: number; y: number }> {
    const props = BODY_PROPERTIES[objectType];
    const airFriction = 1 - (props?.frictionAir ?? 0.01);
    const restitution = props?.restitution ?? 0.7;
    const radius = this.getRadius(objectType);
    const g = this.gravityStep;

    // Verlet state — ball starts at rest
    let px = startX;
    let py = startY;
    let prevX = px;
    let prevY = py;

    const points: Array<{ x: number; y: number }> = [{ x: px, y: py }];

    for (let step = 0; step < MAX_STEPS; step++) {
      // Velocity from position delta (Matter.js Verlet style)
      let vx = (px - prevX) * airFriction;
      let vy = (py - prevY) * airFriction;

      prevX = px;
      prevY = py;

      // Apply gravity + advance position
      px += vx;
      py += vy + g;

      // Collision response against all static obstacles
      for (const obs of this.obstacles) {
        const result = this.circleRectCollision(px, py, radius, obs);
        if (result) {
          // Push ball out of obstacle
          px += result.nx * result.depth;
          py += result.ny * result.depth;

          // Reflect velocity along normal
          vx = px - prevX;
          vy = py - prevY;
          const dot = vx * result.nx + vy * result.ny;
          if (dot < 0) {
            // Bounce with combined restitution
            const bounce = Math.max(restitution, obs.restitution);
            px -= result.nx * dot * (1 + bounce);
            py -= result.ny * dot * (1 + bounce);

            // Apply surface friction tangentially
            const tx = -result.ny;
            const ty = result.nx;
            const tangentDot = vx * tx + vy * ty;
            const frictionForce = tangentDot * obs.friction * 0.5;
            px -= tx * frictionForce;
            py -= ty * frictionForce;
          }
        }
      }

      if (step % SAMPLE_INTERVAL === 0) {
        points.push({ x: px, y: py });
      }
    }

    return points;
  }

  // ---------------------------------------------------------------------------
  // Collision detection: circle vs. rotated rectangle
  // ---------------------------------------------------------------------------

  private circleRectCollision(
    cx: number,
    cy: number,
    radius: number,
    obs: Obstacle
  ): { nx: number; ny: number; depth: number } | null {
    // Transform circle center into rectangle's local space
    const dx = cx - obs.cx;
    const dy = cy - obs.cy;
    const localX = dx * obs.cos + dy * obs.sin;
    const localY = -dx * obs.sin + dy * obs.cos;

    // Clamp to rectangle extent
    const closestX = Math.max(-obs.hw, Math.min(obs.hw, localX));
    const closestY = Math.max(-obs.hh, Math.min(obs.hh, localY));

    // Distance from circle center to closest point
    const distX = localX - closestX;
    const distY = localY - closestY;
    const distSq = distX * distX + distY * distY;

    if (distSq >= radius * radius) return null;

    const dist = Math.sqrt(distSq);
    const depth = radius - dist;

    let nx: number;
    let ny: number;

    if (dist < 0.001) {
      // Circle center is inside rectangle — push out along shortest axis
      const overlapX = obs.hw - Math.abs(localX);
      const overlapY = obs.hh - Math.abs(localY);
      if (overlapX < overlapY) {
        const signX = localX < 0 ? -1 : 1;
        nx = signX * obs.cos;
        ny = signX * obs.sin;
      } else {
        const signY = localY < 0 ? -1 : 1;
        nx = -signY * obs.sin;
        ny = signY * obs.cos;
      }
      return { nx, ny, depth: Math.min(overlapX, overlapY) + radius };
    }

    // Normal in local space, then rotate back to world
    const localNx = distX / dist;
    const localNy = distY / dist;
    nx = localNx * obs.cos - localNy * obs.sin;
    ny = localNx * obs.sin + localNy * obs.cos;

    return { nx, ny, depth };
  }

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------

  private draw(points: Array<{ x: number; y: number }>): void {
    this.graphics.clear();
    if (points.length < 2) return;

    for (let i = 1; i < points.length; i++) {
      const t = i / points.length;
      const alpha = DOT_ALPHA_START + (DOT_ALPHA_END - DOT_ALPHA_START) * t;
      const r = DOT_RADIUS * (1 - t * 0.4);
      this.graphics.fillStyle(DOT_COLOR, alpha);
      this.graphics.fillCircle(points[i].x, points[i].y, r);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private addRect(
    cx: number,
    cy: number,
    w: number,
    h: number,
    angleDeg: number,
    restitution: number,
    friction: number
  ): void {
    const rad = angleDeg * (Math.PI / 180);
    this.obstacles.push({
      cx,
      cy,
      hw: w / 2,
      hh: h / 2,
      sin: Math.sin(rad),
      cos: Math.cos(rad),
      restitution,
      friction,
    });
  }

  private getRadius(objectType: ObjectType): number {
    switch (objectType) {
      case 'ball':
        return BALL_RADIUS;
      case 'weight':
        return 17;
      case 'bomb':
        return 15;
      default:
        return 14;
    }
  }
}
