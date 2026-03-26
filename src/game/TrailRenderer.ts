import Phaser from 'phaser';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface TrackedBody {
  body: MatterJS.BodyType;
  points: TrailPoint[];
  color: number;
}

/**
 * Renders motion trails behind fast-moving physics bodies.
 * Creates a "speed" feel without any external art.
 */
export class TrailRenderer {
  private scene: Phaser.Scene;
  private tracked: TrackedBody[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private maxPoints = 12;
  private minSpeed = 2; // Only show trail above this velocity

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setDepth(8);
  }

  /** Start tracking a body for trail rendering. */
  track(body: MatterJS.BodyType, color: number = 0x6688ff): void {
    this.tracked.push({ body, points: [], color });
  }

  /** Call every frame. Captures positions and draws trails. */
  update(): void {
    this.graphics.clear();

    for (const entry of this.tracked) {
      const { body, points, color } = entry;
      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Only record points when moving fast enough
      if (speed > this.minSpeed) {
        points.unshift({ x: body.position.x, y: body.position.y, age: 0 });
      }

      // Age and prune points
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age++;
        if (points[i].age > this.maxPoints) {
          points.splice(i, 1);
        }
      }

      // Draw trail
      if (points.length < 2) continue;

      for (let i = 1; i < points.length; i++) {
        const alpha = 1 - points[i].age / this.maxPoints;
        const width = (1 - points[i].age / this.maxPoints) * 3;

        this.graphics.lineStyle(width, color, alpha * 0.4);
        this.graphics.beginPath();
        this.graphics.moveTo(points[i - 1].x, points[i - 1].y);
        this.graphics.lineTo(points[i].x, points[i].y);
        this.graphics.strokePath();
      }
    }
  }

  /** Stop tracking all bodies and clear trails. */
  clear(): void {
    this.tracked = [];
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
    this.tracked = [];
  }
}
