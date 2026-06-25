'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Users, Coins, Share2, Copy, Check, Award, TrendingUp, Calendar } from 'lucide-react';

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
  }, [user?.id]);

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

  // Guest affiliate marketing page
  if (!user && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="rounded-2xl bg-gradient-to-tr from-secondary/10 to-primary/10 border border-primary/20 p-5 text-primary mb-6 animate-pulse-slow">
          <Users className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white text-center tracking-tight mb-4 max-w-2xl leading-none">
          Earn <span className="text-gradient">Passive Income</span> with Affiliates
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl text-center mb-10 leading-relaxed">
          Invite friends to RewardCash. Get a lifetime <strong className="text-primary">10% commission</strong> on all of their earnings. Plus, they get <strong className="text-white">+100 welcome coins</strong> immediately!
        </p>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-12">
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center hover:border-primary/10 transition-all relative overflow-hidden group">
            <Share2 className="h-6 w-6 text-primary mx-auto mb-3 group-hover:scale-105 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-1.5">1. Share Your Link</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Send your unique affiliate invite link to friends, forums, or social networks.</p>
          </div>
          
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center hover:border-primary/10 transition-all relative overflow-hidden group">
            <Coins className="h-6 w-6 text-primary mx-auto mb-3 group-hover:scale-105 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-1.5">2. Signup Welcome</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Referred accounts immediately receive a +100 welcome coins bonus upon registration.</p>
          </div>
          
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center hover:border-primary/10 transition-all relative overflow-hidden group">
            <TrendingUp className="h-6 w-6 text-secondary mx-auto mb-3 group-hover:scale-105 transition-transform" />
            <h3 className="text-sm font-bold text-white mb-1.5">3. 10% Lifetime Share</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Earn an ongoing 10% commission on every offer, survey, or download they complete.</p>
          </div>
        </div>

        <button
          onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
          className="rounded-xl bg-gradient-to-r from-secondary to-primary px-8 py-3.5 text-xs sm:text-sm font-black text-black shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Create Free Account & Start
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Affiliate Program
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Grow your audience, invite users, and receive lifetime referral earnings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3 animate-pulse">
            Loading Referrals...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Link Share Widget Card */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
            
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-base font-bold text-white flex items-center gap-2 justify-center lg:justify-start">
                <Share2 className="h-4.5 w-4.5 text-primary" />
                Referral Invitation Code
              </h2>
              <p className="text-xs text-zinc-405 leading-relaxed max-w-md text-zinc-400">
                Copy your unique link and share it. You will receive <strong className="text-primary">10% commission</strong> of all offer coins they claim, forever. Invited accounts get <strong className="text-white">+100 Coins welcome bonus</strong>!
              </p>
            </div>

            {/* Link Input Clipboard */}
            <div className="w-full lg:max-w-md space-y-1.5">
              <span className="block text-[9px] font-bold text-zinc-550 uppercase tracking-wider">
                Your Link
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 rounded-xl bg-zinc-950 border border-dark-border/80 px-3.5 py-2.5 text-xs text-zinc-300 select-all focus:outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] font-semibold"
                />
                <button
                  onClick={handleCopyLink}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    copied 
                      ? 'bg-emerald-950/20 text-primary border-emerald-500/30' 
                      : 'bg-zinc-900 border-dark-border hover:bg-zinc-800 text-white hover:text-primary'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-primary" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-primary">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Invited Accounts</span>
                <span className="text-lg font-black text-white">{stats.totalReferrals} Users</span>
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-primary">
                <Coins className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Total Commissions</span>
                <span className="text-lg font-black text-white">{stats.totalEarnings?.toLocaleString() || 0} Coins</span>
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-2.5 text-secondary animate-pulse">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Share Percentage</span>
                <span className="text-lg font-black text-white">10% Lifetime</span>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
            <div className="flex items-center gap-2 mb-5 border-b border-dark-border/40 pb-3">
              <Users className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Affiliate Invites Directory</h3>
            </div>

            {referralsList.length === 0 ? (
              <div className="text-center py-10 rounded-xl bg-zinc-950/20 border border-dashed border-dark-border">
                <p className="text-xs text-zinc-500 font-bold">No invites listed yet.</p>
                <p className="text-[10px] text-zinc-650 mt-1 uppercase tracking-wider font-semibold">Share your invitation URL above to invite your first user!</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                      <th className="pb-3 pr-4">Invited Username</th>
                      <th className="pb-3 px-4">Joined Date</th>
                      <th className="pb-3 px-4 text-right">Offer Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                    {referralsList.map((refUser, idx) => (
                      <tr key={idx} className="group hover:bg-zinc-900/10 transition-colors">
                        <td className="py-3 pr-4 font-bold text-white">{refUser.username}</td>
                        <td className="py-3 px-4 text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-650" />
                            {new Date(refUser.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-zinc-400">
                          <span className="text-[9px] text-zinc-600 font-bold uppercase mr-1.5">User Earned:</span>
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
