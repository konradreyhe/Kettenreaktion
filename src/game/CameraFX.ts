import Phaser from 'phaser';

/**
 * Trauma-based camera shake + slow-motion + zoom effects.
 * Inspired by Vlambeer's "screenshake" philosophy.
 */
export class CameraFX {
  private scene: Phaser.Scene;
  private trauma = 0;
  private maxOffset = 8;
  private traumaDecay = 0.02;

  private isSlowMo = false;
  private slowMoTarget = 1.0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Add trauma (0-1). Shake intensity = trauma^2 for nice falloff. */
  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Trigger slow-motion. Ramps down to target speed, holds, snaps back. */
  slowMotion(speed: number = 0.25, durationMs: number = 800): void {
    if (this.isSlowMo) return;
    this.isSlowMo = true;
    this.slowMoTarget = speed;

    // Only slow visual time, not physics engine (preserves determinism)
    this.scene.time.timeScale = speed;

    this.scene.time.delayedCall(durationMs * speed, () => {
      this.scene.time.timeScale = 1;
      this.isSlowMo = false;
    });
  }

  /** Call every frame to apply trauma shake. */
  update(): void {
    if (this.trauma <= 0) return;

    const shake = this.trauma * this.trauma; // Quadratic falloff
    const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
    const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;

    this.scene.cameras.main.setScroll(offsetX, offsetY);

    this.trauma = Math.max(0, this.trauma - this.traumaDecay);

    if (this.trauma <= 0) {
      this.scene.cameras.main.setScroll(0, 0);
    }
  }

  /** Smooth zoom toward a point. */
  zoomTo(zoom: number, durationMs: number = 500): void {
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      zoom,
      duration: durationMs,
      ease: 'Sine.easeInOut',
    });
  }

  /** Reset zoom to default. */
  resetZoom(durationMs: number = 300): void {
    this.zoomTo(1, durationMs);
  }

  /**
   * Follow the action during simulation.
   * Smoothly pans toward the centroid of active bodies and zooms
   * based on how spread out the action is.
   */
  followAction(bodies: MatterJS.BodyType[], gameWidth: number, gameHeight: number): void {
    const active = bodies.filter((b) => !b.isStatic && !b.isSleeping);
    if (active.length === 0) return;

    // Weighted centroid (faster bodies pull camera more)
    let cx = 0, cy = 0, totalWeight = 0;
    for (const b of active) {
      const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
      const w = 1 + speed * 0.5;
      cx += b.position.x * w;
      cy += b.position.y * w;
      totalWeight += w;
    }
    cx /= totalWeight;
    cy /= totalWeight;

    // Calculate action spread
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const b of active) {
      minX = Math.min(minX, b.position.x);
      maxX = Math.max(maxX, b.position.x);
      minY = Math.min(minY, b.position.y);
      maxY = Math.max(maxY, b.position.y);
    }
    const spread = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);

    // Target zoom: zoom in when action is concentrated, out when spread
    const targetZoom = Math.max(1.0, Math.min(1.8, 350 / Math.max(spread, 50)));

    // Smooth lerp camera position and zoom
    const cam = this.scene.cameras.main;
    const lerpFactor = 0.04;

    // Convert centroid to scroll offset (camera scroll = centroid - halfWidth/zoom)
    const targetScrollX = cx - gameWidth / (2 * targetZoom);
    const targetScrollY = cy - gameHeight / (2 * targetZoom);

    // Clamp to game bounds
    const clampedX = Math.max(-20, Math.min(targetScrollX, gameWidth * 0.3));
    const clampedY = Math.max(-20, Math.min(targetScrollY, gameHeight * 0.3));

    cam.scrollX += (clampedX - cam.scrollX) * lerpFactor;
    cam.scrollY += (clampedY - cam.scrollY) * lerpFactor;
    cam.zoom += (targetZoom - cam.zoom) * lerpFactor;
  }

  /** Smoothly return camera to default position. */
  resetCamera(durationMs: number = 600): void {
    const cam = this.scene.cameras.main;
    this.scene.tweens.add({
      targets: cam,
      scrollX: 0, scrollY: 0, zoom: 1,
      duration: durationMs,
      ease: 'Sine.easeInOut',
    });
  }
}
