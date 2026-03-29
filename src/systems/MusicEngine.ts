import { AudioManager } from './AudioManager';

// C minor pentatonic for a moody, atmospheric feel
const SCALE = [130.81, 155.56, 174.61, 196.00, 233.08]; // C3 Eb3 F3 G3 Bb3
const ARP_NOTES = [261.63, 311.13, 349.23, 392.00, 466.16]; // C4 Eb4 F4 G4 Bb4

/**
 * Procedural ambient music that evolves with chain length.
 * Layers: drone → arpeggio → pad → percussion.
 * All synthesized via Web Audio API — zero audio files.
 */
export class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private arpInterval: ReturnType<typeof setInterval> | null = null;
  private arpGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padGain: GainNode | null = null;
  private percInterval: ReturnType<typeof setInterval> | null = null;
  private percGain: GainNode | null = null;
  private playing = false;
  private currentChain = 0;

  private static enabled = true;
  private static instance: MusicEngine | null = null;

  static setEnabled(on: boolean): void {
    MusicEngine.enabled = on;
    if (!on && MusicEngine.instance) {
      MusicEngine.instance.stop();
    }
  }

  static isEnabled(): boolean {
    return MusicEngine.enabled;
  }

  /** Start ambient music. Call when simulation begins. */
  start(): void {
    if (!MusicEngine.enabled) return;
    this.ctx = AudioManager.getContext();
    if (!this.ctx || this.playing) return;

    this.playing = true;
    this.currentChain = 0;
    MusicEngine.instance = this;

    // Master gain (overall volume)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1);
    this.masterGain.connect(this.ctx.destination);

    this.startDrone();
  }

  /** Update music layers based on chain length. Call from GameScene update. */
  updateChain(chain: number): void {
    if (!this.playing || !this.ctx || chain <= this.currentChain) return;
    this.currentChain = chain;

    // Layer 1: Arpeggio starts at chain 2
    if (chain === 2 && !this.arpInterval) {
      this.startArpeggio();
    }

    // Layer 2: Pad at chain 5
    if (chain === 5 && this.padOscs.length === 0) {
      this.startPad();
    }

    // Layer 3: Percussion at chain 10
    if (chain === 10 && !this.percInterval) {
      this.startPercussion();
    }

    // Intensify: raise master volume with chain
    if (this.masterGain && this.ctx) {
      const vol = Math.min(0.25, 0.12 + chain * 0.01);
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.3);
    }
  }

  /** Crescendo for all targets hit. */
  crescendo(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Swell master volume
    this.masterGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    this.masterGain.gain.linearRampToValueAtTime(0.05, now + 2.0);

    // Add a bright rising chord
    const chord = [523.25, 659.25, 783.99]; // C5 E5 G5 (major for triumph)
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 1.5); // slight rise
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2 + i * 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 2.0);
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  /** Stop all music. Call when simulation ends or scene changes. */
  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    this.currentChain = 0;

    const now = this.ctx?.currentTime ?? 0;

    // Fade out master
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }

    // Clean up after fade
    setTimeout(() => {
      this.stopDrone();
      this.stopArpeggio();
      this.stopPad();
      this.stopPercussion();
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
      this.ctx = null;
    }, 600);
  }

  // === DRONE LAYER ===

  private startDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    // Sub bass drone
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(SCALE[0], this.ctx.currentTime); // C3
    this.droneOsc1.connect(this.droneGain);
    this.droneOsc1.start();

    // Detuned second oscillator for warmth
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(SCALE[0] * 1.002, this.ctx.currentTime); // slight detune
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.droneOsc2.connect(gain2);
    gain2.connect(this.droneGain);
    this.droneOsc2.start();

    // LFO for gentle amplitude modulation
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.3, this.ctx.currentTime); // very slow
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneGain.gain);
    this.lfo.start();
  }

  private stopDrone(): void {
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.lfo?.stop();
    } catch { /* already stopped */ }
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    this.lfo = null;
  }

  // === ARPEGGIO LAYER ===

  private startArpeggio(): void {
    if (!this.ctx || !this.masterGain) return;

    this.arpGain = this.ctx.createGain();
    this.arpGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.arpGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.5);
    this.arpGain.connect(this.masterGain);

    let noteIdx = 0;
    this.arpInterval = setInterval(() => {
      if (!this.ctx || !this.arpGain || !this.playing) return;

      const freq = ARP_NOTES[noteIdx % ARP_NOTES.length];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.arpGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.3);

      noteIdx++;
    }, 350); // ~171 BPM eighth notes
  }

  private stopArpeggio(): void {
    if (this.arpInterval) {
      clearInterval(this.arpInterval);
      this.arpInterval = null;
    }
    this.arpGain = null;
  }

  // === PAD LAYER ===

  private startPad(): void {
    if (!this.ctx || !this.masterGain) return;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.padGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.0);
    this.padGain.connect(this.masterGain);

    // Chord: C3, Eb3, G3 (minor triad) with detuned pairs
    const chordFreqs = [SCALE[0], SCALE[1], SCALE[3]]; // C Eb G

    for (const freq of chordFreqs) {
      // Main oscillator
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq * 2, this.ctx.currentTime); // octave up
      osc1.connect(this.padGain);
      osc1.start();
      this.padOscs.push(osc1);

      // Detuned pair
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2 * 1.004, this.ctx.currentTime);
      const detGain = this.ctx.createGain();
      detGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      osc2.connect(detGain);
      detGain.connect(this.padGain);
      osc2.start();
      this.padOscs.push(osc2);
    }
  }

  private stopPad(): void {
    for (const osc of this.padOscs) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.padOscs = [];
    this.padGain = null;
  }

  // === PERCUSSION LAYER ===

  private startPercussion(): void {
    if (!this.ctx || !this.masterGain) return;

    this.percGain = this.ctx.createGain();
    this.percGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.percGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.5);
    this.percGain.connect(this.masterGain);

    let beat = 0;
    this.percInterval = setInterval(() => {
      if (!this.ctx || !this.percGain || !this.playing) return;
      const now = this.ctx.currentTime;

      // Filtered noise burst — kick-like on beat 0, hi-hat on others
      const isKick = beat % 4 === 0;
      const duration = isKick ? 0.08 : 0.03;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Filter: low-pass for kick, high-pass for hi-hat
      const filter = this.ctx.createBiquadFilter();
      filter.type = isKick ? 'lowpass' : 'highpass';
      filter.frequency.setValueAtTime(isKick ? 200 : 8000, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isKick ? 0.6 : 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.percGain);
      source.start(now);
      source.stop(now + duration + 0.01);

      beat++;
    }, 175); // half the arpeggio interval for 16th note feel
  }

  private stopPercussion(): void {
    if (this.percInterval) {
      clearInterval(this.percInterval);
      this.percInterval = null;
    }
    this.percGain = null;
  }
}
