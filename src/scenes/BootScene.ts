import Phaser from 'phaser';

/** Preloads all assets and shows a loading bar. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingBar();

    // Placeholder colored rectangles until Kenney assets are downloaded
    this.createPlaceholderTextures();
  }

  create(): void {
    this.scene.start('MenuScene');
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const barBg = this.add.rectangle(width / 2, height / 2, 320, 20, 0x222244);
    barBg.setStrokeStyle(2, 0x4444aa);

    const bar = this.add.rectangle(
      width / 2 - 155,
      height / 2,
      0,
      16,
      0x6666ff
    );
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 310 * value;
    });
  }

  /** Generate colored shape textures as placeholders. */
  private createPlaceholderTextures(): void {
    // Ball - grey circle
    const ballGfx = this.make.graphics({ x: 0, y: 0 });
    ballGfx.fillStyle(0xaaaaaa);
    ballGfx.fillCircle(12, 12, 12);
    ballGfx.generateTexture('ball', 24, 24);
    ballGfx.destroy();

    // Domino - brown rectangle
    const dominoGfx = this.make.graphics({ x: 0, y: 0 });
    dominoGfx.fillStyle(0x8b6914);
    dominoGfx.fillRect(0, 0, 12, 48);
    dominoGfx.generateTexture('domino', 12, 48);
    dominoGfx.destroy();

    // Crate - tan rectangle
    const crateGfx = this.make.graphics({ x: 0, y: 0 });
    crateGfx.fillStyle(0xc4a35a);
    crateGfx.fillRect(0, 0, 40, 40);
    crateGfx.lineStyle(2, 0x8b6914);
    crateGfx.strokeRect(0, 0, 40, 40);
    crateGfx.generateTexture('crate', 40, 40);
    crateGfx.destroy();

    // Weight - dark circle
    const weightGfx = this.make.graphics({ x: 0, y: 0 });
    weightGfx.fillStyle(0x555555);
    weightGfx.fillCircle(16, 16, 16);
    weightGfx.generateTexture('weight', 32, 32);
    weightGfx.destroy();

    // Star target - yellow
    const starGfx = this.make.graphics({ x: 0, y: 0 });
    starGfx.fillStyle(0xffdd00);
    starGfx.fillCircle(10, 10, 10);
    starGfx.generateTexture('star', 20, 20);
    starGfx.destroy();

    // Platform - grey
    const platGfx = this.make.graphics({ x: 0, y: 0 });
    platGfx.fillStyle(0x666666);
    platGfx.fillRect(0, 0, 4, 4);
    platGfx.generateTexture('platform', 4, 4);
    platGfx.destroy();

    // Ramp - darker grey
    const rampGfx = this.make.graphics({ x: 0, y: 0 });
    rampGfx.fillStyle(0x555555);
    rampGfx.fillRect(0, 0, 4, 4);
    rampGfx.generateTexture('ramp', 4, 4);
    rampGfx.destroy();
  }
}
