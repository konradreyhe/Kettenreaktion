import { describe, it, expect } from 'vitest';
import { LEVEL_TEMPLATES as BATCH_1 } from './LevelTemplates';
import { LEVEL_TEMPLATES_2 as BATCH_2 } from './LevelTemplates2';
import { LEVEL_TEMPLATES_3 as BATCH_3 } from './LevelTemplates3';
import { LEVEL_TEMPLATES_4 as BATCH_4 } from './LevelTemplates4';
import { LEVEL_TEMPLATES_5 as BATCH_5 } from './LevelTemplates5';
import { LEVEL_TEMPLATES_6 as BATCH_6 } from './LevelTemplates6';
import { LEVEL_TEMPLATES_7 as BATCH_7 } from './LevelTemplates7';
import { LEVEL_TEMPLATES_8 as BATCH_8 } from './LevelTemplates8';
import type { Level } from '../types/Level';

const ALL_LEVELS: Level[] = [...BATCH_1, ...BATCH_2, ...BATCH_3, ...BATCH_4, ...BATCH_5, ...BATCH_6, ...BATCH_7, ...BATCH_8];

describe('Level Templates', () => {
  it('should have exactly 222 levels', () => {
    expect(ALL_LEVELS.length).toBe(222);
  });

  it('should have unique IDs', () => {
    const ids = ALL_LEVELS.map((l) => l.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('should have unique names', () => {
    const names = ALL_LEVELS.map((l) => l.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('should cover all difficulty levels 1-5', () => {
    const diffs = new Set(ALL_LEVELS.map((l) => l.difficulty));
    expect(diffs).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('should have at least 10 levels per difficulty', () => {
    for (let d = 1; d <= 5; d++) {
      const count = ALL_LEVELS.filter((l) => l.difficulty === d).length;
      expect(count).toBeGreaterThanOrEqual(10);
    }
  });

  describe.each(ALL_LEVELS)('Level $id ($name)', (level) => {
    it('should have valid structure', () => {
      expect(level.id).toBeTruthy();
      expect(level.name).toBeTruthy();
      expect(level.difficulty).toBeGreaterThanOrEqual(1);
      expect(level.difficulty).toBeLessThanOrEqual(5);
      expect(['wood', 'stone', 'metal']).toContain(level.theme);
    });

    it('should have valid world dimensions', () => {
      expect(level.world.width).toBe(800);
      expect(level.world.height).toBe(600);
    });

    it('should have valid placement zone within world bounds', () => {
      const pz = level.placementZone;
      expect(pz.x).toBeGreaterThanOrEqual(0);
      expect(pz.y).toBeGreaterThanOrEqual(0);
      expect(pz.x + pz.width).toBeLessThanOrEqual(level.world.width);
      expect(pz.y + pz.height).toBeLessThanOrEqual(level.world.height);
      expect(pz.allowedObjects.length).toBeGreaterThanOrEqual(1);
    });

    it('should have at least one target', () => {
      expect(level.targets.length).toBeGreaterThanOrEqual(1);
    });

    it('should have targets with positive points', () => {
      for (const target of level.targets) {
        expect(target.points).toBeGreaterThan(0);
      }
    });

    it('should have all objects within world bounds', () => {
      for (const obj of level.staticObjects) {
        expect(obj.x).toBeGreaterThanOrEqual(0);
        expect(obj.y).toBeGreaterThanOrEqual(0);
      }
      for (const obj of level.dynamicObjects) {
        expect(obj.x).toBeGreaterThanOrEqual(0);
        expect(obj.y).toBeGreaterThanOrEqual(0);
        expect(obj.x).toBeLessThanOrEqual(level.world.width);
        expect(obj.y).toBeLessThanOrEqual(level.world.height);
      }
      for (const target of level.targets) {
        expect(target.x).toBeGreaterThanOrEqual(0);
        expect(target.y).toBeGreaterThanOrEqual(0);
        expect(target.x).toBeLessThanOrEqual(level.world.width);
        expect(target.y).toBeLessThanOrEqual(level.world.height);
      }
    });

    it('should have unique dynamic object IDs', () => {
      const ids = level.dynamicObjects.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have unique target IDs', () => {
      const ids = level.targets.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
