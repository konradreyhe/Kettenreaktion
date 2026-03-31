/**
 * Weekly physics mutations — each day of the week has a unique physics twist.
 * Only applies to daily puzzles, not practice or zen mode.
 */

export interface PhysicsMutation {
  /** Display name shown in HUD banner */
  name: string;
  /** Short description for tooltip/help */
  description: string;
  /** Gravity multiplier (1 = normal, -1 = flipped, 0.3 = moon) */
  gravityScale: number;
  /** Global restitution multiplier (1 = normal, 2 = bouncy) */
  bounceMult: number;
  /** Global friction multiplier (1 = normal, 0 = ice) */
  frictionMult: number;
  /** Whether to mirror the level vertically */
  flipY: boolean;
  /** Emoji icon for the mutation badge */
  icon: string;
}

const NORMAL: PhysicsMutation = {
  name: '', description: '', gravityScale: 1, bounceMult: 1, frictionMult: 1, flipY: false, icon: '',
};

/** Day-of-week mutations (0=Sunday, 1=Monday, ... 6=Saturday) */
const MUTATIONS: Record<number, PhysicsMutation> = {
  0: { // Sunday — Moon Gravity
    name: 'Sonntags-Schwebe',
    description: 'Leichte Schwerkraft — alles schwebt!',
    gravityScale: 0.3,
    bounceMult: 1,
    frictionMult: 1,
    flipY: false,
    icon: '🌙',
  },
  1: { // Monday — Heavy
    name: 'Montags-Masse',
    description: 'Erhoehte Schwerkraft — alles ist schwerer!',
    gravityScale: 1.5,
    bounceMult: 1,
    frictionMult: 1,
    flipY: false,
    icon: '⚡',
  },
  2: { // Tuesday — Bouncy
    name: 'Gummi-Dienstag',
    description: 'Alles springt doppelt so hoch!',
    gravityScale: 1,
    bounceMult: 2.0,
    frictionMult: 1,
    flipY: false,
    icon: '🟡',
  },
  3: { // Wednesday — Mix
    name: 'Mittwochs-Mix',
    description: 'Etwas Bounce + wenig Reibung!',
    gravityScale: 1,
    bounceMult: 1.5,
    frictionMult: 0.3,
    flipY: false,
    icon: '🎲',
  },
  4: { // Thursday — Ice
    name: 'Eis-Donnerstag',
    description: 'Null Reibung — alles gleitet!',
    gravityScale: 1,
    bounceMult: 1,
    frictionMult: 0,
    flipY: false,
    icon: '🧊',
  },
  5: { // Friday — Gravity Flip
    name: 'Flip-Freitag',
    description: 'Die Schwerkraft ist umgekehrt!',
    gravityScale: -1,
    bounceMult: 1,
    frictionMult: 1,
    flipY: true,
    icon: '🔄',
  },
  6: { // Saturday — Chaos
    name: 'Samstags-Chaos',
    description: 'Wenig Schwerkraft + viel Bounce — Chaos!',
    gravityScale: 0.5,
    bounceMult: 1.8,
    frictionMult: 1,
    flipY: false,
    icon: '🎪',
  },
};

/** Get today's physics mutation (UTC day-of-week). */
export function getTodaysMutation(): PhysicsMutation {
  const day = new Date().getUTCDay();
  return MUTATIONS[day] ?? NORMAL;
}

/** Check if today has any mutation active. */
export function hasMutation(): boolean {
  const m = getTodaysMutation();
  return m.name !== '';
}

/** Get tomorrow's physics mutation (UTC day-of-week + 1). */
export function getTomorrowsMutation(): PhysicsMutation {
  const tomorrow = (new Date().getUTCDay() + 1) % 7;
  return MUTATIONS[tomorrow] ?? NORMAL;
}
