/** Monthly themed events that modify visual style. */

interface GameEvent {
  id: string;
  name: string;
  /** Month (1-12). */
  month: number;
  theme: {
    bgColor: string;
    accentColor: string;
    particleTints: number[];
    bannerText: string;
  };
}

const EVENTS: GameEvent[] = [
  {
    id: 'fruehling', name: 'Fruehlingserwachen', month: 4,
    theme: {
      bgColor: '#0a1a14',
      accentColor: '#66cc88',
      particleTints: [0x88ff88, 0xffdd88, 0xff88cc, 0xffffff],
      bannerText: 'Fruehlingserwachen',
    },
  },
  {
    id: 'sommer', name: 'Sommerhitze', month: 7,
    theme: {
      bgColor: '#1a1408',
      accentColor: '#ffaa44',
      particleTints: [0xffaa44, 0xff6644, 0xffdd00, 0xff8800],
      bannerText: 'Sommerhitze',
    },
  },
  {
    id: 'herbst', name: 'Herbststurm', month: 10,
    theme: {
      bgColor: '#1a0e08',
      accentColor: '#cc6622',
      particleTints: [0xcc6622, 0xaa4400, 0xddaa44, 0x886622],
      bannerText: 'Herbststurm',
    },
  },
  {
    id: 'advent', name: 'Adventskalender', month: 12,
    theme: {
      bgColor: '#1a0a0a',
      accentColor: '#ff4444',
      particleTints: [0xff4444, 0x44ff44, 0xffffff, 0xffdd00],
      bannerText: 'Adventskalender',
    },
  },
];

export class EventManager {
  /** Get the active event for the current month, or null. */
  static getCurrentEvent(): GameEvent | null {
    const month = new Date().getUTCMonth() + 1;
    return EVENTS.find((e) => e.month === month) ?? null;
  }
}

export type { GameEvent };
