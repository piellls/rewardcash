'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
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
  Loader2
} from 'lucide-react';

const calculateLevel = (totalEarned = 0) => {
  if (totalEarned < 1000) return { level: 1, current: totalEarned, next: 1000, percentage: (totalEarned / 1000) * 100 };
  if (totalEarned < 5000) return { level: 2, current: totalEarned - 1000, next: 4000, percentage: ((totalEarned - 1000) / 4000) * 100 };
  if (totalEarned < 20000) return { level: 3, current: totalEarned - 5000, next: 15000, percentage: ((totalEarned - 5000) / 15000) * 100 };
  if (totalEarned < 100000) return { level: 4, current: totalEarned - 20000, next: 80000, percentage: ((totalEarned - 20000) / 80000) * 100 };
  return { level: 5, current: totalEarned - 100000, next: 500000, percentage: Math.min(((totalEarned - 100000) / 500000) * 100, 100) };
};

export default function Dashboard() {
  const { user, earnCoinsSimulated } = useAuth();
  
  const [completions, setCompletions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referralsCount, setReferralsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // UI Tabs State
  const [activeMainTab, setActiveMainTab] = useState('Earnings'); // 'Earnings', 'Started offers', 'Withdrawals'
  const [activeSubTab, setActiveSubTab] = useState('Surveys'); // 'Offers', 'Surveys', 'Rewards', 'Referrals'
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState('All');

  // Auth Redirect Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Daily Streak State
  const [streak, setStreak] = useState({ currentDay: 1, lastClaimed: null });
  const [canClaim, setCanClaim] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const STREAK_REWARDS = [
    { day: 1, coins: 25 },
    { day: 2, coins: 50 },
    { day: 3, coins: 75 },
    { day: 4, coins: 100 },
    { day: 5, coins: 150 },
    { day: 6, coins: 250 },
    { day: 7, coins: 500 }
  ];

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

  // Load streak state from localStorage
  useEffect(() => {
    if (!user) return;
    
    const loadStreak = () => {
      const storedLastClaimed = localStorage.getItem(`rc_streak_last_claimed_${user.id}`);
      const storedCurrentDay = localStorage.getItem(`rc_streak_current_day_${user.id}`);
      
      const lastClaimedTime = storedLastClaimed ? parseInt(storedLastClaimed, 10) : null;
      let currentDay = storedCurrentDay ? parseInt(storedCurrentDay, 10) : 1;
      
      if (lastClaimedTime) {
        const now = Date.now();
        const diffMs = now - lastClaimedTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        if (diffHours >= 48) {
          currentDay = 1;
          setCanClaim(true);
        } else if (diffHours >= 24) {
          setCanClaim(true);
        } else {
          setCanClaim(false);
        }
      } else {
        setCanClaim(true);
      }
      
      setStreak({ currentDay, lastClaimed: lastClaimedTime });
    };

    loadStreak();
    const interval = setInterval(loadStreak, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Tick timer countdown for next claim
  useEffect(() => {
    if (!streak.lastClaimed || canClaim) {
      setTimeRemaining('');
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const nextClaimTime = streak.lastClaimed + 24 * 60 * 60 * 1000;
      const remainingMs = nextClaimTime - now;
      
      if (remainingMs <= 0) {
        setCanClaim(true);
        setTimeRemaining('');
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        
        const hStr = hours > 0 ? `${hours}h ` : '';
        const mStr = minutes > 0 || hours > 0 ? `${minutes}m ` : '';
        setTimeRemaining(`${hStr}${mStr}${seconds}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [streak.lastClaimed, canClaim]);

  const handleClaimStreak = async () => {
    if (!user) return;
    if (!canClaim) return;
    
    const rewardCoins = STREAK_REWARDS[streak.currentDay - 1].coins;
    
    setLoadingOfferId('streak');
    try {
      if (earnCoinsSimulated) {
        await earnCoinsSimulated({
          id: `streak_day_${streak.currentDay}_${Date.now()}`,
          name: `Daily Streak Day ${streak.currentDay}`,
          payout: rewardCoins / 1000,
          coins: rewardCoins,
          provider: 'Daily Streak'
        });
      }
      
      const nextDay = streak.currentDay === 7 ? 1 : streak.currentDay + 1;
      const now = Date.now();
      
      localStorage.setItem(`rc_streak_last_claimed_${user.id}`, now.toString());
      localStorage.setItem(`rc_streak_current_day_${user.id}`, nextDay.toString());
      
      setStreak({ currentDay: nextDay, lastClaimed: now });
      setCanClaim(false);
      setSuccessMessage(`Success! You claimed Day ${streak.currentDay} bonus of ${rewardCoins} coins!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadUserData(); // refresh stats
    } catch (err) {
      alert(err.message || 'Failed to claim daily bonus');
    } finally {
      setLoadingOfferId(null);
    }
  };

  // Guest view
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-zinc-900 border border-dark-border p-4 text-zinc-400 mb-6">
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
          initialTab="login" 
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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <div className="icon-wrapper-primary p-1.5 border-none shadow-[0_0_8px_rgba(0,231,1,0.2)]">
            <User className="h-5.5 w-5.5" />
          </div>
          My Profile
        </h1>
        <button 
          onClick={() => alert("Profile Settings: Updates coming soon!")}
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
            <div className="lg:col-span-5 rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img 
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={user.username}
                    className="h-20 w-20 rounded-full border-2 border-dark-border object-cover bg-zinc-950"
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
                <div className="h-2 w-full rounded-full bg-dark-bg/85 border border-dark-border overflow-hidden p-[2px]">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary shadow-[0_0_8px_rgba(0,231,1,0.4)] transition-all duration-500"
                    style={{ width: `${levelData.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Card: Stats Grid */}
            <div className="lg:col-span-7 rounded-2xl border border-dark-border bg-dark-card p-6">
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

          {/* DAILY STREAK PANEL */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-dark-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-gradient p-2.5">
                  <Flame className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    7-Day Daily Streak
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 font-bold">
                      Active
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Log in and claim every 24 hours. Don't break your streak!
                  </p>
                </div>
              </div>

              <div>
                {canClaim ? (
                  <button
                    onClick={handleClaimStreak}
                    disabled={loadingOfferId === 'streak'}
                    className="btn-gaming rounded-xl px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5"
                  >
                    {loadingOfferId === 'streak' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Claim Day {streak.currentDay} Reward
                        <TrendingUp className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col items-end">
                    <button
                      disabled
                      className="rounded-xl bg-zinc-900 border border-dark-border px-5 py-2.5 text-xs font-bold text-zinc-500 cursor-not-allowed"
                    >
                      Streak Claimed
                    </button>
                    {timeRemaining && (
                      <span className="text-[10px] text-zinc-500 mt-1.5 font-bold tracking-wider uppercase">
                        Next Claim: {timeRemaining}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {STREAK_REWARDS.map((reward) => {
                const isClaimed = reward.day < streak.currentDay;
                const isActive = reward.day === streak.currentDay;
                const isLocked = reward.day > streak.currentDay;
                const isFinalDay = reward.day === 7;

                return (
                  <div 
                    key={reward.day}
                    className={`relative flex flex-col items-center justify-between rounded-xl border p-4 transition-all overflow-hidden ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,231,1,0.25)]'
                        : isClaimed
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-dark-border bg-dark-bg/40 opacity-70'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-primary/5 pointer-events-none animate-pulse-slow" />
                    )}

                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      isActive ? 'text-primary' : isClaimed ? 'text-primary' : 'text-zinc-500'
                    }`}>
                      Day {reward.day}
                    </span>

                    <div className="my-4 flex items-center justify-center">
                      {isClaimed ? (
                        <div className="icon-wrapper-primary p-2 shadow-inner border-primary/30 bg-primary/5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      ) : isLocked ? (
                        <div className="icon-wrapper-primary p-2 opacity-40 border-dark-border bg-zinc-950/80">
                          <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                      ) : (
                        <div className="icon-wrapper-gradient p-2 animate-bounce">
                          <Flame className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-black ${
                        isActive ? 'text-white' : isClaimed ? 'text-zinc-400' : 'text-zinc-400'
                      }`}>
                        +{reward.coins}
                      </span>
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Coins</span>
                    </div>

                    {isFinalDay && (
                      <div className="absolute top-1 right-1">
                        <Sparkles className="h-3 w-3 text-secondary animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,231,1,0.2)]' 
                      : 'bg-dark-bg/60 border border-dark-border text-zinc-400 hover:text-zinc-200 hover:bg-dark-card'
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
                          showPendingOnly ? 'bg-primary shadow-[0_0_8px_rgba(0,231,1,0.3)]' : 'bg-dark-bg border border-dark-border'
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
                        <option value="AdBlueMedia" className="bg-dark-card text-white">AdBlueMedia</option>
                        <option value="CPALead" className="bg-dark-card text-white">CPALead</option>
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-custom-card">
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-custom-card">
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-custom-card">
                  <div className="text-center py-12">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No rewards claimed yet</p>
                  </div>
                </div>
              ) : (
                /* Referrals sub tab */
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-custom-card">
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
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6 shadow-custom-card">
              <div className="text-center py-12">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">No offers started yet</p>
                <Link href="/earn" className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wider">
                  Browse Offers
                </Link>
              </div>
            </div>
          ) : (
            /* Withdrawals Tab */
            <div className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-custom-card">
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
                            {w.status === 'approved' && <span className="text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,231,1,0.1)]">Paid</span>}
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
    </div>
  );
}
