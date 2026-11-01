// Web Audio API Procedural Sound Synthesizer for AI Mystery Room
// Zero external asset downloads, 100% reliable, zero latency!

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem('mystery_audio_muted') === 'true';
    } catch (e) {
      this.muted = false;
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('mystery_audio_muted', String(this.muted));
    } catch (e) {}
    return this.muted;
  }

  // Sparkling chime when discovering a clue (+5 pts)
  playClueFound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  // Warning/amber tone when unlocking a hint (-10 pts)
  playHintUsed() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.25); // E4 down

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Courtroom gavel / dramatic low thud when making accusation
  playAccuseGavel() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Triumphant fanfare when solving mystery correctly
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.0],  // D major
      [659.25, 830.61, 987.77], // E major
      [783.99, 987.77, 1174.66] // G major high
    ];

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + step * 0.18);

        gain.gain.setValueAtTime(0.001, now + step * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.15, now + step * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.18 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + step * 0.18);
        osc.stop(now + step * 0.18 + 0.46);
      });
    });
  }

  // Dramatic minor chord when suspect is innocent / player fails
  playDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const minorTones = [220, 261.63, 311.13, 196]; // Diminished/Minor tension

    minorTones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      osc.frequency.linearRampToValueAtTime(freq - 15, now + idx * 0.1 + 0.6);

      gain.gain.setValueAtTime(0.01, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.72);
    });
  }
}

export const sounds = new SoundSystem();
