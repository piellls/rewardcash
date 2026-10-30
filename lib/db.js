import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Supabase client instance
export const supabase = isMockMode ? null : createClient(supabaseUrl, supabaseAnonKey);

// Calls an admin-only API route with the signed-in user's session token.
const adminApi = async (url, { method = 'GET', body } = {}) => {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token || ''}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
};

// --- MOCK DATABASE (localStorage based) ---
const DEFAULT_LEADERBOARD = [
  { username: 'EarnMaster', balance_coins: 125000, total_earned_coins: 345000, avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { username: 'CoinKing', balance_coins: 43200, total_earned_coins: 210900, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { username: 'TaskSlayer', balance_coins: 15400, total_earned_coins: 98600, avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' },
  { username: 'SurveyNinja', balance_coins: 3200, total_earned_coins: 87400, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { username: 'RewardHunter', balance_coins: 1800, total_earned_coins: 65200, avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
];

const DEFAULT_OFFERS = [
  { id: 'off_1', title: 'Board Kings: Level 11', description: 'Install, play and complete Level 11 within 10 days.', coins: 4500, payout: 4.50, provider: 'CPALead', category: 'Game', icon: 'game' },
  { id: 'off_2', title: 'Opinion World Survey', description: 'Complete a quick 10-minute survey about daily products.', coins: 1200, payout: 1.20, provider: 'AdGate Media', category: 'Survey', icon: 'survey' },
  { id: 'off_3', title: 'Crypto.com App', description: 'Download, register a free account and verify your email.', coins: 8000, payout: 8.00, provider: 'CPALead', category: 'App', icon: 'app' },
  { id: 'off_4', title: 'Lords Mobile: Attack Level 2', description: 'Attack a level 2 monster to redeem your points.', coins: 6500, payout: 6.50, provider: 'AdGate Media', category: 'Game', icon: 'game' },
  { id: 'off_5', title: 'SayMore Surveys', description: 'Share your opinions and complete your profiling survey.', coins: 1500, payout: 1.50, provider: 'Lootably', category: 'Survey', icon: 'survey' },
  { id: 'off_6', title: 'TikTok Install', description: 'Download TikTok, open and register as a new user.', coins: 500, payout: 0.50, provider: 'CPALead', category: 'App', icon: 'app' }
];

const DEFAULT_WITHDRAWALS = [
  { id: 'w_1', username: 'TaskSlayer', amount_usd: 10.00, coins_spent: 10000, payment_method: 'paypal', payment_address: 'slayer.rewards@gmail.com', status: 'pending', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'w_2', username: 'CoinKing', amount_usd: 50.00, coins_spent: 50000, payment_method: 'ltc', payment_address: 'LeT7KzRt6yA9qWjQY5pX2cMv1bN3sZ8eXy', status: 'approved', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'w_3', username: 'EarnMaster', amount_usd: 100.00, coins_spent: 100000, payment_method: 'paypal', payment_address: 'master.earner@paypal.com', status: 'approved', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
];

const initMockStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('bc_users')) {
    const newAdminUser = {
      id: 'xpilalhamlawe_uuid',
      email: 'xpilalhamlawe@gmail.com',
      username: 'pilal',
      password: '098ZHOIHjkkh12@@',
      balance_coins: 0,
      total_earned_coins: 0,
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    // Add default users
    const mockUsers = [
      newAdminUser,
      ...DEFAULT_LEADERBOARD.map((u, i) => ({
        id: `mock_user_${i}`,
        email: `${u.username.toLowerCase()}@gmail.com`,
        username: u.username,
        password: 'password123',
        balance_coins: u.balance_coins,
        total_earned_coins: u.total_earned_coins,
        role: 'user',
        avatar_url: u.avatar_url,
        created_at: new Date().toISOString()
      }))
    ];
    
    localStorage.setItem('bc_users', JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem('bc_withdrawals')) {
    localStorage.setItem('bc_withdrawals', JSON.stringify(DEFAULT_WITHDRAWALS));
  }

  if (!localStorage.getItem('bc_completions')) {
    localStorage.setItem('bc_completions', JSON.stringify([
      { id: 'c_1', username: 'EarnMaster', offer_title: 'Board Kings', provider: 'CPALead', coins: 4500, completed_at: new Date(Date.now() - 600000).toISOString() },
      { id: 'c_2', username: 'CoinKing', offer_title: 'Opinion World Survey', provider: 'AdGate Media', coins: 1200, completed_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 'c_3', username: 'SurveyNinja', offer_title: 'SayMore Surveys', provider: 'Lootably', coins: 1500, completed_at: new Date(Date.now() - 3600000).toISOString() }
    ]));
  }
};

// Safe localStorage helper
const getStorageItem = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  initMockStorage();
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : fallback;
};

const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// --- AUTHENTICATION & DATABASE LAYER ---

let cachedIP = null;
const getClientIP = async () => {
  if (cachedIP) return cachedIP;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(id);
    const data = await res.json();
    cachedIP = data.ip;
    return cachedIP;
  } catch (e) {
    return 'local-ip';
  }
};

const normalizeGPU = (gpu) => {
  if (!gpu) return 'unknown';
  let g = gpu.toLowerCase();
  if (g.includes('nvidia') || g.includes('geforce')) {
    const match = gpu.match(/rtx\s*\d+|gtx\s*\d+|geforce\s*[a-z0-9]+/i);
    return 'nvidia_' + (match ? match[0].toLowerCase().replace(/\s+/g, '') : 'generic');
  }
  if (g.includes('intel')) {
    if (g.includes('iris')) return 'intel_iris';
    if (g.includes('hd graphics')) return 'intel_hd';
    return 'intel_generic';
  }
  if (g.includes('apple') || g.includes('m1') || g.includes('m2') || g.includes('m3') || g.includes('m4')) {
    const match = gpu.match(/m[1-4]\s*(?:pro|max|ultra)?/i);
    return 'apple_' + (match ? match[0].toLowerCase().replace(/\s+/g, '') : 'm1');
  }
  if (g.includes('amd') || g.includes('radeon')) {
    return 'amd_radeon';
  }
  return g.replace(/[^a-z0-9]/g, '');
};

// Helper to generate a stable cross-browser hardware bound fingerprint
const getStableFingerprint = async () => {
  if (typeof window === 'undefined') return null;
  try {
    const gpu = (() => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-webgl';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'no-debug-info';
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      } catch (e) {
        return 'gpu-err';
      }
    })();
    const normalizedGPU = normalizeGPU(gpu);

    // Canvas fingerprinting (GPU sub-pixel font rendering signature)
    const canvasHash = (() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-ctx';
        canvas.width = 150;
        canvas.height = 30;
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(10, 10, 50, 10);
        ctx.fillStyle = "#069";
        ctx.font = "11px Arial";
        ctx.fillText("bc_device_v2", 4, 15);
        return canvas.toDataURL();
      } catch (e) {
        return 'err';
      }
    })();

    const params = [
      normalizedGPU,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency || 'unknown-cores',
      navigator.deviceMemory || 'unknown-ram',
      navigator.maxTouchPoints || 'unknown-touch',
      navigator.platform || 'unknown-platform',
      navigator.languages ? navigator.languages.join(',') : 'unknown-lang',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      typeof TouchEvent !== 'undefined' ? 'touch-supported' : 'no-touch',
      canvasHash
    ].join('|||');

    // Fast 53-bit cyrb53 hash
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < params.length; i++) {
      ch = params.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
    return 'hw_' + hash;
  } catch (e) {
    return 'hw_fallback_' + (screen.width + 'x' + screen.height) + '_' + Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
};

// Helper to retrieve or generate device fingerprint
const getDeviceFingerprint = async () => {
  if (typeof window === 'undefined') return null;
  
  let fp = null;
  try {
    fp = localStorage.getItem('bc_device_fingerprint');
  } catch (e) {
    console.error('Failed to read localStorage:', e);
  }
  
  if (!fp) {
    try {
      const match = document.cookie.match(/(?:^|; )bc_device_fingerprint=([^;]*)/);
      if (match) {
        fp = decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.error('Failed to read cookies:', e);
    }
  }
  
  // Upgrade old fp_ or dev_ fingerprints to stable cross-browser hardware/IP hw_ fingerprint
  if (!fp || !fp.startsWith('hw_')) {
    fp = await getStableFingerprint();
    try {
      localStorage.setItem('bc_device_fingerprint', fp);
    } catch (e) {}
    
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 10);
      document.cookie = `bc_device_fingerprint=${fp}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (e) {}
  }
  
  return fp;
};

export const db = {
  // 1. Get available offers
  getOffers: () => {
    return DEFAULT_OFFERS;
  },

  // 1b. Check if this device already has a registered account
  checkDeviceHasAccount: async () => {
    const deviceFingerprint = await getDeviceFingerprint();
    if (!deviceFingerprint) return null;

    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('device_fingerprint', deviceFingerprint)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        return data[0].username;
      }
      return null;
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const match = users.find(u => u.device_fingerprint === deviceFingerprint && u.role !== 'admin');
      return match ? match.username : null;
    }
  },

  // 1c. Sync current device fingerprint with the user's profile and check for duplicate accounts
  syncDeviceFingerprint: async (userId) => {
    const deviceFingerprint = await getDeviceFingerprint();
    if (!deviceFingerprint || !userId) return { blocked: false };

    if (!isMockMode) {
      // 1. Fetch user's current profile fingerprint
      const { data: profile, error: fetchErr } = await supabase
        .from('profiles')
        .select('device_fingerprint, username')
        .eq('id', userId)
        .single();
      
      if (fetchErr || !profile) return { blocked: false };

      // 2. If the user's stored fingerprint matches the current device, they are fine
      if (profile.device_fingerprint === deviceFingerprint) {
        return { blocked: false };
      }

      // 3. Check if this device fingerprint is already used by another profile
      const { data: existingProfiles, error: checkErr } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('device_fingerprint', deviceFingerprint)
        .neq('id', userId)
        .limit(1);

      if (!checkErr && existingProfiles && existingProfiles.length > 0) {
        // Multi-accounting detected! This device already has another user account associated with it.
        return { blocked: true, existingUsername: existingProfiles[0].username };
      }

      // 4. Update the user's profile to bind to this device fingerprint
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ device_fingerprint: deviceFingerprint })
        .eq('id', userId);
      
      if (updateErr) {
        console.error('Failed to sync device fingerprint:', updateErr);
      }

      return { blocked: false };
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return { blocked: false };

      const profile = users[idx];
      if (profile.device_fingerprint === deviceFingerprint) {
        return { blocked: false };
      }

      // Check if this fingerprint belongs to another user
      const match = users.find(u => u.device_fingerprint === deviceFingerprint && u.id !== userId && u.role !== 'admin');
      if (match) {
        return { blocked: true, existingUsername: match.username };
      }

      // Update the user's fingerprint in mock storage
      users[idx].device_fingerprint = deviceFingerprint;
      setStorageItem('bc_users', users);
      
      const session = getStorageItem('bc_session', null);
      if (session && session.id === userId) {
        session.device_fingerprint = deviceFingerprint;
        setStorageItem('bc_session', session);
      }

      return { blocked: false };
    }
  },

  updateUserCountry: async (userId, country) => {
    try {
      if (!isMockMode) {
        const { error } = await supabase
          .from('profiles')
          .update({ country })
          .eq('id', userId);
        if (error) throw error;
      } else {
        initMockStorage();
        const users = getStorageItem('bc_users', []);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
          users[idx].country = country;
          setStorageItem('bc_users', users);
        }
      }
    } catch (e) {
      console.error('Failed to update country:', e);
    }
  },

  // 2. Sign Up
  signUp: async (username, email, password, referralCode = null) => {
    const deviceFingerprint = await getDeviceFingerprint();
    
    // Pre-fetch client country
    let detectedCountry = 'Unknown';
    try {
      const ipRes = await fetch('/api/check-ip');
      const ipData = await ipRes.json();
      if (ipData && ipData.country) {
        detectedCountry = ipData.country;
      }
    } catch (e) {
      console.error('Failed to pre-fetch country on signup:', e);
    }

    if (!isMockMode) {
      // Check if this fingerprint is already associated with any profile in profiles table
      if (deviceFingerprint) {
        const { data: existingProfiles, error: checkErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('device_fingerprint', deviceFingerprint)
          .limit(1);
        
        if (!checkErr && existingProfiles && existingProfiles.length > 0) {
          throw new Error('Multi-accounting detected! You cannot register multiple accounts from the same device.');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            username,
            referred_by: referralCode,
            device_fingerprint: deviceFingerprint,
            country: detectedCountry
          }
        }
      });
      if (error) throw error;
      return data.user;
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      
      if (users.some(u => u.email === email)) {
        throw new Error('Email is already registered!');
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username is already taken!');
      }

      // Check if this fingerprint has already been used by another user account
      if (deviceFingerprint) {
        const alreadyExists = users.some(
          u => u.device_fingerprint === deviceFingerprint && u.role !== 'admin'
        );
        if (alreadyExists) {
          throw new Error('Multi-accounting detected! You cannot register multiple accounts from the same device.');
        }
      }

      let referredById = null;
      let startingCoins = 100; // Give 100 starting coins to every new user

      if (referralCode) {
        const referrerIdx = users.findIndex(
          u => u.username.toLowerCase() === referralCode.toLowerCase() || u.id === referralCode
        );
        if (referrerIdx !== -1) {
          referredById = users[referrerIdx].id;
          startingCoins = 100; // 100 Coins welcome bonus for new user
          
          // Award referral signup bonus to the referrer (100 coins)
          const signupBonus = 100;
          users[referrerIdx].balance_coins += signupBonus;
          users[referrerIdx].total_earned_coins += signupBonus;
          users[referrerIdx].referral_earnings_total = (users[referrerIdx].referral_earnings_total || 0) + signupBonus;
        }
      }

      const newUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        username,
        password, // In real app it is hashed by Supabase auth
        balance_coins: startingCoins,
        total_earned_coins: startingCoins,
        role: 'user',
        referred_by: referredById,
        referral_code: username.toLowerCase(),
        referral_earnings_total: 0,
        avatar_url: null,
        device_fingerprint: deviceFingerprint,
        country: detectedCountry,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      setStorageItem('bc_users', users);
      setStorageItem('bc_session', newUser);
      return newUser;
    }
  },

  // 3. Sign In
  signIn: async (email, password) => {
    if (!isMockMode) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      // Fetch user profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileErr) throw profileErr;

      return { ...data.user, ...profile };
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password!');
      }

      setStorageItem('bc_session', user);
      return user;
    }
  },
  
  // 3b. Sign In with Social (Google and Facebook)
  signInWithSocial: async (provider) => {
    if (!isMockMode) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : ''
        }
      });
      if (error) throw error;
      return null;
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      
      const email = `${provider}_user@gmail.com`;
      let user = users.find(u => u.email === email);
      
      if (!user) {
        const deviceFingerprint = await getDeviceFingerprint();
        if (deviceFingerprint) {
          const alreadyExists = users.some(
            u => u.device_fingerprint === deviceFingerprint && u.role !== 'admin'
          );
          if (alreadyExists) {
            throw new Error('Multi-accounting detected! You cannot register multiple accounts from the same device.');
          }
        }

        const username = provider.charAt(0).toUpperCase() + provider.slice(1) + 'User_' + Math.floor(100 + Math.random() * 900);
        user = {
          id: `social_${provider}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          username,
          password: 'social_password_mock',
          balance_coins: 100, // +100 Coins welcome bonus
          total_earned_coins: 100,
          role: 'user',
          avatar_url: provider === 'google' 
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          device_fingerprint: deviceFingerprint,
          created_at: new Date().toISOString()
        };
        users.push(user);
        setStorageItem('bc_users', users);
      }
      
      setStorageItem('bc_session', user);
      return user;
    }
  },

  // 4. Sign Out
  signOut: async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bc_session');
      }
    }
  },

  // 5. Get Current User Session
  getCurrentUser: async () => {
    if (!isMockMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
 
      return profile ? { ...user, ...profile } : user;
    } else {
      return getStorageItem('bc_session', null);
    }
  },

  // 6. Refresh profile data
  getProfile: async (userId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;

      return data;
    } else {
      const users = getStorageItem('bc_users', []);
      const user = users.find(u => u.id === userId);
      return user || null;
    }
  },

  // 6b. Update profile avatar
  updateProfileAvatar: async (userId, avatarUrl) => {
    if (!isMockMode) {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
      if (error) throw error;
      return true;
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].avatar_url = avatarUrl;
        setStorageItem('bc_users', users);
      }
      const session = getStorageItem('bc_session', null);
      if (session && session.id === userId) {
        session.avatar_url = avatarUrl;
        setStorageItem('bc_session', session);
      }
      return true;
    }
  },

  updateProfileDetails: async (userId, username, email) => {
    if (!isMockMode) {
      // 1. Update profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ username, email })
        .eq('id', userId);
      if (profileErr) throw profileErr;

      // 2. Update Auth metadata & email
      try {
        const { error: authErr } = await supabase.auth.updateUser({
          email: email,
          data: { username }
        });
        if (authErr) {
          console.warn('Auth updates warning:', authErr.message);
        }
      } catch (e) {
        console.error('Failed to update auth settings:', e);
      }
      return true;
    } else {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        // Validate unique username & email
        if (users.some((u, i) => i !== idx && u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Username is already taken!');
        }
        if (users.some((u, i) => i !== idx && u.email === email)) {
          throw new Error('Email is already registered!');
        }
        users[idx].username = username;
        users[idx].email = email;
        setStorageItem('bc_users', users);
      }
      const session = getStorageItem('bc_session', null);
      if (session && session.id === userId) {
        session.username = username;
        session.email = email;
        setStorageItem('bc_session', session);
      }
      return true;
    }
  },

  // 7. Get Leaderboard (sorted by total coins)
  getLeaderboard: async (currentUser) => {
    const fakes = [
      { username: 'Oliver', total_earned_coins: 355500, avatar_url: '/avatars/avatar_2.png' },
      { username: 'Charlotte', total_earned_coins: 184500, avatar_url: '/avatars/avatar_3.png' },
      { username: 'James', total_earned_coins: 124200, avatar_url: '/avatars/avatar_4.png' },
      { username: 'Amelia', total_earned_coins: 84100, avatar_url: '/avatars/avatar_5.png' },
      { username: 'Benjamin', total_earned_coins: 65200, avatar_url: '/avatars/avatar_6.png' },
      { username: 'Sophia', total_earned_coins: 43500, avatar_url: '/avatars/avatar_7.png' },
      { username: 'Lucas', total_earned_coins: 24700, avatar_url: '/avatars/avatar_8.png' },
      { username: 'Isabella', total_earned_coins: 12100, avatar_url: '/avatars/avatar_9.png' },
      { username: 'Henry', total_earned_coins: 8400, avatar_url: '/avatars/avatar_10.png' },
      { username: 'Mia', total_earned_coins: 3475, avatar_url: '/avatars/avatar_1.png' }
    ];

    if (currentUser) {
      const exists = fakes.some(f => f.username.toLowerCase() === currentUser.username.toLowerCase());
      if (!exists) {
        fakes.push({
          username: currentUser.username,
          total_earned_coins: currentUser.total_earned_coins || 0,
          avatar_url: currentUser.avatar_url || '/avatars/avatar_1.png'
        });
      } else {
        const idx = fakes.findIndex(f => f.username.toLowerCase() === currentUser.username.toLowerCase());
        fakes[idx].total_earned_coins = currentUser.total_earned_coins || 0;
      }
    }

    return fakes
      .sort((a, b) => b.total_earned_coins - a.total_earned_coins)
      .slice(0, 10);
  },

  // 8. Get user's completed offers
  getCompletedOffers: async (userId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('completed_offers')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const completions = getStorageItem('bc_completions', []);
      const user = await db.getProfile(userId);
      if (!user) return [];
      return completions.filter(c => c.username === user.username);
    }
  },

  // 9. Get user's withdrawal requests
  getWithdrawals: async (userId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const withdrawals = getStorageItem('bc_withdrawals', []);
      const user = await db.getProfile(userId);
      if (!user) return [];
      return withdrawals.filter(w => w.username === user.username);
    }
  },

  // 10. Submit a cashout request
  createWithdrawal: async (userId, amountUsd, coinsSpent, paymentMethod, paymentAddress) => {
    if (!isMockMode) {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token || '';

      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount_usd: amountUsd,
          coins_spent: coinsSpent,
          payment_method: paymentMethod,
          payment_address: paymentAddress
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to submit withdrawal.');
      return resData.data;
    } else {
      const users = getStorageItem('bc_users', []);
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx === -1) throw new Error('User not found!');
      
      const user = users[userIdx];
      if (user.balance_coins < coinsSpent) {
        throw new Error('Insufficient coins balance!');
      }

      // Deduct coins
      user.balance_coins -= coinsSpent;
      users[userIdx] = user;
      setStorageItem('bc_users', users);
      
      // Update session
      const session = getStorageItem('bc_session', null);
      if (session && session.id === userId) {
        session.balance_coins -= coinsSpent;
        setStorageItem('bc_session', session);
      }

      // Add withdrawal
      const withdrawals = getStorageItem('bc_withdrawals', []);
      const newWithdrawal = {
        id: `w_${Math.random().toString(36).substr(2, 9)}`,
        username: user.username,
        amount_usd: amountUsd,
        coins_spent: coinsSpent,
        payment_method: paymentMethod,
        payment_address: paymentAddress,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      withdrawals.unshift(newWithdrawal);
      setStorageItem('bc_withdrawals', withdrawals);
      return newWithdrawal;
    }
  },

  // 12. Get Live Feed (returns last 10 global completions)
  getLiveFeed: async () => {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('completed_offers')
          .select('id, offer_id, provider, coins_earned, completed_at, profiles(username)')
          .order('completed_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        return (data || []).map(item => ({
          id: item.id,
          username: item.profiles?.username || 'User',
          offer_title: item.offer_id,
          provider: item.provider,
          coins: item.coins_earned,
          completed_at: item.completed_at
        }));
      } catch (err) {
        console.error('Error fetching dynamic live feed:', err);
      }
    }
    // Fallback for mock mode or failure
    return getStorageItem('bc_completions', []).slice(0, 10);
  },

  // 12.4 Get Signup Bonus Progress and Challenges State
  getSignupBonusState: async (userId, userProfile, supabaseClient) => {
    if (!isMockMode && typeof window !== 'undefined') {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token || '';

      const response = await fetch('/api/spin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to fetch spin state');
      return resData.signup;
    }

    const client = supabaseClient || supabase;
    
    // 1. Get user profile details
    let profile = userProfile;
    if (!profile) {
      if (!isMockMode) {
        const { data } = await client.from('profiles').select('*').eq('id', userId).single();
        profile = data;
      } else {
        const users = getStorageItem('bc_users', []);
        profile = users.find(u => u.id === userId);
      }
    }
    if (!profile) return { claimsLeft: 0, progressCoins: 0, challengeCompleted: false, endsAt: null };

    const createdAt = new Date(profile.created_at || new Date());
    const endsAt = new Date(createdAt.getTime() + 48 * 3600 * 1000);
    const now = new Date();
    const timeLeftMs = endsAt.getTime() - now.getTime();

    // 2. Count already claimed spins
    let claimedSpins = 0;
    let progressCoins = 0;

    if (!isMockMode) {
      const { data: completions } = await client
        .from('completed_offers')
        .select('*')
        .eq('user_id', userId);
      
      const signupSpins = (completions || []).filter(c => c.offer_id === 'signup_spin');
      claimedSpins = signupSpins.length;

      const first48Completions = (completions || []).filter(c => {
        const compTime = new Date(c.completed_at);
        return compTime.getTime() <= endsAt.getTime() && c.offer_id !== 'signup_spin' && c.offer_id !== 'daily_spin';
      });
      progressCoins = first48Completions.reduce((sum, c) => sum + (c.coins_earned || 0), 0);
    } else {
      const completions = getStorageItem('bc_completions', []);
      const userCompletions = completions.filter(c => c.username === profile.username);
      
      const signupSpins = userCompletions.filter(c => c.offer_title === 'Sign-up Bonus Spin');
      claimedSpins = signupSpins.length;

      const first48Completions = userCompletions.filter(c => {
        const compTime = new Date(c.completed_at);
        return compTime.getTime() <= endsAt.getTime() && c.offer_title !== 'Sign-up Bonus Spin' && c.offer_title !== 'Daily Free Spin';
      });
      progressCoins = first48Completions.reduce((sum, c) => sum + (c.coins || 0), 0);
    }

    const challengeCompleted = progressCoins >= 1000;
    const totalAllowedSpins = challengeCompleted ? 4 : 1;
    const claimsLeft = Math.max(0, totalAllowedSpins - claimedSpins);

    return {
      claimsLeft,
      progressCoins,
      challengeCompleted,
      endsAt: endsAt.toISOString(),
      timeLeftMs: Math.max(0, timeLeftMs),
      claimedSpins
    };
  },

  // 12.5 Claim Daily or Signup Spin
  claimSpin: async (userId, type, supabaseClient) => {
    if (!isMockMode && typeof window !== 'undefined') {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token || '';

      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to claim spin');
      return resData;
    }

    // Prizes array
    const SPIN_PRIZES = [
      { coins: 10, probability: 0.50, label: '$0.01', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.1)' },
      { coins: 50, probability: 0.30, label: '$0.05', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.1)' },
      { coins: 250, probability: 0.14, label: '$0.25', rarity: 'uncommon', border: '#10b981', bg: 'rgba(16,185,129,0.1)' },
      { coins: 1000, probability: 0.045, label: '$1.00', rarity: 'rare', border: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
      { coins: 2500, probability: 0.012, label: '$2.50', rarity: 'epic', border: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
      { coins: 10000, probability: 0.0029, label: '$10.00', rarity: 'legendary', border: '#eab308', bg: 'rgba(234,179,8,0.1)' },
      { coins: 250000, probability: 0.0001, label: '$250.00', rarity: 'mythic', border: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    ];

    // Roll weighted random prize
    const rand = Math.random();
    let cumulative = 0;
    let selectedPrizeIdx = 0;
    for (let i = 0; i < SPIN_PRIZES.length; i++) {
      cumulative += SPIN_PRIZES[i].probability;
      if (rand <= cumulative) {
        selectedPrizeIdx = i;
        break;
      }
    }
    const prize = SPIN_PRIZES[selectedPrizeIdx];

    if (!isMockMode) {
      // Real accounts claim spins through /api/spin (atomic, server-side).
      throw new Error('Spins must be claimed through /api/spin.');
    } else {
      // Mock Storage implementation
      const users = getStorageItem('bc_users', []);
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx === -1) throw new Error('User not found!');
      
      const user = users[userIdx];
      if (user.is_banned) throw new Error('Your account is banned.');

      const now = new Date();
      if (type === 'daily') {
        if (user.last_daily_spin_at) {
          const lastClaim = new Date(user.last_daily_spin_at);
          const timeDiff = now.getTime() - lastClaim.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);
          if (hoursDiff < 24) {
            throw new Error(`Daily spin on cooldown. Next spin available in ${Math.ceil(24 - hoursDiff)} hours.`);
          }
        }
      } else if (type === 'signup') {
        const state = await db.getSignupBonusState(userId, user, null);
        if (state.claimsLeft <= 0) {
          throw new Error('No sign-up spins left to claim.');
        }
      } else {
        throw new Error('Invalid claim type');
      }

      // Update mock user
      user.balance_coins += prize.coins;
      user.total_earned_coins += prize.coins;
      if (type === 'daily') {
        user.last_daily_spin_at = now.toISOString();
      } else {
        const state = await db.getSignupBonusState(userId, user, null);
        if (state.claimsLeft <= 1) {
          user.has_claimed_signup_bonus = true;
        }
      }

      users[userIdx] = user;
      setStorageItem('bc_users', users);

      // Update session
      const session = getStorageItem('bc_session', null);
      if (session && session.id === userId) {
        session.balance_coins = user.balance_coins;
        session.total_earned_coins = user.total_earned_coins;
        if (type === 'daily') {
          session.last_daily_spin_at = user.last_daily_spin_at;
        } else {
          session.has_claimed_signup_bonus = user.has_claimed_signup_bonus;
        }
        setStorageItem('bc_session', session);
      }

      // Add to completions log
      const completions = getStorageItem('bc_completions', []);
      completions.unshift({
        id: `c_${Math.random().toString(36).substr(2, 9)}`,
        username: user.username,
        offer_title: type === 'daily' ? 'Daily Free Spin' : 'Sign-up Bonus Spin',
        provider: 'system_spin',
        coins: prize.coins,
        completed_at: now.toISOString()
      });
      setStorageItem('bc_completions', completions);

      return {
        success: true,
        prize,
        prizeIndex: selectedPrizeIdx,
        profile: user
      };
    }
  },

  // 13. Get Global Stats (sums approved cashouts & completions)
  getStats: async () => {
    if (!isMockMode) {
      try {
        // Query count of completed_offers
        const { count: completedCount } = await supabase
          .from('completed_offers')
          .select('*', { count: 'exact', head: true });

        // Query sum of approved withdrawals
        const { data: withdrawalsData } = await supabase
          .from('withdrawals')
          .select('amount_usd')
          .eq('status', 'approved');

        const dbPaid = withdrawalsData ? withdrawalsData.reduce((sum, w) => sum + parseFloat(w.amount_usd), 0) : 0;

        // Query total registered users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        return {
          usersOnline: 500 + Math.floor(Math.random() * 200) + (userCount || 0) * 2,
          totalPaid: 84930.00 + dbPaid,
          offersCompleted: 129400 + (completedCount || 0)
        };
      } catch (err) {
        console.error("Failed to query DB stats:", err);
      }
    }
    // Fallback for mock mode
    const completions = getStorageItem('bc_completions', []);
    const withdrawals = getStorageItem('bc_withdrawals', []);
    const approvedPaid = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + parseFloat(w.amount_usd), 0);

    return {
      usersOnline: 500 + Math.floor(Math.random() * 200) + completions.length * 3,
      totalPaid: 84930.00 + approvedPaid,
      offersCompleted: 129400 + completions.length
    };
  },

  // --- ADMIN OPERATIONS ---
  adminGetWithdrawals: async () => {
    if (!isMockMode) return adminApi('/api/admin/withdrawals');
    initMockStorage();
    return getStorageItem('bc_withdrawals', []);
  },

  adminGetUsers: async () => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      initMockStorage();
      return getStorageItem('bc_users', []);
    }
  },

  logOfferClick: async (userId, username, offer) => {
    try {
      if (!isMockMode) {
        await supabase
          .from('offer_clicks')
          .insert({
            user_id: userId,
            username: username,
            offer_id: offer.id,
            offer_title: offer.title,
            provider: offer.provider
          });
      } else {
        initMockStorage();
        const clicks = getStorageItem('bc_offer_clicks', []);
        clicks.push({
          id: 'clk_' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          username: username,
          offer_id: offer.id,
          offer_title: offer.title,
          provider: offer.provider,
          clicked_at: new Date().toISOString()
        });
        setStorageItem('bc_offer_clicks', clicks);
      }
    } catch (e) {
      console.error('Failed to log click:', e);
    }
  },

  adminGetOfferClicks: async (userId) => {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('offer_clicks')
          .select('*')
          .eq('user_id', userId)
          .order('clicked_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('offer_clicks table might not exist yet:', e);
        return [];
      }
    } else {
      initMockStorage();
      const clicks = getStorageItem('bc_offer_clicks', []);
      return clicks.filter(c => c.user_id === userId);
    }
  },

  adminAdjustBalance: async (targetUserId, amount) => {
    if (isMockMode) {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const idx = users.findIndex(u => u.id === targetUserId);
      if (idx !== -1) {
        users[idx].balance_coins = Math.max(0, (users[idx].balance_coins || 0) + amount);
        if (amount > 0) {
          users[idx].total_earned_coins = (users[idx].total_earned_coins || 0) + amount;
        }
        setStorageItem('bc_users', users);
      }
      return { success: true };
    } else {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      
      const res = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, amount })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to adjust balance');
      }
      return await res.json();
    }
  },

  adminToggleBan: async (targetUserId, isBanned) => {
    if (isMockMode) {
      initMockStorage();
      const users = getStorageItem('bc_users', []);
      const idx = users.findIndex(u => u.id === targetUserId);
      if (idx !== -1) {
        users[idx].is_banned = isBanned;
        setStorageItem('bc_users', users);
      }
      return { success: true };
    } else {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      
      const res = await fetch('/api/admin/toggle-ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, isBanned })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update ban status');
      }
      return await res.json();
    }
  },

  adminUpdateWithdrawal: async (withdrawalId, status) => {
    if (!isMockMode) return adminApi('/api/admin/withdrawals', { method: 'POST', body: { id: withdrawalId, status } });
    initMockStorage();
    const withdrawals = getStorageItem('bc_withdrawals', []);
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1) throw new Error('Withdrawal request not found!');

    const w = withdrawals[idx];
    
    // If rejecting, return the coins to the user
    if (status === 'rejected' && w.status === 'pending') {
      const users = getStorageItem('bc_users', []);
      const userIdx = users.findIndex(u => u.username === w.username);
      if (userIdx !== -1) {
        users[userIdx].balance_coins += w.coins_spent;
        setStorageItem('bc_users', users);
        
        // update session if current user
        const session = getStorageItem('bc_session', null);
        if (session && session.username === w.username) {
          session.balance_coins += w.coins_spent;
          setStorageItem('bc_session', session);
        }
      }
    }

    w.status = status;
    withdrawals[idx] = w;
    setStorageItem('bc_withdrawals', withdrawals);
    return w;
  },

  adminGetSupportTickets: async () => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getStorageItem('bc_support_tickets', []);
    }
  },

  adminResolveSupportTicket: async (ticketId) => {
    return db.adminUpdateTicketStatus(ticketId, 'resolved');
  },

  adminUpdateTicketStatus: async (ticketId, status) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const tickets = getStorageItem('bc_support_tickets', []);
      const idx = tickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) {
        tickets[idx].status = status;
        setStorageItem('bc_support_tickets', tickets);
      }
      return tickets[idx] || null;
    }
  },

  getUserSupportTickets: async (userId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const tickets = getStorageItem('bc_support_tickets', []);
      const user = await db.getProfile(userId);
      if (!user) return [];
      return tickets.filter(t => t.username === user.username || t.user_id === userId);
    }
  },

  getSupportTicketMessages: async (ticketId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      const messages = getStorageItem('bc_support_ticket_messages', []);
      return messages.filter(m => m.ticket_id === ticketId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  },

  sendSupportTicketMessage: async (ticketId, senderId, senderUsername, message, isAdmin = false) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          sender_username: senderUsername,
          message: message.trim(),
          is_admin: isAdmin
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const messages = getStorageItem('bc_support_ticket_messages', []);
      const newMsg = {
        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        ticket_id: ticketId,
        sender_id: senderId,
        sender_username: senderUsername,
        message: message.trim(),
        is_admin: isAdmin,
        created_at: new Date().toISOString()
      };
      messages.push(newMsg);
      setStorageItem('bc_support_ticket_messages', messages);
      return newMsg;
    }
  },

  getReferralStats: async (userId) => {
    if (!isMockMode) {
      const { count, error: countErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', userId);
      if (countErr) throw countErr;

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('referral_earnings_total')
        .eq('id', userId)
        .single();
      if (profErr) throw profErr;

      return {
        totalReferrals: count || 0,
        totalEarnings: profile?.referral_earnings_total || 0
      };
    } else {
      const users = getStorageItem('bc_users', []);
      const referredUsers = users.filter(u => u.referred_by === userId);
      const currentUser = users.find(u => u.id === userId);
      
      return {
        totalReferrals: referredUsers.length,
        totalEarnings: currentUser?.referral_earnings_total || 0
      };
    }
  },

  getReferralsList: async (userId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, created_at, total_earned_coins')
        .eq('referred_by', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const users = getStorageItem('bc_users', []);
      return users
        .filter(u => u.referred_by === userId)
        .map(u => ({
          username: u.username,
          created_at: u.created_at,
          total_earned_coins: u.total_earned_coins
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }
};
