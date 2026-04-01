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
import { SceneTransition } from '../game/SceneTransition';

/** Start screen with play button, streak, and puzzle info. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  /** Parse ghost placement from URL param (e.g., "ball,125,175"). */
  private static parseGhostParam(param: string | null): { type: string; x: number; y: number } | undefined {
    if (!param) return undefined;
    const parts = param.split(',');
    if (parts.length !== 3) return undefined;
    const x = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (isNaN(x) || isNaN(y)) return undefined;
    return { type: parts[0], x, y };
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Handle URL parameters (challenge, PWA shortcuts)
    const params = new URLSearchParams(window.location.search);
    window.history.replaceState({}, '', window.location.pathname);

    // Parse ghost placement from shared URL (?p=ball,125,175)
    const ghostPlacement = MenuScene.parseGhostParam(params.get('p'));

    const challengeParam = params.get('challenge');
    if (challengeParam !== null) {
      const levelIndex = parseInt(challengeParam, 10);
      if (!isNaN(levelIndex) && levelIndex >= 0) {
        const challengeScore = parseInt(params.get('score') ?? '', 10) || undefined;
        this.scene.start('GameScene', { practiceIndex: levelIndex, challengeScore, ghostPlacement });
        return;
      }
    }
    if (params.get('play') === 'today') {
      this.scene.start('GameScene', { ghostPlacement });
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

    SceneTransition.wipeIn(this);
    this.createBackgroundParticles();

    // Start ambient audio atmosphere
    AudioManager.startMenuAmbient();

    // Title glow accent — radial gradient for soft halo
    if (!this.textures.exists('title_glow')) {
      const size = 256;
      const gfx = this.make.graphics({ x: 0, y: 0 });
      for (let i = size / 2; i > 0; i--) {
        const alpha = 0.25 * (1 - (i / (size / 2)));
        gfx.fillStyle(0x3366cc, alpha);
        gfx.fillEllipse(size / 2, size / 2, i * 2, i * 1.2);
      }
      gfx.generateTexture('title_glow', size, size);
      gfx.destroy();
    }
    const titleGlow = this.add.image(cx, 115, 'title_glow')
      .setDisplaySize(500, 220).setDepth(5).setAlpha(0.6);
    this.tweens.add({
      targets: titleGlow,
      alpha: { from: 0.5, to: 0.7 },
      duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

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
        fontSize: '18px', color: '#ffaa44',
        stroke: '#553300', strokeThickness: 2,
        letterSpacing: 4,
      })
      .setOrigin(0.5).setDepth(10);
    infoY += 26;

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
      const playColor = hasResult ? 0x2a3a55 : 0x3366bb;

      // Glow behind play button
      const glow = this.add
        .rectangle(cx, 320, 240, 62, 0x4488ff, 0)
        .setDepth(9);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.05, to: 0.25 },
        scaleX: { from: 1, to: 1.1 },
        scaleY: { from: 1, to: 1.15 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      new Button(this, {
        x: cx, y: 320, text: hasResult ? 'WEITER SPIELEN' : 'SPIELEN',
        width: 220, height: 52, fontSize: hasResult ? '16px' : '20px',
        color: playColor,
        hoverColor: hasResult ? 0x334466 : 0x4477dd,
        onClick: () => {
          SceneTransition.wipeOut(this, 'GameScene', ghostPlacement ? { ghostPlacement } : undefined);
        },
      });
    }

    // Decorative divider above secondary buttons
    const divGfx = this.add.graphics().setDepth(10);
    divGfx.fillStyle(0x4466aa, 0.3);
    divGfx.fillRect(cx - 170, 362, 340, 1);
    divGfx.fillStyle(0x4466aa, 0.15);
    divGfx.fillRect(cx - 130, 363, 260, 1);

    // Secondary buttons — four evenly spaced, each with distinct accent, staggered entrance
    new Button(this, {
      x: cx - 160, y: 390, text: '\u{1F3AF} Uebung',
      width: 100, height: 36, fontSize: '12px',
      color: 0x3a3020, hoverColor: 0x4a4030,
      textColor: '#ccaa66',
      delay: 300,
      onClick: () => {
        SceneTransition.wipeOut(this, 'PracticeScene');
      },
    });

    new Button(this, {
      x: cx - 55, y: 390, text: '\u{2753} Anleitung',
      width: 100, height: 36, fontSize: '12px',
      color: 0x203a30, hoverColor: 0x304a40,
      textColor: '#66ccaa',
      delay: 400,
      onClick: () => this.scene.start('HowToScene'),
    });

    new Button(this, {
      x: cx + 55, y: 390, text: '\u{262F} Zen',
      width: 100, height: 36, fontSize: '12px',
      color: 0x302040, hoverColor: 0x403050,
      textColor: '#aa88cc',
      delay: 500,
      onClick: () => {
        SceneTransition.wipeOut(this, 'ZenScene');
      },
    });

    new Button(this, {
      x: cx + 160, y: 390, text: '\u{1F4CA} Statistik',
      width: 100, height: 36, fontSize: '12px',
      color: 0x203040, hoverColor: 0x304050,
      textColor: '#6699cc',
      delay: 600,
      onClick: () => {
        SceneTransition.wipeOut(this, 'StatsScene');
      },
    });

    // Ctrl+Shift+E shortcut to open editor (hidden feature)
    this.input.keyboard?.on('keydown-E', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        SceneTransition.wipeOut(this, 'EditorScene');
      }
    });

    // First-time player: highlight tutorial
    if (StorageManager.load().gamesPlayed === 0) {
      const hint = this.add.text(cx, 430,
        'Erstes Mal hier? Probiere die Anleitung!', {
          fontSize: '11px', color: '#88aacc',
        }).setOrigin(0.5).setDepth(10).setAlpha(0);

      this.tweens.add({
        targets: hint, alpha: 1, delay: 1200, duration: 800,
      });

      // Pulse the Anleitung button area
      const pulse = this.add.rectangle(cx - 55, 390, 104, 40, 0x88ccff, 0)
        .setDepth(8);
      this.tweens.add({
        targets: pulse,
        alpha: { from: 0, to: 0.15 },
        duration: 1000, yoyo: true, repeat: 3, delay: 1500,
      });
    }

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
          SceneTransition.wipeOut(this, 'ReplayScene', {
              puzzleNumber: yesterdayNum,
              result: yesterdayResult,
            });
        },
      });
    }

    // Sound toggle
    let soundOn = AudioManager.isEnabled();
    const soundBtn = this.add
      .text(GAME_WIDTH - 20, 20, soundOn ? '\u{1F50A}' : '\u{1F507}', {
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
          fontFamily: FONT_UI, fontSize: '10px', color: '#6666aa', letterSpacing: 1,
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

    this.add.text(GAME_WIDTH - 67, GAME_HEIGHT - 10, '|', {
      fontSize: '9px', color: '#222244',
    }).setOrigin(0.5, 1).setDepth(10);

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
        fontFamily: FONT_UI,
        fontSize: '12px', color: '#6666aa',
        letterSpacing: 1,
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

    const panel = this.add
      .rectangle(cx, cy, 380, 260, 0x151530, 0.95)
      .setStrokeStyle(1, 0x334466, 0.5)
      .setDepth(200);

    const title = this.add
      .text(cx, cy - 80, 'Impressum', {
        fontFamily: FONT_TITLE,
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 2,
      })
      .setOrigin(0.5).setDepth(201);

    const body = this.add
      .text(cx, cy, [
        'Angaben gemaess \u00A7 5 TMG',
        '',
        'Konrad Reyhe',
        'E-Mail: konrad@reyhe.de',
        '',
        'Haftungsausschluss:',
        'Dieses Spiel ist ein kostenloses Hobbyprojekt.',
        'Es werden keine personenbezogenen Daten erhoben.',
        'Alle Spielstaende werden lokal im Browser gespeichert.',
      ].join('\n'), {
        fontFamily: FONT_UI,
        fontSize: '10px', color: '#8888aa', align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5).setDepth(201);

    const closeBtn = this.add
      .text(cx, cy + 100, 'Schliessen', {
        fontFamily: FONT_UI,
        fontSize: '13px', color: '#6688cc',
      })
      .setOrigin(0.5).setDepth(201)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#88aaee'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#6688cc'));
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
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

    const panel = this.add
      .rectangle(cx, cy, 400, 300, 0x151530, 0.95)
      .setStrokeStyle(1, 0x334466, 0.5)
      .setDepth(200);

    const title = this.add
      .text(cx, cy - 100, 'Datenschutzerklaerung', {
        fontFamily: FONT_TITLE,
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 2,
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
        fontFamily: FONT_UI,
        fontSize: '10px', color: '#8888aa', align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5).setDepth(201);

    const closeBtn = this.add
      .text(cx, cy + 120, 'Schliessen', {
        fontFamily: FONT_UI,
        fontSize: '13px', color: '#6688cc',
      })
      .setOrigin(0.5).setDepth(201)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#88aaee'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#6688cc'));
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
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
      scale: { min: 0.3, max: 0.8 },
      alpha: { min: 0.08, max: 0.25 },
      lifespan: 5000, frequency: 150,
      tint: [0x4466cc, 0x6688dd, 0x3355bb, 0x5577cc],
    });
  }

  shutdown(): void {
    AudioManager.stopMenuAmbient();
  }
}
