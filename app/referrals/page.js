'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Users, Coins, Share2, Copy, Check, Award, TrendingUp, Calendar, Info, Clock, DollarSign, Star } from 'lucide-react';

export default function Referrals() {
  const { user, earnCoinsSimulated } = useAuth();
  
  // Page states
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarnings: 0 });
  const [referralsList, setReferralsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('Tiers'); // 'Tiers', 'Affiliates', 'Leaderboard', 'Promo'
  const [claimableCoins, setClaimableCoins] = useState(0);

  // Auth Redirect modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const TIERS = [
    { level: 1, commission: 5, reqUSD: 0, badge: '🛡️', badgeName: 'Tier 1' },
    { level: 2, commission: 6, reqUSD: 10, badge: '⚔️', badgeName: 'Tier 2' },
    { level: 3, commission: 7, reqUSD: 25, badge: '🏹', badgeName: 'Tier 3' },
    { level: 4, commission: 8, reqUSD: 50, badge: '🔮', badgeName: 'Tier 4' },
    { level: 5, commission: 9, reqUSD: 100, badge: '🌟', badgeName: 'Tier 5' },
    { level: 6, commission: 10, reqUSD: 500, badge: '👑', badgeName: 'Tier 6' },
    { level: 7, commission: 15, reqUSD: 2500, req30dUSD: 300, badge: '💎', badgeName: 'Tier 7' },
    { level: 8, commission: 20, reqUSD: 10000, req30dUSD: 1200, badge: '⚜️', badgeName: 'Tier 8' },
    { level: 9, commission: 25, reqUSD: 50000, req30dUSD: 6000, badge: '🔥', badgeName: 'Tier 9' },
    { level: 10, commission: 30, reqUSD: 100005, req30dUSD: 12000, badge: '🌌', badgeName: 'Tier 10' }
  ];

  const loadReferralData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const s = await db.getReferralStats(user.id);
      const l = await db.getReferralsList(user.id);
      setStats(s);
      setReferralsList(l || []);

      // Load claimable coins
      const storedClaimable = localStorage.getItem(`rc_referral_claimable_${user.id}`);
      if (storedClaimable) {
        setClaimableCoins(parseInt(storedClaimable, 10));
      } else {
        // Seed 250 claimable coins for testing if total earnings is 0
        const seedCoins = s.totalEarnings > 0 ? 0 : 250;
        setClaimableCoins(seedCoins);
        localStorage.setItem(`rc_referral_claimable_${user.id}`, seedCoins.toString());
      }
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
    return `${window.location.origin}/ref/${user.username}`;
  };

  const handleCopyLink = () => {
    const link = getReferralLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimEarnings = async () => {
    if (claimableCoins <= 0 || !user) return;
    
    setLoading(true);
    try {
      await earnCoinsSimulated({
        id: 'referral_claim',
        name: 'Claim Referral Commissions',
        payout: claimableCoins / 1000,
        coins: claimableCoins,
        provider: 'Referral Program'
      });
      
      localStorage.setItem(`rc_referral_claimable_${user.id}`, '0');
      setClaimableCoins(0);
      await loadReferralData();
    } catch (err) {
      alert(err.message || 'Failed to claim commissions');
    } finally {
      setLoading(false);
    }
  };

  // Compute active tier based on total referral earnings USD (1,000 coins = $1.00 USD)
  const usdEarnings = (stats.totalEarnings || 0) / 1000;
  
  const currentTier = TIERS.reduce((prev, curr) => {
    if (usdEarnings >= curr.reqUSD) return curr;
    return prev;
  }, TIERS[0]);

  // Guest landing layout
  if (!user && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="rounded-2xl bg-gradient-to-tr from-secondary/10 to-primary/10 border border-primary/20 p-5 text-primary mb-6 animate-pulse-slow">
          <Users className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white text-center tracking-tight mb-4 max-w-2xl leading-none">
          Earn <span className="text-gradient">Passive Income</span> with Affiliates
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl text-center mb-10 leading-relaxed">
          Invite friends to RewardCash. Get a lifetime <strong className="text-primary">up to 30% commission</strong> on all of their earnings. Plus, they get <strong className="text-white">+100 welcome coins</strong> immediately!
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
            <h3 className="text-sm font-bold text-white mb-1.5">3. Tier Payout Shares</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Earn from 5% up to 30% commission on every offer, survey, or download they complete.</p>
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
      
      {/* Header Row */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Affiliates
        </h1>
        <button 
          onClick={() => alert("Affiliate guidelines: Share your URL, earn commission percentage based on Tiers 1-10 on completions. Commissions can be claimed at any time to your active coin balance.")}
          className="rounded-xl border border-dark-border bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-350 hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
        >
          <Info className="h-4 w-4 text-zinc-450" />
          How it works
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3 animate-pulse">
            Loading Affiliates Dashboard...
          </span>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Top Panel Rows (Profile & Stats split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Card: Profile & Claim Widget */}
            <div className="lg:col-span-5 rounded-2xl border border-dark-border bg-dark-card p-6 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img 
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={user.username}
                    className="h-20 w-20 rounded-full border-2 border-dark-border object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                    {user.username}
                    <Star className="h-4.5 w-4.5 text-red-500 fill-red-500" />
                  </h2>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="text-primary">{currentTier.badge}</span>
                      {currentTier.badgeName}
                    </span>
                    <span>•</span>
                    <span className="text-primary">{currentTier.commission}% commission</span>
                  </div>
                </div>
              </div>

              {/* Claim Box */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 border-l border-dark-border/40 pl-6">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <div className="rounded-full bg-emerald-500/10 p-0.5">
                    <Coins className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="font-extrabold text-white">{claimableCoins.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Available</span>
                </div>
                
                <button
                  onClick={handleClaimEarnings}
                  disabled={claimableCoins <= 0}
                  className="rounded-xl bg-[#10b981] hover:bg-emerald-600 disabled:bg-zinc-900 border border-emerald-500/20 disabled:border-dark-border text-white hover:text-white px-5 py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  Claim
                </button>
              </div>
            </div>

            {/* Right Card: Statistics Grid */}
            <div className="lg:col-span-7 rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 border border-primary/10">
                    <DollarSign className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wide">Total Earnings</span>
                    <span className="text-sm font-black text-white">{(stats.totalEarnings).toLocaleString()} Coins</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 border border-primary/10">
                    <Users className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wide">Users Referred</span>
                    <span className="text-sm font-black text-white">{stats.totalReferrals}</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 border border-primary/10">
                    <Clock className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wide">Last 30 Days</span>
                    <span className="text-sm font-black text-white">0 Coins</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Referral link Card */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">
                Your referral link
              </span>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 rounded-xl bg-zinc-950 border border-dark-border px-3.5 py-2.5 text-xs text-zinc-300 select-all focus:outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] font-semibold"
                />
                <button
                  onClick={handleCopyLink}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    copied 
                      ? 'bg-emerald-950/20 text-primary border-emerald-500/30' 
                      : 'bg-zinc-900 border-dark-border hover:bg-zinc-800 text-white hover:text-primary'
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy link
                </button>
              </div>
            </div>

            {/* Social Share logos */}
            <div className="shrink-0 space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider md:text-right">
                Share your referral link
              </span>
              <div className="flex gap-2">
                {/* Whatsapp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=Join RewardCash and earn coins! ${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-dark-border/80 hover:border-primary/40 flex items-center justify-center text-xs font-bold text-zinc-450 hover:text-primary transition-all active:scale-90"
                >
                  💬
                </a>
                {/* Twitter */}
                <a 
                  href={`https://twitter.com/intent/tweet?text=Join RewardCash and earn coins! ${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-dark-border/80 hover:border-primary/40 flex items-center justify-center text-xs font-bold text-zinc-450 hover:text-primary transition-all active:scale-90"
                >
                  🐦
                </a>
                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-dark-border/80 hover:border-primary/40 flex items-center justify-center text-xs font-bold text-zinc-450 hover:text-primary transition-all active:scale-90"
                >
                  👤
                </a>
                {/* Telegram */}
                <a 
                  href={`https://t.me/share/url?url=${getReferralLink()}&text=Join RewardCash and earn coins!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-dark-border/80 hover:border-primary/40 flex items-center justify-center text-xs font-bold text-zinc-450 hover:text-primary transition-all active:scale-90"
                >
                  ✈️
                </a>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex gap-2.5 bg-zinc-950/40 p-1.5 rounded-xl border border-dark-border max-w-sm">
            {['Tiers', 'Affiliates', 'Leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-black' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'Tiers' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mt-2.5">
                <Info className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Reach the next Tier to earn a higher commission from your affiliates.</span>
              </div>
              
              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TIERS.map((tier) => {
                  const isActive = currentTier.level === tier.level;
                  const isCompleted = usdEarnings >= tier.reqUSD;
                  const isFinalTiers = tier.level >= 7;

                  return (
                    <div 
                      key={tier.level}
                      className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all bg-dark-card ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                          : 'border-dark-border bg-dark-card/85'
                      }`}
                    >
                      {/* Active Tag */}
                      {isActive && (
                        <div className="absolute -top-2.5 left-6 rounded-full bg-emerald-500 text-[8px] font-black text-black px-2.5 py-0.5 uppercase tracking-widest border border-emerald-400">
                          Active
                        </div>
                      )}

                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="text-lg">{tier.badge}</span>
                            {tier.badgeName}
                          </span>
                          <span className="rounded-full bg-zinc-950 border border-dark-border px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase">
                            {tier.commission}% commission
                          </span>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2 mt-4 text-xs">
                          <span className="block text-[10px] font-bold uppercase text-zinc-550 tracking-wider mb-2">
                            Requirements
                          </span>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <div className={`rounded-full p-0.5 border ${
                              isCompleted 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'border-dark-border text-zinc-650'
                            }`}>
                              {isCompleted ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                            </div>
                            <span>${tier.reqUSD.toLocaleString()} affiliate earnings</span>
                          </div>
                          
                          {/* 30-day additional requirements */}
                          {isFinalTiers && (
                            <div className="flex items-center gap-2 text-zinc-300">
                              <div className="rounded-full p-0.5 border border-dark-border text-zinc-650">
                                <div className="h-3 w-3" />
                              </div>
                              <span>${tier.req30dUSD.toLocaleString()} earnings last 30 days</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'Affiliates' ? (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="flex items-center gap-2 mb-5 border-b border-dark-border/40 pb-3">
                <Users className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Affiliate Invites Directory</h3>
              </div>

              {referralsList.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-zinc-950/20 border border-dashed border-dark-border">
                  <p className="text-xs text-zinc-500 font-bold">No invites listed yet.</p>
                  <p className="text-[10px] text-zinc-650 mt-1 uppercase tracking-wider font-semibold">Share your URL above to invite your first user!</p>
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
          ) : (
            /* Leaderboard Tab */
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="flex items-center gap-2 mb-5 border-b border-dark-border/40 pb-3">
                <Award className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Affiliate Earners</h3>
              </div>
              
              <div className="text-center py-10 rounded-xl bg-zinc-950/20 border border-dashed border-dark-border text-xs text-zinc-500 font-bold uppercase tracking-wide">
                Leaderboard statistics update every Sunday. Start referring to compete!
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
