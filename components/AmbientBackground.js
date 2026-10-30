// One fixed, decorative layer behind every page: two slow-drifting colour orbs, a faint grid and a few
// sparks that rise through the screen. Pure CSS (see .g-ambient in globals.css), no JS, ignored by assistive tech.
// Values are fixed (not random) so server and browser render the same markup.
const SPARKS = [
  { x: '6%', s: 3, d: 19, delay: -2, dx: 30 },
  { x: '14%', s: 5, d: 24, delay: -11, dx: -20 },
  { x: '23%', s: 3, d: 17, delay: -7, dx: 40 },
  { x: '31%', s: 4, d: 26, delay: -15, dx: -35 },
  { x: '42%', s: 3, d: 21, delay: -4, dx: 25 },
  { x: '51%', s: 5, d: 28, delay: -19, dx: -30 },
  { x: '60%', s: 3, d: 18, delay: -9, dx: 35 },
  { x: '69%', s: 4, d: 23, delay: -13, dx: -25 },
  { x: '77%', s: 3, d: 20, delay: -1, dx: 30 },
  { x: '85%', s: 5, d: 27, delay: -17, dx: -40 },
  { x: '92%', s: 3, d: 22, delay: -6, dx: 20 },
  { x: '97%', s: 4, d: 25, delay: -21, dx: -15 },
];

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="g-ambient">
      <span className="g-orb g-orb-a" />
      <span className="g-orb g-orb-b" />
      <span className="g-grid" />
      {SPARKS.map((p, i) => (
        <i
          key={i}
          className="g-spark"
          style={{ '--x': p.x, '--s': `${p.s}px`, '--d': `${p.d}s`, '--delay': `${p.delay}s`, '--dx': `${p.dx}px` }}
        />
      ))}
    </div>
  );
}
