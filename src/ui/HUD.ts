import Phaser from 'phaser';
import { GAME_WIDTH, TIME_LIMIT_SECONDS } from '../constants/Game';
import { FONT_UI, COLOR } from '../constants/Style';

/** Pip radius and spacing for attempt indicators. */
const PIP_RADIUS = 6;
const PIP_SPACING = 18;
const PIP_COLOR_UNUSED = 0xffdd44;
const PIP_COLOR_USED = 0x444466;

/** In-game heads-up display with dark panel backing. */
export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private pips: Phaser.GameObjects.Arc[] = [];
  private pipLabel: Phaser.GameObjects.Text;
  private chainText: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private timerStartMs: number = 0;
  private maxPips: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Dark panel behind HUD with gradient feel
    scene.add
      .rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 50, 0x0a0a1a, 0.7)
      .setOrigin(0.5, 0)
      .setDepth(99);

    // Bottom edge glow — two-layer for softer falloff
    scene.add
      .rectangle(GAME_WIDTH / 2, 50, GAME_WIDTH, 3, 0x4466aa, 0.3)
      .setOrigin(0.5, 0.5)
      .setDepth(99);
    scene.add
      .rectangle(GAME_WIDTH / 2, 52, GAME_WIDTH, 2, 0x3355aa, 0.1)
      .setOrigin(0.5, 0.5)
      .setDepth(99);

    this.puzzleText = scene.add
      .text(GAME_WIDTH / 2, 10, '', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: COLOR.textMuted,
      })
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.scoreText = scene.add
      .text(16, 14, 'Sterne: 0', {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: COLOR.accent,
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 2,
      })
      .setDepth(100);

    // Attempts label above pips
    this.pipLabel = scene.add
      .text(GAME_WIDTH - 16, 10, 'Versuche', {
        fontFamily: FONT_UI,
        fontSize: '9px',
        color: COLOR.textMuted,
        stroke: '#111122',
        strokeThickness: 1,
      })
      .setOrigin(1, 0)
      .setDepth(100);

    this.chainText = scene.add
      .text(16, 33, '', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        color: COLOR.chain,
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 1,
      })
      .setDepth(100);

    // Timer text — hidden by default, shown via startTimer()
    this.timerText = scene.add
      .text(GAME_WIDTH - 120, 25, '', {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false);
  }

  /** Create pip circles for max attempts. Pips are right-aligned. */
  private createPips(max: number): void {
    // Destroy existing pips
    for (const pip of this.pips) {
      pip.destroy();
    }
    this.pips = [];
    this.maxPips = max;

    const rightEdge = GAME_WIDTH - 16;
    const totalWidth = (max - 1) * PIP_SPACING;
    const startX = rightEdge - totalWidth;
    const pipY = 32;

    for (let i = 0; i < max; i++) {
      const x = startX + i * PIP_SPACING;
      const pip = this.scene.add
        .circle(x, pipY, PIP_RADIUS, PIP_COLOR_UNUSED)
        .setStrokeStyle(1.5, 0xffffff, 0.3)
        .setDepth(100);
      this.pips.push(pip);
    }
  }

  updateScore(targetsHit: number, totalTargets?: number): void {
    if (totalTargets !== undefined) {
      this.scoreText.setText(`Sterne: ${targetsHit}/${totalTargets}`);
    } else {
      this.scoreText.setText(`Sterne: ${targetsHit}`);
    }

    // Flash and scale on target hit
    if (targetsHit > 0) {
      this.scene.tweens.add({
        targets: this.scoreText,
        scaleX: 1.3, scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
  }

  updateAttempts(current: number, max: number): void {
    // Create pips on first call or if max changed
    if (this.pips.length !== max) {
      this.createPips(max);
    }

    for (let i = 0; i < max; i++) {
      const pip = this.pips[i];
      if (!pip) continue;

      if (i < current) {
        // Used attempt — animate shrink and grey out if not already used
        if (pip.fillColor !== PIP_COLOR_USED) {
          this.scene.tweens.add({
            targets: pip,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
              pip.setFillStyle(PIP_COLOR_USED);
              pip.setStrokeStyle(1.5, 0xffffff, 0.1);
              this.scene.tweens.add({
                targets: pip,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeOut',
              });
            },
          });
        }
      } else {
        // Remaining attempt — gold
        pip.setFillStyle(PIP_COLOR_UNUSED);
        pip.setStrokeStyle(1.5, 0xffffff, 0.3);
        pip.setScale(1);
      }
    }
  }

  updateChain(length: number): void {
    if (length > 0) {
      this.chainText.setText(`Kette: ${length}`);

      // Escalating chain colors
      if (length >= 15) {
        this.chainText.setColor('#ffdd00');
      } else if (length >= 10) {
        this.chainText.setColor('#ff6644');
      } else if (length >= 5) {
        this.chainText.setColor('#44ddff');
      } else {
        this.chainText.setColor(COLOR.chain);
      }
    } else {
      this.chainText.setText('');
      this.chainText.setColor(COLOR.chain);
    }
  }

  updatePuzzleNumber(num: number): void {
    this.puzzleText.setText(`Puzzle #${num}`);
  }

  updateLabel(label: string): void {
    this.puzzleText.setText(label);
  }

  /** Show the timer and start counting elapsed seconds. */
  startTimer(): void {
    this.timerStartMs = this.scene.time.now;
    this.timerText.setText('0.0s');
    this.timerText.setColor('#ffffff');
    this.timerText.setVisible(true);

    // Clean up any existing timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    this.timerEvent = this.scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: this.tickTimer,
      callbackScope: this,
    });
  }

  /** Stop the timer and freeze the display. */
  stopTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = null;
    }
  }

  /** Hide the timer display entirely. */
  hideTimer(): void {
    this.stopTimer();
    this.timerText.setVisible(false);
  }

  /** Internal tick callback — updates text and color every 100ms. */
  private tickTimer(): void {
    const elapsedMs = this.scene.time.now - this.timerStartMs;
    const elapsedSec = elapsedMs / 1000;
    this.timerText.setText(`${elapsedSec.toFixed(1)}s`);

    // Color interpolation: white (0-15s) -> yellow (15-25s) -> red (25-30s)
    const color = this.getTimerColor(elapsedSec);
    this.timerText.setColor(color);
  }

  /** Returns a hex color string based on elapsed seconds. */
  private getTimerColor(seconds: number): string {
    const limit = TIME_LIMIT_SECONDS;
    const midPoint = limit * 0.5;   // 15s
    const warnPoint = limit * 0.833; // 25s

    if (seconds <= midPoint) {
      // White: no change needed
      return '#ffffff';
    } else if (seconds <= warnPoint) {
      // White -> Yellow: interpolate G stays, B drops
      const t = (seconds - midPoint) / (warnPoint - midPoint);
      const b = Math.round(255 * (1 - t));
      return `#ff${this.toHex(255)}${this.toHex(b)}`;
    } else {
      // Yellow -> Red: interpolate G drops
      const t = Math.min((seconds - warnPoint) / (limit - warnPoint), 1);
      const g = Math.round(255 * (1 - t));
      return `#ff${this.toHex(g)}00`;
    }
  }

  /** Convert a number (0-255) to a two-character hex string. */
  private toHex(value: number): string {
    const clamped = Math.max(0, Math.min(255, value));
    return clamped.toString(16).padStart(2, '0');
  }
}
