import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR } from '../constants/Style';
import { LevelLoader } from '../game/LevelLoader';
import { Button } from '../ui/Button';

/** Practice mode: browse and play any level freely. */
export class PracticeScene extends Phaser.Scene {
  private currentIndex = 0;
  private totalLevels = 0;
  private levelNameText!: Phaser.GameObjects.Text;
  private diffText!: Phaser.GameObjects.Text;
  private indexText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PracticeScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.totalLevels = LevelLoader.getTemplateCount();
    this.currentIndex = 0;

    this.cameras.main.fadeIn(200, 26, 26, 46);

    // Title
    this.add
      .text(cx, 40, 'UEBUNGSMODUS', {
        fontFamily: FONT_TITLE,
        fontSize: '20px', color: COLOR.textBright, fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 70, 'Spiele jedes Level ohne Tageslimit', {
        fontSize: '12px', color: '#666688',
      })
      .setOrigin(0.5);

    // Level preview card
    const card = this.add
      .rectangle(cx, 220, 400, 180, 0x222244)
      .setStrokeStyle(1, 0x444466);

    this.indexText = this.add
      .text(cx, 150, '', { fontSize: '13px', color: '#666688' })
      .setOrigin(0.5);

    this.levelNameText = this.add
      .text(cx, 200, '', {
        fontFamily: FONT_TITLE,
        fontSize: '20px', color: COLOR.textBright, fontStyle: 'bold',
        stroke: '#111122', strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.diffText = this.add
      .text(cx, 240, '', { fontSize: '20px', color: '#ffaa44' })
      .setOrigin(0.5);

    // Navigation arrows
    const leftBtn = this.add
      .text(cx - 160, 220, '\u25C0', { fontSize: '36px', color: '#6666aa' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leftBtn.on('pointerdown', () => {
      this.currentIndex = (this.currentIndex - 1 + this.totalLevels) % this.totalLevels;
      this.updatePreview();
    });
    leftBtn.on('pointerover', () => leftBtn.setColor('#8888cc'));
    leftBtn.on('pointerout', () => leftBtn.setColor('#6666aa'));

    const rightBtn = this.add
      .text(cx + 160, 220, '\u25B6', { fontSize: '36px', color: '#6666aa' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    rightBtn.on('pointerdown', () => {
      this.currentIndex = (this.currentIndex + 1) % this.totalLevels;
      this.updatePreview();
    });
    rightBtn.on('pointerover', () => rightBtn.setColor('#8888cc'));
    rightBtn.on('pointerout', () => rightBtn.setColor('#6666aa'));

    // Difficulty filter buttons
    this.add
      .text(cx, 310, 'Schwierigkeit:', { fontSize: '12px', color: '#777799' })
      .setOrigin(0.5);

    const difficulties = [1, 2, 3, 4, 5];
    difficulties.forEach((d, i) => {
      const bx = cx - 100 + i * 50;
      const btn = this.add
        .text(bx, 340, '\u2605'.repeat(d), {
          fontSize: '12px', color: '#888888',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.jumpToDifficulty(d);
      });
      btn.on('pointerover', () => btn.setColor('#ffaa44'));
      btn.on('pointerout', () => btn.setColor('#888888'));
    });

    // Play button
    new Button(this, {
      x: cx, y: 400, text: 'Level spielen',
      width: 200, height: 46, fontSize: '16px',
      color: 0x338833, hoverColor: 0x44aa44,
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { practiceIndex: this.currentIndex });
        });
      },
    });

    // Back button
    new Button(this, {
      x: cx, y: 460, text: 'Zurueck',
      width: 160, height: 36, fontSize: '13px',
      color: 0x2a2a44, hoverColor: 0x333355, textColor: '#9999bb',
      onClick: () => {
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.currentIndex = (this.currentIndex - 1 + this.totalLevels) % this.totalLevels;
      this.updatePreview();
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.currentIndex = (this.currentIndex + 1) % this.totalLevels;
      this.updatePreview();
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { practiceIndex: this.currentIndex });
    });

    this.updatePreview();
  }

  private updatePreview(): void {
    const level = LevelLoader.loadByIndex(this.currentIndex);
    this.levelNameText.setText(level.name);
    this.diffText.setText(
      '\u2605'.repeat(level.difficulty) + '\u2606'.repeat(5 - level.difficulty)
    );
    this.indexText.setText(
      `Level ${this.currentIndex + 1} / ${this.totalLevels}  |  ${level.theme}`
    );
  }

  private jumpToDifficulty(target: number): void {
    for (let i = 0; i < this.totalLevels; i++) {
      const idx = (this.currentIndex + i + 1) % this.totalLevels;
      const level = LevelLoader.loadByIndex(idx);
      if (level.difficulty === target) {
        this.currentIndex = idx;
        this.updatePreview();
        return;
      }
    }
  }
}
