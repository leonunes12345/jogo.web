/**
 * Retro Overdrive - Web Audio API Synthesizer
 * Generates arcade chiptune sound effects procedurally without external audio files.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineNoiseNode = null;
    this.engineRunning = false;
    this.initDone = false;

    // Load mute preference
    try {
      const savedMute = localStorage.getItem('retro_overdrive_mute');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch (e) {
      this.isMuted = false;
    }
  }

  init() {
    if (this.initDone) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.initDone = true;
  }

  ensureContext() {
    if (!this.initDone) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('retro_overdrive_mute', this.isMuted.toString());
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Dynamic Engine Sound ---
  startEngine() {
    if (this.engineRunning || !this.ctx) return;
    try {
      this.ensureContext();
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

      // Low pass filter to make it sound like a throaty engine
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.engineRunning = true;
    } catch (e) {}
  }

  updateEngine(speedRatio, isNitro = false) {
    if (!this.engineRunning || !this.engineOsc || !this.ctx) return;
    try {
      const targetFreq = isNitro ? 160 + speedRatio * 80 : 65 + speedRatio * 75;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);

      const targetVol = isNitro ? 0.15 : 0.06 + speedRatio * 0.04;
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.engineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      this.engineRunning = false;
    } catch (e) {}
  }

  // --- Sound FX: Nitro Whoosh ---
  playNitro() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);

      // Add white noise rush
      this.playWhiteNoise(0.4, 0.18, 1200);
    } catch (e) {}
  }

  // --- Sound FX: Crash / Explosion ---
  playCrash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Low boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);

      // Noise explosion crunch
      this.playWhiteNoise(0.5, 0.35, 800);
    } catch (e) {}
  }

  // --- Sound FX: Tire Screech / Drift ---
  playScreech() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // --- Sound FX: Near Miss / Dodge Bonus ---
  playNearMiss() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch (e) {}
  }

  // --- Sound FX: Pickup Item (Nitro / Wrench / Coin) ---
  playPickup() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
      });
    } catch (e) {}
  }

  // --- Sound FX: Stage Clear Fanfare ---
  playStageClear() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // Arpeggio: C4, E4, G4, C5, E5, G5
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.1;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        const duration = (i === notes.length - 1) ? 0.6 : 0.12;
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.05);
      });
    } catch (e) {}
  }

  // --- Sound FX: Victory Jingle ---
  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15, t: 0.0 }, // C5
        { f: 523.25, d: 0.15, t: 0.15 },
        { f: 523.25, d: 0.15, t: 0.3 },
        { f: 659.25, d: 0.35, t: 0.45 }, // E5
        { f: 587.33, d: 0.2, t: 0.8 },  // D5
        { f: 659.25, d: 0.2, t: 1.0 },  // E5
        { f: 783.99, d: 0.6, t: 1.2 }   // G5
      ];

      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + item.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + item.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + item.d + 0.05);
      });
    } catch (e) {}
  }

  // --- Sound FX: Game Over ---
  playGameOver() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [392.00, 369.99, 349.23, 311.13, 293.66]; // G4 down
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.16;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const dur = (idx === notes.length - 1) ? 0.7 : 0.18;
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + dur + 0.05);
      });
    } catch (e) {}
  }

  // --- UI Click Beep ---
  playBeep() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // --- Sound FX: Shield Hit Absorption ---
  playHit() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
      this.playWhiteNoise(0.15, 0.2, 500);
    } catch (e) {}
  }

  // --- Sound FX: Workshop Purchase / Cash Register ---
  playBuy() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [987.77, 1318.51]; // B5, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.22);
      });
    } catch (e) {}
  }

  // --- Helper: White Noise Generator ---
  playWhiteNoise(duration = 0.3, volume = 0.2, filterFreq = 1000) {
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
}

// Global audio singleton
window.audioMgr = new AudioManager();
