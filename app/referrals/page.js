'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Users, Coins, Share2, Copy, Check, ShieldAlert, Award, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  
  // Page states
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarnings: 0 });
  const [referralsList, setReferralsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auth Redirect modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const loadReferralData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const s = await db.getReferralStats(user.id);
      const l = await db.getReferralsList(user.id);
      setStats(s);
      setReferralsList(l || []);
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getReferralLink = () => {
    if (typeof window === 'undefined' || !user) return '';
    return `${window.location.origin}/?ref=${user.username}`;
  };

  const handleCopyLink = () => {
    const link = getReferralLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user is not logged in, show marketing page
  if (!user && !loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-primary/10 border border-primary/20 p-5 text-primary mb-6 animate-pulse-slow">
          <Users className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Referral Affiliate <span className="text-gradient">Program</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 leading-relaxed">
          Invite your friends to RewardCash and earn a lifetime <span className="text-primary font-bold">10% commission</span> on all of their earnings. Plus, they get <span className="text-accent-gold font-bold">+100 welcome coins</span> immediately!
        </p>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-10">
          <div className="rounded-2xl glass-card border border-dark-border p-6 text-center">
            <Share2 className="h-6 w-6 text-primary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">1. Share Link</h3>
            <p className="text-xs text-zinc-400">Copy your unique referral link w send it to your friends w followers.</p>
          </div>
          <div className="rounded-2xl glass-card border border-dark-border p-6 text-center">
            <Coins className="h-6 w-6 text-accent-gold mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">2. Welcome Bonus</h3>
            <p className="text-xs text-zinc-400">Referred users start strong with an instant +100 welcome coins on registration.</p>
          </div>
          <div className="rounded-2xl glass-card border border-dark-border p-6 text-center">
            <TrendingUp className="h-6 w-6 text-accent-cyan mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">3. 10% Lifetime Payout</h3>
            <p className="text-xs text-zinc-400">Earn 10% commission on every offer, survey, w app download they complete.</p>
          </div>
        </div>

        <button
          onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
          className="rounded-xl bg-gradient-to-r from-primary to-accent-cyan px-8 py-3.5 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Sign Up & Get Referral Link
        </button>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          initialTab={authTab} 
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      {/* Header */}
      <div className="mb-10 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
          <Users className="h-7 w-7 text-primary" />
          Referral Center
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Share your referral link with friends w earn 10% commission on all their earnings. Track clicks, invites, and commissions.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Referral Info Card */}
          <div className="rounded-2xl glass-card border border-dark-border p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3 text-center lg:text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-center lg:justify-start">
                <Share2 className="h-5 w-5 text-primary" />
                Invite Friends, Make Money
              </h2>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Copy your unique affiliate link. You will receive <span className="text-primary font-bold">10% commission</span> of whatever offer coins they earn, forever. Users using your link receive <span className="text-accent-gold font-bold">100 Coins welcome bonus</span>!
              </p>
            </div>

            {/* Link Copy Widget */}
            <div className="w-full lg:max-w-md space-y-2">
              <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">
                Your Referral Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 rounded-xl bg-zinc-950 border border-dark-border px-3.5 py-2.5 text-xs text-zinc-300 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`rounded-xl border border-dark-border px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    copied 
                      ? 'bg-emerald-950/20 text-primary border-emerald-900/50' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white hover:text-primary'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Invited Friends</span>
                <span className="text-xl font-black text-white">{stats.totalReferrals} Users</span>
              </div>
            </div>

            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-yellow-950/30 border border-yellow-900/50 p-3 text-yellow-550">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Coins Earned</span>
                <span className="text-xl font-black text-white">{stats.totalEarnings?.toLocaleString() || 0} Coins</span>
              </div>
            </div>

            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-purple-950/30 border border-purple-900/50 p-3 text-purple-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Commission Rate</span>
                <span className="text-xl font-black text-white">10% Lifetime</span>
              </div>
            </div>
          </div>

          {/* Referrals Directory List */}
          <div className="rounded-2xl glass-card border border-dark-border p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-dark-border/40 pb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-white leading-none">Invited User Directory</h3>
            </div>

            {referralsList.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No referrals found. Share your link to start inviting users!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">User Name</th>
                      <th className="pb-3 px-4">Registration Date</th>
                      <th className="pb-3 px-4 text-right">Referral Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/40 text-sm">
                    {referralsList.map((refUser, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-3.5 pr-4 font-bold text-white">{refUser.username}</td>
                        <td className="py-3.5 px-4 text-zinc-500 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-650" />
                            {new Date(refUser.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-zinc-400">
                          <span className="text-[10px] text-zinc-600 font-bold uppercase mr-1">Earned:</span>
                          {refUser.total_earned_coins?.toLocaleString() || 0} Coins
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
