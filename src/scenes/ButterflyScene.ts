import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { LevelLoader } from '../game/LevelLoader';
import { FONT_TITLE, FONT_UI } from '../constants/Style';
import { Button } from '../ui/Button';
import { SceneTransition } from '../game/SceneTransition';
import type { ReplayFrame } from '../types/GameState';
import type { Level } from '../types/Level';

interface ButterflyData {
  /** "Your" replay (blue) */
  replayA: ReplayFrame[];
  placementA?: { type: string; x: number; y: number };
  labelA: string;
  /** "Other" replay (gold) */
  replayB: ReplayFrame[];
  placementB?: { type: string; x: number; y: number };
  labelB: string;
  /** Level to draw as backdrop (replay A) */
  levelId: string;
  /** Level for replay B (if different from A, e.g. yesterday's level) */
  levelIdB?: string;
  /** Where to return */
  returnScene: string;
  returnData?: Record<string, unknown>;
}

/** Side-by-side replay comparison — overlays two attempts on the same level. */
export class ButterflyScene extends Phaser.Scene {
  private replayA: ReplayFrame[] = [];
  private replayB: ReplayFrame[] = [];
  private dotsA: Phaser.GameObjects.Sprite[] = [];
  private dotsB: Phaser.GameObjects.Sprite[] = [];
  private frameIndex = 0;
  private isPlaying = false;
  private playTimer: Phaser.Time.TimerEvent | null = null;
  private maxFrames = 0;

  constructor() {
    super({ key: 'ButterflyScene' });
  }

  create(data: ButterflyData): void {
    const cx = GAME_WIDTH / 2;
    SceneTransition.wipeIn(this);

    this.replayA = data.replayA;
    this.replayB = data.replayB;
    this.frameIndex = 0;
    this.dotsA = [];
    this.dotsB = [];
    this.maxFrames = Math.max(this.replayA.length, this.replayB.length);

    // Header
    this.add.text(cx, 18, 'Schmetterlingseffekt', {
      fontFamily: FONT_TITLE, fontSize: '14px', color: '#aa88dd',
      stroke: '#111122', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);

    // Legend
    this.add.circle(cx - 80, 40, 5, 0x4488ff, 0.8).setDepth(50);
    this.add.text(cx - 70, 40, data.labelA, {
      fontFamily: FONT_UI, fontSize: '10px', color: '#4488ff',
    }).setOrigin(0, 0.5).setDepth(50);

    this.add.circle(cx + 30, 40, 5, 0xffcc44, 0.8).setDepth(50);
    this.add.text(cx + 40, 40, data.labelB, {
      fontFamily: FONT_UI, fontSize: '10px', color: '#ffcc44',
    }).setOrigin(0, 0.5).setDepth(50);

    // Draw level layout — use replay A's level as primary backdrop
    const level = LevelLoader.loadById(data.levelId);
    if (level) {
      this.drawLevelLayout(level);
    }

    // If replay B has a different level, draw its layout as a faint overlay
    if (data.levelIdB && data.levelIdB !== data.levelId) {
      const levelB = LevelLoader.loadById(data.levelIdB);
      if (levelB) {
        this.drawLevelLayout(levelB);
      }
    }

    // Draw placement markers
    if (data.placementA) {
      this.add.circle(data.placementA.x, data.placementA.y, 6, 0x4488ff, 0.25).setDepth(20);
    }
    if (data.placementB) {
      this.add.circle(data.placementB.x, data.placementB.y, 6, 0xffcc44, 0.25).setDepth(20);
    }

    // Create sprites for replay A (blue tinted)
    if (this.replayA.length > 0) {
      const first = this.replayA[0];
      for (let i = 0; i < first.length; i++) {
        const [x, y, angle] = first[i];
        const isPlayer = i === first.length - 1;
        const tex = isPlayer ? (data.placementA?.type === 'weight' ? 'weight' : 'ball') : 'domino';
        const sprite = this.add.sprite(x, y, tex)
          .setDepth(isPlayer ? 31 : 30)
          .setRotation(angle)
          .setAlpha(0.7)
          .setTint(0x4488ff);
        this.dotsA.push(sprite);
      }
    }

    // Create sprites for replay B (gold tinted)
    if (this.replayB.length > 0) {
      const first = this.replayB[0];
      for (let i = 0; i < first.length; i++) {
        const [x, y, angle] = first[i];
        const isPlayer = i === first.length - 1;
        const tex = isPlayer ? (data.placementB?.type === 'weight' ? 'weight' : 'ball') : 'domino';
        const sprite = this.add.sprite(x, y, tex)
          .setDepth(isPlayer ? 29 : 28)
          .setRotation(angle)
          .setAlpha(0.5)
          .setTint(0xffcc44);
        this.dotsB.push(sprite);
      }
    }

    // Progress bar
    const barBg = this.add.rectangle(cx, GAME_HEIGHT - 50, 400, 6, 0x333355, 0.5).setDepth(50);
    const barFill = this.add.rectangle(cx - 200, GAME_HEIGHT - 50, 0, 6, 0x8866cc, 0.8)
      .setOrigin(0, 0.5).setDepth(51);

    const frameText = this.add.text(cx, GAME_HEIGHT - 38, '', {
      fontFamily: FONT_UI, fontSize: '10px', color: '#6666aa',
    }).setOrigin(0.5).setDepth(50);

    // Divergence indicator — shows when paths start differing
    const divergeText = this.add.text(cx, GAME_HEIGHT - 62, '', {
      fontFamily: FONT_UI, fontSize: '9px', color: '#aa88dd',
    }).setOrigin(0.5).setDepth(50);

    // Start playback
    this.isPlaying = true;
    this.playTimer = this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (!this.isPlaying || this.frameIndex >= this.maxFrames) return;
        this.renderFrame(this.frameIndex, barFill, frameText, divergeText);
        this.frameIndex++;
      },
    });

    // Clickable scrub bar
    const barHit = this.add.rectangle(cx, GAME_HEIGHT - 50, 400, 20, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    barHit.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const localX = ptr.x - (cx - 200);
      const ratio = Phaser.Math.Clamp(localX / 400, 0, 1);
      this.frameIndex = Math.floor(ratio * (this.maxFrames - 1));
      this.renderFrame(this.frameIndex, barFill, frameText, divergeText);
    });

    // Control panel
    this.add.rectangle(cx, GAME_HEIGHT - 18, 300, 36, 0x0a0a1a, 0.5)
      .setDepth(49).setStrokeStyle(1, 0x334466, 0.2);

    let playbackSpeed = 1;

    const playPauseBtn = new Button(this, {
      x: cx - 100, y: GAME_HEIGHT - 18, text: '\u23F8', width: 36, height: 28, fontSize: '14px',
      color: 0x333355, hoverColor: 0x444466, textColor: '#8888aa',
      onClick: () => {
        this.isPlaying = !this.isPlaying;
        playPauseBtn.setText(this.isPlaying ? '\u23F8' : '\u25B6');
      },
    });

    new Button(this, {
      x: cx - 60, y: GAME_HEIGHT - 18, text: '\u23EE', width: 36, height: 28, fontSize: '14px',
      color: 0x333355, hoverColor: 0x444466, textColor: '#8888aa',
      onClick: () => {
        this.frameIndex = 0;
        this.isPlaying = true;
        playPauseBtn.setText('\u23F8');
        this.renderFrame(0, barFill, frameText, divergeText);
      },
    });

    const speedBtn = new Button(this, {
      x: cx - 20, y: GAME_HEIGHT - 18, text: '1x', width: 36, height: 28, fontSize: '11px',
      color: 0x333355, hoverColor: 0x444466, textColor: '#88aacc',
      onClick: () => {
        playbackSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 0.5 : 1;
        speedBtn.setText(`${playbackSpeed}x`);
        if (this.playTimer) this.playTimer.destroy();
        this.playTimer = this.time.addEvent({
          delay: 50 / playbackSpeed, loop: true,
          callback: () => {
            if (!this.isPlaying || this.frameIndex >= this.maxFrames) return;
            this.renderFrame(this.frameIndex, barFill, frameText, divergeText);
            this.frameIndex++;
          },
        });
      },
    });

    new Button(this, {
      x: cx + 60, y: GAME_HEIGHT - 18, text: 'Zurueck', width: 80, height: 28, fontSize: '11px',
      color: 0x222233, hoverColor: 0x2a2a44, textColor: '#777799',
      onClick: () => {
        SceneTransition.wipeOut(this, data.returnScene, data.returnData);
      },
    });

    // Keyboard
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.isPlaying = !this.isPlaying;
      playPauseBtn.setText(this.isPlaying ? '\u23F8' : '\u25B6');
    });
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.frameIndex = Math.max(0, this.frameIndex - 5);
      this.renderFrame(this.frameIndex, barFill, frameText, divergeText);
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.frameIndex = Math.min(this.maxFrames - 1, this.frameIndex + 5);
      this.renderFrame(this.frameIndex, barFill, frameText, divergeText);
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      SceneTransition.wipeOut(this, data.returnScene, data.returnData);
    });
  }

  private renderFrame(
    idx: number,
    barFill: Phaser.GameObjects.Rectangle,
    frameText: Phaser.GameObjects.Text,
    divergeText: Phaser.GameObjects.Text,
  ): void {
    // Update replay A sprites
    if (idx < this.replayA.length) {
      const frame = this.replayA[idx];
      for (let i = 0; i < this.dotsA.length; i++) {
        if (i < frame.length) {
          this.dotsA[i].setPosition(frame[i][0], frame[i][1]);
          if (frame[i][2] !== undefined) this.dotsA[i].setRotation(frame[i][2]);
          this.dotsA[i].setVisible(true);
        } else {
          this.dotsA[i].setVisible(false);
        }
      }
    } else {
      // Replay A ended — fade out
      for (const d of this.dotsA) d.setVisible(false);
    }

    // Update replay B sprites
    if (idx < this.replayB.length) {
      const frame = this.replayB[idx];
      for (let i = 0; i < this.dotsB.length; i++) {
        if (i < frame.length) {
          this.dotsB[i].setPosition(frame[i][0], frame[i][1]);
          if (frame[i][2] !== undefined) this.dotsB[i].setRotation(frame[i][2]);
          this.dotsB[i].setVisible(true);
        } else {
          this.dotsB[i].setVisible(false);
        }
      }
    } else {
      for (const d of this.dotsB) d.setVisible(false);
    }

    // Progress
    const progress = idx / Math.max(1, this.maxFrames - 1);
    barFill.setSize(400 * progress, 6);
    frameText.setText(`${Math.round(progress * 100)}%`);

    // Measure divergence between player objects (last body in each frame)
    if (idx < this.replayA.length && idx < this.replayB.length) {
      const a = this.replayA[idx];
      const b = this.replayB[idx];
      if (a.length > 0 && b.length > 0) {
        const playerA = a[a.length - 1];
        const playerB = b[b.length - 1];
        const dist = Math.sqrt((playerA[0] - playerB[0]) ** 2 + (playerA[1] - playerB[1]) ** 2);
        if (dist > 30) {
          divergeText.setText(`Abweichung: ${Math.round(dist)}px`);
          divergeText.setColor('#ff8844');
        } else {
          divergeText.setText('Synchron');
          divergeText.setColor('#44cc88');
        }
      }
    } else {
      divergeText.setText('');
    }
  }

  private drawLevelLayout(level: Level): void {
    const gfx = this.add.graphics().setDepth(5);

    gfx.fillStyle(0x334455, 0.4);
    gfx.fillRect(0, 580, 800, 20);

    for (const obj of level.staticObjects) {
      const height = obj.height ?? 20;
      if (obj.type === 'platform') {
        gfx.fillStyle(0x445566, 0.3);
        gfx.fillRect(obj.x, obj.y, obj.width, height);
      } else if (obj.type === 'ramp') {
        gfx.fillStyle(0x555577, 0.3);
        gfx.fillRect(obj.x, obj.y - height / 2, obj.width, height);
      }
    }

    for (const target of level.targets) {
      const color = target.type === 'bell' ? 0xdd8844 : 0xffdd44;
      gfx.fillStyle(color, 0.2);
      gfx.fillCircle(target.x, target.y, 12);
      gfx.lineStyle(1, color, 0.4);
      gfx.strokeCircle(target.x, target.y, 12);
    }

    // Magnets
    for (const obj of level.staticObjects) {
      if (obj.type === 'magnet') {
        gfx.fillStyle(0xcc44cc, 0.15);
        gfx.fillCircle(obj.x, obj.y, 14);
        gfx.lineStyle(1, 0xcc44cc, 0.3);
        gfx.strokeCircle(obj.x, obj.y, 14);
      }
    }

    // Portals
    for (const pair of level.portals ?? []) {
      gfx.fillStyle(0x4488ff, 0.15);
      gfx.fillCircle(pair.a.x, pair.a.y, 14);
      gfx.lineStyle(1, 0x4488ff, 0.4);
      gfx.strokeCircle(pair.a.x, pair.a.y, 14);
      gfx.fillStyle(0xff8844, 0.15);
      gfx.fillCircle(pair.b.x, pair.b.y, 14);
      gfx.lineStyle(1, 0xff8844, 0.4);
      gfx.strokeCircle(pair.b.x, pair.b.y, 14);
      gfx.lineStyle(1, 0x8844ff, 0.15);
      gfx.lineBetween(pair.a.x, pair.a.y, pair.b.x, pair.b.y);
    }

    const zone = level.placementZone;
    gfx.lineStyle(1, 0x44ff44, 0.2);
    gfx.strokeRect(zone.x, zone.y, zone.width, zone.height);
  }

  shutdown(): void {
    if (this.playTimer) {
      this.playTimer.destroy();
      this.playTimer = null;
    }
    this.dotsA = [];
    this.dotsB = [];
    this.replayA = [];
    this.replayB = [];

    // Remove keyboard listeners to prevent accumulation on re-entry
    this.input.keyboard?.removeAllListeners();
  }
}
