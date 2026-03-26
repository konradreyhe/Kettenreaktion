import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainDetector } from './ChainDetector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeBody(id: number, isStatic = false): any {
  return { id, isStatic };
}

describe('ChainDetector', () => {
  let detector: ChainDetector;

  beforeEach(() => {
    detector = new ChainDetector();
  });

  it('starts with chain length 0', () => {
    expect(detector.getChainLength()).toBe(0);
  });

  it('counts dynamic-to-dynamic collision as chain', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);
    expect(detector.getChainLength()).toBe(1);
  });

  it('ignores static body collisions', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1, true), bodyB: makeBody(2) }]);
    expect(detector.getChainLength()).toBe(0);
  });

  it('increments chain for collisions within timeout', () => {
    const now = vi.spyOn(Date, 'now');

    now.mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    now.mockReturnValue(1500); // 500ms later, within 2000ms timeout
    detector.onCollision([{ bodyA: makeBody(3), bodyB: makeBody(4) }]);

    expect(detector.getChainLength()).toBe(2);
  });

  it('resets chain after timeout', () => {
    const now = vi.spyOn(Date, 'now');

    now.mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    now.mockReturnValue(5000); // 4000ms later, beyond 2000ms timeout
    detector.onCollision([{ bodyA: makeBody(3), bodyB: makeBody(4) }]);

    expect(detector.getChainLength()).toBe(1);
  });

  it('deduplicates same pair within 100ms window', () => {
    const now = vi.spyOn(Date, 'now');

    now.mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    now.mockReturnValue(1050); // 50ms later, same pair
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    expect(detector.getChainLength()).toBe(1); // not double-counted
  });

  it('counts same pair again after dedup window expires', () => {
    const now = vi.spyOn(Date, 'now');

    now.mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    now.mockReturnValue(1200); // 200ms later, past 100ms dedup window
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);

    expect(detector.getChainLength()).toBe(2);
  });

  it('resets fully', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    detector.onCollision([{ bodyA: makeBody(1), bodyB: makeBody(2) }]);
    detector.reset();
    expect(detector.getChainLength()).toBe(0);
  });
});
