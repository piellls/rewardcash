'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db, isMockMode, supabase } from '@/lib/db';
import { ShieldAlert, Globe, Lock } from 'lucide-react';

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

// Shared full-screen notice used for device, VPN and ban blocks
function BlockScreen({ icon: Icon, title, tag, body, action }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#090d18] p-4 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        backgroundImage: 'radial-gradient(60% 50% at 50% 0%, rgba(241,118,133,0.18), transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }} />
      <div role="alertdialog" aria-labelledby="block-title" className="g-modal relative w-full max-w-md space-y-6 rounded-3xl border border-[#f17685]/30 bg-[#151c2e] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f17685]/40 bg-[#f17685]/10 text-[#f17685]">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 id="block-title" className="g-title text-2xl text-white">{title}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#f17685]">{tag}</p>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#29334a] bg-[#0f1424] p-4 text-left text-sm leading-relaxed text-[#aab4c9]">
          {body.map((line) => <p key={line}>{line}</p>)}
        </div>
        {action && (
          <button type="button" onClick={action.onClick} className="btn-gaming w-full rounded-xl py-3.5 text-sm">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceBlocked, setDeviceBlocked] = useState(false);
  const [blockedUsername, setBlockedUsername] = useState('');
  const [vpnBlocked, setVpnBlocked] = useState(false);
  const [bannedBlocked, setBannedBlocked] = useState(false);

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
        
        // Block banned users
        if (profile && profile.is_banned) {
          setBannedBlocked(true);
          setUser(null);
          await db.signOut();
          return;
        } else {
          setBannedBlocked(false);
        }

        setUser(profile);

        // Auto-detect and sync country if currently null or 'Unknown'
        if (profile && (!profile.country || profile.country === 'Unknown')) {
          try {
            const res = await fetch('/api/check-ip');
            const data = await res.json();
            if (data && data.country) {
              await db.updateUserCountry(profile.id, data.country);
              // Update local context user state
              setUser(prev => prev ? { ...prev, country: data.country } : prev);
            }
          } catch (e) {
            console.error('Failed to sync country inside refreshUser:', e);
          }
        }
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
    
    // Server-side real-time VPN and Proxy check
    const checkVPNStatus = async () => {
      try {
        const res = await fetch('/api/check-ip');
        const data = await res.json();
        if (data && data.isVPN) {
          setVpnBlocked(true);
        }
      } catch (err) {
        console.error('VPN detection client error:', err);
      }
    };
    checkVPNStatus();
    
    // Capture referral code from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('rc_referred_by', ref);
      }
    }
  }, []);

  // Real-time online/offline heartbeat tracker
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        if (!isMockMode) {
          const session = await supabase.auth.getSession();
          const token = session.data?.session?.access_token;
          if (token) {
            await fetch('/api/heartbeat', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        } else {
          // Mock mode: update local storage timestamp
          const users = JSON.parse(localStorage.getItem('bc_users') || '[]');
          const idx = users.findIndex(u => u.id === user.id);
          if (idx !== -1) {
            users[idx].last_seen_at = new Date().toISOString();
            localStorage.setItem('bc_users', JSON.stringify(users));
          }
        }
      } catch (e) {
        console.warn('Heartbeat failed:', e.message);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await db.signIn(email, password);
      
      // Check if user is banned
      const profile = await db.getProfile(u.id);
      if (profile && profile.is_banned) {
        setBannedBlocked(true);
        setUser(null);
        await db.signOut();
        throw new Error('Your account has been banned for violating our terms of service.');
      }

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
    // Coins are now credited only by the server (offer postbacks, the spin API).
    // The old browser-side credit was removed for security, so rewards that relied on it are unavailable until they get a server route.
    throw new Error('This reward is temporarily unavailable. It is being moved to a secure system.');
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

  const updateProfileDetails = async (username, email) => {
    if (!user) return;
    try {
      await db.updateProfileDetails(user.id, username, email);
      await refreshUser();
    } catch (err) {
      console.error('Failed to update profile details:', err);
      throw err;
    }
  };

  // Full-screen notices for blocked devices, VPN/proxy traffic and banned accounts
  if (deviceBlocked) {
    return (
      <BlockScreen
        icon={ShieldAlert}
        title="Access blocked"
        tag="One account per device"
        body={[
          'Our anti-fraud system found that this device already belongs to another account:',
          `Original account: ${blockedUsername}`,
          'To keep rewards fair, BlueberryCash allows only one account per device.',
        ]}
        action={{
          label: `Sign in to ${blockedUsername}`,
          onClick: () => {
            setDeviceBlocked(false);
            setBlockedUsername('');
            db.signOut().then(() => { window.location.reload(); });
          },
        }}
      />
    );
  }

  // If VPN is detected, show a block page (exempt admin users)
  if (vpnBlocked && (!user || user.role !== 'admin')) {
    return (
      <BlockScreen
        icon={Globe}
        title="VPN or proxy detected"
        tag="Security protection"
        body={[
          'You seem to be connecting through a VPN, proxy or data-center IP address.',
          'To prevent fraud and meet advertiser requirements, these connections are not allowed. Turn it off and refresh the page to continue.',
        ]}
      />
    );
  }

  // If user is banned, show a block page
  if (bannedBlocked) {
    return (
      <BlockScreen
        icon={Lock}
        title="Account suspended"
        tag="Access terminated"
        body={[
          'Your account was suspended for breaking the Terms of Service.',
          'Common reasons: multiple accounts, VPN or proxy use, emulators, bots or referral abuse.',
        ]}
        action={{ label: 'Got it', onClick: () => setBannedBlocked(false) }}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, deviceBlocked, blockedUsername, login, register, logout, refreshUser, earnCoinsSimulated, signInWithSocial, updateAvatar, updateProfileDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
