'use client';

// Celebration effects drawn on one shared, full-screen canvas (coin bursts and confetti).
// - The canvas is created on first use, ignores the pointer, and removes itself when nothing is left to draw.
// - Skipped completely for visitors who prefer reduced motion.
// - Hard cap on live particles so a burst can never slow the page down.

const MAX = 160;
const COIN = ['#f3c76b', '#ffd98a', '#e8a93a'];
const SPARK = ['#ffffff', '#9cf3bf', '#2fd672', '#2cc9b5', '#42d8a0'];
const CONFETTI = ['#2fd672', '#2cc9b5', '#f3c76b', '#42d8a0', '#f17685', '#ffffff'];

let canvas = null;
let c2d = null;
let parts = [];
let raf = 0;
let last = 0;

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ensure() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998';
  document.body.appendChild(canvas);
  c2d = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function teardown() {
  cancelAnimationFrame(raf); raf = 0;
  window.removeEventListener('resize', resize);
  canvas?.remove();
  canvas = null; c2d = null; parts = [];
}

function drawCoin(p) {
  const squish = Math.abs(Math.cos(p.rot));
  c2d.save();
  c2d.translate(p.x, p.y);
  c2d.rotate(p.tilt);
  c2d.scale(Math.max(0.12, squish), 1);
  c2d.beginPath(); c2d.arc(0, 0, p.r, 0, Math.PI * 2);
  c2d.fillStyle = p.color; c2d.fill();
  c2d.lineWidth = Math.max(1, p.r * 0.18); c2d.strokeStyle = 'rgba(120,70,0,0.55)'; c2d.stroke();
  c2d.beginPath(); c2d.arc(-p.r * 0.25, -p.r * 0.25, p.r * 0.35, 0, Math.PI * 2);
  c2d.fillStyle = 'rgba(255,255,255,0.45)'; c2d.fill();
  c2d.restore();
}

function drawSpark(p) {
  c2d.save();
  c2d.translate(p.x, p.y); c2d.rotate(p.rot);
  c2d.fillStyle = p.color;
  const r = p.r;
  c2d.beginPath();
  c2d.moveTo(0, -r); c2d.lineTo(r * 0.28, -r * 0.28); c2d.lineTo(r, 0); c2d.lineTo(r * 0.28, r * 0.28);
  c2d.lineTo(0, r); c2d.lineTo(-r * 0.28, r * 0.28); c2d.lineTo(-r, 0); c2d.lineTo(-r * 0.28, -r * 0.28);
  c2d.closePath(); c2d.fill();
  c2d.restore();
}

function drawPiece(p) {
  c2d.save();
  c2d.translate(p.x, p.y); c2d.rotate(p.rot);
  c2d.scale(1, Math.max(0.2, Math.abs(Math.cos(p.flip))));
  c2d.fillStyle = p.color;
  c2d.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
  c2d.restore();
}

function frame(t) {
  const dt = Math.min(0.033, (t - last) / 1000 || 0.016);
  last = t;
  const w = window.innerWidth, h = window.innerHeight;
  c2d.clearRect(0, 0, w, h);
  parts = parts.filter((p) => p.life > 0 && p.y < h + 40);
  for (const p of parts) {
    p.life -= dt;
    p.vy += p.g * dt;
    p.vx *= p.drag; p.vy *= p.drag;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.vr * dt; p.flip += p.vf * dt;
    c2d.globalAlpha = Math.max(0, Math.min(1, p.life / p.fade));
    if (p.kind === 'coin') drawCoin(p); else if (p.kind === 'spark') drawSpark(p); else drawPiece(p);
  }
  c2d.globalAlpha = 1;
  if (parts.length) raf = requestAnimationFrame(frame); else teardown();
}

function start() {
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
}

function room(n) { return Math.max(0, Math.min(n, MAX - parts.length)); }
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const fx = {
  // A fountain of coins and sparkles from a point (x, y in viewport pixels).
  burst(x, y, { coins = 14, sparks = 16 } = {}) {
    if (typeof window === 'undefined' || reduced() || document.visibilityState !== 'visible') return;
    ensure();
    for (let i = room(coins); i > 0; i--) {
      const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05); const s = rnd(260, 620);
      parts.push({ kind: 'coin', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 1500, drag: 0.992, r: rnd(6, 10), color: pick(COIN), rot: rnd(0, 6), vr: rnd(8, 18), tilt: rnd(-0.6, 0.6), life: rnd(0.9, 1.5), fade: 0.35 });
    }
    for (let i = room(sparks); i > 0; i--) {
      const a = rnd(0, Math.PI * 2); const s = rnd(80, 380);
      parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 220, drag: 0.97, r: rnd(3, 7), color: pick(SPARK), rot: rnd(0, 6), vr: rnd(-6, 6), life: rnd(0.5, 1.0), fade: 0.4 });
    }
    start();
  },
  // Confetti raining from the top edge, for big wins.
  confetti({ count = 110 } = {}) {
    if (typeof window === 'undefined' || reduced() || document.visibilityState !== 'visible') return;
    ensure();
    const w = window.innerWidth;
    for (let i = room(count); i > 0; i--) {
      parts.push({ kind: 'piece', x: rnd(0, w), y: rnd(-60, -10), vx: rnd(-90, 90), vy: rnd(60, 260), g: 380, drag: 0.995, r: rnd(4, 8), color: pick(CONFETTI), rot: rnd(0, 6), vr: rnd(-8, 8), flip: rnd(0, 6), vf: rnd(5, 12), life: rnd(2.4, 3.6), fade: 0.6 });
    }
    start();
  },
  // Burst centred on a DOM element.
  burstAt(el, opts) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  },
};
