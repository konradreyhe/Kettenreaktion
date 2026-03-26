import Phaser from 'phaser';
import { PhysicsManager } from '../game/PhysicsManager';
import { ChainDetector } from '../game/ChainDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { LevelLoader } from '../game/LevelLoader';
import { DailySystem } from '../systems/DailySystem';
import { HUD } from '../ui/HUD';
import {
  MAX_ATTEMPTS,
  MAX_SIMULATION_MS,
  NEAR_MISS_PX,
} from '../constants/Game';
import type { Level } from '../types/Level';
import type { ScoreResult } from '../types/GameState';

interface TargetEntry {
  id: string;
  sprite: Phaser.GameObjects.Arc;
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
  private hud!: HUD;

  private attempts = 0;
  private isSimulating = false;
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.attempts = 0;
    this.bestScore = null;
    this.bestChainLength = 0;
    this.totalTargetsHitBest = 0;

    this.physicsManager = new PhysicsManager(this);
    this.chainDetector = new ChainDetector();
    this.hud = new HUD(this);

    this.level = LevelLoader.loadToday();

    // Create particle texture
    this.createParticleTexture();

    this.setupLevel();
    this.setupInput();
    this.setupCollisionListener();

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
    this.hud.updatePuzzleNumber(DailySystem.getPuzzleNumber());

    // Fade in
    this.cameras.main.fadeIn(300, 26, 26, 46);
  }

  update(): void {
    if (!this.isSimulating) return;

    const elapsed = Date.now() - this.simulationStartTime;
    this.hud.updateChain(this.chainDetector.getChainLength());

    // Minimum 1.5s before checking sleep (let physics settle)
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

  private createParticleTexture(): void {
    if (this.textures.exists('particle')) return;
    const gfx = this.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('particle', 8, 8);
    gfx.destroy();
  }

  private setupLevel(): void {
    // Clean previous
    this.targets.forEach((t) => {
      t.sprite.destroy();
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
    this.hitEmitter = null;

    // Build physics world
    this.physicsManager.buildLevel(this.level);

    // Placement zone — pulsing glow
    const zone = this.level.placementZone;
    this.placementZoneRect = this.add
      .rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height,
        0x44ff44,
        0.08
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

    // Pulse animation on zone
    this.tweens.add({
      targets: this.placementZoneBorder,
      alpha: { from: 0.4, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Draw targets as glowing circles
    for (const target of this.level.targets) {
      const sprite = this.add
        .circle(target.x, target.y, 12, 0xffdd00, 1)
        .setDepth(15);

      // Glow pulse
      this.tweens.add({
        targets: sprite,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const body = this.matter.add.circle(target.x, target.y, 12, {
        isSensor: true,
        isStatic: true,
        label: `target_${target.id}`,
      });

      this.targets.push({
        id: target.id,
        sprite,
        body,
        hit: false,
        x: target.x,
        y: target.y,
        points: target.points,
      });
    }

    // Preview ghost
    const firstAllowed = this.level.placementZone.allowedObjects[0];
    const ghostColor = firstAllowed === 'ball' ? 0xaaaaaa : 0x8b6914;
    const ghostRadius = firstAllowed === 'ball' ? 12 : 10;
    this.previewGhost = this.add
      .circle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        ghostRadius,
        ghostColor,
        0.4
      )
      .setDepth(20);

    // Hit particle emitter
    this.hitEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 600,
      tint: [0xffdd00, 0xff8800, 0xffff44],
      emitting: false,
      quantity: 12,
    });
    this.hitEmitter.setDepth(50);

    this.isSimulating = false;
  }

  private setupInput(): void {
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || !this.previewGhost) return;

      const zone = this.level.placementZone;
      const inZone = this.isInZone(ptr.x, ptr.y);

      if (inZone) {
        this.previewGhost.setPosition(ptr.x, ptr.y);
        this.previewGhost.setVisible(true);
      } else {
        this.previewGhost.setVisible(false);
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating) return;
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
        this.chainDetector.onCollision([{ bodyA, bodyB }]);
      }
    );
  }

  private checkTargetHit(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
    for (const target of this.targets) {
      if (target.hit) continue;

      if (bodyA === target.body || bodyB === target.body) {
        target.hit = true;
        this.targetsHit++;
        this.hud.updateScore(this.targetsHit);

        // Particle burst
        this.hitEmitter?.emitParticleAt(target.x, target.y);

        // Target hit animation — flash and shrink
        this.tweens.killTweensOf(target.sprite);
        this.tweens.add({
          targets: target.sprite,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 400,
          ease: 'Power2',
        });

        // Score popup
        const popup = this.add
          .text(target.x, target.y - 20, `+${target.points}`, {
            fontSize: '16px',
            color: '#ffdd00',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(50);

        this.tweens.add({
          targets: popup,
          y: target.y - 60,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
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
    this.placementZoneBorder?.setAlpha(0.15);
    this.placementZoneRect?.setAlpha(0.03);
    if (this.placementZoneBorder) {
      this.tweens.killTweensOf(this.placementZoneBorder);
    }

    // Place the object with a visual drop effect
    const objectType = this.level.placementZone.allowedObjects[0];
    this.placedSprite = this.physicsManager.createDynamicSprite(objectType, x, y);
    this.placedSprite.setDepth(15);

    // Brief flash on placement
    this.cameras.main.flash(100, 100, 100, 150);

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
  }

  private endSimulation(): void {
    this.isSimulating = false;

    const elapsed = (Date.now() - this.simulationStartTime) / 1000;
    const chainLength = this.chainDetector.getChainLength();

    // Check for near misses on unhit targets
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
      // Fade out then go to results
      this.cameras.main.fadeOut(400, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ResultScene', {
          score: this.bestScore!,
          chainLength: this.bestChainLength,
          attempts: this.attempts,
          solved: this.totalTargetsHitBest > 0,
          targetsHit: this.totalTargetsHitBest,
          totalTargets: this.level.targets.length,
        });
      });
    } else {
      // Flash "Versuch X/3" and reset
      const retryText = this.add
        .text(400, 300, `Versuch ${this.attempts}/${MAX_ATTEMPTS}`, {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setAlpha(0);

      this.tweens.add({
        targets: retryText,
        alpha: 1,
        duration: 300,
        hold: 800,
        yoyo: true,
        onComplete: () => {
          retryText.destroy();
          this.setupLevel();
          this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
        },
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

        if (dist < NEAR_MISS_PX + 12) {
          // Show "Knapp!" near-miss
          const nearMiss = this.add
            .text(target.x, target.y - 30, 'Knapp!', {
              fontSize: '14px',
              color: '#ff6644',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setDepth(50);

          this.tweens.add({
            targets: nearMiss,
            y: target.y - 60,
            alpha: 0,
            duration: 1200,
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
  }
}
