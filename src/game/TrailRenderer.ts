import Phaser from 'phaser';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface ArtSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  speed: number;
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
  private minSpeed = 2;
  private artSegments: ArtSegment[] = [];
  private artGraphics: Phaser.GameObjects.Graphics | null = null;

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
      const vx = body.velocity?.x ?? 0;
      const vy = body.velocity?.y ?? 0;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Only record points when moving fast enough
      if (speed > this.minSpeed) {
        const newPoint = { x: body.position.x, y: body.position.y, age: 0 };
        // Store art segment for photon trail
        if (points.length > 0) {
          this.artSegments.push({
            x1: points[0].x, y1: points[0].y,
            x2: newPoint.x, y2: newPoint.y,
            speed,
          });
        }
        points.unshift(newPoint);
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

  /** Render the full photon trail art (called after simulation ends). */
  renderArt(): void {
    if (this.artSegments.length === 0) return;

    this.artGraphics = this.scene.add.graphics().setDepth(9);
    const maxSpeed = Math.max(...this.artSegments.map((s) => s.speed), 1);

    for (const seg of this.artSegments) {
      const t = Math.min(seg.speed / maxSpeed, 1);
      // HSL-style: blue (slow) → cyan → green → yellow → red (fast)
      const r = Math.floor(t > 0.5 ? 255 : t * 2 * 255);
      const g = Math.floor(t < 0.3 ? t / 0.3 * 255 : t > 0.7 ? (1 - t) / 0.3 * 255 : 255);
      const b = Math.floor(t < 0.5 ? (1 - t * 2) * 255 : 0);
      const color = (r << 16) | (g << 8) | b;
      const width = 1 + t * 2.5;
      const alpha = 0.3 + t * 0.4;

      this.artGraphics.lineStyle(width, color, alpha);
      this.artGraphics.beginPath();
      this.artGraphics.moveTo(seg.x1, seg.y1);
      this.artGraphics.lineTo(seg.x2, seg.y2);
      this.artGraphics.strokePath();
    }
  }

  /** Check if art segments exist. */
  hasArt(): boolean {
    return this.artSegments.length > 0;
  }

  /** Stop tracking all bodies and clear trails. */
  clear(): void {
    this.tracked = [];
    this.graphics.clear();
    this.artSegments = [];
    this.artGraphics?.destroy();
    this.artGraphics = null;
  }

  destroy(): void {
    this.graphics.destroy();
    this.artGraphics?.destroy();
    this.tracked = [];
    this.artSegments = [];
  }
}
