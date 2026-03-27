import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { ShareManager } from '../systems/ShareManager';
import { LevelLoader } from '../game/LevelLoader';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { Button } from '../ui/Button';
import type { ScoreResult, ReplayFrame } from '../types/GameState';

interface ResultData {
  score: ScoreResult;
  chainLength: number;
  attempts: number;
  solved: boolean;
  targetsHit: number;
  totalTargets: number;
  isPractice?: boolean;
  practiceIndex?: number;
  replay?: ReplayFrame[];
  placement?: { type: string; x: number; y: number };
  levelId?: string;
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

    const isPractice = data.isPractice ?? false;

    // Save result (daily mode only)
    if (!isPractice) {
      StorageManager.recordPuzzle(puzzleNum, {
        score: data.score.total,
        attempts: data.attempts,
        solved: data.solved,
        completed: true,
        date: new Date().toISOString().split('T')[0],
        replay: data.replay,
        placement: data.placement,
        levelId: data.levelId,
      });
    }

    const streak = isPractice ? 0 : StorageManager.getStreak();

    // Header
    const headerText = isPractice ? 'Uebungsmodus' : `Kettenreaktion #${puzzleNum}`;
    this.add
      .text(cx, 40, headerText, {
        fontSize: '22px',
        color: '#8888cc',
      })
      .setOrigin(0.5);

    // Solved status with animation
    const statusText = data.solved ? 'Geschafft!' : 'Nicht geschafft';
    const statusColor = data.solved ? AccessibilityManager.successHex : AccessibilityManager.failHex;
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
    const savedAttempts = data.score.efficiencyBonus / 200;
    const breakdownItems = [
      { label: 'Sterne', value: `${data.targetsHit}/${data.totalTargets}`, score: data.score.baseScore },
      { label: 'Kette', value: `${data.chainLength}`, score: data.score.chainBonus },
      { label: 'Effizienz', value: savedAttempts > 0 ? `${savedAttempts} gespart` : `${data.attempts}/3`, score: data.score.efficiencyBonus },
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
        .text(cx, 370, `Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}`, {
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0.5);
    }

    // Share button
    const shareButton = new Button(this, {
      x: cx, y: 420, text: 'Ergebnis teilen',
      width: 220, height: 44, fontSize: '16px',
      color: 0x338833, hoverColor: 0x44aa44,
      onClick: async () => {
        const text = ShareManager.generateEmojiResult({
          puzzleNumber: puzzleNum,
          score: data.score.total,
          attempts: data.attempts,
          chainLength: data.chainLength,
          streak,
          solved: data.solved,
          targetsHit: data.targetsHit,
          totalTargets: data.totalTargets,
        });

        try {
          await ShareManager.share(text);
          shareButton.setText('Kopiert!');
          this.time.delayedCall(2000, () => {
            shareButton.setText('Ergebnis teilen');
          });
        } catch {
          // Share cancelled
        }
      },
    });

    if (isPractice) {
      // Practice mode: Replay + Next Level + Back
      new Button(this, {
        x: cx - 110, y: 478, text: 'Nochmal',
        width: 130, height: 36, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          this.scene.start('GameScene', { practiceIndex: data.practiceIndex });
        },
      });

      new Button(this, {
        x: cx + 110, y: 478, text: 'Naechstes',
        width: 130, height: 36, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          const next = ((data.practiceIndex ?? 0) + 1) % LevelLoader.getTemplateCount();
          this.scene.start('GameScene', { practiceIndex: next });
        },
      });

      new Button(this, {
        x: cx, y: 525, text: 'Zurueck',
        width: 120, height: 30, fontSize: '12px',
        color: 0x222233, hoverColor: 0x2a2a44, textColor: '#777799',
        onClick: () => {
          this.cameras.main.fadeOut(200, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('PracticeScene');
          });
        },
      });
    } else {
      // Daily mode: Menu button
      new Button(this, {
        x: cx, y: 478, text: 'Zum Menue',
        width: 180, height: 38, fontSize: '14px',
        color: 0x2a2a44, hoverColor: 0x333355,
        textColor: '#9999bb',
        onClick: () => {
          this.cameras.main.fadeOut(300, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
          });
        },
      });
    }

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
