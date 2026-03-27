import { STORAGE_KEY } from '../constants/Game';
import type { GameStorage, PuzzleResult } from '../types/GameState';

const DEFAULTS: GameStorage = {
  streak: 0,
  lastPlayedDate: '',
  totalScore: 0,
  gamesPlayed: 0,
  bestScore: 0,
  puzzleHistory: {},
};

/** Handles all localStorage persistence. Single source of truth. */
export class StorageManager {
  static load(): GameStorage {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, puzzleHistory: {} };

    try {
      return JSON.parse(raw) as GameStorage;
    } catch {
      return { ...DEFAULTS, puzzleHistory: {} };
    }
  }

  static save(data: Partial<GameStorage>): void {
    const current = StorageManager.load();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  static getStreak(): number {
    return StorageManager.load().streak;
  }

  static recordPuzzle(puzzleNumber: number, result: PuzzleResult): void {
    const data = StorageManager.load();
    const todayISO = new Date().toISOString().split('T')[0];

    // Update streak
    if (data.lastPlayedDate) {
      const lastDate = new Date(data.lastPlayedDate);
      const today = new Date(todayISO);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / 86400000
      );

      if (diffDays === 1 || diffDays === 2) {
        // 1 day = consecutive, 2 days = 1-day grace period (streak freeze)
        data.streak += 1;
      } else if (diffDays > 2) {
        data.streak = 1;
      }
      // diffDays === 0: same day, streak unchanged
    } else {
      data.streak = 1;
    }

    // Update puzzle history (keep best score)
    const existing = data.puzzleHistory[puzzleNumber];
    if (!existing || result.score > existing.score) {
      data.puzzleHistory[puzzleNumber] = result;
    }

    data.lastPlayedDate = todayISO;
    data.gamesPlayed += 1;
    data.totalScore += result.score;

    if (result.score > data.bestScore) {
      data.bestScore = result.score;
    }

    StorageManager.save(data);
  }

  static hasPuzzleBeenPlayed(puzzleNumber: number): boolean {
    const data = StorageManager.load();
    return puzzleNumber in data.puzzleHistory;
  }

  static getPuzzleResult(puzzleNumber: number): PuzzleResult | null {
    const data = StorageManager.load();
    return data.puzzleHistory[puzzleNumber] ?? null;
  }

  /** Prune replay data from puzzles older than `keepDays` to save localStorage space. */
  static pruneOldReplays(keepDays: number = 7): void {
    const data = StorageManager.load();
    const now = new Date();
    let changed = false;

    for (const [numStr, result] of Object.entries(data.puzzleHistory)) {
      if (!result.replay) continue;

      const puzzleDate = new Date(result.date);
      const ageDays = (now.getTime() - puzzleDate.getTime()) / 86400000;
      if (ageDays > keepDays) {
        delete result.replay;
        delete result.placement;
        data.puzzleHistory[Number(numStr)] = result;
        changed = true;
      }
    }

    if (changed) {
      StorageManager.save(data);
    }
  }

  /** Get computed stats from puzzle history. */
  static getComputedStats(): {
    solveRate: number;
    avgScore: number;
    bestStreak: number;
    totalSolved: number;
  } {
    const data = StorageManager.load();
    const results = Object.values(data.puzzleHistory);

    if (results.length === 0) {
      return { solveRate: 0, avgScore: 0, bestStreak: 0, totalSolved: 0 };
    }

    const totalSolved = results.filter((r) => r.solved).length;
    const solveRate = Math.round((totalSolved / results.length) * 100);
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    );

    // Calculate best streak from sorted puzzle dates
    const sortedDates = results
      .map((r) => r.date)
      .filter(Boolean)
      .sort();

    let bestStreak = 0;
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (Math.round(diff) === 1) {
        currentStreak++;
      } else if (Math.round(diff) > 1) {
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    return { solveRate, avgScore, bestStreak, totalSolved };
  }
}
