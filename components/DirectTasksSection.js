'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { FileText, Smartphone, Gamepad2, Lock, Check, Loader2, AlertTriangle, Award, CheckCircle } from 'lucide-react';

const ABM_USER_ID = '199180';
const ABM_API_KEY = '784b49bd7b4108039d10fac0f90cc372';
const ABM_FEED    = `https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php`;

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

const simplifyDescription = (title, desc, category) => {
  const text = `${title} ${desc}`.toLowerCase();
  
  if (text.includes('survey') || text.includes('quiz') || text.includes('opinion')) {
    return 'Complete Survey';
  }
  if (text.includes('free trial') || text.includes('trial')) {
    return 'Sign Up (Free Trial)';
  }
  if (text.includes('register') || text.includes('sign up') || text.includes('signup') || text.includes('create account') || text.includes('create free account')) {
    return 'Register (New Users)';
  }
  if (text.includes('install') && (text.includes('run') || text.includes('open'))) {
    return 'Install & Run';
  }
  if (text.includes('install') || text.includes('download')) {
    if (text.includes('run') || text.includes('open')) {
      return 'Install & Run';
    }
    return 'Install & Open';
  }
  if (text.includes('level') || text.includes('reach level') || text.includes('complete level')) {
    const match = text.match(/level\s*(\d+)/);
    if (match) {
      return `Reach Level ${match[1]}`;
    }
    return 'Reach Required Level';
  }
  if (text.includes('purchase') || text.includes('buy') || text.includes('deposit') || text.includes('subscribe')) {
    return 'Deposit / Purchase';
  }
  
  if (desc && desc.length > 2 && desc.length <= 30) {
    return desc.charAt(0).toUpperCase() + desc.slice(1);
  }
  
  if (category === 'App') return 'Install & Run';
  if (category === 'Game') return 'Play & Earn';
  if (category === 'Survey') return 'Answer Questions';
  
  return 'Complete Task';
};

export default function DirectTasksSection() {
  const { user, earnCoinsSimulated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [executingOffer, setExecutingOffer] = useState(null);
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [clickCounts, setClickCounts] = useState({});
  const [lockedOffers, setLockedOffers] = useState({});

  const MAX_CLICKS = 5;

  // Load state
  useEffect(() => {
    if (!user) return;
    const countKey = `rc_offer_clicks_${user.id}`;
    const lockKey  = `rc_locked_offers_${user.id}`;

    try {
      const stored = localStorage.getItem(countKey);
      if (stored) setClickCounts(JSON.parse(stored));
    } catch {}

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

  const saveClickCounts = (updated) => {
    if (!user) return;
    localStorage.setItem(`rc_offer_clicks_${user.id}`, JSON.stringify(updated));
  };

  const lockOffer = (offerId) => {
    if (!user) return;
    const key = `rc_locked_offers_${user.id}`;
    const now = Date.now();
    const updated = { ...lockedOffers, [offerId]: now };
    setLockedOffers(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const resetClickCount = (offerId) => {
    const updated = { ...clickCounts };
    delete updated[offerId];
    setClickCounts(updated);
    saveClickCounts(updated);
  };

  const getOfferLockInfo = (offerId) => {
    const ts = lockedOffers[offerId];
    if (!ts) return null;
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - ts);
    if (remaining <= 0) return null;
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const mapOffer = useCallback((offer) => {
    const rawPayout = parseFloat(offer.user_payout || offer.payout || '0.20');
    const coins     = Math.round(rawPayout * 150 * 3);
    const text      = `${offer.name} ${offer.conversion} ${offer.anchor}`.toLowerCase();
    let category    = 'Survey';
    if (text.includes('game') || text.includes('play') || text.includes('level') || text.includes('slot'))
      category = 'Game';
    else if (text.includes('install') || text.includes('download') || text.includes('app') || text.includes('mobile'))
      category = 'App';
    return {
      id:          offer.id,
      title:       offer.name || 'AdBlueMedia Task',
      description: simplifyDescription(offer.name || '', offer.conversion || '', category),
      coins,
      payout:      rawPayout,
      provider:    'AdBlueMedia',
      icon:        offer.network_icon || null,
      category,
      url:         offer.url,
      anchor:      offer.anchor || 'Earn Coins',
    };
  }, []);

  // Fetch offers
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
              const coins = Math.round(rawPayout * 150 * 3);
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
                description: simplifyDescription(offer.name || '', offer.description || offer.adcopy || '', category),
                coins,
                payout: rawPayout,
                provider: 'OGAds',
                icon: offer.picture || null,
                category,
                url: offer.link || offer.url,
                anchor: offer.anchor || 'Install Now',
              };
            });
          }
        } catch (err) {
          console.error('[OFFERS] Failed to load OGAds:', err.message);
        }

        const allOffers = [...abmOffers, ...ogAdsOffers].sort((a, b) => b.payout - a.payout);
        setOffers(allOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [user?.id, mapOffer]);

  const handleOfferClick = (offer) => {
    if (!user) {
      alert('You must be logged in to complete offers!');
      return;
    }
    if (getOfferLockInfo(offer.id)) {
      alert('This offer is locked! Please check back tomorrow.');
      return;
    }

    // Log the click event to DB for admin auditing
    db.logOfferClick(user.id, user.username, offer);

    const currentCount = clickCounts[offer.id] || 0;
    const nextCount = currentCount + 1;
    const updated = { ...clickCounts, [offer.id]: nextCount };
    setClickCounts(updated);
    saveClickCounts(updated);

    if (nextCount >= MAX_CLICKS) {
      lockOffer(offer.id);
      alert(`⚠️ You clicked this offer ${MAX_CLICKS} times without completing it. It has been locked for 24H for system protection.`);
      return;
    }

    setExecutingOffer(offer);
  };

  const handleSimulateCompletion = () => {
    if (!user || !executingOffer) return;
    
    // Redirect user to the offer URL in a new tab
    if (executingOffer.url) {
      window.open(executingOffer.url, '_blank');
    }

    // Close the details modal
    setExecutingOffer(null);
  };

  const categories = ['All', 'Game', 'App', 'Survey'];
  const filteredOffers = selectedCategory === 'All' 
    ? offers 
    : offers.filter(o => o.category === selectedCategory);

  return (
    <div id="direct-tasks" className="scroll-mt-6 flex-1 flex flex-col w-full">
      
      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-dark-border pb-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <span>⚡ Available Tasks</span>
        </h2>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold active:scale-[0.95] hover:scale-[1.02] transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(93,95,239,0.35)]' 
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredOffers.map((offer) => {
              const lockInfo = getOfferLockInfo(offer.id);
              const isLocked = !!lockInfo;
              const clickCount = clickCounts[offer.id] || 0;
              const showWarning = !isLocked && clickCount >= 3;
              const clicksLeft = MAX_CLICKS - clickCount;
              const creditsAward = offer.coins;

              return (
                <div
                  key={offer.id}
                  onClick={() => handleOfferClick(offer)}
                  className={`flex flex-col bg-dark-card border p-4 sm:p-5 rounded-2xl transition-all relative overflow-hidden text-center justify-between min-h-[195px] sm:min-h-[220px] ${
                    isLocked
                      ? 'border-zinc-700/50 opacity-60 cursor-not-allowed'
                      : showWarning
                      ? 'border-amber-500/40 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-[0.98] cursor-pointer group'
                      : 'border-dark-border/80 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(93,95,239,0.2)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer group'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px] rounded-2xl gap-1.5 p-3">
                      <div className="rounded-full bg-zinc-800 border border-zinc-700 p-2">
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-wider">Locked 24H</span>
                      <span className="text-[10px] sm:text-xs font-black text-amber-400">{lockInfo}</span>
                    </div>
                  )}

                  {showWarning && !isLocked && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-amber-500 text-black text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg">
                      {clicksLeft} left
                    </div>
                  )}

                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/5 p-1 border border-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    {offer.icon && offer.icon.startsWith('http') ? (
                      <img 
                        src={offer.icon} 
                        alt={offer.title}
                        className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-dark-bg/85 rounded-xl sm:rounded-2xl">
                        {offer.category === 'Survey' ? (
                          <FileText className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
                        ) : (
                          <Gamepad2 className="h-7 w-7 sm:h-10 sm:w-10 text-secondary" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-start mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
                      {offer.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="w-full py-1.5 sm:py-2.5 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_12px_rgba(93,95,239,0.06)]">
                      {creditsAward.toLocaleString()} Coins
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Offer Execution Modal */}
      {executingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setExecutingOffer(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Award className="h-5.5 w-5.5 text-primary" />
              Complete Offer
            </h2>
            <p className="text-[11px] text-zinc-400 border-b border-dark-border/60 pb-3 mb-4 flex justify-between">
              <span>Reward: <strong className="text-primary">{executingOffer.coins.toLocaleString()} Coins</strong></span>
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
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExecutingOffer(null)}
                className="btn-gaming-secondary flex-1 rounded-xl py-3 text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateCompletion}
                className="btn-gaming flex-1 rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                Complete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
