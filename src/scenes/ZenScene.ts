import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR } from '../constants/Style';
import { BODY_PROPERTIES } from '../constants/Physics';
import { TrailRenderer } from '../game/TrailRenderer';
import { PhysicsManager } from '../game/PhysicsManager';
import { MusicEngine } from '../systems/MusicEngine';
import { AudioManager } from '../systems/AudioManager';
import { Button } from '../ui/Button';
import type { ObjectType } from '../types/Level';

/** Zen Mode — no goals, infinite placement, persistent trails, ambient music. */
export class ZenScene extends Phaser.Scene {
  private trailRenderer!: TrailRenderer;
  private music = new MusicEngine();
  private selectedType: ObjectType = 'ball';
  private objectCount = 0;
  private selectorButtons: Phaser.GameObjects.Container[] = [];
  private countText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ZenScene' });
  }

  create(): void {
    this.objectCount = 0;
    this.trailRenderer = new TrailRenderer(this);

    this.cameras.main.fadeIn(300, 26, 26, 46);

    // Floor + walls via PhysicsManager
    new PhysicsManager(this).buildMinimalWorld(GAME_WIDTH, GAME_HEIGHT);

    // Subtle title
    this.add.text(GAME_WIDTH / 2, 20, 'ZEN-MODUS', {
      fontFamily: FONT_TITLE,
      fontSize: '14px', color: '#334466', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50);

    // Object count
    this.countText = this.add.text(GAME_WIDTH / 2, 40, '', {
      fontSize: '10px', color: '#334466',
    }).setOrigin(0.5).setDepth(50);

    // Object selector (bottom center)
    this.createSelector();

    // Buttons
    new Button(this, {
      x: 70, y: GAME_HEIGHT - 40, text: 'Leeren', width: 100, height: 30, fontSize: '11px',
      color: 0x2a2a44, hoverColor: 0x333355, textColor: '#9999bb',
      onClick: () => this.clearObjects(),
    });

    new Button(this, {
      x: GAME_WIDTH - 70, y: GAME_HEIGHT - 40, text: 'Zurueck', width: 100, height: 30, fontSize: '11px',
      color: 0x2a2a44, hoverColor: 0x333355, textColor: '#9999bb',
      onClick: () => {
        this.music.stop();
        this.cameras.main.fadeOut(200, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });

    // Click to place
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      // Don't place if clicking on buttons (bottom 60px)
      if (ptr.y > GAME_HEIGHT - 60) return;
      // Don't place on selector area
      if (ptr.y > GAME_HEIGHT - 120 && ptr.x > GAME_WIDTH / 2 - 120 && ptr.x < GAME_WIDTH / 2 + 120) return;

      this.placeObject(ptr.x, ptr.y);
    });

    // Start ambient music
    this.music.start();

    // Dot grid background
    this.createDotGrid();
  }

  update(): void {
    this.trailRenderer.update();
  }

  private static readonly MAX_OBJECTS = 50;

  private placeObject(x: number, y: number): void {
    if (this.objectCount >= ZenScene.MAX_OBJECTS) {
      this.countText.setText(`Objekte: ${this.objectCount} (Max!)`);
      return;
    }

    AudioManager.playPlace();

    const type = this.selectedType;
    const props = BODY_PROPERTIES[type];
    const size = this.getSizeForType(type);

    const sprite = this.matter.add.sprite(x, y, type, undefined, {
      friction: props.friction,
      frictionAir: props.frictionAir,
      restitution: props.restitution,
      density: props.density,
      label: type,
      shape: type === 'ball' || type === 'weight'
        ? { type: 'circle', radius: size.width / 2 }
        : undefined,
    });

    sprite.setDisplaySize(size.width, size.height).setDepth(10);

    // Track for trails
    this.trailRenderer.track(
      sprite.body as MatterJS.BodyType,
      type === 'ball' ? 0x8888ff : type === 'weight' ? 0xddaa44 : 0x88ccaa
    );

    this.objectCount++;
    this.countText.setText(`Objekte: ${this.objectCount}`);

    // Feed chain length to music for evolving layers
    this.music.updateChain(Math.min(this.objectCount, 10));
  }

  private clearObjects(): void {
    // Remove all dynamic bodies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBodies = ((this.matter.world.localWorld as any).bodies as MatterJS.BodyType[]);
    const dynamicBodies = allBodies.filter(b => !b.isStatic);

    for (const body of dynamicBodies) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const go = (body as any).gameObject;
      if (go && go.destroy) go.destroy();
      else this.matter.world.remove(body);
    }

    this.trailRenderer.clear();
    this.objectCount = 0;
    this.countText.setText('');

    // Reset music
    this.music.stop();
    this.music = new MusicEngine();
    this.music.start();
  }

  private createSelector(): void {
    const types: { type: ObjectType; label: string }[] = [
      { type: 'ball', label: 'Kugel' },
      { type: 'weight', label: 'Gewicht' },
      { type: 'crate', label: 'Kiste' },
      { type: 'domino', label: 'Domino' },
    ];

    const cx = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - 85;
    const btnW = 55;
    const startX = cx - ((types.length - 1) * btnW) / 2;

    types.forEach((t, i) => {
      const bx = startX + i * btnW;
      const isSelected = t.type === this.selectedType;

      const container = this.add.container(bx, y).setDepth(50);

      const bg = this.add.rectangle(0, 0, 50, 35, isSelected ? 0x335577 : 0x222244, 0.8)
        .setStrokeStyle(1, isSelected ? 0x66aadd : 0x444466)
        .setInteractive({ useHandCursor: true });

      const icon = this.add.sprite(0, -3, t.type).setDisplaySize(18, 18);
      const label = this.add.text(0, 12, t.label, {
        fontSize: '8px', color: isSelected ? '#88ccff' : '#667788',
      }).setOrigin(0.5);

      container.add([bg, icon, label]);
      this.selectorButtons.push(container);

      bg.on('pointerdown', (e: Phaser.Input.Pointer) => {
        e.event.stopPropagation();
        this.selectedType = t.type;
        this.updateSelectorVisuals();
      });
    });
  }

  private updateSelectorVisuals(): void {
    const types: ObjectType[] = ['ball', 'weight', 'crate', 'domino'];
    this.selectorButtons.forEach((container, i) => {
      const isSelected = types[i] === this.selectedType;
      const bg = container.list[0] as Phaser.GameObjects.Rectangle;
      const label = container.list[2] as Phaser.GameObjects.Text;
      bg.setFillStyle(isSelected ? 0x335577 : 0x222244, 0.8);
      bg.setStrokeStyle(1, isSelected ? 0x66aadd : 0x444466);
      label.setColor(isSelected ? '#88ccff' : '#667788');
    });
  }

  private createDotGrid(): void {
    const gfx = this.add.graphics().setDepth(0).setAlpha(0.1);
    gfx.fillStyle(0x4466aa, 1);
    const spacing = 30;
    for (let x = spacing; x < GAME_WIDTH; x += spacing) {
      for (let y = spacing; y < GAME_HEIGHT - 20; y += spacing) {
        const dist = Math.sqrt((x - GAME_WIDTH / 2) ** 2 + (y - GAME_HEIGHT / 2) ** 2);
        const maxDist = Math.sqrt((GAME_WIDTH / 2) ** 2 + (GAME_HEIGHT / 2) ** 2);
        const alpha = 1 - dist / maxDist;
        if (alpha > 0.2) {
          gfx.fillCircle(x, y, 1.5);
        }
      }
    }
  }

  private getSizeForType(type: ObjectType): { width: number; height: number } {
    switch (type) {
      case 'ball': return { width: 28, height: 28 };
      case 'domino': return { width: 16, height: 48 };
      case 'crate': return { width: 40, height: 40 };
      case 'weight': return { width: 34, height: 34 };
      default: return { width: 40, height: 20 };
    }
  }
}
