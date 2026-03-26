import { LAUNCH_DATE } from '../constants/Game';

/** Deterministic daily puzzle selection — UTC-based, no randomness. */
export class DailySystem {
  /** Returns a seed integer based on today's UTC date. */
  static getTodaysSeed(): number {
    const now = new Date();
    const utcDate = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    return utcDate / 86400000;
  }

  /** Deterministically selects a level index from the seed. */
  static getLevelIndex(seed: number, totalLevels: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return Math.floor((x - Math.floor(x)) * totalLevels);
  }

  /** Returns the puzzle number (days since launch + 1). */
  static getPuzzleNumber(): number {
    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    return Math.floor((today - LAUNCH_DATE) / 86400000) + 1;
  }

  /** Returns milliseconds until next UTC midnight. */
  static getTimeUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1
      )
    );
    return tomorrow.getTime() - now.getTime();
  }

  /** Formats remaining time as "HH:MM:SS". */
  static formatCountdown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((v) => String(v).padStart(2, '0'))
      .join(':');
  }
}
