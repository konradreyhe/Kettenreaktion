import Phaser from 'phaser';
import { PhysicsManager } from '../game/PhysicsManager';
import { ChainDetector } from '../game/ChainDetector';
import { ScoreCalculator } from '../game/ScoreCalculator';
import { LevelLoader } from '../game/LevelLoader';
import { DailySystem } from '../systems/DailySystem';
import { HUD } from '../ui/HUD';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAX_ATTEMPTS,
  MAX_SIMULATION_MS,
} from '../constants/Game';
import type { Level } from '../types/Level';
import type { ScoreResult } from '../types/GameState';

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

  private previewGhost: Phaser.GameObjects.Sprite | null = null;
  private placementZoneRect: Phaser.GameObjects.Rectangle | null = null;
  private targetSprites: Phaser.GameObjects.Sprite[] = [];
  private targetBodies: MatterJS.BodyType[] = [];
  private targetsHit = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.attempts = 0;
    this.bestScore = null;
    this.bestChainLength = 0;

    this.physicsManager = new PhysicsManager(this);
    this.chainDetector = new ChainDetector();
    this.hud = new HUD(this);

    this.level = LevelLoader.loadToday();

    this.setupLevel();
    this.setupInput();
    this.setupCollisionListener();

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
    this.hud.updatePuzzleNumber(DailySystem.getPuzzleNumber());
  }

  update(): void {
    if (!this.isSimulating) return;

    const elapsed = Date.now() - this.simulationStartTime;
    this.hud.updateChain(this.chainDetector.getChainLength());

    // Check if all bodies are sleeping or timeout reached
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matterBodies = (this.matter.world.localWorld as any).bodies as MatterJS.BodyType[];
    const allSleeping = matterBodies.every(
      (b) => b.isStatic || b.isSleeping
    );

    if (allSleeping || elapsed >= MAX_SIMULATION_MS) {
      this.endSimulation();
    }
  }

  private setupLevel(): void {
    // Clean previous state
    this.targetSprites.forEach((s) => s.destroy());
    this.targetSprites = [];
    this.targetBodies = [];
    this.targetsHit = 0;
    this.chainDetector.reset();
    this.previewGhost?.destroy();
    this.previewGhost = null;
    this.placementZoneRect?.destroy();

    // Build physics
    this.physicsManager.buildLevel(this.level);

    // Draw placement zone
    const zone = this.level.placementZone;
    this.placementZoneRect = this.add
      .rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height
      )
      .setStrokeStyle(2, 0x44ff44, 0.6)
      .setFillStyle(0x44ff44, 0.1);

    // Draw targets
    for (const target of this.level.targets) {
      const sprite = this.add
        .sprite(target.x, target.y, target.type)
        .setDisplaySize(20, 20);
      this.targetSprites.push(sprite);

      const body = this.matter.add.circle(target.x, target.y, 10, {
        isSensor: true,
        isStatic: true,
        label: `target_${target.id}`,
      });
      this.targetBodies.push(body);
    }

    // Draw static and dynamic objects as sprites
    for (const obj of this.level.staticObjects) {
      const height = obj.height ?? 20;
      this.add
        .rectangle(
          obj.x + obj.width / 2,
          obj.y + height / 2,
          obj.width,
          height,
          0x666666
        )
        .setAngle(obj.angle ?? 0);
    }

    for (const obj of this.level.dynamicObjects) {
      const size = this.getDisplaySize(obj.type);
      this.add.sprite(obj.x, obj.y, obj.type).setDisplaySize(size.w, size.h);
    }

    // Create preview ghost
    const firstAllowed = this.level.placementZone.allowedObjects[0];
    this.previewGhost = this.add
      .sprite(zone.x + zone.width / 2, zone.y + zone.height / 2, firstAllowed)
      .setAlpha(0.5)
      .setDisplaySize(24, 24);

    this.isSimulating = false;
  }

  private setupInput(): void {
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.isSimulating || !this.previewGhost) return;

      const zone = this.level.placementZone;
      const clampedX = Phaser.Math.Clamp(ptr.x, zone.x, zone.x + zone.width);
      const clampedY = Phaser.Math.Clamp(ptr.y, zone.y, zone.y + zone.height);

      this.previewGhost.setPosition(clampedX, clampedY);
      this.previewGhost.setVisible(this.isInZone(ptr.x, ptr.y));
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

        // Check for target hits
        this.checkTargetHit(bodyA, bodyB);

        // Track chain
        this.chainDetector.onCollision([{ bodyA, bodyB }]);
      }
    );
  }

  private checkTargetHit(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
    for (let i = 0; i < this.targetBodies.length; i++) {
      const targetBody = this.targetBodies[i];
      if (bodyA === targetBody || bodyB === targetBody) {
        const sprite = this.targetSprites[i];
        if (sprite.alpha === 1) {
          sprite.setAlpha(0.3);
          this.targetsHit++;
          this.hud.updateScore(this.targetsHit);

          // Hit effect
          this.tweens.add({
            targets: sprite,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            yoyo: true,
          });
        }
      }
    }
  }

  private placeAndSimulate(x: number, y: number): void {
    this.attempts++;
    this.isSimulating = true;
    this.simulationStartTime = Date.now();

    this.previewGhost?.setVisible(false);
    this.placementZoneRect?.setAlpha(0.2);

    // Place the object
    const objectType = this.level.placementZone.allowedObjects[0];
    this.physicsManager.createDynamicBody(objectType, x, y);

    this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
  }

  private endSimulation(): void {
    this.isSimulating = false;

    const elapsed = (Date.now() - this.simulationStartTime) / 1000;
    const chainLength = this.chainDetector.getChainLength();

    const result = ScoreCalculator.calculate({
      targetsHit: this.targetsHit,
      totalTargets: this.level.targets.length,
      chainLength,
      attempts: this.attempts,
      seconds: elapsed,
    });

    // Track best
    if (!this.bestScore || result.total > this.bestScore.total) {
      this.bestScore = result;
      this.bestChainLength = chainLength;
    }

    const allTargetsHit = this.targetsHit >= this.level.targets.length;

    if (this.attempts >= MAX_ATTEMPTS || allTargetsHit) {
      // Go to result screen
      this.scene.start('ResultScene', {
        score: this.bestScore,
        chainLength: this.bestChainLength,
        attempts: this.attempts,
        solved: this.targetsHit > 0,
        targetsHit: this.targetsHit,
        totalTargets: this.level.targets.length,
      });
    } else {
      // Reset for next attempt
      this.setupLevel();
      this.hud.updateAttempts(this.attempts, MAX_ATTEMPTS);
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

  private getDisplaySize(type: string): { w: number; h: number } {
    switch (type) {
      case 'ball':
        return { w: 24, h: 24 };
      case 'domino':
        return { w: 12, h: 48 };
      case 'crate':
        return { w: 40, h: 40 };
      case 'weight':
        return { w: 32, h: 32 };
      default:
        return { w: 24, h: 24 };
    }
  }

  shutdown(): void {
    this.physicsManager.clearLevel();
  }
}
