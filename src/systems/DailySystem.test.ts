import { describe, it, expect } from 'vitest';
import { DailySystem } from './DailySystem';

describe('DailySystem', () => {
  it('returns a numeric seed', () => {
    const seed = DailySystem.getTodaysSeed();
    expect(typeof seed).toBe('number');
    expect(seed).toBeGreaterThan(0);
  });

  it('returns deterministic level index for same seed', () => {
    const seed = 20000;
    const idx1 = DailySystem.getLevelIndex(seed, 10);
    const idx2 = DailySystem.getLevelIndex(seed, 10);
    expect(idx1).toBe(idx2);
  });

  it('returns index within valid range', () => {
    for (let seed = 0; seed < 100; seed++) {
      const idx = DailySystem.getLevelIndex(seed, 10);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(10);
    }
  });

  it('distributes levels across templates', () => {
    const indices = new Set<number>();
    for (let seed = 0; seed < 1000; seed++) {
      indices.add(DailySystem.getLevelIndex(seed, 10));
    }
    // Should hit most of the 10 templates over 1000 seeds
    expect(indices.size).toBeGreaterThanOrEqual(8);
  });

  it('returns positive puzzle number', () => {
    const num = DailySystem.getPuzzleNumber();
    expect(typeof num).toBe('number');
    expect(num).toBeGreaterThan(0);
  });

  it('pre-launch puzzle numbers do not collide with post-launch numbers', () => {
    // Pre-launch numbers should be in 10000+ range (offset)
    // Post-launch numbers should be 1, 2, 3, ...
    // Current date (April 2026) is before launch (August 2026)
    const num = DailySystem.getPuzzleNumber();
    // Pre-launch: 10000 + negative daysSinceLaunch → large positive number
    expect(num).toBeGreaterThan(9000);
  });

  it('returns positive time until reset', () => {
    const ms = DailySystem.getTimeUntilReset();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(86400000);
  });

  it('formats countdown correctly', () => {
    expect(DailySystem.formatCountdown(3661000)).toBe('01:01:01');
    expect(DailySystem.formatCountdown(0)).toBe('00:00:00');
    expect(DailySystem.formatCountdown(86400000)).toBe('24:00:00');
  });

  it('returns valid difficulty range for all days', () => {
    const range = DailySystem.getDailyDifficultyRange();
    expect(range).toHaveLength(2);
    expect(range[0]).toBeGreaterThanOrEqual(1);
    expect(range[1]).toBeLessThanOrEqual(5);
    expect(range[0]).toBeLessThanOrEqual(range[1]);
  });
});
