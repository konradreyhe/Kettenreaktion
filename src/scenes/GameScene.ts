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
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAX_ATTEMPTS,
  MAX_SIMULATION_MS,
  NEAR_MISS_PX,
} from '../constants/Game';
import type { Level } from '../types/Level';
import type { ScoreResult } from '../types/GameState';

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
        fontSize: '72px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(60);

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
    this.hud.updatePuzzleNumber(DailySystem.getPuzzleNumber());

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
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
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

    const hint = this.add
      .text(cx, cy + 50, 'Klicke in die gruene Zone', {
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
      targets: hint,
      alpha: 1,
      delay: 400,
      duration: 300,
    });

    // Fade out after 1.5s
    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: [overlay, levelName, diffText, hint],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          overlay.destroy();
          levelName.destroy();
          diffText.destroy();
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

    const elapsed = Date.now() - this.simulationStartTime;
    const chain = this.chainDetector.getChainLength();
    this.hud.updateChain(chain);

    // Big center chain counter during simulation
    if (chain >= 3 && this.chainDisplay) {
      this.chainDisplay.setText(`${chain}`);
      if (this.chainDisplay.alpha === 0) {
        this.tweens.add({
          targets: this.chainDisplay,
          alpha: 0.15,
          duration: 200,
        });
      }
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
    const gfx = this.add.graphics().setDepth(0).setAlpha(0.06);
    gfx.lineStyle(1, 0x4444aa);

    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      gfx.moveTo(x, 0);
      gfx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 40) {
      gfx.moveTo(0, y);
      gfx.lineTo(GAME_WIDTH, y);
    }
    gfx.strokePath();
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

    // Placement zone
    const zone = this.level.placementZone;
    this.placementZoneRect = this.add
      .rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height,
        0x44ff44,
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
      .setStrokeStyle(2, 0x44ff44, 0.5)
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

    // Preview ghost
    const firstAllowed = this.level.placementZone.allowedObjects[0];
    const ghostColor = firstAllowed === 'ball' ? 0xaaaaee : 0xccaa55;
    this.previewGhost = this.add
      .circle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        12,
        ghostColor,
        0.4
      )
      .setDepth(20);

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

  private setupInput(): void {
    // Keyboard: ESC returns to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      const returnScene = this.isPractice ? 'PracticeScene' : 'MenuScene';
      this.cameras.main.fadeOut(200, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(returnScene);
      });
    });

    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || this.introActive || !this.previewGhost) return;

      if (this.isInZone(ptr.x, ptr.y)) {
        this.previewGhost.setPosition(ptr.x, ptr.y);
        this.previewGhost.setVisible(true);
      } else {
        this.previewGhost.setVisible(false);
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || this.introActive) return;
      if (this.attempts >= MAX_ATTEMPTS) return;
      if (!this.isInZone(ptr.x, ptr.y)) return;

      this.placeAndSimulate(ptr.x, ptr.y);
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

          // Screen shake proportional to impact
          if (impactSpeed > 3) {
            this.cameraFX.addTrauma(Math.min(0.3, impactSpeed * 0.04));
          }

          // Squash & stretch on both bodies' sprites
          this.squashBody(bodyA);
          this.squashBody(bodyB);

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
        this.hud.updateScore(this.targetsHit);

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
            fontSize: '22px',
            color: '#ffdd00',
            fontStyle: 'bold',
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

    // Place the player's object — with distinct glow
    AudioManager.playPlace();
    const objectType = this.level.placementZone.allowedObjects[0];
    this.placedSprite = this.physicsManager.createPlayerObject(objectType, x, y);

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

    // Flash + micro shake on placement
    this.cameras.main.flash(80, 100, 100, 180);
    this.cameraFX.addTrauma(0.1);

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
  }

  private endSimulation(): void {
    this.isSimulating = false;

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
    }

    const allTargetsHit = this.targetsHit >= this.level.targets.length;

    if (this.attempts >= MAX_ATTEMPTS || allTargetsHit) {
      if (this.totalTargetsHitBest > 0) {
        AudioManager.playSuccess();
      } else {
        AudioManager.playFail();
      }

      this.time.delayedCall(600, () => {
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
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setAlpha(0)
        .setScale(0.5);

      const subText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35, this.targetsHit > 0
          ? `${this.targetsHit} Stern${this.targetsHit > 1 ? 'e' : ''} getroffen!`
          : 'Versuche es nochmal!', {
          fontSize: '14px',
          color: this.targetsHit > 0 ? '#ffdd44' : '#aa6666',
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
              fontSize: '16px',
              color: '#ff6644',
              fontStyle: 'bold',
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
  }
}
