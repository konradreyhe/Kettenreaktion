/**
 * Lightweight API client for Kettenreaktion backend.
 * Submits results, fetches global stats and heatmap data.
 */

const API_BASE = import.meta.env.DEV
  ? 'https://kettenreaktion.crelvo.dev/api/kr'
  : '/api/kr';

const PLAYER_ID_KEY = 'kr_player_id';
const TIMEOUT_MS = 5000;

/** Fetch with timeout — prevents hanging on unresponsive servers. */
function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

/** Get or create a persistent anonymous player ID. */
function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

/** Get today's date as YYYY-MM-DD (UTC). */
function todayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

export interface SubmitParams {
  score: number;
  solved: boolean;
  attempts: number;
  chainLength: number;
  placement?: { type: string; x: number; y: number };
  solveTimeMs?: number;
}

export interface DailyStats {
  date: string;
  totalPlayers: number;
  solveRate: number;
  avgScore: number;
  bestScore: number;
  histogram: { bucket: string; count: number }[];
  percentile: number | null;
}

export interface HeatmapData {
  date: string;
  totalPlacements: number;
  topSpots: { x: number; y: number; count: number; pct: number }[];
  grid?: { width: number; height: number; cells: number[] };
}

export interface StreakData {
  streak: number;
  bestStreak: number;
  totalDays: number;
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  solved: boolean;
  chainLength: number;
  attempts: number;
  isYou: boolean;
}

export interface LeaderboardData {
  date: string;
  top10: LeaderboardEntry[];
  ownRank: { position: number; score: number; total: number } | null;
}

/** Submit daily puzzle result. Fire-and-forget — never blocks gameplay. */
export async function submitResult(params: SubmitParams): Promise<void> {
  try {
    await fetchWithTimeout(`${API_BASE}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: getPlayerId(),
        puzzleDate: todayUTC(),
        score: params.score,
        solved: params.solved,
        attempts: params.attempts,
        chainLength: params.chainLength,
        placement: params.placement,
        solveTimeMs: params.solveTimeMs,
      }),
    });
  } catch {
    // Silently fail — offline or server down shouldn't break the game
  }
}

/** Fetch today's global stats + player percentile. */
export async function fetchDailyStats(): Promise<DailyStats | null> {
  try {
    const date = todayUTC();
    const playerId = getPlayerId();
    const res = await fetchWithTimeout(`${API_BASE}/stats?date=${date}&playerId=${playerId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch server-validated streak for current player. */
export async function fetchStreak(): Promise<StreakData | null> {
  try {
    const playerId = getPlayerId();
    const res = await fetchWithTimeout(`${API_BASE}/streak?playerId=${playerId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch today's placement heatmap data. */
export async function fetchHeatmap(): Promise<HeatmapData | null> {
  try {
    const date = todayUTC();
    const res = await fetchWithTimeout(`${API_BASE}/heatmap?date=${date}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch today's leaderboard (top 10 + own rank). */
export async function fetchLeaderboard(): Promise<LeaderboardData | null> {
  try {
    const date = todayUTC();
    const playerId = getPlayerId();
    const res = await fetchWithTimeout(`${API_BASE}/leaderboard?date=${date}&playerId=${playerId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
