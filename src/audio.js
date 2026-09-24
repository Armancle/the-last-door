// Web Audio API Procedural Audio Synthesizer & Spatial Sound System

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.humNode = null;
    this.humGain = null;
    this.droneNode = null;
    this.droneGain = null;
    this.isMuted = false;
    this.initialized = false;
    
    // Footstep spatial left/right foot toggle
    this.footStepSide = 0; // 0 = Left, 1 = Right

    // Environmental event timer
    this.eventTimer = 0;
    this.nextEventInterval = 20 + Math.random() * 30; // seconds
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // 1. Fluorescent Light Electrical Buzz (60Hz / 120Hz harmonics + noise)
      const humOsc = this.ctx.createOscillator();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      const humOsc2 = this.ctx.createOscillator();
      humOsc2.type = 'square';
      humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(420, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      humOsc.connect(humFilter);
      humOsc2.connect(humFilter);
      humFilter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      humOsc.start();
      humOsc2.start();

      // 2. Low Room Tone Sub-Drone (45Hz deep sine)
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(150, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.10, this.ctx.currentTime);

      droneOsc.connect(droneFilter);
      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      droneOsc.start();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API waiting for user interaction.", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Footsteps with L/R stereo panning and movement speed variations
   */
  playFootstep(isSprinting = false, isCrouching = false, floorType = 'carpet') {
    if (!this.initialized || !this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Create noise buffer for step impact
    const duration = isSprinting ? 0.07 : (isCrouching ? 0.12 : 0.09);
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter tuned per floor material
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const cutoff = isCrouching ? 260 : (isSprinting ? 580 : 380);
    filter.frequency.setValueAtTime(cutoff, now);
    filter.Q.setValueAtTime(2.5, now);

    // Gain envelope
    const gain = this.ctx.createGain();
    const volume = isCrouching ? 0.05 : (isSprinting ? 0.32 : 0.16);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Stereo Panner (Alternating Left / Right foot position)
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panValue = this.footStepSide === 0 ? -0.28 : 0.28;
    this.footStepSide = 1 - this.footStepSide; // Toggle foot

    noise.connect(filter);
    filter.connect(gain);

    if (panner) {
      panner.pan.setValueAtTime(panValue, now);
      gain.connect(panner);
      panner.connect(this.ctx.destination);
    } else {
      gain.connect(this.ctx.destination);
    }

    noise.start(now);
  }

  setHumFlicker(isFlickering) {
    if (!this.humGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (isFlickering) {
      this.humGain.gain.cancelScheduledValues(now);
      this.humGain.gain.setValueAtTime(0.02 + Math.random() * 0.14, now);
    } else {
      this.humGain.gain.setValueAtTime(0.08, now);
    }
  }

  playFlashlightClick() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Environmental Horror Audio Events System
   * Subtle, rare, non-jumpscare distant sound cues
   */
  update(delta) {
    if (!this.initialized || !this.ctx) return;

    this.eventTimer += delta;
    if (this.eventTimer >= this.nextEventInterval) {
      this.triggerRandomDistantSound();
      this.eventTimer = 0;
      this.nextEventInterval = 20 + Math.random() * 35; // rare interval
    }
  }

  triggerRandomDistantSound() {
    if (!this.ctx || this.isMuted) return;

    const eventType = Math.floor(Math.random() * 4);
    const now = this.ctx.currentTime;
    const panPos = (Math.random() - 0.5) * 1.6; // random spatial panning (-0.8 to +0.8)

    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (eventType === 0) {
      // 1. Distant Door Closing Slam
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      if (panner) { panner.pan.setValueAtTime(panPos, now); gain.connect(panner); panner.connect(this.ctx.destination); }
      else { gain.connect(this.ctx.destination); }

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (eventType === 1) {
      // 2. Distant Metallic Pipe Creak
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(210, now + 0.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      if (panner) { panner.pan.setValueAtTime(panPos, now); gain.connect(panner); panner.connect(this.ctx.destination); }
      else { gain.connect(this.ctx.destination); }

      osc.start(now);
      osc.stop(now + 0.7);
    } else if (eventType === 2) {
      // 3. Faint Distant Corridor Step Sequence (2 quick distant steps)
      for (let step = 0; step < 2; step++) {
        setTimeout(() => {
          if (!this.ctx) return;
          const sNow = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(90, sNow);
          gain.gain.setValueAtTime(0.03, sNow);
          gain.gain.exponentialRampToValueAtTime(0.001, sNow + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(sNow);
          osc.stop(sNow + 0.08);
        }, step * 400);
      }
    } else if (eventType === 3) {
      // 4. Electrical Hum Surge
      if (this.humGain) {
        this.humGain.gain.cancelScheduledValues(now);
        this.humGain.gain.setValueAtTime(0.22, now);
        this.humGain.gain.exponentialRampToValueAtTime(0.08, now + 0.8);
      }
    }
  }
}

export const audioEngine = new AudioEngine();
