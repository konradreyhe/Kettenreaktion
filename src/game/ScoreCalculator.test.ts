import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from './ScoreCalculator';

describe('ScoreCalculator', () => {
  it('calculates base score from targets hit', () => {
    const result = ScoreCalculator.calculate({
      targetsHit: 3,
      totalTargets: 3,
      chainLength: 0,
      attempts: 1,
      seconds: 5,
    });
    expect(result.baseScore).toBe(300);
  });

  it('calculates chain bonus', () => {
    const result = ScoreCalculator.calculate({
      targetsHit: 1,
      totalTargets: 1,
      chainLength: 5,
      attempts: 1,
      seconds: 5,
    });
    expect(result.chainBonus).toBe(250);
  });

  it('gives efficiency bonus for fewer attempts', () => {
    const oneAttempt = ScoreCalculator.calculate({
      targetsHit: 1, totalTargets: 1, chainLength: 0, attempts: 1, seconds: 5,
    });
    const threeAttempts = ScoreCalculator.calculate({
      targetsHit: 1, totalTargets: 1, chainLength: 0, attempts: 3, seconds: 5,
    });
    expect(oneAttempt.efficiencyBonus).toBe(400);
    expect(threeAttempts.efficiencyBonus).toBe(0);
  });

  it('gives time bonus for fast completion', () => {
    const fast = ScoreCalculator.calculate({
      targetsHit: 1, totalTargets: 1, chainLength: 0, attempts: 1, seconds: 3,
    });
    const slow = ScoreCalculator.calculate({
      targetsHit: 1, totalTargets: 1, chainLength: 0, attempts: 1, seconds: 30,
    });
    expect(fast.timeBonus).toBe(270);
    expect(slow.timeBonus).toBe(0);
  });

  it('returns zero base score for no targets hit', () => {
    const result = ScoreCalculator.calculate({
      targetsHit: 0, totalTargets: 3, chainLength: 0, attempts: 3, seconds: 8,
    });
    expect(result.baseScore).toBe(0);
    expect(result.chainBonus).toBe(0);
    expect(result.efficiencyBonus).toBe(0);
    // Time bonus still applies (reward for quick failure)
    expect(result.timeBonus).toBe(220);
  });

  it('total equals sum of all bonuses', () => {
    const result = ScoreCalculator.calculate({
      targetsHit: 2, totalTargets: 3, chainLength: 4, attempts: 2, seconds: 10,
    });
    expect(result.total).toBe(
      result.baseScore + result.chainBonus + result.efficiencyBonus + result.timeBonus
    );
  });

  it('handles max score scenario', () => {
    const result = ScoreCalculator.calculate({
      targetsHit: 3, totalTargets: 3, chainLength: 10, attempts: 1, seconds: 2,
    });
    expect(result.total).toBeGreaterThan(1000);
  });
});
