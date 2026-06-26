'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Users, Coins, Share2, Copy, Check, Award, TrendingUp, Calendar, Info, Clock, DollarSign, Star, Shield, Swords, Zap, Sparkles, Crown, Gem, Flame, Globe } from 'lucide-react';

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
    { level: 1, commission: 5, reqUSD: 0, badge: Shield, color: 'text-secondary', badgeName: 'Tier 1' },
    { level: 2, commission: 6, reqUSD: 10, badge: Swords, color: 'text-primary', badgeName: 'Tier 2' },
    { level: 3, commission: 7, reqUSD: 25, badge: Zap, color: 'text-secondary', badgeName: 'Tier 3' },
    { level: 4, commission: 8, reqUSD: 50, badge: Sparkles, color: 'text-primary', badgeName: 'Tier 4' },
    { level: 5, commission: 9, reqUSD: 100, badge: Star, color: 'text-secondary', badgeName: 'Tier 5' },
    { level: 6, commission: 10, reqUSD: 500, badge: Crown, color: 'text-primary', badgeName: 'Tier 6' },
    { level: 7, commission: 15, reqUSD: 2500, req30dUSD: 300, badge: Gem, color: 'text-secondary', badgeName: 'Tier 7' },
    { level: 8, commission: 20, reqUSD: 10000, req30dUSD: 1200, badge: Award, color: 'text-primary', badgeName: 'Tier 8' },
    { level: 9, commission: 25, reqUSD: 50000, req30dUSD: 6000, badge: Flame, color: 'text-secondary', badgeName: 'Tier 9' },
    { level: 10, commission: 30, reqUSD: 100005, req30dUSD: 12000, badge: Globe, color: 'text-primary', badgeName: 'Tier 10' }
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
            <div className="icon-wrapper-primary h-12 w-12 flex mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Share2 className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">1. Share Your Link</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Send your unique affiliate invite link to friends, forums, or social networks.</p>
          </div>
          
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center hover:border-primary/10 transition-all relative overflow-hidden group">
            <div className="icon-wrapper-primary h-12 w-12 flex mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Coins className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">2. Signup Welcome</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Referred accounts immediately receive a +100 welcome coins bonus upon registration.</p>
          </div>
          
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center hover:border-primary/10 transition-all relative overflow-hidden group">
            <div className="icon-wrapper-secondary h-12 w-12 flex mx-auto mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">3. Tier Payout Shares</h3>
            <p className="text-xs text-zinc-450 leading-relaxed">Earn from 5% up to 30% commission on every offer, survey, or download they complete.</p>
          </div>
        </div>

        <button
          onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
          className="btn-gaming rounded-xl px-8 py-3.5 text-xs sm:text-sm font-extrabold"
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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <div className="icon-wrapper-primary p-1.5 border-none shadow-[0_0_8px_rgba(0,231,1,0.2)]">
            <Users className="h-5.5 w-5.5" />
          </div>
          Affiliates
        </h1>
        <button 
          onClick={() => alert("Affiliate guidelines: Share your URL, earn commission percentage based on Tiers 1-10 on completions. Commissions can be claimed at any time to your active coin balance.")}
          className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Info className="h-4 w-4 text-primary" />
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
                      <div className="p-1 rounded bg-zinc-950 border border-dark-border/40 inline-flex items-center justify-center mr-1">
                        {(() => {
                          const BadgeIcon = currentTier.badge;
                          return <BadgeIcon className={`h-3.5 w-3.5 ${currentTier.color}`} />;
                        })()}
                      </div>
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
                  <div className="icon-wrapper-secondary p-0.5 border-none rounded-full shrink-0">
                    <Coins className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-white">{claimableCoins.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Available</span>
                </div>
                
                <button
                  onClick={handleClaimEarnings}
                  disabled={claimableCoins <= 0}
                  className="btn-gaming rounded-xl px-5 py-2 text-xs font-extrabold"
                >
                  Claim
                </button>
              </div>
            </div>

            {/* Right Card: Statistics Grid */}
            <div className="lg:col-span-7 rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                <div className="icon-wrapper-primary p-1 border-none shadow-[0_0_8px_rgba(56,189,248,0.1)]">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                Statistics
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-primary p-2.5 shrink-0">
                    <DollarSign className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wide">Total Earnings</span>
                    <span className="text-sm font-black text-white">{(stats.totalEarnings).toLocaleString()} Coins</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-primary p-2.5 shrink-0">
                    <Users className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wide">Users Referred</span>
                    <span className="text-sm font-black text-white">{stats.totalReferrals}</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-primary p-2.5 shrink-0">
                    <Clock className="h-5.5 w-5.5" />
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
                  className="flex-1 rounded-xl bg-dark-bg border border-dark-border px-3.5 py-2.5 text-xs text-zinc-350 select-all focus:outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] font-semibold"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold shrink-0 ${
                    copied 
                      ? 'btn-gaming shadow-[0_0_10px_rgba(0,231,1,0.35)]' 
                      : 'btn-gaming-secondary'
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-black font-extrabold" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy link
                </button>
              </div>
            </div>

            {/* Social Share logos */}
            <div className="shrink-0 space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider md:text-right">
                Share your referral link
              </span>
              <div className="flex gap-2">
                {/* Whatsapp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=Join RewardCash and earn coins! ${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-bg border border-dark-border/80 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-zinc-400 hover:text-primary transition-all active:scale-90"
                  title="Share on WhatsApp"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.875-6.959-1.856-1.857-4.325-2.88-6.953-2.881-5.438 0-9.864 4.42-9.867 9.864-.001 1.757.485 3.468 1.411 4.966l-.99 3.619 3.701-.971zm11.367-7.251c-.302-.151-1.787-.882-2.058-.981-.271-.099-.468-.151-.664.151-.196.3-.76.981-.931 1.18-.171.199-.343.226-.644.076-.301-.15-1.272-.469-2.422-1.494-.894-.798-1.498-1.784-1.674-2.086-.176-.301-.019-.464.132-.613.136-.134.301-.351.452-.527.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.527-.075-.15-.664-1.609-.91-2.201-.24-.578-.484-.5-.664-.51-.171-.009-.368-.01-.565-.01-.196 0-.518.075-.789.377-.271.301-1.036 1.015-1.036 2.475 0 1.46 1.063 2.874 1.214 3.074.15.201 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.787-.732 2.039-1.439.252-.707.252-1.314.177-1.439-.076-.126-.272-.201-.573-.351z"/>
                  </svg>
                </a>
                {/* Twitter */}
                <a 
                  href={`https://twitter.com/intent/tweet?text=Join RewardCash and earn coins! ${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-bg border border-dark-border/80 hover:border-[#00b2ff]/50 hover:bg-[#00b2ff]/5 flex items-center justify-center text-zinc-400 hover:text-[#00b2ff] transition-all active:scale-90"
                  title="Share on X"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${getReferralLink()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-bg border border-dark-border/80 hover:border-blue-600/50 hover:bg-blue-600/5 flex items-center justify-center text-zinc-400 hover:text-blue-500 transition-all active:scale-90"
                  title="Share on Facebook"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
                {/* Telegram */}
                <a 
                  href={`https://t.me/share/url?url=${getReferralLink()}&text=Join RewardCash and earn coins!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-bg border border-dark-border/80 hover:border-[#00b2ff]/50 hover:bg-[#00b2ff]/5 flex items-center justify-center text-zinc-400 hover:text-[#00b2ff] transition-all active:scale-90"
                  title="Share on Telegram"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.03-.75 4.04-1.76 6.74-2.92 8.1-3.48 3.85-1.58 4.65-1.86 5.17-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.19z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex gap-2.5 bg-dark-bg/60 p-1.5 rounded-xl border border-dark-border max-w-sm">
            {['Tiers', 'Affiliates', 'Leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold active:scale-95 hover:scale-[1.02] transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,231,1,0.35)]' 
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
                        isActive                          ? 'border-primary bg-primary/[0.02] shadow-[0_0_20px_rgba(0,231,1,0.1)]'
                          : 'border-dark-border bg-dark-card/85'
                      }`}
                    >
                      {/* Active Tag */}
                      {isActive && (
                        <div className="absolute -top-2.5 left-6 rounded-full bg-primary text-[8px] font-black text-black px-2.5 py-0.5 uppercase tracking-widest border border-primary">
                          Active
                        </div>
                      )}

                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-dark-bg border border-dark-border/80 flex items-center justify-center shrink-0 group-hover:border-primary/25 transition-colors shadow-inner mr-1.5">
                              {(() => {
                                const BadgeIcon = tier.badge;
                                return <BadgeIcon className={`h-4 w-4 ${tier.color}`} />;
                              })()}
                            </div>
                            {tier.badgeName}
                          </span>
                          <span className="rounded-full bg-dark-bg border border-dark-border px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase">
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
                                ? 'bg-primary/10 border-primary/30 text-primary' 
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
                <div className="icon-wrapper-primary p-1 border-none shadow-[0_0_8px_rgba(0,231,1,0.2)]">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Affiliate Invites Directory</h3>
              </div>

              {referralsList.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-dark-bg/20 border border-dashed border-dark-border">
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
                        <tr key={idx} className="group hover:bg-dark-bg/40 transition-colors">
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
              
              <div className="text-center py-10 rounded-xl bg-dark-bg/20 border border-dashed border-dark-border text-xs text-zinc-500 font-bold uppercase tracking-wide">
                Leaderboard statistics update every Sunday. Start referring to compete!
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
