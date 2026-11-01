'use client';

import { useRef } from 'react';

// BlueberryCash artwork (transparent WebP in /public/art). One component for every page so sizing,
// loading and the optional float / 3D tilt behave the same everywhere.
//   name     gem | gift | trophy | coins | wheel | referral | berry
//   size     rendered width in px (the image is square)
//   float    slow idle bob (CSS animation on the inner wrapper)
//   tilt     follows the pointer on devices that have one (transform is set on this element only)
//   glow     soft coloured light behind the art
//   sizes    the rendered width hint for srcSet (pass e.g. "110px" for small decorative uses)
//   priority load now with high fetch priority (the main picture of a page); eager loads now without it
const ART = { gem: 'earningboosts.png', gift: 'earniconlanding.png', trophy: 'exclusivetournaments.png', coins: 'withdrawiconlanding.png', wheel: 'dailywheelspins.png', referral: 'affiliateicon.png', berry: 'signupicon2landing.png' };

const GLOW = { purple: 'rgba(113,63,225,0.45)', blue: 'rgba(155,123,255,0.4)', gold: 'rgba(243,199,107,0.35)', green: 'rgba(66,216,160,0.32)' };

export default function Art({ name, size = 240, float = false, tilt = false, glow = 'purple', priority = false, eager = false, sizes = '(max-width: 767px) 180px, 280px', className = '', style, alt = '' }) {
  const ref = useRef(null);
  const raf = useRef(0);

  const onMove = (e) => {
    if (!tilt || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(700px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 14).toFixed(2)}deg)`;
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onPointerMove={tilt ? onMove : undefined}
      onPointerLeave={tilt ? onLeave : undefined}
      className={`g-art ${tilt ? 'g-tilt' : ''} ${className}`}
      style={{ width: size, maxWidth: '100%', '--glow': GLOW[glow] || GLOW.purple, ...style }}
    >
      <div className={float ? 'bb-float' : ''} style={float ? { '--d': '6.5s' } : undefined}>
        <img
          src={ART[name] ? `/home-reference/${ART[name]}` : `/art/${name}.webp`}
          srcSet={ART[name] ? undefined : `/art/${name}-s.webp 240w, /art/${name}.webp 600w`}
          sizes={sizes}
          alt={alt}
          width="600"
          height="600"
          loading={priority || eager ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable="false"
          className="block aspect-square h-auto w-full object-contain select-none"
        />
      </div>
    </div>
  );
}
