'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/components/AuthPrompt';
import { useSignupSpin } from '@/components/SignupSpin';
import { db } from '@/lib/db';
import { Gift, Clock, Coins, AlertCircle, Sparkles } from 'lucide-react';
import PageHeader, { Chip } from '@/components/PageHeader';
import { AnimatedNumber } from '@/components/motion';
import SpinWheel, { celebrateWin } from '@/components/SpinWheel';
import EarningStreak from '@/components/EarningStreak';
import { TOP_SPIN_PRIZE } from '@/lib/spinPrizes';
import { sfx } from '@/lib/sfx';

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, '0');

// The daily free spin. The sign-up spin is a popup now (components/SignupSpin.js).
export default function SpinPage() {
  const { user, refreshUser } = useAuth();
  const { openAuth } = useAuthPrompt();
  const { claimsLeft, openSignupSpin } = useSignupSpin();
  const wheel = useRef(null);

  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState('');
  const [winPrize, setWinPrize] = useState(null);
  const [cooldown, setCooldown] = useState('');
  const [canSpinDaily, setCanSpinDaily] = useState(false);

  // Counts down to the next daily spin from the time of the last one.
  useEffect(() => {
    if (!user) { setCanSpinDaily(false); setCooldown(''); return undefined; }
    const last = user.last_daily_spin_at ? new Date(user.last_daily_spin_at).getTime() : null;
    const update = () => {
      const left = last === null ? 0 : DAY_MS - (Date.now() - last);
      if (left <= 0) { setCanSpinDaily(true); setCooldown(''); return true; }
      const secs = Math.floor(left / 1000);
      setCanSpinDaily(false);
      setCooldown(`${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`);
      return false;
    };
    if (update()) return undefined;
    const id = setInterval(() => { if (update()) clearInterval(id); }, 1000);
    return () => clearInterval(id);
  }, [user]);

  const handleSpin = async () => {
    if (spinning) return;
    if (!user) { openAuth('register'); return; }
    if (!canSpinDaily) return;

    setError('');
    setWinPrize(null);
    setSpinning(true);
    try {
      const res = await db.claimSpin(user.id, 'daily');
      if (!res.success) throw new Error(res.error || 'Failed to claim reward');
      await wheel.current?.spinTo(res.prizeIndex);
      setWinPrize(res.prize);
      celebrateWin();
      await refreshUser(); // new balance and the next-spin countdown
    } catch (err) {
      setError(err.message || 'Failed to claim reward');
      sfx.play('error');
      refreshUser();
    } finally {
      setSpinning(false);
    }
  };

  const waiting = Boolean(user) && !canSpinDaily && !spinning;

  return (
    <div className="page-spin relative flex w-full flex-1 select-none flex-col justify-start overflow-x-hidden px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Free rewards"
        icon={Gift}
        title="Spin &"
        accent="win"
        art="wheel"
        artGlow="purple"
        subtitle="Spin the wheel for free coins once every 24 hours. Coins go straight to your balance."
      >
        <Chip tone="gold">Top prize {TOP_SPIN_PRIZE.toLocaleString()} coins (very rare)</Chip>
        {user && <Chip tone="green"><AnimatedNumber value={user.balance_coins || 0} className="tabular-nums" /> coins</Chip>}
      </PageHeader>

      {user && claimsLeft > 0 && (
        <div className="g-neon mx-auto mb-6 flex w-full max-w-xl flex-col items-center justify-between gap-3 p-4 sm:flex-row sm:px-5">
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 shrink-0 text-[#c3b2ff]" aria-hidden="true" />
            {claimsLeft === 1 ? 'You have a sign-up spin waiting' : `You have ${claimsLeft} sign-up spins waiting`}
          </p>
          <button type="button" onClick={openSignupSpin} className="btn-gaming min-h-[2.75rem] shrink-0 rounded-xl px-5 text-xs">Open the wheel</button>
        </div>
      )}

      <div className="g-card g-neon relative mx-auto flex w-full max-w-xl flex-col items-center overflow-hidden p-5 shadow-2xl sm:p-8">
        <h2 className="text-center text-2xl font-black leading-none text-white sm:text-3xl">Daily Free Spin</h2>
        <p className="mt-2 text-center text-sm font-semibold text-zinc-400">
          One free spin every 24 hours. Win up to <span className="font-bold text-[#a98bff]">{TOP_SPIN_PRIZE.toLocaleString()} coins</span>.
        </p>

        <div className="mt-8 w-full px-3 sm:px-8">
          <SpinWheel ref={wheel} dimmed={waiting} />
        </div>

        <div role="status" aria-live="polite" className="mt-6 w-full">
          {error && (
            <div className="animate-new-card mb-4 flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
              <div className="text-xs font-semibold text-red-200">{error}</div>
            </div>
          )}
          {winPrize && !error && (
            <div className="animate-new-card mb-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-5 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-dark-bg/85">
                  <Coins className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-white">You won +{winPrize.coins.toLocaleString()} coins</h4>
                  <p className="text-xs text-zinc-400">It is already in your balance. Come back in 24 hours for the next spin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWinPrize(null)}
                className="shrink-0 rounded-full border border-dark-border/40 bg-zinc-800 px-5 py-2 text-[0.75rem] font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          {waiting ? (
            <>
              <button type="button" disabled className="min-h-[3rem] cursor-not-allowed rounded-full border border-dark-border bg-[var(--bb-surface-2)] px-10 text-xs font-extrabold uppercase tracking-wide text-zinc-400">
                Already claimed today
              </button>
              <div className="flex items-center gap-1.5 rounded-full border border-dark-border/30 bg-dark-bg/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Next spin in <span className="tabular-nums text-white">{cooldown}</span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="btn-gaming min-h-[3rem] rounded-full px-12 text-xs font-extrabold uppercase tracking-wider shadow-lg disabled:opacity-70"
            >
              {spinning ? 'Spinning…' : user ? 'Spin the wheel' : 'Sign up to spin'}
            </button>
          )}
        </div>

        <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-zinc-400">
          Coins are added to your balance automatically. 1,000 coins = $1.00.
        </p>
      </div>

      {user && <EarningStreak />}
    </div>
  );
}
