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
      .text(cx, 50, `Kettenreaktion #${puzzleNum}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Solved status
    const statusText = data.solved ? 'Geschafft!' : 'Nicht geschafft';
    const statusColor = data.solved ? '#44ff44' : '#ff4444';
    this.add
      .text(cx, 90, statusText, {
        fontSize: '20px',
        color: statusColor,
      })
      .setOrigin(0.5);

    // Score breakdown
    const breakdown = [
      `Sterne: ${data.targetsHit}/${data.totalTargets}  =  ${data.score.baseScore}`,
      `Kette: ${data.chainLength}  =  +${data.score.chainBonus}`,
      `Effizienz: ${data.attempts}/${3} Versuche  =  +${data.score.efficiencyBonus}`,
      `Zeit-Bonus:  +${data.score.timeBonus}`,
    ];

    breakdown.forEach((line, i) => {
      this.add
        .text(cx, 140 + i * 30, line, {
          fontSize: '14px',
          color: '#aaaacc',
        })
        .setOrigin(0.5);
    });

    // Total score
    this.add
      .text(cx, 290, `Score: ${data.score.total.toLocaleString('de-DE')}`, {
        fontSize: '28px',
        color: '#ffdd44',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Streak
    if (streak > 0) {
      this.add
        .text(cx, 330, `Streak: ${streak} Tage`, {
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0.5);
    }

    // Share button
    const shareBtn = this.add
      .rectangle(cx, 390, 200, 45, 0x44aa44)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x66cc66);

    this.add
      .text(cx, 390, 'Ergebnis teilen', {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    shareBtn.on('pointerover', () => shareBtn.setFillStyle(0x55bb55));
    shareBtn.on('pointerout', () => shareBtn.setFillStyle(0x44aa44));
    shareBtn.on('pointerdown', async () => {
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
        shareBtn.setFillStyle(0x226622);
      } catch {
        // Sharing cancelled or failed — no action needed
      }
    });

    // Menu button
    const menuBtn = this.add
      .rectangle(cx, 450, 200, 40, 0x333355)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x555577);

    this.add
      .text(cx, 450, 'Zum Menue', {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Countdown
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
