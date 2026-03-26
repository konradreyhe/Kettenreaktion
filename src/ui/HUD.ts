import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/Game';

/** In-game heads-up display with dark panel backing. */
export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private attemptsText: Phaser.GameObjects.Text;
  private chainText: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Dark panel behind HUD
    scene.add
      .rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 50, 0x0a0a1a, 0.6)
      .setOrigin(0.5, 0)
      .setDepth(99);

    // Subtle bottom edge
    scene.add
      .rectangle(GAME_WIDTH / 2, 50, GAME_WIDTH, 1, 0x333366, 0.3)
      .setOrigin(0.5, 0.5)
      .setDepth(99);

    this.puzzleText = scene.add
      .text(GAME_WIDTH / 2, 10, '', {
        fontSize: '11px',
        color: '#7777aa',
      })
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.scoreText = scene.add
      .text(16, 14, 'Sterne: 0', {
        fontSize: '14px',
        color: '#ffdd44',
        fontStyle: 'bold',
      })
      .setDepth(100);

    this.attemptsText = scene.add
      .text(GAME_WIDTH - 16, 14, 'Versuche: 0/3', {
        fontSize: '14px',
        color: '#aaaacc',
      })
      .setOrigin(1, 0)
      .setDepth(100);

    this.chainText = scene.add
      .text(16, 33, '', {
        fontSize: '12px',
        color: '#ff8844',
        fontStyle: 'bold',
      })
      .setDepth(100);
  }

  updateScore(targetsHit: number): void {
    this.scoreText.setText(`Sterne: ${targetsHit}`);
  }

  updateAttempts(current: number, max: number): void {
    this.attemptsText.setText(`Versuche: ${current}/${max}`);
  }

  updateChain(length: number): void {
    if (length > 0) {
      this.chainText.setText(`Kette: ${length}`);
    }
  }

  updatePuzzleNumber(num: number): void {
    this.puzzleText.setText(`Puzzle #${num}`);
  }
}
