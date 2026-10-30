'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import SupportModal from './SupportModal';
import { AnimatedNumber } from './motion';
import SoundToggle from './SoundToggle';
import { Coins, Trophy, Wallet, PlayCircle, ShieldAlert, LogOut, MessageSquare, Users, Gift } from 'lucide-react';

const calculateLevel = (totalEarned = 0) => {
  if (totalEarned < 1000) return { level: 1, current: totalEarned, next: 1000, percentage: (totalEarned / 1000) * 100 };
  if (totalEarned < 5000) return { level: 2, current: totalEarned - 1000, next: 4000, percentage: ((totalEarned - 1000) / 4000) * 100 };
  if (totalEarned < 20000) return { level: 3, current: totalEarned - 5000, next: 15000, percentage: ((totalEarned - 5000) / 15000) * 100 };
  if (totalEarned < 100000) return { level: 4, current: totalEarned - 20000, next: 80000, percentage: ((totalEarned - 20000) / 80000) * 100 };
  return { level: 5, current: totalEarned - 100000, next: 500000, percentage: Math.min(((totalEarned - 100000) / 500000) * 100, 100) };
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Lets other components (the footer) open the support modal
  useEffect(() => {
    const open = () => setIsSupportOpen(true);
    window.addEventListener('bb:open-support', open);
    return () => window.removeEventListener('bb:open-support', open);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      // The home page has its own sign-up card, so the dialog is only needed on the other pages
      if (ref && !user && !loading && pathname !== '/') {
        const hasAutoOpened = sessionStorage.getItem('rc_ref_auto_opened');
        if (!hasAutoOpened) {
          sessionStorage.setItem('rc_ref_auto_opened', 'true');
          setAuthTab('register');
          setIsAuthOpen(true);
        }
      }
    }
  }, [user, loading, pathname]);

  const navItems = [
    { name: 'Earn', href: '/earn', icon: PlayCircle },
    { name: 'Daily Spin', href: '/spin', icon: Gift },
    { name: 'Cashout', href: '/cashout', icon: Wallet },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Support', href: '#support', icon: MessageSquare }
  ];

  const levelData = calculateLevel(user?.total_earned_coins || 0);

  return (
    <>
      {/* 1. TOP HEADER (sticky on mobile, right-aligned next to sidebar on desktop) */}
      <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-18 glass-nav flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Logo (hidden on desktop sidebar) */}
        <div className="flex items-center md:hidden">
          <Link href="/" className="flex items-center" aria-label="BlueberryCash home">
            <img
              src="/offerwall/blueberry_logo.png"
              alt="BlueberryCash"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Level XP bar (desktop header centre) */}
        <div className="hidden md:flex items-center gap-3 g-card rounded-xl! px-4 py-2 max-w-sm w-full group relative">
          {user ? (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-black text-white shadow-[0_0_14px_rgba(120,84,247,0.55)]">
                {levelData.level}
              </span>
              <div className="flex flex-col flex-1 min-w-0 gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="uppercase tracking-wider text-[#c3b2ff]">Level {levelData.level}</span>
                  <span className="text-zinc-400 tabular-nums">{levelData.current.toLocaleString()} / {levelData.next.toLocaleString()} XP</span>
                </div>
                <div className="g-xp" style={{ '--p': Math.max(0.02, Math.min(1, levelData.percentage / 100)) }}>
                  <i />
                </div>
              </div>
              <div className="pointer-events-none absolute left-0 right-0 top-14 z-50 space-y-2 rounded-xl border border-dark-border bg-dark-card p-4 text-xs text-zinc-300 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100">
                <p className="mb-1.5 border-b border-dark-border pb-1.5 text-center font-bold text-white">XP level details</p>
                <div className="flex justify-between">
                  <span>Current XP</span>
                  <span className="font-bold text-white tabular-nums">{(user?.total_earned_coins || 0).toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>To next level</span>
                  <span className="font-bold text-[#c3b2ff] tabular-nums">{(levelData.next - levelData.current).toLocaleString()} XP</span>
                </div>
                <p className="border-t border-dark-border pt-1.5 text-[11px] leading-relaxed text-zinc-400">Every coin you earn counts as 1 XP. Your level shows next to your name.</p>
              </div>
            </>
          ) : (
            <div className="w-full text-center text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Level bar unlocks when you register
            </div>
          )}
        </div>

        {/* User Controls (Sign In / Register / Balance / Profile) */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-dark-card border border-dark-border" />
          ) : user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Coin balance */}
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(120,84,247,0.4)] bg-[var(--bb-surface)] px-3.5 py-1.5 shadow-[0_0_18px_-4px_rgba(120,84,247,0.55)]">
                <Coins className="h-4 w-4 text-[#c3b2ff]" aria-hidden="true" />
                <AnimatedNumber celebrate value={user.balance_coins || 0} className="font-black text-white text-sm tabular-nums" />
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:inline">Coins</span>
              </div>

              <SoundToggle className="hidden sm:flex" />

              {/* Mobile free spin button */}
              <Link
                href="/spin"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-[#c3b2ff] transition-transform duration-100 active:scale-95 md:hidden"
                title="Daily Spin"
                aria-label="Daily spin"
              >
                <Gift className="h-5 w-5" />
                <span className="g-live absolute -right-0.5 -top-0.5" />
              </Link>

              {/* Profile */}
              <Link href="/dashboard" className="group flex items-center gap-2 active:scale-95 transition-transform duration-100">
                <img
                  src={user.avatar_url || '/avatars/1.png'}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-primary/50 object-cover transition-[border-color] group-hover:border-primary"
                />
                <span className="hidden text-sm font-bold text-white sm:inline">{user.username}</span>
              </Link>

              <button
                onClick={logout}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white active:scale-95"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <SoundToggle className="hidden sm:flex" />
              <Link
                href="/spin"
                className="relative mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-[#c3b2ff] transition-transform duration-100 active:scale-95 md:hidden"
                title="Daily Spin"
                aria-label="Daily spin"
              >
                <Gift className="h-5 w-5" />
                <span className="g-live absolute -right-0.5 -top-0.5" />
              </Link>
              <Link href="/signin" className="btn-gaming-secondary inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm">
                Sign in
              </Link>
              <Link href="/#signup" className="btn-gaming inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 2. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 flex-col z-40 border-r border-dark-border bg-[var(--bb-sidebar)]">
        <div className="h-24 shrink-0 flex items-center px-6 border-b border-dark-border">
          <Link href="/" className="flex w-full items-center" aria-label="BlueberryCash home">
            <img src="/offerwall/blueberry_logo.png" alt="BlueberryCash" className="h-20 w-auto object-contain" />
          </Link>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSupport = item.name === 'Support';
            const isActive = !isSupport && pathname === item.href;

            if (isSupport) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsSupportOpen(true)}
                  className="g-nav w-full text-left text-sm"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className="g-nav text-sm"
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#c3b2ff]' : ''}`} aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-dark-border p-4">
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-xl border border-accent-red/30 bg-accent-red/10 py-2.5 text-xs font-bold text-[#ff8f9c] transition-colors hover:bg-accent-red/20 active:scale-[0.98]"
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Admin panel
            </Link>
          )}
        </div>
      </aside>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav aria-label="Main" className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-dark-border bg-[var(--bb-sidebar)]/95 px-2 backdrop-blur-lg">
        {navItems.filter((item) => item.name !== 'Daily Spin').map((item) => {
          const Icon = item.icon;
          const isSupport = item.name === 'Support';
          const isActive = !isSupport && pathname === item.href;

          const inner = (
            <>
              <span className={`mb-0.5 grid h-8 w-8 place-items-center rounded-xl transition-colors duration-150 ${isActive ? 'bg-primary/25 text-white shadow-[0_0_14px_rgba(120,84,247,0.6)]' : 'text-zinc-400'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-white' : 'text-zinc-400'}`}>{item.name}</span>
            </>
          );

          if (isSupport) {
            return (
              <button key={item.name} onClick={() => setIsSupportOpen(true)} className="flex flex-1 flex-col items-center justify-center py-1 transition-transform duration-100 active:scale-95">
                {inner}
              </button>
            );
          }

          return (
            <Link key={item.name} href={item.href} aria-current={isActive ? 'page' : undefined} className="flex flex-1 flex-col items-center justify-center py-1 transition-transform duration-100 active:scale-95">
              {inner}
            </Link>
          );
        })}
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
