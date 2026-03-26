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

      if (diffDays === 1) {
        data.streak += 1;
      } else if (diffDays > 1) {
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
}
