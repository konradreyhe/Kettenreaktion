import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { Button } from '../ui/Button';

/** Tutorial screen with visual step-by-step guide. */
export class HowToScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HowToScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.fadeIn(200, 26, 26, 46);

    // Title
    this.add
      .text(cx, 40, 'So funktioniert es', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Steps with icons
    const steps = [
      { icon: '\u{1F7E2}', text: 'Platziere EINE Kugel in der gruenen Zone', color: '#44ff44' },
      { icon: '\u{25B6}', text: 'Die Physik-Simulation startet automatisch', color: '#6688ff' },
      { icon: '\u{26D3}', text: 'Beobachte die Kettenreaktion!', color: '#ff8844' },
      { icon: '\u{2B50}', text: 'Triff die goldenen Sterne fuer Punkte', color: '#ffdd00' },
      { icon: '3x', text: 'Du hast 3 Versuche pro Tag', color: '#aaaacc' },
      { icon: '\u{1F4CB}', text: 'Teile dein Ergebnis mit Freunden', color: '#88cc88' },
    ];

    steps.forEach((step, i) => {
      const y = 95 + i * 52;

      // Step number circle
      this.add
        .circle(cx - 230, y, 16, 0x333366)
        .setStrokeStyle(1.5, 0x4466aa);

      this.add
        .text(cx - 230, y, step.icon, {
          fontSize: '14px',
          color: step.color,
        })
        .setOrigin(0.5);

      // Step text
      this.add
        .text(cx - 200, y, step.text, {
          fontSize: '14px',
          color: '#ccccee',
          wordWrap: { width: 450 },
        })
        .setOrigin(0, 0.5);
    });

    // Scoring section
    this.add
      .rectangle(cx, 420, 500, 1, 0x333366, 0.5);

    this.add
      .text(cx, 445, 'Punkte-System', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const scoring = [
      ['Sterne getroffen', 'x 100 Punkte'],
      ['Kettenlaenge', 'x 50 Punkte'],
      ['Gesparte Versuche', 'x 200 Bonus'],
      ['Schnelle Loesung', 'bis +300 Bonus'],
    ];

    scoring.forEach((row, i) => {
      const y = 478 + i * 22;
      this.add
        .text(cx - 150, y, row[0], { fontSize: '12px', color: '#9999bb' })
        .setOrigin(0, 0.5);
      this.add
        .text(cx + 150, y, row[1], { fontSize: '12px', color: '#ffdd44' })
        .setOrigin(1, 0.5);
    });

    // Back button
    new Button(this, {
      x: cx,
      y: GAME_HEIGHT - 40,
      text: 'Zurueck',
      width: 160,
      height: 38,
      fontSize: '14px',
      color: 0x2a2a44,
      hoverColor: 0x333355,
      textColor: '#9999bb',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });
  }
}
