'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { COINS_PER_PAYOUT_USD } from '@/lib/cashout';
import { needsPhone } from '@/lib/adblumedia';
import { Reveal } from '@/components/motion';
import { FileText, Smartphone, Gamepad2, Lock, Award, CheckCircle, Coins, Info, UserPlus, AlertCircle } from 'lucide-react';

const AndroidIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM19 5.5l-1.34-2.31c-.13-.24-.44-.32-.68-.19-.24.13-.32.44-.19.68L18.13 6H5.87l1.34-2.31c.13-.24.05-.55-.19-.68-.24-.13-.55-.05-.68.19L5 5.5C2.69 6.84 1.14 9.21 1 12h22c-.14-2.79-1.69-5.16-4-6.5zM9 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
);
const AppleIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.61.7-1.15 1.84-1.01 2.96 1.12.09 2.27-.58 2.96-1.4z"/></svg>
);

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

export default function DirectTasksSection() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [executingOffer, setExecutingOffer] = useState(null);
  useEffect(() => { if (executingOffer) sfx.play('open'); }, [executingOffer]);
  const [notice, setNotice] = useState('');
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

  const getOfferLockInfo = (offerId) => {
    const ts = lockedOffers[offerId];
    if (!ts) return null;
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - ts);
    if (remaining <= 0) return null;
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const s1  = user ? user.id : 'guest';

        // AdBluMedia (ready to show: the server already shaped each offer)
        const loadAdBluMedia = async () => {
          const res = await fetch(`/api/offers/adblumedia?s1=${encodeURIComponent(s1)}`);
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        };

        // OGAds (only shows anything while its key is set and valid)
        const loadOgAds = async () => {
          const res = await fetch(`/api/offers/ogads?s1=${s1}`);
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = await res.json();
          const rawOffers = Array.isArray(data) ? data : (data.offers || []);
          return rawOffers.map(offer => {
            const rawPayout = parseFloat(offer.payout || offer.user_payout || '0.20');
            const coins = Math.round(rawPayout * COINS_PER_PAYOUT_USD);
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
        };

        // One network being down must not hide the other
        const [adBlu, ogAds] = await Promise.allSettled([loadAdBluMedia(), loadOgAds()]);
        if (adBlu.status === 'rejected') console.error('[OFFERS] AdBluMedia unavailable:', adBlu.reason?.message);
        if (ogAds.status === 'rejected') console.error('[OFFERS] OGAds unavailable:', ogAds.reason?.message);

        const allOffers = [...(adBlu.value || []), ...(ogAds.value || [])].sort((a, b) => b.payout - a.payout);
        setOffers(allOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [user?.id]);

  const handleOfferClick = (offer) => {
    if (!user) {
      setNotice('Log in or register to start earning from tasks.');
      return;
    }
    if (getOfferLockInfo(offer.id)) {
      setNotice('This task is locked for now. Try another one, or come back tomorrow.');
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
      setNotice(`You opened this task ${MAX_CLICKS} times without finishing it, so it is locked for 24 hours.`);
      return;
    }

    setNotice('');
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

  const categories = ['All', 'Game', 'App', 'Survey', 'Sign-up'];
  const filteredOffers = selectedCategory === 'All' 
    ? offers 
    : offers.filter(o => o.category === selectedCategory);

  const TYPE_ICON = { Survey: FileText, Game: Gamepad2, App: Smartphone, 'Sign-up': UserPlus };

  return (
    <div id="direct-tasks" className="scroll-mt-24 flex-1 flex flex-col w-full">

      {notice && (
        <div role="status" className="bb-swap mb-6 flex items-start gap-3 rounded-xl border border-[rgba(243,199,107,0.4)] bg-[rgba(243,199,107,0.1)] p-4 text-[#f3c76b]">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold">{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-xs font-bold uppercase tracking-wide text-[#f3c76b]/80 hover:text-[#f3c76b]">Dismiss</button>
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="g-title text-2xl">Available tasks</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {loading ? 'Looking for tasks that fit your country…' : `${filteredOffers.length} task${filteredOffers.length === 1 ? '' : 's'} right now. The reward is shown on each card.`}
          </p>
        </div>

        <div role="tablist" aria-label="Task type" className="flex flex-wrap gap-1 rounded-xl border border-dark-border bg-[var(--bb-surface)] p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] rounded-lg px-4 text-sm font-bold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-[0_0_16px_rgba(120,84,247,0.55)]'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[190px] animate-pulse rounded-2xl border border-dark-border bg-[var(--bb-surface)] sm:h-[230px]" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="g-card py-16 text-center">
          <p className="font-bold text-white">No tasks in this category right now</p>
          <p className="mt-1 text-sm text-zinc-400">Offers change through the day. Try another type or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {filteredOffers.map((offer, idx) => {
            const lockInfo = getOfferLockInfo(offer.id);
            const isLocked = !!lockInfo;
            const clickCount = clickCounts[offer.id] || 0;
            const showWarning = !isLocked && clickCount >= 3;
            const clicksLeft = MAX_CLICKS - clickCount;
            const { isApple, isAndroid } = getOfferBadges(offer);
            const TypeIcon = TYPE_ICON[offer.category] || Smartphone;

            return (
              <Reveal key={offer.id} i={idx % 5} className="select-none">
                <button
                  type="button"
                  onClick={() => handleOfferClick(offer)}
                  aria-label={`${offer.title}, ${offer.coins.toLocaleString()} coins`}
                  className={`g-offer g-spot group relative flex h-[190px] w-full flex-col justify-end overflow-hidden rounded-2xl border text-left sm:h-[230px] ${
                    isLocked ? 'border-dark-border opacity-60' : showWarning ? 'border-[rgba(243,199,107,0.5)]' : 'border-dark-border'
                  }`}
                >
                  {offer.icon && offer.icon.startsWith('http') ? (
                    <img src={offer.icon} alt="" loading="lazy" className="g-offer-img absolute inset-0 z-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#26206a] to-[#0c1222]">
                      <TypeIcon className="h-10 w-10 text-[#c3b2ff] opacity-70" aria-hidden="true" />
                    </div>
                  )}

                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#070a14] via-[#070a14]/40 to-transparent" />

                  {isLocked && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#070a14]/85 p-3">
                      <span className="rounded-full border border-dark-border bg-dark-card p-2"><Lock className="h-4 w-4 text-zinc-400" aria-hidden="true" /></span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Locked 24h</span>
                      <span className="text-[11px] font-extrabold text-[#f3c76b]">{lockInfo}</span>
                    </div>
                  )}

                  {showWarning && !isLocked && (
                    <span className="absolute left-2.5 top-2.5 z-20 rounded bg-[#f3c76b] px-1.5 py-0.5 text-[10px] font-black text-[#1a1405]">{clicksLeft} left</span>
                  )}

                  <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1.5 rounded-md border border-white/10 bg-[#070a14]/80 px-2 py-1 text-zinc-200">
                    {isAndroid && <AndroidIcon />}
                    {isApple && <AppleIcon />}
                    <span className="h-3 w-px shrink-0 bg-white/15" />
                    <TypeIcon className="h-3 w-3" aria-hidden="true" />
                  </div>

                  <div className="relative z-20 p-3.5">
                    <h3 className="line-clamp-1 text-xs font-extrabold leading-snug text-white sm:text-sm">{offer.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-400">{offer.description}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(243,199,107,0.4)] bg-[rgba(243,199,107,0.12)] px-2.5 py-1 text-xs font-black text-[#f3c76b] sm:text-sm">
                      <Coins className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="tabular-nums">{offer.coins.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Offer details */}
      {executingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Task details">
          <div className="g-fade fixed inset-0 bg-[#04060c]/80 backdrop-blur-sm" onClick={() => setExecutingOffer(null)} />
          <div className="g-modal g-neon relative w-full max-w-lg overflow-hidden rounded-2xl p-6 shadow-2xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-white">
              <Award className="h-5 w-5 text-[#c3b2ff]" aria-hidden="true" />
              Start this task
            </h2>
            <p className="mb-4 flex justify-between border-b border-dark-border pb-3 text-sm text-zinc-400">
              <span>Reward: <strong className="text-[#f3c76b]">{executingOffer.coins.toLocaleString()} coins</strong></span>
            </p>

            <div className="mb-5 space-y-3">
              <div className="rounded-xl border border-dark-border bg-dark-bg p-4">
                <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Task</h4>
                <p className="text-sm font-semibold text-white">{executingOffer.title}</p>
              </div>
              <div className="rounded-xl border border-dark-border bg-dark-bg p-4">
                <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">What to do</h4>
                <p className="text-sm leading-relaxed text-zinc-300">{executingOffer.description}</p>
              </div>
              {needsPhone(executingOffer) && (
                <p className="flex items-start gap-2 rounded-xl border border-[rgba(243,199,107,0.4)] bg-[rgba(243,199,107,0.1)] p-3 text-xs leading-relaxed text-[#f3c76b]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  This task asks for your phone number and a PIN sent by SMS. Some of these start a paid subscription, so read the terms on the offer page before you confirm.
                </p>
              )}
              <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bb-success)]" aria-hidden="true" />
                Coins are added after the advertiser confirms you finished. This can take a few minutes up to a few days.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setExecutingOffer(null)} className="btn-gaming-secondary min-h-[48px] flex-1 rounded-xl py-3 text-xs">
                Cancel
              </button>
              <button onClick={handleSimulateCompletion} className="btn-gaming min-h-[48px] flex-1 rounded-xl py-3 text-xs">
                Open task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
