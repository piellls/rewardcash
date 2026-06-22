'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, Flame, CheckCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [liveFeed, setLiveFeed] = useState([]);
  
  // Fake ticker states
  const [stats, setStats] = useState({
    usersOnline: 1248,
    totalPaid: 45892.40,
    offersCompleted: 89431
  });

  useEffect(() => {
    // Initial live feed
    setLiveFeed(db.getLiveFeed());

    // Live feed simulator
    const feedInterval = setInterval(() => {
      const randomNames = ['Amine', 'Sarah', 'Youssef', 'Mehdi', 'Anass', 'Sofia', 'Fatima', 'Omar', 'Karim', 'Lina'];
      const randomOffers = ['Board Kings', 'Opinion World Survey', 'Lords Mobile', 'TikTok Install', 'Crypto.com App', 'SayMore Surveys'];
      const randomCoins = [500, 1200, 1500, 4500, 6500, 8000];
      const randomProviders = ['CPALead', 'AdGate Media', 'Lootably'];

      const newCompletion = {
        id: `c_${Math.random()}`,
        username: randomNames[Math.floor(Math.random() * randomNames.length)],
        offer_title: randomOffers[Math.floor(Math.random() * randomOffers.length)],
        provider: randomProviders[Math.floor(Math.random() * randomProviders.length)],
        coins: randomCoins[Math.floor(Math.random() * randomCoins.length)],
        completed_at: new Date().toISOString()
      };

      setLiveFeed(prev => [newCompletion, ...prev.slice(0, 5)]);
      
      // Slightly increment stats
      setStats(prev => ({
        usersOnline: prev.usersOnline + Math.floor(Math.random() * 5) - 2,
        totalPaid: prev.totalPaid + (newCompletion.coins / 1000),
        offersCompleted: prev.offersCompleted + 1
      }));
    }, 4500);

    return () => clearInterval(feedInterval);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-dark-border">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary/15 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary tracking-wide uppercase">
                <Flame className="h-4 w-4 animate-bounce" />
                Get Paid for Your Time
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white">
                Earn Free Coins & Cashout <span className="text-gradient">Instant Rewards</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                Join the fastest growing rewards platform. Complete simple tasks, play game levels, fill out surveys, and withdraw your earnings directly to PayPal or Crypto.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/earn"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-black hover:opacity-90 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all"
                >
                  Start Earning Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/cashout"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-zinc-900/50 hover:bg-zinc-900/80 hover:text-white px-8 py-4 text-base font-bold text-zinc-300 transition-colors"
                >
                  View Payout Methods
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verified Tasks
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.8/5 Trust Score
                </div>
              </div>
            </div>

            {/* Right Widget: Live Feed & Stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Online</span>
                  <span className="text-lg font-black text-white">{stats.usersOnline.toLocaleString()}</span>
                </div>
                <div className="rounded-xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Paid Out</span>
                  <span className="text-lg font-black text-primary">${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="rounded-xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Completed</span>
                  <span className="text-lg font-black text-secondary">{stats.offersCompleted.toLocaleString()}</span>
                </div>
              </div>

              {/* Live Ticker Box */}
              <div className="rounded-2xl glass-card border border-dark-border p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Activity Ticker
                  </h3>
                  <span className="text-xs font-bold text-zinc-500 uppercase">Updates Live</span>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-hidden">
                  {liveFeed.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3 border border-dark-border/40 animate-pulse-slow"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-full bg-zinc-900 border border-dark-border p-1.5 text-zinc-400">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">
                            {item.username} <span className="font-medium text-zinc-500">completed</span>
                          </p>
                          <p className="text-xs font-semibold text-zinc-200">
                            {item.offer_title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 px-2 py-1 text-xs font-bold text-primary">
                        <Coins className="h-3.5 w-3.5 text-yellow-500" />
                        +{item.coins}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-b border-dark-border">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-black text-white">
            Earning Cash Has Never Been <span className="text-gradient">This Simple</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Get started in less than 3 minutes. Follow three basic steps to convert your free time into rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative rounded-2xl glass-card border border-dark-border p-6 hover:border-primary/20 transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/40">01</div>
            <div className="rounded-xl bg-zinc-900 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-115 transition-transform">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">Create Account</h3>
            <p className="text-sm text-zinc-400">
              Sign up with your email username in under 15 seconds. Instantly unlock all offers and daily bonuses.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl glass-card border border-dark-border p-6 hover:border-primary/20 transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/40">02</div>
            <div className="rounded-xl bg-zinc-900 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-115 transition-transform">
              <Coins className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">Complete Offers</h3>
            <p className="text-sm text-zinc-400">
              Select tasks like playing a game level, taking surveys, or downloading apps. Verify your submission instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl glass-card border border-dark-border p-6 hover:border-primary/20 transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/40">03</div>
            <div className="rounded-xl bg-zinc-900 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-115 transition-transform">
              <Wallet className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">Get Paid</h3>
            <p className="text-sm text-zinc-400">
              Redeem your coins for PayPal money, LTC, BTC, or gift cards. Payments are verified and sent within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-b border-dark-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white">
              Why Users Choose <span className="text-gradient">RewardCash</span>
            </h2>
            <p className="text-zinc-400">
              We offer some of the highest payout percentages in the industry by keeping our operational margins extremely low. Your success is our success.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">High Payout Rates</h4>
                  <p className="text-xs text-zinc-400">We pay out up to 85% of what advertisers pay us directly to you.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">Low Withdrawal Minimums</h4>
                  <p className="text-xs text-zinc-400">Withdraw your cash once you reach only $1.00 USD (1000 coins).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">24/7 Dedicated Support</h4>
                  <p className="text-xs text-zinc-400">Our team checks and processes payout requests around the clock.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            <div className="rounded-2xl glass-card border border-dark-border p-5 relative">
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-500" />)}
              </div>
              <p className="text-sm italic text-zinc-300 mb-4">
                "I earned $20 on my first day simply by installing 2 games and playing them during my train commute. Cashout to Litecoin was processed in under 2 hours!"
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">JD</div>
                <span className="text-xs font-bold text-zinc-400">John D. - United States</span>
              </div>
            </div>
            
            <div className="rounded-2xl glass-card border border-dark-border p-5 relative">
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-500" />)}
              </div>
              <p className="text-sm italic text-zinc-300 mb-4">
                "RewardCash has the cleanest dashboard I've seen on any GPT site. No annoying popup ads and the coins actually credit instantly. Highly recommended."
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">MK</div>
                <span className="text-xs font-bold text-zinc-400">Mehdi K. - Morocco</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-10 pointer-events-none">
          <div className="w-[300px] h-[300px] rounded-full bg-primary" />
          <div className="w-[300px] h-[300px] rounded-full bg-secondary" />
        </div>

        <div className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Start Earning?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Create a free account today. Start completing offers and get your first payout within hours.
          </p>
          <div className="pt-2">
            <Link
              href="/earn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-base font-bold text-black hover:opacity-90 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98] transition-all"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
