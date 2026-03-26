/** A single frame of replay data: array of [x, y, angle] per body. */
export type ReplayFrame = [number, number, number][];

export interface PuzzleResult {
  score: number;
  attempts: number;
  solved: boolean;
  date: string;
  /** Whether all attempts were used or puzzle was completed. */
  completed?: boolean;
  /** Replay data for the best attempt (body positions per frame). */
  replay?: ReplayFrame[];
  /** Object type and placement position for the best attempt. */
  placement?: { type: string; x: number; y: number };
  /** Level ID for loading the correct level during replay. */
  levelId?: string;
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
