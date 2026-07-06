import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, Loader2, ShieldAlert, Eye, EyeOff, Zap } from 'lucide-react';
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
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container (Two-Pane Premium Branded Modal Card) */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-dark-border bg-dark-card shadow-2xl transition-all flex flex-col md:flex-row min-h-[500px] select-none z-10 animate-fade-in">
        
        {/* Left Side Pane: Branded Blue Promo Banner (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-[#0a0f1d] via-[#101935] to-[#0a0f1d] p-8 flex-col justify-between items-center text-center relative border-r border-dark-border/40 overflow-hidden shrink-0">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute w-44 h-44 rounded-full bg-primary/25 blur-3xl -z-10 top-1/4" />
          
          {/* 1. Header Logo */}
          <div className="w-full flex justify-center mb-2">
            <img 
              src="/offerwall/blueberry_logo.png" 
              alt="BlueberryCash Logo" 
              className="h-16 w-auto object-contain" 
            />
          </div>

          {/* 2. Branded 3D Chest/Gift box */}
          <div className="relative my-auto flex flex-col items-center">
            <div className="mb-4 transform hover:scale-105 hover:rotate-3 transition-all duration-500 cursor-pointer">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_10px_20px_rgba(59,130,246,0.35)]">
                {/* Bow */}
                <path d="M12 6C13.66 6 15 4.66 15 3C15 3 13 3 12 4.5C11 3 9 3 9 3C9 4.66 10.34 6 12 6Z" fill="#dbeafe" />
                {/* Lid */}
                <path d="M19.5 9H4.5C3.67 9 3 8.33 3 7.5C3 6.67 3.67 6 4.5 6H19.5C20.33 6 21 6.67 21 7.5C21 8.33 20.33 9 19.5 9Z" fill="#3b82f6" />
                {/* Body */}
                <path d="M4 10H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V10Z" fill="#1d4ed8" />
                {/* Vert Ribbon */}
                <path d="M10.5 6H13.5V21H10.5V6Z" fill="#dbeafe" />
                {/* Horiz line ribbon */}
                <path d="M3 7H21V8H3V7Z" fill="#60a5fa" />
              </svg>
            </div>

            {/* Win Reward tag */}
            <div className="bg-primary/15 border border-primary/30 rounded-2xl px-5 py-3 min-w-[200px] shadow-lg backdrop-blur-sm">
              <h4 className="text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1">Win Up To</h4>
              <span className="text-2xl font-black text-white leading-none">$250.00</span>
            </div>
          </div>

          {/* 3. Steps list */}
          <div className="w-full space-y-2 mt-4">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/15 rounded-xl px-4 py-2 text-left">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
              <span className="text-[10px] font-extrabold text-zinc-200">Register your account</span>
            </div>
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/15 rounded-xl px-4 py-2 text-left">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
              <span className="text-[10px] font-extrabold text-zinc-200">Complete tasks & earn coins</span>
            </div>
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/15 rounded-xl px-4 py-2 text-left">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
              <span className="text-[10px] font-extrabold text-zinc-200">Open free chest to win up to $250</span>
            </div>
          </div>

          {/* Footer Terms */}
          <p className="text-[8px] text-zinc-500 leading-normal mt-4">
            By accessing the site, I attest that I am at least 18 years old and have read the <span className="text-zinc-400 underline cursor-pointer">Terms & Conditions</span>.
          </p>
        </div>

        {/* Right Side Pane: Interactive Email Form Panel */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-[#0a0a0d]">
          
          {/* Close modal button top right */}
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-all active:scale-90 border border-white/5 bg-[#0e0e12]/40 z-20"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Top Form Section */}
          <div>
            <h2 className="text-2xl font-black text-white text-left mb-6">
              {tab === 'login' ? 'Sign In' : 'Sign Up'}
            </h2>

            {/* Error Notification banner */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/40 p-3 text-xs text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Device-level Anti-cheat warning screen */}
            {deviceHasAccount ? (
              <div className="text-center py-6 px-4 bg-red-950/20 border border-red-900/30 rounded-2xl space-y-4 shadow-sm">
                <div className="inline-flex rounded-full bg-red-500/10 p-3.5 text-red-500 animate-pulse">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Device Blocked</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto font-semibold">
                  Our system detected an existing account registered from this device (Username: <strong className="text-primary font-black">{deviceHasAccount}</strong>). 
                  To prevent fraud, only one account is allowed per device.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="btn-gaming w-full py-3 text-xs font-black uppercase rounded-xl tracking-wider shadow-lg active:scale-95 transition-transform"
                >
                  Sign In to Existing Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Form fields */}
                {tab === 'register' && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
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
                        className="w-full rounded-xl bg-zinc-900 border border-dark-border py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#bf5aff] focus:outline-none transition-colors font-semibold shadow-inner mt-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="Enter e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-dark-border py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#bf5aff] focus:outline-none transition-colors font-semibold shadow-inner mt-1"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-zinc-400">
                      Password
                    </label>
                    {tab === 'login' && (
                      <button type="button" className="text-[10px] font-bold text-primary hover:underline bg-transparent border-none">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-dark-border py-3 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:border-[#bf5aff] focus:outline-none transition-colors font-semibold shadow-inner mt-1"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {tab === 'login' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="rounded border-zinc-800 bg-zinc-900 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer" 
                    />
                    <label htmlFor="remember" className="text-xs font-semibold text-zinc-400 cursor-pointer select-none">
                      Remember Me
                    </label>
                  </div>
                )}

                {/* Single Email Auth Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider rounded-xl py-3.5 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.25)] mt-6"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 fill-white text-white shrink-0" />
                      <span>{tab === 'login' ? 'Login' : 'Create account'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Switch Pane Tabs Option */}
          <div className="mt-8 text-center text-xs text-zinc-400 select-none">
            {tab === 'login' ? (
              <span>
                New on our platform?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(''); }}
                  className="text-white hover:text-primary font-bold hover:underline bg-transparent border-none cursor-pointer transition-colors"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Have an account already?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); }}
                  className="text-white hover:text-primary font-bold hover:underline bg-transparent border-none cursor-pointer transition-colors"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Mockup footer Cookie/Terms policy */}
          <div className="text-[9px] text-zinc-550 text-center leading-relaxed mt-4 border-t border-dark-border/30 pt-4">
            By using our service, you agree to our <span className="text-zinc-400 underline cursor-pointer">Service Terms</span>. Learn how we use cookies and similar technology in <span className="text-zinc-400 underline cursor-pointer">Cookies</span>.
          </div>

        </div>

      </div>
    </div>
  );
}
