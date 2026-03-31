import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';

type WipeDirection = 'left' | 'right' | 'down' | 'up';

/** Reusable wipe transitions between scenes. */
export class SceneTransition {
  /** Wipe out: cover screen with a sliding rectangle, then start the next scene. */
  static wipeOut(
    scene: Phaser.Scene,
    targetScene: string,
    data?: object,
    direction: WipeDirection = 'right',
    duration = 400,
  ): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    let startX = w / 2;
    let startY = h / 2;

    if (direction === 'right') startX = -w;
    else if (direction === 'left') startX = w * 2;
    else if (direction === 'down') startY = -h;
    else if (direction === 'up') startY = h * 2;

    const rect = scene.add.rectangle(startX, startY, w, h, 0x1a1a2e)
      .setDepth(999).setOrigin(0.5);

    scene.tweens.add({
      targets: rect,
      x: w / 2,
      y: h / 2,
      duration,
      ease: 'Quad.easeInOut',
      onComplete: () => scene.scene.start(targetScene, data),
    });
  }

  /** Wipe in: uncover screen by sliding rectangle away. Call in create() of target scene. */
  static wipeIn(
    scene: Phaser.Scene,
    direction: WipeDirection = 'right',
    duration = 400,
  ): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const rect = scene.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e)
      .setDepth(999);

    let targetX = w / 2;
    let targetY = h / 2;

    if (direction === 'right') targetX = w * 2;
    else if (direction === 'left') targetX = -w;
    else if (direction === 'up') targetY = -h;
    else if (direction === 'down') targetY = h * 2;

    // Leading edge accent line
    const isHorizontal = direction === 'left' || direction === 'right';
    const edgeX = direction === 'left' ? 0 : direction === 'right' ? w : w / 2;
    const edgeY = direction === 'up' ? 0 : direction === 'down' ? h : h / 2;
    const edge = scene.add.rectangle(edgeX, edgeY,
      isHorizontal ? 3 : w, isHorizontal ? h : 3, 0x4488ff, 0.5)
      .setDepth(1000);

    scene.tweens.add({
      targets: rect,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Quad.easeInOut',
    });
    scene.tweens.add({
      targets: edge,
      alpha: 0,
      delay: duration * 0.3,
      duration: duration * 0.7,
      onComplete: () => { rect.destroy(); edge.destroy(); },
    });
  }
}
