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
  | 'powerup'
  | 'thruster'
  | 'engine'
  | 'skid'
  | 'shield'
  | 'shield_break'
  | 'goal'
  | 'countdown'
  | 'combo'
  | 'gameover';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function getMasterOutput(ctx: AudioContext): GainNode {
  if (!masterGain || !masterCompressor) {
    masterCompressor = ctx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-16, ctx.currentTime);
    masterCompressor.knee.setValueAtTime(20, ctx.currentTime);
    masterCompressor.ratio.setValueAtTime(6, ctx.currentTime);
    masterCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
    masterCompressor.release.setValueAtTime(0.18, ctx.currentTime);

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

    masterGain.connect(masterCompressor);
    masterCompressor.connect(ctx.destination);
  }
  return masterGain;
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
  const bufferSize = Math.floor(ctx.sampleRate * duration);
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

  const out = getMasterOutput(ctx);
  const now = ctx.currentTime;

  try {
    switch (name) {
      // 1. COLLECT / COIN (Sparkling twin-bell harmonic chime with chime tail)
      case 'collect': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gain3 = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc3.type = 'sine';

        // E6 -> B6 -> E7 triple bell
        osc1.frequency.setValueAtTime(1318.5, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc2.frequency.setValueAtTime(1975.5, now + 0.05);
        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.setValueAtTime(0.28, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc3.frequency.setValueAtTime(2637.0, now + 0.09);
        gain3.gain.setValueAtTime(0.001, now);
        gain3.gain.setValueAtTime(0.18, now + 0.09);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc1.connect(gain1);
        gain1.connect(out);
        osc2.connect(gain2);
        gain2.connect(out);
        osc3.connect(gain3);
        gain3.connect(out);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.35);
        osc3.start(now + 0.09);
        osc3.stop(now + 0.4);
        break;
      }

      // 2. SUCCESS / CORRECT (Lively C-major arpeggio C5 -> E5 -> G5 -> C6)
      case 'success':
      case 'correct': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.055;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.26, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.38);
        });
        break;
      }

      // 3. COMBO (Ascending energetic 5-tone sweep)
      case 'combo': {
        const freqs = [659.25, 783.99, 987.77, 1318.51, 1567.98];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.045;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.24, t + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.28);
        });
        break;
      }

      // 4. FANFARE (Triumphant brass fanfare with harmony)
      case 'fanfare': {
        const melody = [
          { f: 523.25, t: 0, d: 0.12 },
          { f: 659.25, t: 0.11, d: 0.12 },
          { f: 783.99, t: 0.22, d: 0.14 },
          { f: 1046.5, t: 0.36, d: 0.52 },
        ];
        melody.forEach(({ f, t, d }) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + t;

          osc1.type = 'sawtooth';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(f, startTime);
          osc2.frequency.setValueAtTime(f * 1.004, startTime); // slight detune for rich brass

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(out);

          osc1.start(startTime);
          osc1.stop(startTime + d);
          osc2.start(startTime);
          osc2.stop(startTime + d);
        });
        break;
      }

      // 5. JUMP / FLAP / THRUSTER (Smooth aerodynamic whoosh)
      case 'flap':
      case 'jump': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.13);

        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }

      // 6. THRUSTER (Deep cosmic pulse)
      case 'thruster': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      // 7. STEP (Crisp lane shift / pop)
      case 'step': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      // 8. MISS / FAIL (Gentle descending cartoon wah)
      case 'miss': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.24);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      // 9. HIT / BUMP (Solid arcade deflection)
      case 'hit': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      // 10. LASER / SHOOT (Snappy cosmic laser zap)
      case 'laser': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1020, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      // 11. NITRO / BOOST (Turbine acceleration with afterburner rumble)
      case 'nitro':
      case 'boost': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.38);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.42);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(900, now);
        noiseFilter.Q.setValueAtTime(2.5, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(out);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.48);
        noise.start(now);
        noise.stop(now + 0.44);
        break;
      }

      // 12. CRASH / EXPLOSION (Multi-layered explosive thump + debris noise)
      case 'crash': {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.48);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.42);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.32);
        oscGain.gain.setValueAtTime(0.38, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        osc.connect(oscGain);
        oscGain.connect(out);

        noise.start(now);
        noise.stop(now + 0.48);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }

      // 13. HORN (Lively two-tone car horn)
      case 'horn': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(698.46, now); // F5
        osc2.frequency.setValueAtTime(880.0, now); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(out);

        osc1.start(now);
        osc1.stop(now + 0.25);
        osc2.start(now);
        osc2.stop(now + 0.25);
        break;
      }

      // 14. ENGINE / CAR_REV (Dynamic sports car revving roar)
      case 'engine': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(85, now);
        osc1.frequency.exponentialRampToValueAtTime(290, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.4);

        osc2.frequency.setValueAtTime(42.5, now);
        osc2.frequency.exponentialRampToValueAtTime(145, now + 0.25);
        osc2.frequency.exponentialRampToValueAtTime(70, now + 0.4);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(out);

        osc1.start(now);
        osc1.stop(now + 0.43);
        osc2.start(now);
        osc2.stop(now + 0.43);
        break;
      }

      // 15. SKID (Tire screeching on asphalt)
      case 'skid': {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.28);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(6, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        noise.start(now);
        noise.stop(now + 0.28);
        break;
      }

      // 16. SHIELD / SHIELD_UP (Harmonic crystal protective aura)
      case 'shield': {
        const notes = [659.25, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.04;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.38);
        });
        break;
      }

      // 17. SHIELD_BREAK (Glass shattering harmonic)
      case 'shield_break': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, 0.18);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1800, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(out);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.19);
        noise.start(now);
        noise.stop(now + 0.18);
        break;
      }

      // 18. GOAL (Stadium crowd cheer + referee trill)
      case 'goal': {
        // Referee whistle
        const whistleOsc = ctx.createOscillator();
        const whistleGain = ctx.createGain();
        whistleOsc.type = 'sine';
        for (let i = 0; i < 5; i++) {
          whistleOsc.frequency.setValueAtTime(2500, now + i * 0.04);
          whistleOsc.frequency.setValueAtTime(2850, now + i * 0.04 + 0.02);
        }
        whistleGain.gain.setValueAtTime(0.22, now);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        whistleOsc.connect(whistleGain);
        whistleGain.connect(out);
        whistleOsc.start(now);
        whistleOsc.stop(now + 0.29);

        // Stadium roar
        const crowd = ctx.createBufferSource();
        crowd.buffer = createNoiseBuffer(ctx, 0.65);
        const crowdFilter = ctx.createBiquadFilter();
        crowdFilter.type = 'bandpass';
        crowdFilter.frequency.setValueAtTime(850, now);
        crowdFilter.Q.setValueAtTime(1.5, now);

        const crowdGain = ctx.createGain();
        crowdGain.gain.setValueAtTime(0.001, now);
        crowdGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        crowdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);

        crowd.connect(crowdFilter);
        crowdFilter.connect(crowdGain);
        crowdGain.connect(out);
        crowd.start(now);
        crowd.stop(now + 0.65);
        break;
      }

      // 19. WHISTLE (Crisp referee whistle)
      case 'whistle': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        for (let i = 0; i < 4; i++) {
          osc.frequency.setValueAtTime(2400, now + i * 0.05);
          osc.frequency.setValueAtTime(2700, now + i * 0.05 + 0.025);
        }

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      // 20. POWERUP (Shimmering ascending star sparkle)
      case 'powerup': {
        const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.045;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.24, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.26);
        });
        break;
      }

      // 21. COUNTDOWN (Classic 3-2-1 beep)
      case 'countdown': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      // 22. GAMEOVER (Solemn melodic retro descent)
      case 'gameover': {
        const notes = [440, 392, 349.23, 261.63];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.14;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

          osc.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.34);
        });
        break;
      }
    }
  } catch {
    // Gracefully handle any audio synthesis error
  }
}
