import { useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';

// Web Audio API-based sound effects (no audio files needed)
export default function useSounds() {
  const { state } = useApp();
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.15) => {
    if (!state.settings.soundEffects) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported
    }
  }, [state.settings.soundEffects, getCtx]);

  const tap = useCallback(() => {
    playTone(800, 0.08, 'sine', 0.08);
  }, [playTone]);

  const success = useCallback(() => {
    if (!state.settings.soundEffects) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Two-note success chime
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch {
      // Audio not supported
    }
  }, [state.settings.soundEffects, getCtx]);

  const toggle = useCallback((on) => {
    playTone(on ? 660 : 440, 0.1, 'sine', 0.1);
  }, [playTone]);

  const timerDone = useCallback(() => {
    if (!state.settings.soundEffects) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Three-note alert
      [587.33, 698.46, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.4);
      });
    } catch {
      // Audio not supported
    }
  }, [state.settings.soundEffects, getCtx]);

  return { tap, success, toggle, timerDone };
}
