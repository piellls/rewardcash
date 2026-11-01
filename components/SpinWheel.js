'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';
import { usePrefersReducedMotion } from '@/components/motion';

// The prize wheel used by the daily spin and the sign-up spin.
// The server picks the prize (app/api/spin/route.js) and answers with an index into this list, so the order
// and the coin values here must stay in step with SPIN_PRIZES there. The wheel only animates to that answer.
export const WHEEL_PRIZES = [
  { coins: 10, label: '$0.01', color: '#cbd5e1', tint: 'rgba(148,163,184,0.16)' },
  { coins: 50, label: '$0.05', color: '#cbd5e1', tint: 'rgba(148,163,184,0.22)' },
  { coins: 250, label: '$0.25', color: '#34d399', tint: 'rgba(16,185,129,0.24)' },
  { coins: 1000, label: '$1.00', color: '#a98bff', tint: 'rgba(155,123,255,0.28)' },
  { coins: 2500, label: '$2.50', color: '#d8b4fe', tint: 'rgba(168,85,247,0.30)' },
  { coins: 10000, label: '$10.00', color: '#facc15', tint: 'rgba(234,179,8,0.30)' },
  { coins: 250000, label: '$250.00', color: '#fb7185', tint: 'rgba(239,68,68,0.34)' },
];

// The wheel has 12 slots; each holds one prize (an index into WHEEL_PRIZES). The common prizes appear more often,
// like the odds, and no two neighbours match.
const SLOTS = [0, 3, 1, 4, 0, 2, 1, 5, 0, 2, 1, 6];
const SLOT_DEG = 360 / SLOTS.length;

const CENTER = 100;
const RIM = 94;

const polar = (deg, r) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
};

const slicePath = (i) => {
  const [x0, y0] = polar(i * SLOT_DEG, RIM);
  const [x1, y1] = polar((i + 1) * SLOT_DEG, RIM);
  return `M ${CENTER} ${CENTER} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${RIM} ${RIM} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};

// Win celebration shared by both spins: fanfare, confetti from the top and a coin fountain mid-screen.
export function celebrateWin() {
  sfx.play('win');
  fx.confetti({ count: 120 });
  fx.burst(window.innerWidth / 2, window.innerHeight * 0.45, { coins: 24, sparks: 26 });
}

// ref.current.spinTo(prizeIndex) turns the wheel so that prize ends under the pointer and resolves when it stops.
const SpinWheel = forwardRef(function SpinWheel({ className = '', dimmed = false }, ref) {
  const reduce = usePrefersReducedMotion();
  const rotor = useRef(null);
  const angle = useRef(0); // total turn so far, in degrees (only grows)
  const raf = useRef(0);
  const timer = useRef(0);

  useEffect(() => () => { cancelAnimationFrame(raf.current); clearTimeout(timer.current); }, []);

  useImperativeHandle(ref, () => ({
    spinTo(prizeIndex) {
      return new Promise((resolve) => {
        const el = rotor.current;
        if (!el) { resolve(); return; }

        // Any slot that shows this prize will do; stop somewhere inside it, not always dead centre.
        const slots = SLOTS.map((p, i) => (p === prizeIndex ? i : -1)).filter((i) => i >= 0);
        const slot = slots.length ? slots[Math.floor(Math.random() * slots.length)] : 0;
        const stopAt = (slot + 0.5) * SLOT_DEG + (Math.random() - 0.5) * SLOT_DEG * 0.6;

        // The pointer is at the top, so the wheel must end turned by (360 - stopAt) modulo 360.
        const current = angle.current;
        const wanted = (360 - (stopAt % 360)) % 360;
        const extra = (wanted - (current % 360) + 360) % 360;
        const turns = reduce ? 1 : 6;
        const next = current + turns * 360 + extra;
        const duration = reduce ? 1400 : 5600;

        el.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.7, 0.1, 1)`;
        el.style.transform = `rotate(${next}deg)`;
        angle.current = next;
        sfx.play('open');

        // A soft tick each time a new slot passes the pointer, read from the real position every frame.
        let last = -1;
        const t0 = performance.now();
        const loop = () => {
          const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
          const deg = (Math.atan2(m.b, m.a) * 180) / Math.PI;
          const underPointer = (((-deg) % 360) + 360) % 360;
          const idx = Math.floor(underPointer / SLOT_DEG);
          if (idx !== last) { if (last !== -1) sfx.play('tick'); last = idx; }
          if (performance.now() - t0 < duration) raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);

        timer.current = setTimeout(() => { cancelAnimationFrame(raf.current); resolve(); }, duration + 120);
      });
    },
  }), [reduce]);

  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[22rem] select-none ${dimmed ? 'opacity-60' : ''} ${className}`}>
      {/* Pointer (does not turn) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 40 44"
        className="absolute left-1/2 top-0 z-20 h-[2.4rem] w-[2.2rem] -translate-x-1/2 -translate-y-[45%] drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
      >
        <path d="M20 42 L4 8 Q20 -2 36 8 Z" fill="#ffffff" stroke="#713fe1" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="20" cy="14" r="4" fill="#713fe1" />
      </svg>

      <div className="absolute inset-0 rounded-full shadow-[0_0_0_4px_#713fe1,0_0_46px_rgba(113,63,225,0.45)]" aria-hidden="true" />

      <div ref={rotor} className="absolute inset-0" style={{ transform: 'rotate(0deg)', willChange: 'transform' }}>
        <svg viewBox="0 0 200 200" role="img" aria-label="Prize wheel" className="h-full w-full">
          <circle cx={CENTER} cy={CENTER} r={RIM + 4} fill="#0f1019" />
          {SLOTS.map((p, i) => (
            <g key={i}>
              <path d={slicePath(i)} fill={i % 2 ? '#1b1c29' : '#151622'} />
              <path d={slicePath(i)} fill={WHEEL_PRIZES[p].tint} stroke="#0b0c13" strokeWidth="1" />
            </g>
          ))}
          {SLOTS.map((p, i) => {
            const c = (i + 0.5) * SLOT_DEG;
            return (
              <text
                key={`t${i}`}
                transform={`rotate(${c - 90} ${CENTER} ${CENTER})`}
                x={CENTER + RIM - 8}
                y={CENTER + 3.6}
                textAnchor="end"
                fontSize="10.5"
                fontWeight="800"
                fontFamily="inherit"
                fill={WHEEL_PRIZES[p].color}
              >
                {WHEEL_PRIZES[p].label}
              </text>
            );
          })}
          {Array.from({ length: SLOTS.length }).map((_, i) => {
            const [x, y] = polar(i * SLOT_DEG, RIM + 1);
            return <circle key={`b${i}`} cx={x} cy={y} r="2.1" fill="#facc15" />;
          })}
          <circle cx={CENTER} cy={CENTER} r="21" fill="#0f1019" stroke="#713fe1" strokeWidth="3" />
          <circle cx={CENTER} cy={CENTER} r="12" fill="#facc15" />
          <circle cx={CENTER} cy={CENTER} r="8.5" fill="none" stroke="#a16207" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
});

export default SpinWheel;
