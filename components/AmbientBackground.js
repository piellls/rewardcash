// One fixed, decorative layer behind every page: two slow-drifting colour orbs and a faint grid.
// Pure CSS (see .g-ambient in globals.css), no JS, ignored by assistive tech.
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="g-ambient">
      <span className="g-orb g-orb-a" />
      <span className="g-orb g-orb-b" />
      <span className="g-grid" />
    </div>
  );
}
