/** Procedural audio using Web Audio API — no external sound files needed. */
export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static enabled = true;
  private static initialized = false;

  /** Must be called from a user gesture (click/tap) to unlock audio. */
  static init(): void {
    if (AudioManager.initialized) return;
    AudioManager.ctx = new AudioContext();
    AudioManager.initialized = true;
  }

  static setEnabled(on: boolean): void {
    AudioManager.enabled = on;
  }

  private static getCtx(): AudioContext | null {
    if (!AudioManager.enabled || !AudioManager.ctx) return null;
    if (AudioManager.ctx.state === 'suspended') {
      AudioManager.ctx.resume();
    }
    return AudioManager.ctx;
  }

  /** Short click sound for UI buttons. */
  static playClick(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /** Placement confirmation — thud. */
  static playPlace(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** Collision impact — pitch varies with chain count. */
  static playImpact(chainIndex: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const basePitch = 150 + chainIndex * 30;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(basePitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.5, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /** Target hit — bright ascending chime. Pitch rises with each target. */
  static playTargetHit(targetIndex: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const baseFreq = 523 + targetIndex * 150; // C5 and up

    // Two-tone chime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq + i * 200, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    }
  }

  /** Success jingle — ascending three-note chord. */
  static playSuccess(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const notes = [523, 659, 784]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  /** Failure — descending two notes. */
  static playFail(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const notes = [400, 280];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.15;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  /** Chain escalation — quick rising tone as chain builds. */
  static playChainUp(chainLength: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const freq = 300 + chainLength * 60;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }
}
