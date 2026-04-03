/** Maximum attempts per daily puzzle */
export const MAX_ATTEMPTS = 3;

/** Points per target hit */
export const POINTS_PER_TARGET = 100;

/** Points per chain link */
export const POINTS_PER_CHAIN = 50;

/** Efficiency bonus per remaining attempt */
export const POINTS_PER_SAVED_ATTEMPT = 200;

/** Points per second under time limit */
export const POINTS_PER_SECOND = 10;

/** Time limit in seconds for time bonus calculation */
export const TIME_LIMIT_SECONDS = 30;

/** Maximum simulation duration in milliseconds */
export const MAX_SIMULATION_MS = 8000;

/** Chain reaction timeout — ms between collisions to still count as chain.
 *  3s gives breathing room for physics arcs between bounces. */
export const CHAIN_TIMEOUT_MS = 3000;

/** Near-miss threshold in pixels — how close a body must pass to an unhit target
 *  to trigger the "KNAPP!" feedback. */
export const NEAR_MISS_PX = 20;

/** Game canvas dimensions */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

/** Background color */
export const BG_COLOR = '#1a1a2e';

/** localStorage key */
export const STORAGE_KEY = 'kettenreaktion_v1';

/** Launch date (UTC) for puzzle number calculation */
export const LAUNCH_DATE = Date.UTC(2026, 7, 1); // August 1, 2026
