import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from './StorageManager';
import { STORAGE_KEY } from '../constants/Game';

// Mock localStorage for Node environment
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
  get length() { return storage.size; },
  key: vi.fn((i: number) => [...storage.keys()][i] ?? null),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('StorageManager', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it('returns defaults when no data stored', () => {
    const data = StorageManager.load();
    expect(data.streak).toBe(0);
    expect(data.gamesPlayed).toBe(0);
    expect(data.bestScore).toBe(0);
    expect(data.totalScore).toBe(0);
  });

  it('saves and loads data', () => {
    StorageManager.save({ streak: 5, bestScore: 1000 });
    const data = StorageManager.load();
    expect(data.streak).toBe(5);
    expect(data.bestScore).toBe(1000);
  });

  it('getStreak returns current streak', () => {
    StorageManager.save({ streak: 3 });
    expect(StorageManager.getStreak()).toBe(3);
  });

  it('getJokers returns 0 when not set', () => {
    expect(StorageManager.getJokers()).toBe(0);
  });

  it('getJokers returns stored value', () => {
    StorageManager.save({ jokers: 2 });
    expect(StorageManager.getJokers()).toBe(2);
  });

  describe('syncServerStreak', () => {
    it('updates streak when server value differs', () => {
      StorageManager.save({ streak: 3 });
      StorageManager.syncServerStreak(7);
      expect(StorageManager.getStreak()).toBe(7);
    });

    it('does not write when values match', () => {
      StorageManager.save({ streak: 5 });
      vi.clearAllMocks();
      StorageManager.syncServerStreak(5);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('can reset streak to 0', () => {
      StorageManager.save({ streak: 10 });
      StorageManager.syncServerStreak(0);
      expect(StorageManager.getStreak()).toBe(0);
    });
  });

  describe('recordPuzzle', () => {
    it('starts streak at 1 on first play', () => {
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(1);
    });

    it('increments streak for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];

      StorageManager.save({ streak: 3, lastPlayedDate: yesterdayISO });
      StorageManager.recordPuzzle(2, {
        score: 400, attempts: 2, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(4);
    });

    it('allows 1-day grace period (2-day gap)', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoISO = twoDaysAgo.toISOString().split('T')[0];

      StorageManager.save({ streak: 5, lastPlayedDate: twoDaysAgoISO });
      StorageManager.recordPuzzle(3, {
        score: 300, attempts: 1, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(6);
    });

    it('resets streak after 3+ day gap without joker', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      const fourDaysAgoISO = fourDaysAgo.toISOString().split('T')[0];

      StorageManager.save({ streak: 10, lastPlayedDate: fourDaysAgoISO, jokers: 0 });
      StorageManager.recordPuzzle(4, {
        score: 200, attempts: 3, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(1);
    });

    it('uses joker to save streak after 3+ day gap', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      const fourDaysAgoISO = fourDaysAgo.toISOString().split('T')[0];

      StorageManager.save({ streak: 10, lastPlayedDate: fourDaysAgoISO, jokers: 2 });
      StorageManager.recordPuzzle(5, {
        score: 600, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(11);
      expect(StorageManager.getJokers()).toBe(1);
    });

    it('awards joker at 7-day streak milestone', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];

      StorageManager.save({ streak: 6, lastPlayedDate: yesterdayISO, jokers: 0 });
      StorageManager.recordPuzzle(6, {
        score: 800, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(7);
      expect(StorageManager.getJokers()).toBe(1);
    });

    it('caps jokers at 3', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];

      StorageManager.save({ streak: 13, lastPlayedDate: yesterdayISO, jokers: 3 });
      StorageManager.recordPuzzle(7, {
        score: 900, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.getStreak()).toBe(14);
      expect(StorageManager.getJokers()).toBe(3);
    });

    it('does not change streak on same-day replay', () => {
      const todayISO = new Date().toISOString().split('T')[0];
      StorageManager.save({ streak: 5, lastPlayedDate: todayISO });
      StorageManager.recordPuzzle(8, {
        score: 100, attempts: 3, solved: false,
        date: todayISO,
      });
      expect(StorageManager.getStreak()).toBe(5);
    });

    it('tracks best score', () => {
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().bestScore).toBe(500);
    });

    it('increments gamesPlayed', () => {
      StorageManager.recordPuzzle(1, {
        score: 100, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(2, {
        score: 200, attempts: 2, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().gamesPlayed).toBe(2);
    });

    it('accumulates totalScore', () => {
      StorageManager.recordPuzzle(1, {
        score: 300, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(2, {
        score: 400, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().totalScore).toBe(700);
    });

    it('keeps best puzzle score in history', () => {
      StorageManager.recordPuzzle(1, {
        score: 300, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 2, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().puzzleHistory[1].score).toBe(500);
    });

    it('does not overwrite better existing puzzle score', () => {
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(1, {
        score: 200, attempts: 3, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().puzzleHistory[1].score).toBe(500);
    });

    it('does not inflate gamesPlayed on same-puzzle replay', () => {
      StorageManager.recordPuzzle(1, {
        score: 300, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(1, {
        score: 200, attempts: 2, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().gamesPlayed).toBe(1);
    });

    it('does not inflate totalScore on same-puzzle lower score', () => {
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(1, {
        score: 200, attempts: 2, solved: false,
        date: new Date().toISOString().split('T')[0],
      });
      expect(StorageManager.load().totalScore).toBe(500);
    });

    it('adjusts totalScore correctly when improving a puzzle score', () => {
      StorageManager.recordPuzzle(1, {
        score: 300, attempts: 2, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      StorageManager.recordPuzzle(1, {
        score: 500, attempts: 1, solved: true,
        date: new Date().toISOString().split('T')[0],
      });
      // totalScore should be 500 (not 300+500=800)
      expect(StorageManager.load().totalScore).toBe(500);
      expect(StorageManager.load().gamesPlayed).toBe(1);
    });

    it('handles localStorage.setItem throwing gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      // Should not throw
      expect(() => {
        StorageManager.save({ streak: 5 });
      }).not.toThrow();
    });
  });
});
