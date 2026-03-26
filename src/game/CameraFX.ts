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

    this.scene.time.timeScale = speed;
    this.scene.matter.world.engine.timing.timeScale = speed;

    this.scene.time.delayedCall(durationMs * speed, () => {
      this.scene.time.timeScale = 1;
      this.scene.matter.world.engine.timing.timeScale = 1;
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
}
