'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Coins, Star, Play, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const REVIEWS = [
  { id: 1, rating: 5, tit: "the site is so good to make fast games currency and money", time: "2026-07-05", username: "Alexandra OwO", dsc: "the site is so good to make easy games currency or money, def recommend, sometimes you dont get good surveys or dont get them at all but sometimes you get good ones that pay a lot and compensate it" },
  { id: 2, rating: 5, tit: "Good site to earn money for free", time: "2026-07-05", username: "Aldi Guri", dsc: "The site was very nice looking, I did some offers and got credited. The cashout was instant aswell i got my gift card in no time. Overall very good I will continue using." },
  { id: 3, rating: 5, tit: "Excellent Surveys and Offers Site", time: "2026-07-05", username: "Bruhh lts", dsc: "Very good, I do recommend this website. They have a lot of survey and offer platforms. A bunch of giftcards to withdraw. All legit!" },
  { id: 4, rating: 5, tit: "Works", time: "2026-07-05", username: "Trishti", dsc: "It works great and give me robux" },
  { id: 5, rating: 5, tit: "The Poker Stars offer worked!", time: "2026-07-05", username: "mau", dsc: "I recently made the Poker Stars offer, it gave me almost 3,000 R$ for depositing $15 USD into my account, after a couple of days the offer was verified and my account was credited with the balance." }
];

const ORBITAL_PARTNERS = [
  { name: 'AdBlueMedia', url: 'https://img.gemsloot.com/f/landing/logos/h/gensh.png' },
  { name: 'Lootably', url: 'https://img.gemsloot.com/f/landing/logos/h/m_go.png' },
  { name: 'CPX Research', url: 'https://img.gemsloot.com/f/landing/logos/h/personaly.png' },
  { name: 'OGAds', url: 'https://img.gemsloot.com/f/landing/logos/h/punk.png' },
  { name: 'BitLabs', url: 'https://img.gemsloot.com/f/landing/logos/s/raid.png' },
  { name: 'AdGate', url: 'https://img.gemsloot.com/f/landing/logos/s/revolut_logo.png' },
];

function HeroActivityStack() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const generate = () => {
      const names = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava'];
      const offers = ['Coin Master', 'Survey (CPX)', 'Monopoly GO', 'Brawl Stars', 'RAID Legends', 'TikTok Install'];
      const coins = [480, 800, 1200, 2400, 3200, 4800, 5600, 7200, 9600];
      return {
        id: `${Date.now()}-${Math.random()}`,
        username: names[Math.floor(Math.random() * names.length)],
        offer: offers[Math.floor(Math.random() * offers.length)],
        coins: coins[Math.floor(Math.random() * coins.length)],
      };
    };

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
    <div className="flex flex-col gap-2.5 w-full max-w-sm bg-[#101012]/90 border border-[#22222a] rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#22222a]/60 pb-2 mb-1">
        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Recent Conversions
        </span>
        <span className="text-[9px] text-[#8b5cf6] font-bold">100% Verified</span>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between bg-[#13131a]/85 border border-[#1e1e26] rounded-xl p-3 hover:border-[#8b5cf6]/30 transition-all duration-300">
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
    <div className="w-full rounded-2xl border border-[#22222a] bg-[#101012]/95 p-6 sm:p-8 flex flex-col justify-between shadow-2xl min-h-[385px] relative backdrop-blur-md">
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
              <input
                type="text"
                required
                placeholder="choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#070709] border border-[#22222a] py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#8b5cf6] focus:outline-none transition-colors font-semibold"
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
  
  // Dynamic stats mimicking Gemsloot landing dashboard
  const [stats, setStats] = useState({ totalPaid: 223685, usersOnline: 17110, offersCompleted: 2292603 });
  
  // FAQ state toggles
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
    <div className="page-home" style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff' }}>
      
      {/* 1. HERO SECTION & BACKDROP GRID */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundImage: "url('/offerwall/landing_bg_5.avif')", backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,12,0.4) 0%, rgba(10,10,12,0.95) 100%)', pointerEvents: 'none' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Box */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-[#101012]/80 border border-[#22222a] rounded-full px-4 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <span className="text-[#8b5cf6]">✔</span> No deposit
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#101012]/80 border border-[#22222a] rounded-full px-4 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <span className="text-[#8b5cf6]">✔</span> Quick cashout
                </div>
              </div>

              {/* Header Title exact duplicate of Gemsloot */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
                Get paid for <br />
                <span className="text-gradient">Playing Games or <br />Doing Surveys</span>
              </h1>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-2">
                {user ? (
                  <Link href="/earn" className="rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:translate-y-[-2px] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #4f8ef7 100%)', color: '#fff' }}>
                    Earn now!
                  </Link>
                ) : (
                  <button onClick={openRegister} className="rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:translate-y-[-2px] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #4f8ef7 100%)', color: '#fff', border: 'none' }}>
                    Earn now!
                  </button>
                )}
                <a href="#howto" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider">
                  How it works
                </a>
              </div>

              {/* Supported Brands Marquee */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-6 items-center opacity-65">
                  {['Roblox', 'Steam', 'Xbox', 'Amazon', 'Bitcoin'].map(b => (
                    <span key={b} className="text-sm font-black tracking-widest text-zinc-400 select-none uppercase">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Form/Recent Conversions Column */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {user ? <HeroActivityStack /> : <HeroRegisterForm />}
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS BAR SECTION */}
      <section className="py-10 border-y border-[#1a1a22] bg-[#0c0c10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-[#8b5cf6]">{stats.totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}+$</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Users cashed out this month</span>
            </div>
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-white">17m 10s</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Avg. time to the first cashout</span>
            </div>
            <div className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-center hover:border-[#8b5cf6]/40 transition-colors shadow-xl">
              <span className="block text-2xl font-black text-white">{stats.offersCompleted.toLocaleString()}</span>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Finished offers in total</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "HERE'S HOW" TUTORIAL SECTION */}
      <section id="howto" className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Steps Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Here's how</h2>
              </div>

              <div className="flex flex-col gap-5">
                {[
                  { step: 'Select offer to complete', desc: 'Choose from a huge collection of surveys, mobile app downloads, and gaming objectives.' },
                  { step: 'Complete the offer', desc: 'Offer can have one or multiple tasks, usually it takes a few minutes.' },
                  { step: 'Collect balance', desc: 'Watch your gems credit instantly to your user account balance.' },
                  { step: 'Cashout desired things', desc: 'Redeem points directly to PayPal, Roblox, Bitcoin, or gaming skins.' }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-[#8b5cf6]/20 bg-[#0f0f13]/40 transition-all">
                    <div className="h-8 w-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center font-black text-[#8b5cf6] text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{s.step}</h4>
                      <p className="text-xs text-zinc-450 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded YouTube video matching exactly */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-[#22222d] shadow-2xl max-w-lg w-full aspect-video group cursor-pointer">
                <iframe 
                  style={{ width: '100%', height: '100%' }} 
                  src="https://www.youtube.com/embed/oIKQWyCxogE?si=h8MgSJHsR6gOlcTS" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURES LIST */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-16">
          
          {/* Top Offers feature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#8b5cf6] tracking-widest">Features</span>
              <h3 className="text-3xl font-extrabold text-white leading-tight">Top <span className="text-[#8b5cf6]">Offers</span> You Can't Miss</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Discover exclusive tasks and hidden gems you won't find anywhere else. Explore 10,000+ offers from top partners!
              </p>
            </div>
            
            {/* Central Hexagonal Orbital partner bubbles */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative w-80 h-80 flex items-center justify-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#4f8ef7] p-0.5 shadow-[0_0_40px_rgba(139,92,246,0.5)] z-20">
                  <div className="h-full w-full rounded-2xl bg-[#0a0a0c] flex items-center justify-center">
                    <img src="/offerwall/logo_fav.svg" alt="Gemsloot Logo" className="h-10 w-10" />
                  </div>
                </div>
                {ORBITAL_PARTNERS.map((p, idx) => {
                  const angle = idx * 60;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 115;
                  const y = Math.sin(rad) * 115;
                  return (
                    <div 
                      key={idx} 
                      className="absolute h-14 w-14 rounded-xl bg-[#121217] border border-[#22222a] flex items-center justify-center p-1.5 shadow-lg hover:border-[#8b5cf6]/40 transition-all cursor-pointer group"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      <img src={p.url} alt={p.name} className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-100 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tournament Rewards Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left border-t border-[#1a1a22]/60 pt-16">
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="flex flex-col gap-3 w-full max-w-md">
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
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Weekly payouts</h4>
                      <span className="text-xs text-[#8b5cf6] font-bold">$2,500/week</span>
                    </div>
                  </div>
                  <div className="bg-[#0f0f13]/80 border border-[#1e1e26] rounded-2xl p-4 flex items-center gap-3">
                    <img src="/offerwall/carus_days.png" alt="Streak" className="h-12 w-auto object-contain rounded" />
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Streak Reward</h4>
                      <span className="text-xs text-[#8b5cf6] font-bold">+500 Gems</span>
                    </div>
                  </div>
                  <div className="bg-[#0f0f13]/80 border border-[#1e1e26] rounded-2xl p-4 flex items-center gap-3">
                    <img src="/offerwall/carus_diff.png" alt="Bonus" className="h-12 w-auto object-contain rounded" />
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Multipliers</h4>
                      <span className="text-xs text-[#8b5cf6] font-bold">1.5x Boost</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
              <h3 className="text-3xl font-extrabold text-white leading-tight"><span className="text-[#8b5cf6]">Tournament</span> Rewards and Beyond</h3>
              <p className="text-sm text-zinc-450 leading-relaxed">
                Go beyond offers, join tournaments, climb leaderboards, earn with streaks and lucky spins. Do more, earn more!
              </p>
            </div>
          </div>

          {/* Passive Income Affiliate Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left border-t border-[#1a1a22]/60 pt-16">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="text-3xl font-extrabold text-white leading-tight">Passive Income with <span className="text-[#8b5cf6]">Affiliate</span></h3>
              <p className="text-sm text-zinc-450 leading-relaxed">
                Skip the grind, earn every time someone you refer completes offers. With our affiliate program, when they earn more, so do you, it's a win-win!
              </p>
            </div>
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden border border-[#22222d] shadow-2xl">
                <img src="/offerwall/referal.png" alt="Affiliate referrals" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>

          {/* VIP Benefits Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left border-t border-[#1a1a22]/60 pt-16">
            <div className="lg:col-span-12 flex flex-col gap-4">
              <h3 className="text-3xl font-extrabold text-white leading-tight">Exclusive <span className="text-[#8b5cf6]">VIP</span> Benefits</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                {[
                  { title: 'DAILY REWARD SPIN', img: '/offerwall/rulot_new.png' },
                  { title: 'EXCLUSIVE TOURNAMENTS', img: '/offerwall/cup.avif' },
                  { title: 'EXCLUSIVE EARNING BOOSTS', img: '/offerwall/lightning.avif' },
                  { title: 'BONUSES ON EARNINGS', img: '/offerwall/box.avif' },
                  { title: 'RAFFLE TICKETS', img: '/offerwall/ticket.avif' }
                ].map((vip, idx) => (
                  <div key={idx} className="bg-[#121217] border border-[#22222a] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#8b5cf6]/40 hover:-translate-y-1 transition-all cursor-pointer group">
                    <img src={vip.img} alt={vip.title} className="h-16 w-16 object-contain mb-3 transition-transform duration-300 group-hover:scale-105" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{vip.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. "WE'RE LEGIT NO BULLSH*T" TRUSTPILOT TESTIMONIALS */}
      <section className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="text-left">
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-none">We're legit <br />No bullsh*t..</h2>
            </div>
            <div className="flex items-center gap-4 bg-[#121217] border border-[#22222a] rounded-2xl p-5 shadow-lg text-left">
              <div>
                <span className="block text-xs font-black text-white">Trustpilot Rating</span>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#00b67a] text-[#00b67a]" />)}
                </div>
              </div>
              <div className="h-8 w-px bg-[#22222a]" />
              <div className="text-sm font-black text-white">4.9 / 5.0</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-[#121217] border border-[#1e1e26] rounded-2xl p-6 text-left shadow-xl hover:border-[#8b5cf6]/40 transition-colors">
                <div className="flex gap-1.5 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#00b67a] text-[#00b67a]" />
                  ))}
                </div>
                <h4 className="text-xs font-bold text-white mb-1 leading-snug line-clamp-1">{item.tit}</h4>
                <p className="text-[11px] text-zinc-450 leading-relaxed min-h-[60px] line-clamp-3 mb-4">{item.dsc}</p>
                <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wider">{item.username}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ & ABOUT SECTION */}
      <section className="py-20" style={{ background: '#0a0a0c' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">About <span className="text-[#8b5cf6]">RewardCash</span> &amp; FAQs</h2>
            <p className="text-sm text-zinc-450 mt-2">Get answers to the most common questions</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { q: "What kind of site is RewardCash?", a: "RewardCash is a Get Paid To (GPT) platform that allows users to earn money by completing a variety of tasks, including taking surveys, watching videos, downloading apps, and more. The earnings accumulated on the site can be exchanged for rewards such as Robux, PayPal cash, cryptocurrencies, gift cards, or gaming items like Steam skins." },
              { q: "Can I cash out in real-world currencies?", a: "Yes, that’s exactly what RewardCash is designed for. You can redeem your earnings for a wide variety of real-world rewards, including popular gift cards, PayPal cash, Visa prepaid cards, and even cryptocurrencies like Bitcoin or Solana. Whether you prefer digital cash or spending credit, RewardCash offers flexible payout options to suit your needs." },
              { q: "What’s the process behind how RewardCash pays its users?", a: `Users earn money by completing tasks, and RewardCash gets paid by advertisers in return. This allows the platform to fund user payouts. Here’s a step-by-step breakdown of how it works:
1. Advertisers offer a range of tasks for users, such as downloading apps, registering on websites, watching videos, reaching specific in-game levels, and more.
2. Advertisers pay RewardCash for the exposure. For each completed task, RewardCash earns a commission from the advertiser.
3. RewardCash rewards users with payouts. Once all task conditions are fulfilled, RewardCash issues the corresponding payout to the user.` },
              { q: "Do I need to make a deposit before my first cashout?", a: "No, there is no deposit required. RewardCash is completely free to use, and you can earn without ever risking or spending any money." },
              { q: "What is the value of the balance coins?", a: "Our balance system is based in either USD or Robux (R$). The USD value is 1:1 with real currency, meaning it can be withdrawn through various options such as gift cards, cryptocurrencies, PayPal, and more." }
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
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-[#1e1e26]/50 pt-3 whitespace-pre-line">
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
