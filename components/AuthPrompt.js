'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

// One shared sign-up popup for the whole site.
//   openAuth('register' | 'login')  opens it from anywhere (a task click, the daily spin, support...).
//   Visitors who are not signed in and leave the page untouched for IDLE_PROMPT_MS get it too.
// The idle nudge is shown once per browser session, so closing it never starts a nagging loop.

export const IDLE_PROMPT_MS = 15000;

const SEEN_KEY = 'bb_auth_prompt_seen';
// Pages where an unprompted popup would only get in the way: the policies, the sign-in page itself,
// the staff area and the referral redirect.
const QUIET_PATHS = ['/signin', '/privacy', '/terms', '/admin', '/ref'];
const ACTIVITY = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'wheel', 'touchstart'];

const isQuiet = (path) => QUIET_PATHS.some((p) => path === p || path?.startsWith(`${p}/`));

// Storage can be blocked (private mode, cookies off). The page must still work without it.
const wasSeen = () => { try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } };

const AuthPromptContext = createContext({ openAuth: () => {} });

export function AuthPromptProvider({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [tab, setTab] = useState(null); // null = closed

  const openAuth = useCallback((which = 'register') => {
    markSeen();
    setTab(which === 'login' ? 'login' : 'register');
  }, []);
  const close = useCallback(() => setTab(null), []);

  // Signing in (by any route) closes the popup.
  useEffect(() => {
    if (user && tab !== null) setTab(null);
  }, [user, tab]);

  // Idle nudge for visitors.
  useEffect(() => {
    if (loading || user || tab !== null || isQuiet(pathname) || wasSeen()) return undefined;

    let last = Date.now();
    let timer;
    const touch = () => { last = Date.now(); };
    const tick = () => {
      const wait = IDLE_PROMPT_MS - (Date.now() - last);
      if (wait > 0) { timer = setTimeout(tick, wait); return; }
      // Not while the tab is in the background or another dialog (support, an offer...) is already open.
      if (document.hidden || document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        last = Date.now();
        timer = setTimeout(tick, IDLE_PROMPT_MS);
        return;
      }
      openAuth('register');
    };

    ACTIVITY.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    timer = setTimeout(tick, IDLE_PROMPT_MS);
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [loading, user, tab, pathname, openAuth]);

  const value = useMemo(() => ({ openAuth }), [openAuth]);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      {tab !== null && <AuthModal isOpen onClose={close} defaultTab={tab} />}
    </AuthPromptContext.Provider>
  );
}

export const useAuthPrompt = () => useContext(AuthPromptContext);
