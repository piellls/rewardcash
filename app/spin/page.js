'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Gift, Zap, Sparkles, AlertCircle, Coins, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const SPIN_PRIZES = [
  { coins: 10, label: '$0.01', rarity: 'common', border: 'border-[#3f3f46]', bg: 'rgba(63,63,70,0.1)', glow: 'shadow-[0_0_15px_rgba(63,63,70,0.15)]', color: '#a1a1aa' },
  { coins: 50, label: '$0.05', rarity: 'common', border: 'border-[#3f3f46]', bg: 'rgba(63,63,70,0.1)', glow: 'shadow-[0_0_15px_rgba(63,63,70,0.15)]', color: '#a1a1aa' },
  { coins: 250, label: '$0.25', rarity: 'uncommon', border: 'border-[#10b981]', bg: 'rgba(16,185,129,0.1)', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]', color: '#10b981' },
  { coins: 1000, label: '$1.00', rarity: 'rare', border: 'border-[#3b82f6]', bg: 'rgba(59,130,246,0.1)', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]', color: '#3b82f6' },
  { coins: 2500, label: '$2.50', rarity: 'epic', border: 'border-[#a855f7]', bg: 'rgba(168,85,247,0.1)', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]', color: '#a855f7' },
  { coins: 10000, label: '$10.00', rarity: 'legendary', border: 'border-[#eab308]', bg: 'rgba(234,179,8,0.1)', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]', color: '#eab308' },
  { coins: 250000, label: '$250.00', rarity: 'mythic', border: 'border-[#ef4444]', bg: 'rgba(239,68,68,0.1)', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.45)]', color: '#ef4444' }
];

export default function SpinPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'signup'
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const [winPrize, setWinPrize] = useState(null);
  const [cooldown, setCooldown] = useState('');
  const [canSpinDaily, setCanSpinDaily] = useState(false);
  const [canSpinSignup, setCanSpinSignup] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState('0s');

  const rowRef = useRef(null);

  // Generate randomized conveyor items for roulette appearance
  const generateCarousel = (targetPrizeIdx = null) => {
    const list = [];
    const count = 60; // Total boxes on conveyor
    for (let i = 0; i < count; i++) {
      // If this is the target slot (let's place it at item 45 for nice long spin duration)
      if (i === 45 && targetPrizeIdx !== null) {
        list.push({ ...SPIN_PRIZES[targetPrizeIdx], index: i });
      } else {
        // Fill randomly based on real probabilities (weighted selection)
        const rand = Math.random();
        let selectedIdx = 0;
        let cumulative = 0;
        const probs = [0.45, 0.35, 0.13, 0.05, 0.015, 0.004, 0.001]; // slightly adjusted for display variety
        for (let j = 0; j < SPIN_PRIZES.length; j++) {
          cumulative += probs[j] || 0;
          if (rand <= cumulative) {
            selectedIdx = j;
            break;
          }
        }
        list.push({ ...SPIN_PRIZES[selectedIdx], index: i });
      }
    }
    setCarouselItems(list);
  };

  useEffect(() => {
    generateCarousel();
  }, []);

  // Update cooldown and claim eligibility
  useEffect(() => {
    if (!user) return;

    // Check Signup
    setCanSpinSignup(!user.has_claimed_signup_bonus);

    // Check Daily
    if (!user.last_daily_spin_at) {
      setCanSpinDaily(true);
      setCooldown('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const lastClaim = new Date(user.last_daily_spin_at);
      const timeDiff = now.getTime() - lastClaim.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff >= 24) {
        setCanSpinDaily(true);
        setCooldown('');
        clearInterval(interval);
      } else {
        setCanSpinDaily(false);
        const remSecs = Math.floor((24 * 3600 * 1000 - timeDiff) / 1000);
        const hrs = Math.floor(remSecs / 3600);
        const mins = Math.floor((remSecs % 3600) / 60);
        const secs = remSecs % 60;
        setCooldown(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSpin = async () => {
    if (spinning) return;
    if (!user) {
      setError('You must be logged in to claim rewards.');
      return;
    }

    const type = activeTab;
    if (type === 'daily' && !canSpinDaily) return;
    if (type === 'signup' && !canSpinSignup) return;

    setError(null);
    setSpinning(true);
    setWinPrize(null);

    // Reset offset to starting position instantly
    setTransitionDuration('0s');
    setSpinOffset(0);

    try {
      // Start spin call
      const res = await db.claimSpin(user.id, type);
      if (!res.success) throw new Error(res.error || 'Failed to claim reward');

      // Update auth context state to refresh balance and XP progress
      if (login) {
        // Wait, context has `setUser` or we can trigger checkUser
        // Since login updates session, let's refresh locally
        setTimeout(async () => {
          // fetch latest profile in the background
          const latestProfile = await db.getProfile(user.id);
          if (latestProfile) {
            // Update auth state
            const sess = localStorage.getItem('bc_session');
            if (sess) {
              const parsed = JSON.parse(sess);
              parsed.balance_coins = latestProfile.balance_coins;
              parsed.total_earned_coins = latestProfile.total_earned_coins;
              parsed.last_daily_spin_at = latestProfile.last_daily_spin_at;
              parsed.has_claimed_signup_bonus = latestProfile.has_claimed_signup_bonus;
              localStorage.setItem('bc_session', JSON.stringify(parsed));
              window.dispatchEvent(new Event('storage'));
            }
          }
        }, 6000);
      }

      // Generate carousel with the target winning prize placed at index 45
      const targetIdx = res.prizeIndex;
      generateCarousel(targetIdx);

      // Animation calculations:
      // Item width: 140px, gap: 12px -> 152px total item pitch
      // Ticker target center slot: we want index 45 to stop exactly in the center of row container
      // Container width: e.g. 100% (usually center pointer is at container_width / 2)
      // Ticker target absolute offset: 45 * 152px = 6840px
      // Stop offset offset inside item: randomized between -40px and +40px for realism
      const itemWidth = 140;
      const itemGap = 12;
      const pitch = itemWidth + itemGap;
      const targetOffsetBase = 45 * pitch;
      const randomShift = Math.floor(Math.random() * 80) - 40; // randomize stopping point inside the winning card
      
      // Calculate target translateX so item index 45 centers at container center pointers
      const parentWidth = rowRef.current ? rowRef.current.parentElement.offsetWidth : 700;
      const centerTarget = targetOffsetBase - (parentWidth / 2) + (itemWidth / 2) + randomShift;

      // Begin animation
      setTimeout(() => {
        setTransitionDuration('5.5s'); // Smooth long spin
        setSpinOffset(-centerTarget);
      }, 50);

      // Finish spin animation callback
      setTimeout(() => {
        setSpinning(false);
        setWinPrize(res.prize);
      }, 5700);

    } catch (err) {
      setSpinning(false);
      setError(err.message);
    }
  };

  return (
    <div className="page-spin mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start relative select-none">
      <style>{`
        .conveyor-container {
          position: relative;
          background: rgba(10, 10, 15, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          height: 180px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
        }
        .conveyor-pointer-top {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 16px solid #bf5aff;
          z-index: 20;
          filter: drop-shadow(0 2px 10px rgba(191,90,255,0.7));
        }
        .conveyor-pointer-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 16px solid #bf5aff;
          z-index: 20;
          filter: drop-shadow(0 -2px 10px rgba(191,90,255,0.7));
        }
        .conveyor-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(180deg, transparent, #bf5aff, transparent);
          z-index: 10;
          opacity: 0.8;
          pointer-events: none;
        }
        .conveyor-row {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 100%;
          padding: 0 50px;
          transform: translateX(0px);
        }
        .conveyor-item {
          width: 140px;
          height: 120px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border-width: 2px;
          border-style: solid;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .rarity-common { border-color: rgba(63, 63, 70, 0.4); }
        .rarity-uncommon { border-color: rgba(16, 185, 129, 0.4); }
        .rarity-rare { border-color: rgba(59, 130, 246, 0.4); }
        .rarity-epic { border-color: rgba(168, 85, 247, 0.4); }
        .rarity-legendary { border-color: rgba(234, 179, 8, 0.4); }
        .rarity-mythic { border-color: rgba(239, 68, 68, 0.4); }

        .spin-glow-wrap {
          animation: spinPulse 2s infinite ease-in-out;
        }
        @keyframes spinPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>

      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="icon-wrapper-primary p-2">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            Daily & Signup Spin Wheel
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Claim your rewards regularly. Roll the ticker to win up to 250,000 coins!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-3 border-b border-dark-border/40 pb-4">
        <button
          onClick={() => !spinning && setActiveTab('daily')}
          disabled={spinning}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
            activeTab === 'daily'
              ? 'border-primary/40 bg-primary/10 text-primary shadow-lg'
              : 'border-dark-border/60 text-zinc-400 bg-dark-card hover:bg-dark-bg/60 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" /> Daily Free Spin
        </button>
        <button
          onClick={() => !spinning && setActiveTab('signup')}
          disabled={spinning}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
            activeTab === 'signup'
              ? 'border-secondary/40 bg-secondary/10 text-secondary shadow-lg'
              : 'border-dark-border/60 text-zinc-400 bg-dark-card hover:bg-dark-bg/60 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Sign-up Bonus Case
        </button>
      </div>

      {/* Ticker Conveyor Ticker Box */}
      <div className="conveyor-container">
        <div className="conveyor-pointer-top" />
        <div className="conveyor-line" />
        <div className="conveyor-pointer-bottom" />
        <div 
          ref={rowRef}
          className="conveyor-row"
          style={{
            transform: `translateX(${spinOffset}px)`,
            transitionProperty: 'transform',
            transitionDuration: transitionDuration,
            transitionTimingFunction: 'cubic-bezier(0.1, 0.8, 0.1, 1)'
          }}
        >
          {carouselItems.map((item, idx) => (
            <div 
              key={`${item.coins}_${idx}`} 
              className={`conveyor-item rarity-${item.rarity} border-t-4`}
              style={{
                background: item.bg,
                borderColor: item.color
              }}
            >
              <div className="text-[28px] mb-1 font-bold select-none">💎</div>
              <div className="text-sm font-black text-white">{item.coins.toLocaleString()}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: item.color }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-red-200">{error}</div>
        </div>
      )}

      {/* Actions and Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Spin action Card */}
        <div className="lg:col-span-7 bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 to-transparent rounded-full filter blur-[70px] pointer-events-none" />
          
          {winPrize ? (
            <div className="py-6 flex flex-col items-center animate-new-card select-none">
              <div className="relative mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#bf5aff]/20 blur-xl animate-pulse" />
                <div className={`h-24 w-24 rounded-2xl bg-dark-bg border-2 flex flex-col items-center justify-center shadow-2xl relative z-10`} style={{ borderColor: winPrize.color }}>
                  <div className="text-3xl">💎</div>
                  <div className="text-xs font-black text-white mt-1">{(winPrize.coins).toLocaleString()}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: winPrize.color }}>{winPrize.label}</div>
                </div>
              </div>
              <h3 className="text-lg font-black text-white">Congratulations!</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                You successfully claimed **{winPrize.coins.toLocaleString()} coins** ({winPrize.label} equivalent)!
              </p>
              <button 
                onClick={() => setWinPrize(null)} 
                className="mt-5 rounded-full px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider text-white border border-dark-border/40 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" /> Spin Again
              </button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                {activeTab === 'daily' ? 'Daily Claimable Bonus' : 'New User Signup Bonus'}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {activeTab === 'daily' ? 'Roll Your Daily Gift' : 'Claim Your Starting Case'}
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mt-2 leading-relaxed">
                {activeTab === 'daily' 
                  ? 'Get a free roll once every 24 hours to credit your balance with free gold coins.'
                  : 'Start your journey with a chance to win up to $250 starting coin bonus!'
                }
              </p>

              <div className="mt-8 select-none">
                {activeTab === 'daily' && !canSpinDaily && (
                  <div className="flex flex-col items-center gap-2">
                    <button disabled className="rounded-full px-8 py-3.5 bg-dark-bg text-zinc-650 border border-dark-border/60 text-xs font-extrabold uppercase tracking-wide cursor-not-allowed">
                      Spin Cooldown
                    </button>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5" /> Next spin: {cooldown}
                    </div>
                  </div>
                )}

                {activeTab === 'daily' && canSpinDaily && (
                  <button 
                    onClick={handleSpin}
                    disabled={spinning}
                    className="btn-gaming rounded-full px-10 py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                  >
                    {spinning ? 'Rolling...' : 'Spin Now!'}
                  </button>
                )}

                {activeTab === 'signup' && !canSpinSignup && (
                  <div className="flex flex-col items-center gap-2">
                    <button disabled className="rounded-full px-8 py-3.5 bg-dark-bg text-emerald-700/60 border border-emerald-950/20 text-xs font-extrabold uppercase tracking-wide cursor-not-allowed flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Claimed
                    </button>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Sign-up bonus already redeemed
                    </div>
                  </div>
                )}

                {activeTab === 'signup' && canSpinSignup && (
                  <button 
                    onClick={handleSpin}
                    disabled={spinning}
                    className="btn-gaming rounded-full px-10 py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                  >
                    {spinning ? 'Opening Case...' : 'Open Signup Case'}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Prize Pool Legend Card */}
        <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col justify-start relative shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-zinc-400" />
            Prize Pool Rarity
          </h3>

          <div className="space-y-2.5">
            {SPIN_PRIZES.slice().reverse().map((prize) => (
              <div 
                key={prize.coins} 
                className="flex items-center justify-between rounded-xl bg-dark-bg border border-dark-border/40 p-2.5 transition-all hover:bg-dark-bg"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: prize.color }} />
                  <span className="text-xs font-bold text-white">{(prize.coins).toLocaleString()} coins</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black uppercase tracking-wider" style={{ color: prize.color }}>
                    {prize.rarity}
                  </span>
                  <span className="block text-[8px] text-zinc-500 font-bold mt-0.5">
                    {(prize.probability * 100).toFixed(prize.probability < 0.001 ? 2 : 1)}% chance
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
