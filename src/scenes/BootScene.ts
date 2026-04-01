import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
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

    // Subtle glow behind title
    this.add.ellipse(cx, cy - 30, 300, 140, 0x223366, 0.1);

    const dotsText = this.add
      .text(cx, cy + 30, '.', { fontFamily: FONT_UI, fontSize: '20px', color: COLOR.textDim })
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

    // Version badge
    this.add.text(cx, cy + 80, 'Beta', {
      fontFamily: FONT_UI, fontSize: '8px', color: '#334466', letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private generateAllTextures(): void {
    this.genBall();
    this.genDomino();
    this.genCrate();
    this.genWeight();
    this.genBomb();
    this.genMagnet();
    this.genPortal();
    this.genStar();
    this.genBell();
    this.genPlatform();
    this.genPlatformWood();
    this.genPlatformStone();
    this.genPlatformMetal();
    this.genRamp();
    this.genRampWood();
    this.genRampStone();
    this.genRampMetal();
    this.genFloor();
    this.genFloorWood();
    this.genFloorStone();
    this.genFloorMetal();
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

  /** Bomb — dark sphere with fuse and spark. */
  private genBomb(): void {
    const s = 30;
    const cx = s / 2;
    const cy = s / 2 + 2;
    const r = 11;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.25);
    gfx.fillCircle(cx + 1, cy + 1, r);

    // Body — dark charcoal
    gfx.fillStyle(0x333344);
    gfx.fillCircle(cx, cy, r);

    // Rim highlight
    gfx.lineStyle(1.5, 0x555566, 0.6);
    gfx.strokeCircle(cx, cy, r);

    // Specular
    gfx.fillStyle(0x666677, 0.5);
    gfx.fillCircle(cx - 3, cy - 3, 4);

    // Fuse neck
    gfx.fillStyle(0x666655);
    gfx.fillRect(cx - 2, cy - r - 3, 4, 5);

    // Fuse line
    gfx.lineStyle(1.5, 0x887744, 0.8);
    gfx.beginPath();
    gfx.moveTo(cx, cy - r - 3);
    gfx.lineTo(cx + 3, cy - r - 6);
    gfx.lineTo(cx + 1, cy - r - 9);
    gfx.strokePath();

    // Spark at tip
    gfx.fillStyle(0xffaa22, 0.9);
    gfx.fillCircle(cx + 1, cy - r - 9, 2);
    gfx.fillStyle(0xffdd66, 0.6);
    gfx.fillCircle(cx + 1, cy - r - 9, 1);

    gfx.generateTexture('bomb', s, s);
    gfx.destroy();
  }

  /** Magnet — horseshoe shape with red/blue poles. */
  private genMagnet(): void {
    const s = 32;
    const cx = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Horseshoe body (U shape)
    gfx.fillStyle(0x888899);
    // Left arm
    gfx.fillRect(cx - 10, 4, 6, 22);
    // Right arm
    gfx.fillRect(cx + 4, 4, 6, 22);
    // Top bridge
    gfx.fillRect(cx - 10, 4, 20, 6);

    // Red pole (left bottom)
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(cx - 11, 20, 8, 8);

    // Blue pole (right bottom)
    gfx.fillStyle(0x3344cc);
    gfx.fillRect(cx + 3, 20, 8, 8);

    // Highlight on bridge
    gfx.fillStyle(0xaaaabb, 0.4);
    gfx.fillRect(cx - 8, 5, 16, 3);

    // Outline
    gfx.lineStyle(1, 0x666677, 0.5);
    gfx.strokeRect(cx - 11, 4, 22, 24);

    // Force field lines (subtle arcs)
    gfx.lineStyle(0.5, 0xcc44cc, 0.3);
    gfx.beginPath();
    gfx.arc(cx, 26, 8, Math.PI, 0, false);
    gfx.strokePath();
    gfx.beginPath();
    gfx.arc(cx, 26, 12, Math.PI, 0, false);
    gfx.strokePath();

    gfx.generateTexture('magnet', s, s);
    gfx.destroy();
  }

  /** Portal — glowing oval. Two variants: blue (A) and orange (B). */
  private genPortal(): void {
    for (const variant of ['portal_a', 'portal_b'] as const) {
      const s = 36;
      const cx = s / 2;
      const cy = s / 2;
      const gfx = this.make.graphics({ x: 0, y: 0 });
      const isA = variant === 'portal_a';
      const color = isA ? 0x4488ff : 0xff8844;
      const innerColor = isA ? 0x88bbff : 0xffbb88;

      // Outer glow
      gfx.fillStyle(color, 0.15);
      gfx.fillEllipse(cx, cy, 30, 36);

      // Main ring
      gfx.lineStyle(3, color, 0.7);
      gfx.strokeEllipse(cx, cy, 22, 30);

      // Inner glow
      gfx.fillStyle(innerColor, 0.2);
      gfx.fillEllipse(cx, cy, 16, 24);

      // Center void
      gfx.fillStyle(0x000011, 0.6);
      gfx.fillEllipse(cx, cy, 10, 16);

      // Specular highlight
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillEllipse(cx - 3, cy - 6, 4, 3);

      gfx.generateTexture(variant, s, s);
      gfx.destroy();
    }
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

  /** Bell target — copper bell shape with clapper. */
  private genBell(): void {
    const s = 28;
    const cx = s / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.beginPath();
    gfx.moveTo(cx - 8 + 1, 7 + 1);
    gfx.lineTo(cx + 8 + 1, 7 + 1);
    gfx.lineTo(cx + 10 + 1, 20 + 1);
    gfx.lineTo(cx - 10 + 1, 20 + 1);
    gfx.closePath();
    gfx.fillPath();

    // Bell body — copper
    gfx.fillStyle(0xdd8844);
    gfx.beginPath();
    gfx.moveTo(cx - 8, 7);
    gfx.lineTo(cx + 8, 7);
    gfx.lineTo(cx + 10, 20);
    gfx.lineTo(cx - 10, 20);
    gfx.closePath();
    gfx.fillPath();

    // Bell dome (top)
    gfx.fillStyle(0xcc7733);
    gfx.fillCircle(cx, 8, 6);

    // Bell lip (bottom rim)
    gfx.fillStyle(0xbb6622);
    gfx.fillRect(cx - 11, 19, 22, 3);

    // Highlight
    gfx.fillStyle(0xffcc88, 0.5);
    gfx.fillCircle(cx - 2, 10, 3);

    // Clapper (small circle at bottom center)
    gfx.fillStyle(0x554433);
    gfx.fillCircle(cx, 23, 2);

    // Top knob
    gfx.fillStyle(0xaa6633);
    gfx.fillCircle(cx, 4, 2);

    // Outline
    gfx.lineStyle(1, 0x885522, 0.7);
    gfx.beginPath();
    gfx.moveTo(cx - 8, 7);
    gfx.lineTo(cx + 8, 7);
    gfx.lineTo(cx + 10, 20);
    gfx.lineTo(cx - 10, 20);
    gfx.closePath();
    gfx.strokePath();

    gfx.generateTexture('bell', s, s);
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

  /** Platform (wood) — warm brown with horizontal grain lines and knot. */
  private genPlatformWood(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 10;

    // Base — warm brown
    gfx.fillStyle(0x8b6b3d);
    gfx.fillRect(0, 0, s, s);

    // Horizontal wood grain lines
    gfx.lineStyle(1, 0x6b4e2a, 0.3);
    gfx.moveTo(0, 3);
    gfx.lineTo(s, 3);
    gfx.moveTo(0, 6);
    gfx.lineTo(s, 6);
    gfx.moveTo(0, 9);
    gfx.lineTo(s, 9);
    gfx.strokePath();

    // Subtle knot circle at center
    gfx.lineStyle(1, 0x6b4e2a, 0.25);
    gfx.strokeCircle(s / 2, s / 2, 2);

    // Top edge warm highlight
    gfx.lineStyle(1, 0xccaa77, 0.4);
    gfx.moveTo(0, 0);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    // Bottom edge shadow
    gfx.lineStyle(1, 0x4a3520, 0.3);
    gfx.moveTo(0, s - 1);
    gfx.lineTo(s, s - 1);
    gfx.strokePath();

    gfx.generateTexture('platform_tile_wood', s, s);
    gfx.destroy();
  }

  /** Platform (stone) — cool grey with noise dots and rough edges. */
  private genPlatformStone(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 10;

    // Base — cool grey
    gfx.fillStyle(0x5a5a6a);
    gfx.fillRect(0, 0, s, s);

    // Random-looking noise dots (fixed positions for determinism)
    gfx.fillStyle(0x6a6a7a, 0.5);
    gfx.fillRect(2, 3, 1, 1);
    gfx.fillRect(7, 1, 1, 1);
    gfx.fillRect(4, 7, 1, 1);
    gfx.fillStyle(0x4a4a5a, 0.5);
    gfx.fillRect(1, 6, 1, 1);
    gfx.fillRect(8, 5, 1, 1);

    // Rough top edge
    gfx.lineStyle(1, 0x6e6e7e, 0.4);
    gfx.moveTo(0, 0);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    // Rough bottom edge — slightly different color
    gfx.lineStyle(1, 0x44444e, 0.3);
    gfx.moveTo(0, s - 1);
    gfx.lineTo(s, s - 1);
    gfx.strokePath();

    gfx.generateTexture('platform_tile_stone', s, s);
    gfx.destroy();
  }

  /** Platform (metal) — dark blue-grey with brushed lines and rivet dots. */
  private genPlatformMetal(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 10;

    // Base — dark blue-grey
    gfx.fillStyle(0x3a3a4a);
    gfx.fillRect(0, 0, s, s);

    // Horizontal brushed-metal lines
    gfx.lineStyle(1, 0x8899aa, 0.15);
    gfx.moveTo(0, 2);
    gfx.lineTo(s, 2);
    gfx.moveTo(0, 5);
    gfx.lineTo(s, 5);
    gfx.moveTo(0, 8);
    gfx.lineTo(s, 8);
    gfx.strokePath();

    // Single bright specular dot
    gfx.fillStyle(0xffffff, 0.2);
    gfx.fillCircle(s / 2, s / 2, 1);

    // Sharp top highlight
    gfx.lineStyle(1, 0x88aacc, 0.5);
    gfx.moveTo(0, 0);
    gfx.lineTo(s, 0);
    gfx.strokePath();

    // Bottom edge
    gfx.lineStyle(1, 0x222233, 0.4);
    gfx.moveTo(0, s - 1);
    gfx.lineTo(s, s - 1);
    gfx.strokePath();

    // Rivet dots at corners
    gfx.fillStyle(0x667788, 0.4);
    gfx.fillCircle(1, 1, 0.8);
    gfx.fillCircle(s - 1, 1, 0.8);
    gfx.fillCircle(1, s - 1, 0.8);
    gfx.fillCircle(s - 1, s - 1, 0.8);

    gfx.generateTexture('platform_tile_metal', s, s);
    gfx.destroy();
  }

  /** Ramp (wood) — brown with wood grain chevron. */
  private genRampWood(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 8;

    // Base — warm brown
    gfx.fillStyle(0x8b6b3d);
    gfx.fillRect(0, 0, s, s);

    // Wood grain lines
    gfx.lineStyle(1, 0x6b4e2a, 0.3);
    gfx.moveTo(0, 2);
    gfx.lineTo(s, 2);
    gfx.moveTo(0, 5);
    gfx.lineTo(s, 5);
    gfx.strokePath();

    // Chevron hint
    gfx.lineStyle(1, 0xccaa77, 0.2);
    gfx.moveTo(0, s * 0.7);
    gfx.lineTo(s / 2, s * 0.3);
    gfx.lineTo(s, s * 0.7);
    gfx.strokePath();

    gfx.generateTexture('ramp_tile_wood', s, s);
    gfx.destroy();
  }

  /** Ramp (stone) — grey with rough feel. */
  private genRampStone(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 8;

    // Base — cool grey
    gfx.fillStyle(0x5a5a6a);
    gfx.fillRect(0, 0, s, s);

    // Noise dots
    gfx.fillStyle(0x6a6a7a, 0.4);
    gfx.fillRect(2, 2, 1, 1);
    gfx.fillRect(5, 6, 1, 1);
    gfx.fillStyle(0x4a4a5a, 0.4);
    gfx.fillRect(6, 1, 1, 1);

    // Chevron hint
    gfx.lineStyle(1, 0x6e6e7e, 0.25);
    gfx.moveTo(0, s * 0.7);
    gfx.lineTo(s / 2, s * 0.3);
    gfx.lineTo(s, s * 0.7);
    gfx.strokePath();

    gfx.generateTexture('ramp_tile_stone', s, s);
    gfx.destroy();
  }

  /** Ramp (metal) — dark metallic with brushed lines. */
  private genRampMetal(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const s = 8;

    // Base — dark blue-grey
    gfx.fillStyle(0x3a3a4a);
    gfx.fillRect(0, 0, s, s);

    // Brushed lines
    gfx.lineStyle(1, 0x8899aa, 0.15);
    gfx.moveTo(0, 2);
    gfx.lineTo(s, 2);
    gfx.moveTo(0, 5);
    gfx.lineTo(s, 5);
    gfx.strokePath();

    // Chevron hint
    gfx.lineStyle(1, 0x88aacc, 0.25);
    gfx.moveTo(0, s * 0.7);
    gfx.lineTo(s / 2, s * 0.3);
    gfx.lineTo(s, s * 0.7);
    gfx.strokePath();

    gfx.generateTexture('ramp_tile_metal', s, s);
    gfx.destroy();
  }

  /** Floor (wood) — warm planks. */
  private genFloorWood(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const w = 16;
    const h = 16;

    // Base — warm brown
    gfx.fillStyle(0x7a5c30);
    gfx.fillRect(0, 0, w, h);

    // Plank lines — horizontal
    gfx.lineStyle(1, 0x5a3e1c, 0.4);
    gfx.moveTo(0, 4);
    gfx.lineTo(w, 4);
    gfx.moveTo(0, 8);
    gfx.lineTo(w, 8);
    gfx.moveTo(0, 12);
    gfx.lineTo(w, 12);
    gfx.strokePath();

    // Vertical plank gap (offset)
    gfx.lineStyle(1, 0x5a3e1c, 0.3);
    gfx.moveTo(w / 2, 0);
    gfx.lineTo(w / 2, h);
    gfx.strokePath();

    // Top highlight
    gfx.lineStyle(1, 0xccaa77, 0.3);
    gfx.moveTo(0, 0);
    gfx.lineTo(w, 0);
    gfx.strokePath();

    gfx.generateTexture('floor_tile_wood', w, h);
    gfx.destroy();
  }

  /** Floor (stone) — cold grey flagstones. */
  private genFloorStone(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const w = 16;
    const h = 16;

    // Base — cold grey
    gfx.fillStyle(0x4a4a58);
    gfx.fillRect(0, 0, w, h);

    // Flagstone grid lines
    gfx.lineStyle(1, 0x3a3a48, 0.5);
    gfx.moveTo(0, h / 2);
    gfx.lineTo(w, h / 2);
    gfx.moveTo(w / 2, 0);
    gfx.lineTo(w / 2, h);
    gfx.strokePath();

    // Noise dots for rough surface
    gfx.fillStyle(0x5a5a68, 0.4);
    gfx.fillRect(3, 3, 1, 1);
    gfx.fillRect(11, 5, 1, 1);
    gfx.fillRect(6, 12, 1, 1);
    gfx.fillStyle(0x404050, 0.4);
    gfx.fillRect(9, 2, 1, 1);
    gfx.fillRect(2, 10, 1, 1);

    // Top highlight
    gfx.lineStyle(1, 0x5e5e6e, 0.3);
    gfx.moveTo(0, 0);
    gfx.lineTo(w, 0);
    gfx.strokePath();

    gfx.generateTexture('floor_tile_stone', w, h);
    gfx.destroy();
  }

  /** Floor (metal) — dark industrial grating. */
  private genFloorMetal(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });
    const w = 16;
    const h = 16;

    // Base — dark steel
    gfx.fillStyle(0x2a2a3a);
    gfx.fillRect(0, 0, w, h);

    // Grating grid lines
    gfx.lineStyle(1, 0x4a5566, 0.3);
    gfx.moveTo(0, 4);
    gfx.lineTo(w, 4);
    gfx.moveTo(0, 8);
    gfx.lineTo(w, 8);
    gfx.moveTo(0, 12);
    gfx.lineTo(w, 12);
    gfx.moveTo(4, 0);
    gfx.lineTo(4, h);
    gfx.moveTo(8, 0);
    gfx.lineTo(8, h);
    gfx.moveTo(12, 0);
    gfx.lineTo(12, h);
    gfx.strokePath();

    // Top highlight
    gfx.lineStyle(1, 0x88aacc, 0.3);
    gfx.moveTo(0, 0);
    gfx.lineTo(w, 0);
    gfx.strokePath();

    // Subtle specular dots at intersections
    gfx.fillStyle(0xffffff, 0.08);
    gfx.fillCircle(4, 4, 0.8);
    gfx.fillCircle(12, 12, 0.8);

    gfx.generateTexture('floor_tile_metal', w, h);
    gfx.destroy();
  }
}
