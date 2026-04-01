import { describe, it, expect } from 'vitest';
import { validateLevel, validateAllLevels } from './LevelValidator';
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

describe('Level Validator', () => {
  const results = validateAllLevels(ALL_LEVELS);

  it('should validate all 225 levels without errors', () => {
    const withErrors = results.filter(r => !r.valid);
    if (withErrors.length > 0) {
      const report = withErrors.map(r => {
        const errors = r.issues.filter(i => i.severity === 'error').map(i => `    - ${i.message}`).join('\n');
        return `  ${r.levelId} (${r.levelName}):\n${errors}`;
      }).join('\n');
      console.error(`\nLevels with errors (${withErrors.length}):\n${report}\n`);
    }
    expect(withErrors.length).toBe(0);
  });

  it('should report warnings for review', () => {
    const allWarnings: string[] = [];
    for (const result of results) {
      const warnings = result.issues.filter(i => i.severity === 'warning');
      for (const w of warnings) {
        allWarnings.push(`${result.levelId}: ${w.message}`);
      }
    }
    if (allWarnings.length > 0) {
      console.warn(`\nWarnings (${allWarnings.length}):\n  ${allWarnings.join('\n  ')}\n`);
    }
    // Warnings are informational — don't fail the test
    expect(true).toBe(true);
  });

  it('should validate constraint references are valid', () => {
    const constraintErrors: string[] = [];
    for (const result of results) {
      const cErrors = result.issues.filter(i =>
        i.severity === 'error' && i.message.includes('Constraint')
      );
      for (const e of cErrors) {
        constraintErrors.push(`${result.levelId}: ${e.message}`);
      }
    }
    expect(constraintErrors).toEqual([]);
  });

  it('should validate portal configurations', () => {
    const portalErrors: string[] = [];
    for (const result of results) {
      const pErrors = result.issues.filter(i =>
        i.severity === 'error' && i.message.includes('Portal')
      );
      for (const e of pErrors) {
        portalErrors.push(`${result.levelId}: ${e.message}`);
      }
    }
    expect(portalErrors).toEqual([]);
  });

  it('should have no targets inside the floor', () => {
    const floorTargets = results.flatMap(r =>
      r.issues.filter(i => i.message.includes('inside/below floor'))
        .map(i => `${r.levelId}: ${i.message}`)
    );
    expect(floorTargets).toEqual([]);
  });
});

describe('Level Validator — Individual', () => {
  it('should validate template_001 without errors', () => {
    const level = ALL_LEVELS.find(l => l.id === 'template_001')!;
    const result = validateLevel(level);
    expect(result.valid).toBe(true);
  });

  it('should detect invalid level data', () => {
    const badLevel: Level = {
      id: 'bad_test', name: 'Bad Level', difficulty: 6,
      theme: 'wood', world: { width: 800, height: 600 },
      placementZone: { x: 0, y: 0, width: 10, height: 10, allowedObjects: [] },
      staticObjects: [],
      dynamicObjects: [{ id: 'd1', type: 'ball', x: 900, y: 100 }],
      targets: [],
    };
    const result = validateLevel(badLevel);
    expect(result.valid).toBe(false);
    expect(result.issues.filter(i => i.severity === 'error').length).toBeGreaterThanOrEqual(3);
  });
});
