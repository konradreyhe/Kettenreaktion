import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { ShareManager } from '../systems/ShareManager';
import type { ScoreResult } from '../types/GameState';

interface ResultData {
  score: ScoreResult;
  chainLength: number;
  attempts: number;
  solved: boolean;
  targetsHit: number;
  totalTargets: number;
}

/** Displays final score, breakdown, sharing, and countdown. */
export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: ResultData): void {
    const cx = GAME_WIDTH / 2;
    const puzzleNum = DailySystem.getPuzzleNumber();

    this.cameras.main.fadeIn(300, 26, 26, 46);

    // Save result
    StorageManager.recordPuzzle(puzzleNum, {
      score: data.score.total,
      attempts: data.attempts,
      solved: data.solved,
      date: new Date().toISOString().split('T')[0],
    });

    const streak = StorageManager.getStreak();

    // Header
    this.add
      .text(cx, 40, `Kettenreaktion #${puzzleNum}`, {
        fontSize: '22px',
        color: '#8888cc',
      })
      .setOrigin(0.5);

    // Solved status with animation
    const statusText = data.solved ? 'Geschafft!' : 'Nicht geschafft';
    const statusColor = data.solved ? '#44ff44' : '#ff6644';
    const status = this.add
      .text(cx, 78, statusText, {
        fontSize: '28px',
        color: statusColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: status,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Success particles
    if (data.solved) {
      this.createCelebrationParticles();
    }

    // Score breakdown — animate in sequentially
    const breakdownItems = [
      { label: 'Sterne', value: `${data.targetsHit}/${data.totalTargets}`, score: data.score.baseScore },
      { label: 'Kette', value: `${data.chainLength}`, score: data.score.chainBonus },
      { label: 'Effizienz', value: `${data.attempts}/3`, score: data.score.efficiencyBonus },
      { label: 'Zeit', value: '', score: data.score.timeBonus },
    ];

    breakdownItems.forEach((item, i) => {
      const y = 130 + i * 32;

      const row = this.add
        .text(cx - 120, y, `${item.label}:  ${item.value}`, {
          fontSize: '14px',
          color: '#9999bb',
        })
        .setAlpha(0);

      const scoreVal = this.add
        .text(cx + 120, y, `+${item.score}`, {
          fontSize: '14px',
          color: item.score > 0 ? '#aaddaa' : '#666688',
        })
        .setOrigin(1, 0)
        .setAlpha(0);

      this.tweens.add({
        targets: [row, scoreVal],
        alpha: 1,
        x: '+=10',
        delay: 400 + i * 150,
        duration: 300,
      });
    });

    // Divider
    this.add.rectangle(cx, 270, 260, 2, 0x4444aa, 0.4);

    // Total score — big reveal
    const totalScore = this.add
      .text(cx, 300, `${data.score.total.toLocaleString('de-DE')}`, {
        fontSize: '44px',
        color: '#ffdd44',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScale(0);

    this.add
      .text(cx, 338, 'Punkte', {
        fontSize: '14px',
        color: '#aa9944',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: totalScore,
      scaleX: 1,
      scaleY: 1,
      delay: 1000,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Streak
    if (streak > 0) {
      this.add
        .text(cx, 370, `Streak: ${streak} Tage`, {
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0.5);
    }

    // Share button
    const shareBtnBg = this.add
      .rectangle(cx, 420, 220, 44, 0x338833)
      .setStrokeStyle(2, 0x55aa55)
      .setInteractive({ useHandCursor: true });

    const shareBtnText = this.add
      .text(cx, 420, 'Ergebnis teilen', {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    shareBtnBg.on('pointerover', () => shareBtnBg.setFillStyle(0x44aa44));
    shareBtnBg.on('pointerout', () => shareBtnBg.setFillStyle(0x338833));
    shareBtnBg.on('pointerdown', async () => {
      const text = ShareManager.generateEmojiResult({
        puzzleNumber: puzzleNum,
        score: data.score.total,
        attempts: data.attempts,
        chainLength: data.chainLength,
        streak,
        solved: data.solved,
      });

      try {
        await ShareManager.share(text);
        shareBtnText.setText('Kopiert!');
        shareBtnBg.setFillStyle(0x226622);
        this.time.delayedCall(2000, () => {
          shareBtnText.setText('Ergebnis teilen');
          shareBtnBg.setFillStyle(0x338833);
        });
      } catch {
        // Share cancelled
      }
    });

    // Menu button
    const menuBtn = this.add
      .rectangle(cx, 478, 180, 38, 0x2a2a44)
      .setStrokeStyle(1, 0x444466)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(cx, 478, 'Zum Menue', {
        fontSize: '14px',
        color: '#9999bb',
      })
      .setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x333355));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x2a2a44));
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Countdown
    const countdownText = this.add
      .text(cx, GAME_HEIGHT - 30, '', {
        fontSize: '12px',
        color: '#555577',
      })
      .setOrigin(0.5);

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

  private createCelebrationParticles(): void {
    if (!this.textures.exists('confetti')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 6, 6);
      gfx.generateTexture('confetti', 6, 6);
      gfx.destroy();
    }

    this.add.particles(GAME_WIDTH / 2, -10, 'confetti', {
      x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
      speedY: { min: 50, max: 150 },
      speedX: { min: -30, max: 30 },
      scale: { min: 0.3, max: 0.8 },
      rotate: { min: 0, max: 360 },
      lifespan: 3000,
      frequency: 80,
      quantity: 2,
      tint: [0xffdd44, 0xff6644, 0x44ff44, 0x4488ff, 0xff44ff],
      duration: 2000,
    });
  }
}
