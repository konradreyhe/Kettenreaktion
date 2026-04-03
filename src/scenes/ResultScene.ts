import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, POINTS_PER_SAVED_ATTEMPT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { ShareManager } from '../systems/ShareManager';
import { LevelLoader } from '../game/LevelLoader';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { ReplayExporter } from '../systems/ReplayExporter';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
import { AchievementManager } from '../systems/AchievementManager';
import { Button } from '../ui/Button';
import { SceneTransition } from '../game/SceneTransition';
import { getTomorrowsMutation } from '../systems/DailyMutation';
import { submitResult, fetchDailyStats, fetchHeatmap, fetchStreak, fetchLeaderboard } from '../systems/ApiClient';
import type { DailyStats, HeatmapData, LeaderboardData } from '../systems/ApiClient';
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
  difficulty?: number;
  trailArtUrl?: string;
  predictions?: { solve: boolean | null; chain5: boolean | null };
}

/** Displays final score, breakdown, sharing, and countdown. */
export class ResultScene extends Phaser.Scene {
  private streakText?: Phaser.GameObjects.Text;
  private countdownTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: ResultData): void {
    const cx = GAME_WIDTH / 2;
    const puzzleNum = DailySystem.getPuzzleNumber();

    SceneTransition.wipeIn(this);
    this.createAtmosphere(data.solved);

    // Tap anywhere to skip reveal animations
    let revealSkipped = false;
    this.input.once('pointerdown', () => {
      if (revealSkipped) return;
      revealSkipped = true;
      this.tweens.each((tween: Phaser.Tweens.Tween) => { tween.complete(); });
    });

    const isPractice = data.isPractice ?? false;
    const previousBest = StorageManager.load().bestScore;
    const isNewBest = !isPractice && data.score.total > previousBest;

    // Save result
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

      // Track best chain length for achievements
      const stored = StorageManager.load();
      if (data.chainLength > (stored.bestChainLength ?? 0)) {
        StorageManager.save({ bestChainLength: data.chainLength });
      }

      // Submit to global leaderboard (fire-and-forget)
      submitResult({
        score: data.score.total,
        solved: data.solved,
        attempts: data.attempts,
        chainLength: data.chainLength,
        placement: data.placement ?? undefined,
      });

      // Fetch global stats and display (async, non-blocking)
      this.loadGlobalStats(cx);
    } else if (data.levelId) {
      // Save practice best score
      const gameData = StorageManager.load();
      const practiceScores = gameData.practiceScores ?? {};
      const existing = practiceScores[data.levelId];
      if (!existing || data.score.total > existing.score) {
        practiceScores[data.levelId] = { score: data.score.total, solved: data.solved };
        StorageManager.save({ practiceScores });
      }
    }

    const streak = isPractice ? 0 : StorageManager.getStreak();

    // Check achievements after recording
    const newAchievements = isPractice ? [] : AchievementManager.checkAll();

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

    // Score breakdown panel background
    this.add.rectangle(cx, 177, 280, 140, 0x111125, 0.5)
      .setStrokeStyle(1, 0x334466, 0.2);

    // Score breakdown — animate in sequentially
    const savedAttempts = data.score.efficiencyBonus / POINTS_PER_SAVED_ATTEMPT;
    const breakdownItems = [
      { label: 'Sterne', value: `${data.targetsHit}/${data.totalTargets}`, score: data.score.baseScore },
      { label: 'Kette', value: `${data.chainLength}`, score: data.score.chainBonus },
      { label: 'Effizienz', value: savedAttempts > 0 ? `${savedAttempts} gespart` : `${data.attempts}/3`, score: data.score.efficiencyBonus },
      { label: 'Zeit', value: '', score: data.score.timeBonus },
    ];

    breakdownItems.forEach((item, i) => {
      const y = 130 + i * 32;
      const baseDelay = 400 + i * 200;

      const row = this.add
        .text(cx - 120, y, `${item.label}:  ${item.value}`, {
          fontFamily: FONT_UI,
          fontSize: '12px',
          color: COLOR.textMuted,
        })
        .setAlpha(0);

      const scoreVal = this.add
        .text(cx + 120, y, '+0', {
          fontFamily: FONT_UI,
          fontSize: '12px',
          color: item.score > 0 ? '#aaddaa' : '#666688',
        })
        .setOrigin(1, 0)
        .setAlpha(0);

      // Slide in
      this.tweens.add({
        targets: [row, scoreVal],
        alpha: 1,
        x: '+=10',
        delay: baseDelay,
        duration: 300,
        onComplete: () => {
          // Count up the individual score value
          if (item.score > 0) {
            this.tweens.addCounter({
              from: 0,
              to: item.score,
              duration: Math.min(400, item.score * 2),
              ease: 'Quad.easeOut',
              onUpdate: (tween) => {
                scoreVal.setText(`+${Math.floor(tween.getValue() ?? 0)}`);
              },
              onComplete: () => {
                scoreVal.setText(`+${item.score}`);
              },
            });
          }
        },
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

    // Streak (client-side, updated by server when available)
    if (streak > 0) {
      this.streakText = this.add
        .text(cx, 370, `\u{1F525} Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}`, {
          fontFamily: FONT_UI,
          fontSize: '14px',
          color: COLOR.streak,
          stroke: '#331100',
          strokeThickness: 2,
        })
        .setOrigin(0.5);
    }

    // Difficulty percentile (daily mode only)
    if (!isPractice && data.difficulty) {
      const percentile = ScoreCalculator.estimatePercentile(
        data.score.total, data.totalTargets, data.difficulty
      );
      this.add
        .text(cx, streak > 0 ? 390 : 370, `Besser als ${percentile}% der Spieler`, {
          fontSize: '11px', color: COLOR.textMuted,
        })
        .setOrigin(0.5);
    }

    // Daily bet results
    if (data.predictions && (data.predictions.solve !== null || data.predictions.chain5 !== null)) {
      let betY = streak > 0 ? 400 : 380;
      if (!isPractice && data.difficulty) betY += 10;

      const results: string[] = [];
      if (data.predictions.solve !== null) {
        const correct = data.predictions.solve === data.solved;
        results.push(`${correct ? '\u2705' : '\u274C'} Schaffe ich: ${correct ? 'Richtig!' : 'Falsch'}`);
      }
      if (data.predictions.chain5 !== null) {
        const correct = data.predictions.chain5 === (data.chainLength >= 5);
        results.push(`${correct ? '\u2705' : '\u274C'} Kette > 5: ${correct ? 'Richtig!' : 'Falsch'}`);
      }

      const betText = this.add.text(cx, betY, results.join('   '), {
        fontFamily: FONT_UI, fontSize: '9px', color: '#88aacc', letterSpacing: 1,
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: betText, alpha: 1, delay: 1500, duration: 500 });
    }

    // Dynamic Y tracker for stacking buttons without overlap
    let buttonY = 420;

    // Share button
    const shareButton = new Button(this, {
      x: cx, y: buttonY, text: 'Ergebnis teilen',
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
          replay: data.replay,
          placement: data.placement ?? undefined,
          predictions: data.predictions,
        });

        try {
          const shared = await ShareManager.share(text);
          shareButton.setText(shared ? 'Kopiert!' : 'Teilen fehlgeschlagen');
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
        buttonY += 40;
        const gifBtn = new Button(this, {
          x: cx, y: buttonY, text: 'Replay als GIF',
          width: 220, height: 38, fontSize: '13px',
          color: 0x2a3355, hoverColor: 0x3a4466, textColor: '#8899cc',
          onClick: async () => {
            // Animated loading dots
            let dots = 0;
            const loadingTimer = this.time.addEvent({
              delay: 300,
              loop: true,
              callback: () => {
                dots = (dots + 1) % 4;
                gifBtn.setText('Erstelle GIF' + '.'.repeat(dots));
              },
            });
            gifBtn.setText('Erstelle GIF.');
            try {
              const blob = await ReplayExporter.export({
                replayFrames: data.replay!,
                level,
                placement: data.placement!,
                puzzleNumber: puzzleNum,
                score: data.score.total,
                solved: data.solved,
              });
              loadingTimer.destroy();
              const result = await ReplayExporter.share(blob, puzzleNum);
              gifBtn.setText(result === 'shared' ? 'Geteilt!' : 'Gespeichert!');
              this.time.delayedCall(2000, () => gifBtn.setText('GIF speichern'));
            } catch {
              loadingTimer.destroy();
              gifBtn.setText('Fehler');
              this.time.delayedCall(2000, () => gifBtn.setText('GIF speichern'));
            }
          },
        });
      }
    }

    // Trail art share button (Photon Gallery)
    if (data.trailArtUrl) {
      buttonY += 34;
      const artBtn = new Button(this, {
        x: cx, y: buttonY, text: '\u{1F3A8} Kunstwerk teilen',
        width: 180, height: 34, fontSize: '12px',
        color: 0x2a2a55, hoverColor: 0x3a3a66, textColor: '#aa88dd',
        delay: 200,
        onClick: async () => {
          try {
            // Convert data URL to blob
            const response = await fetch(data.trailArtUrl!);
            const blob = await response.blob();
            const file = new File([blob], `kettenreaktion-${puzzleNum}.jpg`, { type: 'image/jpeg' });

            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Kettenreaktion #${puzzleNum} — Mein Kunstwerk`,
              });
              artBtn.setText('Geteilt!');
            } else {
              // Fallback: download
              const a = document.createElement('a');
              a.href = data.trailArtUrl!;
              a.download = `kettenreaktion-${puzzleNum}.jpg`;
              a.click();
              artBtn.setText('Gespeichert!');
            }
            this.time.delayedCall(2000, () => artBtn.setText('\u{1F3A8} Kunstwerk teilen'));
          } catch {
            // Share cancelled
          }
        },
      });
    }

    // WhatsApp share button (DACH market)
    if (typeof navigator.share !== 'function') {
      buttonY += 34;
      new Button(this, {
        x: cx, y: buttonY, text: 'WhatsApp teilen',
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

    // Butterfly Effect — compare current replay with yesterday's
    if (data.replay && data.replay.length > 0 && data.levelId) {
      const yesterdayNum = puzzleNum - 1;
      const yesterdayResult = StorageManager.load().puzzleHistory[yesterdayNum];
      if (yesterdayResult?.replay && yesterdayResult.replay.length > 0) {
        buttonY += 34;
        new Button(this, {
          x: cx, y: buttonY, text: 'Vergleichen',
          width: 160, height: 30, fontSize: '11px',
          color: 0x443366, hoverColor: 0x554477, textColor: '#aa88dd',
          delay: 300,
          onClick: () => {
            SceneTransition.wipeOut(this, 'ButterflyScene', {
              replayA: data.replay,
              placementA: data.placement,
              labelA: 'Heute',
              replayB: yesterdayResult.replay,
              placementB: yesterdayResult.placement,
              labelB: 'Gestern',
              levelId: data.levelId,
              levelIdB: yesterdayResult.levelId,
              returnScene: 'MenuScene',
            });
          },
        });
      }
    }

    // Navigation buttons below all share/export buttons
    const navY = Math.max(buttonY + 40, 510);

    if (isPractice) {
      // Practice mode: Replay + Next Level
      new Button(this, {
        x: cx - 110, y: navY, text: 'Nochmal',
        width: 130, height: 34, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          this.scene.start('GameScene', { practiceIndex: data.practiceIndex });
        },
      });

      new Button(this, {
        x: cx + 110, y: navY, text: 'Naechstes',
        width: 130, height: 34, fontSize: '13px',
        color: 0x334455, hoverColor: 0x445566, textColor: '#88aacc',
        onClick: () => {
          const next = ((data.practiceIndex ?? 0) + 1) % LevelLoader.getTemplateCount();
          this.scene.start('GameScene', { practiceIndex: next });
        },
      });

      // Challenge + Back row
      const challengeBtn = new Button(this, {
        x: cx - 80, y: navY + 38, text: 'Herausfordern',
        width: 140, height: 28, fontSize: '10px',
        color: 0x443355, hoverColor: 0x554466, textColor: '#bb88dd',
        onClick: async () => {
          const placementParam = data.placement
            ? `&p=${data.placement.type},${Math.round(data.placement.x)},${Math.round(data.placement.y)}`
            : '';
          const url = `${window.location.origin}${window.location.pathname}?challenge=${data.practiceIndex ?? 0}&score=${data.score.total}${placementParam}`;
          try {
            await navigator.clipboard.writeText(url);
            challengeBtn.setText('Kopiert!');
            this.time.delayedCall(2000, () => challengeBtn.setText('Herausfordern'));
          } catch { /* ignore */ }
        },
      });

      new Button(this, {
        x: cx + 80, y: navY + 38, text: 'Zurueck',
        width: 100, height: 28, fontSize: '10px',
        color: 0x222233, hoverColor: 0x2a2a44, textColor: '#777799',
        onClick: () => {
          SceneTransition.wipeOut(this, 'PracticeScene');
        },
      });
    } else {
      // Daily mode: Menu
      new Button(this, {
        x: cx, y: navY, text: 'Zum Menue',
        width: 180, height: 38, fontSize: '14px',
        color: 0x2a2a44, hoverColor: 0x333355,
        textColor: '#9999bb',
        onClick: () => {
          SceneTransition.wipeOut(this, 'MenuScene');
        },
      });
    }

    // Achievement unlock toasts
    newAchievements.forEach((achievement, i) => {
      this.time.delayedCall(2000 + i * 1200, () => {
        this.showAchievementToast(achievement.icon, achievement.name, achievement.description);
      });
    });

    // Mutation forecast for tomorrow (daily mode only)
    if (!isPractice) {
      const tomorrow = getTomorrowsMutation();
      if (tomorrow.name !== '') {
        const forecastText = this.add
          .text(cx, GAME_HEIGHT - 30, `Morgen: ${tomorrow.icon} ${tomorrow.name}`, {
            fontFamily: FONT_UI,
            fontSize: '9px',
            color: '#556688',
            letterSpacing: 1,
          })
          .setOrigin(0.5)
          .setAlpha(0);

        this.tweens.add({
          targets: forecastText,
          alpha: 1,
          delay: 1000,
          duration: 500,
        });
      }
    }

    // Countdown
    const countdownText = this.add
      .text(cx, GAME_HEIGHT - 14, '', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        color: '#6666aa',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    this.countdownTimer = this.time.addEvent({
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

  private showAchievementToast(icon: string, name: string, description: string): void {
    const cx = GAME_WIDTH / 2;
    const toastY = 80;

    // Background panel
    const bg = this.add.rectangle(cx, toastY, 280, 50, 0x2a2a4e, 0.95)
      .setStrokeStyle(2, 0xffdd00)
      .setDepth(200).setAlpha(0).setScale(0.8);

    // Icon + text
    const iconText = this.add.text(cx - 120, toastY, icon, {
      fontSize: '22px',
    }).setOrigin(0, 0.5).setDepth(201).setAlpha(0);

    const titleText = this.add.text(cx - 95, toastY - 10, name, {
      fontFamily: FONT_TITLE,
      fontSize: '13px',
      color: '#ffdd00',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(201).setAlpha(0);

    const descText = this.add.text(cx - 95, toastY + 8, description, {
      fontSize: '10px',
      color: '#8899bb',
    }).setOrigin(0, 0.5).setDepth(201).setAlpha(0);

    const elements = [bg, iconText, titleText, descText];

    // Slide in
    this.tweens.add({
      targets: elements,
      alpha: 1,
      duration: 300,
    });
    this.tweens.add({
      targets: bg,
      scaleX: 1, scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Flash border
    this.cameras.main.flash(200, 255, 220, 50);

    // Slide out after 2s
    this.tweens.add({
      targets: elements,
      alpha: 0,
      y: '-=20',
      delay: 2000,
      duration: 400,
      onComplete: () => elements.forEach((e) => e.destroy()),
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

  /** Distinct visual atmosphere for win vs lose. */
  private createAtmosphere(solved: boolean): void {
    const cx = GAME_WIDTH / 2;

    if (solved) {
      // Warm golden radial glow behind score area
      if (!this.textures.exists('result_glow')) {
        const size = 256;
        const gfx = this.make.graphics({ x: 0, y: 0 });
        for (let i = size / 2; i > 0; i--) {
          const alpha = 0.15 * (1 - (i / (size / 2)));
          gfx.fillStyle(0xffdd44, alpha);
          gfx.fillEllipse(size / 2, size / 2, i * 2, i * 1.5);
        }
        gfx.generateTexture('result_glow', size, size);
        gfx.destroy();
      }
      const glow = this.add.image(cx, 200, 'result_glow')
        .setDisplaySize(500, 300).setDepth(0).setAlpha(0.4);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0.5 },
        duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // Slow ambient floating particles
      if (!this.textures.exists('confetti_dot')) {
        const gfx = this.make.graphics({ x: 0, y: 0 });
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(3, 3, 3);
        gfx.generateTexture('confetti_dot', 6, 6);
        gfx.destroy();
      }
      this.add.particles(cx, GAME_HEIGHT + 10, 'confetti_dot', {
        x: { min: -cx, max: cx },
        speedY: { min: -15, max: -35 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 4000,
        frequency: 300,
        tint: [0xffdd44, 0xffaa22, 0xffffff],
      }).setDepth(0);
    } else {
      // Cool blue/grey muted atmosphere for failure
      this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1e, 0.3)
        .setDepth(0);

      // Subtle falling dust
      if (!this.textures.exists('confetti_dot')) {
        const gfx = this.make.graphics({ x: 0, y: 0 });
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(3, 3, 3);
        gfx.generateTexture('confetti_dot', 6, 6);
        gfx.destroy();
      }
      this.add.particles(cx, -10, 'confetti_dot', {
        x: { min: -cx, max: cx },
        speedY: { min: 8, max: 20 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.15, end: 0 },
        lifespan: 5000,
        frequency: 500,
        tint: [0x4455aa, 0x334466],
      }).setDepth(0);
    }
  }

  /** Fetch and display global daily stats (non-blocking). */
  private async loadGlobalStats(cx: number): Promise<void> {
    const [stats, heatmap, serverStreak, leaderboard] = await Promise.all([
      fetchDailyStats(), fetchHeatmap(), fetchStreak(), fetchLeaderboard(),
    ]);

    // Update streak from server (authoritative source)
    if (serverStreak && serverStreak.streak >= 0 && this.streakText) {
      const s = serverStreak.streak;
      this.streakText.setText(`Streak: ${s} ${s === 1 ? 'Tag' : 'Tage'}`);
      if (s === 0) {
        this.streakText.setAlpha(0.4);
      }
      // Sync server streak back to localStorage
      StorageManager.syncServerStreak(s);
    }
    if (!stats || stats.totalPlayers < 1) return;

    const y = 542;

    // Summary stats line
    const statsLine = `${stats.totalPlayers} Spieler heute  |  ${stats.solveRate}% geloest  |  \u00D8 ${stats.avgScore.toLocaleString('de-DE')} Pkt`;
    const statsText = this.add.text(cx, y, statsLine, {
      fontFamily: FONT_UI, fontSize: '9px', color: '#6688aa', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({ targets: statsText, alpha: 1, duration: 500 });

    // Percentile badge
    if (stats.percentile !== null) {
      const pctText = this.add.text(cx, y + 14,
        `Besser als ${stats.percentile}% der Spieler`, {
          fontSize: '11px', color: '#88aacc', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(50).setAlpha(0);

      this.tweens.add({ targets: pctText, alpha: 1, delay: 200, duration: 500 });
    }

    // Leaderboard + heatmap side by side below stats
    const vizY = y + 32;
    const hasLeaderboard = leaderboard && leaderboard.top10.length > 0;
    const hasHeatmap = heatmap && heatmap.topSpots.length > 0;

    if (hasLeaderboard && hasHeatmap) {
      this.drawLeaderboard(leaderboard, cx - 100, vizY);
      this.drawHeatmapGrid(heatmap, cx + 180, vizY + 10, 80, 50);
    } else if (hasLeaderboard) {
      this.drawLeaderboard(leaderboard, cx, vizY);
    } else if (hasHeatmap) {
      this.drawHeatmapGrid(heatmap, cx, vizY, 100, 60);
    }
  }

  /** Draw a compact leaderboard showing top scores + own rank. */
  private drawLeaderboard(data: LeaderboardData, cx: number, y: number): void {
    const width = 220;
    const rowH = 12;
    const rows = Math.min(data.top10.length, 10);
    const panelH = 18 + rows * rowH + (data.ownRank ? 18 : 0);

    const gfx = this.add.graphics().setDepth(50).setAlpha(0);

    // Background panel
    gfx.fillStyle(0x1a1a2e, 0.7);
    gfx.fillRoundedRect(cx - width / 2 - 6, y - 4, width + 12, panelH + 8, 4);

    // Title
    const title = this.add.text(cx, y + 4, 'TOP 10', {
      fontFamily: FONT_UI, fontSize: '8px', color: '#6688aa',
      letterSpacing: 2,
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    const entries: Phaser.GameObjects.Text[] = [];
    const startY = y + 18;

    data.top10.forEach((entry, i) => {
      const ey = startY + i * rowH;
      const rankStr = `${entry.rank}.`.padEnd(4);
      const scoreStr = entry.score.toLocaleString('de-DE').padStart(6);
      const solvedMark = entry.solved ? '\u2605' : '\u2606';
      const line = `${rankStr}${scoreStr} ${solvedMark}  ${entry.chainLength}x`;

      const color = entry.isYou ? '#ffdd44' : (i < 3 ? '#aaddaa' : '#8888aa');
      const text = this.add.text(cx - width / 2, ey, line, {
        fontFamily: FONT_UI, fontSize: '10px', color,
        fontStyle: entry.isYou ? 'bold' : 'normal',
      }).setDepth(50).setAlpha(0);

      if (entry.isYou) {
        // Highlight row for "you"
        gfx.fillStyle(0x4466aa, 0.15);
        gfx.fillRect(cx - width / 2, ey - 1, width, rowH);
      }

      entries.push(text);
    });

    // Own rank (if not in top 10)
    let ownRankText: Phaser.GameObjects.Text | undefined;
    if (data.ownRank && !data.top10.some(e => e.isYou)) {
      const ry = startY + rows * rowH + 4;
      gfx.lineStyle(1, 0x4466aa, 0.3);
      gfx.moveTo(cx - width / 2, ry - 2);
      gfx.lineTo(cx + width / 2, ry - 2);
      gfx.strokePath();

      const r = data.ownRank;
      const line = `${r.position}.`.padEnd(4) + `${r.score.toLocaleString('de-DE').padStart(6)}  (Platz ${r.position}/${r.total})`;
      ownRankText = this.add.text(cx - width / 2, ry, line, {
        fontFamily: FONT_UI, fontSize: '10px', color: '#ffdd44', fontStyle: 'bold',
      }).setDepth(50).setAlpha(0);
    }

    // Animate in
    const targets = [gfx, title, ...entries];
    if (ownRankText) targets.push(ownRankText);
    this.tweens.add({ targets, alpha: 1, delay: 500, duration: 600 });
  }

  /** Draw a compact score histogram bar chart. */
  private drawHistogram(stats: DailyStats, cx: number, y: number, width: number, height: number): void {
    const { histogram } = stats;
    if (!histogram || histogram.length === 0) return;

    const gfx = this.add.graphics().setDepth(50).setAlpha(0);
    const barCount = histogram.length;
    const barWidth = Math.floor((width - (barCount - 1) * 2) / barCount);
    const gap = 2;
    const startX = cx - width / 2;
    const maxCount = Math.max(...histogram.map(h => h.count), 1);

    // Background
    gfx.fillStyle(0x1a1a2e, 0.6);
    gfx.fillRoundedRect(startX - 6, y - 4, width + 12, height + 22, 4);

    // Bars
    histogram.forEach((bucket, i) => {
      const barHeight = Math.max(2, (bucket.count / maxCount) * height);
      const bx = startX + i * (barWidth + gap);
      const by = y + height - barHeight;

      // Color gradient: low=blue, high=green
      const ratio = bucket.count / maxCount;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        new Phaser.Display.Color(68, 102, 153),
        new Phaser.Display.Color(68, 170, 102),
        100,
        Math.round(ratio * 100),
      );
      gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 0.9);
      gfx.fillRect(bx, by, barWidth, barHeight);
    });

    // Label
    const label = this.add.text(cx, y + height + 8, 'Punkteverteilung', {
      fontFamily: FONT_UI, fontSize: '7px', color: '#556677', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({ targets: [gfx, label], alpha: 1, delay: 400, duration: 600 });
  }

  /** Draw a mini heatmap grid of placement positions. */
  private drawHeatmapGrid(heatmap: HeatmapData, cx: number, y: number, width: number, height: number): void {
    const gfx = this.add.graphics().setDepth(50).setAlpha(0);
    const startX = cx - width / 2;

    // Use full grid data if available, fall back to topSpots
    const grid = heatmap.grid;
    const gridCols = grid ? grid.width : 8;
    const gridRows = grid ? grid.height : 6;
    const cellW = width / gridCols;
    const cellH = height / gridRows;

    // Background
    gfx.fillStyle(0x1a1a2e, 0.6);
    gfx.fillRoundedRect(startX - 6, y - 4, width + 12, height + 22, 4);

    // Grid outline
    gfx.lineStyle(1, 0x334455, 0.4);
    gfx.strokeRect(startX, y, width, height);

    if (grid && grid.cells.length > 0) {
      // Full grid rendering — every cell with heat color
      const maxCount = Math.max(...grid.cells, 1);

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const count = grid.cells[row * gridCols + col];
          if (count === 0) continue;

          const intensity = count / maxCount;
          const alpha = 0.2 + intensity * 0.8;
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            new Phaser.Display.Color(255, 170, 50),
            new Phaser.Display.Color(255, 50, 50),
            100,
            Math.round(intensity * 100),
          );
          gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
          gfx.fillRect(startX + col * cellW, y + row * cellH, cellW, cellH);
        }
      }
    } else if (heatmap.topSpots && heatmap.topSpots.length > 0) {
      // Fallback: plot topSpots onto grid
      const maxPct = Math.max(...heatmap.topSpots.map(s => s.pct), 1);

      heatmap.topSpots.forEach(spot => {
        const col = Math.min(Math.floor(spot.x / (GAME_WIDTH / gridCols)), gridCols - 1);
        const row = Math.min(Math.floor(spot.y / (GAME_HEIGHT / gridRows)), gridRows - 1);
        const intensity = spot.pct / maxPct;
        const alpha = 0.3 + intensity * 0.7;
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          new Phaser.Display.Color(255, 170, 50),
          new Phaser.Display.Color(255, 50, 50),
          100,
          Math.round(intensity * 100),
        );
        gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
        gfx.fillRect(startX + col * cellW, y + row * cellH, cellW, cellH);
      });
    }

    // Label
    const label = this.add.text(cx, y + height + 8, 'Platzierungen', {
      fontFamily: FONT_UI, fontSize: '7px', color: '#556677', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({ targets: [gfx, label], alpha: 1, delay: 600, duration: 600 });
  }

  shutdown(): void {
    this.countdownTimer?.destroy();
    this.countdownTimer = undefined;
  }
}
