import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { LevelLoader } from '../game/LevelLoader';
import { FONT_TITLE, FONT_UI } from '../constants/Style';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { Button } from '../ui/Button';
import type { PuzzleResult, ReplayFrame } from '../types/GameState';
import type { Level } from '../types/Level';

interface ReplayData {
  puzzleNumber: number;
  result: PuzzleResult;
}

/** Replays yesterday's solution as a ghost animation over the level layout. */
export class ReplayScene extends Phaser.Scene {
  private replayFrames: ReplayFrame[] = [];
  private frameIndex = 0;
  private dots: Phaser.GameObjects.GameObject[] = [];
  private isPlaying = false;
  private playTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'ReplayScene' });
  }

  create(data: ReplayData): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(200, 26, 26, 46);

    this.replayFrames = data.result.replay ?? [];
    this.frameIndex = 0;
    this.dots = [];

    // Header
    this.add
      .text(cx, 25, `Gestern: Puzzle #${data.puzzleNumber}`, {
        fontFamily: FONT_TITLE,
        fontSize: '14px', color: '#8888cc',
        stroke: '#111122', strokeThickness: 2,
      })
      .setOrigin(0.5).setDepth(50);

    // Score info
    const scoreText = data.result.solved ? 'Geloest!' : 'Nicht geloest';
    const scoreColor = data.result.solved ? AccessibilityManager.successHex : AccessibilityManager.failHex;
    this.add
      .text(cx, 50, `${scoreText}  |  ${data.result.score.toLocaleString('de-DE')} Punkte`, {
        fontFamily: FONT_UI,
        fontSize: '11px', color: scoreColor,
        stroke: '#111122', strokeThickness: 1,
      })
      .setOrigin(0.5).setDepth(50);

    // Draw static level layout
    const level = data.result.levelId
      ? LevelLoader.loadById(data.result.levelId)
      : null;

    if (level) {
      this.drawLevelLayout(level);
    }

    // Draw placement marker
    if (data.result.placement) {
      const p = data.result.placement;
      this.add.circle(p.x, p.y, 8, 0x88ccff, 0.3).setDepth(20);
      this.add.circle(p.x, p.y, 3, 0x88ccff, 0.8).setDepth(21);
    }

    // Progress bar background
    const barBg = this.add
      .rectangle(cx, GAME_HEIGHT - 50, 400, 6, 0x333355, 0.5)
      .setDepth(50);
    const barFill = this.add
      .rectangle(cx - 200, GAME_HEIGHT - 50, 0, 6, 0x6688cc, 0.8)
      .setOrigin(0, 0.5).setDepth(51);

    // Frame counter text
    const frameText = this.add
      .text(cx, GAME_HEIGHT - 38, '', {
        fontSize: '10px', color: '#555577',
      })
      .setOrigin(0.5).setDepth(50);

    // Create visual bodies from first frame
    if (this.replayFrames.length > 0) {
      const firstFrame = this.replayFrames[0];
      const placementType = data.result.placement?.type ?? 'ball';
      for (let i = 0; i < firstFrame.length; i++) {
        const [x, y, angle] = firstFrame[i];
        const isPlayer = i === firstFrame.length - 1;

        // Use actual textures for better look
        let dot: Phaser.GameObjects.GameObject & { setPosition: (x: number, y: number) => void; setRotation?: (r: number) => void };
        if (isPlayer) {
          const tex = placementType === 'weight' ? 'weight' : 'ball';
          const sprite = this.add.sprite(x, y, tex).setDepth(31).setRotation(angle);
          dot = sprite;
        } else {
          // Other bodies — use domino texture or a generic shape
          const sprite = this.add.sprite(x, y, 'domino').setDepth(30).setAlpha(0.7).setRotation(angle);
          dot = sprite;
        }
        this.dots.push(dot);
      }
    }

    // Start playback
    this.isPlaying = true;
    this.playTimer = this.time.addEvent({
      delay: 50, // ~20fps matching the recording rate
      loop: true,
      callback: () => {
        if (!this.isPlaying || this.frameIndex >= this.replayFrames.length) {
          this.isPlaying = false;
          return;
        }

        const frame = this.replayFrames[this.frameIndex];
        for (let i = 0; i < Math.min(frame.length, this.dots.length); i++) {
          const d = this.dots[i] as unknown as Phaser.GameObjects.Sprite;
          d.setPosition(frame[i][0], frame[i][1]);
          if (frame[i][2] !== undefined) {
            d.setRotation(frame[i][2]);
          }
        }

        // Update progress bar
        const progress = this.frameIndex / Math.max(1, this.replayFrames.length - 1);
        barFill.setSize(400 * progress, 6);
        frameText.setText(
          `${Math.round(progress * 100)}%`
        );

        this.frameIndex++;
      },
    });

    // Back button
    new Button(this, {
      x: cx - 80, y: GAME_HEIGHT - 18, text: 'Zurueck',
      width: 100, height: 28, fontSize: '11px',
      color: 0x222233, hoverColor: 0x2a2a44, textColor: '#777799',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });

    // Replay button
    new Button(this, {
      x: cx + 80, y: GAME_HEIGHT - 18, text: 'Nochmal',
      width: 100, height: 28, fontSize: '11px',
      color: 0x333355, hoverColor: 0x444466, textColor: '#8888aa',
      onClick: () => {
        this.frameIndex = 0;
        this.isPlaying = true;
      },
    });

    // ESC to go back
    this.input.keyboard?.on('keydown-ESC', () => {
      this.cameras.main.fadeOut(200, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  private drawLevelLayout(level: Level): void {
    const gfx = this.add.graphics().setDepth(5);

    // Floor
    gfx.fillStyle(0x334455, 0.4);
    gfx.fillRect(0, 580, 800, 20);

    // Static objects
    for (const obj of level.staticObjects) {
      const height = obj.height ?? 20;
      if (obj.type === 'platform') {
        gfx.fillStyle(0x445566, 0.3);
        gfx.fillRect(obj.x, obj.y, obj.width, height);
      } else if (obj.type === 'ramp') {
        gfx.fillStyle(0x555577, 0.3);
        // Simple rectangle for ramp (angle not visually applied in replay)
        gfx.fillRect(obj.x, obj.y - height / 2, obj.width, height);
      }
    }

    // Targets
    for (const target of level.targets) {
      gfx.fillStyle(0xffdd44, 0.2);
      gfx.fillCircle(target.x, target.y, 12);
      gfx.lineStyle(1, 0xffdd44, 0.4);
      gfx.strokeCircle(target.x, target.y, 12);
    }

    // Placement zone
    const zone = level.placementZone;
    gfx.lineStyle(1, 0x44ff44, 0.2);
    gfx.strokeRect(zone.x, zone.y, zone.width, zone.height);
  }

  shutdown(): void {
    if (this.playTimer) {
      this.playTimer.destroy();
      this.playTimer = null;
    }
    this.dots = [];
    this.replayFrames = [];
  }
}
