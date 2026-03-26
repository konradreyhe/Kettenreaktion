import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';

/** Start screen with play button, streak, and puzzle info. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Title
    this.add
      .text(cx, 120, 'KETTENREAKTION', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(cx, 165, 'Taegliches Physik-Puzzle', {
        fontSize: '14px',
        color: '#8888cc',
      })
      .setOrigin(0.5);

    // Puzzle number
    const puzzleNum = DailySystem.getPuzzleNumber();
    this.add
      .text(cx, 210, `Puzzle #${puzzleNum}`, {
        fontSize: '18px',
        color: '#aaaaff',
      })
      .setOrigin(0.5);

    // Streak
    const streak = StorageManager.getStreak();
    if (streak > 0) {
      this.add
        .text(cx, 250, `Streak: ${streak} Tage`, {
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0.5);
    }

    // Play button
    const playBtn = this.add
      .rectangle(cx, 340, 200, 50, 0x4444aa)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x6666ff);

    this.add
      .text(cx, 340, 'SPIELEN', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    playBtn.on('pointerover', () => playBtn.setFillStyle(0x5555bb));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x4444aa));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // How-To button
    const howBtn = this.add
      .rectangle(cx, 410, 200, 40, 0x333355)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x555577);

    this.add
      .text(cx, 410, 'Anleitung', {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    howBtn.on('pointerover', () => howBtn.setFillStyle(0x444466));
    howBtn.on('pointerout', () => howBtn.setFillStyle(0x333355));
    howBtn.on('pointerdown', () => this.scene.start('HowToScene'));

    // Countdown to next puzzle
    const countdownText = this.add
      .text(cx, GAME_HEIGHT - 40, '', {
        fontSize: '12px',
        color: '#666688',
      })
      .setOrigin(0.5);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const ms = DailySystem.getTimeUntilReset();
        countdownText.setText(
          `Naechstes Puzzle in: ${DailySystem.formatCountdown(ms)}`
        );
      },
    });
  }
}
