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

  /** Expose AudioContext for MusicEngine. */
  static getContext(): AudioContext | null {
    return AudioManager.ctx;
  }

  static isEnabled(): boolean {
    return AudioManager.enabled;
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

  /** Collision impact — crunch with pitch variation. */
  static playImpact(chainIndex: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const basePitch = 150 + chainIndex * 25;
    const now = ctx.currentTime;

    // Noise burst for crunch feel
    const bufferSize = ctx.sampleRate * 0.06;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.start(now);

    // Tonal component
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.4, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
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

  // Pentatonic scale frequencies (C major pentatonic, multiple octaves)
  private static readonly PENTATONIC = [
    262, 294, 330, 392, 440,   // C4 D4 E4 G4 A4
    523, 587, 659, 784, 880,   // C5 D5 E5 G5 A5
    1047, 1175, 1319, 1568, 1760, // C6 D6 E6 G6 A6
  ];

  /** Chain escalation — pentatonic scale notes that build a melody. */
  static playChainUp(chainLength: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const noteIndex = Math.min(chainLength - 1, AudioManager.PENTATONIC.length - 1);
    const freq = AudioManager.PENTATONIC[noteIndex];
    const now = ctx.currentTime;

    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    const vol = Math.min(0.15, 0.06 + chainLength * 0.008);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);

    // Harmonic overtone for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain2.gain.setValueAtTime(vol * 0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.start(now);
    osc2.stop(now + 0.15);
  }
}
