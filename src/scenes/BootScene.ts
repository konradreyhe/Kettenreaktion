import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, COLOR, TEXT_SHADOW } from '../constants/Style';
import { StorageManager } from '../systems/StorageManager';
import { AccessibilityManager } from '../systems/AccessibilityManager';

/** Preloads assets, generates all procedural textures. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingAnimation();
    this.generateAllTextures();
  }

  create(): void {
    // Initialize accessibility settings
    AccessibilityManager.init();

    // Prune old replay data to prevent localStorage bloat
    StorageManager.pruneOldReplays(7);

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

    this.add
      .text(cx, cy - 40, 'KETTEN\nREAKTION', {
        fontFamily: FONT_TITLE,
        fontSize: '32px',
        color: COLOR.primary,
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 6,
        stroke: '#111133',
        strokeThickness: 3,
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5);

    const dotsText = this.add
      .text(cx, cy + 30, '.', { fontSize: '24px', color: COLOR.textDim })
      .setOrigin(0.5);

    let dots = 1;
    this.time.addEvent({
      delay: 300, repeat: 5,
      callback: () => { dots = (dots % 3) + 1; dotsText.setText('.'.repeat(dots)); },
    });

    const barWidth = 220;
    // Bar track
    this.add.rectangle(cx, cy + 60, barWidth + 4, 10, 0x111122)
      .setStrokeStyle(1, 0x333366);
    // Bar fill
    const bar = this.add.rectangle(cx - barWidth / 2, cy + 60, 0, 8, 0x4488ff).setOrigin(0, 0.5);
    this.load.on('progress', (v: number) => { bar.width = barWidth * v; });
    this.load.on('complete', () => { bar.width = barWidth; });
  }

  private generateAllTextures(): void {
    this.genBall();
    this.genDomino();
    this.genCrate();
    this.genWeight();
    this.genStar();
    this.genPlatform();
    this.genRamp();
  }

  /** Ball — light blue circle with shine rings and highlight. */
  private genBall(): void {
    const s = 28;
    const r = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.25);
    gfx.fillCircle(r + 1, r + 1, r - 1);

    // Main body
    gfx.fillStyle(0x7799cc);
    gfx.fillCircle(r, r, r - 1);

    // Inner ring
    gfx.lineStyle(1.5, 0x99bbee, 0.5);
    gfx.strokeCircle(r, r, r * 0.65);

    // Highlight
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(r - 3, r - 3, 4);

    // Small secondary highlight
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillCircle(r + 2, r - 4, 2);

    // Dark outline
    gfx.lineStyle(1.5, 0x334466, 0.6);
    gfx.strokeCircle(r, r, r - 1);

    gfx.generateTexture('ball', s, s);
    gfx.destroy();
  }

  /** Domino — wider (16px), wood grain lines, beveled look. */
  private genDomino(): void {
    const w = 16;
    const h = 48;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.fillRect(2, 2, w, h);

    // Main body — warm wood
    gfx.fillStyle(0xbb7733);
    gfx.fillRect(0, 0, w, h);

    // Wood grain horizontal lines
    gfx.lineStyle(1, 0xaa6622, 0.4);
    for (let y = 4; y < h; y += 6) {
      gfx.moveTo(1, y);
      gfx.lineTo(w - 1, y);
    }
    gfx.strokePath();

    // Center divider (domino dot line)
    gfx.lineStyle(1, 0x885511, 0.6);
    gfx.moveTo(2, h / 2);
    gfx.lineTo(w - 2, h / 2);
    gfx.strokePath();

    // Dots
    gfx.fillStyle(0xffeedd, 0.7);
    gfx.fillCircle(w / 2, h * 0.25, 2);
    gfx.fillCircle(w / 2, h * 0.75, 2);

    // Bevel — top edge light
    gfx.lineStyle(1, 0xddaa66, 0.5);
    gfx.moveTo(1, 1);
    gfx.lineTo(w - 1, 1);
    gfx.strokePath();

    // Dark outline
    gfx.lineStyle(1.5, 0x553311, 0.7);
    gfx.strokeRect(0, 0, w, h);

    gfx.generateTexture('domino', w + 2, h + 2);
    gfx.destroy();
  }

  /** Crate — tan box with cross-hatch and nails. */
  private genCrate(): void {
    const s = 40;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.fillRect(2, 2, s, s);

    // Main body
    gfx.fillStyle(0xccaa55);
    gfx.fillRect(0, 0, s, s);

    // Plank lines
    gfx.lineStyle(1, 0xaa8833, 0.4);
    gfx.moveTo(0, s / 3);
    gfx.lineTo(s, s / 3);
    gfx.moveTo(0, (s * 2) / 3);
    gfx.lineTo(s, (s * 2) / 3);
    gfx.strokePath();

    // Cross brace
    gfx.lineStyle(2, 0x997733, 0.5);
    gfx.moveTo(3, 3);
    gfx.lineTo(s - 3, s - 3);
    gfx.moveTo(s - 3, 3);
    gfx.lineTo(3, s - 3);
    gfx.strokePath();

    // Corner nails
    gfx.fillStyle(0x888888, 0.7);
    gfx.fillCircle(5, 5, 2);
    gfx.fillCircle(s - 5, 5, 2);
    gfx.fillCircle(5, s - 5, 2);
    gfx.fillCircle(s - 5, s - 5, 2);

    // Bevel
    gfx.lineStyle(1, 0xeedd88, 0.3);
    gfx.moveTo(1, 1);
    gfx.lineTo(s - 1, 1);
    gfx.lineTo(s - 1, 1);
    gfx.strokePath();

    // Dark outline
    gfx.lineStyle(1.5, 0x775522, 0.7);
    gfx.strokeRect(0, 0, s, s);

    gfx.generateTexture('crate', s + 2, s + 2);
    gfx.destroy();
  }

  /** Weight — dark metallic circle with cross and sheen. */
  private genWeight(): void {
    const s = 34;
    const r = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillCircle(r + 1, r + 1, r - 1);

    // Main body — dark steel
    gfx.fillStyle(0x556677);
    gfx.fillCircle(r, r, r - 1);

    // Metallic ring
    gfx.lineStyle(2.5, 0x445566, 0.8);
    gfx.strokeCircle(r, r, r * 0.7);

    // Cross mark
    gfx.lineStyle(2, 0x334455, 0.5);
    gfx.moveTo(r - 5, r);
    gfx.lineTo(r + 5, r);
    gfx.moveTo(r, r - 5);
    gfx.lineTo(r, r + 5);
    gfx.strokePath();

    // Highlight — metallic sheen
    gfx.fillStyle(0xffffff, 0.2);
    gfx.fillCircle(r - 4, r - 5, 4);

    // "KG" text implication (small dot pattern)
    gfx.fillStyle(0x778899, 0.6);
    gfx.fillCircle(r - 3, r + 5, 1.5);
    gfx.fillCircle(r + 3, r + 5, 1.5);

    // Dark outline
    gfx.lineStyle(2, 0x2a3a4a, 0.8);
    gfx.strokeCircle(r, r, r - 1);

    gfx.generateTexture('weight', s, s);
    gfx.destroy();
  }

  /** Star target — actual 5-pointed star shape. */
  private genStar(): void {
    const s = 28;
    const cx = s / 2;
    const cy = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Star points
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? 12 : 5;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }

    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.beginPath();
    gfx.moveTo(points[0].x + 1, points[0].y + 1);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x + 1, points[i].y + 1);
    }
    gfx.closePath();
    gfx.fillPath();

    // Main star — gold
    gfx.fillStyle(0xffdd00);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.closePath();
    gfx.fillPath();

    // Inner glow
    gfx.fillStyle(0xffff88, 0.5);
    gfx.fillCircle(cx, cy, 4);

    // Outline
    gfx.lineStyle(1, 0xcc9900, 0.8);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.closePath();
    gfx.strokePath();

    gfx.generateTexture('star', s, s);
    gfx.destroy();
  }

  /** Platform — grey with hatched pattern (visually static). */
  private genPlatform(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 8;

    gfx.fillStyle(0x556666);
    gfx.fillRect(0, 0, s, s);

    // Hatch lines — signal "this is fixed"
    gfx.lineStyle(1, 0x667777, 0.4);
    gfx.moveTo(0, s);
    gfx.lineTo(s, 0);
    gfx.moveTo(s / 2, s);
    gfx.lineTo(s, s / 2);
    gfx.moveTo(0, s / 2);
    gfx.lineTo(s / 2, 0);
    gfx.strokePath();

    // Top edge highlight
    gfx.lineStyle(1, 0x88aaaa, 0.3);
    gfx.moveTo(0, 0);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    gfx.generateTexture('platform_tile', s, s);
    gfx.destroy();
  }

  /** Ramp — angled surface pattern. */
  private genRamp(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 8;

    gfx.fillStyle(0x555577);
    gfx.fillRect(0, 0, s, s);

    // Chevron lines — signal "slope"
    gfx.lineStyle(1, 0x6666aa, 0.3);
    gfx.moveTo(0, s * 0.7);
    gfx.lineTo(s / 2, s * 0.3);
    gfx.lineTo(s, s * 0.7);
    gfx.strokePath();

    gfx.generateTexture('ramp_tile', s, s);
    gfx.destroy();
  }
}
