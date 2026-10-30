'use client';

import { useSyncExternalStore } from 'react';

// Tiny UI sound engine. Every sound is synthesised with the Web Audio API (no audio files to download).
// - Starts only after the first tap/click/keypress (browsers block audio before that).
// - One master switch, remembered in localStorage, shown as a speaker button in the header.
// - Quiet on purpose: short, low-gain sounds that sit under the UI instead of on top of it.

const KEY = 'bb_sound';
const MASTER = 0.5;

let ctx = null;
let master = null;
let enabled = true;
let ready = false;
let unlocked = false; // set by the first user gesture
const listeners = new Set();
const lastPlayed = {};

function readPref() {
  try { return localStorage.getItem(KEY) !== '0'; } catch { return true; }
}

function init() {
  if (ready || typeof window === 'undefined') return;
  ready = true;
  enabled = readPref();
}

function emit() { listeners.forEach((fn) => fn()); }

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = MASTER;
      const comp = ctx.createDynamicsCompressor(); // keeps stacked sounds from clipping
      master.connect(comp);
      comp.connect(ctx.destination);
    } catch { ctx = null; return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// One oscillator note with a fast attack and an exponential fade.
function tone(c, { f = 440, to, type = 'sine', t = 0, dur = 0.12, g = 0.08, attack = 0.005 }) {
  const t0 = c.currentTime + t;
  const o = c.createOscillator();
  const v = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  v.gain.setValueAtTime(0.0001, t0);
  v.gain.exponentialRampToValueAtTime(g, t0 + attack);
  v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(v); v.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

// Filtered noise sweep, used for whooshes.
function sweep(c, { from = 400, to = 1800, t = 0, dur = 0.2, g = 0.05, q = 1.2 }) {
  const t0 = c.currentTime + t;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t0);
  bp.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const v = c.createGain();
  v.gain.setValueAtTime(0.0001, t0);
  v.gain.exponentialRampToValueAtTime(g, t0 + dur * 0.35);
  v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(bp); bp.connect(v); v.connect(master);
  s.start(t0); s.stop(t0 + dur + 0.02);
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

const SOUNDS = {
  tap: (c) => tone(c, { f: 540, to: 360, type: 'sine', dur: 0.05, g: 0.05 }),
  hover: (c) => tone(c, { f: 900, type: 'sine', dur: 0.03, g: 0.012 }),
  coin: (c) => {
    tone(c, { f: N.B5, type: 'square', dur: 0.08, g: 0.035 });
    tone(c, { f: N.E6, type: 'square', t: 0.07, dur: 0.22, g: 0.035 });
    tone(c, { f: N.E6 * 2, type: 'sine', t: 0.07, dur: 0.3, g: 0.02 });
  },
  success: (c) => [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(c, { f, type: 'triangle', t: i * 0.075, dur: 0.22, g: 0.07 })),
  error: (c) => {
    tone(c, { f: 170, to: 105, type: 'sawtooth', dur: 0.22, g: 0.05 });
    tone(c, { f: 128, to: 80, type: 'square', t: 0.06, dur: 0.2, g: 0.025 });
  },
  open: (c) => { sweep(c, { from: 350, to: 1900, dur: 0.18, g: 0.04 }); tone(c, { f: 420, to: 760, type: 'sine', dur: 0.14, g: 0.03 }); },
  close: (c) => { sweep(c, { from: 1700, to: 320, dur: 0.14, g: 0.03 }); tone(c, { f: 640, to: 330, type: 'sine', dur: 0.1, g: 0.025 }); },
  tick: (c) => tone(c, { f: 1500 + Math.random() * 120, type: 'square', dur: 0.02, g: 0.022 }),
  copy: (c) => { tone(c, { f: N.E5, type: 'triangle', dur: 0.08, g: 0.05 }); tone(c, { f: N.A5, type: 'triangle', t: 0.07, dur: 0.12, g: 0.05 }); },
  levelup: (c) => [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(c, { f, type: 'triangle', t: i * 0.07, dur: 0.28, g: 0.06 })),
  win: (c) => {
    [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6, N.E6, N.G6, N.C7].forEach((f, i) => tone(c, { f, type: 'triangle', t: i * 0.065, dur: 0.3, g: 0.065 }));
    [N.E6, N.G6, N.C7].forEach((f, i) => tone(c, { f, type: 'sine', t: 0.35 + i * 0.1, dur: 0.5, g: 0.03 }));
    sweep(c, { from: 600, to: 5000, t: 0.0, dur: 0.6, g: 0.025, q: 0.8 });
  },
};

export const sfx = {
  get enabled() { init(); return enabled; },
  // Call from any user gesture. Creates/resumes the audio context.
  unlock() { init(); unlocked = true; if (enabled) getCtx(); },
  play(name, { force = false } = {}) {
    init();
    if ((!enabled && !force) || !unlocked) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    const fn = SOUNDS[name];
    if (!fn) return;
    const now = performance.now();
    if (now - (lastPlayed[name] || 0) < 35) return; // never stack the same sound within a frame or two
    lastPlayed[name] = now;
    const c = getCtx();
    if (!c || c.state !== 'running') return; // not unlocked yet: stay silent instead of queueing
    try { fn(c); } catch { /* audio is never worth an error */ }
  },
  setEnabled(on) {
    init();
    enabled = !!on;
    unlocked = true; // toggling is itself a user gesture
    try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch {}
    if (enabled) { getCtx(); setTimeout(() => this.play('tap', { force: true }), 30); }
    emit();
  },
  toggle() { this.setEnabled(!sfx.enabled); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

// React hook: re-renders when the switch changes.
export function useSound() {
  const on = useSyncExternalStore(sfx.subscribe, () => sfx.enabled, () => true);
  return { on, toggle: () => sfx.toggle() };
}
