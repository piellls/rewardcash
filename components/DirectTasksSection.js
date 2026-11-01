'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { FileText, Smartphone, Gamepad2, Lock, Check, Loader2, AlertTriangle, Award, CheckCircle, Coins, Search, RotateCcw } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All', category: null },
  { value: 'games', label: 'Games', category: 'Game' },
  { value: 'apps', label: 'Apps', category: 'App' },
  { value: 'surveys', label: 'Surveys', category: 'Survey' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'reward', label: 'Highest reward' },
];

const ABM_USER_ID = '516060';
const ABM_API_KEY = '7c9eb5786d705edbd319f9cb81dabc5c';
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

const getOfferBadges = (offer) => {
  const title = (offer.title || '').toLowerCase();
  const desc = (offer.description || '').toLowerCase();
  const url = (offer.url || '').toLowerCase();
  const anchor = (offer.anchor || '').toLowerCase();
  
  let isApple = title.includes('iphone') || title.includes('ipad') || title.includes('ios') || title.includes('apple') || desc.includes('iphone') || desc.includes('ios') || url.includes('ios') || anchor.includes('ios');
  let isAndroid = title.includes('android') || desc.includes('android') || url.includes('android') || anchor.includes('android') || url.includes('google-play');
  
  if (!isApple && !isAndroid) {
    if (offer.category === 'Game' || offer.category === 'App') {
      isAndroid = true;
    } else {
      isAndroid = true;
      isApple = true;
    }
  }
  return { isApple, isAndroid };
};

const getOfferCompletedCount = (offerId) => {
  let hash = 0;
  const str = String(offerId);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 180) + 3;
};


export default function DirectTasksSection() {
  const { user, earnCoinsSimulated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedProviders, setFailedProviders] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [providerFilter, setProviderFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [query, setQuery] = useState('');
  const [executingOffer, setExecutingOffer] = useState(null);
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [clickCounts, setClickCounts] = useState({});
  const [lockedOffers, setLockedOffers] = useState({});

  const MAX_CLICKS = 5;

  // Restore filters from the URL once on mount, so a filtered view can be shared or reloaded.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const provider = params.get('provider');
    const sort = params.get('sort');
    const q = params.get('q');
    if (CATEGORY_OPTIONS.some((o) => o.value === category)) setSelectedCategory(category);
    if (provider) setProviderFilter(provider);
    if (SORT_OPTIONS.some((o) => o.value === sort)) setSortBy(sort);
    if (q) setQuery(q);
  }, []);

  const updateFilters = (patch) => {
    const next = {
      category: selectedCategory,
      provider: providerFilter,
      sort: sortBy,
      q: query,
      ...patch,
    };
    const params = new URLSearchParams();
    if (next.category !== 'all') params.set('category', next.category);
    if (next.provider !== 'All') params.set('provider', next.provider);
    if (next.sort !== 'recommended') params.set('sort', next.sort);
    if (next.q.trim()) params.set('q', next.q.trim());
    const search = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
    if ('category' in patch) setSelectedCategory(patch.category);
    if ('provider' in patch) setProviderFilter(patch.provider);
    if ('sort' in patch) setSortBy(patch.sort);
    if ('q' in patch) setQuery(patch.q);
  };

  const resetFilters = () => updateFilters({ category: 'all', provider: 'All', sort: 'recommended', q: '' });

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
    const coins     = Math.round(rawPayout * 300);
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
      setFailedProviders([]);
      const failed = [];
      try {
        const s1  = user ? user.id : 'guest';
        let abmOffers = [];
        let ogAdsOffers = [];

        // 1. Fetch AdBlueMedia via fast server proxy first
        try {
          const res  = await fetch(`/api/offers?s1=${s1}`);
          if (!res.ok) throw new Error(`proxy status ${res.status}`);
          const data = await res.json();
          abmOffers = (Array.isArray(data) ? data : []).map(mapOffer);
        } catch (err) {
          console.warn('[OFFERS] Server proxy failed, trying JSONP fallback:', err.message);
          try {
            const url = `${ABM_FEED}?user_id=${ABM_USER_ID}&api_key=${ABM_API_KEY}&s1=${s1}&s2=`;
            const raw = await fetchJSONP(url);
            abmOffers = (Array.isArray(raw) ? raw : []).map(mapOffer);
          } catch (e) {
            console.error('[OFFERS] AdBlueMedia both methods failed:', e.message);
            failed.push('AdBlueMedia');
          }
        }

        // 2. Fetch OGAds
        try {
          const res = await fetch(`/api/offers/ogads?s1=${s1}`);
          if (!res.ok) throw new Error(`ogads status ${res.status}`);
          const data = await res.json();
          const rawOffers = Array.isArray(data) ? data : (data.offers || []);
          ogAdsOffers = rawOffers.map(offer => {
            const rawPayout = parseFloat(offer.payout || offer.user_payout || '0.20');
            const coins = Math.round(rawPayout * 300);
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
        } catch (err) {
          console.error('[OFFERS] Failed to load OGAds:', err.message);
          failed.push('OGAds');
        }

        const allOffers = [...abmOffers, ...ogAdsOffers].sort((a, b) => {
          if (a.provider === 'AdBlueMedia' && b.provider !== 'AdBlueMedia') return -1;
          if (a.provider !== 'AdBlueMedia' && b.provider === 'AdBlueMedia') return 1;
          return b.payout - a.payout;
        });
        setOffers(allOffers);
        setFailedProviders(failed);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setFailedProviders(['AdBlueMedia', 'OGAds']);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [user?.id, mapOffer, reloadKey]);

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

  const handleStartOffer = () => {
    if (!user || !executingOffer) return;

    // Open the provider's tracking link in a new tab. Credit is added server-side
    // by the postback once the provider confirms completion, never on this click.
    if (executingOffer.url) {
      window.open(executingOffer.url, '_blank', 'noopener,noreferrer');
    }

    setExecutingOffer(null);
  };

  useEffect(() => {
    if (!executingOffer) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setExecutingOffer(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [executingOffer]);

  const providerOptions = useMemo(
    () => ['All', ...new Set(offers.map((o) => o.provider))],
    [offers]
  );

  const visibleOffers = useMemo(() => {
    const categoryFilter = CATEGORY_OPTIONS.find((o) => o.value === selectedCategory)?.category;
    const term = query.trim().toLowerCase();
    const list = offers.filter((o) =>
      (!categoryFilter || o.category === categoryFilter) &&
      (providerFilter === 'All' || o.provider === providerFilter) &&
      (!term || o.title.toLowerCase().includes(term))
    );
    if (sortBy === 'reward') {
      return [...list].sort((a, b) => b.payout - a.payout);
    }
    return list;
  }, [offers, selectedCategory, providerFilter, sortBy, query]);

  const hasActiveFilters =
    selectedCategory !== 'all' || providerFilter !== 'All' || sortBy !== 'recommended' || query.trim() !== '';

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
        <div role="group" aria-label="Filter by offer type" className="flex flex-wrap gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={selectedCategory === option.value}
              onClick={() => updateFilters({ category: option.value })}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold active:scale-[0.95] hover:scale-[1.02] transition-all ${
                selectedCategory === option.value
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(93,95,239,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search, provider, sort and result count */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search offers</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => updateFilters({ q: e.target.value })}
            placeholder="Search offers"
            className="w-full rounded-xl bg-dark-bg border border-dark-border pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/60"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
            <span>Provider</span>
            <select
              value={providerFilter}
              onChange={(e) => updateFilters({ provider: e.target.value })}
              className="rounded-lg bg-dark-bg border border-dark-border px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/60"
            >
              {providerOptions.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All providers' : p}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
            <span>Sort</span>
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="rounded-lg bg-dark-bg border border-dark-border px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/60"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-lg border border-dark-border px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:border-primary/50"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {!loading && failedProviders.length > 0 && failedProviders.length < 2 && (
        <div role="status" className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {failedProviders[0]} offers are unavailable right now. Showing the other providers.
        </div>
      )}

      {loading ? (
        <div aria-busy="true" aria-label="Loading offers" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-[180px] sm:h-[220px] rounded-2xl bg-dark-card border border-dark-border/60 animate-pulse" />
              <div className="mt-2 h-3 w-16 rounded bg-dark-card animate-pulse" />
            </div>
          ))}
        </div>
      ) : failedProviders.length === 2 ? (
        <div role="alert" className="text-center py-16 rounded-2xl border border-dark-border border-dashed flex flex-col items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          <p className="text-sm font-bold text-white">Offers couldn&apos;t load.</p>
          <p className="text-xs text-zinc-500">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs font-extrabold"
          >
            Retry
          </button>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dark-border border-dashed text-zinc-500 text-sm">
          No offers are available for your region right now. Check back later.
        </div>
      ) : visibleOffers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dark-border border-dashed flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-white">No offers match these filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs font-extrabold"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-10 flex-1 flex flex-col">
          <p className="text-[11px] font-bold text-zinc-500 -mt-2">
            Showing {visibleOffers.length} of {offers.length} offers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {visibleOffers.map((offer) => {
              const lockInfo = getOfferLockInfo(offer.id);
              const isLocked = !!lockInfo;
              const clickCount = clickCounts[offer.id] || 0;
              const showWarning = !isLocked && clickCount >= 3;
              const clicksLeft = MAX_CLICKS - clickCount;
              const creditsAward = offer.coins;

              const completedCount = getOfferCompletedCount(offer.id);
              const dotColor = completedCount >= 100 ? '#10b981' : '#eab308';
              const { isApple, isAndroid } = getOfferBadges(offer);

              return (
                <div key={offer.id} className="flex flex-col select-none">
                  {/* Elevated 3D Card Container */}
                  <div
                    role="button"
                    tabIndex={isLocked ? -1 : 0}
                    aria-disabled={isLocked || undefined}
                    aria-label={`${offer.title}, ${offer.coins.toLocaleString()} coins`}
                    onClick={() => handleOfferClick(offer)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOfferClick(offer);
                      }
                    }}
                    className={`relative w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden cursor-pointer shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:scale-[1.03] transition-all duration-300 border flex flex-col justify-end group ${
                      isLocked
                        ? 'border-zinc-800 opacity-60 cursor-not-allowed'
                        : showWarning
                        ? 'border-amber-500/40 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'border-dark-border/80 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    }`}
                  >
                    {/* Background Banner Image */}
                    {offer.icon && offer.icon.startsWith('http') ? (
                      <img 
                        src={offer.icon} 
                        alt={offer.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-all duration-500 z-0"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] to-[#0a0a0f] flex items-center justify-center z-0">
                        {offer.category === 'Survey' ? (
                          <FileText className="h-10 w-10 text-primary opacity-60" />
                        ) : (
                          <Gamepad2 className="h-10 w-10 text-secondary opacity-60" />
                        )}
                      </div>
                    )}

                    {/* Dark gradient overlay at bottom of banner */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-black/35 to-transparent z-10" />

                    {/* Locked 24H overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-[2px] rounded-2xl gap-1.5 p-3">
                        <div className="rounded-full bg-zinc-800 border border-zinc-750 p-2">
                          <Lock className="h-4.5 w-4.5 text-zinc-400" />
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Locked 24H</span>
                        <span className="text-[10px] font-black text-amber-400">{lockInfo}</span>
                      </div>
                    )}

                    {/* Warning clicks left label */}
                    {showWarning && !isLocked && (
                      <div className="absolute top-2.5 left-2.5 z-20 bg-amber-500 text-black text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg">
                        {clicksLeft} left
                      </div>
                    )}

                    {/* OS & Category Pill Badges (Top Right) */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-[#0a0b10]/80 border border-white/10 px-2 py-1 rounded-md backdrop-blur-sm shadow-md">
                      {isAndroid && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-200">
                          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM19 5.5l-1.34-2.31c-.13-.24-.44-.32-.68-.19-.24.13-.32.44-.19.68L18.13 6H5.87l1.34-2.31c.13-.24.05-.55-.19-.68-.24-.13-.55-.05-.68.19L5 5.5C2.69 6.84 1.14 9.21 1 12h22c-.14-2.79-1.69-5.16-4-6.5zM9 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                      )}
                      {isApple && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-200">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.61.7-1.15 1.84-1.01 2.96 1.12.09 2.27-.58 2.96-1.4z"/>
                        </svg>
                      )}
                      <span className="w-[1px] h-3 bg-white/10 shrink-0" />
                      {offer.category === 'Survey' ? (
                        <FileText className="h-3 w-3 text-zinc-200" />
                      ) : offer.category === 'Game' ? (
                        <Gamepad2 className="h-3 w-3 text-zinc-200" />
                      ) : (
                        <Smartphone className="h-3 w-3 text-zinc-200" />
                      )}
                    </div>

                    {/* Title & Payout Overlay inside the card bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 z-20 flex flex-col justify-end text-left">
                      <h4 className="text-[11px] sm:text-xs font-black text-white line-clamp-1 leading-snug drop-shadow-md mb-0.5 group-hover:text-primary transition-colors">
                        {offer.title}
                      </h4>
                      <div className="text-xs sm:text-sm font-black text-[#bf5aff] flex items-center gap-1.5 drop-shadow-lg leading-none mt-1">
                        <Coins className="h-3.5 w-3.5 shrink-0" />
                        <span>{offer.coins.toLocaleString()}</span>
                      </div>
                    </div>

                  </div>

                  {/* Dot & Completions text below the card */}
                  <div className="flex items-center gap-1.5 mt-2 px-1 text-[10px] sm:text-[11px] font-bold text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                    <span>{completedCount} completed</span>
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
          <div role="dialog" aria-modal="true" aria-labelledby="offer-dialog-title" className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

            <h2 id="offer-dialog-title" className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Award className="h-5.5 w-5.5 text-primary" />
              Start offer
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

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                The provider opens in a new tab. Your credits are added only after the provider confirms the completed offer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setExecutingOffer(null)}
                className="btn-gaming-secondary flex-1 rounded-xl py-3 text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartOffer}
                className="btn-gaming flex-1 rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                Start offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
