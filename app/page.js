'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import DirectTasksSection from '@/components/DirectTasksSection';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, CheckCircle, Zap, Gift, Clock, User, Mail, Lock, Loader2 } from 'lucide-react';

const ACTIVITY_NAMES = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava',
  'Benjamin', 'Sophia', 'Lucas', 'Isabella', 'Henry', 'Mia', 'Alexander', 'Evelyn', 'Mason', 'Harper',
  'Michael', 'Camila', 'Ethan', 'Gianna', 'Daniel', 'Abigail', 'Jacob', 'Luna', 'Logan', 'Ella',
  'Jackson', 'Elizabeth', 'Levi', 'Sofia', 'Sebastian', 'Avery', 'Jack', 'Scarlett', 'Owen', 'Emily'
];

const ACTIVITY_OFFERS = [
  'Coin Master', 'Survey (CPX)', 'Monopoly GO', 'Brawl Stars', 'RAID Shadow Legends', 'TikTok Install', 'Gardenscapes'
];

const ACTIVITY_COINS = [480, 800, 1200, 2400, 3200, 4800, 5600, 7200, 9600, 12000];

const SUPPORTED_METHODS = [
  { name: 'PayPal', icon: '💳', color: 'from-[#003087] to-[#0079C1]' },
  { name: 'Bitcoin', icon: '₿', color: 'from-[#F7931A] to-[#FFAB40]' },
  { name: 'Amazon', icon: '📦', color: 'from-[#191E26] to-[#232F3E]' },
  { name: 'Robux', icon: '🟢', color: 'from-[#00b06f] to-[#00e699]' },
  { name: 'Steam', icon: '🎮', color: 'from-[#171a21] to-[#2a475e]' },
  { name: 'Visa', icon: '💳', color: 'from-[#0057A0] to-[#1A1F71]' },
  { name: 'Ethereum', icon: '⟠', color: 'from-[#3C3C3D] to-[#62688F]' },
  { name: 'Litecoin', icon: 'Ł', color: 'from-[#345D9D] to-[#4E5B70]' },
];

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
              <span style={{ color: '#4f8ef7', fontWeight: 800 }}>+{item.coins} Gems</span> on <em>{item.offer}</em>
            </span>
          </div>
        ))}
      </div>
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
    <div className="w-full rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-2xl min-h-[385px] relative">
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
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
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
                className="w-full rounded-xl bg-[#070709] border border-dark-border py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
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
                className="w-full rounded-xl bg-[#070709] border border-dark-border py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
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
                className="w-full rounded-xl bg-[#070709] border border-dark-border py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gaming w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase mt-5 tracking-wide shadow-md active:scale-[0.98] transition-transform"
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
  const [stats, setStats] = useState({ usersOnline: 1489, totalPaid: 84931.20, offersCompleted: 129432 });
  const [typewriterText, setTypewriterText] = useState('playing games');

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(prev => ({
        usersOnline: Math.max(1200, prev.usersOnline + Math.floor(Math.random() * 5) - 2),
        totalPaid: prev.totalPaid + 0.18,
        offersCompleted: prev.offersCompleted + 1,
      }));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const words = ['playing games', 'testing apps', 'doing surveys', 'sharing links'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timerId = null;

    const tick = () => {
      const currentWord = words[wordIndex];
      let delay = isDeleting ? 40 : 100;

      if (!isDeleting) {
        setTypewriterText(currentWord.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          delay = 2000;
        }
      } else {
        setTypewriterText(currentWord.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 500;
        }
      }

      timerId = setTimeout(tick, delay);
    };

    timerId = setTimeout(tick, 500);
    return () => clearTimeout(timerId);
  }, []);

  const openRegister = () => { setAuthTab('register'); setIsAuthOpen(true); };

  const heroImageAnimation = {
    animation: 'gemFloat 6s ease-in-out infinite',
    filter: 'drop-shadow(0 0 60px rgba(79,142,247,0.45))',
    objectFit: 'contain'
  };

  return (
    <div className="page-home" style={{ minHeight: '100vh', background: '#0a0a0c' }}>
      
      {/* Live Activity Feed */}
      <div className="activity-banner-wrap" style={{ display: 'flex', alignItems: 'center', background: 'rgba(15,15,18,0.7)', borderBottom: '1px solid #1a1a22', height: 44 }}>
        <span className="activity-label" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 10, fontWeight: 900, color: '#4f8ef7', borderRight: '1px solid #1a1a22', height: '100%' }}>
          <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#48f78a', animation: 'pulseDot 1.5s infinite' }} />
          LIVE
        </span>
        <LiveTicker />
      </div>

      {/* Hero section */}
      <section className="hero-section py-12 md:py-20 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(79,142,247,0.1) 0%, transparent 70%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className={`${user ? 'lg:col-span-8 lg:col-start-2 text-center' : 'lg:col-span-7'} flex flex-col gap-6 text-left`}>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-[#121217] border border-[#22222a] rounded-full px-4 py-1.5 text-xs font-black text-[#4f8ef7] w-fit shadow-[0_0_15px_rgba(79,142,247,0.08)]">
                <Star className="h-4 w-4 fill-primary text-primary" />
                Trust rating 4.9 • 12,492 positive reviews
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight leading-[1.05] text-white">
                Earn Free Cash, <br />
                <span className="hero-title-gradient">{typewriterText}</span>
                <span className="text-primary font-light animate-pulse ml-1 select-none">|</span>
              </h1>

              <p className="text-zinc-400 text-base max-w-lg leading-relaxed">
                Complete simple tasks, play games, and take surveys to earn Gems. Redeem them instantly for PayPal, Bitcoin, Robux, and Gift Cards.
              </p>

              {user ? (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
                  <Link href="/earn" className="btn-gaming rounded-xl px-10 py-4 text-sm flex items-center gap-2">
                    Go to Earn Center <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/cashout" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm">
                    Redeem Rewards
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
                  <button onClick={openRegister} className="btn-gaming rounded-xl px-10 py-4 text-sm flex items-center gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link href="/offerwall" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm">
                    Browse Offerwall
                  </Link>
                </div>
              )}

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-6 bg-[#0e0e12] border border-[#1a1a24] rounded-2xl p-5 mt-4 max-w-md">
                <div className="text-center">
                  <div className="text-white font-black text-lg sm:text-xl">{stats.usersOnline}</div>
                  <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Online</div>
                </div>
                <div className="text-center border-x border-[#1a1a24]">
                  <div className="text-[#4f8ef7] font-black text-lg sm:text-xl">${stats.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Paid Out</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-lg sm:text-xl">{(stats.offersCompleted).toLocaleString()}</div>
                  <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Offers</div>
                </div>
              </div>
            </div>

            {/* Right Image/Form Column */}
            {!user ? (
              <div className="lg:col-span-5 flex justify-center w-full">
                <HeroRegisterForm />
              </div>
            ) : (
              <div className="lg:col-span-4 flex justify-center items-center">
                <img src="/offerwall/gem.jpg" alt="Glowing Gem" className="w-64 h-64 select-none" style={heroImageAnimation} />
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Supported Cashouts Grid */}
      <section className="py-12 border-t border-[#121217]" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Supported Redemption Methods</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {SUPPORTED_METHODS.map((method) => (
              <div 
                key={method.name} 
                className="bg-[#0f0f12] border border-[#1a1a22] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-primary/45 hover:scale-105 shadow-lg group"
                onClick={() => window.open('/cashout', '_self')}
              >
                <span className="text-2xl mb-1.5 transition-transform duration-300 group-hover:scale-110">{method.icon}</span>
                <span className="text-[11px] font-extrabold text-zinc-400 group-hover:text-white transition-colors">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banners Grid */}
      <section className="py-8" style={{ background: '#0a0a0c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/earn" className="banner-card rounded-2xl overflow-hidden border border-[#1a1a22] shadow-xl hover:border-primary/40 block relative group h-44">
              <img src="/earn_banner.png" alt="Earn Money" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </Link>
            <Link href="/referrals" className="banner-card rounded-2xl overflow-hidden border border-[#1a1a22] shadow-xl hover:border-primary/40 block relative group h-44">
              <img src="/affiliates_banner.jpg" alt="Affiliates" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </Link>
            <Link href="/cashout" className="banner-card rounded-2xl overflow-hidden border border-[#1a1a22] shadow-xl hover:border-primary/40 block relative group h-44">
              <img src="/rewards_banner.png" alt="Rewards" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </Link>
          </div>
        </div>
      </section>

      {/* Logged in Direct Offers */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex flex-col">
          <div className="border-t border-[#1a1a24] pt-10 mt-6 w-full">
            <DirectTasksSection />
          </div>
        </section>
      )}

      {/* Landing Page Content */}
      {!user && (
        <>
          {/* How it Works */}
          <section className="py-16 border-t border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mb-12">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Earning Cash is <span className="text-gradient">This Simple</span></h2>
                <p className="text-sm text-zinc-400 mt-2">Get paid in three easy steps — completely free to join</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { num: '01', title: 'Create Account', desc: 'Sign up in 15 seconds. Unlock unlimited offers and active support instantly.' },
                  { num: '02', title: 'Complete Offers', desc: 'Play mobile games, test applications, and answer quick surveys.' },
                  { num: '03', title: 'Withdraw Coins', desc: 'Redeem coins directly to PayPal cash, crypto, or popular gaming cards.' },
                ].map((step, idx) => (
                  <div key={step.num} className="bg-[#0f0f12] border border-[#1a1a22] rounded-2xl p-8 text-left relative overflow-hidden transition-all hover:border-primary/45 hover:-translate-y-1 shadow-xl">
                    <span className="text-5xl font-black text-zinc-800/40 absolute top-4 right-6">{step.num}</span>
                    <div className="w-10 h-10 rounded-lg bg-[#4f8ef7]/10 flex items-center justify-center text-[#4f8ef7] font-black mb-6">
                      {idx === 0 ? '👤' : idx === 1 ? '💎' : '💸'}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 border-t border-[#1a1a22]" style={{ background: '#0a0a0c' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Many Ways to Earn, <br /><span className="text-gradient">Choose What You Love</span></h2>
                  <p className="text-sm text-zinc-450 mt-4 leading-relaxed">
                    We payout up to 85% of advertiser rewards directly to our users. Join over 100,000 active earners today and cashout in minutes.
                  </p>
                  <div className="mt-8 space-y-4">
                    {['Highest Payout Rates on the market', 'Low withdrawal minimums (from $1.00)', '24/7 fast support and instant payouts'].map((t) => (
                      <div key={t} className="flex items-center gap-3 text-sm font-semibold text-white">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { stars: 5, text: "I earned $20 on my first day simply by installing 2 games. Cashout to Litecoin was processed in under 2 hours!", name: "John D. — United States" },
                    { stars: 5, text: "RewardCash has the cleanest dashboard I've seen on any GPT site. Coins credit instantly. Highly recommended.", name: "Mehdi K. — Morocco" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#0f0f12] border border-[#1a1a22] rounded-2xl p-6 shadow-xl">
                      <div className="flex gap-1 mb-3">
                        {[...Array(item.stars)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                      </div>
                      <p className="text-xs text-zinc-350 leading-relaxed font-medium mb-3">{item.text}</p>
                      <span className="text-[11px] font-bold text-zinc-450">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
