import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/Game';

/** In-game heads-up display: score, attempts, chain, puzzle number. */
export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private attemptsText: Phaser.GameObjects.Text;
  private chainText: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.puzzleText = scene.add
      .text(GAME_WIDTH / 2, 12, '', {
        fontSize: '12px',
        color: '#8888aa',
      })
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.scoreText = scene.add
      .text(16, 12, 'Sterne: 0', {
        fontSize: '14px',
        color: '#ffdd44',
      })
      .setDepth(100);

    this.attemptsText = scene.add
      .text(GAME_WIDTH - 16, 12, 'Versuche: 0/3', {
        fontSize: '14px',
        color: '#aaaacc',
      })
      .setOrigin(1, 0)
      .setDepth(100);

    this.chainText = scene.add
      .text(16, 34, '', {
        fontSize: '12px',
        color: '#ff8844',
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
