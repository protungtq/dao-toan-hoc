import { isSoundEnabled } from './gameAudio';

export type MiniGameSound =
  | 'collect'
  | 'success'
  | 'correct'
  | 'fanfare'
  | 'miss'
  | 'step'
  | 'flap'
  | 'jump'
  | 'hit'
  | 'laser'
  | 'nitro'
  | 'boost'
  | 'crash'
  | 'horn'
  | 'whistle'
  | 'powerup';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

// Ensure context activates on first interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playMiniGameSound(name: MiniGameSound) {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (name) {
      // 1. COLLECT / COIN (Sparkling twin-bell chime)
      case 'collect': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(1318.5, now); // E6
        gain1.gain.setValueAtTime(0.24, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc2.frequency.setValueAtTime(1975.5, now + 0.06); // B6
        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.setValueAtTime(0.28, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.18);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.3);
        break;
      }

      // 2. SUCCESS / CORRECT (Uplifting major chord arpeggio)
      case 'success':
      case 'correct': {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.06;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      // 3. FANFARE (Triumphant brass celebration)
      case 'fanfare': {
        const melody = [
          { f: 523.25, t: 0, d: 0.12 },    // C5
          { f: 659.25, t: 0.12, d: 0.12 }, // E5
          { f: 783.99, t: 0.24, d: 0.15 }, // G5
          { f: 1046.5, t: 0.38, d: 0.45 }, // C6
        ];
        melody.forEach(({ f, t, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + t;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + d);
        });
        break;
      }

      // 4. JUMP / FLAP / THRUSTER (Smooth upward whoosh with resonance)
      case 'flap':
      case 'jump': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      // 5. STEP (Subtle lane shift / stepping pop)
      case 'step': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      // 6. MISS / FAIL (Warm descending wah-wah, gentle on ears)
      case 'miss': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }

      // 7. HIT / BUMP (Solid rubbery / metallic deflection)
      case 'hit': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }

      // 8. LASER / SHOOT (Snappy cosmic laser zap)
      case 'laser': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(940, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.11);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      // 9. NITRO / BOOST (Rushing turbine acceleration whoosh)
      case 'nitro':
      case 'boost': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.32, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        // Filtered noise layer for thruster fire
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.4);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.Q.setValueAtTime(3, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
        noise.start(now);
        noise.stop(now + 0.42);
        break;
      }

      // 10. CRASH / EXPLOSION (Dramatic low-frequency noise rumble)
      case 'crash': {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.45);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        // Low thud oscillator
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);
        oscGain.gain.setValueAtTime(0.35, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.46);
        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }

      // 11. HORN (Playful two-tone car horn)
      case 'horn': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(698.46, now); // F5
        osc2.frequency.setValueAtTime(880.0, now);  // A5

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.24);
        osc2.start(now);
        osc2.stop(now + 0.24);
        break;
      }

      // 12. WHISTLE (Ref soccer trill)
      case 'whistle': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Rapid pitch trill
        for (let i = 0; i < 4; i++) {
          osc.frequency.setValueAtTime(2400, now + i * 0.05);
          osc.frequency.setValueAtTime(2700, now + i * 0.05 + 0.025);
        }

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      // 13. POWERUP (Shimmering ascending star sparkle)
      case 'powerup': {
        const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.045;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }
    }
  } catch {
    // Gracefully handle any audio synthesis error
  }
}
