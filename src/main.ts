import { GAME_WIDTH, GAME_HEIGHT, BG_COLOR } from './constants/Game';

// Global error handlers — prevent silent crashes
window.addEventListener('error', (e) => {
  console.error('[KR] Unhandled error:', e.error ?? e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[KR] Unhandled promise rejection:', e.reason);
});

// Dynamically import Phaser and scenes to allow the HTML loading screen
// to paint before the heavy JS bundle blocks the main thread.
async function boot(): Promise<void> {
  const [
    { default: Phaser },
    { BootScene },
    { MenuScene },
    { GameScene },
    { ResultScene },
    { HowToScene },
    { PracticeScene },
    { StatsScene },
    { ReplayScene },
    { ZenScene },
    { EditorScene },
    { ButterflyScene },
  ] = await Promise.all([
    import('phaser'),
    import('./scenes/BootScene'),
    import('./scenes/MenuScene'),
    import('./scenes/GameScene'),
    import('./scenes/ResultScene'),
    import('./scenes/HowToScene'),
    import('./scenes/PracticeScene'),
    import('./scenes/StatsScene'),
    import('./scenes/ReplayScene'),
    import('./scenes/ZenScene'),
    import('./scenes/EditorScene'),
    import('./scenes/ButterflyScene'),
  ]);

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
    scene: [BootScene, MenuScene, HowToScene, PracticeScene, StatsScene, GameScene, ResultScene, ReplayScene, ButterflyScene, ZenScene, EditorScene],
  };

  const game = new Phaser.Game(config);

  // Hide HTML loading screen once Phaser canvas is ready
  game.events.once('ready', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.3s';
      setTimeout(() => loadingScreen.remove(), 300);
    }
  });

  // Expose for dev tools / automated testing
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
  }
}

boot();
