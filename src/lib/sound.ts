/**
 * Tiny Web Audio synth: no audio files to load, works offline.
 * Host only. Browsers need a user gesture before audio plays, so call
 * `sfx.unlock()` from a click/keydown.
 */
class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastPop = 0;
  muted = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.muted = localStorage.getItem("wle-muted") === "1";
      } catch {}
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem("wle-muted", m ? "1" : "0");
    } catch {}
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private ready() {
    if (this.muted || !this.ctx || !this.master || this.ctx.state !== "running") return null;
    return { ctx: this.ctx, out: this.master };
  }

  private tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; at?: number; to?: number } = {}) {
    const r = this.ready();
    if (!r) return;
    const t = r.ctx.currentTime + (opts.at ?? 0);
    const o = r.ctx.createOscillator();
    const g = r.ctx.createGain();
    o.type = opts.type ?? "sine";
    o.frequency.setValueAtTime(freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.3, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(r.out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, opts: { gain?: number; at?: number; freq?: number; q?: number; type?: BiquadFilterType } = {}) {
    const r = this.ready();
    if (!r) return;
    const t = r.ctx.currentTime + (opts.at ?? 0);
    const len = Math.max(1, Math.floor(r.ctx.sampleRate * dur));
    const buf = r.ctx.createBuffer(1, len, r.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = r.ctx.createBufferSource();
    src.buffer = buf;
    const f = r.ctx.createBiquadFilter();
    f.type = opts.type ?? "bandpass";
    f.frequency.value = opts.freq ?? 1200;
    f.Q.value = opts.q ?? 0.8;
    const g = r.ctx.createGain();
    g.gain.setValueAtTime(opts.gain ?? 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(r.out);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Vote arrived. Throttled so 60 votes don't turn into a jackhammer. */
  pop() {
    const now = performance.now();
    if (now - this.lastPop < 70) return;
    this.lastPop = now;
    const base = 520 + Math.random() * 260;
    this.tone(base, 0.09, { type: "sine", gain: 0.25, to: base * 2.2 });
  }

  join() {
    this.tone(660, 0.08, { type: "triangle", gain: 0.25 });
    this.tone(990, 0.12, { type: "triangle", gain: 0.25, at: 0.07 });
  }

  tick(urgent = false) {
    if (urgent) {
      this.tone(1500, 0.05, { type: "square", gain: 0.18 });
      this.tone(90, 0.12, { type: "sine", gain: 0.5, to: 50 });
    } else {
      this.tone(1100, 0.03, { type: "square", gain: 0.1 });
    }
  }

  buzzer() {
    this.tone(140, 0.7, { type: "sawtooth", gain: 0.3, to: 90 });
    this.tone(147, 0.7, { type: "square", gain: 0.12, to: 92 });
  }

  whoosh() {
    this.noise(0.35, { gain: 0.25, freq: 900, q: 1.5 });
    this.tone(300, 0.3, { type: "sine", gain: 0.08, to: 900 });
  }

  ding() {
    this.tone(1318, 0.5, { type: "triangle", gain: 0.25 });
    this.tone(1976, 0.6, { type: "sine", gain: 0.12, at: 0.02 });
  }

  fanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.tone(f, i === 3 ? 0.9 : 0.18, { type: "triangle", gain: 0.25, at: i * 0.12 }));
    notes.forEach((f, i) => this.tone(f / 2, i === 3 ? 0.9 : 0.18, { type: "square", gain: 0.06, at: i * 0.12 }));
  }

  /** Snare roll that crescendos, finished with a crash. */
  drumroll(seconds = 2.5) {
    if (!this.ready()) return;
    const hits = Math.floor(seconds / 0.045);
    for (let i = 0; i < hits; i++) {
      const p = i / hits;
      this.noise(0.06, { at: i * 0.045, gain: 0.05 + p * 0.25, freq: 2200, q: 0.6 });
    }
    this.crash(seconds);
  }

  crash(at = 0) {
    this.noise(1.6, { at, gain: 0.45, freq: 5000, type: "highpass" });
    this.tone(70, 0.5, { type: "sine", gain: 0.6, at, to: 40 });
  }
}

export const sfx = new Sfx();
