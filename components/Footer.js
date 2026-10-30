'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LifeBuoy, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/sfx';

const LINKS = [
  { href: '/earn', label: 'Earn coins' },
  { href: '/cashout', label: 'Cashout' },
  { href: '/spin', label: 'Daily spin' },
  { href: '/referrals', label: 'Referrals' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export default function Footer() {
  const pathname = usePathname();
  const { on, toggle } = useSound();

  // The earn page is a full-screen offer wall, so it has no footer
  if (pathname === '/earn') {
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t border-[var(--bb-border)] bg-[var(--bb-sidebar)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center" aria-label="BlueberryCash home">
              <img
                src="/offerwall/blueberry_logo.png"
                alt="BlueberryCash"
                width="1024"
                height="512"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--bb-muted)]">
              BlueberryCash is a rewards site. Complete games, apps and surveys to earn coins, then cash out to PayPal, a Visa card or crypto. 1,000 coins = $1.00.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="text-sm font-semibold text-[var(--bb-text)]">Explore</h3>
            <ul className="mt-4 space-y-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--bb-muted)] transition-colors hover:text-[var(--bb-text)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-[var(--bb-text)]">Help</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('bb:open-support'))}
                  className="inline-flex items-center gap-2 text-sm text-[var(--bb-muted)] transition-colors hover:text-[var(--bb-text)]"
                >
                  <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Contact support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-sfx="off"
                  onClick={toggle}
                  aria-pressed={on}
                  className="inline-flex items-center gap-2 text-sm text-[var(--bb-muted)] transition-colors hover:text-[var(--bb-text)]"
                >
                  {on ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
                  Sound effects: {on ? 'on' : 'off'}
                </button>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--bb-muted)]">
                <ShieldCheck className="h-4 w-4 text-[var(--bb-success)]" aria-hidden="true" /> Secure connection (HTTPS)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--bb-border)] pt-6 text-xs text-[var(--bb-subtle)]">
          <p>© {new Date().getFullYear()} BlueberryCash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
