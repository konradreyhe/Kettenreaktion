import {
  POINTS_PER_TARGET,
  POINTS_PER_CHAIN,
  POINTS_PER_SAVED_ATTEMPT,
  POINTS_PER_SECOND,
  TIME_LIMIT_SECONDS,
  MAX_ATTEMPTS,
} from '../constants/Game';
import type { ScoreParams, ScoreResult } from '../types/GameState';

/** Pure score calculation — no side effects. */
export class ScoreCalculator {
  /** Estimate a pseudo-percentile from score relative to theoretical max, adjusted by difficulty. */
  static estimatePercentile(score: number, totalTargets: number, difficulty: number): number {
    const maxScore = totalTargets * 100 + 15 * 50 + 2 * 200 + 25 * 10; // ~2,050 theoretical max
    const ratio = score / maxScore;
    const difficultyFactor = 0.3 + difficulty * 0.1; // 0.4 to 0.8
    return Math.min(99, Math.max(1, Math.round(ratio / difficultyFactor * 100)));
  }

  static calculate(params: ScoreParams): ScoreResult {
    const { targetsHit, chainLength, attempts, seconds } = params;

    const baseScore = targetsHit * POINTS_PER_TARGET;
    const chainBonus = chainLength * POINTS_PER_CHAIN;
    const efficiencyBonus =
      Math.max(0, MAX_ATTEMPTS - attempts) * POINTS_PER_SAVED_ATTEMPT;
    const timeBonus =
      Math.max(0, TIME_LIMIT_SECONDS - seconds) * POINTS_PER_SECOND;

    return {
      total: baseScore + chainBonus + efficiencyBonus + timeBonus,
      baseScore,
      chainBonus,
      efficiencyBonus,
      timeBonus,
    };
  }
}
