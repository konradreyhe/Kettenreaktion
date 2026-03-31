import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR } from '../constants/Style';
import { LevelLoader } from '../game/LevelLoader';
import { StorageManager } from '../systems/StorageManager';
import { Button } from '../ui/Button';
import { SceneTransition } from '../game/SceneTransition';

/** Practice mode: browse and play any level freely with difficulty filter. */
export class PracticeScene extends Phaser.Scene {
  private currentIndex = 0;
  private totalLevels = 0;
  private levelNameText!: Phaser.GameObjects.Text;
  private diffText!: Phaser.GameObjects.Text;
  private indexText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private constraintText!: Phaser.GameObjects.Text;
  private cardBorder!: Phaser.GameObjects.Rectangle;
  private filterBtns: Phaser.GameObjects.Text[] = [];
  private activeFilter: number | null = null;
  private filteredIndices: number[] = [];

  constructor() {
    super({ key: 'PracticeScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.totalLevels = LevelLoader.getTemplateCount();
    this.currentIndex = 0;
    this.activeFilter = null;
    this.filteredIndices = Array.from({ length: this.totalLevels }, (_, i) => i);

    SceneTransition.wipeIn(this);

    // Title
    this.add.text(cx, 40, 'UEBUNGSMODUS', {
      fontFamily: FONT_TITLE,
      fontSize: '20px', color: COLOR.textBright, fontStyle: 'bold',
      stroke: '#111122', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, 70, 'Spiele jedes Level ohne Tageslimit', {
      fontSize: '12px', color: '#666688',
    }).setOrigin(0.5);

    // Level preview card
    this.add.rectangle(cx, 220, 400, 200, 0x222244);
    this.cardBorder = this.add.rectangle(cx, 220, 400, 200)
      .setFillStyle(0x000000, 0).setStrokeStyle(1, 0x444466);

    this.indexText = this.add.text(cx, 145, '', {
      fontSize: '13px', color: '#666688',
    }).setOrigin(0.5);

    this.levelNameText = this.add.text(cx, 195, '', {
      fontFamily: FONT_TITLE,
      fontSize: '20px', color: COLOR.textBright, fontStyle: 'bold',
      stroke: '#111122', strokeThickness: 2,
    }).setOrigin(0.5);

    this.diffText = this.add.text(cx, 230, '', {
      fontSize: '20px', color: '#ffaa44',
    }).setOrigin(0.5);

    this.bestScoreText = this.add.text(cx, 260, '', {
      fontSize: '12px', color: '#88cc88',
    }).setOrigin(0.5);

    this.constraintText = this.add.text(cx, 280, '', {
      fontSize: '10px', color: '#8888cc',
    }).setOrigin(0.5);

    // Navigation arrows
    const leftBtn = this.add.text(cx - 170, 210, '\u25C0', {
      fontSize: '36px', color: '#6666aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leftBtn.on('pointerdown', () => this.navigate(-1));
    leftBtn.on('pointerover', () => leftBtn.setColor('#8888cc'));
    leftBtn.on('pointerout', () => leftBtn.setColor('#6666aa'));

    const rightBtn = this.add.text(cx + 170, 210, '\u25B6', {
      fontSize: '36px', color: '#6666aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    rightBtn.on('pointerdown', () => this.navigate(1));
    rightBtn.on('pointerover', () => rightBtn.setColor('#8888cc'));
    rightBtn.on('pointerout', () => rightBtn.setColor('#6666aa'));

    // Difficulty filter buttons
    this.add.text(cx - 155, 340, 'Filter:', {
      fontSize: '11px', color: '#777799',
    }).setOrigin(0, 0.5);

    // "All" button
    const allBtn = this.add.text(cx - 110, 340, 'Alle', {
      fontSize: '12px', color: '#ffaa44',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    allBtn.on('pointerdown', () => {
      this.applyFilter(null);
      this.updateFilterVisuals(allBtn);
    });

    this.filterBtns = [allBtn];

    const difficulties = [1, 2, 3, 4, 5];
    difficulties.forEach((d, i) => {
      const bx = cx - 50 + i * 55;
      const btn = this.add.text(bx, 340, '\u2605'.repeat(d), {
        fontSize: '12px', color: '#666688',
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.applyFilter(d);
        this.updateFilterVisuals(btn);
      });
      btn.on('pointerover', () => { if (this.activeFilter !== d) btn.setColor('#aaaacc'); });
      btn.on('pointerout', () => { if (this.activeFilter !== d) btn.setColor('#666688'); });

      this.filterBtns.push(btn);
    });

    // Play button
    new Button(this, {
      x: cx, y: 400, text: 'Level spielen',
      width: 200, height: 46, fontSize: '16px',
      color: 0x338833, hoverColor: 0x44aa44,
      onClick: () => {
        SceneTransition.wipeOut(this, 'GameScene', { practiceIndex: this.currentIndex });
      },
    });

    // Back button
    new Button(this, {
      x: cx, y: 460, text: 'Zurueck',
      width: 160, height: 36, fontSize: '13px',
      color: 0x2a2a44, hoverColor: 0x333355, textColor: '#9999bb',
      onClick: () => {
        SceneTransition.wipeOut(this, 'MenuScene');
      },
    });

    // Practice stats summary
    const practiceScores = StorageManager.load().practiceScores ?? {};
    const played = Object.keys(practiceScores).length;
    const solved = Object.values(practiceScores).filter(s => s.solved).length;
    if (played > 0) {
      this.add.text(cx, 500, `Geuebt: ${played}/${this.totalLevels}  |  Geloest: ${solved}`, {
        fontFamily: FONT_UI, fontSize: '10px', color: '#6666aa', letterSpacing: 1,
      }).setOrigin(0.5);
    }

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.navigate(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.navigate(1));
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { practiceIndex: this.currentIndex });
    });

    this.updatePreview();
  }

  private navigate(dir: number): void {
    // Find current position in filtered list
    const currentFilterIdx = this.filteredIndices.indexOf(this.currentIndex);
    const nextFilterIdx = (currentFilterIdx + dir + this.filteredIndices.length) % this.filteredIndices.length;
    this.currentIndex = this.filteredIndices[nextFilterIdx];
    this.updatePreview();
  }

  private applyFilter(difficulty: number | null): void {
    this.activeFilter = difficulty;
    if (difficulty === null) {
      this.filteredIndices = Array.from({ length: this.totalLevels }, (_, i) => i);
    } else {
      this.filteredIndices = [];
      for (let i = 0; i < this.totalLevels; i++) {
        const level = LevelLoader.loadByIndex(i);
        if (level.difficulty === difficulty) {
          this.filteredIndices.push(i);
        }
      }
    }

    if (this.filteredIndices.length > 0) {
      this.currentIndex = this.filteredIndices[0];
      this.updatePreview();
    }
  }

  private updateFilterVisuals(activeBtn: Phaser.GameObjects.Text): void {
    this.filterBtns.forEach(btn => {
      btn.setColor(btn === activeBtn ? '#ffaa44' : '#666688');
    });
  }

  private static readonly DIFF_COLORS: Record<number, number> = {
    1: 0x44aa66, 2: 0x66aa44, 3: 0xaaaa44, 4: 0xcc7733, 5: 0xcc4444,
  };

  private updatePreview(): void {
    const level = LevelLoader.loadByIndex(this.currentIndex);
    this.levelNameText.setText(level.name);
    this.diffText.setText(
      '\u2605'.repeat(level.difficulty) + '\u2606'.repeat(5 - level.difficulty)
    );

    // Tint card border by difficulty
    const borderColor = PracticeScene.DIFF_COLORS[level.difficulty] ?? 0x444466;
    this.cardBorder.setStrokeStyle(1, borderColor, 0.5);

    const filterInfo = this.activeFilter !== null
      ? `${this.filteredIndices.indexOf(this.currentIndex) + 1}/${this.filteredIndices.length}`
      : `${this.currentIndex + 1}/${this.totalLevels}`;
    this.indexText.setText(`Level ${filterInfo}  |  ${level.theme}`);

    // Show constraint type if level has constraints
    if (level.constraints && level.constraints.length > 0) {
      const types = [...new Set(level.constraints.map(c => c.type))];
      const typeLabels: Record<string, string> = {
        seesaw: 'Wippe', spring: 'Feder', rope: 'Seil',
      };
      this.constraintText.setText(types.map(t => typeLabels[t] ?? t).join(' + '));
    } else {
      this.constraintText.setText('');
    }

    // Show best practice score
    const practiceScores = StorageManager.load().practiceScores ?? {};
    const best = practiceScores[level.id];
    if (best) {
      const status = best.solved ? '\u2705' : '\u274C';
      this.bestScoreText.setText(`Bester: ${best.score.toLocaleString('de-DE')}  ${status}`);
      this.bestScoreText.setColor(best.solved ? '#88cc88' : '#cc8844');
    } else {
      this.bestScoreText.setText('Noch nicht geuebt');
      this.bestScoreText.setColor('#555577');
    }
  }
}
