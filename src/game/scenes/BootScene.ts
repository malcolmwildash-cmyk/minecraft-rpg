import { generateAllSprites } from '../utils/sprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    generateAllSprites(this);

    // Generate sound placeholders (simple tones via Web Audio)
    this.generateAudio();

    this.scene.start('MainMenuScene');
  }

  private generateAudio() {
    if (!this.sound || !(this.sound as any).context) return;
    const ctx = (this.sound as any).context as AudioContext;
    if (!ctx) return;

    const tones: Record<string, { freq: number; dur: number; type: OscillatorType }> = {
      sfx_click: { freq: 800, dur: 0.08, type: 'square' },
      sfx_hit: { freq: 200, dur: 0.15, type: 'sawtooth' },
      sfx_heal: { freq: 600, dur: 0.3, type: 'sine' },
      sfx_levelup: { freq: 440, dur: 0.5, type: 'sine' },
      sfx_damage: { freq: 150, dur: 0.1, type: 'square' },
    };

    for (const [key, { freq, dur, type }] of Object.entries(tones)) {
      try {
        const sampleRate = ctx.sampleRate;
        const length = Math.floor(sampleRate * dur);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          let sample = 0;
          switch (type) {
            case 'sine': sample = Math.sin(2 * Math.PI * freq * t); break;
            case 'square': sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.5 : -0.5; break;
            case 'sawtooth': sample = 2 * (freq * t - Math.floor(0.5 + freq * t)); break;
          }
          // Envelope
          const env = i < length * 0.1 ? i / (length * 0.1) : 1 - (i - length * 0.1) / (length * 0.9);
          data[i] = sample * env * 0.3;
        }
        this.cache.audio.add(key, { data: buffer, sampleRate, duration: dur });
      } catch {
        // Audio generation optional
      }
    }
  }
}
