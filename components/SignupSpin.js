'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { sfx } from '@/lib/sfx';
import SpinWheel, { celebrateWin } from '@/components/SpinWheel';
import { X, Clock, Coins, AlertCircle, Sparkles } from 'lucide-react';

// The sign-up spin as a popup.
// A new member gets one free spin (and three more for earning $1 in the first 48 hours). It shows up by itself
// SHOW_AFTER_MS after the member has signed up and picked an avatar, once per browser session, and can be reopened
// from the Spin page while spins are waiting.

export const SHOW_AFTER_MS = 8000;

const QUIET_PATHS = ['/signin', '/privacy', '/terms', '/rules', '/admin', '/ref'];
const isQuiet = (path) => QUIET_PATHS.some((p) => path === p || path?.startsWith(`${p}/`));

const seenKey = (id) => `bb_signup_spin_seen_${id}`;
const wasSeen = (id) => { try { return sessionStorage.getItem(seenKey(id)) === '1'; } catch { return false; } };
const markSeen = (id) => { try { sessionStorage.setItem(seenKey(id), '1'); } catch { /* ignore */ } };

const SignupSpinContext = createContext({ claimsLeft: 0, openSignupSpin: () => {} });
export const useSignupSpin = () => useContext(SignupSpinContext);

const formatLeft = (ms) => {
  if (ms <= 0) return 'ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`;
};

function SignupSpinModal({ state, onClose, onClaimed }) {
  const { user, refreshUser } = useAuth();
  const wheel = useRef(null);
  const startBtn = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [error, setError] = useState('');

  const claimsLeft = state?.claimsLeft || 0;
  const progress = Math.min(100, ((state?.progressCoins || 0) / 1000) * 100);
  const challengeOpen = state && !state.challengeCompleted && (state.timeLeftMs || 0) > 0;

  useEffect(() => { startBtn.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !spinning) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spinning, onClose]);

  const spin = async () => {
    if (spinning || claimsLeft <= 0 || !user) return;
    setError('');
    setPrize(null);
    setSpinning(true);
    try {
      const res = await db.claimSpin(user.id, 'signup');
      if (!res.success) throw new Error(res.error || 'Could not claim the spin.');
      await wheel.current?.spinTo(res.prizeIndex);
      setPrize(res.prize);
      celebrateWin();
      await refreshUser(); // balance
      await onClaimed(); // spins left
    } catch (err) {
      setError(err.message || 'Could not claim the spin.');
      sfx.play('error');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="signup-spin-title">
      <div className="g-fade fixed inset-0 bg-[#05070d]/85 backdrop-blur-sm" onClick={() => { if (!spinning) onClose(); }} />

      <div className="g-modal g-neon relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--bb-surface)] px-5 pb-6 pt-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:px-7">
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-5 pr-8 text-center sm:px-8">
          <p className="g-eyebrow inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Welcome gift</p>
          <h2 id="signup-spin-title" className="g-title mt-1 text-2xl text-white">Your free sign-up spin</h2>
          <p className="mt-1 text-sm text-[var(--bb-muted)]">Spin the wheel for free coins. The $250 top prize is very rare.</p>
        </div>

        <div className="px-3 sm:px-6">
          <SpinWheel ref={wheel} />
        </div>

        <div role="status" aria-live="polite" className="mt-5 min-h-[3.25rem] text-center">
          {error && (
            <p className="flex items-start justify-center gap-2 text-sm font-semibold text-[#f9a4af]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}
            </p>
          )}
          {prize && !error && (
            <div className="animate-new-card">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--bb-muted)]">You won</p>
              <p className="flex items-center justify-center gap-2 text-2xl font-black text-[#f3c76b]">
                <Coins className="h-6 w-6" aria-hidden="true" />+{prize.coins.toLocaleString()} <span className="text-sm font-bold text-zinc-400">({prize.label})</span>
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          {claimsLeft > 0 ? (
            <button ref={startBtn} type="button" onClick={spin} disabled={spinning} className="btn-gaming min-h-[3rem] w-full rounded-xl text-sm disabled:opacity-70">
              {spinning ? 'Spinning…' : prize ? `Spin again (${claimsLeft} left)` : claimsLeft > 1 ? `Spin now (${claimsLeft} left)` : 'Spin now'}
            </button>
          ) : (
            <Link ref={startBtn} href="/earn" onClick={onClose} className="btn-gaming flex min-h-[3rem] w-full items-center justify-center rounded-xl text-sm">
              Start earning
            </Link>
          )}
          {claimsLeft > 0 && !spinning && (
            <button type="button" onClick={onClose} className="min-h-[2.5rem] text-xs font-bold text-zinc-400 transition-colors hover:text-white">Later</button>
          )}
        </div>

        {challengeOpen && (
          <div className="mt-5 rounded-2xl border border-dark-border bg-[var(--bb-surface-2)] p-4">
            <p className="text-xs font-semibold leading-relaxed text-zinc-300">
              Earn <span className="font-extrabold text-white">$1</span> (1,000 coins) within <span className="font-extrabold text-[#a98bff]">48 hours</span> of signing up and get <span className="font-extrabold text-[#a98bff]">3 more free spins</span>.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0b0c10]" role="progressbar" aria-valuemin={0} aria-valuemax={1000} aria-valuenow={Math.min(1000, state.progressCoins || 0)} aria-label="Coins earned toward 3 more spins">
              <div className="h-full rounded-full bg-[#9b7bff] transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 flex items-center justify-between text-[0.8125rem] font-bold text-zinc-400">
              <span>{Math.min(1000, state.progressCoins || 0).toLocaleString()} / 1,000 coins</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{formatLeft(state.timeLeftMs)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SignupSpinProvider({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [state, setState] = useState(null);
  const [open, setOpen] = useState(false);
  const userId = user?.id || null;
  const ready = Boolean(userId && user?.avatar_url); // signed up and past the avatar step

  const reload = useCallback(async () => {
    if (!userId) return null;
    try {
      const next = await db.getSignupBonusState(userId);
      setState(next);
      return next;
    } catch (err) {
      console.error('Failed to load the sign-up spin state:', err);
      return null;
    }
  }, [userId]);

  // Spins waiting for this member (also feeds the notice on the Spin page).
  useEffect(() => {
    if (!ready) { setState(null); return; }
    reload();
  }, [ready, reload]);

  // The popup shows up by itself a few seconds after sign-up and avatar, once per session.
  useEffect(() => {
    if (loading || !ready || open || !state || state.claimsLeft <= 0 || isQuiet(pathname) || wasSeen(userId)) return undefined;
    let timer;
    const attempt = () => {
      // Not while the tab is in the background or another dialog is open.
      if (document.hidden || document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        timer = setTimeout(attempt, 3000);
        return;
      }
      markSeen(userId);
      setOpen(true);
    };
    timer = setTimeout(attempt, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [loading, ready, open, state, pathname, userId]);

  const openSignupSpin = useCallback(() => { if (userId) setOpen(true); }, [userId]);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ claimsLeft: state?.claimsLeft || 0, openSignupSpin }),
    [state, openSignupSpin],
  );

  return (
    <SignupSpinContext.Provider value={value}>
      {children}
      {open && ready && <SignupSpinModal state={state} onClose={close} onClaimed={reload} />}
    </SignupSpinContext.Provider>
  );
}
