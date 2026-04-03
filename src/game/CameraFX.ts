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
  private slowMoTimer?: Phaser.Time.TimerEvent;
  private colorMatrix: Phaser.FX.ColorMatrix | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Add trauma (0-1). Shake intensity = trauma^2 for nice falloff. */
  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Trigger slow-motion. Ramps down to target speed, holds, snaps back.
   *  If already in slow-mo, replaces the current effect if the new speed is more dramatic. */
  slowMotion(speed: number = 0.25, durationMs: number = 800): void {
    if (this.isSlowMo && speed >= this.slowMoTarget) return;

    // Cancel previous slow-mo recovery timer if replacing
    if (this.slowMoTimer) {
      this.slowMoTimer.destroy();
    }

    this.isSlowMo = true;
    this.slowMoTarget = speed;

    // Only slow visual time, not physics engine (preserves determinism)
    this.scene.time.timeScale = speed;

    this.slowMoTimer = this.scene.time.delayedCall(durationMs * speed, () => {
      this.scene.time.timeScale = 1;
      this.isSlowMo = false;
      this.slowMoTimer = undefined;
    });
  }

  /** Call every frame to apply trauma shake. Adds offset to current scroll position. */
  update(): void {
    if (this.trauma <= 0) return;

    const shake = this.trauma * this.trauma; // Quadratic falloff
    const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
    const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;

    // Add shake offset to current scroll (don't overwrite followAction position)
    const cam = this.scene.cameras.main;
    cam.scrollX += offsetX;
    cam.scrollY += offsetY;

    this.trauma = Math.max(0, this.trauma - this.traumaDecay);
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
    const active = bodies.filter((b) => {
      if (b.isStatic || b.isSleeping) return false;
      // Skip bodies that escaped the game world (prevents camera chasing explosions)
      const { x, y } = b.position;
      return x > -200 && x < gameWidth + 200 && y > -200 && y < gameHeight + 200;
    });
    if (active.length === 0) return;

    // Weighted centroid + action spread in single pass
    let cx = 0, cy = 0, totalWeight = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const b of active) {
      const vx = b.velocity?.x ?? 0;
      const vy = b.velocity?.y ?? 0;
      const px = b.position.x;
      const py = b.position.y;
      if (isNaN(vx) || isNaN(vy) || isNaN(px) || isNaN(py)) continue;
      const speed = Math.sqrt(vx ** 2 + vy ** 2);
      const w = 1 + speed * 0.5;
      cx += px * w;
      cy += py * w;
      totalWeight += w;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
    if (totalWeight === 0) return;
    cx /= totalWeight;
    cy /= totalWeight;

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

    // Guard against NaN — if any value is NaN, reset to safe defaults
    if (isNaN(clampedX) || isNaN(clampedY) || isNaN(targetZoom)) return;
    if (isNaN(cam.scrollX) || isNaN(cam.scrollY) || isNaN(cam.zoom)) {
      cam.scrollX = 0;
      cam.scrollY = 0;
      cam.zoom = 1;
      return;
    }

    cam.scrollX += (clampedX - cam.scrollX) * lerpFactor;
    cam.scrollY += (clampedY - cam.scrollY) * lerpFactor;
    cam.zoom += (targetZoom - cam.zoom) * lerpFactor;
  }

  /** Apply warm color grade based on chain intensity (0-1). WebGL only. */
  warmShift(intensity: number): void {
    if (this.scene.renderer.type !== Phaser.WEBGL) return;

    if (!this.colorMatrix) {
      this.colorMatrix = this.scene.cameras.main.postFX.addColorMatrix();
    }

    this.colorMatrix.reset();
    if (intensity > 0) {
      this.colorMatrix.brightness(1 + intensity * 0.05);
      this.colorMatrix.saturate(intensity * 0.3);
    }
  }

  /** Remove warm color shift. */
  resetColorShift(): void {
    if (this.colorMatrix) {
      this.colorMatrix.reset();
    }
  }

  /** Smoothly return camera to default position. */
  resetCamera(durationMs: number = 600): void {
    const cam = this.scene.cameras.main;

    // If camera values are NaN, snap directly — tweening from NaN won't work
    if (isNaN(cam.scrollX) || isNaN(cam.scrollY) || isNaN(cam.zoom)) {
      cam.scrollX = 0;
      cam.scrollY = 0;
      cam.zoom = 1;
      return;
    }

    this.scene.tweens.add({
      targets: cam,
      scrollX: 0, scrollY: 0, zoom: 1,
      duration: durationMs,
      ease: 'Sine.easeInOut',
    });
  }
}
