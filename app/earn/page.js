'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import Shoutbox from '@/components/Shoutbox';
import { Coins, Flame, Award, Gamepad2, Laptop, Play, ShieldAlert, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

export default function Earn() {
  const { user, earnCoinsSimulated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Auth state redirect
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Task execution states
  const [executingOffer, setExecutingOffer] = useState(null);
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setOffers(db.getOffers());
  }, []);

  const categories = ['All', 'Game', 'Survey', 'App'];

  const filteredOffers = selectedCategory === 'All' 
    ? offers 
    : offers.filter(o => o.category === selectedCategory);

  const handleOfferClick = (offer) => {
    if (!user) {
      setAuthTab('register');
      setIsAuthOpen(true);
      return;
    }
    setExecutingOffer(offer);
  };

  const handleSimulateCompletion = async () => {
    if (!user || !executingOffer) return;
    
    setLoadingOfferId(executingOffer.id);
    try {
      await earnCoinsSimulated(executingOffer.id);
      setSuccessMessage(`Success! You have completed "${executingOffer.title}" and earned ${executingOffer.coins} coins.`);
      setExecutingOffer(null);
      
      // Auto clear success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      alert(err.message || 'Failed to complete offer');
    } finally {
      setLoadingOfferId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          Task Offerwalls
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Choose from our highest paying task lists below. Completing tasks rewards you with coins instantly.
        </p>
      </div>

      {/* Main Earn Layout with Shoutbox Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Offerwalls & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400 animate-bounce">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-bold">{successMessage}</span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-dark-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-black' 
                    : 'bg-zinc-900 text-zinc-400 border border-dark-border/40 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat} Tasks
              </button>
            ))}
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => (
              <div 
                key={offer.id}
                onClick={() => handleOfferClick(offer)}
                className="flex flex-col rounded-2xl glass-card border border-dark-border p-5 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)] active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Top Row: Icon & Category */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 rounded-xl bg-zinc-950/60 border border-dark-border/50">
                    {offer.icon}
                  </span>
                  <span className="rounded-full border border-dark-border bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {offer.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                  {offer.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 mb-6 line-clamp-2 leading-relaxed flex-1">
                  {offer.description}
                </p>

                {/* Bottom Row: Coins & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-border/60">
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-black text-white">{offer.coins.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Coins</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Earn ${offer.payout.toFixed(2)} <Play className="h-3 w-3 fill-primary text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1/3: Shoutbox */}
        <div className="lg:col-span-1">
          <Shoutbox />
        </div>
      </div>

      {/* Offer Execution Modal (Simulated Sandbox) */}
      {executingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setExecutingOffer(null)} />
          <div className="relative w-full max-w-lg rounded-2xl glass-card border border-dark-border p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Complete Task Offer
            </h2>
            <p className="text-xs text-zinc-400 border-b border-dark-border pb-4 mb-4">
              Provider: <span className="font-semibold text-zinc-200">{executingOffer.provider}</span> • Payout: <span className="font-bold text-primary">${executingOffer.payout.toFixed(2)}</span>
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="rounded-xl bg-zinc-950 p-4 border border-dark-border">
                <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-1">Offer Title</h4>
                <p className="text-sm font-semibold text-zinc-200">{executingOffer.title}</p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4 border border-dark-border">
                <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-1">Requirements</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{executingOffer.description}</p>
              </div>

              {/* Simulation Help Note */}
              <div className="flex items-start gap-2.5 rounded-lg bg-zinc-900 border border-dark-border p-3 text-xs text-zinc-400">
                <Gamepad2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <span>
                  <strong>Sandbox Simulator:</strong> In production, clicking below redirects the user to the CPA network and awards coins automatically upon success via postback callback. For this demo, clicking complete will credit the coins to your balance instantly!
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExecutingOffer(null)}
                className="flex-1 rounded-xl border border-dark-border bg-zinc-900 py-3 text-sm font-bold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateCompletion}
                disabled={loadingOfferId !== null}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
              >
                {loadingOfferId ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    Complete Task
                    <Coins className="h-4 w-4 text-black fill-yellow-500" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialTab={authTab} 
      />
    </div>
  );
}
