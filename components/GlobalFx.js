'use client';

import { useEffect } from 'react';
import { sfx } from '@/lib/sfx';

// Page-wide feel, mounted once in the layout:
//  - unlocks audio on the first gesture and plays a soft tap on buttons, links and tabs
//  - feeds the pointer position to cards marked .g-spot (the spotlight that follows the cursor)
//  - renders the scroll progress bar (CSS only, shown where scroll-driven animations exist)
const TAP_SELECTOR = 'button, a[href], [role="tab"], [role="radio"], summary, select';

export default function GlobalFx() {
  useEffect(() => {
    const onDown = (e) => {
      sfx.unlock();
      const el = e.target instanceof Element ? e.target.closest(TAP_SELECTOR) : null;
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-sfx="off"]')) return;
      sfx.play('tap');
    };
    const onKey = () => sfx.unlock();

    let raf = 0;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target instanceof Element ? e.target.closest('.g-spot') : null;
      if (!card) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };

    document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
    document.addEventListener('keydown', onKey, { capture: true, passive: true });
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onDown, { capture: true });
      document.removeEventListener('keydown', onKey, { capture: true });
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div aria-hidden="true" className="g-progress" />;
}
