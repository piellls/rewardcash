'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Coins, Star, Play, ChevronDown, ChevronUp, Loader2, Crown, Trophy, Zap, Gift, Ticket } from 'lucide-react';

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



const CARTOON_AVATARS = [
  '/avatars/1.png',
  '/avatars/2.png',
  '/avatars/3.png',
  '/avatars/4.png',
  '/avatars/5.png',
  '/avatars/6.png',
  '/avatars/7.png',
  '/avatars/8.png',
  '/avatars/9.png'
];

const RANDOM_OFFERS = [
  { action: 'Earn Just Now', detail: 'Goblins Wood (Reach Level 15)', payout: '1.95' },
  { action: 'Earn Just Now', detail: 'Merge Studio (Complete Level 25)', payout: '15.00' },
  { action: 'Earn Just Now', detail: 'Bus Craze - Traffic Jam Puzzle', payout: '0.00' },
  { action: 'Earn Just Now', detail: 'Reco Social - Multi [US AOS]', payout: '1.00' },
  { action: 'Earn Just Now', detail: 'Hole Rush (Watch Ads)', payout: '0.01' },
  { action: 'Earn Just Now', detail: 'That\'s My Seat - Logic Puzzle', payout: '0.12' },
  { action: 'Earn Just Now', detail: 'Monopoly GO (Level 12)', payout: '2.40' },
  { action: 'Earn Just Now', detail: 'Coin Master (Village 4)', payout: '3.50' },
  { action: 'Earn Just Now', detail: 'TikTok (Install & Open)', payout: '0.45' },
  { action: 'Earn Just Now', detail: 'Surveys (CPX Research)', payout: '1.20' },
  { action: 'Cashout Just Now', detail: 'crypto: btc', payout: '3.75' },
  { action: 'Cashout Just Now', detail: 'crypto: ltc', payout: '5.00' },
  { action: 'Cashout Just Now', detail: 'paypal transfer', payout: '10.00' },
  { action: 'Cashout Just Now', detail: 'robux redeem', payout: '15.00' },
  { action: 'Cashout Just Now', detail: 'amazon giftcard', payout: '25.00' },
  { action: 'Reward Just Now', detail: 'affiliate collect', payout: '3.75' },
  { action: 'Reward Just Now', detail: 'daily bonus claim', payout: '0.50' },
  { action: 'Reward Just Now', detail: 'leaderboard reward', payout: '10.00' },
  { action: 'Reward Just Now', detail: 'level up bonus', payout: '2.00' }
];

function LiveConversionStack() {
  const [items, setItems] = useState([
    {
      id: 1,
      action: 'Earn Just Now',
      detail: 'Goblins Wood (Reach Level...',
      payout: '1.95',
      avatar: '/avatars/3.png',
      isNew: false
    },
    {
      id: 2,
      action: 'Earn Just Now',
      detail: 'Merge Studio (Complete Leve...',
      payout: '15.00',
      avatar: '/avatars/1.png',
      isNew: false
    },
    {
      id: 3,
      action: 'Earn Just Now',
      detail: 'Bus Craze - Traffic Jam Puzzl...',
      payout: '0.00',
      avatar: '/avatars/2.png',
      isNew: false
    },
    {
      id: 4,
      action: 'Earn Just Now',
      detail: 'Reco Social - Multi [US AOS]...',
      payout: '1.00',
      avatar: '/avatars/4.png',
      isNew: false
    }
  ]);

  useEffect(() => {
    const addNewItem = () => {
      const offer = RANDOM_OFFERS[Math.floor(Math.random() * RANDOM_OFFERS.length)];
      const avatar = CARTOON_AVATARS[Math.floor(Math.random() * CARTOON_AVATARS.length)];
      
      const newItem = {
        id: Date.now(),
        action: offer.action,
        detail: offer.detail,
        payout: offer.payout,
        avatar: avatar,
        isNew: true
      };

      setItems(prev => {
        const updatedPrev = prev.map(item => ({ ...item, isNew: false }));
        return [newItem, ...updatedPrev].slice(0, 4);
      });
    };

    // Helper to get random interval between 10 and 19 seconds
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * (19000 - 10000 + 1)) + 10000;
      return setTimeout(() => {
        addNewItem();
        timeoutId = scheduleNext();
      }, delay);
    };

    let timeoutId = scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDownNew {
          from {
            opacity: 0;
            transform: translateY(-25px) scale(0.93);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
            border-width: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 120px;
            margin-bottom: 12px;
            padding-top: 18px;
            padding-bottom: 18px;
            border-width: 1px;
          }
        }
        .animate-new-card {
          animation: slideDownNew 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          overflow: hidden;
        }
      `}} />
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            className={`bg-[#13141a]/90 border border-[#22222d] rounded-2xl p-4.5 items-center justify-between shadow-2xl backdrop-blur-sm hover:border-[#bf5aff]/30 transition-all duration-300 ${item.isNew ? 'animate-new-card' : ''} ${idx === 3 ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="flex items-center gap-3">
              <img src={item.avatar} alt="avatar" className="h-11 w-11 rounded-xl object-cover border border-white/10 shrink-0" />
              <div>
                <div className="text-[10px] font-bold text-zinc-500">
                  {item.action.split(' ')[0]} <span className="text-zinc-550">{item.action.split(' ').slice(1).join(' ')}</span>
                </div>
                <div className="text-xs font-black text-white mt-0.5 truncate max-w-[200px]">
                  {item.detail}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#bf5aff] to-[#8b5cf6] rounded-xl px-3 py-1.5 font-black text-white text-xs flex items-center gap-1 shadow-md shrink-0">
              <span className="bg-white/20 rounded-full h-4.5 w-4.5 inline-flex items-center justify-center text-[10px] font-bold">$</span>
              {item.payout}
            </div>
          </div>
        ))}
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
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,12,0.45) 0%, rgba(10,10,12,0.95) 100%)', pointerEvents: 'none' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Box */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              {/* Header Title exact duplicate of Gemsloot */}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight leading-[1.05] text-white">
                <span className="text-[#bf5aff]">Get paid</span> for <br />
                Playing Games or <br />
                Doing Surveys
              </h1>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 mt-1">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-350">
                  <span className="bg-[#13b257] text-white rounded-full h-5 w-5 inline-flex items-center justify-center font-bold text-[11px] shrink-0">✔</span>
                  No deposit
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-zinc-350">
                  <span className="bg-[#13b257] text-white rounded-full h-5 w-5 inline-flex items-center justify-center font-bold text-[11px] shrink-0">✔</span>
                  Quick cashout
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-3">
                {user ? (
                  <Link href="/earn" className="rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-lg hover:scale-102 transition-all" style={{ background: '#bf5aff', color: '#fff' }}>
                    Earn now!
                  </Link>
                ) : (
                  <button onClick={openRegister} className="rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-lg hover:scale-102 transition-all" style={{ background: '#bf5aff', color: '#fff', border: 'none' }}>
                    Earn now!
                  </button>
                )}
                <a href="#howto" className="rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-650 hover:bg-white/5 transition-all text-white bg-transparent">
                  <span className="text-[14px]">ⓘ</span> How it works
                </a>
              </div>
            </div>

            {/* Right Column (Live animated stack of conversion cards) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <LiveConversionStack />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR SECTION */}
      <section className="py-10 border-y border-[#1a1a22] bg-[#0c0c10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1 */}
            <div className="bg-gradient-to-r from-[#9c3fe4] to-[#6d1cb0] border border-[#a855f7]/30 rounded-2xl p-6 flex items-center gap-4.5 shadow-[0_4px_25px_rgba(139,92,246,0.25)] relative overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left">
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%)', pointerEvents: 'none' }} />
              <div className="relative z-10 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none"><path fill="#fff" d="M30.004 21.339c-.394-1.467-5.306-1.424-10.974.095-5.67 1.52-9.945 3.938-9.552 5.404l.778 2.903c.391 1.466 5.306 1.422 10.974-.096 5.667-1.52 9.944-3.94 9.551-5.404z"/><path fill="#D28BE7" d="M17.3 16.173c-2.576-1.488-4.896-3.098-6.537-4.54a17.16 17.16 0 0 1-1.018-.958c-3.848.32-6.557 1.078-6.557 1.962v4.25c0 1.175 4.757 2.125 10.625 2.125 3.032 0 5.75-.257 7.686-.663a51.128 51.128 0 0 1-4.2-2.176"/><path fill="#fff" d="M21.013 9.731c-3.557-2.052-6.203-4.13-5.91-4.639.294-.507 3.415.744 6.973 2.799 3.557 2.053 6.203 4.131 5.91 4.639-.294.508-3.416-.744-6.973-2.799m1.594-2.76c-5.083-2.935-9.677-4.488-10.264-3.472l-2.125 3.68c-.586 1.016 3.056 4.218 8.139 7.153 5.08 2.935 9.677 4.488 10.264 3.472l2.125-3.68c.586-1.016-3.058-4.218-8.139-7.153"/></svg>
              </div>
              <div className="relative z-10 text-left">
                <span className="block text-3xl font-black text-white leading-none">{stats.totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}$</span>
                <span className="block text-[11px] font-bold text-purple-100/90 tracking-tight mt-1.5">Users cashed out this month</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-r from-[#9c3fe4] to-[#6d1cb0] border border-[#a855f7]/30 rounded-2xl p-6 flex items-center gap-4.5 shadow-[0_4px_25px_rgba(139,92,246,0.25)] relative overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left">
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%)', pointerEvents: 'none' }} />
              <div className="relative z-10 shrink-0">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_2129_39042)"><mask id="mask0_2129_39042" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="0" y="0" width="34" height="34"><path d="M0 0H34V34H0V0Z" fill="white"/></mask><g mask="url(#mask0_2129_39042)"><path d="M22.6115 19.2865L19.611 22.2849C18.9098 22.9883 17.9748 23.375 16.9824 23.375C15.99 23.375 15.055 22.9883 14.3538 22.2849C13.6504 21.5836 13.2637 20.6507 13.2637 19.6562C13.2637 18.6639 13.6504 17.7289 14.3538 17.0276L17.3522 14.0271C18.0555 13.3259 18.9884 12.9391 19.9829 12.9391C20.9753 12.9391 21.9082 13.3259 22.6115 14.0271C23.3149 14.7305 23.7017 15.6634 23.7017 16.6579C23.7017 17.6502 23.3149 18.5831 22.6115 19.2865ZM16.9824 8.5C10.822 8.5 5.82617 13.4959 5.82617 19.6562C5.82617 25.8187 10.822 30.8125 16.9824 30.8125C23.1428 30.8125 28.1387 25.8187 28.1387 19.6562C28.1387 13.4959 23.1428 8.5 16.9824 8.5Z" fill="white"/><path d="M20.7012 6.37109H13.2637C12.3839 6.37109 11.6699 5.65709 11.6699 4.77734C11.6699 3.89759 12.3839 3.18359 13.2637 3.18359H20.7012C21.5809 3.18359 22.2949 3.89759 22.2949 4.77734C22.2949 5.65709 21.5809 6.37109 20.7012 6.37109Z" fill="#D28BE7"/><path d="M21.1086 17.7841L18.1081 20.7846C17.4876 21.4051 16.4783 21.4051 15.8556 20.7846C15.233 20.162 15.233 19.1526 15.8556 18.53L18.854 15.5295C19.4766 14.9069 20.486 14.9069 21.1086 15.5295C21.7313 16.1521 21.7313 17.1615 21.1086 17.7841Z" fill="#D28BE7"/></g></g><defs><clipPath id="clip0_2129_39042"><rect width="34" height="34" fill="white"/></clipPath></defs></svg>
              </div>
              <div className="relative z-10 text-left">
                <span className="block text-3xl font-black text-white leading-none">17M 10S</span>
                <span className="block text-[11px] font-bold text-purple-100/90 tracking-tight mt-1.5">Avg. time to the first cashout</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-r from-[#9c3fe4] to-[#6d1cb0] border border-[#a855f7]/30 rounded-2xl p-6 flex items-center gap-4.5 shadow-[0_4px_25px_rgba(139,92,246,0.25)] relative overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left">
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%)', pointerEvents: 'none' }} />
              <div className="relative z-10 shrink-0">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.3139 4.49862C28.0606 6.24538 28.0606 9.078 26.3139 10.8248C24.2292 12.9094 17 13.8125 17 13.8125C17 13.8125 17.9031 6.58325 19.9877 4.49862C21.7345 2.75187 24.5671 2.75187 26.3139 4.49862Z" fill="white"/><path d="M14.0112 4.49863C16.0958 6.58325 16.9989 13.8125 16.9989 13.8125C16.9989 13.8125 9.76969 12.9094 7.68506 10.8248C5.93831 9.078 5.93831 6.24538 7.68506 4.49863C9.43181 2.75188 12.2644 2.75188 14.0112 4.49863Z" fill="#D28BE7"/><path d="M15.9375 15.9375H5.84375C4.3775 15.9375 3.1875 17.1275 3.1875 18.5938V28.1562C3.1875 29.6225 4.3775 30.8125 5.84375 30.8125H15.9375V15.9375Z" fill="white"/><path d="M28.1563 15.9375H18.0625V30.8125H28.1563C29.6225 30.8125 30.8125 29.6225 30.8125 28.1562V18.5938C30.8125 17.1275 29.6225 15.9375 28.1563 15.9375Z" fill="#D28BE7"/></svg>
              </div>
              <div className="relative z-10 text-left">
                <span className="block text-3xl font-black text-white leading-none">{stats.offersCompleted.toLocaleString()}</span>
                <span className="block text-[11px] font-bold text-purple-100/90 tracking-tight mt-1.5">Finished offers in total</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="howto" className="py-20 border-b border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            
            {/* Steps Column */}
            <div className="flex flex-col gap-6 text-center w-full">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Here's how</h2>
              </div>

              {/* Exact copy-paste of SvelteKit timeline structure centered */}
              <div className="flex gap-6 items-start mt-2 text-left w-full">
                <img 
                  src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='28'%20height='352'%20fill='none'%3e%3crect%20width='324'%20height='6'%20x='17'%20y='14'%20fill='%23181B22'%20rx='3'%20transform='rotate(90%2017%2014)'/%3e%3crect%20width='26'%20height='26'%20x='27'%20y='217'%20fill='%23101012'%20stroke='%23586177'%20stroke-width='2'%20rx='13'%20transform='rotate(90%2027%20217)'/%3e%3crect%20width='26'%20height='26'%20x='27'%20y='325'%20fill='%23101012'%20stroke='%23586177'%20stroke-width='2'%20rx='13'%20transform='rotate(90%2027%20325)'/%3e%3crect%20width='156'%20height='28'%20y='156'%20fill='%231a7f37'%20rx='14'%20transform='rotate(-90%200%20156)'/%3e%3crect%20width='28'%20height='28'%20fill='%231a7f37'%20rx='14'/%3e%3cpath%20fill='%23255116'%20d='m20.533%2011.031-8%208a.751.751%200%200%201-1.063%200l-3.5-3.5a.752.752%200%200%201%201.063-1.062l2.969%202.97%207.47-7.469a.751.751%200%201%201%201.062%201.063z'/%3e%3crect%20width='28'%20height='28'%20y='108'%20fill='%231a7f37'%20rx='14'/%3e%3cpath%20fill='%23255116'%20d='m20.533%20119.031-8%208a.753.753%200%200%201-.82.164.752.752%200%200%201-.243-.164l-3.5-3.5a.742.742%200%200%201-.22-.531.747.747%200%200%201%20.464-.694.747.747%200%200%201%20.819.163l2.969%202.969%207.47-7.468a.75.75%200%201%201%201.062%201.063z'/%3e%3c/svg%3e" 
                  alt="timeline" 
                  className="h-[352px] w-[28px] shrink-0" 
                />
                <div className="h-[352px] flex flex-col justify-between py-1 text-left flex-1">
                  <div>
                    <h4 className="text-[17px] font-black text-[#13b257] tracking-tight">Select offer to complete</h4>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-black text-[#13b257] tracking-tight">Complete the offer</h4>
                    <p className="text-xs font-semibold text-zinc-400 mt-1 max-w-[340px] leading-relaxed">
                      Offer can have one or multiple tasks, usually it takes a few minutes
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-black text-[#586177] tracking-tight">Collect balance</h4>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-black text-[#586177] tracking-tight">Cashout desired things</h4>
                  </div>
                </div>
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
            
            {/* 3D Orbiting Carousel Column */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1 select-none overflow-visible w-full py-10">
              <div 
                className="relative overflow-visible"
                style={{
                  width: '210px',
                  height: '260px',
                  perspective: '800px',
                }}
              >
                <div 
                  className="relative w-full h-full transition-transform duration-1000 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${carouselIndex * -120}deg)`,
                  }}
                >
                  
                  {/* Slide 0: Different Tournaments */}
                  <div 
                    className="absolute inset-0 transition-all duration-700 ease-in-out flex justify-center items-center"
                    style={{
                      transform: 'rotateY(0deg) translateZ(95px)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      filter: (carouselIndex % 3) === 0 ? 'none' : 'brightness(0.65)',
                      opacity: (carouselIndex % 3) === 0 ? 1 : 0.85,
                      scale: (carouselIndex % 3) === 0 ? '1' : '0.65',
                    }}
                  >
                    <img 
                      src="/offerwall/carus_diff.png" 
                      alt="Different Tournaments" 
                      className="w-full h-auto object-contain rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.7)]" 
                    />
                  </div>

                  {/* Slide 1: 7 Day Streaks */}
                  <div 
                    className="absolute inset-0 transition-all duration-700 ease-in-out flex justify-center items-center"
                    style={{
                      transform: 'rotateY(120deg) translateZ(95px)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      filter: (carouselIndex % 3) === 1 ? 'none' : 'brightness(0.65)',
                      opacity: (carouselIndex % 3) === 1 ? 1 : 0.85,
                      scale: (carouselIndex % 3) === 1 ? '1' : '0.65',
                    }}
                  >
                    <img 
                      src="/offerwall/carus_days.png" 
                      alt="7 Day Streaks" 
                      className="w-full h-auto object-contain rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.7)]" 
                    />
                  </div>

                  {/* Slide 2: Weekly Payouts / Tournaments Table */}
                  <div 
                    className="absolute inset-0 transition-all duration-700 ease-in-out flex justify-center items-center"
                    style={{
                      transform: 'rotateY(240deg) translateZ(95px)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      filter: (carouselIndex % 3) === 2 ? 'none' : 'brightness(0.65)',
                      opacity: (carouselIndex % 3) === 2 ? 1 : 0.85,
                      scale: (carouselIndex % 3) === 2 ? '1' : '0.65',
                    }}
                  >
                    <img 
                      src="/offerwall/carus_tour.png" 
                      alt="Tournaments Payouts" 
                      className="w-full h-auto object-contain rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.7)]" 
                    />
                  </div>

                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
              <h3 className="text-3xl font-extrabold text-white leading-tight"><span className="text-[#bf5aff]">Tournament</span> Rewards and Beyond</h3>
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
              <h3 className="text-3xl font-extrabold text-white leading-tight">Exclusive <span className="text-[#bf5aff]">VIP</span> Benefits</h3>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-y-12 gap-x-6 mt-12 select-none overflow-visible w-full">
                
                {/* Card 1 - Daily Reward Spin */}
                <div 
                  className="relative w-[340px] h-[135px] rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] p-5 flex items-end overflow-visible hover:scale-[1.03] transition-transform duration-300 cursor-pointer group shrink-0"
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent rounded-b-2xl pointer-events-none z-0" />
                  <img 
                    src="/offerwall/rulot_new.png" 
                    alt="spin wheel" 
                    className="absolute top-[-38px] left-1/2 -translate-x-1/2 h-[100px] w-auto object-contain z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] group-hover:rotate-[15deg] transition-transform duration-500" 
                  />
                  <div className="flex items-center gap-4.5 w-full relative z-10">
                    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0d0e12]/60 border border-[#bf5aff]/30 shadow-inner" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                      <Crown className="h-5.5 w-5.5 text-white relative z-10" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider leading-none">Daily Reward Spin</h4>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Exclusive Tournaments */}
                <div 
                  className="relative w-[340px] h-[135px] rounded-2xl bg-gradient-to-r from-[#ea580c] to-[#f43f5e] p-5 flex items-end overflow-visible hover:scale-[1.03] transition-transform duration-300 cursor-pointer group shrink-0"
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent rounded-b-2xl pointer-events-none z-0" />
                  <img 
                    src="/offerwall/cup.avif" 
                    alt="cup" 
                    className="absolute top-[-44px] left-1/2 -translate-x-1/2 h-[110px] w-auto object-contain z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="flex items-center gap-4.5 w-full relative z-10">
                    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0d0e12]/60 border border-[#bf5aff]/30 shadow-inner" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                      <Trophy className="h-5.5 w-5.5 text-white relative z-10" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider leading-none">Exclusive Tournaments</h4>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Exclusive Earning Boosts */}
                <div 
                  className="relative w-[340px] h-[135px] rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#db2777] p-5 flex items-end overflow-visible hover:scale-[1.03] transition-transform duration-300 cursor-pointer group shrink-0"
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent rounded-b-2xl pointer-events-none z-0" />
                  <img 
                    src="/offerwall/lightning.avif" 
                    alt="lightning" 
                    className="absolute top-[-38px] left-1/2 -translate-x-1/2 h-[100px] w-auto object-contain z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] group-hover:-translate-y-1 transition-transform duration-350" 
                  />
                  <div className="flex items-center gap-4.5 w-full relative z-10">
                    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0d0e12]/60 border border-[#bf5aff]/30 shadow-inner" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                      <Zap className="h-5.5 w-5.5 text-white relative z-10" fill="white" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider leading-none">Exclusive Earning Boosts</h4>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Bonuses on Earnings */}
                <div 
                  className="relative w-[340px] h-[135px] rounded-2xl bg-gradient-to-r from-[#0d9488] to-[#475569] p-5 flex items-end overflow-visible hover:scale-[1.03] transition-transform duration-300 cursor-pointer group shrink-0"
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent rounded-b-2xl pointer-events-none z-0" />
                  <img 
                    src="/offerwall/box.avif" 
                    alt="gift box" 
                    className="absolute top-[-38px] left-1/2 -translate-x-1/2 h-[100px] w-auto object-contain z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="flex items-center gap-4.5 w-full relative z-10">
                    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0d0e12]/60 border border-[#bf5aff]/30 shadow-inner" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                      <Gift className="h-5.5 w-5.5 text-white relative z-10" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider leading-none">Bonuses on Earnings</h4>
                    </div>
                  </div>
                </div>

                {/* Card 5 - Raffle Tickets */}
                <div 
                  className="relative w-[340px] h-[135px] rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#0f766e] p-5 flex items-end overflow-visible hover:scale-[1.03] transition-transform duration-300 cursor-pointer group shrink-0"
                  style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent rounded-b-2xl pointer-events-none z-0" />
                  <img 
                    src="/offerwall/ticket.avif" 
                    alt="ticket" 
                    className="absolute top-[-30px] left-1/2 -translate-x-1/2 h-[80px] w-auto object-contain z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] group-hover:rotate-[-5deg] transition-transform duration-300" 
                  />
                  <div className="flex items-center gap-4.5 w-full relative z-10">
                    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0d0e12]/60 border border-[#bf5aff]/30 shadow-inner" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                      <Ticket className="h-5.5 w-5.5 text-white relative z-10" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[14px] font-black text-white uppercase tracking-wider leading-none">Raffle Tickets</h4>
                    </div>
                  </div>
                </div>

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
