import type { Level } from '../types/Level';
import { DailySystem } from '../systems/DailySystem';
import { LEVEL_TEMPLATES as BATCH_1 } from './LevelTemplates';
import { LEVEL_TEMPLATES_2 as BATCH_2 } from './LevelTemplates2';
import { LEVEL_TEMPLATES_3 as BATCH_3 } from './LevelTemplates3';
import { LEVEL_TEMPLATES_4 as BATCH_4 } from './LevelTemplates4';
import { LEVEL_TEMPLATES_5 as BATCH_5 } from './LevelTemplates5';
import { LEVEL_TEMPLATES_6 as BATCH_6 } from './LevelTemplates6';
import { LEVEL_TEMPLATES_7 as BATCH_7 } from './LevelTemplates7';

const LEVEL_TEMPLATES = [...BATCH_1, ...BATCH_2, ...BATCH_3, ...BATCH_4, ...BATCH_5, ...BATCH_6, ...BATCH_7];

/** Loads and prepares levels with seed-based variations. */
export class LevelLoader {
  /** Load today's level using the daily seed. Override with ?level=N URL param. */
  static loadToday(): Level {
    // Debug/challenge: ?level=5 or ?challenge=5 loads template index directly
    const params = new URLSearchParams(window.location.search);
    const overrideLevel = params.get('level') ?? params.get('challenge');
    if (overrideLevel !== null) {
      const idx = Math.max(0, Math.min(parseInt(overrideLevel, 10), LEVEL_TEMPLATES.length - 1));
      return { ...LEVEL_TEMPLATES[idx] };
    }

    const seed = DailySystem.getTodaysSeed();
    const [minDiff, maxDiff] = DailySystem.getDailyDifficultyRange();

    // Filter levels by today's difficulty range
    const eligible = LEVEL_TEMPLATES.filter(
      (t) => t.difficulty >= minDiff && t.difficulty <= maxDiff
    );

    // Fallback to all levels if no match (shouldn't happen with 180 levels)
    const pool = eligible.length > 0 ? eligible : LEVEL_TEMPLATES;
    let index = DailySystem.getLevelIndex(seed, pool.length);

    // Prevent same level two days in a row
    if (pool.length > 1) {
      const yesterdaySeed = seed - 1;
      const yesterdayIndex = DailySystem.getLevelIndex(yesterdaySeed, pool.length);
      if (index === yesterdayIndex) {
        index = (index + 1) % pool.length;
      }
    }

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
