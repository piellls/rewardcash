'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { Coins, Flame, Award, Wallet, Calendar, CheckCircle2, History, AlertCircle, PlayCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  
  const [completions, setCompletions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth Redirect Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Daily check-in state
  const [claimedToday, setClaimedToday] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  const loadUserData = async () => {
    if (user) {
      setLoading(true);
      try {
        const c = await db.getCompletedOffers(user.id);
        const w = await db.getWithdrawals(user.id);
        setCompletions(c);
        setWithdrawals(w);

        // Check if daily checked-in is recorded in localStorage
        const lastCheckIn = localStorage.getItem(`rc_last_checkin_${user.id}`);
        const todayStr = new Date().toDateString();
        if (lastCheckIn === todayStr) {
          setClaimedToday(true);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleDailyCheckIn = async () => {
    if (!user || claimedToday) return;
    setClaimLoading(true);
    setClaimSuccess('');

    try {
      // In mock mode, we manually add 25 coins to profile
      if (db) {
        const users = JSON.parse(localStorage.getItem('rc_users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users[idx].balance_coins += 25;
          users[idx].total_earned_coins += 25;
          localStorage.setItem('rc_users', JSON.stringify(users));
          
          // update session
          const session = JSON.parse(localStorage.getItem('rc_session') || '{}');
          if (session.id === user.id) {
            session.balance_coins += 25;
            session.total_earned_coins += 25;
            localStorage.setItem('rc_session', JSON.stringify(session));
          }
        }
      }

      // Record check-in date
      const todayStr = new Date().toDateString();
      localStorage.setItem(`rc_last_checkin_${user.id}`, todayStr);
      setClaimedToday(true);
      setClaimSuccess('Claimed successfully! +25 Coins added to your balance.');
      await refreshUser();
      await loadUserData();
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setClaimLoading(false);
    }
  };

  // If not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-zinc-900 border border-dark-border p-4 text-zinc-400 mb-6">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Member Dashboard</h1>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Please log in or register a new account to view your balance, streaks, completed tasks, and withdrawal history.
        </p>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Sign In / Register
        </button>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          initialTab="login" 
        />
      </div>
    );
  }

  const usdValue = (user.balance_coins || 0) / 1000;
  const totalEarnedUSD = (user.total_earned_coins || 0) / 1000;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Welcome Banner */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-950 border border-dark-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 text-center md:text-left">
          <img 
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt={user.username}
            className="h-16 w-16 rounded-full border-2 border-dark-border"
          />
          <div>
            <h1 className="text-2xl font-black text-white">Welcome back, {user.username}!</h1>
            <p className="text-sm text-zinc-400 mt-1">
              You are on a <span className="text-primary font-semibold">3-day earning streak</span>. Keep completing offers to secure your spot!
            </p>
          </div>
        </div>

        {/* Daily check-in button */}
        <div className="shrink-0">
          <button
            onClick={handleDailyCheckIn}
            disabled={claimedToday || claimLoading}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
              claimedToday
                ? 'bg-zinc-900 border border-dark-border text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-black hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            {claimedToday ? 'Daily Bonus Claimed' : 'Claim Daily Bonus (+25)'}
          </button>
        </div>
      </div>

      {claimSuccess && (
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold">{claimSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Balance */}
            <div className="rounded-2xl glass-card border border-dark-border p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Current Balance</span>
                <Coins className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="block text-2xl font-black text-white">{user.balance_coins?.toLocaleString() || 0} Coins</span>
              <span className="text-xs text-zinc-400 font-semibold mt-1 block">Est. Payout Value: <span className="text-primary">${usdValue.toFixed(2)} USD</span></span>
            </div>

            {/* Total Earned */}
            <div className="rounded-2xl glass-card border border-dark-border p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Total Earned</span>
                <Award className="h-5 w-5 text-secondary" />
              </div>
              <span className="block text-2xl font-black text-white">{user.total_earned_coins?.toLocaleString() || 0} Coins</span>
              <span className="text-xs text-zinc-400 font-semibold mt-1 block">Total Revenue: <span className="text-secondary">${totalEarnedUSD.toFixed(2)} USD</span></span>
            </div>

            {/* Completed Tasks */}
            <div className="rounded-2xl glass-card border border-dark-border p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Tasks Completed</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span className="block text-2xl font-black text-white">{completions.length} Offers</span>
              <span className="text-xs text-zinc-400 font-semibold mt-1 block">Active on Offerwalls</span>
            </div>

            {/* Daily Streak */}
            <div className="rounded-2xl glass-card border border-dark-border p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Active Streak</span>
                <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
              <span className="block text-2xl font-black text-white">3 Days</span>
              <span className="text-xs text-zinc-400 font-semibold mt-1 block">Increases reward multipliers</span>
            </div>
          </div>

          {/* Tables layout split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Completions */}
            <div className="rounded-2xl glass-card border border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Recent Completed Tasks
                </h2>
                <Link href="/earn" className="text-xs text-primary font-bold hover:underline">Earn More</Link>
              </div>

              {completions.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-zinc-950/30 border border-dashed border-dark-border">
                  <p className="text-sm text-zinc-500">No completed tasks yet.</p>
                  <Link href="/earn" className="text-xs text-primary font-bold mt-2 block hover:underline">Complete your first task now</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {completions.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3 border border-dark-border/40">
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{c.offer_title}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">{c.provider} • {new Date(c.completed_at).toLocaleDateString()}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-primary">
                        <Coins className="h-3.5 w-3.5 text-yellow-500" />
                        +{c.coins}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Withdrawals */}
            <div className="rounded-2xl glass-card border border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-secondary" />
                  Recent Withdrawals
                </h2>
                <Link href="/cashout" className="text-xs text-secondary font-bold hover:underline">Request Cashout</Link>
              </div>

              {withdrawals.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-zinc-950/30 border border-dashed border-dark-border">
                  <p className="text-sm text-zinc-500">No withdrawal requests yet.</p>
                  <Link href="/cashout" className="text-xs text-secondary font-bold mt-2 block hover:underline">Redeem coins for cash</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.slice(0, 5).map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3 border border-dark-border/40">
                      <div>
                        <p className="text-xs font-bold text-zinc-200 uppercase">{w.payment_method} Payout</p>
                        <p className="text-[10px] text-zinc-500 font-semibold">{new Date(w.created_at).toLocaleDateString()} • {w.coins_spent?.toLocaleString()} Coins</p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-xs font-black text-primary">${parseFloat(w.amount_usd).toFixed(2)}</span>
                        {w.status === 'approved' && <span className="text-[9px] font-black uppercase text-primary bg-emerald-950/30 border border-emerald-900/40 px-1 py-0.5 rounded">Paid</span>}
                        {w.status === 'rejected' && <span className="text-[9px] font-black uppercase text-red-400 bg-red-950/30 border border-red-900/40 px-1 py-0.5 rounded">Refund</span>}
                        {w.status === 'pending' && <span className="text-[9px] font-black uppercase text-yellow-500 bg-amber-950/30 border border-amber-900/40 px-1 py-0.5 rounded">Wait</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
