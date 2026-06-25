import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { db } from '@/lib/db';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceHasAccount, setDeviceHasAccount] = useState(null);

  useEffect(() => {
    if (tab === 'register' && isOpen) {
      db.checkDeviceHasAccount().then(existingUsername => {
        setDeviceHasAccount(existingUsername);
      });
    } else {
      setDeviceHasAccount(null);
    }
  }, [tab, isOpen]);

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



            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400 animate-pulse">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            {deviceHasAccount ? (
              <div className="text-center py-6 px-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <div className="inline-flex rounded-full bg-red-500/10 p-3 text-red-500 animate-pulse">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Device Blocked</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Our system detected an existing account registered from this device (Username: <strong className="text-[#38bdf8] font-bold">{deviceHasAccount}</strong>). 
                  To prevent fraud and duplicate accounts, only one account is allowed per device.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="btn-gaming w-full py-2.5 text-xs font-extrabold rounded-xl"
                >
                  Sign In to Existing Account
                </button>
              </div>
            ) : (
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
                  className="btn-gaming w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold"
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
            )}
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
              className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer mt-1 active:scale-95 transition-all"
            >
              {tab === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
