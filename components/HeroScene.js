'use client';

import { useRef } from 'react';
import { useInView, useParallax } from './motion';
import Art from './Art';

// The home page hero: a night landscape drawn in code (sky, stars, three hills, a soft glow) with the
// BlueberryCash mascot, coins and gem standing on the hill. Everything behind `children` is decorative.
//   - Stars: fixed positions (no randomness, so server and browser render the same markup); a few twinkle.
//   - Hills: one SVG stretched to the width, so it never needs an image download.
//   - With a mouse the art and hills drift a little at different depths (see useParallax); touch and
//     reduced-motion visitors get a still scene.
//   - Animations pause while the hero is offscreen.

function makeStars() {
  let s = 11;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 54 }, (_, i) => ({
    x: +(rnd() * 100).toFixed(2),
    y: +(rnd() * 64).toFixed(2),
    r: +(0.6 + rnd() * 1.3).toFixed(2),
    twinkle: i % 4 === 0,
    delay: +(rnd() * 5).toFixed(2),
  }));
}
const STARS = makeStars();

export default function HeroScene({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  useParallax(ref);

  return (
    <section ref={ref} className={`bb-scene relative isolate overflow-hidden ${inView ? '' : 'bb-paused'} ${className}`}>
      {/* Sky glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_30%_100%,rgba(120,84,247,0.45),transparent_70%),radial-gradient(45%_40%_at_88%_8%,rgba(69,151,255,0.22),transparent_70%)]" />

      {/* Stars */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        {STARS.map((st, i) => (
          <circle
            key={i}
            cx={`${st.x}%`}
            cy={`${st.y}%`}
            r={st.r}
            fill="#ffffff"
            className={st.twinkle ? 'g-star' : undefined}
            style={st.twinkle ? { animationDelay: `${st.delay}s` } : { opacity: 0.55 }}
          />
        ))}
      </svg>

      {/* Hills: far, middle and near, each a little darker and closer */}
      <div aria-hidden="true" className="g-depth pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46%] min-h-[240px]" data-depth="6">
        <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="hs-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a3bb8" stopOpacity="0.55" />
              <stop offset="1" stopColor="#1a1650" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="hs-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a3180" />
              <stop offset="1" stopColor="#12183a" />
            </linearGradient>
            <linearGradient id="hs-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1f2a66" />
              <stop offset="1" stopColor="#090d18" />
            </linearGradient>
          </defs>
          <path d="M0 210C160 120 300 150 430 200S700 90 880 150 1200 90 1440 170V420H0Z" fill="url(#hs-far)" />
          <path d="M0 270C200 200 360 250 560 240S900 170 1100 230 1340 220 1440 250V420H0Z" fill="url(#hs-mid)" />
          <path d="M0 345C240 292 420 332 640 322S1000 282 1200 322 1380 332 1440 322V420H0Z" fill="url(#hs-near)" stroke="rgba(195,178,255,0.28)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Fade into the page below */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-b from-transparent to-[var(--bb-bg)]" />

      {/* Characters on the hill (aligned to the page column, behind the text and the card) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
        <div className="relative mx-auto h-full max-w-6xl">
          <div className="g-depth absolute bottom-6 left-[3%] hidden w-[150px] sm:block lg:bottom-9" data-depth="14">
            <Art name="berry" size="100%" sizes="150px" glow="purple" float eager />
          </div>
          <div className="g-depth absolute bottom-4 left-[25%] hidden w-[108px] sm:block lg:bottom-6" data-depth="24">
            <Art name="coins" size="100%" sizes="110px" glow="gold" float eager style={{ '--delay': '-1.5s' }} />
          </div>
          <div className="g-depth absolute bottom-16 left-[37%] hidden w-[84px] sm:block lg:bottom-20" data-depth="32">
            <Art name="gem" size="100%" sizes="90px" glow="blue" float eager style={{ '--delay': '-3s' }} />
          </div>
          {/* Phones: just the mascot, tucked in the corner under the card */}
          <div className="absolute bottom-3 right-4 w-[84px] sm:hidden">
            <Art name="berry" size="100%" sizes="90px" glow="purple" float eager />
          </div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
