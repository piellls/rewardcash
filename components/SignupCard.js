'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from './AuthForm';
import Art from './Art';

// Sign-up form shown right in the home page hero (the header's "Register" button scrolls here).
export default function SignupCard() {
  const router = useRouter();

  return (
    <div id="signup" className="relative scroll-mt-24">
      {/* Decorative art peeking over the card edges (wide screens only; never takes clicks) */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-12 right-3 z-10 hidden w-[92px] sm:block">
        <Art name="coins" size="100%" sizes="110px" glow="gold" float eager />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-9 -left-3 z-10 hidden w-[88px] sm:block">
        <Art name="gem" size="100%" sizes="110px" glow="blue" float eager style={{ '--delay': '-2.5s' }} />
      </div>

      <div className="g-neon g-neon-live relative rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-8">
        <p className="g-eyebrow mb-3">Join the game</p>
        <h2 className="g-title text-3xl text-white">Create your free account</h2>
        <p className="mb-6 mt-2 text-sm text-[var(--bb-muted)]">You start with 100 coins. No deposit, no card.</p>

        <AuthForm mode="register" deviceCheck="on-focus" onSuccess={() => router.push('/earn')} />

        <p className="mt-6 text-center text-sm text-[var(--bb-muted)]">
          Already a member?{' '}
          <Link href="/signin" className="font-bold text-white underline-offset-4 transition-colors hover:text-[#9cf3bf] hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-4 border-t border-[var(--bb-border)] pt-4 text-center text-xs leading-relaxed text-[var(--bb-subtle)]">
          By continuing you confirm you are at least 18 years old.
        </p>
      </div>
    </div>
  );
}
