import Phaser from 'phaser';
import { FONT_UI } from '../constants/Style';
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
  delay?: number;
  onClick: () => void;
}

/** Standardized button with rounded appearance, hover/press states, and audio. */
export class Button {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private border: Phaser.GameObjects.Rectangle;
  private glowLine: Phaser.GameObjects.Rectangle;

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
      delay = 0,
      onClick,
    } = config;

    const borderColor = this.lighten(color);

    // Border (fake rounded corners via slightly larger rect)
    this.border = scene.add
      .rectangle(x, y, width + 2, height + 2, 0x000000, 0)
      .setStrokeStyle(2, borderColor)
      .setDepth(depth);

    // Background
    this.bg = scene.add
      .rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);

    // Label
    this.label = scene.add
      .text(x, y, text, {
        fontFamily: FONT_UI,
        fontSize,
        color: textColor,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);

    // Glow line (thin highlight at bottom, hidden by default)
    this.glowLine = scene.add
      .rectangle(x, y + height / 2 - 1, width, 2, borderColor, 0)
      .setDepth(depth + 1);

    // Entrance animation: start hidden and offset, tween in
    const entranceTargets = [this.bg, this.border, this.label, this.glowLine];
    for (const target of entranceTargets) {
      target.setAlpha(0);
      target.setY(target.y + 8);
    }

    scene.tweens.add({
      targets: entranceTargets,
      alpha: { from: 0, to: 1 },
      y: `-=8`,
      duration: 250,
      delay,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Reset glow line alpha to 0 after entrance (it should be invisible until hover)
        this.glowLine.setAlpha(0);
      },
    });

    // Hover
    this.bg.on('pointerover', () => {
      AudioManager.playHover();
      this.bg.setFillStyle(hoverColor);
      scene.tweens.add({
        targets: [this.bg, this.border, this.label],
        scaleX: 1.04, scaleY: 1.04,
        duration: 80,
        ease: 'Quad.easeOut',
      });
      // Fade in glow line
      scene.tweens.add({
        targets: this.glowLine,
        alpha: 0.3,
        duration: 120,
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
      // Fade out glow line
      scene.tweens.add({
        targets: this.glowLine,
        alpha: 0,
        duration: 120,
        ease: 'Quad.easeIn',
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
    this.glowLine.setVisible(visible);
  }

  setText(text: string): void {
    this.label.setText(text);
  }
}
