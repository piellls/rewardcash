'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { 
  Gift, Zap, Sparkles, AlertCircle, Coins, Clock, CheckCircle2, RotateCcw,
  Trophy, Award, Gem, Crown, Play, ShieldCheck, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import PageHeader, { Chip } from '@/components/PageHeader';
import { AnimatedNumber } from '@/components/motion';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';

// Coins Stack SVG Component
const CoinsStack = ({ level = 'low', size = 50 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" xmlns="http://www.w3.org/2000/svg">
      {level === 'low' && (
        <>
          <ellipse cx="32" cy="46" rx="16" ry="6" fill="#b45309" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="32" cy="41" rx="16" ry="6" fill="#d97706" stroke="#f59e0b" strokeWidth="1.5" />
          <ellipse cx="32" cy="36" rx="16" ry="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" />
        </>
      )}
      {level === 'medium' && (
        <>
          <ellipse cx="32" cy="48" rx="16" ry="6" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
          <ellipse cx="32" cy="43" rx="16" ry="6" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
          <ellipse cx="32" cy="38" rx="16" ry="6" fill="#eab308" stroke="#facc15" strokeWidth="1.5" />
          <ellipse cx="32" cy="33" rx="16" ry="6" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />
        </>
      )}
      {level === 'high' && (
        <>
          <ellipse cx="24" cy="46" rx="14" ry="5" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
          <ellipse cx="24" cy="41" rx="14" ry="5" fill="#eab308" stroke="#facc15" strokeWidth="1.5" />
          <ellipse cx="24" cy="36" rx="14" ry="5" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />

          <ellipse cx="40" cy="48" rx="14" ry="5" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
          <ellipse cx="40" cy="43" rx="14" ry="5" fill="#eab308" stroke="#facc15" strokeWidth="1.5" />
          <ellipse cx="40" cy="38" rx="14" ry="5" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />
        </>
      )}
      {level === 'mythic' && (
        <>
          <ellipse cx="22" cy="48" rx="12" ry="4" fill="#a16207" />
          <ellipse cx="42" cy="48" rx="12" ry="4" fill="#a16207" />
          <ellipse cx="32" cy="50" rx="16" ry="5" fill="#ca8a04" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="32" cy="30" r="16" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="2.5" className="animate-pulse" />
          <path d="M32 18V42M20 30H44" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
          </defs>
        </>
      )}
    </svg>
  );
};

// Chest SVG Icon Component
const ChestIcon = ({ type = 'purple', size = 80 }) => {
  const isGold = type === 'gold';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.75)] hover:scale-[1.05] transition-transform duration-300" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 28C10 28 10 52 14 52H50C54 52 54 28 54 28" fill="#0f0f15" stroke={isGold ? "#f59e0b" : "#9b7bff"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28H52V48C52 50 50 52 48 52H16C14 52 12 50 12 48V28Z" fill="#13141f" stroke={isGold ? "#fbbf24" : "#7854f7"} strokeWidth="1.5" />
      <path d="M8 20C8 15 15 12 32 12C49 12 56 15 56 20V28H8V20Z" fill={isGold ? "#451a03" : "#1e1b4b"} stroke={isGold ? "#fbbf24" : "#9b7bff"} strokeWidth="2.5" />
      <rect x="20" y="12" width="6" height="40" fill={isGold ? "#f59e0b" : "#6945e4"} opacity="0.85" />
      <rect x="38" y="12" width="6" height="40" fill={isGold ? "#f59e0b" : "#6945e4"} opacity="0.85" />
      <rect x="27" y="24" width="10" height="12" rx="2" fill={isGold ? "#fbbf24" : "#e879f9"} stroke={isGold ? "#ca8a04" : "#c084fc"} strokeWidth="1.5" />
      <circle cx="32" cy="30" r="2" fill="#000" />
      {!isGold ? (
        <>
          <path d="M22 22L24 14L27 22H22Z" fill="#7854f7" />
          <path d="M29 22L32 10L35 22H29Z" fill="#9b7bff" />
          <path d="M37 22L39 14L42 22H37Z" fill="#7854f7" />
        </>
      ) : (
        <>
          <path d="M22 22L24 15L27 22H22Z" fill="#eab308" />
          <path d="M29 22L32 12L35 22H29Z" fill="#fbbf24" />
          <path d="M37 22L39 15L42 22H37Z" fill="#eab308" />
        </>
      )}
    </svg>
  );
};

const SPIN_PRIZES = [
  { coins: 10, label: '$0.01', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.08)', color: '#a1a1aa', level: 'low' },
  { coins: 50, label: '$0.05', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.08)', color: '#a1a1aa', level: 'low' },
  { coins: 250, label: '$0.25', rarity: 'uncommon', border: '#10b981', bg: 'rgba(16,185,129,0.08)', color: '#10b981', level: 'medium' },
  { coins: 1000, label: '$1.00', rarity: 'rare', border: '#4597ff', bg: 'rgba(69,151,255,0.08)', color: '#4597ff', level: 'medium' },
  { coins: 2500, label: '$2.50', rarity: 'epic', border: '#7854f7', bg: 'rgba(120,84,247,0.08)', color: '#7854f7', level: 'high' },
  { coins: 10000, label: '$10.00', rarity: 'legendary', border: '#eab308', bg: 'rgba(234,179,8,0.08)', color: '#eab308', level: 'high' },
  { coins: 250000, label: '$250.00', rarity: 'mythic', border: '#ef4444', bg: 'rgba(239,68,68,0.08)', color: '#ef4444', level: 'mythic' }
];


export default function SpinPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('signup'); // Default to signup chest matching user focus
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const [winPrize, setWinPrize] = useState(null);
  const [cooldown, setCooldown] = useState('');
  const [canSpinDaily, setCanSpinDaily] = useState(false);
  
  const [signupState, setSignupState] = useState({
    claimsLeft: 1,
    progressCoins: 0,
    challengeCompleted: false,
    timeLeftMs: 0,
    endsAt: null
  });

  const [carouselItems, setCarouselItems] = useState([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState('0s');
  
  const tickRaf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(tickRaf.current), []);

  const rowRef = useRef(null);

  // Fetch dynamic signup bonus challenge state
  const loadSignupState = async () => {
    if (!user) return;
    try {
      const state = await db.getSignupBonusState(user.id);
      setSignupState(state);
    } catch (e) {
      console.error('Failed to load signup challenge state:', e);
    }
  };

  useEffect(() => {
    loadSignupState();
  }, [user]);

  // Handle countdown timers
  useEffect(() => {
    if (!signupState.endsAt) return;
    const interval = setInterval(() => {
      const ends = new Date(signupState.endsAt).getTime();
      const now = new Date().getTime();
      const diff = ends - now;
      if (diff <= 0) {
        setSignupState(prev => ({ ...prev, timeLeftMs: 0 }));
        clearInterval(interval);
      } else {
        setSignupState(prev => ({ ...prev, timeLeftMs: diff }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [signupState.endsAt]);

  // Generate conveyor carousel items
  const generateCarousel = (targetPrizeIdx = null) => {
    const list = [];
    const count = 60; 
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

  // Cooldown tracker for daily spin
  useEffect(() => {
    if (!user) return;

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

  // Win celebration: fanfare, confetti from the top and a coin fountain from the middle of the screen.
  const triggerConfetti = () => {
    sfx.play('win');
    fx.confetti({ count: 120 });
    fx.burst(window.innerWidth / 2, window.innerHeight * 0.45, { coins: 24, sparks: 26 });
  };

  const handleSpin = async () => {
    if (spinning) return;
    if (!user) {
      setError('You must be logged in to claim rewards.');
      return;
    }

    const type = activeTab;
    if (type === 'daily' && !canSpinDaily) return;
    if (type === 'signup' && signupState.claimsLeft <= 0) return;

    setError(null);
    setSpinning(true);
    setWinPrize(null);

    setTransitionDuration('0s');
    setSpinOffset(0);

    try {
      const res = await db.claimSpin(user.id, type);
      if (!res.success) throw new Error(res.error || 'Failed to claim reward');

      // Update auth context profile sync
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

      setTimeout(() => {
        setTransitionDuration('5.5s'); 
        setSpinOffset(-centerTarget);
        sfx.play('open');

        // One soft tick every time a prize card passes the pointer (reads the real position each frame)
        const row = rowRef.current;
        if (row) {
          let lastIdx = -1;
          const t0 = performance.now();
          const loop = () => {
            const x = new DOMMatrixReadOnly(getComputedStyle(row).transform).m41;
            const idx = Math.floor((-x + parentWidth / 2) / pitch);
            if (idx !== lastIdx) { if (lastIdx !== -1) sfx.play('tick'); lastIdx = idx; }
            if (performance.now() - t0 < 5800) tickRaf.current = requestAnimationFrame(loop);
          };
          tickRaf.current = requestAnimationFrame(loop);
        }
      }, 50);

      setTimeout(() => {
        setSpinning(false);
        setWinPrize(res.prize);
        triggerConfetti();
        loadSignupState(); // Reload dynamic claims details after a claim
      }, 5700);

    } catch (err) {
      setSpinning(false);
      setError(err.message);
      sfx.play('error');
    }
  };

  const formatChallengeTimer = (ms) => {
    if (ms <= 0) return 'Expired';
    const remSecs = Math.floor(ms / 1000);
    const days = Math.floor(remSecs / 86400);
    const hrs = Math.floor((remSecs % 86400) / 3600);
    const mins = Math.floor((remSecs % 3600) / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  // Convert profile progress to slider ratio (max $1 / 1000 coins)
  const challengeProgress = Math.min(100, (signupState.progressCoins / 1000) * 100);

  return (
    <div className="page-spin mx-auto flex w-full max-w-7xl flex-1 select-none flex-col justify-start overflow-x-hidden px-4 pb-10 pt-2 sm:px-6 lg:px-8 relative">
      <PageHeader
        eyebrow="Free rewards"
        icon={Gift}
        title="Spin &"
        accent="win"
        art="wheel"
        artGlow="purple"
        subtitle="Open your sign-up chest or claim a free spin every 24 hours. Prizes go straight to your balance."
      >
        <Chip tone="gold">Top prize $250 (very rare)</Chip>
        {user && <Chip tone="green"><AnimatedNumber value={user.balance_coins || 0} className="tabular-nums" /> coins</Chip>}
      </PageHeader>

      
      <style>{`
        .conveyor-container {
          position: relative;
          background: var(--bb-surface);
          border: 1px solid var(--bb-border);
          border-radius: 20px;
          height: 190px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: inset 0 0 35px rgba(0,0,0,0.9);
          width: 100%;
          max-width: 100%;
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
          border-top: 15px solid #ffffff;
          z-index: 25;
          filter: drop-shadow(0 2px 8px rgba(255,255,255,0.5));
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
          border-bottom: 15px solid #ffffff;
          z-index: 25;
          filter: drop-shadow(0 -2px 8px rgba(255,255,255,0.5));
        }
        .conveyor-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: #ffffff;
          z-index: 15;
          opacity: 0.85;
          pointer-events: none;
        }
        .conveyor-row {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 100%;
          padding: 0 50px;
          flex-wrap: nowrap;
        }
        .conveyor-item {
          width: 140px;
          height: 130px;
          border-radius: 16px;
          background: rgba(15, 17, 26, 0.6);
          border: 2px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: border-color 0.3s ease, background-color 0.3s ease;
          position: relative;
        }

        /* Diagonal stripes animated progress bar */
        @keyframes stripesShift {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        .stripes-progressbar {
          background: repeating-linear-gradient(
            45deg,
            #8f6dff,
            #8f6dff 12px,
            #6945e4 12px,
            #6945e4 24px
          );
          background-size: 40px 40px;
          animation: stripesShift 1.2s linear infinite;
        }

        .timer-ends-box {
          background: var(--bb-surface-2);
          border: 1px solid var(--bb-border);
        }

        @media (prefers-reduced-motion: reduce) {
          .stripes-progressbar { animation: none; }
        }
      `}</style>

      {/* Dynamic Tab Switchers (Daily vs Signup Chest) */}
      <div role="tablist" aria-label="Spin type" className="mb-6 flex flex-wrap justify-center gap-2.5">
        <button
          role="tab" aria-selected={activeTab === 'signup'} onClick={() => !spinning && setActiveTab('signup')}
          disabled={spinning}
          className={`min-h-[44px] px-4 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-[background-color,border-color,box-shadow,color,transform] duration-150 active:scale-95 ${
            activeTab === 'signup'
              ? 'border-primary bg-primary text-white shadow-[0_0_18px_rgba(120,84,247,0.55)]'
              : 'border-dark-border text-zinc-300 bg-[var(--bb-surface)] hover:bg-[var(--bb-surface-2)] hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Sign-up Bonus Chest
        </button>
        <button
          role="tab" aria-selected={activeTab === 'daily'} onClick={() => !spinning && setActiveTab('daily')}
          disabled={spinning}
          className={`min-h-[44px] px-4 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-[background-color,border-color,box-shadow,color,transform] duration-150 active:scale-95 ${
            activeTab === 'daily'
              ? 'border-primary bg-primary text-white shadow-[0_0_18px_rgba(120,84,247,0.55)]'
              : 'border-dark-border text-zinc-300 bg-[var(--bb-surface)] hover:bg-[var(--bb-surface-2)] hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" /> Daily Free Spin
        </button>
      </div>

      {/* Main spin interface wrapper */}
      <div className="g-card g-neon mx-auto w-full max-w-4xl p-4 sm:p-8 flex flex-col items-center justify-start shadow-2xl relative overflow-hidden">
        
        {/* Chest Illustration */}
        <div className="mb-4">
          <ChestIcon type={activeTab === 'signup' && signupState.challengeCompleted ? 'gold' : 'purple'} size={80} />
        </div>

        {/* Dynamic Titles */}
        <h2 className="text-2xl sm:text-3xl font-black text-white leading-none text-center">
          {activeTab === 'signup' ? 'Sign up Bonus!' : 'Daily Free Spin!'}
        </h2>
        <p className="text-zinc-400 font-semibold text-sm mt-2">
          {activeTab === 'signup' ? (
            <>Win up to <span className="text-[#9b7bff] font-bold">$250</span></>
          ) : (
            <>Claim your daily gift. Win up to <span className="text-[#9b7bff] font-bold">$250</span></>
          )}
        </p>

        {/* Carousel case unboxing spinner conveyor */}
        <div className="w-full max-w-full overflow-hidden mt-8">
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
                  className="conveyor-item"
                  style={{
                    borderColor: item.rarity === 'common' ? 'rgba(255,255,255,0.06)' : `${item.color}50`,
                    background: item.rarity === 'common' 
                      ? 'rgba(63,63,70,0.1)' 
                      : item.rarity === 'uncommon' 
                      ? 'rgba(16,185,129,0.06)' 
                      : item.rarity === 'epic' 
                      ? 'rgba(120,84,247,0.06)' 
                      : 'rgba(234,179,8,0.06)'
                  }}
                >
                  <div className="mb-2 shrink-0 select-none">
                    <CoinsStack level={item.level} size={50} />
                  </div>
                  <div className="text-[10px] font-black tracking-wider uppercase mt-1" style={{ color: item.color }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 flex items-start gap-3 animate-new-card">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold text-red-200">{error}</div>
          </div>
        )}

        {/* Dynamic win details overlay popup display */}
        {winPrize && (
          <div className="w-full mb-6 p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-new-card">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-dark-bg/85 flex items-center justify-center border border-primary/40">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-white">Prize Unboxed!</h4>
                <p className="text-xs text-zinc-400">Successfully credited +{winPrize.coins.toLocaleString()} coins to your account.</p>
              </div>
            </div>
            <button 
              onClick={() => setWinPrize(null)}
              className="rounded-full px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider text-white border border-dark-border/40 transition-colors shrink-0"
            >
              Close
            </button>
          </div>
        )}

        {/* Dynamic tab contents rendering */}
        {activeTab === 'signup' && (
          <div className="w-full flex flex-col items-center">
            
            {/* Spin actions display if claims are left */}
            {signupState.claimsLeft > 0 && !spinning && (
              <div className="mb-6 animate-new-card">
                <button 
                  onClick={handleSpin}
                  className="btn-gaming rounded-full px-12 py-4 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                >
                  Open Free Case ({signupState.claimsLeft} left)
                </button>
              </div>
            )}

            {spinning && (
              <div className="mb-6">
                <button disabled className="rounded-full px-10 py-3.5 bg-[var(--bb-surface-2)] text-zinc-400 border border-dark-border text-xs font-extrabold uppercase tracking-wide cursor-not-allowed">
                  Opening Case...
                </button>
              </div>
            )}

            {/* Progress bar matching the user mockup EXACTLY */}
            <div className="w-full max-w-full overflow-hidden flex items-center gap-2 sm:gap-3 mt-4 mb-4 select-none">
              <div className="bg-[#7854f7] text-white text-[10px] sm:text-[11px] font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shrink-0 flex items-center justify-center min-w-[42px] sm:min-w-[48px] shadow-[0_4px_12px_rgba(120,84,247,0.3)]">
                $ 0
              </div>
              <div className="flex-1 h-6 sm:h-7 bg-[#0b0c10] rounded-full border border-zinc-800/80 overflow-hidden relative flex items-center p-[3px]">
                <div 
                  className="stripes-progressbar h-full rounded-full transition-all duration-500"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>
              <div className="bg-[#7854f7] text-white text-[10px] sm:text-[11px] font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shrink-0 flex items-center justify-center min-w-[42px] sm:min-w-[48px] shadow-[0_4px_12px_rgba(120,84,247,0.3)]">
                $ 1
              </div>
            </div>

            {/* Campaign info text */}
            <p className="text-zinc-300 text-[11px] sm:text-xs font-semibold tracking-wide text-center leading-relaxed mt-2 px-2">
              Earn over <span className="text-white font-extrabold">$ 1</span> within <span className="text-[#9b7bff] font-extrabold">48 Hours</span> and receive <span className="text-[#9b7bff] font-extrabold">3 more free cases!</span>
            </p>

            {/* Extra chests reward list */}
            <div className="flex justify-center items-center gap-6 sm:gap-12 mt-6 mb-8 select-none">
              <div className="flex flex-col items-center">
                <ChestIcon type="purple" size={48} />
                <span className="text-xs font-extrabold text-[#9b7bff] mt-2">$ 250</span>
              </div>
              <div className="flex flex-col items-center">
                <ChestIcon type="gold" size={48} />
                <span className="text-xs font-extrabold text-amber-500 mt-2">$ 500</span>
              </div>
              <div className="flex flex-col items-center">
                <ChestIcon type="gold" size={48} />
                <span className="text-xs font-extrabold text-amber-500 mt-2">$ 500</span>
              </div>
            </div>

            {/* Challenge actions wrapper matching screenshot */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-md select-none mt-2 px-2">
              <div className="w-full sm:w-auto sm:flex-1 timer-ends-box rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold leading-none">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                Ends in: <span className="text-white font-extrabold">{formatChallengeTimer(signupState.timeLeftMs)}</span>
              </div>
              <Link 
                href="/earn"
                className="w-full sm:w-auto sm:flex-1 bg-[#9b7bff] hover:bg-[#7854f7] text-white text-xs font-black uppercase tracking-wider rounded-xl px-5 py-3 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_6px_20px_rgba(120,84,247,0.3)]"
              >
                Start Earning <Play className="h-3.5 w-3.5 fill-white" />
              </Link>
            </div>

          </div>
        )}

        {activeTab === 'daily' && (
          <div className="w-full flex flex-col items-center">
            
            {/* Daily spin eligibility actions */}
            {!canSpinDaily && (
              <div className="flex flex-col items-center gap-3 animate-new-card mt-4">
                <button disabled className="rounded-full px-12 py-4 bg-[var(--bb-surface-2)] text-zinc-400 border border-dark-border text-xs font-extrabold uppercase tracking-wide cursor-not-allowed">
                  Daily Cooldown Active
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest bg-dark-bg/60 px-4 py-1.5 rounded-full border border-dark-border/30">
                  <Clock className="h-4 w-4 text-primary animate-pulse" /> Next spin: {cooldown}
                </div>
              </div>
            )}

            {canSpinDaily && !spinning && (
              <div className="mt-4 mb-4">
                <button 
                  onClick={handleSpin}
                  className="btn-gaming rounded-full px-12 py-4 text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
                >
                  Spin Daily Gift
                </button>
              </div>
            )}

            {spinning && (
              <div className="mt-4 mb-4">
                <button disabled className="rounded-full px-10 py-3.5 bg-[var(--bb-surface-2)] text-zinc-400 border border-dark-border text-xs font-extrabold uppercase tracking-wide cursor-not-allowed">
                  Rolling...
                </button>
              </div>
            )}

            <p className="text-zinc-400 text-xs text-center max-w-md mt-6 leading-relaxed">
              Claim a free gold spin once every 24 hours. The reward will be automatically added to your total coin balance.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}
