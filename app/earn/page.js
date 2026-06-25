'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Coins, Flame, Award, Gamepad2, Play, Sparkles, CheckCircle, Loader2, Lock, Check, TrendingUp, Globe, Target, FileText, Smartphone } from 'lucide-react';

// AdBlueMedia credentials
const ABM_USER_ID = '199180';
const ABM_API_KEY = '784b49bd7b4108039d10fac0f90cc372';
const ABM_FEED    = `https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php`;
const ABM_CHECK   = `https://de6jvomfbm0af.cloudfront.net/public/external/check2.php`;

// JSONP helper – works cross-origin without CORS issues
function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const cbName = `_abm_cb_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, 10000);
    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[cbName] = (data) => { cleanup(); resolve(data); };
    script.src = `${url}&callback=${cbName}`;
    script.onerror = () => { cleanup(); reject(new Error('JSONP error')); };
    document.head.appendChild(script);
  });
}

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

  // Map raw AdBlueMedia offer object → internal format
  const mapOffer = useCallback((offer) => {
    const rawPayout = parseFloat(offer.user_payout || offer.payout || '0.20');
    const coins     = Math.round(rawPayout * 1000);
    const text      = `${offer.name} ${offer.conversion} ${offer.anchor}`.toLowerCase();
    let category    = 'Survey';
    if (text.includes('game') || text.includes('play') || text.includes('level') || text.includes('slot'))
      category = 'Game';
    else if (text.includes('install') || text.includes('download') || text.includes('app') || text.includes('mobile'))
      category = 'App';
    return {
      id:          offer.id,
      title:       offer.name || 'AdBlueMedia Task',
      description: offer.conversion || 'Complete the task to earn your reward.',
      coins,
      payout:      rawPayout,
      provider:    'AdBlueMedia',
      icon:        offer.network_icon || null,
      category,
      url:         offer.url,
      anchor:      offer.anchor || 'Earn Coins',
    };
  }, []);

  // Fetch offers – call AdBlueMedia DIRECTLY from browser so real user IP is used
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const s1  = user ? user.id : 'guest';
        const url = `${ABM_FEED}?user_id=${ABM_USER_ID}&api_key=${ABM_API_KEY}&s1=${s1}&s2=`;
        const raw = await fetchJSONP(url);
        const mapped = (Array.isArray(raw) ? raw : []).map(mapOffer);
        setOffers(mapped);
        console.log(`[OFFERS] Loaded ${mapped.length} offers from AdBlueMedia`);
      } catch (err) {
        console.warn('[OFFERS] JSONP failed, trying server proxy:', err.message);
        // Fallback: server-side proxy (may have IP mismatch in dev)
        try {
          const res  = await fetch(`/api/offers?s1=${user ? user.id : 'guest'}`);
          const data = await res.json();
          setOffers((Array.isArray(data) ? data : []).map(mapOffer));
        } catch (e) {
          console.error('[OFFERS] Both methods failed:', e.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [user?.id, mapOffer]);

  // Check for completed leads every 15 seconds → auto-credit coins
  useEffect(() => {
    if (!user) return;
    const checkLeads = async () => {
      try {
        const url = `${ABM_CHECK}?testing=0`;
        const leads = await fetchJSONP(url);
        if (Array.isArray(leads) && leads.length > 0) {
          let totalCoins = 0;
          leads.forEach(lead => {
            const earned = Math.round((parseFloat(lead.points) / 100) * 1000);
            totalCoins += earned;
            console.log(`[LEAD] Offer #${lead.offer_id} → $${(parseFloat(lead.points)/100).toFixed(2)} → ${earned} coins`);
          });
          if (totalCoins > 0 && earnCoinsSimulated) {
            await earnCoinsSimulated({ id: `abm_leads_${Date.now()}`, title: 'AdBlueMedia Offer Completed', coins: totalCoins, payout: totalCoins / 1000 });
            setSuccessMessage(`🎉 Offer completed! You earned ${totalCoins.toLocaleString()} coins!`);
            setTimeout(() => setSuccessMessage(''), 6000);
          }
        }
      } catch (e) {
        // silent – lead check failures are non-critical
      }
    };
    const iv = setInterval(checkLeads, 15000);
    return () => clearInterval(iv);
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
    // Always open the real AdBlueMedia offer URL in a new tab
    window.open(offer.url, '_blank', 'noopener,noreferrer');
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
    { name: 'AdBlueMedia', desc: 'Highest paying surveys & mobile apps', badge: '1.5x Boost', logo: Globe, logoColor: 'text-primary bg-primary/10 border-primary/20', active: true },
    { name: 'CPALead', desc: 'Fast mobile app installs & fast completions', badge: 'Popular', logo: Target, logoColor: 'text-secondary bg-secondary/10 border-secondary/20', active: false },
    { name: 'Lootably', desc: 'Watch videos, play games and complete quizzes', badge: 'New', logo: Play, logoColor: 'text-primary bg-primary/10 border-primary/20', active: false },
    { name: 'CPX Research', desc: 'Best and highest qualifying global surveys', badge: 'Hot', logo: FileText, logoColor: 'text-secondary bg-secondary/10 border-secondary/20', active: false }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Page Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="icon-wrapper-primary p-2">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            Earn Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Claim your daily rewards, unlock partner walls, or complete direct tasks to earn coins.
          </p>
        </div>
        


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
            {!user ? (
              <button 
                onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
                className="btn-gaming rounded-xl px-5 py-2.5 text-xs font-extrabold"
              >
                Sign In to Claim
              </button>
            ) : canClaim ? (
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
                    <div className="icon-wrapper-secondary p-2 shadow-inner border-emerald-500/30 bg-emerald-500/5">
                      <Check className="h-5 w-5 text-emerald-400" />
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

      {/* 2. PARTNER WALLS GRID */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <div className="icon-wrapper-secondary p-1.5 border-none">
            <Gamepad2 className="h-4.5 w-4.5" />
          </div>
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
                  : 'border-dark-border bg-dark-card/60 opacity-80 hover:opacity-100 hover:border-zinc-800 active:scale-[0.98] transition-all'
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
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-3 transition-colors ${
                  wall.active 
                    ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_8px_rgba(56,189,248,0.1)] group-hover:border-primary/45 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.2)]' 
                    : 'bg-zinc-900 border-dark-border text-zinc-500'
                }`}>
                  {(() => {
                    const LogoIcon = wall.logo;
                    return <LogoIcon className="h-5.5 w-5.5" />;
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
            <div className="icon-wrapper-primary p-1.5 border-none">
              <Coins className="h-4.5 w-4.5" />
            </div>
            Direct Tasks
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-dark-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold active:scale-[0.95] hover:scale-[1.02] transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#38bdf8] text-black shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
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
          <div className="space-y-10 flex-1 flex flex-col">
            {/* Helper to render OS / Compatibility circular badges */}
            {(() => {
              const renderOSIndicator = (category) => (
                <div className="absolute top-1.5 right-1.5 rounded-full bg-black/80 p-1 border border-zinc-800/80 text-white flex items-center justify-center shadow-md">
                  {category === 'Survey' ? (
                    <FileText className="h-3 w-3 text-zinc-300" />
                  ) : category === 'App' ? (
                    <Smartphone className="h-3 w-3 text-zinc-300" />
                  ) : (
                    <Gamepad2 className="h-3 w-3 text-zinc-300" />
                  )}
                </div>
              );

              const renderOfferCard = (offer) => {
                const boostVal = offer.coins >= 3000 ? 80 : 50;
                const originalPayout = offer.payout / (1 + boostVal / 100);

                return (
                  <div
                    key={offer.id}
                    onClick={() => handleOfferClick(offer)}
                    className="flex flex-col w-[165px] shrink-0 bg-dark-card border border-dark-border/80 p-3 rounded-2xl hover:border-primary/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)] active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    {/* Card Image Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-950/60 border border-dark-border/40">
                      {offer.icon && offer.icon.startsWith('http') ? (
                        <img 
                          src={offer.icon} 
                          alt={offer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-650 bg-zinc-950">
                          {offer.category === 'Survey' ? (
                            <FileText className="h-10 w-10 text-primary/30" />
                          ) : (
                            <Gamepad2 className="h-10 w-10 text-secondary/30" />
                          )}
                        </div>
                      )}

                      {/* Boost Badge (Top Left) */}
                      <div className="absolute top-1.5 left-1.5 bg-[#38bdf8] text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-md">
                        +{boostVal}%
                      </div>

                      {/* OS Indicator (Top Right) */}
                      {renderOSIndicator(offer.category)}
                    </div>

                    {/* Text Details */}
                    <h4 className="text-xs font-extrabold text-white truncate group-hover:text-primary transition-colors text-left w-full mb-0.5">
                      {offer.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate text-left w-full mb-3 leading-normal">
                      {offer.description}
                    </p>

                    {/* Pricing Row */}
                    <div className="flex items-center gap-1.5 mt-auto text-left">
                      <span className="text-xs font-black text-primary font-sans">
                        ${offer.payout.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-600 line-through font-bold font-sans">
                        ${originalPayout.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              };

              const tasks = filteredOffers.filter(o => o.category === 'Game' || o.category === 'App');
              const surveys = filteredOffers.filter(o => o.category === 'Survey');

              return (
                <>
                  {/* Featured Tasks Row */}
                  {tasks.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-black text-white tracking-tight">Featured Tasks</h3>
                          <p className="text-[11px] text-zinc-500">Featured tasks are the best tasks to complete, with the highest rewards</p>
                        </div>
                        <button onClick={() => setSelectedCategory('All')} className="text-xs font-extrabold text-[#38bdf8] hover:underline active:scale-95 transition-all">View All</button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                        {tasks.map(offer => renderOfferCard(offer))}
                      </div>
                    </div>
                  )}

                  {/* Featured Surveys Row */}
                  {surveys.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-black text-white tracking-tight">Featured Surveys</h3>
                          <p className="text-[11px] text-zinc-500">Explore our handpicked selection of surveys just for you</p>
                        </div>
                        <button onClick={() => setSelectedCategory('Survey')} className="text-xs font-extrabold text-[#38bdf8] hover:underline active:scale-95 transition-all">View All</button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                        {surveys.map(offer => renderOfferCard(offer))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
                className="btn-gaming-secondary flex-1 rounded-xl py-3 text-xs font-extrabold"
              >
                Close Sandbox
              </button>
              <button
                onClick={handleSimulateCompletion}
                disabled={loadingOfferId !== null}
                className="btn-gaming flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold animate-pulse"
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
