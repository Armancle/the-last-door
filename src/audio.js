// Web Audio API Procedural Audio Synthesizer

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.humNode = null;
    this.humGain = null;
    this.droneNode = null;
    this.droneGain = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Create Fluorescent Light Hum (60Hz / 120Hz electrical buzz + noise)
      const humOsc = this.ctx.createOscillator();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      const humOsc2 = this.ctx.createOscillator();
      humOsc2.type = 'square';
      humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      humOsc.connect(humFilter);
      humOsc2.connect(humFilter);
      humFilter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      humOsc.start();
      humOsc2.start();

      // Create Low Ambient Sub-Drone
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      droneOsc.start();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not allowed without user interaction yet.", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFootstep(isSprinting = false, isCrouching = false) {
    if (!this.initialized || !this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Footstep noise buffer
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isCrouching ? 280 : (isSprinting ? 550 : 400), now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    const volume = isCrouching ? 0.05 : (isSprinting ? 0.35 : 0.18);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isSprinting ? 0.06 : 0.12));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  setHumFlicker(isFlickering) {
    if (!this.humGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (isFlickering) {
      this.humGain.gain.cancelScheduledValues(now);
      this.humGain.gain.setValueAtTime(0.02 + Math.random() * 0.15, now);
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
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const audioEngine = new AudioEngine();
