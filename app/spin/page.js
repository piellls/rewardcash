'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { 
  Gift, Zap, Sparkles, AlertCircle, Coins, Clock, CheckCircle2, RotateCcw,
  Trophy, Award, Gem, Crown, Flame, ChevronRight, Play, ShieldCheck, Heart
} from 'lucide-react';
import Link from 'next/link';

const SPIN_PRIZES = [
  { coins: 10, label: '$0.01', rarity: 'common', border: 'border-[#3f3f46]', bg: 'rgba(63,63,70,0.08)', glow: 'shadow-[0_0_15px_rgba(63,63,70,0.15)]', color: '#a1a1aa', icon: Coins },
  { coins: 50, label: '$0.05', rarity: 'common', border: 'border-[#3f3f46]', bg: 'rgba(63,63,70,0.08)', glow: 'shadow-[0_0_15px_rgba(63,63,70,0.15)]', color: '#a1a1aa', icon: Coins },
  { coins: 250, label: '$0.25', rarity: 'uncommon', border: 'border-[#10b981]', bg: 'rgba(16,185,129,0.08)', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]', color: '#10b981', icon: Award },
  { coins: 1000, label: '$1.00', rarity: 'rare', border: 'border-[#3b82f6]', bg: 'rgba(59,130,246,0.08)', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]', color: '#3b82f6', icon: Sparkles },
  { coins: 2500, label: '$2.50', rarity: 'epic', border: 'border-[#a855f7]', bg: 'rgba(168,85,247,0.08)', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]', color: '#a855f7', icon: Gem },
  { coins: 10000, label: '$10.00', rarity: 'legendary', border: 'border-[#eab308]', bg: 'rgba(234,179,8,0.08)', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]', color: '#eab308', icon: Trophy },
  { coins: 250000, label: '$250.00', rarity: 'mythic', border: 'border-[#ef4444]', bg: 'rgba(239,68,68,0.08)', glow: 'shadow-[0_0_25px_rgba(239,68,68,0.55)]', color: '#ef4444', icon: Crown }
];

const MOCK_NAMES = [
  'Olivia', 'Noah', 'Amelia', 'Liam', 'Sophia', 'Lucas', 'Charlotte', 'Elijah', 
  'Ava', 'James', 'Mia', 'Benjamin', 'Harper', 'Henry', 'Evelyn', 'Alexander'
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
  
  // Confetti particles state
  const [confetti, setConfetti] = useState([]);

  // Recent Wins Live Feed state
  const [recentWins, setRecentWins] = useState([]);

  const rowRef = useRef(null);

  // Initialize recent unboxings feed with 5 mock items
  useEffect(() => {
    const list = Array.from({ length: 5 }, () => {
      const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const rand = Math.random();
      let pIdx = 0;
      let cumulative = 0;
      const probs = [0.55, 0.28, 0.12, 0.04, 0.008, 0.0019, 0.0001];
      for (let j = 0; j < SPIN_PRIZES.length; j++) {
        cumulative += probs[j] || 0;
        if (rand <= cumulative) { pIdx = j; break; }
      }
      return {
        id: Math.random().toString(),
        user: name,
        prize: SPIN_PRIZES[pIdx],
        time: `${Math.floor(Math.random() * 15) + 1}m ago`
      };
    });
    setRecentWins(list);
  }, []);

  // Update recent unboxings periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const rand = Math.random();
      let pIdx = 0;
      let cumulative = 0;
      const probs = [0.55, 0.28, 0.12, 0.04, 0.008, 0.0019, 0.0001];
      for (let j = 0; j < SPIN_PRIZES.length; j++) {
        cumulative += probs[j] || 0;
        if (rand <= cumulative) { pIdx = j; break; }
      }
      const newWin = {
        id: Math.random().toString(),
        user: name,
        prize: SPIN_PRIZES[pIdx],
        time: 'Just now'
      };

      setRecentWins(prev => {
        const next = [newWin, ...prev];
        return next.slice(0, 5);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Generate randomized conveyor items for roulette appearance
  const generateCarousel = (targetPrizeIdx = null) => {
    const list = [];
    const count = 60; // Total boxes on conveyor
    for (let i = 0; i < count; i++) {
      if (i === 45 && targetPrizeIdx !== null) {
        list.push({ ...SPIN_PRIZES[targetPrizeIdx], index: i });
      } else {
        const rand = Math.random();
        let selectedIdx = 0;
        let cumulative = 0;
        const probs = [0.45, 0.35, 0.13, 0.05, 0.015, 0.004, 0.001];
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

    setCanSpinSignup(!user.has_claimed_signup_bonus);

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

  // Confetti particles generator
  const triggerConfetti = () => {
    const list = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage left
      y: -10 - Math.random() * 30, // top offset
      size: Math.random() * 8 + 5,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      color: ['#bf5aff', '#3b82f6', '#10b981', '#eab308', '#ef4444', '#f43f5e'][Math.floor(Math.random() * 6)]
    }));
    setConfetti(list);
    setTimeout(() => setConfetti([]), 6000);
  };

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
      const res = await db.claimSpin(user.id, type);
      if (!res.success) throw new Error(res.error || 'Failed to claim reward');

      // Update auth context state to refresh balance and XP progress
      if (login) {
        setTimeout(async () => {
          const latestProfile = await db.getProfile(user.id);
          if (latestProfile) {
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

      const targetIdx = res.prizeIndex;
      generateCarousel(targetIdx);

      const itemWidth = 140;
      const itemGap = 12;
      const pitch = itemWidth + itemGap;
      const targetOffsetBase = 45 * pitch;
      const randomShift = Math.floor(Math.random() * 80) - 40; 
      
      const parentWidth = rowRef.current ? rowRef.current.parentElement.offsetWidth : 700;
      const centerTarget = targetOffsetBase - (parentWidth / 2) + (itemWidth / 2) + randomShift;

      // Begin animation
      setTimeout(() => {
        setTransitionDuration('5.5s'); 
        setSpinOffset(-centerTarget);
      }, 50);

      // Finish spin animation callback
      setTimeout(() => {
        setSpinning(false);
        setWinPrize(res.prize);
        triggerConfetti();
      }, 5700);

    } catch (err) {
      setSpinning(false);
      setError(err.message);
    }
  };

  return (
    <div className="page-spin mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start relative select-none overflow-hidden">
      
      {/* Confetti Explosion Overlay */}
      {confetti.map((particle) => (
        <div 
          key={particle.id}
          className="absolute pointer-events-none rounded-sm z-50 animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      <style>{`
        .conveyor-container {
          position: relative;
          background: rgba(8, 8, 12, 0.95);
          border: 1px solid rgba(191, 90, 255, 0.15);
          border-radius: 24px;
          height: 190px;
          overflow: hidden;
          margin-bottom: 28px;
          box-shadow: 
            inset 0 0 40px rgba(0,0,0,0.95),
            0 8px 30px rgba(139,92,246,0.1);
        }
        .conveyor-pointer-top {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-top: 18px solid #bf5aff;
          z-index: 20;
          filter: drop-shadow(0 2px 12px rgba(191,90,255,0.85));
        }
        .conveyor-pointer-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-bottom: 18px solid #bf5aff;
          z-index: 20;
          filter: drop-shadow(0 -2px 12px rgba(191,90,255,0.85));
        }
        .conveyor-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(180deg, transparent, #bf5aff, transparent);
          z-index: 10;
          opacity: 0.95;
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
          height: 130px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.02);
          border-width: 2px;
          border-style: solid;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
        }
        .conveyor-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        
        .pulse-dot {
          animation: activePulse 1.6s infinite ease-in-out;
        }
        @keyframes activePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0.3; }
        }
        .animate-confetti-fall {
          animation: confettiFall linear forwards;
        }

        .gradient-border-glow {
          box-shadow: 0 0 35px rgba(191,90,255,0.25);
          border: 1px solid rgba(191,90,255,0.25);
        }
        
        /* Win card dynamic glow class */
        .wincard-glow {
          animation: goldGlow 2.5s infinite alternate;
        }
        @keyframes goldGlow {
          0% { box-shadow: 0 0 20px rgba(191,90,255,0.15); }
          100% { box-shadow: 0 0 45px rgba(191,90,255,0.45); }
        }
      `}</style>

      {/* Title Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
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

      {/* Recent Unboxings Ticker (Dope CS:GO case unboxing style live winner feed) */}
      <div className="mb-8 rounded-2xl bg-[#0e0e13]/65 border border-dark-border/40 p-3.5 flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden shadow-lg select-none">
        <div className="flex items-center gap-2 shrink-0 md:border-r border-dark-border/60 pr-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Live Free Wins:</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
            {recentWins.map((win) => {
              const WinIcon = win.prize.icon;
              return (
                <div 
                  key={win.id} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dark-border/40 bg-dark-bg/60 text-xs font-semibold hover:border-zinc-700/60 transition-colors animate-new-card"
                >
                  <WinIcon className="h-3.5 w-3.5" style={{ color: win.prize.color }} />
                  <span className="text-white font-bold">{win.user}</span>
                  <span className="text-zinc-550">unboxed</span>
                  <span className="font-extrabold uppercase" style={{ color: win.prize.color }}>{win.prize.coins} coins</span>
                </div>
              );
            })}
          </div>
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
          {carouselItems.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div 
                key={`${item.coins}_${idx}`} 
                className={`conveyor-item rarity-${item.rarity} border-t-4`}
                style={{
                  background: item.bg,
                  borderColor: item.color
                }}
              >
                <div className="mb-2 shrink-0 select-none">
                  <ItemIcon className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <div className="text-sm font-black text-white">{item.coins.toLocaleString()}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: item.color }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 flex items-start gap-3 animate-new-card">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-red-200">{error}</div>
        </div>
      )}

      {/* Actions and Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Spin action Card */}
        <div className="lg:col-span-7 bg-[#0e0e14]/90 border border-dark-border rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl gradient-border-glow">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
          
          {winPrize ? (
            <div className="py-6 flex flex-col items-center animate-new-card select-none">
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#bf5aff]/30 blur-2xl animate-pulse" />
                {(() => {
                  const WinIcon = winPrize.icon;
                  return (
                    <div className="h-28 w-28 rounded-3xl bg-dark-bg/90 border-2 flex flex-col items-center justify-center shadow-2xl relative z-10 wincard-glow" style={{ borderColor: winPrize.color }}>
                      <WinIcon className="h-10 w-10 mb-1" style={{ color: winPrize.color }} />
                      <div className="text-sm font-black text-white">{winPrize.coins.toLocaleString()}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest mt-0.5" style={{ color: winPrize.color }}>{winPrize.label}</div>
                    </div>
                  );
                })()}
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-1">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Congratulations!
              </h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm leading-relaxed">
                You successfully claimed <span className="text-white font-extrabold">{winPrize.coins.toLocaleString()} coins</span> ({winPrize.label} equivalent) directly to your wallet!
              </p>
              <button 
                onClick={() => setWinPrize(null)} 
                className="mt-6 rounded-full px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider text-white border border-dark-border/40 transition-colors flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <RotateCcw className="h-3 w-3" /> Spin Again
              </button>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary mb-2.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Flame className="h-3.5 w-3.5" />
                {activeTab === 'daily' ? 'Daily Claimable Bonus' : 'New User Signup Bonus'}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {activeTab === 'daily' ? 'Roll Your Daily Gift' : 'Claim Your Starting Case'}
              </h2>
              <p className="text-xs text-zinc-450 max-w-sm mt-3 leading-relaxed">
                {activeTab === 'daily' 
                  ? 'Get a free roll once every 24 hours to credit your balance with free gold coins. Check back every day!'
                  : 'Start your journey with a chance to win up to $250 starting coin bonus!'
                }
              </p>

              <div className="mt-8 select-none w-full">
                {activeTab === 'daily' && !canSpinDaily && (
                  <div className="flex flex-col items-center gap-3">
                    <button disabled className="rounded-full px-10 py-3.5 bg-dark-bg text-zinc-650 border border-dark-border/60 text-xs font-extrabold uppercase tracking-wide cursor-not-allowed">
                      Spin Cooldown Active
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest bg-dark-bg/60 px-4 py-1.5 rounded-full border border-dark-border/30">
                      <Clock className="h-4 w-4 text-primary animate-pulse" /> Next spin: {cooldown}
                    </div>
                  </div>
                )}

                {activeTab === 'daily' && canSpinDaily && (
                  <button 
                    onClick={handleSpin}
                    disabled={spinning}
                    className="btn-gaming rounded-full px-12 py-4 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                  >
                    {spinning ? 'Rolling...' : 'Spin Now!'}
                  </button>
                )}

                {activeTab === 'signup' && !canSpinSignup && (
                  <div className="flex flex-col items-center gap-2">
                    <button disabled className="rounded-full px-8 py-3.5 bg-dark-bg text-emerald-700/60 border border-emerald-950/20 text-xs font-extrabold uppercase tracking-wide cursor-not-allowed flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Redeemed
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
                    className="btn-gaming rounded-full px-12 py-4 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                  >
                    {spinning ? 'Opening Case...' : 'Open Signup Case'}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Prize Pool Legend Card (Detailed probabilistic bar ratios for high-end look) */}
        <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col justify-start relative shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-zinc-400" />
            Prize Pool Rarity
          </h3>

          <div className="space-y-3">
            {SPIN_PRIZES.slice().reverse().map((prize) => {
              const ItemIcon = prize.icon;
              return (
                <div 
                  key={prize.coins} 
                  className="flex flex-col rounded-xl bg-dark-bg/60 border border-dark-border/40 p-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-dark-bg shrink-0 border border-dark-border/30">
                        <ItemIcon className="h-4 w-4" style={{ color: prize.color }} />
                      </div>
                      <span className="text-xs font-bold text-white">{prize.coins.toLocaleString()} coins</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black uppercase tracking-wider" style={{ color: prize.color }}>
                        {prize.rarity}
                      </span>
                    </div>
                  </div>
                  {/* Probability Bar Indicator */}
                  <div className="h-1 w-full bg-dark-bg/80 rounded-full overflow-hidden border border-dark-border/30">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(1, Math.min(100, prize.probability * 100))}%`,
                        backgroundColor: prize.color,
                        boxShadow: `0 0 8px ${prize.color}`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 font-bold mt-1 uppercase tracking-widest">
                    <span>Probability</span>
                    <span>{(prize.probability * 100).toFixed(prize.probability < 0.001 ? 2 : 1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
