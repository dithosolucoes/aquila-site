/**
 * Web Audio API synthesizer shared by Aquila and the Europe US experience.
 * No external assets required; instant and lightweight.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  public enabled: boolean = true;

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    type: OscillatorType,
    from: number,
    to: number,
    volume: number,
    duration: number,
    delay = 0
  ) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, start);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.01);
    } catch {
      // Audio fallback silent
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(enabled ? 0.04 : 0, this.ctx.currentTime, 0.2);
    }
  }

  // Soft tactile click (ceramic button)
  public click() {
    this.tone('sine', 1200, 300, 0.08, 0.04);
  }

  // Subtle hover tick
  public hover() {
    this.tone('triangle', 800, 400, 0.025, 0.02);
  }

  // Opening chime (harmonic chord)
  public open() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) =>
      this.tone('sine', freq, freq, 0.04, 0.35, idx * 0.035)
    );
  }

  // Close swoosh
  public close() {
    this.tone('sine', 700, 200, 0.04, 0.09);
  }

  // Europe US: launch whoosh
  public launch() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 1.6);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 1.6);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.3);
    } catch {
      // Audio fallback silent
    }
  }

  // Europe US: arrival chime
  public arrival() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      this.tone('sine', freq, freq, 0.06, 2.2, i * 0.08)
    );
  }

  // Europe US: deep ambient drone, faded in and out
  public startAmbient() {
    if (this.droneOsc) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      this.droneOsc = ctx.createOscillator();
      this.droneGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(45, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, ctx.currentTime);
      this.droneGain.gain.setValueAtTime(0, ctx.currentTime);
      this.droneGain.gain.setTargetAtTime(this.enabled ? 0.04 : 0, ctx.currentTime, 0.6);
      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(ctx.destination);
      this.droneOsc.start();
    } catch {
      // Audio fallback silent
    }
  }

  public stopAmbient() {
    const osc = this.droneOsc;
    const gain = this.droneGain;
    if (!osc || !gain || !this.ctx) return;
    this.droneOsc = null;
    this.droneGain = null;
    try {
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
      osc.stop(this.ctx.currentTime + 1.2);
    } catch {
      // Safe ignore
    }
  }
}

export const sound = new SoundEngine();
