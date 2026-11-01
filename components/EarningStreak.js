'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { sfx } from '@/lib/sfx';
import { celebrateWin } from '@/components/SpinWheel';
import { Coins, Check, Clock, Flame, AlertCircle } from 'lucide-react';

// The Earning Streak section of the Spin page.
// Earn the daily goal from offers, on consecutive days, and claim a coin bonus for each day.
// The server works everything out and pays (app/api/streak/route.js, lib/streak.js); this only shows it.
// It stays out of the way (renders nothing) when the server has no streak yet.

const pad = (n) => String(n).padStart(2, '0');
const formatCountdown = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`;
};

const STATUS_LOOK = {
  claimed: 'border-[#42d8a0]/30 bg-[#42d8a0]/[0.06]',
  claimable: 'border-primary/60 bg-primary/15 shadow-[0_0_22px_-6px_rgba(113,63,225,0.8)]',
  today: 'border-white/25 bg-[var(--bb-surface-2)]',
  locked: 'border-dark-border bg-[var(--bb-surface-2)]',
};

function DayIcon({ status }) {
  if (status === 'claimed') return <Check className="h-6 w-6 text-[#42d8a0]" aria-hidden="true" />;
  if (status === 'claimable') return <Coins className="h-6 w-6 text-[#f3c76b]" aria-hidden="true" />;
  if (status === 'today') return <Coins className="h-6 w-6 text-white" aria-hidden="true" />;
  return <Clock className="h-6 w-6 text-zinc-400" aria-hidden="true" />;
}

export default function EarningStreak() {
  const { user, refreshUser } = useAuth();
  const userId = user?.id || null;

  const [streak, setStreak] = useState(null);
  const [endsAt, setEndsAt] = useState(0); // when this UTC day ends, in this browser's clock
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState('loading'); // loading | ready | hidden
  const [claiming, setClaiming] = useState(null);
  const [won, setWon] = useState(null);
  const [error, setError] = useState('');
  const list = useRef(null);
  const loading = useRef(false);
  const centred = useRef(false);

  const apply = useCallback((next) => {
    setStreak(next);
    setEndsAt(Date.now() + next.msLeft);
    setNow(Date.now());
    setState('ready');
  }, []);

  const load = useCallback(async () => {
    if (!userId || loading.current) return;
    loading.current = true;
    try {
      const res = await db.getStreakState();
      if (res.available && res.streak) apply(res.streak);
      else setState('hidden');
    } catch (err) {
      console.error('Failed to load the Earning Streak:', err);
      setState((s) => (s === 'ready' ? s : 'hidden'));
    } finally {
      loading.current = false;
    }
  }, [userId, apply]);

  // Load, then keep it fresh: offers are finished in other tabs and apps, so look again when the member returns.
  useEffect(() => {
    if (!userId) return undefined;
    load();
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', load);
    const poll = setInterval(onVisible, 60000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', load);
      clearInterval(poll);
    };
  }, [userId, load]);

  // The "day ends in" clock. When it reaches zero a new day has started, so ask the server again.
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state]);
  useEffect(() => { if (state === 'ready' && endsAt && now >= endsAt) load(); }, [state, endsAt, now, load]);

  // On the first view, bring the card that matters into the middle of the row (sideways only, the page stays put).
  useEffect(() => {
    if (state !== 'ready' || centred.current || !list.current) return;
    centred.current = true;
    const target = list.current.querySelector('[data-focus="true"]');
    if (target) list.current.scrollLeft = target.offsetLeft - (list.current.clientWidth - target.clientWidth) / 2;
  }, [state, streak]);

  // The "you got it" line goes away by itself.
  useEffect(() => {
    if (!won) return undefined;
    const id = setTimeout(() => setWon(null), 7000);
    return () => clearTimeout(id);
  }, [won]);

  const claim = async (dayNo) => {
    if (claiming !== null) return;
    setClaiming(dayNo);
    setError('');
    setWon(null);
    try {
      const res = await db.claimStreakDay(dayNo);
      setWon({ coins: res.coins, dayNo: res.dayNo });
      celebrateWin();
      if (res.streak) apply(res.streak); else await load();
      await refreshUser(); // new balance
    } catch (err) {
      setError(err.message || 'Could not claim the reward.');
      sfx.play('error');
      load();
    } finally {
      setClaiming(null);
    }
  };

  if (!userId || state === 'hidden') return null;

  if (state === 'loading' || !streak) {
    return (
      <section aria-label="Earning Streak" className="g-card g-neon mx-auto mt-6 w-full max-w-xl overflow-hidden p-5 sm:p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-4 h-4 w-64 max-w-full animate-pulse rounded bg-white/5" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white/5" />
      </section>
    );
  }

  const progress = Math.min(100, (streak.todayCoins / streak.goal) * 100);
  const keeping = streak.achieved > 0;

  return (
    <section aria-labelledby="streak-title" className="g-card g-neon mx-auto mt-6 w-full max-w-xl overflow-hidden p-5 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <h2 id="streak-title" className="text-2xl font-black leading-tight text-white sm:text-3xl">Earning Streak</h2>
        {streak.achieved > 0 && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#f3c76b]/30 bg-[#f3c76b]/10 px-3 py-1 text-xs font-extrabold text-[#f3c76b]">
            <Flame className="h-4 w-4" aria-hidden="true" />{streak.achieved} {streak.achieved === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>

      <p className="mt-3 text-base font-semibold leading-relaxed text-zinc-300">
        {streak.goalMet ? (
          <>Daily goal reached. Come back tomorrow to keep your streak going.</>
        ) : (
          <>Earn <span className="font-extrabold text-[#f3c76b]">{streak.remaining.toLocaleString()} more coins</span> from offers today to {keeping ? 'keep your streak' : 'start your streak'}.</>
        )}
        <br />
        Day ends in: <span className="font-extrabold tabular-nums text-[#f3c76b]">{formatCountdown(endsAt - now)}</span>
      </p>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-[#0b0c10]" role="progressbar" aria-valuemin={0} aria-valuemax={streak.goal} aria-valuenow={Math.min(streak.goal, streak.todayCoins)} aria-label="Coins earned from offers today">
          <div className={`h-full rounded-full transition-[width] duration-500 ${streak.goalMet ? 'bg-[#42d8a0]' : 'bg-[#9b7bff]'}`} style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-[0.8125rem] font-bold tabular-nums text-zinc-400">
          {Math.min(streak.goal, streak.todayCoins).toLocaleString()} / {streak.goal.toLocaleString()} coins today
        </p>
      </div>

      <div role="status" aria-live="polite" className="mt-2 min-h-[1.25rem]">
        {error && (
          <p className="flex items-start gap-2 text-sm font-semibold text-[#f9a4af]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}
          </p>
        )}
        {won && !error && (
          <p className="animate-new-card flex items-center gap-2 text-sm font-extrabold text-[#42d8a0]">
            <Coins className="h-4 w-4" aria-hidden="true" />+{won.coins.toLocaleString()} coins added for day {won.dayNo}
          </p>
        )}
      </div>

      <ul ref={list} className="-mx-5 mt-2 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8">
        {streak.days.map((d) => {
          const focus = d.status === 'claimable' || d.status === 'today';
          const busy = claiming === d.dayNo;
          return (
            <li
              key={d.dayNo}
              data-focus={focus ? 'true' : undefined}
              className={`flex w-[5.75rem] shrink-0 snap-center flex-col items-center rounded-2xl border px-2 pb-3 pt-4 text-center transition-colors ${STATUS_LOOK[d.status]}`}
            >
              <DayIcon status={d.status} />
              <p className={`mt-3 text-base font-black ${d.status === 'locked' ? 'text-zinc-400' : 'text-white'}`}>Day {d.dayNo}</p>
              <p className={`text-sm font-bold tabular-nums ${d.status === 'locked' ? 'text-zinc-400' : 'text-[#f3c76b]'}`}>+{d.reward.toLocaleString()}</p>
              <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-wider text-zinc-400">coins</p>
              {d.status === 'claimable' ? (
                <button
                  type="button"
                  onClick={() => claim(d.dayNo)}
                  disabled={claiming !== null}
                  aria-label={`Claim ${d.reward} coins for day ${d.dayNo}`}
                  className="btn-gaming min-h-[2.5rem] w-full rounded-xl text-xs disabled:opacity-70"
                >
                  {busy ? '…' : 'Claim'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`min-h-[2.5rem] w-full cursor-not-allowed rounded-xl text-xs font-extrabold ${d.status === 'claimed' ? 'bg-[#42d8a0]/15 text-[#42d8a0]' : 'bg-[var(--bb-surface)] text-zinc-400'}`}
                >
                  {d.status === 'claimed' ? 'Claimed' : 'Claim'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-zinc-400">
        Earn {streak.goal.toLocaleString()} coins from offers each day to keep the streak. Spins do not count. Claim a day&apos;s bonus before your streak ends: bonuses you have not claimed are lost if you miss a day.
      </p>
    </section>
  );
}
