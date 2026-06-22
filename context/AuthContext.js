'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/db';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  earnCoinsSimulated: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const sessionUser = await db.getCurrentUser();
      if (sessionUser) {
        // Fetch fresh profile data to get latest balance
        const profile = await db.getProfile(sessionUser.id);
        setUser(profile);
      } else {
        setUser(null);
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
      setUser(u);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, earnCoinsSimulated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
