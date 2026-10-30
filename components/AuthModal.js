'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2, ShieldAlert, Eye, EyeOff, Zap, Gift } from 'lucide-react';
import { db } from '@/lib/db';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', defaultEmail = '' }) {
  const [tab, setTab] = useState(defaultTab);
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceHasAccount, setDeviceHasAccount] = useState(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (tab === 'register' && isOpen) {
      db.checkDeviceHasAccount().then(existingUsername => {
        setDeviceHasAccount(existingUsername);
      });
    } else {
      setDeviceHasAccount(null);
    }
  }, [tab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!username.trim()) throw new Error('Username is required!');
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = tab === 'login';
  const field = 'w-full rounded-xl border border-[var(--bb-border)] bg-[var(--bb-bg)] py-3 pl-10 pr-4 text-base text-white placeholder:text-zinc-500 transition-colors focus:border-[#7854f7] focus:outline-none focus:ring-2 focus:ring-[#7854f7]/30';

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
            <div className="bb-float mb-5 text-[#f3c76b]" style={{ '--d': '5s' }}>
              <Gift className="h-20 w-20 drop-shadow-[0_10px_24px_rgba(243,199,107,0.35)]" strokeWidth={1.4} aria-hidden="true" />
            </div>
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

            {error && (
              <div role="alert" className="g-fade mb-4 flex items-start gap-2 rounded-xl border border-[#f17685]/40 bg-[#f17685]/10 p-3 text-sm text-[#f9a4af]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f17685]" aria-hidden="true" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {deviceHasAccount && !isLogin ? (
              <div className="space-y-4 rounded-2xl border border-[#f17685]/30 bg-[#f17685]/10 px-4 py-6 text-center">
                <div className="inline-flex rounded-full bg-[#f17685]/15 p-3.5 text-[#f17685]">
                  <ShieldAlert className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="g-title text-lg text-white">Device already registered</h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--bb-muted)]">
                  An account (<strong className="font-bold text-[#c3b2ff]">{deviceHasAccount}</strong>) already exists on this device. To keep rewards fair, only one account per device is allowed.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="btn-gaming w-full rounded-xl py-3 text-xs"
                >
                  Sign in to that account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="auth-username" className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Username</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                      <input
                        id="auth-username"
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="Pick a display name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={field}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={field}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password" className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${field} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gaming flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-[var(--bb-muted)]">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setTab(isLogin ? 'register' : 'login'); setError(''); }}
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
