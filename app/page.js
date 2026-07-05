'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import DirectTasksSection from '@/components/DirectTasksSection';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, CheckCircle, Zap, Gift, Clock, User, Mail, Lock, Loader2, ChevronDown, ChevronUp, Play, Award } from 'lucide-react';

const ACTIVITY_NAMES = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava',
  'Benjamin', 'Sophia', 'Lucas', 'Isabella', 'Henry', 'Mia', 'Alexander', 'Evelyn', 'Mason', 'Harper',
  'Michael', 'Camila', 'Ethan', 'Gianna', 'Daniel', 'Abigail', 'Jacob', 'Luna', 'Logan', 'Ella'
];

const ACTIVITY_OFFERS = [
  'Coin Master', 'Survey (CPX)', 'Monopoly GO', 'Brawl Stars', 'RAID Shadow Legends', 'TikTok Install', 'Gardenscapes'
];

const ACTIVITY_COINS = [480, 800, 1200, 2400, 3200, 4800, 5600, 7200, 9600, 12000];

function LiveTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const generate = () => ({
      id: `${Date.now()}-${Math.random()}`,
      username: ACTIVITY_NAMES[Math.floor(Math.random() * ACTIVITY_NAMES.length)],
      offer: ACTIVITY_OFFERS[Math.floor(Math.random() * ACTIVITY_OFFERS.length)],
      coins: ACTIVITY_COINS[Math.floor(Math.random() * ACTIVITY_COINS.length)],
      avatar: `🎮`
    });

    let initialItems = [];
    for (let i = 0; i < 10; i++) {
      initialItems.push(generate());
    }
    setItems(initialItems);

    const iv = setInterval(() => {
      setItems(prev => [generate(), ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="live-ticker-bar" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <div className="live-ticker-inner" style={{ display: 'flex', gap: 40, animation: 'ticker-scroll 25s linear infinite', width: 'max-content' }}>
        {[...items, ...items].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="live-ticker-item" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a1a1aa', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 16 }}>{item.avatar}</span>
            <span>
              <strong style={{ color: '#fff' }}>{item.username}</strong> earned{' '}
              <span style={{ color: '#8b5cf6', fontWeight: 800 }}>+{item.coins} Gems</span> on <em>{item.offer}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroActivityStack() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const generate = () => ({
      id: `${Date.now()}-${Math.random()}`,
      username: ACTIVITY_NAMES[Math.floor(Math.random() * ACTIVITY_NAMES.length)],
      offer: ACTIVITY_OFFERS[Math.floor(Math.random() * ACTIVITY_OFFERS.length)],
      coins: ACTIVITY_COINS[Math.floor(Math.random() * ACTIVITY_COINS.length)],
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80`
    });

    let initialItems = [];
    for (let i = 0; i < 4; i++) {
      initialItems.push(generate());
    }
    setItems(initialItems);

    const iv = setInterval(() => {
      setItems(prev => [generate(), ...prev.slice(0, 3)]);
    }, 3000);

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-sm bg-[#0d0d11]/85 border border-[#22222d] rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#22222d]/60 pb-2 mb-1">
        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Recent Conversions
        </span>
        <span className="text-[9px] text-[#8b5cf6] font-bold">100% Verified</span>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between bg-[#13131a]/80 border border-[#1e1e26] rounded-xl p-3 hover:border-[#8b5cf6]/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#4f8ef7] p-0.5">
              <div className="h-full w-full rounded-full bg-[#13131a] flex items-center justify-center font-bold text-xs text-white">
                {item.username.charAt(0)}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{item.username}</div>
              <div className="text-[10px] text-zinc-500">Completed {item.offer}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#8b5cf6] font-black text-xs">
            <Coins className="h-3 w-3" />
            +{item.coins}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroRegisterForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!username.trim()) throw new Error('Username is required!');
      await register(username, email, password);
    } catch (err) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[#22222a] bg-[#0d0d11]/90 p-6 sm:p-8 flex flex-col justify-between shadow-2xl min-h-[385px] relative backdrop-blur-md">
      <div>
        <h3 className="text-lg font-black text-white tracking-tight">Create Free Account</h3>
        <p className="text-[11px] text-zinc-450 mt-1 mb-4 leading-relaxed">
          Earn free coins, crypto, and gift cards instantly
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/40 p-3 text-xs text-red-400">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase mt-5 tracking-wider shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #4f8ef7 100%)', color: '#fff', border: 'none' }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join & Start Earning'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  
  // Stats
  const [stats, setStats] = useState({ totalPaid: 223685, usersOnline: 17110, offersCompleted: 2292603 });
  
  // FAQ toggles
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(prev => ({
        usersOnline: Math.max(15000, prev.usersOnline + Math.floor(Math.random() * 5) - 2),
        totalPaid: prev.totalPaid + 0.18,
        offersCompleted: prev.offersCompleted + 1,
      }));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const openRegister = () => { setAuthTab('register'); setIsAuthOpen(true); };
  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="page-home" style={{ minHeight: '100vh', background: '#0a0a0c' }}>
      
      {/* Live Activity Feed */}
      <div className="activity-banner-wrap" style={{ display: 'flex', alignItems: 'center', background: 'rgba(15,15,18,0.75)', borderBottom: '1px solid #1a1a22', height: 44 }}>
        <span className="activity-label" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 10, fontWeight: 900, color: '#8b5cf6', borderRight: '1px solid #1a1a22', height: '100%' }}>
          <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'pulseDot 1.5s infinite' }} />
          LIVE
        </span>
        <LiveTicker />
      </div>

      {/* Hero section */}
      <section className="hero-section py-16 md:py-24 relative overflow-hidden" style={{ backgroundImage: "url('/offerwall/landing_bg_5.avif')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,12,0.65)', pointerEvents: 'none' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-[#121217]/90 border border-[#22222a] rounded-full px-4 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <span className="text-[#8b5cf6]">✔</span> Fast Payouts
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#121217]/90 border border-[#22222a] rounded-full px-4 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <span className="text-[#8b5cf6]">✔</span> 100% Free to Join
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight leading-[1.05] text-white">
                Get paid for <br />
                <span style={{ color: '#8b5cf6' }}>Playing Games or <br />Doing Surveys</span>
              </h1>

              <p className="text-zinc-350 text-base max-w-lg leading-relaxed">
                Complete simple campaigns, play games, and take surveys to earn Gems. Withdraw instantly via PayPal, crypto, Roblox, and gift cards.
              </p>

              {user ? (
                <div className="flex flex-wrap gap-4 mt-2">
                  <Link href="/earn" className="rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:translate-y-[-2px] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #4f8ef7 100%)', color: '#fff' }}>
                    Go to Earn Center <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/cashout" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider">
                    Redeem Rewards
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 mt-2">
                  <button onClick={openRegister} className="rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:translate-y-[-2px] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #4f8ef7 100%)', color: '#fff' }}>
                    Join Now <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link href="/offerwall" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider">
                    View Offers
                  </Link>
                </div>
              )}

              {/* Supported Brands Marquee */}
              <div className="mt-6">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Supported Redemption Brands</div>
                <div className="flex flex-wrap gap-6 items-center opacity-65">
                  {['Roblox', 'Steam', 'Xbox', 'Amazon', 'Bitcoin'].map(b => (
                    <span key={b} className="text-sm font-black tracking-widest text-zinc-400 select-none uppercase">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Conversions / Signup) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {user ? (
                <HeroActivityStack />
              ) : (
                <HeroRegisterForm />
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Hero Stats Grid */}
      <section className="py-8 border-y border-[#1a1a22] bg-[#0c0c10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-[#8b5cf6]">{stats.totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}+$</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Total Paid Out</span>
            </div>
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-white">{stats.usersOnline.toLocaleString()}</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Active Users</span>
            </div>
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-white">{stats.offersCompleted.toLocaleString()}</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Completed Offers</span>
            </div>
          </div>
        </div>
      </section>

      {/* "Here's how" Section */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Steps Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Here's how</h2>
                <p className="text-sm text-zinc-450 mt-1">Earning cash has never been this simple.</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { step: 'Select an Campaign', desc: 'Complete simple surveys, play games or watch videos.' },
                  { step: 'Do task & Submit', desc: 'Do what the campaign wants you to do and hit submit.' },
                  { step: 'Get paid instantly', desc: 'Get your credits instantly and cash them out.' }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-[#8b5cf6]/20 bg-[#0f0f13]/40 transition-all">
                    <div className="h-8 w-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center font-black text-[#8b5cf6] text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{s.step}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Tutorial Graphic Column */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-[#22222d] shadow-2xl max-w-lg w-full aspect-video group cursor-pointer">
                <img src="/offerwall/landing_bg_5.avif" alt="Tutorial" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-[#8b5cf6]/90 flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-6 w-6 fill-white" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Top Offerwalls section */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Text Info */}
            <div className="lg:col-span-5 flex flex-col gap-5 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Top <span className="text-[#8b5cf6]">Offerwalls</span> You Can't Miss</h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  We integrate with the highest paying offerwall providers like AdBlueMedia, Lootably, and CPX Research. Earn bonus payouts with daily promotions and reward boosts.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/earn" className="btn-gaming rounded-xl px-8 py-3 text-xs font-black uppercase tracking-wider">
                  Start Earning Now
                </Link>
              </div>
            </div>

            {/* Right Hexagonal Partners wheel representation */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* Central logo */}
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#4f8ef7] p-0.5 shadow-[0_0_40px_rgba(139,92,246,0.5)] z-20 animate-pulse">
                  <div className="h-full w-full rounded-2xl bg-[#0a0a0c] flex items-center justify-center">
                    <img src="/offerwall/logo_fav.svg" alt="RewardCash logo" className="h-10 w-10" />
                  </div>
                </div>
                {/* Orbital partner bubbles */}
                {[
                  { name: 'AdBlueMedia', angle: 0 },
                  { name: 'Lootably', angle: 60 },
                  { name: 'CPX Research', angle: 120 },
                  { name: 'OGAds', angle: 180 },
                  { name: 'BitLabs', angle: 240 },
                  { name: 'AdGate', angle: 300 },
                ].map((p, idx) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 110;
                  const y = Math.sin(rad) * 110;
                  return (
                    <div 
                      key={idx} 
                      className="absolute h-14 w-14 rounded-xl bg-[#121217] border border-[#22222a] flex items-center justify-center text-[10px] font-black text-white text-center shadow-lg hover:border-[#8b5cf6]/40 transition-colors cursor-pointer"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      {p.name.split(' ')[0]}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tournaments, Rewards and Beyond */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Tiers List layout */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-[#0f0f13] border border-[#22222e] rounded-2xl p-5 shadow-2xl">
                <div className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-4 border-b border-[#22222d]/65 pb-2 flex justify-between">
                  <span>🎯 Streak Reward Tiers</span>
                  <span className="text-[#8b5cf6]">Daily Claim Bonus</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Day 1', icon: '/offerwall/box.avif', coins: '10' },
                    { label: 'Day 2', icon: '/offerwall/lightning.avif', coins: '25' },
                    { label: 'Day 3', icon: '/offerwall/ticket.avif', coins: '50' },
                    { label: 'Day 4', icon: '/offerwall/cup.avif', coins: '100' },
                  ].map((tier, idx) => (
                    <div key={idx} className="bg-[#13131a] border border-[#1e1e26] rounded-xl p-3 text-center hover:border-[#8b5cf6]/35 transition-colors">
                      <span className="block text-[9px] font-bold text-zinc-500 uppercase">{tier.label}</span>
                      <img src={tier.icon} alt={tier.label} className="h-10 w-10 object-contain mx-auto my-2" />
                      <span className="block text-xs font-black text-[#8b5cf6]">+{tier.coins}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0f0f13]/80 border border-[#1e1e26] rounded-2xl p-4 flex items-center gap-3">
                  <img src="/offerwall/carus_tour.png" alt="Tournaments" className="h-12 w-auto object-contain rounded" />
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Weekly Payouts</h4>
                    <span className="text-xs text-zinc-400 font-bold">$2,500/week</span>
                  </div>
                </div>
                <div className="bg-[#0f0f13]/80 border border-[#1e1e26] rounded-2xl p-4 flex items-center gap-3">
                  <img src="/offerwall/carus_days.png" alt="Streak" className="h-12 w-auto object-contain rounded" />
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Streak Reward</h4>
                    <span className="text-xs text-zinc-400 font-bold">+500 Gems</span>
                  </div>
                </div>
                <div className="bg-[#0f0f13]/80 border border-[#1e1e26] rounded-2xl p-4 flex items-center gap-3">
                  <img src="/offerwall/carus_diff.png" alt="Bonus" className="h-12 w-auto object-contain rounded" />
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Bonus multipliers</h4>
                    <span className="text-xs text-zinc-400 font-bold">1.5x Multiplier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right text info */}
            <div className="lg:col-span-6 flex flex-col gap-5 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Tournament, Rewards and Beyond</h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Earn extra by climbing our weekly leaderboards, claiming daily check-in chests, and using spin tickets. There are endless ways to multiply your earnings on RewardCash.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/leaderboard" className="btn-gaming rounded-xl px-8 py-3 text-xs font-black uppercase tracking-wider">
                  View Tournaments
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">What Earners Say</h2>
            <p className="text-sm text-zinc-450 mt-1">Read reviews from our active worldwide community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "RewardCash is the easiest and fastest paying website. I completed a RAID Shadow Legends offer and got $25 cashout within 2 hours!", name: "Sarah K. — United States" },
              { text: "I highly recommend the daily chest spin and the referral system. I make around $40 every single month doing passive tasks.", name: "Yassine M. — Morocco" },
              { text: "The support team is incredibly fast and helped me verify my gaming conversion details in under 10 minutes. 10/10 platform!", name: "Jack P. — United Kingdom" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-left shadow-xl relative overflow-hidden group hover:border-[#8b5cf6]/40 transition-colors">
                <div className="flex gap-1.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-zinc-350 leading-relaxed font-medium mb-4">{item.text}</p>
                <div className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & About Bemsloot Section */}
      <section className="py-20" style={{ background: '#0a0a0c' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">About <span className="text-[#8b5cf6]">RewardCash</span> &amp; FAQs</h2>
            <p className="text-sm text-zinc-450 mt-2">Get answers to the most common questions</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { q: "How do I earn credits on RewardCash?", a: "You earn credits by completing promotional offers, installing selected mobile games, answering market research surveys, and referencing friends. Each 1,000 credits matches $1.00 USD value." },
              { q: "Is there a limit to how much I can withdraw?", a: "No! There is no maximum limit. You can withdraw as many times as you want once you reach the minimum balance of $1.00 USD (1,000 credits)." },
              { q: "How fast are payments processed?", a: "All standard withdrawals (including PayPal, Bitcoin, and popular gaming cards) are verified and processed instantly by our automatic processing system." }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#121217] border border-[#1e1e26] rounded-2xl overflow-hidden shadow-xl text-left">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-sm font-black text-white uppercase tracking-wide border-none bg-transparent cursor-pointer"
                >
                  <span>{item.q}</span>
                  {faqOpen[idx] ? <ChevronUp className="h-4 w-4 text-[#8b5cf6]" /> : <ChevronDown className="h-4 w-4 text-[#8b5cf6]" />}
                </button>
                {faqOpen[idx] && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-[#1e1e26]/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
