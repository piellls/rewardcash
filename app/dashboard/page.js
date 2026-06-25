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
  User
} from 'lucide-react';

const calculateLevel = (totalEarned = 0) => {
  if (totalEarned < 1000) return { level: 1, current: totalEarned, next: 1000, percentage: (totalEarned / 1000) * 100 };
  if (totalEarned < 5000) return { level: 2, current: totalEarned - 1000, next: 4000, percentage: ((totalEarned - 1000) / 4000) * 100 };
  if (totalEarned < 20000) return { level: 3, current: totalEarned - 5000, next: 15000, percentage: ((totalEarned - 5000) / 15000) * 100 };
  if (totalEarned < 100000) return { level: 4, current: totalEarned - 20000, next: 80000, percentage: ((totalEarned - 20000) / 80000) * 100 };
  return { level: 5, current: totalEarned - 100000, next: 500000, percentage: Math.min(((totalEarned - 100000) / 500000) * 100, 100) };
};

export default function Dashboard() {
  const { user } = useAuth();
  
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
          <div className="icon-wrapper-primary p-1.5 border-none shadow-[0_0_8px_rgba(56,189,248,0.1)]">
            <User className="h-5.5 w-5.5" />
          </div>
          My Profile
        </h1>
        <button 
          onClick={() => alert("Profile Settings: Updates coming soon!")}
          className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <div className="icon-wrapper-secondary p-1 border-none mr-0.5 text-[#38bdf8] bg-transparent">
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
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#10b981] pt-1">
                    <span>Level</span>
                    <svg className="h-4 w-4 fill-current text-[#10b981]" viewBox="0 0 24 24">
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
                <div className="h-2 w-full rounded-full bg-zinc-950/80 border border-dark-border overflow-hidden p-[2px]">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary shadow-[0_0_8px_rgba(56,189,248,0.4)] transition-all duration-500"
                    style={{ width: `${levelData.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Card: Stats Grid */}
            <div className="lg:col-span-7 rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                
                {/* Stat 1: Total Earnings */}
                <div className="rounded-xl border border-dark-border bg-zinc-950/20 p-4 flex items-center gap-4 hover:border-emerald-500/10 transition-colors">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">${totalEarningsUSD.toFixed(2)}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Earnings</span>
                  </div>
                </div>

                {/* Stat 2: Completed Offers */}
                <div className="rounded-xl border border-dark-border bg-zinc-950/20 p-4 flex items-center gap-4 hover:border-emerald-500/10 transition-colors">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">{completions.length}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Completed offers</span>
                  </div>
                </div>

                {/* Stat 3: Users Referred */}
                <div className="rounded-xl border border-dark-border bg-zinc-950/20 p-4 flex items-center gap-4 hover:border-emerald-500/10 transition-colors">
                  <div className="icon-wrapper-secondary h-11 w-11 flex shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">{referralsCount}</span>
                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Users referred</span>
                  </div>
                </div>

                {/* Stat 4: Earnings last 30 days */}
                <div className="rounded-xl border border-dark-border bg-zinc-950/20 p-4 flex items-center gap-4 hover:border-emerald-500/10 transition-colors">
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
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/20 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                      : 'bg-zinc-950/40 border border-dark-border text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
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
                            ? 'text-[#38bdf8]' 
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        {sub}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10b981] rounded-full" />
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
                        className={`w-9 h-5 rounded-full p-[2px] transition-colors relative focus:outline-none cursor-pointer ${
                          showPendingOnly ? 'bg-[#10b981]' : 'bg-zinc-800 border border-dark-border'
                        }`}
                      >
                        <div 
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            showPendingOnly ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Partner Selector */}
                    <div className="relative">
                      <select
                        value={partnerFilter}
                        onChange={(e) => setPartnerFilter(e.target.value)}
                        className="appearance-none rounded-xl bg-zinc-950 border border-dark-border pl-3.5 pr-8 py-2 font-bold text-zinc-350 focus:outline-none text-[11px] cursor-pointer"
                      >
                        <option value="All">All offer partners</option>
                        <option value="AdBlueMedia">AdBlueMedia</option>
                        <option value="CPALead">CPALead</option>
                        <option value="Lootably">Lootably</option>
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
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
                            <tr key={c.id} className="group hover:bg-zinc-900/10 transition-colors">
                              <td className="py-3 pr-4 font-bold text-white">{c.offer_title}</td>
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
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
                            <tr key={c.id} className="group hover:bg-zinc-900/10 transition-colors">
                              <td className="py-3 pr-4 font-bold text-white">{c.offer_title}</td>
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
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                  <div className="text-center py-12">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No rewards claimed yet</p>
                  </div>
                </div>
              ) : (
                /* Referrals sub tab */
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                  {referralsCount === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No users referred yet</p>
                      <Link href="/referrals" className="text-[10px] text-primary hover:underline font-bold mt-1.5 uppercase block">Get invite link</Link>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-400 font-bold">You have referred {referralsCount} users.</p>
                      <Link href="/referrals" className="text-[10px] text-[#10b981] hover:underline font-bold mt-1.5 uppercase block">View Invites Directory</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeMainTab === 'Started offers' ? (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="text-center py-12">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">No offers started yet</p>
                <Link href="/earn" className="text-[10px] text-[#10b981] hover:underline font-extrabold uppercase tracking-wider">
                  Browse Offers
                </Link>
              </div>
            </div>
          ) : (
            /* Withdrawals Tab */
            <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">No cashout payouts requested yet</p>
                  <Link href="/cashout" className="text-[10px] text-[#10b981] hover:underline font-extrabold uppercase tracking-wider">
                    Browse Cashouts
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-550 uppercase tracking-widest pb-3">
                        <th className="pb-3 pr-4">Payout Method</th>
                        <th className="pb-3 px-4">Address</th>
                        <th className="pb-3 px-4 text-center">Amount (USD)</th>
                        <th className="pb-3 px-4 text-center">Status</th>
                        <th className="pb-3 pl-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="group hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3 pr-4 font-bold text-white uppercase">{w.payment_method} Payout</td>
                          <td className="py-3 px-4 font-semibold text-zinc-400 select-all">{w.payment_address}</td>
                          <td className="py-3 px-4 text-center font-extrabold text-white">${parseFloat(w.amount_usd).toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-bold">
                            {w.status === 'approved' && <span className="text-[9px] font-black uppercase text-primary bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded">Paid</span>}
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
