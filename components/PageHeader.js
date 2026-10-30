'use client';

import Art from './Art';

// Shared page title block: eyebrow, headline (with a gradient accent), subtitle, optional chips and optional artwork.
// With `art` the block becomes text on the left and a floating, tilting illustration on the right (stacked on phones).
// Plays one short entrance (70ms stagger) when the page opens.
export function Chip({ icon: Icon, children, tone = 'default' }) {
  const tones = {
    default: 'border-dark-border text-zinc-300',
    gold: 'border-[rgba(243,199,107,0.4)] text-[#f3c76b] bg-[rgba(243,199,107,0.08)]',
    green: 'border-[rgba(66,216,160,0.4)] text-[#42d8a0] bg-[rgba(66,216,160,0.08)]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-[var(--bb-surface)] px-3 py-1.5 text-sm font-semibold ${tones[tone]}`}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default function PageHeader({ eyebrow, icon: Icon, title, accent, subtitle, children, align = 'center', art, artGlow = 'purple', artSize = 260 }) {
  const center = align === 'center';
  const text = (
    <div className={`flex min-w-0 flex-col ${center ? 'items-center text-center' : 'items-start text-left'} ${art ? 'md:items-start md:text-left' : ''}`}>
      {eyebrow && (
        <span className="g-eyebrow bb-enter" style={{ '--i': 0 }}>
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {eyebrow}
        </span>
      )}
      <h1 className="g-title bb-enter mt-4 text-4xl sm:text-5xl lg:text-6xl" style={{ '--i': 1 }}>
        {title}{accent ? <> <span className="text-gradient">{accent}</span></> : null}
      </h1>
      {subtitle && (
        <p className="bb-enter mt-3 max-w-xl text-base text-zinc-400 sm:text-lg" style={{ '--i': 2 }}>{subtitle}</p>
      )}
      {children && (
        <div className={`bb-enter mt-5 flex flex-wrap gap-2 ${center && !art ? 'justify-center' : ''} ${art ? 'justify-center md:justify-start' : ''}`} style={{ '--i': 3 }}>{children}</div>
      )}
    </div>
  );

  if (!art) {
    return <header className="py-8 sm:py-10">{text}</header>;
  }

  return (
    <header className="grid items-center gap-2 py-4 sm:py-8 md:grid-cols-[1fr_auto] md:gap-10">
      <div className="bb-enter order-first mx-auto w-[150px] sm:w-[190px] md:order-last md:w-[var(--artw)]" style={{ '--i': 1, '--artw': `${artSize}px` }}>
        <Art name={art} size="100%" glow={artGlow} float tilt priority />
      </div>
      {text}
    </header>
  );
}
