/** Procedural audio using Web Audio API — no external sound files needed. */

export type ImpactMaterial = 'wood' | 'metal' | 'rubber' | 'stone' | 'default';

export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static enabled = true;
  private static initialized = false;

  // Menu ambient state
  private static ambientOscs: OscillatorNode[] = [];
  private static ambientGains: GainNode[] = [];
  private static ambientLfo: OscillatorNode | null = null;
  private static ambientMasterGain: GainNode | null = null;
  private static ambientActive = false;

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

  /** Subtle hover blip for UI buttons — gentle "tick". */
  static playHover(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.04);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.start(now);
    osc.stop(now + 0.04);
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

  /** Convert an x position (0..GAME_WIDTH) to a stereo pan value (-1..1). */
  private static xToPan(x: number, gameWidth = 800): number {
    return Math.max(-1, Math.min(1, (x / gameWidth) * 2 - 1));
  }

  /** Create a stereo panner node positioned at x. */
  private static createPanner(ctx: AudioContext, x: number | undefined, now: number): StereoPannerNode {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(x !== undefined ? AudioManager.xToPan(x) : 0, now);
    panner.connect(ctx.destination);
    return panner;
  }

  /** Create a noise buffer source of the given duration in seconds. */
  private static createNoiseSource(ctx: AudioContext, duration: number, amplitude: number): AudioBufferSourceNode {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * amplitude;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    return noise;
  }

  /** Collision impact — crunch with pitch variation. Pans based on x position. */
  static playImpact(chainIndex: number, x?: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const basePitch = 150 + chainIndex * 25;
    const now = ctx.currentTime;

    // Stereo panner for spatial positioning
    const panner = AudioManager.createPanner(ctx, x, now);

    // Noise burst for crunch feel
    const noise = AudioManager.createNoiseSource(ctx, 0.06, 0.3);
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(panner);
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.start(now);

    // Tonal component
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(panner);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.4, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /** Material-differentiated collision impact. Pans based on x position. */
  static playMaterialImpact(material: ImpactMaterial, chainIndex: number, x?: number): void {
    if (material === 'default') {
      AudioManager.playImpact(chainIndex, x);
      return;
    }

    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const panner = AudioManager.createPanner(ctx, x, now);

    switch (material) {
      case 'wood': {
        // Wood: lower pitch, longer noise burst, triangle wave — wooden knock
        const basePitch = 80 + chainIndex * 10;
        const noiseDuration = 0.1;

        const noise = AudioManager.createNoiseSource(ctx, noiseDuration, 0.35);
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(panner);
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
        noise.start(now);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(panner);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(basePitch, now);
        osc.frequency.exponentialRampToValueAtTime(basePitch * 0.5, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'metal': {
        // Metal: higher pitch, sine with ring, detuned second oscillator — bright and resonant
        const basePitch = 400 + chainIndex * 50;
        const ringDuration = 0.2;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(panner);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(basePitch, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + ringDuration);
        osc1.start(now);
        osc1.stop(now + ringDuration);

        // Detuned second oscillator for metallic shimmer
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(panner);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(basePitch * 1.007, now);
        gain2.gain.setValueAtTime(0.08, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + ringDuration * 0.8);
        osc2.start(now);
        osc2.stop(now + ringDuration * 0.8);

        // Short noise transient for attack
        const noise = AudioManager.createNoiseSource(ctx, 0.02, 0.2);
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(panner);
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        noise.start(now);
        break;
      }

      case 'rubber': {
        // Rubber: very low pitch, short sine, almost no noise — soft thud
        const basePitch = 60 + chainIndex * 8;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(panner);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(basePitch, now);
        osc.frequency.exponentialRampToValueAtTime(basePitch * 0.6, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);

        // Tiny noise for minimal texture
        const noise = AudioManager.createNoiseSource(ctx, 0.02, 0.1);
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(panner);
        noiseGain.gain.setValueAtTime(0.02, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        noise.start(now);
        break;
      }

      case 'stone': {
        // Stone: mid pitch, heavy noise burst, square wave undertone — chunky
        const basePitch = 200 + chainIndex * 20;
        const noiseDuration = 0.12;

        const noise = AudioManager.createNoiseSource(ctx, noiseDuration, 0.4);
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(panner);
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
        noise.start(now);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(panner);
        osc.type = 'square';
        osc.frequency.setValueAtTime(basePitch, now);
        osc.frequency.exponentialRampToValueAtTime(basePitch * 0.3, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }
    }
  }

  /** Target hit — bright ascending chime. Pitch rises with each target. Pans based on x. */
  static playTargetHit(targetIndex: number, x?: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const baseFreq = 523 + targetIndex * 150; // C5 and up

    // Stereo panner for spatial positioning
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(x !== undefined ? AudioManager.xToPan(x) : 0, ctx.currentTime);
    panner.connect(ctx.destination);

    // Two-tone chime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(panner);

      const startTime = ctx.currentTime + i * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq + i * 200, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    }
  }

  /** Success jingle — ascending three-note arpeggio with reverb tail. */
  static playSuccess(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const notes = [523, 659, 784]; // C5, E5, G5

    // Ascending arpeggio
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

    // Reverb tail — sustained chord of all 3 notes ringing out together
    const chordStart = ctx.currentTime + notes.length * 0.12;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordStart);
      gain.gain.setValueAtTime(0.05, chordStart);
      gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.8);

      osc.start(chordStart);
      osc.stop(chordStart + 0.8);
    });
  }

  /** Failure — descending two notes with filtered noise burst underneath. */
  static playFail(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const notes = [400, 280];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = now + i * 0.15;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

    // Filtered noise burst underneath for texture — "thunk" feel
    const noiseDuration = 0.25;
    const noise = AudioManager.createNoiseSource(ctx, noiseDuration, 0.3);
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + noiseDuration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
    noise.start(now);
  }

  /** Start a quiet, slow-evolving ambient pad for the menu screen. */
  static startMenuAmbient(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx || AudioManager.ambientActive) return;

    const now = ctx.currentTime;
    AudioManager.ambientActive = true;

    // Master gain with 2-second fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.03, now + 2);
    masterGain.connect(ctx.destination);
    AudioManager.ambientMasterGain = masterGain;

    // LFO for gentle breathing effect (0.15Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, now);
    lfo.connect(lfoGain);
    lfoGain.gain.setValueAtTime(0.015, now); // modulation depth
    lfoGain.connect(masterGain.gain);
    lfo.start(now);
    AudioManager.ambientLfo = lfo;

    // Two detuned sine oscillators: C2 (65Hz) and G2 (98Hz)
    const frequencies = [65, 98];
    AudioManager.ambientOscs = [];
    AudioManager.ambientGains = [];

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      gain.gain.setValueAtTime(1, now);
      gain.connect(masterGain);
      osc.start(now);

      AudioManager.ambientOscs.push(osc);
      AudioManager.ambientGains.push(gain);
    });
  }

  /** Stop the menu ambient pad with a 1-second fade-out. */
  static stopMenuAmbient(): void {
    const ctx = AudioManager.getCtx();
    if (!ctx || !AudioManager.ambientActive) return;

    const now = ctx.currentTime;
    AudioManager.ambientActive = false;

    // Fade out master gain over 1 second
    if (AudioManager.ambientMasterGain) {
      AudioManager.ambientMasterGain.gain.cancelScheduledValues(now);
      AudioManager.ambientMasterGain.gain.setValueAtTime(
        AudioManager.ambientMasterGain.gain.value,
        now,
      );
      AudioManager.ambientMasterGain.gain.linearRampToValueAtTime(0.001, now + 1);
    }

    // Schedule oscillator cleanup after fade-out completes
    const stopTime = now + 1.05;

    AudioManager.ambientOscs.forEach((osc) => {
      try { osc.stop(stopTime); } catch { /* already stopped */ }
    });
    if (AudioManager.ambientLfo) {
      try { AudioManager.ambientLfo.stop(stopTime); } catch { /* already stopped */ }
    }

    // Clear references
    AudioManager.ambientOscs = [];
    AudioManager.ambientGains = [];
    AudioManager.ambientLfo = null;
    AudioManager.ambientMasterGain = null;
  }

  // Pentatonic scale frequencies (C major pentatonic, multiple octaves)
  private static readonly PENTATONIC = [
    262, 294, 330, 392, 440,   // C4 D4 E4 G4 A4
    523, 587, 659, 784, 880,   // C5 D5 E5 G5 A5
    1047, 1175, 1319, 1568, 1760, // C6 D6 E6 G6 A6
  ];

  /** Chain escalation — pentatonic scale notes that build a melody. Pans based on x. */
  static playChainUp(chainLength: number, x?: number): void {
    const ctx = AudioManager.getCtx();
    if (!ctx) return;

    const noteIndex = Math.min(chainLength - 1, AudioManager.PENTATONIC.length - 1);
    const freq = AudioManager.PENTATONIC[noteIndex];
    const now = ctx.currentTime;

    // Stereo panner for spatial positioning
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(x !== undefined ? AudioManager.xToPan(x) : 0, now);
    panner.connect(ctx.destination);

    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(panner);

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
    gain2.connect(panner);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain2.gain.setValueAtTime(vol * 0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.start(now);
    osc2.stop(now + 0.15);
  }
}
