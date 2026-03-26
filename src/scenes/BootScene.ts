import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';

/** Preloads assets, generates placeholder textures, shows animated loader. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingAnimation();
    this.createPlaceholderTextures();
  }

  create(): void {
    // Brief pause to show the logo, then transition
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(300, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  private createLoadingAnimation(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Logo text
    this.add
      .text(cx, cy - 40, 'KETTEN\nREAKTION', {
        fontSize: '36px',
        color: '#4466cc',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 2,
      })
      .setOrigin(0.5);

    // Animated dots
    const dotsText = this.add
      .text(cx, cy + 30, '.', {
        fontSize: '24px',
        color: '#555577',
      })
      .setOrigin(0.5);

    let dots = 1;
    this.time.addEvent({
      delay: 300,
      repeat: 5,
      callback: () => {
        dots = (dots % 3) + 1;
        dotsText.setText('.'.repeat(dots));
      },
    });

    // Loading bar
    const barWidth = 200;
    this.add
      .rectangle(cx, cy + 60, barWidth + 4, 8)
      .setStrokeStyle(1, 0x333366);

    const bar = this.add
      .rectangle(cx - barWidth / 2, cy + 60, 0, 6, 0x4466cc)
      .setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = barWidth * value;
    });

    this.load.on('complete', () => {
      bar.width = barWidth;
    });
  }

  /** Generate colored shape textures as placeholders for Kenney assets. */
  private createPlaceholderTextures(): void {
    this.generateCircleTexture('ball', 24, 0xaabbdd);
    this.generateRectTexture('domino', 12, 48, 0xbb8833, 0x996622);
    this.generateRectTexture('crate', 40, 40, 0xccaa55, 0xaa8833);
    this.generateCircleTexture('weight', 32, 0x667788);
  }

  private generateCircleTexture(key: string, size: number, color: number): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const r = size / 2;

    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.fillCircle(r + 1, r + 1, r);

    // Main
    gfx.fillStyle(color);
    gfx.fillCircle(r, r, r);

    // Highlight
    gfx.fillStyle(0xffffff, 0.25);
    gfx.fillCircle(r - r * 0.25, r - r * 0.25, r * 0.4);

    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }

  private generateRectTexture(
    key: string,
    w: number,
    h: number,
    fill: number,
    stroke: number
  ): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.15);
    gfx.fillRect(2, 2, w, h);

    // Main
    gfx.fillStyle(fill);
    gfx.fillRect(0, 0, w, h);

    // Border
    gfx.lineStyle(2, stroke);
    gfx.strokeRect(0, 0, w, h);

    // Highlight line
    gfx.lineStyle(1, 0xffffff, 0.2);
    gfx.moveTo(2, 2);
    gfx.lineTo(w - 2, 2);
    gfx.strokePath();

    gfx.generateTexture(key, w + 2, h + 2);
    gfx.destroy();
  }
}
