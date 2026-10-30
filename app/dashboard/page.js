'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import Art from '@/components/Art';
import { 
  Coins, 
  Settings, 
  Wallet, 
  Shield, 
  Users, 
  Clock, 
  Lock, 
  CheckCircle2, 
  Award, 
  History, 
  Calendar,
  User,
  Flame,
  Sparkles,
  Check,
  TrendingUp,
  Loader2,
  Gift
} from 'lucide-react';

const calculateLevel = (totalEarned = 0) => {
  if (totalEarned < 1000) return { level: 1, current: totalEarned, next: 1000, percentage: (totalEarned / 1000) * 100 };
  if (totalEarned < 5000) return { level: 2, current: totalEarned - 1000, next: 4000, percentage: ((totalEarned - 1000) / 4000) * 100 };
  if (totalEarned < 20000) return { level: 3, current: totalEarned - 5000, next: 15000, percentage: ((totalEarned - 5000) / 15000) * 100 };
  if (totalEarned < 100000) return { level: 4, current: totalEarned - 20000, next: 80000, percentage: ((totalEarned - 20000) / 80000) * 100 };
  return { level: 5, current: totalEarned - 100000, next: 500000, percentage: Math.min(((totalEarned - 100000) / 500000) * 100, 100) };
};

export default function Dashboard() {
  const { user, updateAvatar, updateProfileDetails } = useAuth();
  
  const [completions, setCompletions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referralsCount, setReferralsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Profile Settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsAvatar, setSettingsAvatar] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    
    try {
      if (!settingsUsername.trim()) throw new Error('Username cannot be empty');
      if (!settingsEmail.trim()) throw new Error('Email cannot be empty');
      
      await updateProfileDetails(settingsUsername.trim(), settingsEmail.trim());
      
      if (settingsAvatar !== user.avatar_url) {
        await updateAvatar(settingsAvatar);
      }
      
      setSettingsSuccess('Settings saved successfully!');
      setTimeout(() => {
        setIsSettingsOpen(false);
      }, 1500);
    } catch (err) {
      setSettingsError(err.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // UI Tabs State
  const [activeMainTab, setActiveMainTab] = useState('Earnings'); // 'Earnings', 'Started offers', 'Withdrawals'
  const [activeSubTab, setActiveSubTab] = useState('Surveys'); // 'Offers', 'Surveys', 'Rewards', 'Referrals'
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState('All');

  // Auth Redirect Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadUserData = async () => {
    if (user) {
      setLoading(true);
      try {
        const c = await db.getCompletedOffers(user.id);
        const w = await db.getWithdrawals(user.id);
        const r = await db.getReferralStats(user.id);
        setCompletions(c || []);
        setWithdrawals(w || []);
        setReferralsCount(r?.totalReferrals || 0);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  // Guest view
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-zinc-50 border border-dark-border p-4 text-zinc-400 mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Member Profile</h1>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Please log in or register a new account to view your profile, statistics, earnings history, and withdrawals.
        </p>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="btn-gaming rounded-xl px-8 py-3.5 text-xs sm:text-sm font-extrabold"
        >
          Sign In / Register
        </button>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          defaultTab="login" 
        />
      </div>
    );
  }

  // Values calculation
  const totalEarningsUSD = (user.total_earned_coins || 0) / 1000;
  
  // Calculate earnings last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysCoins = completions
    .filter(c => new Date(c.completed_at) >= thirtyDaysAgo)
    .reduce((sum, c) => sum + c.coins, 0);
  const last30DaysEarningsUSD = last30DaysCoins / 1000;

  const levelData = calculateLevel(user.total_earned_coins || 0);
  const coinsToLevelUp = levelData.next - levelData.current;

  // Filtered completions by tab/subtab
  const surveysList = completions.filter(c => {
    const isSurvey = c.category?.toLowerCase() === 'survey' || c.offer_title?.toLowerCase().includes('survey');
    const matchesPartner = partnerFilter === 'All' || c.provider === partnerFilter;
    // Mock completions are instantly approved; pending only filters them out
    return isSurvey && matchesPartner && (!showPendingOnly);
  });

  const offersList = completions.filter(c => {
    const isOffer = c.category?.toLowerCase() !== 'survey' && !c.offer_title?.toLowerCase().includes('survey');
    return isOffer;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header Row */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="g-title text-2xl sm:text-3xl flex items-center gap-3">
          <div className="icon-wrapper-primary p-1.5 border-none shadow-[0_0_8px_rgba(47,214,114,0.2)]">
            <User className="h-5.5 w-5.5" />
          </div>
          My Profile
        </h1>
        <button 
          onClick={() => {
            setSettingsUsername(user.username || '');
            setSettingsEmail(user.email || '');
            setSettingsAvatar(user.avatar_url || '/avatars/avatar_1.png');
            setSettingsError('');
            setSettingsSuccess('');
            setIsSettingsOpen(true);
          }}
          className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <div className="icon-wrapper-primary p-1 border-none mr-0.5 text-primary bg-transparent">
            <Settings className="h-3.5 w-3.5" />
          </div>
          Settings
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3 animate-pulse">
            Loading Profile Data...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top Panel (Profile Card & Stats split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Card: Profile Details */}
            <div className="lg:col-span-5 g-card p-6 flex flex-col justify-between relative overflow-hidden">
              <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-8 w-[150px] opacity-90 sm:w-[170px]">
                <Art name="trophy" size="100%" glow="gold" float />
              </div>
              
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img 
                    src={user.avatar_url || '/avatars/1.png'} 
                    alt={user.username}
                    className="h-20 w-20 rounded-full border-2 border-[#2fd672] object-cover bg-[var(--bb-surface-2)] shadow-[0_0_0_4px_rgba(47,214,114,0.2),0_0_24px_rgba(47,214,114,0.45)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {user.username}
                  </h2>
                  <span className="block text-xs font-semibold text-zinc-500">
                    Joined {Math.max(0, Math.floor((new Date() - new Date(user.created_at || Date.now())) / (1000 * 60 * 60 * 24)))}D ago
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary pt-1">
                    <span>Level</span>
                    <svg className="h-4 w-4 fill-current text-primary" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{levelData.level}</span>
                  </div>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">Progress</span>
                  <span className="text-zinc-400 font-extrabold">
                    {coinsToLevelUp.toLocaleString()} coins to level up
                  </span>
                </div>
                <div className="g-xp" role="progressbar" aria-label="Level progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(levelData.percentage)}>
                  <i style={{ '--p': Math.min(1, Math.max(0, levelData.percentage / 100)) }} />
                </div>
              </div>
            </div>

            {/* Right Card: Stats Grid */}
            <div className="lg:col-span-7 g-card p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                
                {/* Stat 1: Total Earnings */}
                <div className="rounded-xl border border-dark-border bg-dark-bg/60 p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">${totalEarningsUSD.toFixed(2)}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Earnings</span>
                  </div>
                </div>

                {/* Stat 2: Completed Offers */}
                <div className="rounded-xl border border-dark-border bg-dark-bg/60 p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">{completions.length}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Completed offers</span>
                  </div>
                </div>

                {/* Stat 3: Users Referred */}
                <div className="rounded-xl border border-dark-border bg-dark-bg/60 p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">{referralsCount}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Users referred</span>
                  </div>
                </div>

                {/* Stat 4: Earnings last 30 days */}
                <div className="rounded-xl border border-dark-border bg-dark-bg/60 p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">${last30DaysEarningsUSD.toFixed(2)}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Earnings last 30 days</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* DAILY SPIN SHORTCUT */}
          <Link href="/spin" className="g-card g-card-hover g-spot group flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className="icon-wrapper-gradient h-12 w-12 shrink-0"><Gift className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="font-extrabold text-white">Free spin every 24 hours</p>
                <p className="text-sm text-zinc-400">Open the spin page to claim yours. Prizes are added to your balance.</p>
              </div>
            </div>
            <span className="btn-gaming hidden rounded-xl px-5 py-2.5 text-xs sm:inline-flex">Spin</span>
          </Link>

          {/* Main Tabs */}
          <div className="flex gap-2.5 pb-2">
            {['Earnings', 'Started offers', 'Withdrawals'].map((tab) => {
              const isActive = activeMainTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`rounded-xl px-5 py-2 text-xs font-extrabold active:scale-95 hover:scale-[1.02] transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(47,214,114,0.2)]' 
                      : 'bg-dark-bg/60 border border-dark-border text-zinc-400 hover:text-zinc-800 hover:bg-dark-card'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          {activeMainTab === 'Earnings' ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/40 pb-3">
                {/* Sub Tabs */}
                <div className="flex gap-6">
                  {['Offers', 'Surveys', 'Rewards', 'Referrals'].map((sub) => {
                    const isActive = activeSubTab === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveSubTab(sub)}
                        className={`relative py-2 text-xs font-extrabold active:scale-95 transition-all cursor-pointer ${
                          isActive 
                            ? 'text-primary' 
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        {sub}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Filters */}
                {activeSubTab === 'Surveys' && (
                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    {/* Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-500">Show pending surveys only</span>
                      <button
                        onClick={() => setShowPendingOnly(!showPendingOnly)}
                        className={`w-9 h-5 rounded-full p-[2px] transition-all relative focus:outline-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] ${
                          showPendingOnly ? 'bg-primary shadow-[0_0_8px_rgba(47,214,114,0.3)]' : 'bg-dark-bg border border-dark-border'
                        }`}
                      >
                        <div 
                          className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 ${
                            showPendingOnly ? 'translate-x-4 bg-dark-bg' : 'translate-x-0 bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Partner Selector */}
                    <div className="relative">
                      <select
                        value={partnerFilter}
                        onChange={(e) => setPartnerFilter(e.target.value)}
                        className="appearance-none rounded-xl bg-dark-bg border border-dark-border pl-3.5 pr-8 py-2 font-bold text-zinc-300 focus:outline-none text-[11px] cursor-pointer hover:border-dark-hover focus:border-primary/50 transition-all"
                      >
                        <option value="All" className="bg-dark-card text-white">All offer partners</option>
                        <option value="OGAds" className="bg-dark-card text-white">OGAds</option>
                        <option value="AdBlueMedia" className="bg-dark-card text-white">AdBlueMedia</option>
                        <option value="Lootably" className="bg-dark-card text-white">Lootably</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lists / Tables */}
              {activeSubTab === 'Surveys' ? (
                <div className="g-card p-5 shadow-custom-card">
                  {surveysList.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No surveys have been completed yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                            <th className="pb-3 pr-4">Survey Name</th>
                            <th className="pb-3 px-4">Reward</th>
                            <th className="pb-3 px-4">Reward Status</th>
                            <th className="pb-3 px-4">Survey Partner</th>
                            <th className="pb-3 pl-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                          {surveysList.map((c) => (
                            <tr key={c.id} className="group hover:bg-dark-hover/40 transition-all duration-200">
                              <td className="py-3 pr-4 font-bold text-white group-hover:text-primary transition-colors">{c.offer_title}</td>
                              <td className="py-3 px-4 font-extrabold text-primary">
                                <span className="flex items-center gap-1">
                                  <Coins className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                  {c.coins.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-emerald-400 font-bold">Approved</td>
                              <td className="py-3 px-4 text-zinc-500 font-semibold">{c.provider}</td>
                              <td className="py-3 pl-4 text-right text-zinc-500 font-bold">{new Date(c.completed_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeSubTab === 'Offers' ? (
                <div className="g-card p-5 shadow-custom-card">
                  {offersList.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No offers have been completed yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                            <th className="pb-3 pr-4">Offer Name</th>
                            <th className="pb-3 px-4">Reward</th>
                            <th className="pb-3 px-4">Reward Status</th>
                            <th className="pb-3 px-4">Offer Partner</th>
                            <th className="pb-3 pl-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                          {offersList.map((c) => (
                            <tr key={c.id} className="group hover:bg-dark-hover/40 transition-all duration-200">
                              <td className="py-3 pr-4 font-bold text-white group-hover:text-primary transition-colors">{c.offer_title}</td>
                              <td className="py-3 px-4 font-extrabold text-primary">
                                <span className="flex items-center gap-1">
                                  <Coins className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                  {c.coins.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-emerald-400 font-bold">Approved</td>
                              <td className="py-3 px-4 text-zinc-500 font-semibold">{c.provider}</td>
                              <td className="py-3 pl-4 text-right text-zinc-500 font-bold">{new Date(c.completed_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeSubTab === 'Rewards' ? (
                <div className="g-card p-5 shadow-custom-card">
                  <div className="text-center py-12">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No rewards claimed yet</p>
                  </div>
                </div>
              ) : (
                /* Referrals sub tab */
                <div className="g-card p-5 shadow-custom-card">
                  {referralsCount === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No users referred yet</p>
                      <Link href="/referrals" className="text-[10px] text-primary hover:underline font-bold mt-1.5 uppercase block">Get invite link</Link>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-400 font-bold">You have referred {referralsCount} users.</p>
                      <Link href="/referrals" className="text-[10px] text-primary hover:underline font-bold mt-1.5 uppercase block">View Invites Directory</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeMainTab === 'Started offers' ? (
            <div className="g-card p-6 shadow-custom-card">
              <div className="text-center py-12">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">No offers started yet</p>
                <Link href="/earn" className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wider">
                  Browse Offers
                </Link>
              </div>
            </div>
          ) : (
            /* Withdrawals Tab */
            <div className="g-card p-5 shadow-custom-card">
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">No cashout payouts requested yet</p>
                  <Link href="/cashout" className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wider">
                    Browse Cashouts
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                        <th className="pb-3 pr-4">Payout Method</th>
                        <th className="pb-3 px-4">Address</th>
                        <th className="pb-3 px-4 text-center">Amount (USD)</th>
                        <th className="pb-3 px-4 text-center">Status</th>
                        <th className="pb-3 pl-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="group hover:bg-dark-hover/40 transition-colors">
                          <td className="py-3 pr-4 font-bold text-white uppercase group-hover:text-primary transition-colors">{w.payment_method} Payout</td>
                          <td className="py-3 px-4 font-semibold text-zinc-450 select-all">{w.payment_address}</td>
                          <td className="py-3 px-4 text-center font-extrabold text-white">${parseFloat(w.amount_usd).toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-bold">
                            {w.status === 'approved' && <span className="text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(47,214,114,0.1)]">Paid</span>}
                            {w.status === 'rejected' && <span className="text-[9px] font-black uppercase text-red-400 bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded">Rejected</span>}
                            {w.status === 'pending' && <span className="text-[9px] font-black uppercase text-yellow-500 bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded">Pending</span>}
                          </td>
                          <td className="py-3 pl-4 text-right text-zinc-500 font-bold">{new Date(w.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-xl g-card p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10">
            {/* Top glowing line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Profile Settings
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-dark-border hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>

            {settingsError && (
              <div className="mb-4 text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl text-center">
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div className="mb-4 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl text-center">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Avatar Selector Section */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    '/avatars/avatar_1.png',
                    '/avatars/avatar_2.png',
                    '/avatars/avatar_3.png',
                    '/avatars/avatar_4.png',
                    '/avatars/avatar_5.png',
                    '/avatars/avatar_6.png',
                    '/avatars/avatar_7.png',
                    '/avatars/avatar_8.png',
                    '/avatars/avatar_9.png',
                    '/avatars/avatar_10.png'
                  ].map((url, idx) => {
                    const isSelected = settingsAvatar === url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSettingsAvatar(url)}
                        className={`relative rounded-full aspect-square border-2 transition-all overflow-hidden group active:scale-95 ${
                          isSelected
                            ? 'border-primary shadow-[0_0_15px_rgba(47,214,114,0.35)] scale-105'
                            : 'border-dark-border hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Avatar ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="rounded-full bg-primary p-0.5 shadow-md">
                              <Check className="h-3 w-3 text-black stroke-[3.5]" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="settings-username" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Username
                </label>
                <input
                  id="settings-username"
                  type="text"
                  required
                  value={settingsUsername}
                  onChange={(e) => setSettingsUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-bg text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="settings-email" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="settings-email"
                  type="email"
                  required
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-bg text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={settingsLoading}
                className="btn-gaming w-full py-3.5 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {settingsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
