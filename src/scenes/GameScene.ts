import Phaser from 'phaser';
import { PhysicsManager } from '../game/PhysicsManager';
import { ChainDetector } from '../game/ChainDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { LevelLoader } from '../game/LevelLoader';
import { CameraFX } from '../game/CameraFX';
import { TrailRenderer } from '../game/TrailRenderer';
import { DailySystem } from '../systems/DailySystem';
import { AudioManager } from '../systems/AudioManager';
import { HUD } from '../ui/HUD';
import { AccessibilityManager } from '../systems/AccessibilityManager';
import { FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW } from '../constants/Style';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAX_ATTEMPTS,
  MAX_SIMULATION_MS,
  NEAR_MISS_PX,
} from '../constants/Game';
import { MAX_BODIES_MOBILE, MAX_BODIES_DESKTOP } from '../constants/Physics';
import type { Level } from '../types/Level';
import type { ScoreResult, ReplayFrame } from '../types/GameState';

interface TargetEntry {
  id: string;
  sprite: Phaser.GameObjects.GameObject;
  glow: Phaser.GameObjects.Arc;
  body: MatterJS.BodyType;
  hit: boolean;
  x: number;
  y: number;
  points: number;
}

/** Core gameplay scene — placement, simulation, scoring. */
export class GameScene extends Phaser.Scene {
  private level!: Level;
  private physicsManager!: PhysicsManager;
  private chainDetector!: ChainDetector;
  private cameraFX!: CameraFX;
  private trailRenderer!: TrailRenderer;
  private hud!: HUD;

  private attempts = 0;
  private isSimulating = false;
  private introActive = false;
  private isPractice = false;
  private practiceIndex = 0;
  private simulationStartTime = 0;
  private bestScore: ScoreResult | null = null;
  private bestChainLength = 0;
  private totalTargetsHitBest = 0;

  private previewGhost: Phaser.GameObjects.Arc | null = null;
  private placementZoneRect: Phaser.GameObjects.Rectangle | null = null;
  private placementZoneBorder: Phaser.GameObjects.Rectangle | null = null;
  private targets: TargetEntry[] = [];
  private targetsHit = 0;
  private placedSprite: Phaser.Physics.Matter.Sprite | null = null;
  private selectedObjectType: import('../types/Level').ObjectType = 'ball';
  private selectorButtons: Phaser.GameObjects.Container[] = [];

  // Replay recording
  private replayFrames: ReplayFrame[] = [];
  private replayFrameCounter = 0;
  private placementData: { type: string; x: number; y: number } | null = null;
  private bestReplayFrames: ReplayFrame[] = [];
  private bestPlacement: { type: string; x: number; y: number } | null = null;
  private visibilityHandler: (() => void) | null = null;

  // Particles
  private hitEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private sparkEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // Vignette
  private vignette: Phaser.GameObjects.Graphics | null = null;

  // Chain counter display (big center number)
  private chainDisplay: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { practiceIndex?: number }): void {
    this.isPractice = data?.practiceIndex !== undefined;
    this.practiceIndex = data?.practiceIndex ?? 0;
  }

  create(): void {
    this.attempts = 0;
    this.bestScore = null;
    this.bestChainLength = 0;
    this.totalTargetsHitBest = 0;

    this.physicsManager = new PhysicsManager(this);
    this.chainDetector = new ChainDetector();
    this.cameraFX = new CameraFX(this);
    this.trailRenderer = new TrailRenderer(this);
    this.hud = new HUD(this);

    // Gravity Flip Friday — invert gravity on Fridays (UTC)
    const isFriday = new Date().getUTCDay() === 5;
    if (isFriday && !this.isPractice) {
      this.matter.world.setGravity(0, -1);
    }

    // Load level — practice mode uses specific index, daily uses seed
    this.level = this.isPractice
      ? LevelLoader.loadByIndex(this.practiceIndex)
      : LevelLoader.loadToday();

    this.createTextures();
    this.drawBackgroundGrid();
    this.drawVignette();

    this.setupLevel();
    this.setupInput();
    this.setupCollisionListener();

    // Chain counter (hidden until chain starts)
    this.chainDisplay = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
        fontFamily: FONT_TITLE,
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 6,
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(60);

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
    this.hud.updateScore(0, this.level.targets.length);
    if (this.isPractice) {
      this.hud.updateLabel(`Uebung: ${this.level.name}`);
    } else {
      const label = isFriday
        ? `\u{1F504} Flip Friday #${DailySystem.getPuzzleNumber()}`
        : undefined;
      if (label) {
        this.hud.updateLabel(label);
      } else {
        this.hud.updatePuzzleNumber(DailySystem.getPuzzleNumber());
      }
    }

    // Pause physics when tab is hidden to prevent time accumulation
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.matter.world.pause();
      } else {
        this.matter.world.resume();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.cameras.main.fadeIn(300, 26, 26, 46);

    // Level intro overlay
    this.showLevelIntro();
  }

  private showLevelIntro(): void {
    this.introActive = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e, 0.85)
      .setDepth(200);

    const levelName = this.add
      .text(cx, cy - 30, this.level.name, {
        fontFamily: FONT_TITLE,
        fontSize: '22px',
        color: COLOR.textBright,
        fontStyle: 'bold',
        stroke: '#111122',
        strokeThickness: 3,
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScale(0);

    const diffStars = '\u2605'.repeat(this.level.difficulty) +
      '\u2606'.repeat(5 - this.level.difficulty);
    const diffText = this.add
      .text(cx, cy + 15, diffStars, {
        fontSize: '20px',
        color: '#ffaa44',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setAlpha(0);

    // Object type + target info
    const objectNames: Record<string, string> = {
      ball: 'Kugel', weight: 'Gewicht', crate: 'Kiste', domino: 'Domino',
    };
    const allowed = this.level.placementZone.allowedObjects
      .map((t) => objectNames[t] ?? t)
      .join(' / ');
    const targetCount = this.level.targets.length;
    const infoLine = `${allowed}  \u2022  ${targetCount} Stern${targetCount > 1 ? 'e' : ''}`;

    const info = this.add
      .text(cx, cy + 45, infoLine, {
        fontSize: '12px',
        color: '#6688aa',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setAlpha(0);

    const hint = this.add
      .text(cx, cy + 70, AccessibilityManager.isColorblind() ? 'Klicke in die blaue Zone' : 'Klicke in die gruene Zone', {
        fontSize: '13px',
        color: '#888899',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: levelName,
      scaleX: 1, scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: diffText,
      alpha: 1,
      delay: 200,
      duration: 300,
    });
    this.tweens.add({
      targets: info,
      alpha: 1,
      delay: 350,
      duration: 300,
    });
    this.tweens.add({
      targets: hint,
      alpha: 1,
      delay: 500,
      duration: 300,
    });

    // Fade out after 2s
    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [overlay, levelName, diffText, info, hint],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          overlay.destroy();
          levelName.destroy();
          diffText.destroy();
          info.destroy();
          hint.destroy();
          this.introActive = false;
        },
      });
    });
  }

  update(): void {
    this.cameraFX.update();
    this.trailRenderer.update();

    if (!this.isSimulating) return;

    // Record replay frame every 3rd update (~20fps at 60fps)
    this.replayFrameCounter++;
    if (this.replayFrameCounter % 3 === 0) {
      this.recordReplayFrame();
    }

    const elapsed = Date.now() - this.simulationStartTime;
    const chain = this.chainDetector.getChainLength();
    this.hud.updateChain(chain);

    // Big center chain counter — escalates with chain length
    if (chain >= 3 && this.chainDisplay) {
      this.chainDisplay.setText(`${chain}`);
      const intensity = Math.min(1, chain / 12);
      const targetAlpha = 0.1 + intensity * 0.2;
      const targetScale = 1 + intensity * 0.6;
      if (this.chainDisplay.alpha === 0) {
        this.chainDisplay.setScale(1);
        this.tweens.add({
          targets: this.chainDisplay,
          alpha: targetAlpha,
          scaleX: targetScale,
          scaleY: targetScale,
          duration: 200,
        });
      } else {
        this.chainDisplay.setAlpha(targetAlpha);
        this.chainDisplay.setScale(targetScale);
      }
    }

    // Background atmosphere shift with chain length
    if (chain >= 2) {
      const t = Math.min(1, chain / 15);
      const r = Math.floor(26 + t * 20);  // 26 -> 46 (warmer)
      const g = Math.floor(26 - t * 8);   // 26 -> 18 (less green)
      const b = Math.floor(46 - t * 10);  // 46 -> 36 (less blue)
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(r, g, b));
    }

    // Minimum 1.5s before checking sleep
    if (elapsed < 1500) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matterBodies = (this.matter.world.localWorld as any).bodies as MatterJS.BodyType[];
    const allSleeping = matterBodies.every(
      (b) => b.isStatic || b.isSleeping
    );

    if (allSleeping || elapsed >= MAX_SIMULATION_MS) {
      this.endSimulation();
    }
  }

  private createTextures(): void {
    if (!this.textures.exists('particle')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture('particle', 8, 8);
      gfx.destroy();
    }

    if (!this.textures.exists('spark')) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 3, 3);
      gfx.generateTexture('spark', 3, 3);
      gfx.destroy();
    }
  }

  private applyThemeTint(): void {
    const theme = this.level.theme;
    let tintColor = 0x1a1a2e; // default

    switch (theme) {
      case 'wood':
        tintColor = 0x1e1a14; // warm dark brown
        break;
      case 'stone':
        tintColor = 0x181c22; // cool dark blue-grey
        break;
      case 'metal':
        tintColor = 0x141418; // near-black with purple hint
        break;
    }

    // Subtle full-screen color overlay
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, tintColor, 0.3)
      .setDepth(1);
  }

  private drawBackgroundGrid(): void {
    const gfx = this.add.graphics().setDepth(0);

    // Dot grid — modern, subtle, professional
    for (let x = 20; x <= GAME_WIDTH; x += 40) {
      for (let y = 60; y <= GAME_HEIGHT - 20; y += 40) {
        const distFromCenter = Math.sqrt(
          Math.pow(x - GAME_WIDTH / 2, 2) + Math.pow(y - GAME_HEIGHT / 2, 2)
        );
        const fade = Math.max(0, 1 - distFromCenter / 450);
        gfx.fillStyle(0x4455aa, 0.04 + fade * 0.06);
        gfx.fillCircle(x, y, 1);
      }
    }
  }

  private drawVignette(): void {
    this.vignette = this.add.graphics().setDepth(90).setAlpha(0.4);
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Top and bottom gradient bars
    for (let i = 0; i < 40; i++) {
      const alpha = (40 - i) / 40;
      this.vignette.fillStyle(0x000000, alpha * 0.3);
      this.vignette.fillRect(0, i, w, 1);
      this.vignette.fillRect(0, h - i, w, 1);
    }
    // Left and right
    for (let i = 0; i < 30; i++) {
      const alpha = (30 - i) / 30;
      this.vignette.fillStyle(0x000000, alpha * 0.2);
      this.vignette.fillRect(i, 0, 1, h);
      this.vignette.fillRect(w - i, 0, 1, h);
    }
  }

  private setupLevel(): void {
    // Clean previous
    this.targets.forEach((t) => {
      t.sprite.destroy();
      t.glow.destroy();
      this.matter.world.remove(t.body);
    });
    this.targets = [];
    this.targetsHit = 0;
    this.chainDetector.reset();
    this.previewGhost?.destroy();
    this.previewGhost = null;
    this.placementZoneRect?.destroy();
    this.placementZoneBorder?.destroy();
    this.placedSprite?.destroy();
    this.placedSprite = null;
    this.hitEmitter?.destroy();
    this.sparkEmitter?.destroy();
    this.dustEmitter?.destroy();
    this.trailRenderer.clear();
    if (this.chainDisplay) {
      this.chainDisplay.setAlpha(0);
      this.chainDisplay.setText('');
    }

    // Build physics world
    this.physicsManager.buildLevel(this.level);

    // Placement zone (colorblind-aware)
    const zone = this.level.placementZone;
    const zoneColor = AccessibilityManager.zoneColor;
    this.placementZoneRect = this.add
      .rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height,
        zoneColor,
        0.06
      )
      .setDepth(2);

    this.placementZoneBorder = this.add
      .rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height
      )
      .setStrokeStyle(2, zoneColor, 0.5)
      .setFillStyle(0x000000, 0)
      .setDepth(2);

    this.tweens.add({
      targets: this.placementZoneBorder,
      alpha: { from: 0.3, to: 0.8 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Ghost of previous attempt placement
    if (this.placementData && this.attempts > 0) {
      const ghost = this.add
        .circle(this.placementData.x, this.placementData.y, 8, 0xffffff, 0.12)
        .setDepth(3);
      const ghostX = this.add
        .text(this.placementData.x, this.placementData.y, '\u00D7', {
          fontSize: '14px', color: '#ffffff',
        })
        .setOrigin(0.5).setAlpha(0.2).setDepth(3);

      // Fade out when simulation starts (cleaned up automatically on reset)
      this.time.delayedCall(5000, () => {
        this.tweens.add({ targets: [ghost, ghostX], alpha: 0, duration: 500 });
      });
    }

    // Theme-based background tint
    this.applyThemeTint();

    // Targets with star texture and glow halo
    for (const target of this.level.targets) {
      // Outer glow
      const glow = this.add
        .circle(target.x, target.y, 18, 0xffdd00, 0.15)
        .setDepth(14);

      this.tweens.add({
        targets: glow,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.05,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Star sprite
      const sprite = this.add
        .sprite(target.x, target.y, 'star')
        .setDisplaySize(26, 26)
        .setDepth(15);

      this.tweens.add({
        targets: sprite,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 200,
      });

      // Sparkle shimmer orbiting the star
      const sparkle = this.add
        .circle(target.x + 10, target.y - 10, 2, 0xffffff, 0.7)
        .setDepth(16);
      const sparkleRadius = 14;
      this.tweens.addCounter({
        from: 0, to: 360,
        duration: 2000,
        repeat: -1,
        onUpdate: (tween) => {
          const angle = Phaser.Math.DegToRad(tween.getValue() ?? 0);
          sparkle.setPosition(
            target.x + Math.cos(angle) * sparkleRadius,
            target.y + Math.sin(angle) * sparkleRadius
          );
          sparkle.setAlpha(0.3 + Math.sin(angle * 3) * 0.4);
        },
      });

      const body = this.matter.add.circle(target.x, target.y, 12, {
        isSensor: true,
        isStatic: true,
        label: `target_${target.id}`,
      });

      this.targets.push({
        id: target.id,
        sprite,
        glow,
        body,
        hit: false,
        x: target.x,
        y: target.y,
        points: target.points,
      });
    }

    // Object type selector (when multiple types allowed)
    this.selectedObjectType = this.level.placementZone.allowedObjects[0];
    this.selectorButtons = [];
    if (this.level.placementZone.allowedObjects.length > 1) {
      this.createObjectSelector();
    }

    // Preview ghost with outer glow ring
    const ghostColor = this.getObjectColor(this.selectedObjectType, 0.4);
    const ghostCx = zone.x + zone.width / 2;
    const ghostCy = zone.y + zone.height / 2;

    // Outer glow ring
    const ghostGlow = this.add
      .circle(ghostCx, ghostCy, 18, ghostColor, 0.1)
      .setDepth(19);
    this.tweens.add({
      targets: ghostGlow,
      scaleX: 1.4, scaleY: 1.4, alpha: 0.02,
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.previewGhost = this.add
      .circle(ghostCx, ghostCy, 12, ghostColor, 0.5)
      .setStrokeStyle(1.5, 0xffffff, 0.3)
      .setDepth(20);

    // Sync glow ring with ghost position
    this.input.on('pointermove', () => {
      if (this.previewGhost) {
        ghostGlow.setPosition(this.previewGhost.x, this.previewGhost.y);
        ghostGlow.setVisible(this.previewGhost.visible);
      }
    });

    // Particle emitters
    this.hitEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      lifespan: 700,
      tint: [0xffdd00, 0xff8800, 0xffff44, 0xffffff],
      emitting: false,
      quantity: 16,
    }).setDepth(50);

    this.sparkEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 30, max: 120 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      tint: [0xffffff, 0xccccff, 0xaaaadd],
      emitting: false,
      quantity: 6,
    }).setDepth(45);

    this.dustEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.8, end: 0 },
      lifespan: 500,
      tint: [0x888899, 0x666677],
      emitting: false,
      quantity: 4,
      alpha: { start: 0.4, end: 0 },
    }).setDepth(40);

    this.isSimulating = false;
  }

  /** Offset touch Y upward so the finger doesn't cover the placement point. */
  private readonly TOUCH_OFFSET_Y = 30;

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /** Apply touch offset — shifts placement above finger on touch devices. */
  private getAdjustedY(ptr: Phaser.Input.Pointer): number {
    if (!ptr.wasTouch) return ptr.y;
    return ptr.y - this.TOUCH_OFFSET_Y;
  }

  private setupInput(): void {
    // Keyboard: ESC returns to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      const returnScene = this.isPractice ? 'PracticeScene' : 'MenuScene';
      this.cameras.main.fadeOut(200, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(returnScene);
      });
    });

    // Keyboard: 1/2 keys switch object type
    this.input.keyboard?.on('keydown-ONE', () => {
      const allowed = this.level.placementZone.allowedObjects;
      if (allowed.length > 0 && !this.isSimulating) {
        this.selectedObjectType = allowed[0];
        this.updateSelectorHighlight();
      }
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      const allowed = this.level.placementZone.allowedObjects;
      if (allowed.length > 1 && !this.isSimulating) {
        this.selectedObjectType = allowed[1];
        this.updateSelectorHighlight();
      }
    });

    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || this.introActive || !this.previewGhost) return;

      const adjY = this.getAdjustedY(ptr);
      if (this.isInZone(ptr.x, adjY)) {
        this.previewGhost.setPosition(ptr.x, adjY);
        this.previewGhost.setVisible(true);
      } else {
        this.previewGhost.setVisible(false);
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || this.introActive) return;
      if (this.attempts >= MAX_ATTEMPTS) return;

      const adjY = this.getAdjustedY(ptr);
      if (!this.isInZone(ptr.x, adjY)) return;

      this.placeAndSimulate(ptr.x, adjY);
    });
  }

  private setupCollisionListener(): void {
    this.matter.world.on(
      'collisionstart',
      (_event: unknown, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
        if (!this.isSimulating) return;

        this.checkTargetHit(bodyA, bodyB);

        const prevChain = this.chainDetector.getChainLength();
        this.chainDetector.onCollision([{ bodyA, bodyB }]);
        const newChain = this.chainDetector.getChainLength();

        // Collision FX (only dynamic-to-dynamic)
        if (!bodyA.isStatic && !bodyB.isStatic) {
          const cx = (bodyA.position.x + bodyB.position.x) / 2;
          const cy = (bodyA.position.y + bodyB.position.y) / 2;

          // Collision velocity
          const dvx = bodyA.velocity.x - bodyB.velocity.x;
          const dvy = bodyA.velocity.y - bodyB.velocity.y;
          const impactSpeed = Math.sqrt(dvx * dvx + dvy * dvy);

          // Spark particles at collision point
          if (impactSpeed > 1.5) {
            this.sparkEmitter?.emitParticleAt(cx, cy);
          }

          // Screen shake proportional to impact + chain length
          if (impactSpeed > 3 && !AccessibilityManager.prefersReducedMotion()) {
            const chainBoost = 1 + newChain * 0.08;
            this.cameraFX.addTrauma(Math.min(0.4, impactSpeed * 0.04 * chainBoost));
          }

          // Squash & stretch on both bodies' sprites
          this.squashBody(bodyA);
          this.squashBody(bodyB);

          // Hit stop on chain milestones (brief physics pause for dramatic effect)
          if (newChain > prevChain && newChain >= 5 && newChain % 3 === 0 && !AccessibilityManager.prefersReducedMotion()) {
            this.matter.world.pause();
            this.time.delayedCall(80, () => {
              if (this.isSimulating) this.matter.world.resume();
            });
          }

          // Audio
          if (newChain > prevChain) {
            AudioManager.playChainUp(newChain);
          } else {
            AudioManager.playImpact(newChain);
          }
        }

        // Dust on floor impacts
        if (bodyA.label === 'floor' || bodyB.label === 'floor') {
          const other = bodyA.label === 'floor' ? bodyB : bodyA;
          this.dustEmitter?.emitParticleAt(other.position.x, other.position.y);
        }
      }
    );
  }

  /** Apply squash & stretch to a body's sprite. */
  private squashBody(body: MatterJS.BodyType): void {
    // Find the Phaser game object associated with this body
    const gameObject = (body as any).gameObject;
    if (!gameObject || !gameObject.scene) return;

    this.tweens.add({
      targets: gameObject,
      scaleX: 1.25,
      scaleY: 0.75,
      duration: 50,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private checkTargetHit(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
    for (const target of this.targets) {
      if (target.hit) continue;

      if (bodyA === target.body || bodyB === target.body) {
        target.hit = true;
        this.targetsHit++;
        this.hud.updateScore(this.targetsHit, this.level.targets.length);

        // Audio
        AudioManager.playTargetHit(this.targetsHit - 1);

        // BIG screen shake + slow-mo for target hit
        this.cameraFX.addTrauma(0.4);
        this.cameraFX.slowMotion(0.25, 500);

        // Particle burst
        this.hitEmitter?.emitParticleAt(target.x, target.y);

        // Flash the whole screen briefly
        this.cameras.main.flash(150, 255, 220, 50);

        // Target hit animation
        this.tweens.killTweensOf(target.sprite);
        this.tweens.killTweensOf(target.glow);

        this.tweens.add({
          targets: target.sprite,
          scaleX: 3,
          scaleY: 3,
          alpha: 0,
          duration: 500,
          ease: 'Power3',
        });

        this.tweens.add({
          targets: target.glow,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 600,
        });

        // Score popup with scale-in
        const popup = this.add
          .text(target.x, target.y - 15, `+${target.points}`, {
            fontFamily: FONT_TITLE,
            fontSize: '20px',
            color: COLOR.star,
            fontStyle: 'bold',
            stroke: '#332200',
            strokeThickness: 3,
            shadow: TEXT_SHADOW,
          })
          .setOrigin(0.5)
          .setDepth(55)
          .setScale(0);

        this.tweens.add({
          targets: popup,
          scaleX: 1,
          scaleY: 1,
          y: target.y - 55,
          duration: 400,
          ease: 'Back.easeOut',
        });
        this.tweens.add({
          targets: popup,
          alpha: 0,
          delay: 500,
          duration: 400,
          onComplete: () => popup.destroy(),
        });
      }
    }
  }

  private placeAndSimulate(x: number, y: number): void {
    this.attempts++;
    this.isSimulating = true;
    this.simulationStartTime = Date.now();

    this.previewGhost?.setVisible(false);
    this.placementZoneBorder?.setAlpha(0.1);
    this.placementZoneRect?.setAlpha(0.02);
    if (this.placementZoneBorder) {
      this.tweens.killTweensOf(this.placementZoneBorder);
    }

    // Reset replay recording for this attempt
    this.replayFrames = [];
    this.replayFrameCounter = 0;

    // Place the player's object — with distinct glow
    AudioManager.playPlace();
    const objectType = this.selectedObjectType;
    this.placementData = { type: objectType, x, y };
    this.placedSprite = this.physicsManager.createPlayerObject(objectType, x, y);

    // Hide selector during simulation
    for (const btn of this.selectorButtons) btn.setVisible(false);

    // Track the placed object for trail rendering
    this.trailRenderer.track(
      this.placedSprite.body as MatterJS.BodyType,
      objectType === 'ball' ? 0x8888ff : 0xddaa44
    );

    // Also track all dynamic objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBodies = (this.matter.world.localWorld as any).bodies as MatterJS.BodyType[];
    for (const body of allBodies) {
      if (!body.isStatic && body !== this.placedSprite.body) {
        this.trailRenderer.track(body, 0x8888aa);
      }
    }

    // Placement pop animation (0 → 1 scale)
    this.placedSprite.setScale(0);
    this.tweens.add({
      targets: this.placedSprite,
      scaleX: 1, scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut',
    });

    // Flash + micro shake on placement
    this.cameras.main.flash(80, 100, 100, 180);
    if (!AccessibilityManager.prefersReducedMotion()) {
      this.cameraFX.addTrauma(0.1);
    }

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
  }

  private endSimulation(): void {
    this.isSimulating = false;

    // Render photon trail art (velocity-colored paths)
    this.trailRenderer.renderArt();

    // Reset background color
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // Hide chain display
    if (this.chainDisplay) {
      this.tweens.add({
        targets: this.chainDisplay,
        alpha: 0,
        duration: 300,
      });
    }

    const elapsed = (Date.now() - this.simulationStartTime) / 1000;
    const chainLength = this.chainDetector.getChainLength();

    this.checkNearMisses();

    const result = ScoreCalculator.calculate({
      targetsHit: this.targetsHit,
      totalTargets: this.level.targets.length,
      chainLength,
      attempts: this.attempts,
      seconds: elapsed,
    });

    if (!this.bestScore || result.total > this.bestScore.total) {
      this.bestScore = result;
      this.bestChainLength = chainLength;
      this.totalTargetsHitBest = this.targetsHit;
      // Store replay of best attempt (capped at 300 frames to limit storage)
      this.bestReplayFrames = this.replayFrames.slice(0, 300);
      this.bestPlacement = this.placementData;
    }

    const allTargetsHit = this.targetsHit >= this.level.targets.length;

    if (this.attempts >= MAX_ATTEMPTS || allTargetsHit) {
      const isPerfect = allTargetsHit && this.attempts === 1;

      if (this.totalTargetsHitBest > 0) {
        AudioManager.playSuccess();
      } else {
        AudioManager.playFail();
      }

      // "PERFEKT!" flash for first-attempt all-target solve
      if (isPerfect) {
        const perfectText = this.add
          .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PERFEKT!', {
            fontFamily: FONT_TITLE,
            fontSize: '42px', color: COLOR.accent, fontStyle: 'bold',
            stroke: '#332200', strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ffdd4488', blur: 16, fill: false, stroke: true },
          })
          .setOrigin(0.5).setDepth(200).setScale(0).setAlpha(1);

        this.tweens.add({
          targets: perfectText,
          scaleX: 1.2, scaleY: 1.2,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: perfectText,
              alpha: 0, scaleX: 1.5, scaleY: 1.5,
              delay: 400,
              duration: 300,
              onComplete: () => perfectText.destroy(),
            });
          },
        });

        this.cameraFX.addTrauma(0.5);
      }

      this.time.delayedCall(isPerfect ? 1000 : 600, () => {
        this.cameras.main.fadeOut(500, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ResultScene', {
            score: this.bestScore!,
            chainLength: this.bestChainLength,
            attempts: this.attempts,
            solved: this.totalTargetsHitBest > 0,
            targetsHit: this.totalTargetsHitBest,
            totalTargets: this.level.targets.length,
            isPractice: this.isPractice,
            practiceIndex: this.practiceIndex,
            replay: this.bestReplayFrames,
            placement: this.bestPlacement,
            levelId: this.level.id,
          });
        });
      });
    } else {
      // Retry overlay
      const overlay = this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e, 0)
        .setDepth(95);

      const retryText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Versuch ${this.attempts}/${MAX_ATTEMPTS}`, {
          fontFamily: FONT_TITLE,
          fontSize: '22px',
          color: COLOR.textBright,
          fontStyle: 'bold',
          stroke: '#111122',
          strokeThickness: 3,
          shadow: TEXT_SHADOW,
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setAlpha(0)
        .setScale(0.5);

      const subText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35, this.targetsHit > 0
          ? `${this.targetsHit} Stern${this.targetsHit > 1 ? 'e' : ''} getroffen!`
          : 'Versuche es nochmal!', {
          fontFamily: FONT_UI,
          fontSize: '12px',
          color: this.targetsHit > 0 ? COLOR.accent : '#aa6666',
          stroke: '#111122',
          strokeThickness: 1,
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setAlpha(0);

      this.tweens.add({
        targets: overlay,
        fillAlpha: 0.6,
        duration: 200,
      });

      this.tweens.add({
        targets: retryText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: subText,
        alpha: 1,
        delay: 200,
        duration: 300,
      });

      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [overlay, retryText, subText],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            overlay.destroy();
            retryText.destroy();
            subText.destroy();
            this.setupLevel();
            this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
          },
        });
      });
    }
  }

  private checkNearMisses(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBodies = (this.matter.world.localWorld as any).bodies as MatterJS.BodyType[];
    const dynamicBodies = allBodies.filter((b) => !b.isStatic);

    for (const target of this.targets) {
      if (target.hit) continue;

      for (const body of dynamicBodies) {
        const dx = body.position.x - target.x;
        const dy = body.position.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < NEAR_MISS_PX + 15) {
          AudioManager.playImpact(0);

          const nearMiss = this.add
            .text(target.x, target.y - 25, 'Knapp!', {
              fontFamily: FONT_TITLE,
              fontSize: '14px',
              color: AccessibilityManager.nearMissHex,
              fontStyle: 'bold',
              stroke: '#111122',
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(55)
            .setScale(0);

          this.tweens.add({
            targets: nearMiss,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut',
          });
          this.tweens.add({
            targets: nearMiss,
            y: target.y - 65,
            alpha: 0,
            delay: 300,
            duration: 900,
            onComplete: () => nearMiss.destroy(),
          });
          break;
        }
      }
    }
  }

  private recordReplayFrame(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBodies = (this.matter.world.localWorld as any).bodies as MatterJS.BodyType[];
    const frame: ReplayFrame = [];
    for (const body of allBodies) {
      if (body.isStatic) continue;
      frame.push([
        Math.round(body.position.x * 10) / 10,
        Math.round(body.position.y * 10) / 10,
        Math.round(body.angle * 100) / 100,
      ]);
    }
    this.replayFrames.push(frame);
  }

  private getObjectColor(type: import('../types/Level').ObjectType, _alpha?: number): number {
    switch (type) {
      case 'ball': return 0xaaaaee;
      case 'weight': return 0xccaa55;
      case 'crate': return 0xcc8844;
      case 'domino': return 0xddcc88;
      default: return 0xaaaaaa;
    }
  }

  private createObjectSelector(): void {
    const allowed = this.level.placementZone.allowedObjects;
    const startX = GAME_WIDTH - 50;
    const startY = 80;
    const spacing = 50;

    const label = this.add.text(startX, startY - 30, 'Objekt:', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(50);
    const labelContainer = this.add.container(0, 0, [label]).setDepth(50);
    this.selectorButtons.push(labelContainer);

    allowed.forEach((type, i) => {
      const y = startY + i * spacing;
      const isSelected = type === this.selectedObjectType;

      const bg = this.add.circle(startX, y, 18, isSelected ? 0x446644 : 0x333344, 0.8);
      const icon = this.add.circle(startX, y, 10, this.getObjectColor(type), isSelected ? 1 : 0.5);
      const nameText = this.add.text(startX, y + 22, type.charAt(0).toUpperCase() + type.slice(1), {
        fontFamily: 'monospace', fontSize: '10px', color: '#cccccc',
      }).setOrigin(0.5);

      const container = this.add.container(0, 0, [bg, icon, nameText]).setDepth(50);
      container.setSize(40, 40);

      bg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.isSimulating) return;
          this.selectedObjectType = type;
          this.updateSelectorHighlight();
          // Update ghost color
          if (this.previewGhost) {
            this.previewGhost.setFillStyle(this.getObjectColor(type), 0.4);
          }
        });

      this.selectorButtons.push(container);
    });
  }

  private updateSelectorHighlight(): void {
    const allowed = this.level.placementZone.allowedObjects;
    // Skip index 0 (label container), buttons start at index 1
    for (let i = 0; i < allowed.length; i++) {
      const container = this.selectorButtons[i + 1];
      if (!container) continue;
      const bg = container.list[0] as Phaser.GameObjects.Arc;
      const icon = container.list[1] as Phaser.GameObjects.Arc;
      const isSelected = allowed[i] === this.selectedObjectType;
      bg.setFillStyle(isSelected ? 0x446644 : 0x333344, 0.8);
      icon.setAlpha(isSelected ? 1 : 0.5);
    }
  }

  private isInZone(x: number, y: number): boolean {
    const zone = this.level.placementZone;
    return (
      x >= zone.x &&
      x <= zone.x + zone.width &&
      y >= zone.y &&
      y <= zone.y + zone.height
    );
  }

  shutdown(): void {
    this.physicsManager.clearLevel();
    this.trailRenderer.destroy();
    for (const btn of this.selectorButtons) btn.destroy();
    this.selectorButtons = [];
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
