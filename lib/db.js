import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Supabase client instance
export const supabase = isMockMode ? null : createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATABASE (localStorage based) ---
const DEFAULT_LEADERBOARD = [
  { username: 'EarnMaster', balance_coins: 125000, total_earned_coins: 345000, avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { username: 'CoinKing', balance_coins: 43200, total_earned_coins: 210900, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { username: 'TaskSlayer', balance_coins: 15400, total_earned_coins: 98600, avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' },
  { username: 'SurveyNinja', balance_coins: 3200, total_earned_coins: 87400, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { username: 'RewardHunter', balance_coins: 1800, total_earned_coins: 65200, avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
];

const DEFAULT_OFFERS = [
  { id: 'off_1', title: 'Board Kings: Level 11', description: 'Install, play and complete Level 11 within 10 days.', coins: 4500, payout: 4.50, provider: 'CPALead', category: 'Game', icon: '🎮' },
  { id: 'off_2', title: 'Opinion World Survey', description: 'Complete a quick 10-minute survey about daily products.', coins: 1200, payout: 1.20, provider: 'AdGate Media', category: 'Survey', icon: '📝' },
  { id: 'off_3', title: 'Crypto.com App', description: 'Download, register a free account and verify your email.', coins: 8000, payout: 8.00, provider: 'CPALead', category: 'App', icon: '📱' },
  { id: 'off_4', title: 'Lords Mobile: Attack Level 2', description: 'Attack a level 2 monster to redeem your points.', coins: 6500, payout: 6.50, provider: 'AdGate Media', category: 'Game', icon: '⚔️' },
  { id: 'off_5', title: 'SayMore Surveys', description: 'Share your opinions and complete your profiling survey.', coins: 1500, payout: 1.50, provider: 'Lootably', category: 'Survey', icon: '🗣️' },
  { id: 'off_6', title: 'TikTok Install', description: 'Download TikTok, open and register as a new user.', coins: 500, payout: 0.50, provider: 'CPALead', category: 'App', icon: '🎵' }
];

const DEFAULT_WITHDRAWALS = [
  { id: 'w_1', username: 'TaskSlayer', amount_usd: 10.00, coins_spent: 10000, payment_method: 'paypal', payment_address: 'slayer.rewards@gmail.com', status: 'pending', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'w_2', username: 'CoinKing', amount_usd: 50.00, coins_spent: 50000, payment_method: 'ltc', payment_address: 'LeT7KzRt6yA9qWjQY5pX2cMv1bN3sZ8eXy', status: 'approved', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'w_3', username: 'EarnMaster', amount_usd: 100.00, coins_spent: 100000, payment_method: 'paypal', payment_address: 'master.earner@paypal.com', status: 'approved', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
];

const initMockStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('rc_users')) {
    const adminUser = {
      id: 'admin_uuid',
      email: 'admin@rewardcash.co',
      username: 'admin',
      password: 'admin123', // stored as clear text for simplicity in mock
      balance_coins: 0,
      total_earned_coins: 0,
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    // Add default users
    const mockUsers = [
      adminUser,
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
    
    localStorage.setItem('rc_users', JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem('rc_withdrawals')) {
    localStorage.setItem('rc_withdrawals', JSON.stringify(DEFAULT_WITHDRAWALS));
  }

  if (!localStorage.getItem('rc_completions')) {
    localStorage.setItem('rc_completions', JSON.stringify([
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

export const db = {
  // 1. Get available offers
  getOffers: () => {
    return DEFAULT_OFFERS;
  },

  // 2. Sign Up
  signUp: async (username, email, password) => {
    if (!isMockMode) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      if (error) throw error;
      return data.user;
    } else {
      initMockStorage();
      const users = getStorageItem('rc_users', []);
      
      if (users.some(u => u.email === email)) {
        throw new Error('Email is already registered!');
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username is already taken!');
      }

      const newUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        username,
        password, // In real app it is hashed by Supabase auth
        balance_coins: 0,
        total_earned_coins: 0,
        role: 'user',
        avatar_url: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1599566150163-29194dcaad36', '1507003211169-0a1dd7228f2d'][Math.floor(Math.random() * 4)]}?w=150`,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      setStorageItem('rc_users', users);
      setStorageItem('rc_session', newUser);
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
      const users = getStorageItem('rc_users', []);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password!');
      }

      setStorageItem('rc_session', user);
      return user;
    }
  },

  // 4. Sign Out
  signOut: async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rc_session');
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
      return getStorageItem('rc_session', null);
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
      const users = getStorageItem('rc_users', []);
      const user = users.find(u => u.id === userId);
      return user || null;
    }
  },

  // 7. Get Leaderboard (sorted by total coins)
  getLeaderboard: async () => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, balance_coins, total_earned_coins, avatar_url')
        .order('total_earned_coins', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    } else {
      const users = getStorageItem('rc_users', []);
      return users
        .filter(u => u.role !== 'admin')
        .sort((a, b) => b.total_earned_coins - a.total_earned_coins)
        .slice(0, 10);
    }
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
      const completions = getStorageItem('rc_completions', []);
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
      const withdrawals = getStorageItem('rc_withdrawals', []);
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
      const users = getStorageItem('rc_users', []);
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx === -1) throw new Error('User not found!');
      
      const user = users[userIdx];
      if (user.balance_coins < coinsSpent) {
        throw new Error('Insufficient coins balance!');
      }

      // Deduct coins
      user.balance_coins -= coinsSpent;
      users[userIdx] = user;
      setStorageItem('rc_users', users);
      
      // Update session
      const session = getStorageItem('rc_session', null);
      if (session && session.id === userId) {
        session.balance_coins -= coinsSpent;
        setStorageItem('rc_session', session);
      }

      // Add withdrawal
      const withdrawals = getStorageItem('rc_withdrawals', []);
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
      setStorageItem('rc_withdrawals', withdrawals);
      return newWithdrawal;
    }
  },

  // 11. Complete an offer (triggers payout simulation locally)
  completeOffer: async (userId, offerId) => {
    const offer = DEFAULT_OFFERS.find(o => o.id === offerId);
    if (!offer) throw new Error('Offer not found');

    if (!isMockMode) {
      // In Supabase mode, we normally receive postback from CPALead.
      // But we can allow a dev simulation trigger if we have service_role keys,
      // or we can invoke our own local API route to simulate the exact server-side flow.
      const response = await fetch(`/api/postback?click_id=${userId}&offer_id=${offerId}&payout=${offer.payout}&coins=${offer.coins}&provider=${offer.provider.toLowerCase()}`);
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to simulate completion');
      return resData;
    } else {
      const users = getStorageItem('rc_users', []);
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx === -1) throw new Error('User not found!');
      
      const user = users[userIdx];
      user.balance_coins += offer.coins;
      user.total_earned_coins += offer.coins;
      users[userIdx] = user;
      setStorageItem('rc_users', users);

      // Update session
      const session = getStorageItem('rc_session', null);
      if (session && session.id === userId) {
        session.balance_coins += offer.coins;
        session.total_earned_coins += offer.coins;
        setStorageItem('rc_session', session);
      }

      // Add to completions
      const completions = getStorageItem('rc_completions', []);
      const newCompletion = {
        id: `c_${Math.random().toString(36).substr(2, 9)}`,
        username: user.username,
        offer_title: offer.title,
        provider: offer.provider,
        coins: offer.coins,
        completed_at: new Date().toISOString()
      };
      completions.unshift(newCompletion);
      setStorageItem('rc_completions', completions);
      return newCompletion;
    }
  },

  // 12. Get Live Feed (returns last 10 global completions)
  getLiveFeed: () => {
    if (isMockMode) {
      return getStorageItem('rc_completions', []).slice(0, 10);
    } else {
      // In Supabase, fetch global completed_offers joining profiles
      // For mock simplicity, fallback to local storage
      return getStorageItem('rc_completions', []).slice(0, 10);
    }
  },

  // --- ADMIN OPERATIONS ---
  adminGetWithdrawals: async () => {
    initMockStorage();
    // Simply read from local storage for easy demo, even in Supabase mode for frontend demo purposes
    return getStorageItem('rc_withdrawals', []);
  },

  adminGetUsers: async () => {
    initMockStorage();
    const users = getStorageItem('rc_users', []);
    return users.filter(u => u.role !== 'admin');
  },

  adminUpdateWithdrawal: async (withdrawalId, status) => {
    initMockStorage();
    const withdrawals = getStorageItem('rc_withdrawals', []);
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1) throw new Error('Withdrawal request not found!');

    const w = withdrawals[idx];
    
    // If rejecting, return the coins to the user
    if (status === 'rejected' && w.status === 'pending') {
      const users = getStorageItem('rc_users', []);
      const userIdx = users.findIndex(u => u.username === w.username);
      if (userIdx !== -1) {
        users[userIdx].balance_coins += w.coins_spent;
        setStorageItem('rc_users', users);
        
        // update session if current user
        const session = getStorageItem('rc_session', null);
        if (session && session.username === w.username) {
          session.balance_coins += w.coins_spent;
          setStorageItem('rc_session', session);
        }
      }
    }

    w.status = status;
    withdrawals[idx] = w;
    setStorageItem('rc_withdrawals', withdrawals);
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
      return getStorageItem('rc_support_tickets', []);
    }
  },

  adminResolveSupportTicket: async (ticketId) => {
    if (!isMockMode) {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', ticketId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const tickets = getStorageItem('rc_support_tickets', []);
      const idx = tickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) {
        tickets[idx].status = 'resolved';
        setStorageItem('rc_support_tickets', tickets);
      }
      return tickets[idx] || null;
    }
  }
};
