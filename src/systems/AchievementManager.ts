import { StorageManager } from './StorageManager';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Check function receives current game state and returns true if unlocked. */
  check: () => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  // Progression
  { id: 'first_solve', name: 'Erste Reaktion', description: 'Erstes Puzzle geloest', icon: '\u2B50',
    check: () => StorageManager.getComputedStats().totalSolved >= 1 },
  { id: 'five_games', name: 'Warm geworden', description: '5 Puzzles gespielt', icon: '\u{1F3AE}',
    check: () => StorageManager.load().gamesPlayed >= 5 },
  { id: 'twenty_five_games', name: 'Stammgast', description: '25 Puzzles gespielt', icon: '\u{1F3C6}',
    check: () => StorageManager.load().gamesPlayed >= 25 },
  { id: 'fifty_games', name: 'Veteran', description: '50 Puzzles gespielt', icon: '\u{1F396}',
    check: () => StorageManager.load().gamesPlayed >= 50 },
  { id: 'hundred_games', name: 'Legende', description: '100 Puzzles gespielt', icon: '\u{1F451}',
    check: () => StorageManager.load().gamesPlayed >= 100 },

  // Streaks
  { id: 'streak_3', name: 'Drei Tage', description: '3-Tage-Streak erreicht', icon: '\u{1F525}',
    check: () => StorageManager.getStreak() >= 3 },
  { id: 'streak_7', name: 'Wochenkrieger', description: '7-Tage-Streak erreicht', icon: '\u{1F4AA}',
    check: () => StorageManager.getStreak() >= 7 },
  { id: 'streak_14', name: 'Zweiwochenprofi', description: '14-Tage-Streak erreicht', icon: '\u26A1',
    check: () => StorageManager.getStreak() >= 14 },
  { id: 'streak_30', name: 'Monatschampion', description: '30-Tage-Streak erreicht', icon: '\u{1F48E}',
    check: () => StorageManager.getStreak() >= 30 },

  // Scores
  { id: 'score_500', name: 'Punktejaeger', description: '500+ Punkte in einem Puzzle', icon: '\u{1F4AF}',
    check: () => StorageManager.load().bestScore >= 500 },
  { id: 'score_800', name: 'Hochleistung', description: '800+ Punkte in einem Puzzle', icon: '\u{1F680}',
    check: () => StorageManager.load().bestScore >= 800 },
  { id: 'score_1000', name: 'Tausender', description: '1000+ Punkte in einem Puzzle', icon: '\u{1F31F}',
    check: () => StorageManager.load().bestScore >= 1000 },

  // Solve rate
  { id: 'rate_50', name: 'Halbzeit', description: '50% Loesungsrate', icon: '\u{1F4CA}',
    check: () => {
      const s = StorageManager.getComputedStats();
      return StorageManager.load().gamesPlayed >= 10 && s.solveRate >= 50;
    },
  },
  { id: 'rate_80', name: 'Perfektionist', description: '80% Loesungsrate (10+ Spiele)', icon: '\u{1F3AF}',
    check: () => {
      const s = StorageManager.getComputedStats();
      return StorageManager.load().gamesPlayed >= 10 && s.solveRate >= 80;
    },
  },

  // Special
  { id: 'first_attempt', name: 'Erster Versuch', description: 'Puzzle beim 1. Versuch geloest', icon: '\u{1F947}',
    check: () => {
      const history = StorageManager.load().puzzleHistory;
      return Object.values(history).some((r) => r.solved && r.attempts === 1);
    },
  },
  { id: 'total_5000', name: 'Punktesammler', description: '5.000 Gesamtpunkte', icon: '\u{1F4B0}',
    check: () => StorageManager.load().totalScore >= 5000 },
  { id: 'total_25000', name: 'Punktemagnat', description: '25.000 Gesamtpunkte', icon: '\u{1F3F0}',
    check: () => StorageManager.load().totalScore >= 25000 },
];

/** Manages achievement tracking, unlocking, and notification. */
export class AchievementManager {
  /** Check all achievements and return newly unlocked ones. */
  static checkAll(): Achievement[] {
    const data = StorageManager.load();
    const unlocked = data.achievements ?? {};
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlocked[achievement.id]) continue;

      try {
        if (achievement.check()) {
          unlocked[achievement.id] = new Date().toISOString().split('T')[0];
          newlyUnlocked.push(achievement);
        }
      } catch {
        // Skip failed checks
      }
    }

    if (newlyUnlocked.length > 0) {
      StorageManager.save({ achievements: unlocked });
    }

    return newlyUnlocked;
  }

  /** Get all achievements with unlock status. */
  static getAll(): (Achievement & { unlockedDate: string | null })[] {
    const unlocked = StorageManager.load().achievements ?? {};
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlockedDate: unlocked[a.id] ?? null,
    }));
  }

  /** Get total unlock count. */
  static getUnlockedCount(): number {
    const unlocked = StorageManager.load().achievements ?? {};
    return Object.keys(unlocked).length;
  }

  /** Get total achievement count. */
  static getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }
}
