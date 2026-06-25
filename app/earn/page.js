'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, isMockMode } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Flame, Award, Gamepad2, Play, Sparkles, CheckCircle, Loader2, Lock, Check, TrendingUp, AlertTriangle, Globe, Target, FileText, Smartphone, Swords, MessageSquare, Music } from 'lucide-react';

export default function Earn() {
  const { user, earnCoinsSimulated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Auth state redirect
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Task execution states
  const [executingOffer, setExecutingOffer] = useState(null);
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Daily Streak state
  const [streak, setStreak] = useState({ currentDay: 1, lastClaimed: null });
  const [canClaim, setCanClaim] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const STREAK_REWARDS = [
    { day: 1, coins: 25 },
    { day: 2, coins: 50 },
    { day: 3, coins: 75 },
    { day: 4, coins: 100 },
    { day: 5, coins: 150 },
    { day: 6, coins: 250 },
    { day: 7, coins: 500 }
  ];

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
          // Reset streak if over 48 hours since last claim
          currentDay = 1;
          setCanClaim(true);
        } else if (diffHours >= 24) {
          // Available to claim next day
          setCanClaim(true);
        } else {
          // Less than 24 hours
          setCanClaim(false);
        }
      } else {
        // Never claimed
        setCanClaim(true);
      }
      
      setStreak({ currentDay, lastClaimed: lastClaimedTime });
    };

    loadStreak();
    const interval = setInterval(loadStreak, 60000); // refresh every minute
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

  // Fetch live AdBlueMedia offers
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const userId = user ? user.id : 'guest';
        const res = await fetch(`/api/offers?s1=${userId}`);
        const data = await res.json();
        
        const mappedOffers = (data || []).map(offer => {
          const rawPayout = parseFloat(offer.user_payout || offer.payout || '0.20');
          const calculatedCoins = Math.round(rawPayout * 1000);
          
          // Categorization by keywords
          const text = `${offer.name} ${offer.conversion} ${offer.anchor}`.toLowerCase();
          let category = 'Survey';
          if (text.includes('game') || text.includes('play') || text.includes('level') || text.includes('slot') || text.includes('العاب') || text.includes('لعبة')) {
            category = 'Game';
          } else if (text.includes('install') || text.includes('download') || text.includes('app') || text.includes('تطبيق') || text.includes('تنزيل') || text.includes('mobile')) {
            category = 'App';
          }
          
          return {
            id: offer.id,
            title: offer.name || 'AdBlueMedia Task',
            description: offer.conversion || 'Complete the task steps to earn your reward.',
            coins: calculatedCoins,
            payout: rawPayout,
            provider: 'AdBlueMedia',
            icon: offer.network_icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
            category: category,
            url: offer.url,
            anchor: offer.anchor || 'Earn Coins'
          };
        });

        setOffers(mappedOffers);
      } catch (err) {
        console.error("Failed to fetch live offers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user?.id]);

  const categories = ['All', 'Game', 'Survey', 'App'];

  const filteredOffers = selectedCategory === 'All' 
    ? offers 
    : offers.filter(o => o.category === selectedCategory);

  const handleOfferClick = (offer) => {
    if (!user) {
      setAuthTab('register');
      setIsAuthOpen(true);
      return;
    }
    
    if (!isMockMode) {
      window.open(offer.url, '_blank');
    } else {
      setExecutingOffer(offer);
    }
  };

  const handleSimulateCompletion = async () => {
    if (!user || !executingOffer) return;
    
    setLoadingOfferId(executingOffer.id);
    try {
      await earnCoinsSimulated(executingOffer);
      setSuccessMessage(`Success! You have completed "${executingOffer.title}" and earned ${executingOffer.coins} coins.`);
      setExecutingOffer(null);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      alert(err.message || 'Failed to complete offer');
    } finally {
      setLoadingOfferId(null);
    }
  };

  const handleClaimStreak = async () => {
    if (!user) {
      setAuthTab('register');
      setIsAuthOpen(true);
      return;
    }
    if (!canClaim) return;
    
    const rewardCoins = STREAK_REWARDS[streak.currentDay - 1].coins;
    
    setLoadingOfferId('streak');
    try {
      await earnCoinsSimulated({
        id: `streak_day_${streak.currentDay}`,
        name: `Daily Streak Day ${streak.currentDay}`,
        payout: rewardCoins / 1000,
        coins: rewardCoins,
        provider: 'Daily Streak'
      });
      
      const nextDay = streak.currentDay === 7 ? 1 : streak.currentDay + 1;
      const now = Date.now();
      
      localStorage.setItem(`rc_streak_last_claimed_${user.id}`, now.toString());
      localStorage.setItem(`rc_streak_current_day_${user.id}`, nextDay.toString());
      
      setStreak({ currentDay: nextDay, lastClaimed: now });
      setCanClaim(false);
      setSuccessMessage(`Success! You claimed Day ${streak.currentDay} bonus of ${rewardCoins} coins!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to claim daily bonus');
    } finally {
      setLoadingOfferId(null);
    }
  };

  const partnerWalls = [
    { name: 'AdBlueMedia', desc: 'Highest paying surveys & mobile apps', badge: '1.5x Boost', logo: Globe, logoColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20', active: true },
    { name: 'CPALead', desc: 'Fast mobile app installs & fast completions', badge: 'Popular', logo: Target, logoColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', active: false },
    { name: 'Lootably', desc: 'Watch videos, play games and complete quizzes', badge: 'New', logo: Play, logoColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20', active: false },
    { name: 'CPX Research', desc: 'Best and highest qualifying global surveys', badge: 'Hot', logo: FileText, logoColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20', active: false }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Page Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            Earn Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Claim your daily rewards, unlock partner walls, or complete direct tasks to earn coins.
          </p>
        </div>
        
        {isMockMode && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-dark-border px-4 py-2 text-xs text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Sandbox Simulator Active</span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {/* 1. DAILY STREAK PANEL */}
      <div className="mb-8 rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden shadow-xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-dark-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-tr from-secondary/20 to-primary/20 p-2.5">
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
            {!user ? (
              <button 
                onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
                className="rounded-xl bg-gradient-to-r from-secondary to-primary px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Sign In to Claim
              </button>
            ) : canClaim ? (
              <button
                onClick={handleClaimStreak}
                disabled={loadingOfferId === 'streak'}
                className="rounded-xl bg-gradient-to-r from-secondary to-primary px-6 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
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

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {STREAK_REWARDS.map((reward) => {
            const isClaimed = user && reward.day < streak.currentDay;
            const isActive = user && reward.day === streak.currentDay;
            const isLocked = !user || reward.day > streak.currentDay;
            const isFinalDay = reward.day === 7;

            return (
              <div 
                key={reward.day}
                className={`relative flex flex-col items-center justify-between rounded-xl border p-4 transition-all overflow-hidden ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                    : isClaimed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-dark-border bg-zinc-950/40 opacity-70'
                }`}
              >
                {/* Background Sparkles on Active/Claimed */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-primary/5 pointer-events-none animate-pulse-slow" />
                )}

                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  isActive ? 'text-primary' : isClaimed ? 'text-emerald-400' : 'text-zinc-550'
                }`}>
                  Day {reward.day}
                </span>

                <div className="my-4 flex items-center justify-center">
                  {isClaimed ? (
                    <div className="rounded-full bg-emerald-500/20 p-2 border border-emerald-500/30">
                      <Check className="h-5 w-5 text-emerald-400" />
                    </div>
                  ) : isLocked ? (
                    <div className="rounded-full bg-zinc-900 p-2 border border-dark-border">
                      <Lock className="h-5 w-5 text-zinc-650" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-primary/10 p-2 border border-primary/20 animate-bounce">
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

      {/* 2. PARTNER WALLS GRID */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-secondary" />
          Partner Offerwalls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerWalls.map((wall) => (
            <div 
              key={wall.name}
              onClick={() => {
                if (wall.active) {
                  const target = document.getElementById('direct-tasks');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                } else {
                  alert(`${wall.name} is currently in sandbox mode. Please complete the live AdBlueMedia offers in the list below.`);
                }
              }}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                wall.active 
                  ? 'border-primary/20 bg-dark-card hover:border-primary/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)] active:scale-[0.98]'
                  : 'border-dark-border bg-dark-card/60 opacity-80 hover:opacity-100 hover:border-zinc-800'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                  wall.active 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : 'bg-zinc-900 text-zinc-400 border-dark-border'
                }`}>
                  {wall.badge}
                </span>
              </div>

              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${wall.logoColor}`}>
                  {(() => {
                    const LogoIcon = wall.logo;
                    return <LogoIcon className="h-5 w-5" />;
                  })()}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                  {wall.name}
                </h3>
                <p className="text-xs text-zinc-450 mt-1 leading-relaxed">
                  {wall.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-dark-border/40 flex items-center justify-between">
                <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">
                  {wall.active ? 'Open Wall' : 'Sandbox'}
                </span>
                <Play className="h-3 w-3 text-zinc-550 group-hover:text-primary group-hover:translate-x-0.5 transition-all fill-zinc-550 group-hover:fill-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DIRECT TASKS (LIVE ADBLUEMEDIA FEED) */}
      <div id="direct-tasks" className="scroll-mt-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-dark-border pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Direct Tasks
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-dark-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-black shadow-sm' 
                    : 'text-zinc-450 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
              Loading Offers...
            </span>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dark-border border-dashed text-zinc-500 text-sm">
            No tasks found in this category at the moment. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map((offer) => (
              <div 
                key={offer.id}
                onClick={() => handleOfferClick(offer)}
                className="flex flex-col justify-between rounded-xl border border-dark-border bg-dark-card p-5 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.06)] active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Accent lines */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary/0 via-primary/0 to-primary/0 group-hover:via-primary/30 transition-all duration-500" />
                
                <div>
                  {/* Icon & Category */}
                  <div className="flex items-center justify-between mb-4">
                    {offer.icon && offer.icon.startsWith('http') ? (
                      <img 
                        src={offer.icon} 
                        alt={offer.title}
                        className="h-11 w-11 rounded-lg border border-dark-border/80 object-cover bg-zinc-950"
                      />
                    ) : (
                      <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-dark-border flex items-center justify-center">
                        {(() => {
                          const iconKey = (offer.icon || offer.category || '').toLowerCase();
                          if (iconKey === 'game') return <Gamepad2 className="h-5 w-5 text-amber-400" />;
                          if (iconKey === 'survey') return <FileText className="h-5 w-5 text-sky-400" />;
                          if (iconKey === 'app') return <Smartphone className="h-5 w-5 text-emerald-400" />;
                          return <Gamepad2 className="h-5 w-5 text-zinc-400" />;
                        })()}
                      </div>
                    )}
                    
                    <span className="rounded-full bg-zinc-900 border border-dark-border/60 px-2.5 py-0.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      {offer.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-zinc-450 mt-1 line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-dark-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full bg-primary/10 p-0.5">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-extrabold text-sm text-white">{offer.coins.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Coins</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-0.5 transition-all">
                    {offer.anchor.length > 15 ? `${offer.anchor.substring(0, 15)}...` : offer.anchor} 
                    <Play className="h-2.5 w-2.5 fill-primary text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Execution Modal (Simulated Sandbox) */}
      {executingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setExecutingOffer(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl overflow-hidden">
            {/* Top color accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Award className="h-5.5 w-5.5 text-primary" />
              Sandbox Offer Simulator
            </h2>
            <p className="text-[11px] text-zinc-400 border-b border-dark-border/60 pb-3 mb-4 flex justify-between">
              <span>Provider: <strong className="text-zinc-200">{executingOffer.provider}</strong></span>
              <span>Value: <strong className="text-primary">${executingOffer.payout.toFixed(2)}</strong></span>
            </p>
            
            <div className="space-y-3.5 mb-5">
              <div className="rounded-xl bg-zinc-950 p-4 border border-dark-border/60">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Offer Title</h4>
                <p className="text-sm font-semibold text-white">{executingOffer.title}</p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4 border border-dark-border/60">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Requirements</h4>
                <p className="text-xs text-zinc-350 leading-relaxed">{executingOffer.description}</p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/60 border border-dark-border/60 p-3.5 text-xs text-zinc-400">
                <AlertTriangle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Sandbox Action:</strong> This is a simulation container. Clicking complete will award <strong>{executingOffer.coins.toLocaleString()} Coins</strong> to your wallet balance instantly. In production, this directs users to CPA target.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExecutingOffer(null)}
                className="flex-1 rounded-xl border border-dark-border bg-zinc-900 py-3 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
              >
                Close Sandbox
              </button>
              <button
                onClick={handleSimulateCompletion}
                disabled={loadingOfferId !== null}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary py-3 text-xs font-black text-black hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)] animate-pulse"
              >
                {loadingOfferId ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    Complete & Claim Coins
                    <Coins className="h-4 w-4 text-black fill-black" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialTab={authTab} 
      />
    </div>
  );
}
