export interface PuzzleResult {
  score: number;
  attempts: number;
  solved: boolean;
  date: string;
}

export interface GameStorage {
  streak: number;
  lastPlayedDate: string;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  puzzleHistory: Record<number, PuzzleResult>;
}

export interface ScoreParams {
  targetsHit: number;
  totalTargets: number;
  chainLength: number;
  attempts: number;
  seconds: number;
}

export interface ScoreResult {
  total: number;
  baseScore: number;
  chainBonus: number;
  efficiencyBonus: number;
  timeBonus: number;
}
