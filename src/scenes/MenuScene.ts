import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
import { DailySystem } from '../systems/DailySystem';
import { StorageManager } from '../systems/StorageManager';
import { AudioManager } from '../systems/AudioManager';
import { MusicEngine } from '../systems/MusicEngine';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { EventManager } from '../systems/EventManager';
import { Button } from '../ui/Button';

/** Start screen with play button, streak, and puzzle info. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Handle URL parameters (challenge, PWA shortcuts)
    const params = new URLSearchParams(window.location.search);
    window.history.replaceState({}, '', window.location.pathname);

    const challengeParam = params.get('challenge');
    if (challengeParam !== null) {
      const levelIndex = parseInt(challengeParam, 10);
      if (!isNaN(levelIndex) && levelIndex >= 0) {
        this.scene.start('GameScene', { practiceIndex: levelIndex });
        return;
      }
    }
    if (params.get('play') === 'today') {
      this.scene.start('GameScene');
      return;
    }
    if (params.get('mode') === 'zen') {
      this.scene.start('ZenScene');
      return;
    }
    if (params.has('editor')) {
      this.scene.start('EditorScene');
      return;
    }

    this.cameras.main.fadeIn(300, 26, 26, 46);
    this.createBackgroundParticles();

    // Title
    const title = this.add
      .text(cx, 95, 'KETTEN\nREAKTION', {
        fontFamily: FONT_TITLE,
        fontSize: '36px', color: COLOR.textBright, fontStyle: 'bold',
        align: 'center', lineSpacing: 8,
        stroke: '#1a1a3e',
        strokeThickness: 4,
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5).setScale(0).setDepth(10);

    this.tweens.add({
      targets: title, scaleX: 1, scaleY: 1,
      duration: 600, ease: 'Back.easeOut',
    });

    // Subtitle
    const subtitle = this.add
      .text(cx, 185, 'Taegliches Physik-Puzzle', {
        fontFamily: FONT_UI,
        fontSize: '11px', color: COLOR.textMuted,
        letterSpacing: 3,
      })
      .setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({ targets: subtitle, alpha: 1, delay: 300, duration: 500 });

    // Monthly event banner
    const event = EventManager.getCurrentEvent();
    if (event) {
      this.cameras.main.setBackgroundColor(event.theme.bgColor);
      const banner = this.add
        .text(cx, 170, event.theme.bannerText, {
          fontFamily: FONT_UI, fontSize: '10px',
          color: event.theme.accentColor,
          letterSpacing: 2,
        })
        .setOrigin(0.5).setAlpha(0).setDepth(10);
      this.tweens.add({ targets: banner, alpha: 0.8, delay: 500, duration: 600 });
    }

    // Divider
    this.add.rectangle(cx, 200, 180, 1, 0x4444aa, 0.4).setDepth(10);

    // Puzzle number
    const puzzleNum = DailySystem.getPuzzleNumber();
    this.add
      .text(cx, 220, `Puzzle #${puzzleNum}`, {
        fontFamily: FONT_UI,
        fontSize: '16px', color: COLOR.primaryBright,
        stroke: '#111133',
        strokeThickness: 2,
      })
      .setOrigin(0.5).setDepth(10);

    // Day-of-week mode label
    const utcDay = new Date().getUTCDay();
    const dayLabels: Record<number, string> = {
      0: '\u{1F525} Sonntagschallenge',
      1: '\u{1F7E2} Montag: Leicht',
      5: '\u{1F504} Flip Friday!',
    };
    const dayLabel = dayLabels[utcDay];
    let infoY = 240;
    if (dayLabel) {
      this.add
        .text(cx, infoY, dayLabel, {
          fontFamily: FONT_UI,
          fontSize: '10px', color: utcDay === 5 ? '#88aaff' : utcDay === 0 ? '#ff6644' : '#66bb66',
          stroke: '#111122', strokeThickness: 1,
        })
        .setOrigin(0.5).setDepth(10);
      infoY += 18;
    }

    // Today's difficulty stars
    const [minDiff, maxDiff] = DailySystem.getDailyDifficultyRange();
    const avgDiff = Math.round((minDiff + maxDiff) / 2);
    const diffStars = '\u2605'.repeat(avgDiff) + '\u2606'.repeat(5 - avgDiff);
    this.add
      .text(cx, infoY, diffStars, {
        fontSize: '12px', color: '#ffaa44',
      })
      .setOrigin(0.5).setDepth(10);
    infoY += 20;

    // Streak
    const streak = StorageManager.getStreak();
    if (streak > 0) {
      const jokers = StorageManager.getJokers();
      const jokerLabel = jokers > 0 ? ` (+${jokers} Joker)` : '';
      const streakText = this.add
        .text(cx, infoY, `Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}${jokerLabel}`, {
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
      const resultColor = todayResult.solved
        ? (AccessibilityManager.isColorblind() ? '#6699cc' : '#44bb44')
        : '#aa6644';
      this.add
        .text(cx, 285, `${resultText}  ${todayResult.score.toLocaleString('de-DE')} Pkt`, {
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
      // Play button with glow pulse
      const hasResult = todayResult !== null;
      const playColor = hasResult ? 0x2a3a55 : 0x3355aa;

      // Glow behind play button
      const glow = this.add
        .rectangle(cx, 320, 240, 62, 0x4488ff, 0)
        .setDepth(9);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0, to: 0.15 },
        scaleX: { from: 1, to: 1.08 },
        scaleY: { from: 1, to: 1.12 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      new Button(this, {
        x: cx, y: 320, text: hasResult ? 'WEITER SPIELEN' : 'SPIELEN',
        width: 220, height: 52, fontSize: hasResult ? '16px' : '20px',
        color: playColor,
        hoverColor: hasResult ? 0x334466 : 0x4466cc,
        onClick: () => {
          this.cameras.main.fadeOut(300, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
          });
        },
      });
    }

    // Secondary buttons — four in a row
    new Button(this, {
      x: cx - 150, y: 390, text: 'Uebung',
      width: 90, height: 36, fontSize: '12px',
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
      x: cx - 50, y: 390, text: 'Anleitung',
      width: 90, height: 36, fontSize: '12px',
      color: 0x2a3a44, hoverColor: 0x334455,
      textColor: '#88aacc',
      onClick: () => this.scene.start('HowToScene'),
    });

    new Button(this, {
      x: cx + 50, y: 390, text: 'Zen',
      width: 90, height: 36, fontSize: '12px',
      color: 0x2a3a44, hoverColor: 0x334455,
      textColor: '#88aacc',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ZenScene');
        });
      },
    });

    new Button(this, {
      x: cx + 150, y: 390, text: 'Statistik',
      width: 115, height: 36, fontSize: '13px',
      color: 0x2a3a44, hoverColor: 0x334455,
      textColor: '#88aacc',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('StatsScene');
        });
      },
    });

    // Ctrl+Shift+E shortcut to open editor (hidden feature)
    this.input.keyboard?.on('keydown-E', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('EditorScene');
        });
      }
    });

    // Yesterday's replay button (only if yesterday's puzzle has replay data)
    const yesterdayNum = puzzleNum - 1;
    const yesterdayResult = yesterdayNum > 0 ? StorageManager.getPuzzleResult(yesterdayNum) : null;
    if (yesterdayResult?.replay && yesterdayResult.replay.length > 0) {
      new Button(this, {
        x: cx, y: 435, text: 'Gestern ansehen',
        width: 150, height: 30, fontSize: '11px',
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
      MusicEngine.setEnabled(soundOn);
      soundBtn.setText(soundOn ? '\u{1F50A}' : '\u{1F507}');
    });

    // Colorblind toggle
    const cbOn = AccessibilityManager.isColorblind();
    const cbBtn = this.add
      .text(GAME_WIDTH - 50, 20, '\u{1F441}', {
        fontSize: '20px', color: cbOn ? '#4488ff' : '#666688',
      })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);

    cbBtn.on('pointerdown', () => {
      const enabled = AccessibilityManager.toggle();
      cbBtn.setColor(enabled ? '#4488ff' : '#666688');
    });

    // Player title
    const data = StorageManager.load();
    if (data.gamesPlayed >= 5) {
      const title = StorageManager.getTitle();
      this.add
        .text(cx, 500, `\u{1F3C6} ${title}`, {
          fontFamily: FONT_UI,
          fontSize: '10px', color: COLOR.secondary,
          stroke: '#111122', strokeThickness: 1,
        })
        .setOrigin(0.5).setDepth(10);
    }

    // Stats
    if (data.gamesPlayed > 0) {
      this.add
        .text(cx, 478, `Spiele: ${data.gamesPlayed}  |  Bester: ${data.bestScore.toLocaleString('de-DE')}`, {
          fontSize: '11px', color: '#555577',
        })
        .setOrigin(0.5).setDepth(10);
    }

    // Legal links (German requirements)
    const impressumLink = this.add
      .text(GAME_WIDTH - 16, GAME_HEIGHT - 10, 'Impressum', {
        fontSize: '9px', color: '#333355',
      })
      .setOrigin(1, 1).setDepth(10)
      .setInteractive({ useHandCursor: true });

    impressumLink.on('pointerover', () => impressumLink.setColor('#5555aa'));
    impressumLink.on('pointerout', () => impressumLink.setColor('#333355'));
    impressumLink.on('pointerdown', () => this.showImpressum());

    const datenschutzLink = this.add
      .text(GAME_WIDTH - 75, GAME_HEIGHT - 10, 'Datenschutz', {
        fontSize: '9px', color: '#333355',
      })
      .setOrigin(1, 1).setDepth(10)
      .setInteractive({ useHandCursor: true });

    datenschutzLink.on('pointerover', () => datenschutzLink.setColor('#5555aa'));
    datenschutzLink.on('pointerout', () => datenschutzLink.setColor('#333355'));
    datenschutzLink.on('pointerdown', () => this.showDatenschutz());

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

  private showDatenschutz(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.92)
      .setDepth(200)
      .setInteractive();

    const title = this.add
      .text(cx, cy - 100, 'Datenschutzerklaerung', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      })
      .setOrigin(0.5).setDepth(201);

    const body = this.add
      .text(cx, cy, [
        'Diese Website erhebt keine personenbezogenen Daten.',
        '',
        'Spielstaende und Einstellungen werden ausschliesslich',
        'lokal in deinem Browser (localStorage) gespeichert.',
        '',
        'Es werden keine Cookies gesetzt.',
        'Es werden keine Analyse-Tools verwendet.',
        'Es werden keine Daten an Dritte uebermittelt.',
        '',
        'Der Quellcode ist offen einsehbar auf GitHub.',
      ].join('\n'), {
        fontSize: '11px', color: '#8888aa', align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5).setDepth(201);

    const closeBtn = this.add
      .text(cx, cy + 120, 'Schliessen', {
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
