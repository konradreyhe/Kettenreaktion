import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { ShareManager } from '../systems/ShareManager';
import { LevelLoader } from '../game/LevelLoader';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { ReplayExporter } from '../systems/ReplayExporter';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
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
    const previousBest = StorageManager.load().bestScore;
    const isNewBest = !isPractice && data.score.total > previousBest;

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
        fontFamily: FONT_UI,
        fontSize: '18px',
        color: COLOR.textMuted,
        stroke: '#111122',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Solved status with animation
    const statusText = data.solved ? 'Geschafft!' : 'Nicht geschafft';
    const statusColor = data.solved ? AccessibilityManager.successHex : AccessibilityManager.failHex;
    const status = this.add
      .text(cx, 78, statusText, {
        fontFamily: FONT_TITLE,
        fontSize: '24px',
        color: statusColor,
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 3,
        shadow: TEXT_SHADOW,
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
          fontFamily: FONT_UI,
          fontSize: '12px',
          color: COLOR.textMuted,
        })
        .setAlpha(0);

      const scoreVal = this.add
        .text(cx + 120, y, `+${item.score}`, {
          fontFamily: FONT_UI,
          fontSize: '12px',
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

    // Total score — big reveal with counter animation
    const totalScore = this.add
      .text(cx, 300, '0', {
        fontFamily: FONT_TITLE,
        fontSize: '40px',
        color: COLOR.accent,
        fontStyle: 'bold',
        stroke: '#332200',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: '#ffdd4466', blur: 12, fill: false, stroke: true },
      })
      .setOrigin(0.5)
      .setScale(0);

    this.add
      .text(cx, 340, 'PUNKTE', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: COLOR.accentDim,
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    // Scale in first, then count up
    this.tweens.add({
      targets: totalScore,
      scaleX: 1,
      scaleY: 1,
      delay: 1000,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Counter animation: tick from 0 to final score
        const target = data.score.total;
        const duration = Math.min(1200, Math.max(400, target * 0.8));
        this.tweens.addCounter({
          from: 0,
          to: target,
          duration,
          ease: 'Cubic.easeOut',
          onUpdate: (tween) => {
            const val = Math.floor(tween.getValue() ?? 0);
            totalScore.setText(val.toLocaleString('de-DE'));
          },
          onComplete: () => {
            if (isNewBest) {
              const bestText = this.add
                .text(cx, 280, 'Neuer Rekord!', {
                  fontSize: '12px', color: '#ff8844', fontStyle: 'bold',
                })
                .setOrigin(0.5).setScale(0);
              this.tweens.add({
                targets: bestText,
                scaleX: 1, scaleY: 1,
                duration: 300, ease: 'Back.easeOut',
              });
            }
          },
        });
      },
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
          title: StorageManager.getTitle(),
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

    // GIF replay export button
    if (data.replay && data.replay.length > 0 && data.levelId) {
      const level = LevelLoader.loadById(data.levelId);
      if (level && data.placement) {
        const gifBtn = new Button(this, {
          x: cx, y: 455, text: 'GIF speichern',
          width: 180, height: 34, fontSize: '12px',
          color: 0x443366, hoverColor: 0x554477, textColor: '#bb99ee',
          onClick: async () => {
            gifBtn.setText('Erstelle GIF...');
            // Yield to let the UI update before encoding
            await new Promise((r) => setTimeout(r, 50));
            try {
              const blob = ReplayExporter.export({
                replayFrames: data.replay!,
                level,
                placement: data.placement!,
                puzzleNumber: puzzleNum,
                score: data.score.total,
                solved: data.solved,
              });
              const result = await ReplayExporter.share(blob, puzzleNum);
              gifBtn.setText(result === 'shared' ? 'Geteilt!' : 'Gespeichert!');
              this.time.delayedCall(2000, () => gifBtn.setText('GIF speichern'));
            } catch {
              gifBtn.setText('Fehler');
              this.time.delayedCall(2000, () => gifBtn.setText('GIF speichern'));
            }
          },
        });
      }
    }

    // WhatsApp share button (DACH market)
    if (typeof navigator.share !== 'function') {
      new Button(this, {
        x: cx, y: 490, text: 'WhatsApp teilen',
        width: 180, height: 34, fontSize: '12px',
        color: 0x25d366, hoverColor: 0x2ee67a, textColor: '#ffffff',
        onClick: () => {
          const text = ShareManager.generateEmojiResult({
            puzzleNumber: puzzleNum,
            score: data.score.total,
            attempts: data.attempts,
            chainLength: data.chainLength,
            streak,
            solved: data.solved,
            targetsHit: data.targetsHit,
            totalTargets: data.totalTargets,
            title: StorageManager.getTitle(),
          });
          ShareManager.shareWhatsApp(text);
        },
      });
    }

    if (isPractice) {
      // Practice mode: Replay + Next Level + Back
      new Button(this, {
        x: cx - 110, y: 518, text: 'Nochmal',
        width: 130, height: 36, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          this.scene.start('GameScene', { practiceIndex: data.practiceIndex });
        },
      });

      new Button(this, {
        x: cx + 110, y: 518, text: 'Naechstes',
        width: 130, height: 36, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          const next = ((data.practiceIndex ?? 0) + 1) % LevelLoader.getTemplateCount();
          this.scene.start('GameScene', { practiceIndex: next });
        },
      });

      // Challenge button
      const challengeBtn = new Button(this, {
        x: cx, y: 550, text: 'Freund herausfordern',
        width: 170, height: 30, fontSize: '11px',
        color: 0x443355, hoverColor: 0x554466, textColor: '#bb88dd',
        onClick: async () => {
          const url = `${window.location.origin}${window.location.pathname}?challenge=${data.practiceIndex ?? 0}`;
          try {
            await navigator.clipboard.writeText(url);
            challengeBtn.setText('Link kopiert!');
            this.time.delayedCall(2000, () => challengeBtn.setText('Freund herausfordern'));
          } catch { /* ignore */ }
        },
      });

      new Button(this, {
        x: cx, y: 575, text: 'Zurueck',
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
      // Daily mode: Menu
      new Button(this, {
        x: cx, y: 518, text: 'Zum Menue',
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
    // Generate two confetti shapes — rectangle + diamond
    if (!this.textures.exists('confetti')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 8, 4);
      gfx.generateTexture('confetti', 8, 4);
      gfx.destroy();
    }
    if (!this.textures.exists('confetti_dot')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('confetti_dot', 6, 6);
      gfx.destroy();
    }

    // Main confetti stream
    this.add.particles(GAME_WIDTH / 2, -10, 'confetti', {
      x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
      speedY: { min: 60, max: 180 },
      speedX: { min: -50, max: 50 },
      scale: { min: 0.4, max: 1.0 },
      rotate: { min: 0, max: 360 },
      lifespan: 3500,
      frequency: 60,
      quantity: 3,
      tint: [0xffdd44, 0xff5544, 0x44ee88, 0x4488ff, 0xff44cc, 0xffffff],
      duration: 2500,
    });

    // Sparkle dots
    this.add.particles(GAME_WIDTH / 2, -10, 'confetti_dot', {
      x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
      speedY: { min: 40, max: 120 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0.3 },
      lifespan: 2000,
      frequency: 120,
      quantity: 1,
      tint: [0xffffff, 0xffddaa],
      duration: 2000,
    });
  }
}
