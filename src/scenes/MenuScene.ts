import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { AudioManager } from '../systems/AudioManager';

/** Start screen with play button, streak, and puzzle info. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.fadeIn(300, 26, 26, 46);

    // Decorative background particles
    this.createBackgroundParticles();

    // Title with scale-in animation
    const title = this.add
      .text(cx, 100, 'KETTEN\nREAKTION', {
        fontSize: '42px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(10);

    this.tweens.add({
      targets: title,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Subtitle
    const subtitle = this.add
      .text(cx, 185, 'Taegliches Physik-Puzzle', {
        fontSize: '14px',
        color: '#7777bb',
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      delay: 300,
      duration: 500,
    });

    // Divider line
    const line = this.add
      .rectangle(cx, 210, 200, 2, 0x4444aa, 0.5)
      .setDepth(10);

    // Puzzle number
    const puzzleNum = DailySystem.getPuzzleNumber();
    this.add
      .text(cx, 235, `Puzzle #${puzzleNum}`, {
        fontSize: '18px',
        color: '#aaaaff',
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Streak
    const streak = StorageManager.getStreak();
    if (streak > 0) {
      const streakText = this.add
        .text(cx, 268, `Streak: ${streak} Tage`, {
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0.5)
        .setDepth(10);

      // Gentle pulse for streak
      this.tweens.add({
        targets: streakText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Play button
    const playBtnBg = this.add
      .rectangle(cx, 340, 220, 54, 0x3355aa)
      .setStrokeStyle(2, 0x5577dd)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    const playBtnText = this.add
      .text(cx, 340, 'SPIELEN', {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(11);

    playBtnBg.on('pointerover', () => {
      playBtnBg.setFillStyle(0x4466bb);
      playBtnBg.setScale(1.03);
      playBtnText.setScale(1.03);
    });
    playBtnBg.on('pointerout', () => {
      playBtnBg.setFillStyle(0x3355aa);
      playBtnBg.setScale(1);
      playBtnText.setScale(1);
    });
    playBtnBg.on('pointerdown', () => {
      AudioManager.init(); // Unlock audio on first user gesture
      AudioManager.playClick();
      this.cameras.main.fadeOut(300, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // How-To button
    const howBtn = this.add
      .rectangle(cx, 410, 180, 38, 0x2a2a44)
      .setStrokeStyle(1, 0x444466)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.add
      .text(cx, 410, 'Anleitung', {
        fontSize: '14px',
        color: '#9999bb',
      })
      .setOrigin(0.5)
      .setDepth(11);

    howBtn.on('pointerover', () => howBtn.setFillStyle(0x333355));
    howBtn.on('pointerout', () => howBtn.setFillStyle(0x2a2a44));
    howBtn.on('pointerdown', () => this.scene.start('HowToScene'));

    // Stats
    const data = StorageManager.load();
    if (data.gamesPlayed > 0) {
      this.add
        .text(cx, 470, `Spiele: ${data.gamesPlayed}  |  Bester Score: ${data.bestScore}`, {
          fontSize: '11px',
          color: '#555577',
        })
        .setOrigin(0.5)
        .setDepth(10);
    }

    // Countdown
    const countdownText = this.add
      .text(cx, GAME_HEIGHT - 35, '', {
        fontSize: '12px',
        color: '#555577',
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const ms = DailySystem.getTimeUntilReset();
        countdownText.setText(
          `Naechstes Puzzle: ${DailySystem.formatCountdown(ms)}`
        );
      },
    });
  }

  private createBackgroundParticles(): void {
    if (!this.textures.exists('bg_dot')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(2, 2, 2);
      gfx.generateTexture('bg_dot', 4, 4);
      gfx.destroy();
    }

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_dot', {
      x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
      y: { min: -GAME_HEIGHT / 2, max: GAME_HEIGHT / 2 },
      speed: { min: 5, max: 20 },
      scale: { min: 0.2, max: 0.6 },
      alpha: { min: 0.05, max: 0.15 },
      lifespan: 4000,
      frequency: 200,
      tint: [0x4444aa, 0x6666cc, 0x3333aa],
    });
  }
}
