/**
 * Procedural Web Audio API sound synthesizer for the 65mm camera.
 * Generates authentic mechanical film transport purr, 24fps pulldown claw pulses,
 * rotating rotary shutter flutter, and electronic relay clicks.
 * Zero external audio files required.
 */

class CameraAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private clawTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playButtonBeep(frequency: number = 880, duration: number = 0.06) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might not be permitted yet
    }
  }

  public startFilmTransport(speed: number = 1.0) {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isRunning = true;
    const now = this.ctx.currentTime;

    // 1. Motor low-frequency drone (precision brushless DC motor)
    this.motorOsc = this.ctx.createOscillator();
    this.motorOsc.type = 'triangle';
    this.motorOsc.frequency.setValueAtTime(96 * speed, now);

    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(240, now);

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.setValueAtTime(0.001, now);
    this.motorGain.gain.linearRampToValueAtTime(0.2, now + 0.15);

    this.motorOsc.connect(motorFilter);
    motorFilter.connect(this.motorGain);
    this.motorGain.connect(this.masterGain);
    this.motorOsc.start(now);

    // 2. Film sliding friction noise (procedural white noise buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseBandpass = this.ctx.createBiquadFilter();
    noiseBandpass.type = 'bandpass';
    noiseBandpass.frequency.setValueAtTime(1400, now);
    noiseBandpass.Q.setValueAtTime(2.2, now);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.001, now);
    this.noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.1);

    this.noiseNode.connect(noiseBandpass);
    noiseBandpass.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    this.noiseNode.start(now);

    // 3. 24 fps pulldown claw tick interval (approx every 41.6ms)
    const intervalMs = (1000 / 24) / speed;
    this.clawTimer = window.setInterval(() => {
      this.triggerClawClick();
    }, intervalMs);
  }

  public updateTransportSpeed(speed: number) {
    if (!this.isRunning || !this.ctx) return;
    const clamped = Math.max(0.1, Math.min(2.5, speed));
    if (this.motorOsc) {
      this.motorOsc.frequency.setTargetAtTime(96 * clamped, this.ctx.currentTime, 0.05);
    }
  }

  private triggerClawClick() {
    if (!this.isRunning || this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // High-frequency mechanical tap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200 + (Math.random() * 400 - 200), now);
      filter.Q.setValueAtTime(5.0, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // ignore
    }
  }

  public stopFilmTransport() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.clawTimer !== null) {
      clearInterval(this.clawTimer);
      this.clawTimer = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.motorGain) {
        this.motorGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
        setTimeout(() => {
          try {
            this.motorOsc?.stop();
            this.motorOsc?.disconnect();
          } catch { /* noop */ }
        }, 220);
      }
      if (this.noiseGain) {
        this.noiseGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        setTimeout(() => {
          try {
            this.noiseNode?.stop();
            this.noiseNode?.disconnect();
          } catch { /* noop */ }
        }, 180);
      }
    }
  }

  public playShutterClick() {
    this.playButtonBeep(640, 0.04);
    setTimeout(() => this.playButtonBeep(420, 0.05), 45);
  }
}

export const cameraAudio = new CameraAudioEngine();
