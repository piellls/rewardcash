'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { ShieldAlert, Globe } from 'lucide-react';

const AuthContext = createContext({
  user: null,
  loading: true,
  deviceBlocked: false,
  blockedUsername: '',
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  earnCoinsSimulated: async () => {},
  signInWithSocial: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceBlocked, setDeviceBlocked] = useState(false);
  const [blockedUsername, setBlockedUsername] = useState('');

  const refreshUser = async () => {
    try {
      const sessionUser = await db.getCurrentUser();
      if (sessionUser) {
        // Sync fingerprint and verify device multi-accounting limit
        const syncResult = await db.syncDeviceFingerprint(sessionUser.id);
        if (syncResult.blocked) {
          setDeviceBlocked(true);
          setBlockedUsername(syncResult.existingUsername);
          setUser(null);
          return;
        } else {
          setDeviceBlocked(false);
          setBlockedUsername('');
        }

        // Fetch fresh profile data to get latest balance
        const profile = await db.getProfile(sessionUser.id);
        setUser(profile);
      } else {
        setUser(null);
        setDeviceBlocked(false);
        setBlockedUsername('');
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    
    // Capture referral code from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('rc_referred_by', ref);
      }
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await db.signIn(email, password);
      // Sync immediately on login
      const syncResult = await db.syncDeviceFingerprint(u.id);
      if (syncResult.blocked) {
        setDeviceBlocked(true);
        setBlockedUsername(syncResult.existingUsername);
        setUser(null);
        await db.signOut();
        throw new Error(`Device Blocked! Another account (${syncResult.existingUsername}) is already registered on this device.`);
      }
      setUser(u);
      setDeviceBlocked(false);
      setBlockedUsername('');
      return u;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const refCode = typeof window !== 'undefined' ? localStorage.getItem('rc_referred_by') : null;
      const u = await db.signUp(username, email, password, refCode);
      
      if (refCode && typeof window !== 'undefined') {
        localStorage.removeItem('rc_referred_by');
      }
      
      setUser(u);
      setDeviceBlocked(false);
      setBlockedUsername('');
      return u;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithSocial = async (provider) => {
    setLoading(true);
    try {
      const u = await db.signInWithSocial(provider);
      if (u) {
        // Sync immediately on social login/signup completion
        const syncResult = await db.syncDeviceFingerprint(u.id);
        if (syncResult.blocked) {
          setDeviceBlocked(true);
          setBlockedUsername(syncResult.existingUsername);
          setUser(null);
          await db.signOut();
          throw new Error(`Device Blocked! Another account (${syncResult.existingUsername}) is already registered on this device.`);
        }
        setUser(u);
        setDeviceBlocked(false);
        setBlockedUsername('');
      }
      return u;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await db.signOut();
      setUser(null);
      setDeviceBlocked(false);
      setBlockedUsername('');
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  const earnCoinsSimulated = async (offerId) => {
    if (!user) return;
    try {
      const result = await db.completeOffer(user.id, offerId);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Failed to complete offer:', err);
      throw err;
    }
  };

  const updateAvatar = async (avatarUrl) => {
    if (!user) return;
    try {
      await db.updateProfileAvatar(user.id, avatarUrl);
      await refreshUser();
    } catch (err) {
      console.error('Failed to update avatar:', err);
      throw err;
    }
  };

  // Fullscreen premium layout blocking screen if they try to use multiple accounts on the same machine
  if (deviceBlocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050811] p-4 text-center">
        {/* Glowing Cyber Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `
            radial-gradient(at 50% 0%, rgba(239, 68, 68, 0.15) 0px, transparent 60%),
            linear-gradient(rgba(239, 68, 68, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 35px 35px, 35px 35px'
        }} />

        <div className="relative w-full max-w-md rounded-2xl border border-red-950/40 bg-dark-card/95 p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Top warning line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
          
          <div className="inline-flex rounded-full bg-red-500/10 p-4 text-red-500 animate-bounce">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Access Blocked</h1>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest animate-pulse">Multi-Accounting Violation</p>
          </div>

          <div className="rounded-xl bg-zinc-950/80 p-4 border border-dark-border/60 text-left space-y-2.5">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Our anti-fraud system detected that this device is already associated with another registered account:
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-white bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
              <span className="text-zinc-500">Original Owner:</span>
              <span className="text-[#38bdf8] font-black">{blockedUsername}</span>
            </div>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed pt-1">
              To guarantee system integrity and prevent reward abuse, RewardCash permits only one user account per device/PC.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setDeviceBlocked(false);
                setBlockedUsername('');
                db.signOut().then(() => {
                  window.location.reload();
                });
              }}
              className="btn-gaming w-full py-3 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Log In to {blockedUsername}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, deviceBlocked, blockedUsername, login, register, logout, refreshUser, earnCoinsSimulated, signInWithSocial, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
