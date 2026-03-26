import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/Game';

/** Simple tutorial screen explaining the game. */
export class HowToScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HowToScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 60, 'So funktioniert es', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const steps = [
      '1. Platziere EINE Kugel in der markierten Zone',
      '2. Die Physik-Simulation startet automatisch',
      '3. Beobachte die Kettenreaktion!',
      '4. Triff die Sterne fuer Punkte',
      '5. Du hast 3 Versuche pro Tag',
      '6. Teile dein Ergebnis mit Freunden',
    ];

    steps.forEach((step, i) => {
      this.add
        .text(cx, 130 + i * 45, step, {
          fontSize: '14px',
          color: '#ccccee',
          wordWrap: { width: 600 },
        })
        .setOrigin(0.5);
    });

    // Scoring info
    this.add
      .text(cx, 420, 'Punkte: Sterne x100 + Kette x50 + Effizienz + Zeit', {
        fontSize: '12px',
        color: '#8888aa',
      })
      .setOrigin(0.5);

    // Back button
    const backBtn = this.add
      .rectangle(cx, 500, 160, 40, 0x333355)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x555577);

    this.add
      .text(cx, 500, 'Zurueck', {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
