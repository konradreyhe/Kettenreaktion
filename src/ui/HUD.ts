import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/Game';
import { FONT_UI, COLOR } from '../constants/Style';

/** In-game heads-up display with dark panel backing. */
export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private attemptsText: Phaser.GameObjects.Text;
  private chainText: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;

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

    this.attemptsText = scene.add
      .text(GAME_WIDTH - 16, 14, 'Versuche: 0/3', {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: '#aaaacc',
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
    this.attemptsText.setText(`Versuche: ${current}/${max}`);

    // Warning color when low on attempts
    if (current >= max) {
      this.attemptsText.setColor('#ff4444');
    } else if (current === max - 1) {
      this.attemptsText.setColor('#ffaa44');
      // Pulse warning
      this.scene.tweens.add({
        targets: this.attemptsText,
        scaleX: 1.15, scaleY: 1.15,
        duration: 150,
        yoyo: true,
      });
    } else {
      this.attemptsText.setColor('#aaaacc');
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
      }
    }
  }

  updatePuzzleNumber(num: number): void {
    this.puzzleText.setText(`Puzzle #${num}`);
  }

  updateLabel(label: string): void {
    this.puzzleText.setText(label);
  }
}
