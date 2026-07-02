'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Coins, Flame, Award, Gamepad2, Play, Sparkles, CheckCircle, Loader2, Lock, Check, TrendingUp, Globe, Target, FileText, Smartphone, AlertTriangle } from 'lucide-react';

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

  // Smart Offer Protection State
  // clickCounts: { offerId: number }  — how many times clicked without completing
  // lockedOffers: { offerId: lockedAtTimestamp } — locked after 5 clicks OR after completion
  const [clickCounts, setClickCounts] = useState({});
  const [lockedOffers, setLockedOffers] = useState({});

  const MAX_CLICKS = 5; // lock after 5 clicks without completion

  // Load saved state from localStorage on mount/user change
  useEffect(() => {
    if (!user) return;
    const countKey = `rc_offer_clicks_${user.id}`;
    const lockKey  = `rc_locked_offers_${user.id}`;

    // Load click counts
    try {
      const stored = localStorage.getItem(countKey);
      if (stored) setClickCounts(JSON.parse(stored));
    } catch {}

    // Load locks + clean expired ones
    try {
      const stored = localStorage.getItem(lockKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const cleaned = {};
        Object.entries(parsed).forEach(([id, ts]) => {
          if (now - ts < 24 * 60 * 60 * 1000) cleaned[id] = ts;
        });
        setLockedOffers(cleaned);
        localStorage.setItem(lockKey, JSON.stringify(cleaned));
      }
    } catch {}
  }, [user?.id]);

  // Save click counts to localStorage
  const saveClickCounts = (updated) => {
    if (!user) return;
    localStorage.setItem(`rc_offer_clicks_${user.id}`, JSON.stringify(updated));
  };

  // Hard-lock an offer for 24H (called on 5th click or real completion)
  const lockOffer = (offerId) => {
    if (!user) return;
    const key = `rc_locked_offers_${user.id}`;
    const now = Date.now();
    const updated = { ...lockedOffers, [offerId]: now };
    setLockedOffers(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // Unlock an offer's click count (called after completion so counter resets)
  const resetClickCount = (offerId) => {
    const updated = { ...clickCounts };
    delete updated[offerId];
    setClickCounts(updated);
    saveClickCounts(updated);
  };

  // Returns remaining lock time string, or null if not locked
  const getOfferLockInfo = (offerId) => {
    const ts = lockedOffers[offerId];
    if (!ts) return null;
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - ts);
    if (remaining <= 0) return null;
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  // Returns how many clicks remain before lock, or null if not counting
  const getClicksLeft = (offerId) => {
    if (getOfferLockInfo(offerId)) return null; // already locked
    const count = clickCounts[offerId] || 0;
    const left = MAX_CLICKS - count;
    return left > 0 ? left : 0;
  };

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

  // Fetch offers – fetch AdBlueMedia & OGAds concurrently and merge
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const s1  = user ? user.id : 'guest';
        
        let abmOffers = [];
        let ogAdsOffers = [];

        // 1. Fetch AdBlueMedia
        try {
          const url = `${ABM_FEED}?user_id=${ABM_USER_ID}&api_key=${ABM_API_KEY}&s1=${s1}&s2=`;
          const raw = await fetchJSONP(url);
          abmOffers = (Array.isArray(raw) ? raw : []).map(mapOffer);
        } catch (err) {
          console.warn('[OFFERS] AdBlueMedia JSONP failed, trying server proxy:', err.message);
          try {
            const res  = await fetch(`/api/offers?s1=${s1}`);
            const data = await res.json();
            abmOffers = (Array.isArray(data) ? data : []).map(mapOffer);
          } catch (e) {
            console.error('[OFFERS] AdBlueMedia both methods failed:', e.message);
          }
        }

        // 2. Fetch OGAds
        try {
          const res = await fetch(`/api/offers/ogads?s1=${s1}`);
          if (res.ok) {
            const data = await res.json();
            const rawOffers = Array.isArray(data) ? data : (data.offers || []);
            
            ogAdsOffers = rawOffers.map(offer => {
              const rawPayout = parseFloat(offer.payout || offer.user_payout || '0.20');
              const coins = Math.round(rawPayout * 1000);
              const text = `${offer.name} ${offer.description || ''} ${offer.adcopy || ''}`.toLowerCase();
              
              let category = 'App';
              if (text.includes('game') || text.includes('play') || text.includes('level') || text.includes('slot') || text.includes('casino')) {
                category = 'Game';
              } else if (text.includes('survey') || text.includes('quiz') || text.includes('opinion') || text.includes('submit')) {
                category = 'Survey';
              }
              
              return {
                id: offer.offerid || offer.id || `og_${Math.random()}`,
                title: offer.name_short || offer.name || 'OGAds Task',
                description: offer.description || offer.adcopy || 'Complete the task steps to earn your reward.',
                coins,
                payout: rawPayout,
                provider: 'OGAds',
                icon: offer.picture || null,
                category,
                url: offer.link || offer.url,
                anchor: offer.anchor || 'Install Now',
              };
            });
            console.log(`[OFFERS] Loaded ${ogAdsOffers.length} offers from OGAds`);
          }
        } catch (err) {
          console.error('[OFFERS] Failed to load OGAds:', err.message);
        }

        // Combine and shuffle/sort based on payout
        const allOffers = [...abmOffers, ...ogAdsOffers].sort((a, b) => b.payout - a.payout);
        setOffers(allOffers);

      } catch (err) {
        console.error("Critical error in fetchOffers:", err);
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
            // Lock each completed offer for 24H + reset click counter
            const offerId = String(lead.offer_id);
            lockOffer(offerId);
            resetClickCount(offerId);
            console.log(`[LEAD] Offer #${offerId} → $${(parseFloat(lead.points)/100).toFixed(2)} → ${earned} coins — locked 24H`);
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

    // If hard-locked, block the click
    const lockInfo = getOfferLockInfo(offer.id);
    if (lockInfo) return;

    // Increment click count
    const currentCount = clickCounts[offer.id] || 0;
    const newCount = currentCount + 1;
    const updated = { ...clickCounts, [offer.id]: newCount };
    setClickCounts(updated);
    saveClickCounts(updated);

    // If 5th click without completion → lock for 24H
    if (newCount >= MAX_CLICKS) {
      lockOffer(offer.id);
    }

    // Always open the real offer URL
    window.open(offer.url, '_blank', 'noopener,noreferrer');
  };

  const handleSimulateCompletion = async () => {
    if (!user || !executingOffer) return;
    
    setLoadingOfferId(executingOffer.id);
    try {
      await earnCoinsSimulated(executingOffer);
      // Lock offer 24H after real completion + reset click counter
      lockOffer(executingOffer.id);
      resetClickCount(executingOffer.id);
      setSuccessMessage(`✅ Offer completed! You earned ${executingOffer.coins} coins. This offer is now locked for 24H.`);
      setExecutingOffer(null);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      alert(err.message || 'Failed to complete offer');
    } finally {
      setLoadingOfferId(null);
    }
  };

  const partnerWalls = [
    { name: 'AdBlueMedia', desc: 'Highest paying surveys', badge: 'Daily Tasks', banner: '/banners/lootably.png', active: true },
    { name: 'OGAds', desc: 'Premium app installs', badge: 'Bonus Offers', banner: '/banners/ogads.png', active: false },
    { name: 'Lootably', desc: 'Watch videos & play', badge: 'Big Rewards', banner: '/banners/adbluemedia.png', active: false },
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

      {/* 2. PARTNER WALLS GRID (BANNERS) */}
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
                  alert(`${wall.name} is currently in sandbox mode. Please complete the live offers in the list below.`);
                }
              }}
              className={`rounded-2xl border transition-all cursor-pointer relative overflow-hidden group w-full h-36 flex flex-col justify-center ${
                wall.active 
                  ? 'border-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,231,1,0.2)] hover:-translate-y-1'
                  : 'border-dark-border opacity-70 hover:opacity-100 hover:border-zinc-700 hover:-translate-y-1'
              }`}
            >
              {/* Banner Image */}
              <img 
                src={wall.banner} 
                alt={wall.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Dark Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              


              {/* Status Badge (Sandbox/Open) */}
              {wall.active && (
                <div className="absolute top-3 left-3 shadow-lg">
                  <div className="px-2 py-1 rounded-md backdrop-blur-md border bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(0,231,1,0.2)]">
                    <span className="text-[9px] font-black uppercase flex items-center gap-1">
                      <Play className="h-2.5 w-2.5 fill-primary" />
                      OPEN
                    </span>
                  </div>
                </div>
              )}

              {/* Promo Badge */}
              {wall.badge && (
                <div className="absolute top-3 right-3 shadow-lg">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                    wall.active 
                      ? 'bg-black/70 text-white border-primary/50 backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.5)]' 
                      : 'bg-black/70 text-zinc-400 border-dark-border backdrop-blur-md'
                  }`}>
                    {wall.badge}
                  </span>
                </div>
              )}
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
          <div className="flex flex-wrap gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold active:scale-[0.95] hover:scale-[1.02] transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,231,1,0.35)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-dark-card'
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
                const lockInfo = getOfferLockInfo(offer.id);
                const isLocked = !!lockInfo;
                const clickCount = clickCounts[offer.id] || 0;
                // Show warning when 3+ clicks used (2 or fewer remaining)
                const showWarning = !isLocked && clickCount >= 3;
                const clicksLeft = MAX_CLICKS - clickCount;

                return (
                  <div
                    key={offer.id}
                    onClick={() => handleOfferClick(offer)}
                    className={`flex flex-col w-[165px] shrink-0 bg-dark-card border p-3 rounded-2xl transition-all relative overflow-hidden ${
                      isLocked
                        ? 'border-zinc-700/50 opacity-60 cursor-not-allowed'
                        : showWarning
                        ? 'border-amber-500/40 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-[0.98] cursor-pointer group'
                        : 'border-dark-border/80 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(0,231,1,0.15)] active:scale-[0.98] cursor-pointer group'
                    }`}
                  >
                    {/* 24H Lock Overlay — shown after 5 clicks */}
                    {isLocked && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] rounded-2xl gap-1.5">
                        <div className="rounded-full bg-zinc-800 border border-zinc-700 p-2">
                          <Lock className="h-5 w-5 text-zinc-400" />
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Locked 24H</span>
                        <span className="text-[10px] font-black text-amber-400">{lockInfo}</span>
                      </div>
                    )}

                    {/* Warning badge — shown when 3-4 clicks used */}
                    {showWarning && !isLocked && (
                      <div className="absolute top-2 right-2 z-10 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg">
                        {clicksLeft} left
                      </div>
                    )}

                    {/* Card Image Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-dark-bg/60 border border-dark-border/40">
                      {offer.icon && offer.icon.startsWith('http') ? (
                        <img 
                          src={offer.icon} 
                          alt={offer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-650 bg-dark-bg">
                          {offer.category === 'Survey' ? (
                            <FileText className="h-10 w-10 text-primary/30" />
                          ) : (
                            <Gamepad2 className="h-10 w-10 text-secondary/30" />
                          )}
                        </div>
                      )}

                      {/* Boost Badge (Top Left) */}
                      <div className="absolute top-1.5 left-1.5 bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-md">
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
                    <div className="w-full max-w-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-black text-white tracking-tight">Featured Tasks</h3>
                          <p className="text-[11px] text-zinc-500">Featured tasks are the best tasks to complete, with the highest rewards</p>
                        </div>
                        <button onClick={() => setSelectedCategory('All')} className="text-xs font-extrabold text-primary hover:underline active:scale-95 transition-all">View All</button>
                      </div>
                      <div
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
                        style={{ contain: 'paint', WebkitOverflowScrolling: 'touch' }}
                      >
                        {tasks.map(offer => renderOfferCard(offer))}
                      </div>
                    </div>
                  )}

                  {/* Featured Surveys Row */}
                  {surveys.length > 0 && (
                    <div className="w-full max-w-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-black text-white tracking-tight">Featured Surveys</h3>
                          <p className="text-[11px] text-zinc-500">Explore our handpicked selection of surveys just for you</p>
                        </div>
                        <button onClick={() => setSelectedCategory('Survey')} className="text-xs font-extrabold text-primary hover:underline active:scale-95 transition-all">View All</button>
                      </div>
                      <div
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
                        style={{ contain: 'paint', WebkitOverflowScrolling: 'touch' }}
                      >
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
              <div className="rounded-xl bg-dark-bg p-4 border border-dark-border/60">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Offer Title</h4>
                <p className="text-sm font-semibold text-white">{executingOffer.title}</p>
              </div>

              <div className="rounded-xl bg-dark-bg p-4 border border-dark-border/60">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Requirements</h4>
                <p className="text-xs text-zinc-350 leading-relaxed">{executingOffer.description}</p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-dark-bg/60 border border-dark-border/60 p-3.5 text-xs text-zinc-400">
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
