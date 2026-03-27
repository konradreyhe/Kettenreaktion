import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { AudioManager } from '../systems/AudioManager';
import { Button } from '../ui/Button';

/** Start screen with play button, streak, and puzzle info. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.fadeIn(300, 26, 26, 46);
    this.createBackgroundParticles();

    // Title
    const title = this.add
      .text(cx, 95, 'KETTEN\nREAKTION', {
        fontSize: '42px', color: '#ffffff', fontStyle: 'bold',
        align: 'center', lineSpacing: 4,
      })
      .setOrigin(0.5).setScale(0).setDepth(10);

    this.tweens.add({
      targets: title, scaleX: 1, scaleY: 1,
      duration: 500, ease: 'Back.easeOut',
    });

    // Subtitle
    const subtitle = this.add
      .text(cx, 180, 'Taegliches Physik-Puzzle', {
        fontSize: '13px', color: '#6666aa',
      })
      .setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({ targets: subtitle, alpha: 1, delay: 300, duration: 500 });

    // Divider
    this.add.rectangle(cx, 200, 180, 1, 0x4444aa, 0.4).setDepth(10);

    // Puzzle number
    const puzzleNum = DailySystem.getPuzzleNumber();
    this.add
      .text(cx, 220, `Puzzle #${puzzleNum}`, {
        fontSize: '18px', color: '#aaaaff',
      })
      .setOrigin(0.5).setDepth(10);

    // Streak
    const streak = StorageManager.getStreak();
    if (streak > 0) {
      const streakText = this.add
        .text(cx, 250, `Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}`, {
          fontSize: '16px', color: '#ffaa44',
        })
        .setOrigin(0.5).setDepth(10);

      this.tweens.add({
        targets: streakText, scaleX: 1.05, scaleY: 1.05,
        duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Check if today's puzzle was already completed
    const todayResult = StorageManager.getPuzzleResult(puzzleNum);
    const isCompleted = todayResult?.completed === true;

    if (todayResult) {
      const resultText = todayResult.solved ? 'Geschafft!' : 'Versucht';
      const resultColor = todayResult.solved ? '#44bb44' : '#aa6644';
      this.add
        .text(cx, 275, `${resultText}  ${todayResult.score.toLocaleString('de-DE')} Pkt`, {
          fontSize: '13px', color: resultColor,
        })
        .setOrigin(0.5).setDepth(10);
    }

    if (isCompleted) {
      // Completed — show disabled play button + countdown emphasis
      new Button(this, {
        x: cx, y: 320, text: 'ABGESCHLOSSEN',
        width: 220, height: 52, fontSize: '16px',
        color: 0x222233, hoverColor: 0x222233,
        textColor: '#555577',
        onClick: () => {}, // no-op
      });
    } else {
      // Play button
      const hasResult = todayResult !== null;
      new Button(this, {
        x: cx, y: 320, text: hasResult ? 'WEITER SPIELEN' : 'SPIELEN',
        width: 220, height: 52, fontSize: hasResult ? '16px' : '20px',
        color: hasResult ? 0x2a3a55 : 0x3355aa,
        hoverColor: hasResult ? 0x334466 : 0x4466cc,
        onClick: () => {
          this.cameras.main.fadeOut(300, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
          });
        },
      });
    }

    // Secondary buttons row
    new Button(this, {
      x: cx - 100, y: 390, text: 'Uebung',
      width: 130, height: 36, fontSize: '13px',
      color: 0x2a3a44, hoverColor: 0x334455,
      textColor: '#88aacc',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PracticeScene');
        });
      },
    });

    new Button(this, {
      x: cx + 100, y: 390, text: 'Statistik',
      width: 130, height: 36, fontSize: '13px',
      color: 0x2a3a44, hoverColor: 0x334455,
      textColor: '#88aacc',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('StatsScene');
        });
      },
    });

    // How-To button
    new Button(this, {
      x: cx - 80, y: 435, text: 'Anleitung',
      width: 120, height: 32, fontSize: '12px',
      color: 0x222233, hoverColor: 0x2a2a44,
      textColor: '#777799',
      onClick: () => this.scene.start('HowToScene'),
    });

    // Yesterday's replay button (only if yesterday's puzzle has replay data)
    const yesterdayNum = puzzleNum - 1;
    const yesterdayResult = yesterdayNum > 0 ? StorageManager.getPuzzleResult(yesterdayNum) : null;
    if (yesterdayResult?.replay && yesterdayResult.replay.length > 0) {
      new Button(this, {
        x: cx + 80, y: 435, text: 'Gestern',
        width: 120, height: 32, fontSize: '12px',
        color: 0x222233, hoverColor: 0x2a2a44,
        textColor: '#777799',
        onClick: () => {
          this.cameras.main.fadeOut(200, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('ReplayScene', {
              puzzleNumber: yesterdayNum,
              result: yesterdayResult,
            });
          });
        },
      });
    }

    // Sound toggle
    let soundOn = true;
    const soundBtn = this.add
      .text(GAME_WIDTH - 20, 20, '\u{1F50A}', {
        fontSize: '20px', color: '#666688',
      })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);

    soundBtn.on('pointerdown', () => {
      soundOn = !soundOn;
      AudioManager.setEnabled(soundOn);
      soundBtn.setText(soundOn ? '\u{1F50A}' : '\u{1F507}');
    });

    // Stats
    const data = StorageManager.load();
    if (data.gamesPlayed > 0) {
      this.add
        .text(cx, 478, `Spiele: ${data.gamesPlayed}  |  Bester: ${data.bestScore.toLocaleString('de-DE')}`, {
          fontSize: '11px', color: '#555577',
        })
        .setOrigin(0.5).setDepth(10);
    }

    // Impressum link (German legal requirement)
    const impressumLink = this.add
      .text(GAME_WIDTH - 16, GAME_HEIGHT - 10, 'Impressum', {
        fontSize: '9px', color: '#333355',
      })
      .setOrigin(1, 1).setDepth(10)
      .setInteractive({ useHandCursor: true });

    impressumLink.on('pointerover', () => impressumLink.setColor('#5555aa'));
    impressumLink.on('pointerout', () => impressumLink.setColor('#333355'));
    impressumLink.on('pointerdown', () => this.showImpressum());

    // Countdown
    const countdownText = this.add
      .text(cx, GAME_HEIGHT - 30, '', {
        fontSize: '11px', color: '#444466',
      })
      .setOrigin(0.5).setDepth(10);

    this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        const ms = DailySystem.getTimeUntilReset();
        countdownText.setText(`Naechstes Puzzle: ${DailySystem.formatCountdown(ms)}`);
      },
    });
  }

  private showImpressum(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.92)
      .setDepth(200)
      .setInteractive();

    const title = this.add
      .text(cx, cy - 80, 'Impressum', {
        fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
      })
      .setOrigin(0.5).setDepth(201);

    const body = this.add
      .text(cx, cy, [
        'Angaben gemaess § 5 TMG',
        '',
        'Konrad Reyhe',
        'E-Mail: konrad@reyhe.de',
        '',
        'Haftungsausschluss:',
        'Dieses Spiel ist ein kostenloses Hobbyprojekt.',
        'Es werden keine personenbezogenen Daten erhoben.',
        'Alle Spielstaende werden lokal im Browser gespeichert.',
      ].join('\n'), {
        fontSize: '11px', color: '#8888aa', align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5).setDepth(201);

    const closeBtn = this.add
      .text(cx, cy + 100, 'Schliessen', {
        fontSize: '14px', color: '#6688cc',
      })
      .setOrigin(0.5).setDepth(201)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#88aaee'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#6688cc'));
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      title.destroy();
      body.destroy();
      closeBtn.destroy();
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
      lifespan: 4000, frequency: 200,
      tint: [0x4444aa, 0x6666cc, 0x3333aa],
    });
  }
}
