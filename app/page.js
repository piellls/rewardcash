'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, Flame, CheckCircle, Zap, Gift, TrendingUp, Clock } from 'lucide-react';

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

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab]       = useState('login');
  const [stats, setStats]           = useState({ usersOnline: 1489, totalPaid: 84931.20, offersCompleted: 129432 });

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
      <section className="hero-section">
        {/* Ambient glow */}
        <div className="hero-glow-left"  />
        <div className="hero-glow-right" />
        {/* Grid overlay */}
        <div className="hero-grid" />

        <div className="hero-inner">
          {/* Badge */}
          <div className="hero-badge">
            <Flame className="h-3.5 w-3.5" />
            #1 GPT Rewards Platform
          </div>

          {/* Heading */}
          <h1 className="hero-title">
            Complete Tasks.<br />
            <span className="hero-title-gradient">Earn Real Money.</span>
          </h1>

          <p className="hero-subtitle">
            Join <strong>200,000+</strong> users already earning daily. Complete surveys, play games,
            install apps — cash out via PayPal, Crypto, or Gift Cards instantly.
          </p>

          {/* Stats row */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value text-primary">{stats.usersOnline.toLocaleString()}</span>
              <span className="hero-stat-label">Online Now</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value text-secondary">${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="hero-stat-label">Total Paid Out</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value text-white">{stats.offersCompleted.toLocaleString()}</span>
              <span className="hero-stat-label">Tasks Completed</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero-ctas">
            {!user ? (
              <button onClick={openRegister} className="btn-gaming rounded-xl px-8 py-4 text-sm flex items-center gap-2">
                Start Earning Free <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link href="/earn" className="btn-gaming rounded-xl px-8 py-4 text-sm flex items-center gap-2">
                Go to Earn <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/cashout" className="btn-gaming-secondary rounded-xl px-8 py-4 text-sm flex items-center gap-2">
              View Rewards
            </Link>
          </div>

          {/* Trust row */}
          <div className="hero-trust">
            <div className="hero-trust-item"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> No Credit Card</div>
            <div className="hero-trust-item"><Star className="h-3.5 w-3.5 text-primary fill-primary" /> 4.9 / 5 Trustpilot</div>
            <div className="hero-trust-item"><Zap className="h-3.5 w-3.5 text-primary" /> Instant Payouts</div>
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
              src="https://cdn.earnlab.com/banners/EARNLAB_REWARDS.png"
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
              src="https://cdn.earnlab.com/banners/EARNLAB_AFFILIATES.png"
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
              { stars: 5, text: '"RewardCash has the cleanest dashboard I\'ve seen on any GPT site. Coins credit instantly. Highly recommended."', user: 'MK', name: 'Mehdi K. — Morocco' },
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
