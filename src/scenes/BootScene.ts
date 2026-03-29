import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, COLOR, TEXT_SHADOW } from '../constants/Style';
import { StorageManager } from '../systems/StorageManager';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { SceneTransition } from '../game/SceneTransition';

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
      SceneTransition.wipeOut(this, 'MenuScene', undefined, 'down');
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
    this.genFloor();
  }

  /** Ball — gradient blue sphere with specular highlights. */
  private genBall(): void {
    const s = 28;
    const r = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Drop shadow
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillCircle(r + 1, r + 2, r - 1);

    // Base — darker rim
    gfx.fillStyle(0x446688);
    gfx.fillCircle(r, r, r - 1);

    // Mid layer — main color
    gfx.fillStyle(0x6699cc, 0.9);
    gfx.fillCircle(r - 1, r - 1, r - 3);

    // Light layer — upper highlight area
    gfx.fillStyle(0x88bbee, 0.6);
    gfx.fillCircle(r - 2, r - 2, r - 5);

    // Specular highlight
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(r - 4, r - 4, 3.5);

    // Secondary specular
    gfx.fillStyle(0xffffff, 0.2);
    gfx.fillCircle(r + 2, r - 5, 1.5);

    // Rim light (bottom right)
    gfx.fillStyle(0x99ccff, 0.15);
    gfx.fillCircle(r + 3, r + 3, 3);

    // Clean outline
    gfx.lineStyle(1, 0x334466, 0.5);
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

  /** Weight — heavy dark metallic sphere with industrial feel. */
  private genWeight(): void {
    const s = 34;
    const r = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Drop shadow
    gfx.fillStyle(0x000000, 0.35);
    gfx.fillCircle(r + 1, r + 2, r - 1);

    // Base — dark iron
    gfx.fillStyle(0x3a4555);
    gfx.fillCircle(r, r, r - 1);

    // Mid layer
    gfx.fillStyle(0x4a5566, 0.8);
    gfx.fillCircle(r - 1, r - 1, r - 3);

    // Metallic ring — industrial groove
    gfx.lineStyle(2, 0x3a4555, 0.9);
    gfx.strokeCircle(r, r, r * 0.68);

    // Inner ring
    gfx.lineStyle(1, 0x556677, 0.6);
    gfx.strokeCircle(r, r, r * 0.45);

    // Cross mark — weight indicator
    gfx.lineStyle(2, 0x2a3544, 0.6);
    gfx.moveTo(r - 5, r);
    gfx.lineTo(r + 5, r);
    gfx.moveTo(r, r - 5);
    gfx.lineTo(r, r + 5);
    gfx.strokePath();

    // Metallic highlight
    gfx.fillStyle(0xaabbcc, 0.2);
    gfx.fillCircle(r - 4, r - 5, 4);

    // Small specular
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillCircle(r - 5, r - 6, 2);

    // Dark outline
    gfx.lineStyle(1.5, 0x1a2a3a, 0.8);
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

    // Main star — bright gold
    gfx.fillStyle(0xffcc00);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.closePath();
    gfx.fillPath();

    // Inner bright core
    gfx.fillStyle(0xffee66, 0.7);
    gfx.fillCircle(cx, cy, 5);

    // Center white hot spot
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(cx - 1, cy - 1, 2);

    // Outline with warm tone
    gfx.lineStyle(1.5, 0xbb8800, 0.8);
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

  /** Platform — steel-grey with rivet pattern (visually static). */
  private genPlatform(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 10;

    // Base — cool steel
    gfx.fillStyle(0x4a5566);
    gfx.fillRect(0, 0, s, s);

    // Subtle lighter band (top half)
    gfx.fillStyle(0x556677, 0.4);
    gfx.fillRect(0, 0, s, s / 2);

    // Diagonal hatch — "immovable" signal
    gfx.lineStyle(1, 0x5a6677, 0.5);
    gfx.moveTo(0, s);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    // Top edge highlight
    gfx.lineStyle(1, 0x8899aa, 0.4);
    gfx.moveTo(0, 0);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    // Bottom edge shadow
    gfx.lineStyle(1, 0x333344, 0.3);
    gfx.moveTo(0, s - 1);
    gfx.lineTo(s, s - 1);
    gfx.strokePath();

    gfx.generateTexture('platform_tile', s, s);
    gfx.destroy();
  }

  /** Floor — distinct ground with subtle stripe pattern. */
  private genFloor(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const w = 16;
    const h = 16;

    // Base — warm grey-green
    gfx.fillStyle(0x556b5e);
    gfx.fillRect(0, 0, w, h);

    // Alternating stripe bands
    gfx.fillStyle(0x4d6358, 0.5);
    gfx.fillRect(0, 0, w, 4);
    gfx.fillRect(0, 8, w, 4);

    // Top highlight
    gfx.lineStyle(1, 0x7a9a8a, 0.3);
    gfx.moveTo(0, 0);
    gfx.lineTo(w, 0);
    gfx.strokePath();

    // Subtle grid marks
    gfx.fillStyle(0x4a6050, 0.3);
    gfx.fillRect(w / 2, 0, 1, h);

    gfx.generateTexture('floor_tile', w, h);
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
