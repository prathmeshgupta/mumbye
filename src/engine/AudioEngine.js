// MUMBYE: MAXIMUM CITY - Web Audio Procedural Synthesizer
// LICENSE & ATTRIBUTION: 100% Original Algorithmic Web Audio Synthesis (CC0 / Public Domain).
// Zero external asset dependencies, zero sample copyrights, zero liability.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.engineGain = null;
    this.flightGain = null;
    this.initialized = false;
    this.isMuted = false;

    // Active engine & flight sound nodes
    this.currentEngineNode = null;
    this.currentEngineOsc = null;
    this.currentSirenOsc = null;
    this.currentDroneNode = null;
    this.currentHeliNode = null;

    // Radio Stations (100% Procedurally Synthesized Live Beats)
    this.currentRadioStation = 0; // 0 = Off, 1 = Bollywood Funk, 2 = Gully Rap, 3 = Sunset Synthwave, 4 = Dhol Tasha, 5 = Cyber BKC
    this.radioStations = [
      { id: 0, name: "Radio OFF", genre: "Mute" },
      { id: 1, name: "Bombay Disco 98.3", genre: "Bollywood Funk & Disco" },
      { id: 2, name: "Gully Beat 104.8", genre: "Mumbai Desi Hip Hop" },
      { id: 3, name: "Marine Drive Chill 92.7", genre: "Arabian Sea Chillwave" },
      { id: 4, name: "Dhol Tasha 101.2", genre: "Festival Beats & Energy" },
      { id: 5, name: "Cyber BKC 107.5", genre: "Futuristic Synthwave & EDM" }
    ];
    this.radioInterval = null;
    this.radioStep = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      this.flightGain = this.ctx.createGain();
      this.flightGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.flightGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  // --- Sound Effects Synthesizers ---

  playFootstep() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playPunch() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Crunch noise
    this.playNoise(0.08, 0.4, 800, 'bandpass');
  }

  playBatSwing() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playGunshot(type = 'pistol') {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (type === 'katta') {
      // Raw rustic boom with heavy punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.35);
      this.playNoise(0.28, 0.7, 1200, 'lowpass');
    } else if (type === 'ak47') {
      // Rapid metallic crack + snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
      this.playNoise(0.12, 0.6, 2200, 'bandpass');
    } else {
      // Standard 9mm pistol
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
      this.playNoise(0.15, 0.45, 1800, 'highpass');
    }
  }

  playExplosion() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass shockwave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.8);

    // Blast rumble noise
    this.playNoise(0.9, 0.8, 600, 'lowpass');
  }

  playCarHorn(type = 'auto') {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    if (type === 'auto') {
      // Squeaky funny auto rickshaw horn (two close harmonic pitches)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(783.99, now); // G5
      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'bus') {
      // Heavy double-tone truck airhorn
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(185, now); // F#3
      osc2.frequency.setValueAtTime(233, now); // Bb3
      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else {
      // Classic car dual horn
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(392, now); // G4
      osc2.frequency.setValueAtTime(440, now); // A4
      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    }

    gain.connect(this.sfxGain);
  }

  playCrash() {
    if (!this.initialized || this.isMuted) return;
    this.playNoise(0.35, 0.7, 900, 'bandpass');
    this.playPunch();
  }

  playTireSqueal() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPoliceSiren(active) {
    if (!this.initialized || this.isMuted) return;
    if (active && !this.currentSirenOsc) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const sirenGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.5, now); // 1.5 cycles per sec
      lfoGain.gain.setValueAtTime(250, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      sirenGain.gain.setValueAtTime(0.25, now);

      osc.connect(sirenGain);
      sirenGain.connect(this.sfxGain);

      lfo.start(now);
      osc.start(now);

      this.currentSirenOsc = { osc, lfo, sirenGain };
    } else if (!active && this.currentSirenOsc) {
      try {
        const now = this.ctx.currentTime;
        this.currentSirenOsc.sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        this.currentSirenOsc.osc.stop(now + 0.2);
        this.currentSirenOsc.lfo.stop(now + 0.2);
      } catch (e) {}
      this.currentSirenOsc = null;
    }
  }

  playCoinCash() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.setValueAtTime(1975.53, now + 0.08); // B6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playMissionSound(success = true) {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = success ? [440, 554.37, 659.25, 880] : [300, 260, 220, 180];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = success ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.3, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  }

  // --- Dynamic Vehicle Engine Sound ---
  startVehicleEngine(type = 'auto') {
    if (!this.initialized || this.isMuted) return;
    this.stopVehicleEngine();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'auto') {
      // 2-stroke sputter
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
    } else if (type === 'bus') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(30, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
    } else if (type === 'supercar') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
    } else {
      // Padmini taxi
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
    }

    gain.gain.setValueAtTime(0.2, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.engineGain);

    osc.start(now);

    this.currentEngineNode = { osc, filter, gain, type };
  }

  updateVehicleEngine(speedNormalized = 0, isAccelerating = false) {
    if (!this.currentEngineNode || !this.ctx) return;
    const { osc, filter, gain, type } = this.currentEngineNode;
    const now = this.ctx.currentTime;

    let baseFreq = 45;
    let maxFreq = 160;
    if (type === 'auto') {
      baseFreq = 50;
      maxFreq = 190;
    } else if (type === 'supercar') {
      baseFreq = 65;
      maxFreq = 260;
    } else if (type === 'bus') {
      baseFreq = 32;
      maxFreq = 110;
    }

    const targetFreq = baseFreq + speedNormalized * (maxFreq - baseFreq) + (isAccelerating ? 25 : 0);
    osc.frequency.setTargetAtTime(targetFreq, now, 0.08);

    const targetCutoff = 250 + speedNormalized * 700 + (isAccelerating ? 200 : 0);
    filter.frequency.setTargetAtTime(targetCutoff, now, 0.08);

    const targetGain = 0.15 + speedNormalized * 0.25;
    gain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  stopVehicleEngine() {
    if (this.currentEngineNode) {
      try {
        const now = this.ctx.currentTime;
        this.currentEngineNode.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        this.currentEngineNode.osc.stop(now + 0.15);
      } catch (e) {}
      this.currentEngineNode = null;
    }
  }

  // --- Radio Station Engine (Procedural Beats) ---
  cycleRadio() {
    this.currentRadioStation = (this.currentRadioStation + 1) % this.radioStations.length;
    this.startRadio(this.currentRadioStation);
    return this.radioStations[this.currentRadioStation];
  }

  setRadioStation(index) {
    this.currentRadioStation = Math.max(0, Math.min(index, this.radioStations.length - 1));
    this.startRadio(this.currentRadioStation);
    return this.radioStations[this.currentRadioStation];
  }

  startRadio(stationIndex) {
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }

    if (stationIndex === 0 || !this.initialized) return;

    this.radioStep = 0;
    const bpm = stationIndex === 5 ? 128 : stationIndex === 4 ? 135 : stationIndex === 2 ? 95 : stationIndex === 1 ? 120 : 105;
    const intervalMs = (60 / bpm) * 1000 / 4; // 16th notes

    this.radioInterval = setInterval(() => {
      this.tickRadioBeat(stationIndex);
      this.radioStep = (this.radioStep + 1) % 32;
    }, intervalMs);
  }

  tickRadioBeat(station) {
    if (this.isMuted || !this.ctx) return;
    const step = this.radioStep;
    const now = this.ctx.currentTime;

    // Station 1: Bombay Disco 98.3 (Bollywood Funk & Disco)
    if (station === 1) {
      // Four on the floor kick
      if (step % 4 === 0) this.playRadioKick(now, 110, 0.35);
      // Snare on 4 and 12
      if (step % 8 === 4) this.playRadioSnare(now, 0.25);
      // Offbeat hi-hat
      if (step % 2 === 1) this.playRadioHat(now, 0.12);
      // Disco bassline: root, octave, minor 7th
      if (step % 2 === 0) {
        const bassNotes = [110, 110, 220, 196, 110, 130.8, 146.8, 164.8];
        const freq = bassNotes[(step / 2) % bassNotes.length];
        this.playRadioBass(now, freq, 0.15, 'sawtooth');
      }
    }
    // Station 2: Gully Beat 104.8 (Mumbai Desi Hip Hop)
    else if (station === 2) {
      // Boom-bap 808 kick pattern
      if (step === 0 || step === 10 || step === 18 || step === 26) this.playRadioKick(now, 85, 0.45);
      // Heavy clap / snare on 8 and 24
      if (step === 8 || step === 24) this.playRadioSnare(now, 0.35);
      // Trap hi-hat with rolls
      if (step % 2 === 0 || (step >= 12 && step <= 15)) this.playRadioHat(now, 0.15);
      // Gully sitar / flute high lead riff
      if (step % 4 === 0) {
        const leadNotes = [440, 466.16, 554.37, 587.33, 659.25, 554.37, 466.16, 440];
        const freq = leadNotes[(step / 4) % leadNotes.length];
        this.playRadioLead(now, freq, 0.2, 'triangle');
      }
    }
    // Station 3: Marine Drive Chill 92.7 (Arabian Sea Chillwave)
    else if (station === 3) {
      // Soft kick
      if (step === 0 || step === 12) this.playRadioKick(now, 75, 0.25);
      // Ambient rimshot
      if (step === 8 || step === 24) this.playRadioSnare(now, 0.15, true);
      // Relaxed hi-hat
      if (step % 4 === 2) this.playRadioHat(now, 0.08);
      // Warm dreamy chords (arpeggiated)
      if (step % 2 === 0) {
        const chillNotes = [261.63, 329.63, 392.00, 493.88, 392.00, 329.63];
        const freq = chillNotes[(step / 2) % chillNotes.length];
        this.playRadioLead(now, freq, 0.18, 'sine');
      }
    }
    // Station 4: Dhol Tasha 101.2 (Ganpati Festival High Energy)
    else if (station === 4) {
      // Fast dhol pattern (ta-dhin-ta-ta-dhin)
      if (step % 4 === 0 || step % 4 === 1 || step % 8 === 6) this.playRadioKick(now, 130, 0.4);
      // High brass tasha roll
      if (step % 2 === 1 || step % 8 === 7) this.playRadioSnare(now, 0.28);
      // Metallic manjira cymbals
      if (step % 2 === 0) this.playRadioHat(now, 0.2, true);
    }
    // Station 5: Cyber BKC 107.5 (Futuristic Synthwave & EDM)
    else if (station === 5) {
      // Hard four-on-the-floor electro kick
      if (step % 4 === 0) this.playRadioKick(now, 140, 0.42);
      // Cyber snare + noise tail on 4 and 12
      if (step % 8 === 4) this.playRadioSnare(now, 0.32);
      // Fast rolling 16th hats
      this.playRadioHat(now, step % 2 === 0 ? 0.08 : 0.15);
      // Cyberpunk rolling 16th synth bass arpeggio
      const cyberScale = [65.41, 77.78, 87.31, 98.00, 116.54, 130.81, 155.56, 174.61]; // C minor pentatonic
      const noteFreq = cyberScale[step % cyberScale.length];
      this.playRadioBass(now, noteFreq, 0.1, 'sawtooth');
      // Lead melodic stab every 8 steps
      if (step % 8 === 0) {
        const leadScale = [523.25, 622.25, 698.46, 783.99];
        const lFreq = leadScale[(step / 8) % leadScale.length];
        this.playRadioLead(now, lFreq, 0.25, 'sawtooth');
      }
    }
  }

  playRadioKick(now, startFreq = 100, volume = 0.3) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playRadioSnare(now, volume = 0.2, rim = false) {
    this.playNoise(rim ? 0.05 : 0.1, volume, rim ? 3500 : 1800, 'bandpass', this.musicGain);
  }

  playRadioHat(now, volume = 0.1, open = false) {
    this.playNoise(open ? 0.12 : 0.03, volume, 6500, 'highpass', this.musicGain);
  }

  playRadioBass(now, freq, duration = 0.15, type = 'sawtooth') {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playRadioLead(now, freq, duration = 0.2, type = 'sine') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Helper noise generator
  playNoise(duration, volume, filterFreq, filterType = 'lowpass', targetGain = null) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(targetGain || this.sfxGain);

    noise.start();
  }

  // --- Aerial Flight & High-Tech Sound Synthesizers ---

  // Quadcopter Drone Sound Engine
  startDroneSound() {
    if (!this.initialized || this.isMuted || this.currentDroneNode) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.flightGain || this.sfxGain);
    osc.start(now);

    this.currentDroneNode = { osc, filter, gain };
  }

  updateDroneSound(throttle = 0, speedNormalized = 0) {
    if (!this.currentDroneNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetFreq = 175 + throttle * 120 + speedNormalized * 80;
    const targetFilter = 500 + throttle * 400;
    const targetGain = 0.16 + throttle * 0.12;

    this.currentDroneNode.osc.frequency.setTargetAtTime(targetFreq, now, 0.06);
    this.currentDroneNode.filter.frequency.setTargetAtTime(targetFilter, now, 0.06);
    this.currentDroneNode.gain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  stopDroneSound() {
    if (this.currentDroneNode) {
      try {
        const now = this.ctx.currentTime;
        this.currentDroneNode.gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        this.currentDroneNode.osc.stop(now + 0.15);
      } catch (e) {}
      this.currentDroneNode = null;
    }
  }

  // Sky-Ranger Helicopter Sound Engine (Rotor Blade Chop + Jet Turbine)
  startHelicopterSound() {
    if (!this.initialized || this.isMuted || this.currentHeliNode) return;
    const now = this.ctx.currentTime;

    // Turbine whine
    const turbine = this.ctx.createOscillator();
    turbine.type = 'sawtooth';
    turbine.frequency.setValueAtTime(320, now);

    const turbineFilter = this.ctx.createBiquadFilter();
    turbineFilter.type = 'lowpass';
    turbineFilter.frequency.setValueAtTime(900, now);

    const turbineGain = this.ctx.createGain();
    turbineGain.gain.setValueAtTime(0.08, now);

    turbine.connect(turbineFilter);
    turbineFilter.connect(turbineGain);
    turbineGain.connect(this.flightGain || this.sfxGain);
    turbine.start(now);

    // Rotor Chop Oscillator
    const rotor = this.ctx.createOscillator();
    rotor.type = 'triangle';
    rotor.frequency.setValueAtTime(38, now);

    const rotorFilter = this.ctx.createBiquadFilter();
    rotorFilter.type = 'lowpass';
    rotorFilter.frequency.setValueAtTime(180, now);

    const rotorGain = this.ctx.createGain();
    rotorGain.gain.setValueAtTime(0.3, now);

    rotor.connect(rotorFilter);
    rotorFilter.connect(rotorGain);
    rotorGain.connect(this.flightGain || this.sfxGain);
    rotor.start(now);

    this.currentHeliNode = { turbine, turbineGain, rotor, rotorGain };
  }

  updateHelicopterSound(rpmNormalized = 1.0, altitudeClimb = 0) {
    if (!this.currentHeliNode || !this.ctx) return;
    const now = this.ctx.currentTime;

    const rotorFreq = 36 + rpmNormalized * 18 + (altitudeClimb > 0 ? 8 : 0);
    const turbineFreq = 300 + rpmNormalized * 150;

    this.currentHeliNode.rotor.frequency.setTargetAtTime(rotorFreq, now, 0.08);
    this.currentHeliNode.turbine.frequency.setTargetAtTime(turbineFreq, now, 0.08);
  }

  stopHelicopterSound() {
    if (this.currentHeliNode) {
      try {
        const now = this.ctx.currentTime;
        this.currentHeliNode.rotorGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        this.currentHeliNode.turbineGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        this.currentHeliNode.rotor.stop(now + 0.2);
        this.currentHeliNode.turbine.stop(now + 0.2);
      } catch (e) {}
      this.currentHeliNode = null;
    }
  }

  // EMP Taser Shockwave
  playEMPZap() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Crackle noise burst
    this.playNoise(0.2, 0.25, 3000, 'highpass');
  }

  // High-Tech Scanner Ping
  playScannerBeep() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(1800, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }
}
