'use client';

import Art from './Art';

export function Chip({ icon: Icon, children, tone = 'default' }) {
  return <span className={`page-chip page-chip-${tone}`}>
    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{children}
  </span>;
}

export default function PageHeader({ eyebrow, icon: Icon, title, accent, subtitle, children, align = 'center', art, artGlow = 'purple' }) {
  return (
    <header className={`page-hero ${!art && align === 'center' ? 'page-hero-centered' : ''}`}>
      <div className="page-hero-copy">
        {eyebrow && <span className="g-eyebrow">{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{eyebrow}</span>}
        <h1 className="g-title">{title}{accent && <> <span className="text-primary">{accent}</span></>}</h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        {children && <div className="page-hero-chips">{children}</div>}
      </div>
      {art && <div className="page-hero-art"><Art name={art} size="100%" glow={artGlow} priority /></div>}
    </header>
  );
}
