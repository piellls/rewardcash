'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, Flame, CheckCircle, Zap, Gift, TrendingUp, Clock, User, Mail, Lock, Loader2 } from 'lucide-react';

/* ─────────────────────────────────────────────
   Live Activity Ticker (earnlab style)
───────────────────────────────────────────── */
const ACTIVITY_NAMES = ['Amine', 'Sarah', 'Youssef', 'Mehdi', 'Anass', 'Sofia', 'Fatima', 'Omar', 'Karim', 'Lina', 'Reda', 'Nora', 'Hassan', 'Zineb', 'Bilal', 'Imane'];
const ACTIVITY_OFFERS = ['Cooking Blast 3D', 'Market Research (CPX)', 'PrimeSurveys', 'Aviator Spin', 'GemezZ Kids', 'Tap Rewards', 'Survey #482', 'App Install Bonus'];
const ACTIVITY_COINS  = [320, 500, 980, 1200, 1500, 1995, 2200, 4500];

function LiveTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const generate = () => ({
      id: Math.random(),
      username: ACTIVITY_NAMES[Math.floor(Math.random() * ACTIVITY_NAMES.length)],
      offer: ACTIVITY_OFFERS[Math.floor(Math.random() * ACTIVITY_OFFERS.length)],
      coins: ACTIVITY_COINS[Math.floor(Math.random() * ACTIVITY_COINS.length)],
    });

    // Seed initial items
    setItems([generate(), generate(), generate(), generate()]);

    const iv = setInterval(() => {
      setItems(prev => [generate(), ...prev.slice(0, 6)]);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="live-ticker-bar">
      <div className="live-ticker-inner">
        {[...items, ...items].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="live-ticker-item">
            <div className="live-ticker-avatar">
              {item.username.substring(0, 2).toUpperCase()}
            </div>
            <span className="live-ticker-text">
              <strong>{item.username}</strong> earned
              <span className="live-ticker-coins">
                <Coins className="inline h-3 w-3 mr-0.5" />
                +{item.coins}
              </span>
              on <em>{item.offer}</em>
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
    <div className="w-full rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-xl min-h-[385px] relative">
      <div>
        <h3 className="text-lg font-black text-zinc-950 tracking-tight">Sign up for free</h3>
        <p className="text-[11px] text-zinc-500 mt-1 mb-4 leading-relaxed">
          Earn up to <strong className="text-primary font-bold">$50 daily</strong> — join thousands earning now
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/10 border border-red-900/20 p-3 text-xs text-red-650">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                required
                placeholder="choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gaming w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase mt-5 tracking-wide shadow-md active:scale-[0.98] transition-transform"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Free Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab]       = useState('login');
  const [stats, setStats]           = useState({ usersOnline: 1489, totalPaid: 84931.20, offersCompleted: 129432 });
  const [typewriterText, setTypewriterText] = useState('playing games');

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(prev => ({
        usersOnline:      Math.max(1200, prev.usersOnline + Math.floor(Math.random() * 5) - 2),
        totalPaid:        prev.totalPaid + 0.18,
        offersCompleted:  prev.offersCompleted + 1,
      }));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const words = ['playing games', 'testing apps', 'doing surveys', 'sharing links'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % words.length;
      setTypewriterText(words[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const openRegister = () => { setAuthTab('register'); setIsAuthOpen(true); };

  return (
    <div className="page-home">

      {/* ── Live Activity Banner ── */}
      <div className="activity-banner-wrap">
        <span className="activity-label">
          <span className="live-dot" /> LIVE
        </span>
        <LiveTicker />
      </div>

      {/* ── Hero ── */}
      <section className="hero-section py-12 md:py-20 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="hero-glow-left"  />
        <div className="hero-glow-right" />
        {/* Grid overlay */}
        <div className="hero-grid" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Badge (109 offers live right now) */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary shadow-[0_0_15px_rgba(93,95,239,0.07)]">
              <span className="h-2 w-2 rounded-full bg-primary inline-block animate-pulse" />
              109 offers live right now
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
            {/* Left Column - Intro and Cards (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-zinc-950">
                Get paid now for <br />
                <span className="hero-title-gradient">{typewriterText}</span>
              </h1>
              
              {/* 3 mini badges */}
              <div className="flex flex-wrap gap-2.5 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-dark-border text-[11px] font-bold text-white shadow-sm">
                  💰 Earn up to <strong className="text-primary font-black">$60.00</strong> per offer
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-dark-border text-[11px] font-bold text-white shadow-sm">
                  ⚡ Cashout in <strong className="text-secondary font-black">minutes</strong>
                </span>
              </div>

              {/* 3 Game Offer Cards (Horizontal grid) */}
              <div className="grid grid-cols-3 gap-3.5 mt-4">
                {[
                  { name: 'Monopoly Go!', desc: 'Complete & earn big', payout: '$46.97', img: '/banners/adbluemedia.png' },
                  { name: 'Smash Party', desc: 'Fun & rewarding', payout: '$8.05', img: '/banners/cpalead.png' },
                  { name: 'Merge Blast', desc: 'Quick earnings', payout: '$14.91', img: '/banners/lootably.png' },
                ].map((card, i) => (
                  <div key={i} className="rounded-2xl border border-dark-border bg-dark-card p-3 relative overflow-hidden flex flex-col justify-between h-[180px] shadow-sm hover:border-primary/20 transition-all group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                    <img src={card.img} alt={card.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Payout top-left */}
                    <div className="absolute top-2.5 left-2.5 z-20 bg-primary px-2 py-0.5 rounded shadow text-[9px] font-black text-white">
                      {card.payout}
                    </div>
                    
                    <div className="mt-auto relative z-20">
                      <h4 className="text-[10px] font-black text-white leading-tight">{card.name}</h4>
                      <p className="text-[8px] text-zinc-300 mt-0.5 leading-none">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Registration Form (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {!user ? (
                <HeroRegisterForm />
              ) : (
                <div className="w-full rounded-2xl border border-dark-border bg-dark-card p-8 flex flex-col items-center justify-center text-center shadow-xl min-h-[385px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="inline-flex rounded-full bg-primary/10 border border-primary/20 p-4 text-primary mb-4 shadow-[0_0_15px_rgba(93,95,239,0.15)] animate-pulse-slow">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-950 mb-2">Welcome Back!</h3>
                  <p className="text-xs text-zinc-500 mb-6 max-w-xs leading-relaxed">
                    You are signed in as <strong className="text-primary font-bold">{user.username}</strong>. Click below to access your dashboard.
                  </p>
                  <Link href="/dashboard" className="btn-gaming rounded-xl px-8 py-3 text-xs font-extrabold hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Banners ── */}
      <section className="banners-section">
        <div className="banners-grid">

          {/* Banner 1 – Earn Money */}
          <Link href="/earn" className="banner-card group">
            <img
              src="https://cdn.earnlab.com/banners/EARNLAB_EARN%20MONEY.png"
              alt="Earn Money"
              className="banner-img"
            />
            <div className="banner-overlay" />
            <div className="banner-label">
              <span className="banner-pill primary">Start Earning</span>
              <h3 className="banner-title group-hover:text-primary">Earn Money</h3>
            </div>
            <div className="banner-arrow">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Banner 2 – Rewards */}
          <Link href="/cashout" className="banner-card group">
            <img
              src="/rewards_banner.png"
              alt="Rewards"
              className="banner-img"
            />
            <div className="banner-overlay" />
            <div className="banner-label">
              <span className="banner-pill secondary">Cashout Store</span>
              <h3 className="banner-title group-hover:text-secondary">Claim Rewards</h3>
            </div>
            <div className="banner-arrow">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Banner 3 – Affiliates */}
          <Link href="/referrals" className="banner-card group">
            <img
              src="/affiliates_banner.jpg"
              alt="Affiliates"
              className="banner-img"
            />
            <div className="banner-overlay" />
            <div className="banner-label">
              <span className="banner-pill primary">Invite & Earn</span>
              <h3 className="banner-title group-hover:text-primary">Affiliates</h3>
            </div>
            <div className="banner-arrow">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="how-section">
        <div className="how-inner">
          <div className="section-header">
            <h2 className="section-title">Earning Cash Has Never Been <span className="text-gradient">This Simple</span></h2>
            <p className="section-sub">Get started in less than 3 minutes — no skills, no experience needed.</p>
          </div>

          <div className="steps-grid">
            {[
              { icon: <Users className="h-5 w-5" />, num: '01', title: 'Create Account', desc: 'Sign up in 15 seconds. Instantly unlock all offers and daily bonuses.' },
              { icon: <Coins className="h-5 w-5" />, num: '02', title: 'Complete Offers',  desc: 'Play games, take surveys, install apps. Coins credit instantly upon completion.' },
              { icon: <Wallet className="h-5 w-5" />, num: '03', title: 'Instant Payout',  desc: 'Redeem for PayPal, crypto or gift cards. Withdrawals from just $1.00.' },
            ].map(({ icon, num, title, desc }) => (
              <div key={num} className="step-card group">
                <div className="step-num">{num}</div>
                <div className="icon-wrapper-primary h-12 w-12 flex mb-4 group-hover:scale-105 transition-transform">
                  {icon}
                </div>
                <h3 className="step-title">{title}</h3>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="why-section">
        <div className="why-inner">
          <div className="why-left">
            <h2 className="section-title">Many Ways to Earn, <br /><span className="text-gradient">Choose What You Love</span></h2>
            <p className="section-sub">We pay out up to 85% of what advertisers pay us — directly to you.</p>
            <ul className="why-list">
              {[
                { title: 'Highest Payout Rates',       desc: 'Up to 85% revenue share with no hidden fees.' },
                { title: 'Low Withdrawal Minimums',    desc: 'Cash out once you reach only $1.00 (1000 coins).' },
                { title: '24/7 Dedicated Support',     desc: 'Our team processes payout requests around the clock.' },
                { title: 'Anti-Fraud Protection',      desc: 'Military-grade security keeps your account and coins safe.' },
              ].map(({ title, desc }) => (
                <li key={title} className="why-item">
                  <div className="icon-wrapper-secondary p-0.5 shrink-0 mt-0.5 border-none">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="why-item-title">{title}</h4>
                    <p className="why-item-desc">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="why-right">
            {/* Testimonials */}
            {[
              { stars: 5, text: '"I earned $20 on my first day simply by installing 2 games. Cashout to Litecoin was processed in under 2 hours!"', user: 'JD', name: 'John D. — United States' },
              { stars: 5, text: '"BlueberryCash has the cleanest dashboard I\'ve seen on any GPT site. Coins credit instantly. Highly recommended."', user: 'MK', name: 'Mehdi K. — Morocco' },
              { stars: 5, text: '"Been using this for 3 months. Already cashed out 6 times. The referral program alone earns me $50/month."', user: 'SR', name: 'Sara R. — Canada' },
            ].map(({ stars, text, user: u, name }, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(stars)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                </div>
                <p className="testimonial-text">{text}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-7 w-7 rounded-full bg-dark-border flex items-center justify-center font-bold text-xs text-white">{u}</div>
                  <span className="text-xs font-semibold text-zinc-400">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="cta-glow-l" /><div className="cta-glow-r" />
        <div className="cta-inner">
          <div className="cta-badge"><Gift className="h-4 w-4" /> Limited Bonus: +500 Coins on Signup</div>
          <h2 className="cta-title">Ready to Start Earning?</h2>
          <p className="cta-sub">Create your free account today and get your first payout within hours.</p>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            {!user ? (
              <button onClick={openRegister} className="btn-gaming rounded-xl px-10 py-4 text-sm flex items-center gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link href="/earn" className="btn-gaming rounded-xl px-10 py-4 text-sm flex items-center gap-2">
                Start Earning Now <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/leaderboard" className="btn-gaming-secondary rounded-xl px-10 py-4 text-sm">
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
