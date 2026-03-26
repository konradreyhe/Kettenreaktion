import { CHAIN_TIMEOUT_MS } from '../constants/Game';

/** Dedup window in ms — same pair ignored within this window. */
const PAIR_DEDUP_MS = 100;

/** Tracks chain reactions by monitoring Matter.js collision events. */
export class ChainDetector {
  private chainLength = 0;
  private lastImpactTime = 0;
  /** Map of pair key → timestamp when the pair was last seen. */
  private recentPairs = new Map<string, number>();

  /** Call this from the Matter.js collisionstart event. */
  onCollision(pairs: { bodyA: MatterJS.BodyType; bodyB: MatterJS.BodyType }[]): void {
    const now = Date.now();

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      // Only count dynamic-to-dynamic collisions
      if (bodyA.isStatic || bodyB.isStatic) continue;

      // Deduplicate same pair within PAIR_DEDUP_MS (timestamp-based, no setTimeout)
      const pairKey = [bodyA.id, bodyB.id].sort().join('-');
      const lastSeen = this.recentPairs.get(pairKey);
      if (lastSeen !== undefined && now - lastSeen < PAIR_DEDUP_MS) continue;

      this.recentPairs.set(pairKey, now);

      if (now - this.lastImpactTime < CHAIN_TIMEOUT_MS) {
        this.chainLength++;
      } else {
        this.chainLength = 1;
      }

      this.lastImpactTime = now;
    }

    // Periodically clean old entries (every ~50 collisions)
    if (this.recentPairs.size > 50) {
      for (const [key, time] of this.recentPairs) {
        if (now - time > PAIR_DEDUP_MS * 2) {
          this.recentPairs.delete(key);
        }
      }
    }
  }

  getChainLength(): number {
    return this.chainLength;
  }

  reset(): void {
    this.chainLength = 0;
    this.lastImpactTime = 0;
    this.recentPairs.clear();
  }
}
