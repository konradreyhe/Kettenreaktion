import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';

interface ButtonConfig {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  fontSize?: string;
  color?: number;
  hoverColor?: number;
  textColor?: string;
  depth?: number;
  onClick: () => void;
}

/** Standardized button with rounded appearance, hover/press states, and audio. */
export class Button {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private border: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    const {
      x, y, text,
      width = 200,
      height = 46,
      fontSize = '16px',
      color = 0x3355aa,
      hoverColor = 0x4466bb,
      textColor = '#ffffff',
      depth = 10,
      onClick,
    } = config;

    // Border (fake rounded corners via slightly larger rect)
    this.border = scene.add
      .rectangle(x, y, width + 2, height + 2, 0x000000, 0)
      .setStrokeStyle(2, this.lighten(color))
      .setDepth(depth);

    // Background
    this.bg = scene.add
      .rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);

    // Label
    this.label = scene.add
      .text(x, y, text, {
        fontSize,
        color: textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);

    // Hover
    this.bg.on('pointerover', () => {
      this.bg.setFillStyle(hoverColor);
      scene.tweens.add({
        targets: [this.bg, this.border, this.label],
        scaleX: 1.04, scaleY: 1.04,
        duration: 80,
        ease: 'Quad.easeOut',
      });
    });

    this.bg.on('pointerout', () => {
      this.bg.setFillStyle(color);
      scene.tweens.add({
        targets: [this.bg, this.border, this.label],
        scaleX: 1, scaleY: 1,
        duration: 80,
      });
    });

    // Press
    this.bg.on('pointerdown', () => {
      AudioManager.init();
      AudioManager.playClick();
      scene.tweens.add({
        targets: [this.bg, this.border, this.label],
        scaleX: 0.96, scaleY: 0.96,
        duration: 50,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  private lighten(color: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + 40);
    const g = Math.min(255, ((color >> 8) & 0xff) + 40);
    const b = Math.min(255, (color & 0xff) + 40);
    return (r << 16) | (g << 8) | b;
  }

  setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.label.setVisible(visible);
    this.border.setVisible(visible);
  }

  setText(text: string): void {
    this.label.setText(text);
  }
}
