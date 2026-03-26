import type { Level } from '../types/Level';
import { DailySystem } from '../systems/DailySystem';
import { LEVEL_TEMPLATES as BATCH_1 } from './LevelTemplates';
import { LEVEL_TEMPLATES_2 as BATCH_2 } from './LevelTemplates2';
import { LEVEL_TEMPLATES_3 as BATCH_3 } from './LevelTemplates3';

const LEVEL_TEMPLATES = [...BATCH_1, ...BATCH_2, ...BATCH_3];

/** Loads and prepares levels with seed-based variations. */
export class LevelLoader {
  /** Load today's level using the daily seed. Override with ?level=N URL param. */
  static loadToday(): Level {
    // Debug: ?level=5 loads template index 5 directly
    const params = new URLSearchParams(window.location.search);
    const debugLevel = params.get('level');
    if (debugLevel !== null) {
      const idx = Math.max(0, Math.min(parseInt(debugLevel, 10), LEVEL_TEMPLATES.length - 1));
      return { ...LEVEL_TEMPLATES[idx] };
    }

    const seed = DailySystem.getTodaysSeed();
    const [minDiff, maxDiff] = DailySystem.getDailyDifficultyRange();

    // Filter levels by today's difficulty range
    const eligible = LEVEL_TEMPLATES.filter(
      (t) => t.difficulty >= minDiff && t.difficulty <= maxDiff
    );

    // Fallback to all levels if no match (shouldn't happen with 90 levels)
    const pool = eligible.length > 0 ? eligible : LEVEL_TEMPLATES;
    const index = DailySystem.getLevelIndex(seed, pool.length);
    const template = pool[index];
    return LevelLoader.applyVariations(template, seed);
  }

  /** Load a specific level by index (for testing). */
  static loadByIndex(index: number): Level {
    const clamped = Math.max(0, Math.min(index, LEVEL_TEMPLATES.length - 1));
    return { ...LEVEL_TEMPLATES[clamped] };
  }

  /** Load a level by its ID string. */
  static loadById(id: string): Level | null {
    const template = LEVEL_TEMPLATES.find((t) => t.id === id);
    return template ? { ...template } : null;
  }

  /** Get total number of level templates. */
  static getTemplateCount(): number {
    return LEVEL_TEMPLATES.length;
  }

  /** Apply seed-based variations to a level template. */
  private static applyVariations(template: Level, seed: number): Level {
    if (!template.seed_variations) return { ...template };

    const level = JSON.parse(JSON.stringify(template)) as Level;

    for (const [key, range] of Object.entries(template.seed_variations)) {
      const hash = Math.sin(seed * 7919 + key.length * 104729) * 233280;
      const t = hash - Math.floor(hash);
      const offset = range.min + t * (range.max - range.min);

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
