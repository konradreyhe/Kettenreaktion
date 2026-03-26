import { describe, it, expect } from 'vitest';
import { ShareManager } from './ShareManager';

describe('ShareManager', () => {
  it('generates result with correct puzzle number', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 42,
      score: 1240,
      attempts: 2,
      chainLength: 4,
      streak: 7,
      solved: true,
      targetsHit: 2,
      totalTargets: 3,
    });

    expect(result).toContain('#42');
    expect(result).toContain('1.240');
    expect(result).toContain('7 Tage Streak');
    expect(result).toContain('konradreyhe.github.io/Kettenreaktion');
    expect(result).toContain('2/3');
  });

  it('shows no streak line when streak is 0 or 1', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 100,
      attempts: 1,
      chainLength: 1,
      streak: 1,
      solved: true,
      targetsHit: 1,
      totalTargets: 1,
    });

    expect(result).not.toContain('Streak');
  });

  it('shows target hit visualization', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 200,
      attempts: 1,
      chainLength: 3,
      streak: 0,
      solved: true,
      targetsHit: 2,
      totalTargets: 3,
    });

    expect(result).toContain('2/3');
  });

  it('shows attempt dots', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 0,
      attempts: 3,
      chainLength: 0,
      streak: 0,
      solved: false,
      targetsHit: 0,
      totalTargets: 1,
    });

    expect(result).toContain('Versuche:');
    expect(result).toContain('0/1');
  });
});
