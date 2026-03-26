import type { Level } from '../types/Level';
import { DailySystem } from '../systems/DailySystem';

// Inline level templates until we have the full asset pipeline
import { LEVEL_TEMPLATES } from './LevelTemplates';

/** Loads and prepares levels with seed-based variations. */
export class LevelLoader {
  /** Load today's level using the daily seed. */
  static loadToday(): Level {
    const seed = DailySystem.getTodaysSeed();
    const index = DailySystem.getLevelIndex(seed, LEVEL_TEMPLATES.length);
    const template = LEVEL_TEMPLATES[index];
    return LevelLoader.applyVariations(template, seed);
  }

  /** Apply seed-based variations to a level template. */
  private static applyVariations(template: Level, seed: number): Level {
    if (!template.seed_variations) return { ...template };

    const level = JSON.parse(JSON.stringify(template)) as Level;

    for (const [key, range] of Object.entries(template.seed_variations)) {
      const hash = Math.sin(seed * 7919 + key.length * 104729) * 233280;
      const t = hash - Math.floor(hash); // 0..1
      const offset = range.min + t * (range.max - range.min);

      // Apply offset to matching dynamic object positions
      if (key.includes('_x_offset')) {
        for (const obj of level.dynamicObjects) {
          obj.x += offset;
        }
      } else if (key.includes('_angle_offset')) {
        for (const obj of level.staticObjects) {
          if (obj.angle !== undefined) {
            obj.angle += offset;
          }
        }
      }
    }

    return level;
  }
}
