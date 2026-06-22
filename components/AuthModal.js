'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-card border border-dark-border p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gradient tracking-wider">RewardCash</h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            {tab === 'login' ? 'Welcome back! Earn coins now.' : 'Create an account and get 100 free coins.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mb-6 flex rounded-lg bg-zinc-900/50 p-1 border border-dark-border">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === 'login' 
                ? 'bg-primary text-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === 'register' 
                ? 'bg-primary text-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="displayname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary py-3 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          By signing up, you agree to our Terms of Service & Privacy Policy.
          {tab === 'login' && (
            <p className="mt-3 text-zinc-400">
              Demo Credentials: <span className="text-primary font-semibold">admin@rewardcash.co</span> / <span className="text-secondary font-semibold">admin123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
