import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR } from '../constants/Style';
import { StorageManager } from '../systems/StorageManager';
import { Button } from '../ui/Button';

/** Statistics screen with play history and achievements. */
export class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const data = StorageManager.load();

    this.cameras.main.fadeIn(200, 26, 26, 46);

    // Title
    this.add
      .text(cx, 35, 'STATISTIKEN', {
        fontFamily: FONT_TITLE,
        fontSize: '20px', color: COLOR.textBright, fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Computed stats
    const computed = StorageManager.getComputedStats();

    // Big stats
    const jokers = data.jokers ?? 0;
    const streakVal = `${data.streak} ${data.streak === 1 ? 'Tag' : 'Tage'}${jokers > 0 ? ` (\u{1F0CF}${jokers})` : ''}`;
    const stats = [
      { label: 'Spiele', value: `${data.gamesPlayed}`, color: '#aaaacc' },
      { label: 'Bester Score', value: `${data.bestScore.toLocaleString('de-DE')}`, color: '#ffdd44' },
      { label: 'Geloest', value: `${computed.totalSolved} (${computed.solveRate}%)`, color: '#88cc88' },
      { label: 'Streak', value: streakVal, color: '#ffaa44' },
    ];

    stats.forEach((s, i) => {
      const bx = 100 + (i % 2) * 300;
      const by = 90 + Math.floor(i / 2) * 70;

      this.add
        .text(bx, by, s.value, {
          fontFamily: FONT_TITLE,
          fontSize: '24px', color: s.color, fontStyle: 'bold',
          stroke: '#111122', strokeThickness: 3,
        })
        .setOrigin(0, 0.5);

      this.add
        .text(bx, by + 22, s.label, {
          fontFamily: FONT_UI,
          fontSize: '9px', color: COLOR.textDim,
          letterSpacing: 2,
        })
        .setOrigin(0, 0.5);
    });

    // Divider
    this.add.rectangle(cx, 220, 500, 1, 0x333366, 0.5);

    // Recent puzzle history
    this.add
      .text(cx, 245, 'LETZTE PUZZLE', {
        fontFamily: FONT_TITLE,
        fontSize: '12px', color: COLOR.textBright, fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 2,
      })
      .setOrigin(0.5);

    const puzzleNums = Object.keys(data.puzzleHistory)
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, 10);

    if (puzzleNums.length === 0) {
      this.add
        .text(cx, 300, 'Noch keine Puzzle gespielt', {
          fontSize: '13px', color: '#555577',
        })
        .setOrigin(0.5);
    } else {
      // Header
      this.add.text(80, 275, 'Puzzle', { fontSize: '11px', color: '#666688' });
      this.add.text(200, 275, 'Score', { fontSize: '11px', color: '#666688' });
      this.add.text(320, 275, 'Versuche', { fontSize: '11px', color: '#666688' });
      this.add.text(440, 275, 'Status', { fontSize: '11px', color: '#666688' });

      puzzleNums.forEach((num, i) => {
        const result = data.puzzleHistory[num];
        const y = 300 + i * 24;

        this.add.text(80, y, `#${num}`, { fontSize: '12px', color: '#aaaacc' });
        this.add.text(200, y, `${result.score.toLocaleString('de-DE')}`, {
          fontSize: '12px', color: '#ffdd44',
        });
        this.add.text(320, y, `${result.attempts}/3`, {
          fontSize: '12px', color: '#aaaacc',
        });
        this.add.text(440, y, result.solved ? '\u2705' : '\u274C', {
          fontSize: '12px', color: result.solved ? '#44ff44' : '#ff4444',
        });
      });
    }

    // Bottom stats row
    if (data.gamesPlayed > 0) {
      const bottomStats = [
        `Durchschnitt: ${computed.avgScore.toLocaleString('de-DE')}`,
        `Gesamt: ${data.totalScore.toLocaleString('de-DE')}`,
        `Rekord-Streak: ${computed.bestStreak}`,
      ].join('  |  ');

      this.add
        .text(cx, GAME_HEIGHT - 100, bottomStats, {
          fontFamily: FONT_UI,
          fontSize: '9px', color: COLOR.textDim,
        })
        .setOrigin(0.5);
    }

    // Back button
    new Button(this, {
      x: cx, y: GAME_HEIGHT - 45, text: 'Zurueck',
      width: 160, height: 36, fontSize: '13px',
      color: 0x2a2a44, hoverColor: 0x333355, textColor: '#9999bb',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });
  }
}
