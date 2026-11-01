import Link from 'next/link';

// Shared layout for the Privacy Policy and Terms of Service pages.
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <div className="mx-auto w-full max-w-[56rem] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <p className="g-eyebrow">Legal</p>
      <h1 className="g-title mt-3 text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-[var(--bb-muted)]">Last updated: {updated}</p>
      <p className="mt-6 text-base leading-relaxed text-zinc-300">{intro}</p>

      <div className="mt-10 space-y-9">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-white">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="mt-3 text-base leading-relaxed text-zinc-300">{text}</p>
            ))}
            {section.items && (
              <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-zinc-300">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-[var(--bb-muted)]">
        Questions? Use <strong>Contact support</strong> in the footer of any page. See also our{' '}
        <Link href={title === 'Privacy Policy' ? '/terms' : '/privacy'} className="text-[var(--bb-berry-300)] underline underline-offset-4">
          {title === 'Privacy Policy' ? 'Terms of Service' : 'Privacy Policy'}
        </Link>{' '}
        and{' '}
        <Link href="/rules" className="text-[var(--bb-berry-300)] underline underline-offset-4">Rules</Link>.
      </p>
    </div>
  );
}
