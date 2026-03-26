import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { HowToScene } from './scenes/HowToScene';
import { PracticeScene } from './scenes/PracticeScene';
import { StatsScene } from './scenes/StatsScene';
import { GAME_WIDTH, GAME_HEIGHT, BG_COLOR } from './constants/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: BG_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1.0 },
      enableSleeping: true,
      debug: false,
      positionIterations: 6,
      velocityIterations: 4,
    },
  },
  scene: [BootScene, MenuScene, HowToScene, PracticeScene, StatsScene, GameScene, ResultScene],
};

new Phaser.Game(config);
