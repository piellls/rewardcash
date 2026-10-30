'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import Art from '@/components/Art';
import { Reveal } from '@/components/motion';

export default function SignInView() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Someone who is already signed in has nothing to do here
  useEffect(() => {
    if (!loading && user) router.replace('/earn');
  }, [loading, user, router]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6">
      <Reveal className="g-neon g-neon-live grid w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:grid-cols-[0.9fr_1.1fr]">
        {/* Left: art (wide screens) */}
        <div className="relative hidden flex-col items-center justify-center gap-4 overflow-hidden border-r border-[var(--bb-border)] bg-[linear-gradient(160deg,#101935_0%,#0f1424_60%)] p-8 text-center md:flex">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-[#7854f7]/30 blur-3xl" />
          <Art name="trophy" size={220} float tilt glow="gold" priority className="relative" />
          <p className="g-title relative text-2xl text-white">Good to see you again</p>
          <p className="relative max-w-[16rem] text-sm leading-relaxed text-[var(--bb-muted)]">
            Your coins and level are waiting. Pick a task and keep climbing the leaderboard.
          </p>
        </div>

        {/* Right: form */}
        <div className="p-6 sm:p-10">
          <div className="mx-auto -mt-1 mb-4 w-[104px] md:hidden" aria-hidden="true">
            <Art name="trophy" size="100%" sizes="110px" float glow="gold" priority />
          </div>
          <p className="g-eyebrow mb-3">Welcome back</p>
          <h1 className="g-title mb-6 text-3xl text-white sm:text-4xl">Sign in</h1>

          <AuthForm mode="login" onSuccess={() => router.push('/earn')} />

          <p className="mt-6 text-center text-sm text-[var(--bb-muted)]">
            New here?{' '}
            <Link href="/#signup" className="font-bold text-white underline-offset-4 transition-colors hover:text-[#c3b2ff] hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 border-t border-[var(--bb-border)] pt-4 text-center text-xs leading-relaxed text-[var(--bb-subtle)]">
            By continuing you confirm you are at least 18 years old.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
