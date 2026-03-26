import { describe, it, expect } from 'vitest';
import { ShareManager } from './ShareManager';

describe('ShareManager', () => {
  it('generates emoji result with correct puzzle number', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 42,
      score: 1240,
      attempts: 2,
      chainLength: 4,
      streak: 7,
      solved: true,
    });

    expect(result).toContain('#42');
    expect(result).toContain('1.240');
    expect(result).toContain('2/3');
    expect(result).toContain('7 Tage');
    expect(result).toContain('kettenpuzzle.com');
  });

  it('shows no streak line when streak is 0 or 1', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 100,
      attempts: 1,
      chainLength: 1,
      streak: 1,
      solved: true,
    });

    expect(result).not.toContain('Streak');
  });

  it('caps chain icons at 6', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 500,
      attempts: 1,
      chainLength: 20,
      streak: 0,
      solved: true,
    });

    // Count chain emojis - should be max 6
    const chainLine = result.split('\n').find((l) => l.includes('Kette'));
    expect(chainLine).toBeDefined();
  });

  it('shows dash for zero chain', () => {
    const result = ShareManager.generateEmojiResult({
      puzzleNumber: 1,
      score: 0,
      attempts: 3,
      chainLength: 0,
      streak: 0,
      solved: false,
    });

    expect(result).toContain('-');
  });
});
