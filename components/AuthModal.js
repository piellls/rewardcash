'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const { login, register, signInWithSocial } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      const u = await signInWithSocial(provider);
      if (u) {
        onClose();
      }
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!username.trim()) throw new Error('Username is required!');
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container (Wide Split-Screen Layout) */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-2xl transition-all grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        
        {/* Left Column (EarnLab digital art - hidden on mobile) */}
        <div className="hidden md:block md:col-span-5 relative bg-zinc-950 overflow-hidden">
          <img 
            src="/login_art.png" 
            alt="Cyberspace rewards illustration" 
            className="absolute inset-0 w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-1000"
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-left">
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Earn & Cashout
            </span>
            <h3 className="text-base font-black text-white mt-2 leading-tight">
              Start earning coins by playing games and taking surveys.
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              Join thousands of users converting their daily actions into real cash rewards.
            </p>
          </div>
        </div>

        {/* Right Column (Auth form) */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative bg-dark-card">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors active:scale-90"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          <div>
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {tab === 'login' ? 'Sign in to RewardCash' : 'Create a Free Account'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {tab === 'login' 
                  ? 'Access your balance, streaks, withdrawals, and direct tasks.' 
                  : 'Register today to secure an instant +100 Coins welcome bonus.'}
              </p>
            </div>

            {/* Social Oauth Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button 
                type="button" 
                onClick={() => handleSocialLogin('google')} 
                className="rounded-xl border border-dark-border bg-zinc-950/80 py-2.5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold text-white cursor-pointer active:scale-95"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.08-5.171 4.08-3.415 0-6.19-2.774-6.19-6.19 0-3.415 2.775-6.19 6.19-6.19 1.483 0 2.844.526 3.918 1.402l2.97-2.97C18.89 1.95 15.753 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.96 0 10.91-4.28 10.91-11 0-.68-.08-1.33-.24-1.815H12.24z"/></svg>
                Google
              </button>
              
              <button 
                type="button" 
                onClick={() => handleSocialLogin('facebook')} 
                className="rounded-xl border border-dark-border bg-zinc-950/80 py-2.5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold text-white cursor-pointer active:scale-95"
              >
                <svg className="h-3.5 w-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* OR separator */}
            <div className="relative flex items-center justify-center my-4">
              <div className="flex-grow border-t border-dark-border/60"></div>
              <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-550 uppercase tracking-widest bg-dark-card px-2">OR</span>
              <div className="flex-grow border-t border-dark-border/60"></div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400 animate-pulse">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="displayname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-zinc-955 bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary py-3 text-xs font-black text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : tab === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Bottom toggle links */}
          <div className="mt-6 pt-4 border-t border-dark-border/40 text-center text-[10px] text-zinc-500 flex flex-col items-center gap-2">
            <span>By signing up, you agree to our Terms of Service & Privacy Policy.</span>
            <button
              type="button"
              onClick={() => {
                setTab(tab === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer mt-1"
            >
              {tab === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
