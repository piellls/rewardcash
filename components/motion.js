'use client';

// Shared motion helpers used across pages. All of them respect prefers-reduced-motion.

import { useState, useEffect, useRef } from 'react';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduce;
}

// true while the element is on screen (used to pause decorative loops offscreen)
export function useInView(ref) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

// Layers inside `ref` that carry data-depth="N" drift up to N px against the mouse (desktop only, off for reduced motion).
export function useParallax(ref) {
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.querySelectorAll('[data-depth]').forEach((l) => {
          const d = Number(l.dataset.depth) || 0;
          l.style.transform = `translate3d(${(px * d).toFixed(1)}px, ${(py * d).toFixed(1)}px, 0)`;
        });
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.querySelectorAll('[data-depth]').forEach((l) => { l.style.transform = ''; });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [ref, reduce]);
}

// Fades and lifts a block in once, the first time it scrolls into view.
// `i` staggers siblings (70ms each). `plain` only sets data-visible on the wrapper, for children that animate themselves.
export function Reveal({ as: Tag = 'div', i = 0, plain = false, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      data-visible={seen ? '' : undefined}
      style={{ '--i': Math.min(i, 8), ...style }}
      className={`${plain ? '' : 'bb-reveal'} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Counts up from 0 once when it first becomes visible. Later changes of the value just update it.
export function CountUp({ value, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const played = useRef(false);
  const [shown, setShown] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || played.current || typeof IntersectionObserver === 'undefined') { setShown(value); return; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      played.current = true;
      const t0 = performance.now();
      const duration = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        setShown(value * (1 - Math.pow(1 - p, 4))); // ease-out quart
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, reduce]);

  return (
    <span ref={ref}>
      {prefix}{shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// A number that glides to its new value and pops when it goes up (balances, XP).
// `celebrate` adds a coin sound and a small coin burst whenever the number goes up (used for the balance).
export function AnimatedNumber({ value = 0, className = '', celebrate = false }) {
  const reduce = usePrefersReducedMotion();
  const elRef = useRef(null);
  const target = Number(value) || 0;
  const [shown, setShown] = useState(target);
  const [popKey, setPopKey] = useState(0);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    if (target > from) {
      setPopKey((k) => k + 1);
      if (celebrate) { sfx.play('coin'); fx.burstAt(elRef.current, { coins: 8, sparks: 10 }); }
    }
    if (reduce) { setShown(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const duration = Math.min(900, 350 + Math.abs(target - from) * 0.3);
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce, celebrate]);

  return (
    <span ref={elRef} key={popKey} className={`${popKey ? 'g-pop' : ''} ${className}`}>
      {shown.toLocaleString('en-US')}
    </span>
  );
}
