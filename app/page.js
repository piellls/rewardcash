'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Trophy, Wallet, ShieldCheck, ArrowRight, Star, Users, Flame, CheckCircle, Smartphone, Gamepad2, Award } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [liveFeed, setLiveFeed] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Stats indicators
  const [stats, setStats] = useState({
    usersOnline: 1489,
    totalPaid: 84931.20,
    offersCompleted: 129432
  });

  useEffect(() => {
    let feedInterval;
    
    const initData = async () => {
      try {
        const [feed, currentStats, board] = await Promise.all([
          db.getLiveFeed(),
          db.getStats(),
          db.getLeaderboard()
        ]);
        setLiveFeed(feed);
        setStats(currentStats);
        
        let names = [];
        if (board && board.length > 0) {
          names = board.map(u => u.username);
        }

        // Live feed simulator using real username source if available
        feedInterval = setInterval(() => {
          const baselineNames = ['Amine', 'Sarah', 'Youssef', 'Mehdi', 'Anass', 'Sofia', 'Fatima', 'Omar', 'Karim', 'Lina'];
          const namesSource = names.length > 0 ? names : baselineNames;
          const randomOffers = ['Cooking Blast 3D', 'Market Research (CPX)', 'PrimeSurveys - Completion', 'Aviator - Spin Now', 'GemezZ - Zuppy Kids', 'Tap Rewards'];
          const randomCoins = [320, 500, 980, 1200, 1500, 1995, 4500];
          const randomProviders = ['AdBlueMedia', 'CPALead', 'Lootably', 'CPX Research'];

          const newCompletion = {
            id: `c_${Math.random()}`,
            username: namesSource[Math.floor(Math.random() * namesSource.length)],
            offer_title: randomOffers[Math.floor(Math.random() * randomOffers.length)],
            provider: randomProviders[Math.floor(Math.random() * randomProviders.length)],
            coins: randomCoins[Math.floor(Math.random() * randomCoins.length)],
            completed_at: new Date().toISOString()
          };

          setLiveFeed(prev => [newCompletion, ...prev.slice(0, 4)]);
          
          setStats(prev => ({
            usersOnline: prev.usersOnline + Math.floor(Math.random() * 5) - 2,
            totalPaid: prev.totalPaid + (newCompletion.coins / 1000),
            offersCompleted: prev.offersCompleted + 1
          }));
        }, 4000);
      } catch (err) {
        console.error('Failed to load dynamic data:', err);
      }
    };

    initData();

    return () => {
      if (feedInterval) clearInterval(feedInterval);
    };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20 border-b border-dark-border">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary tracking-wide uppercase">
                <Flame className="h-4 w-4 text-primary animate-pulse" />
                The #1 GPT Platform
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white">
                Earn Free Coins & Cashout <span className="text-gradient">Real Rewards</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join the fastest-growing rewards platform. Complete simple tasks, play levels on mobile games, take surveys, and instantly redeem your coins for PayPal, crypto, or gift cards.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {!user ? (
                  <button
                    onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary px-8 py-4 text-base font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  >
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <Link
                    href="/earn"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary px-8 py-4 text-base font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  >
                    Start Earning
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  href="/cashout"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-zinc-900/40 hover:bg-zinc-900/70 hover:text-white px-8 py-4 text-base font-bold text-zinc-300 transition-colors"
                >
                  View Payouts
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Instant Verification
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-accent-gold fill-accent-gold" /> 4.9/5 Trustpilot Score
                </div>
              </div>
            </div>

            {/* Right Widget: Live Feed & Stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Online</span>
                  <span className="text-base font-black text-white">{stats.usersOnline.toLocaleString()}</span>
                </div>
                <div className="rounded-2xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Paid Out</span>
                  <span className="text-base font-black text-primary">${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="rounded-2xl glass-card border border-dark-border p-4 text-center">
                  <span className="block text-[10px] font-black text-zinc-550 uppercase tracking-wider mb-1">Tasks Done</span>
                  <span className="text-base font-black text-secondary">{stats.offersCompleted.toLocaleString()}</span>
                </div>
              </div>

              {/* Live Ticker Box */}
              <div className="rounded-3xl glass-card border border-dark-border p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-3 mb-4">
                  <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    Live Activity Ticker
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-550 uppercase">Instant Payouts</span>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-hidden">
                  {liveFeed.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className="flex items-center justify-between rounded-2xl bg-zinc-950/40 p-3 border border-dark-border/40 hover:border-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary/20 to-primary/20 border border-dark-border/60 flex items-center justify-center text-xs font-bold text-primary">
                          {item.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-355">
                            {item.username} <span className="font-semibold text-zinc-550">earned</span>
                          </p>
                          <p className="text-[11px] font-semibold text-zinc-400">
                            {item.offer_title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-primary/5 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                        <Coins className="h-3.5 w-3.5 text-primary" />
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-dark-border">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-black text-white">
            Earning Cash Has Never Been <span className="text-gradient">This Simple</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Get started in less than 3 minutes. Follow three basic steps to convert your free time into rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative rounded-3xl glass-card border border-dark-border p-6 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.05)] transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/20 group-hover:text-primary/20 transition-colors">01</div>
            <div className="rounded-2xl bg-zinc-900/60 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create Account</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Sign up with your email username in under 15 seconds. Instantly unlock all offers and daily bonuses.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-3xl glass-card border border-dark-border p-6 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.05)] transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/20 group-hover:text-secondary/20 transition-colors">02</div>
            <div className="rounded-2xl bg-zinc-900/60 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Coins className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Complete Offers</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Select tasks like playing a game level, taking surveys, or downloading apps. Verify your submission instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-3xl glass-card border border-dark-border p-6 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.05)] transition-all group">
            <div className="absolute top-6 right-6 text-4xl font-black text-zinc-800/20 group-hover:text-primary/20 transition-colors">03</div>
            <div className="rounded-2xl bg-zinc-900/60 border border-dark-border w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Payout</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Redeem your coins for cash rewards starting at just $1.00 USD. Cashouts are processed within minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white leading-tight">
              Many Ways to Earn, <br />
              <span className="text-gradient">Choose What You Love</span>
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
