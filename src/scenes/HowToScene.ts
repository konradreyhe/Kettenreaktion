import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
import { BODY_PROPERTIES } from '../constants/Physics';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { AudioManager } from '../systems/AudioManager';
import { Button } from '../ui/Button';
import { SceneTransition } from '../game/SceneTransition';

/** Interactive tutorial — guided playable level with step-by-step instructions. */
export class HowToScene extends Phaser.Scene {
  private step = 0;
  private instructionText!: Phaser.GameObjects.Text;
  private highlightRect: Phaser.GameObjects.Rectangle | null = null;
  private arrowText: Phaser.GameObjects.Text | null = null;
  private placedBall: Phaser.Physics.Matter.Sprite | null = null;
  private targetSprite: Phaser.GameObjects.Sprite | null = null;
  private targetBody: MatterJS.BodyType | null = null;
  private targetHit = false;
  private simulating = false;

  constructor() {
    super({ key: 'HowToScene' });
  }

  create(): void {
    this.step = 0;
    this.targetHit = false;
    this.simulating = false;
    this.placedBall = null;

    SceneTransition.wipeIn(this);

    // Title
    this.add.text(GAME_WIDTH / 2, 25, 'ANLEITUNG', {
      fontFamily: FONT_TITLE,
      fontSize: '16px', color: COLOR.textBright, fontStyle: 'bold',
      stroke: '#111122', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);

    // Build mini-level: floor + ramp + star
    this.buildTutorialLevel();

    // Instruction text (bottom center, high depth)
    this.instructionText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, '', {
      fontFamily: FONT_UI,
      fontSize: '16px', color: '#ddddff',
      stroke: '#111122', strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 500 },
    }).setOrigin(0.5).setDepth(100);

    // Skip button (always visible)
    new Button(this, {
      x: GAME_WIDTH - 60, y: 25, text: 'Ueberspringen', width: 100, height: 24, fontSize: '9px',
      color: 0x222233, hoverColor: 0x2a2a44, textColor: '#667788',
      onClick: () => this.goToMenu(),
    });

    // Start step 0
    this.showStep();
  }

  update(): void {
    if (!this.simulating || !this.placedBall) return;

    // Check if ball hit the target
    if (!this.targetHit && this.targetBody && this.placedBall.body) {
      const ball = this.placedBall.body as MatterJS.BodyType;
      const dx = ball.position.x - this.targetBody.position.x;
      const dy = ball.position.y - this.targetBody.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        this.targetHit = true;
        this.onTargetHit();
      }
    }

    // End simulation after 5s if target not hit
    if (this.simulating && Date.now() - this.simStartTime > 5000 && !this.targetHit) {
      this.simulating = false;
      this.step = 1; // back to "try again"
      this.cleanupBall();
      this.showStep();
    }
  }

  private simStartTime = 0;

  private buildTutorialLevel(): void {
    const floorH = 20;

    // Floor
    this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT - floorH / 2 - 40, GAME_WIDTH, floorH, 'floor_tile').setDepth(5);
    this.matter.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - floorH / 2 - 40, GAME_WIDTH, floorH, {
      isStatic: true, friction: 0.5, label: 'floor',
    });

    // Walls
    this.matter.add.rectangle(-10, GAME_HEIGHT / 2, 20, GAME_HEIGHT, { isStatic: true, label: 'wall' });
    this.matter.add.rectangle(GAME_WIDTH + 10, GAME_HEIGHT / 2, 20, GAME_HEIGHT, { isStatic: true, label: 'wall' });

    // Ramp
    const rampCx = 350;
    const rampCy = 320;
    this.add.tileSprite(rampCx, rampCy, 250, 20, 'ramp_tile').setAngle(-12).setDepth(5);
    this.matter.add.rectangle(rampCx, rampCy, 250, 20, {
      isStatic: true, friction: 0.5, angle: Phaser.Math.DegToRad(-12), label: 'ramp',
    });

    // Star target
    this.targetSprite = this.add.sprite(600, GAME_HEIGHT - 65, 'star').setDisplaySize(30, 30).setDepth(15);
    this.targetBody = this.matter.add.circle(600, GAME_HEIGHT - 65, 14, {
      isSensor: true, isStatic: true, label: 'target',
    });

    // Pulsing glow on target
    const glow = this.add.circle(600, GAME_HEIGHT - 65, 20, 0xffdd00, 0.15).setDepth(14);
    this.tweens.add({
      targets: glow, scaleX: 1.4, scaleY: 1.4, alpha: 0.05,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.targetSprite, scaleX: 1.1, scaleY: 1.1,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Placement zone
    const zoneColor = AccessibilityManager.isColorblind() ? 0x2255aa : 0x226622;
    const zoneBorder = AccessibilityManager.isColorblind() ? 0x4488ff : 0x44ff44;
    this.add.rectangle(250, 150, 150, 150, zoneColor, 0.2).setStrokeStyle(2, zoneBorder, 0.6).setDepth(3);
  }

  private showStep(): void {
    // Clean up previous highlights
    this.highlightRect?.destroy();
    this.highlightRect = null;
    this.arrowText?.destroy();
    this.arrowText = null;

    const steps: { text: string; action: () => void }[] = [
      {
        text: 'Willkommen! Klicke in die gruene Zone\num eine Kugel zu platzieren.',
        action: () => {
          // Highlight the placement zone
          this.highlightRect = this.add.rectangle(250, 150, 160, 160, 0x000000, 0)
            .setStrokeStyle(3, 0xffdd00, 0.8).setDepth(99);
          this.tweens.add({
            targets: this.highlightRect, alpha: 0.3, duration: 500, yoyo: true, repeat: -1,
          });
          // Arrow pointing to zone
          this.arrowText = this.add.text(250, 245, '\u2B07', {
            fontSize: '28px', color: '#ffdd00',
          }).setOrigin(0.5).setDepth(99);
          this.tweens.add({
            targets: this.arrowText, y: 235, duration: 400, yoyo: true, repeat: -1,
          });

          // Listen for click in zone
          this.input.once('pointerdown', (ptr: Phaser.Input.Pointer) => {
            if (ptr.x >= 175 && ptr.x <= 325 && ptr.y >= 75 && ptr.y <= 225) {
              this.placeBall(ptr.x, ptr.y);
            } else {
              // Clicked outside — show hint
              this.instructionText.setText('Klicke IN die markierte Zone!');
              this.time.delayedCall(1000, () => this.showStep());
            }
          });
        },
      },
      {
        text: 'Gut! Schau zu, wie die Kugel rollt\nund die Kettenreaktion ausloest...',
        action: () => {
          // This step shows during simulation — no action needed
        },
      },
      {
        text: 'Du hast den Stern getroffen! +100 Punkte!\nSo funktioniert Kettenreaktion.',
        action: () => {
          // Highlight score
          this.highlightRect = this.add.rectangle(600, GAME_HEIGHT - 65, 50, 50, 0x000000, 0)
            .setStrokeStyle(3, 0xffdd00, 0.8).setDepth(99);

          this.time.delayedCall(2000, () => {
            this.step = 3;
            this.showStep();
          });
        },
      },
      {
        text: 'Du hast 3 Versuche pro Tag.\nJeden Tag ein neues Puzzle. Viel Spass!',
        action: () => {
          this.time.delayedCall(2500, () => this.goToMenu());
        },
      },
    ];

    if (this.step >= steps.length) {
      this.goToMenu();
      return;
    }

    const s = steps[this.step];
    this.instructionText.setText(s.text);

    // Animate instruction text in
    this.instructionText.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: this.instructionText,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 300, ease: 'Back.easeOut',
    });

    s.action();
  }

  private placeBall(x: number, y: number): void {
    AudioManager.playPlace();

    const props = BODY_PROPERTIES['ball'];
    this.placedBall = this.matter.add.sprite(x, y, 'ball', undefined, {
      friction: props.friction,
      frictionAir: props.frictionAir,
      restitution: props.restitution,
      density: props.density,
      label: 'ball',
      shape: { type: 'circle', radius: 14 },
    });
    this.placedBall.setDisplaySize(28, 28).setDepth(15).setTint(0x88ccff);

    this.simulating = true;
    this.simStartTime = Date.now();
    this.step = 1;
    this.showStep();
  }

  private cleanupBall(): void {
    if (this.placedBall) {
      this.placedBall.destroy();
      this.placedBall = null;
    }
  }

  private onTargetHit(): void {
    AudioManager.playTargetHit(0);
    this.simulating = false;

    // Target hit animation
    if (this.targetSprite) {
      this.tweens.add({
        targets: this.targetSprite, scaleX: 2.5, scaleY: 2.5, alpha: 0,
        duration: 500, ease: 'Power3',
      });
    }

    // Score popup
    const popup = this.add.text(600, GAME_HEIGHT - 80, '+100', {
      fontFamily: FONT_TITLE,
      fontSize: '24px', color: COLOR.star, fontStyle: 'bold',
      stroke: '#332200', strokeThickness: 3, shadow: TEXT_SHADOW,
    }).setOrigin(0.5).setDepth(55).setScale(0);

    this.tweens.add({
      targets: popup, scaleX: 1, scaleY: 1, y: GAME_HEIGHT - 120,
      duration: 400, ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: popup, alpha: 0, delay: 600, duration: 400,
      onComplete: () => popup.destroy(),
    });

    this.cameras.main.flash(150, 255, 220, 50);

    this.step = 2;
    this.time.delayedCall(600, () => this.showStep());
  }

  private goToMenu(): void {
    SceneTransition.wipeOut(this, 'MenuScene');
  }

  shutdown(): void {
    // Clean up physics bodies created in create()
    if (this.placedBall) {
      this.placedBall.destroy();
      this.placedBall = null;
    }
    if (this.targetBody) {
      this.matter.world.remove(this.targetBody);
      this.targetBody = null;
    }
    // Matter world cleanup — remove all remaining bodies
    this.matter.world.getAllBodies().forEach((body) => {
      this.matter.world.remove(body);
    });
  }
}
