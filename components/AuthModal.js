'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { X } from 'lucide-react';
import Art from './Art';
import AuthForm from './AuthForm';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', defaultEmail = '' }) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (isOpen) sfx.play('open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLogin = tab === 'login';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      {/* Backdrop */}
      <div className="g-fade fixed inset-0 bg-[#05070d]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="g-modal g-neon relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[var(--bb-surface)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] md:flex-row">

        {/* Left: promo (desktop only) */}
        <div className="relative hidden shrink-0 flex-col items-center justify-between overflow-hidden border-r border-[var(--bb-border)] bg-[linear-gradient(160deg,#101935_0%,#0f1424_60%)] p-8 text-center md:flex md:w-[42%]">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#7854f7]/30 blur-3xl" />

          <img src="/offerwall/blueberry_logo.png" alt="BlueberryCash" className="relative h-14 w-auto object-contain" />

          <div className="relative my-auto flex flex-col items-center py-6">
            <Art name="gift" size={200} float tilt glow="blue" priority className="mb-3" />
            <p className="g-title text-2xl text-white">Start earning in minutes</p>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-[var(--bb-muted)]">
              Free to join. Complete offers, collect coins and cash out at 1,000 coins = $1.
            </p>
          </div>

          <ul className="relative w-full space-y-2 text-left">
            {[
              'Create your free account',
              'Complete offers and earn coins',
              'Open your sign-up chest (up to $250, very rare)',
            ].map((t, n) => (
              <li key={t} className="flex items-center gap-3 rounded-xl border border-[#7854f7]/20 bg-[#7854f7]/10 px-3.5 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7854f7] text-xs font-extrabold text-white">{n + 1}</span>
                <span className="text-xs font-semibold text-zinc-200">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-between overflow-y-auto p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bb-border)] bg-[var(--bb-bg)]/60 text-zinc-400 transition-[transform,color,background-color] duration-150 hover:bg-white/5 hover:text-white active:scale-95"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div>
            <p className="g-eyebrow mb-3">{isLogin ? 'Welcome back' : 'Join the game'}</p>
            <h2 id="auth-title" className="g-title mb-6 text-3xl text-white">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>

            <AuthForm mode={tab} onModeChange={setTab} defaultEmail={defaultEmail} onSuccess={onClose} active={isOpen} />
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-[var(--bb-muted)]">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setTab(isLogin ? 'register' : 'login')}
                className="font-bold text-white underline-offset-4 transition-colors hover:text-[#c3b2ff] hover:underline"
              >
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </p>
            <p className="border-t border-[var(--bb-border)] pt-4 text-center text-xs leading-relaxed text-[var(--bb-subtle)]">
              By continuing you confirm you are at least 18 years old.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
