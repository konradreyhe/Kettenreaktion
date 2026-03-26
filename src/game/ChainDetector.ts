import { CHAIN_TIMEOUT_MS } from '../constants/Game';

/** Tracks chain reactions by monitoring Matter.js collision events. */
export class ChainDetector {
  private chainLength = 0;
  private lastImpactTime = 0;
  private recentPairs = new Set<string>();

  /** Call this from the Matter.js collisionstart event. */
  onCollision(pairs: { bodyA: MatterJS.BodyType; bodyB: MatterJS.BodyType }[]): void {
    const now = Date.now();

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      // Only count dynamic-to-dynamic collisions
      if (bodyA.isStatic || bodyB.isStatic) continue;

      // Deduplicate same pair within 100ms
      const pairKey = [bodyA.id, bodyB.id].sort().join('-');
      if (this.recentPairs.has(pairKey)) continue;

      this.recentPairs.add(pairKey);
      setTimeout(() => this.recentPairs.delete(pairKey), 100);

      if (now - this.lastImpactTime < CHAIN_TIMEOUT_MS) {
        this.chainLength++;
      } else {
        this.chainLength = 1;
      }

      this.lastImpactTime = now;
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
