import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { db } from '@/lib/db';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceHasAccount, setDeviceHasAccount] = useState(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, isOpen]);

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
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container (Branded Compact Card Layout) */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8 shadow-2xl transition-all flex flex-col justify-between">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors active:scale-90"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Tab Switcher (Branded Switcher Pill) */}
        <div className="flex bg-zinc-50 border border-dark-border rounded-xl p-1 mb-6 mt-2">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 text-center py-2.5 text-xs font-black uppercase rounded-lg transition-all ${
              tab === 'login'
                ? 'btn-gaming text-white'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 text-center py-2.5 text-xs font-black uppercase rounded-lg transition-all ${
              tab === 'register'
                ? 'btn-gaming text-white'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Logo Display */}
        <div className="flex flex-col items-center justify-center mb-4">
          <img 
            src="/offerwall/blueberry_logo.png" 
            alt="blueberrycash Logo" 
            className="h-13 w-auto object-contain" 
          />
        </div>

        {/* Subtitle Text */}
        <p className="text-xs text-zinc-500 text-center mb-6 max-w-xs mx-auto leading-relaxed">
          {tab === 'login' 
            ? 'Please sign-in to your account and start the adventure 🚀' 
            : 'Register your free account and start the adventure 🚀'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/10 border border-red-900/20 p-3 text-xs text-red-650 animate-pulse">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        {deviceHasAccount ? (
          <div className="text-center py-6 px-4 bg-red-950/10 border border-red-900/20 rounded-xl space-y-4 shadow-sm">
            <div className="inline-flex rounded-full bg-red-500/10 p-3 text-red-600 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Device Blocked</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
              Our system detected an existing account registered from this device (Username: <strong className="text-primary font-bold">{deviceHasAccount}</strong>). 
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="displayname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2.5 pl-10 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2.5 pl-10 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                {tab === 'login' && (
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline bg-transparent border-none">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 border border-dark-border py-2.5 pl-10 pr-10 text-xs text-zinc-800 placeholder-zinc-400 focus:border-primary focus:outline-none transition-colors font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="rounded border-dark-border text-primary focus:ring-primary h-4 w-4" 
              />
              <label htmlFor="remember" className="text-xs font-semibold text-zinc-500 cursor-pointer select-none">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gaming w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold uppercase mt-6 tracking-wide shadow-md active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : tab === 'login' ? (
                'Login'
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="mt-6 pt-4 border-t border-dark-border/40 text-center text-xs text-zinc-500">
          {tab === 'login' ? (
            <span>
              New on our platform?{' '}
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
