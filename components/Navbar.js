'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import SupportModal from './SupportModal';
import LiveFeedBanner from './LiveFeedBanner';
import { Coins, Trophy, Wallet, PlayCircle, ShieldAlert, LogOut, MessageSquare, User, Users, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref && !user && !loading) {
        const hasAutoOpened = sessionStorage.getItem('rc_ref_auto_opened');
        if (!hasAutoOpened) {
          sessionStorage.setItem('rc_ref_auto_opened', 'true');
          setAuthTab('register');
          setIsAuthOpen(true);
        }
      }
    }
  }, [user, loading]);

  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const navItems = [
    { name: 'Earn', href: '/earn', icon: PlayCircle },
    { name: 'Cashout', href: '/cashout', icon: Wallet },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Support', href: '#support', icon: MessageSquare }
  ];

  const levelData = calculateLevel(user?.total_earned_coins || 0);

  return (
    <>
      {/* 1. TOP HEADER (sticky on mobile, right-aligned next to sidebar on desktop) */}
      <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-16 glass-nav flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-dark-border">
        {/* Mobile Logo (hidden on desktop sidebar) */}
        <div className="flex items-center md:hidden">
          <Link href="/" className="flex items-center group">
            <span className="text-lg font-black tracking-wider text-white">
              Reward<span className="text-primary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Cash</span>
            </span>
          </Link>
        </div>

        {/* Level XP Progress Bar (Desktop Header Center) */}
        <div className="hidden md:flex items-center gap-3 bg-dark-bg/80 border border-dark-border rounded-xl px-4 py-1.5 max-w-sm w-full group relative cursor-pointer transition-all hover:border-primary/30">
          {user ? (
            <>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-0.5">
                  <span className="text-primary font-black uppercase">Level {levelData.level}</span>
                  <span className="text-zinc-500">{levelData.current.toLocaleString()} / {levelData.next.toLocaleString()} XP</span>
                </div>
                <div className="h-1.5 w-full bg-dark-card rounded-full overflow-hidden border border-dark-border/40">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,231,1,0.5)]" 
                    style={{ width: `${levelData.percentage}%` }}
                  />
                </div>
              </div>
              <div className="absolute top-12 left-0 right-0 p-4 bg-dark-card border border-dark-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-zinc-350 space-y-2">
                <p className="font-bold text-white text-center border-b border-dark-border/60 pb-1.5 mb-1.5">XP Level Details</p>
                <div className="flex justify-between">
                  <span>Current XP:</span>
                  <span className="font-bold text-white">{(user?.total_earned_coins || 0).toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>XP to Next Lvl:</span>
                  <span className="font-bold text-primary">{(levelData.next - levelData.current).toLocaleString()} XP</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed pt-1.5 border-t border-dark-border/40">Earn more coins by completing offers to level up. Higher levels show your dominance on the rankings!</p>
              </div>
            </>
          ) : (
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center w-full">
              Leveling bar locked • Register to start
            </div>
          )}
        </div>

        {/* User Controls (Sign In / Register / Balance / Profile) */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-dark-card border border-dark-border" />
          ) : user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Coin Display */}
              <div className="flex items-center gap-2 rounded-xl bg-dark-bg border border-dark-border px-3.5 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                <div className="rounded-full bg-primary/10 p-0.5">
                  <Coins className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <span className="font-black text-white text-xs sm:text-sm tracking-wide">
                  {user.balance_coins?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:inline">
                  Coins
                </span>
              </div>

              {/* Profile Avatar link */}
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 hover:text-primary text-zinc-200 transition-all active:scale-95 group"
              >
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                  alt={user.username}
                  className="h-8 w-8 rounded-full border border-dark-border group-hover:border-primary group-hover:shadow-[0_0_8px_rgba(0,231,1,0.3)] transition-all object-cover"
                />
                <span className="text-xs sm:text-sm font-bold hidden sm:inline group-hover:text-white transition-colors">
                  {user.username}
                </span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={logout}
                className="rounded-xl p-2 text-zinc-500 hover:bg-dark-bg hover:text-white active:scale-95 transition-all"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => openAuth('login')}
                className="btn-gaming-secondary rounded-xl px-4 py-2 text-xs sm:text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('register')}
                className="btn-gaming rounded-xl px-4 py-2 text-xs sm:text-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Live Feed Banner (Global User Activities) */}
      <LiveFeedBanner />      {/* 2. DESKTOP SIDEBAR (fixed on the left, hidden on mobile) */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-dark-card border-r border-dark-border flex-col z-40">
        {/* Sidebar Logo Header */}
        <div className="h-16 border-b border-dark-border/40 flex items-center px-4 shrink-0">
          <Link href="/" className="flex items-center group w-full">
            <span className="text-xl font-black tracking-wider text-white">
              Reward<span className="text-primary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Cash</span>
            </span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSupport = item.name === 'Support';
            const isActive = !isSupport && pathname === item.href;

            if (isSupport) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsSupportOpen(true)}
                  className="flex w-full items-center justify-between text-sm font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-dark-bg/40 py-2.5 px-4 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer border-none bg-transparent text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-transparent text-zinc-500 group-hover:bg-dark-bg/60 group-hover:text-primary transition-colors border border-transparent group-hover:border-dark-border/40">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    {item.name}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between text-sm font-semibold tracking-wide py-2.5 px-4 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all relative group overflow-hidden ${
                  isActive 
                    ? 'text-primary bg-primary/5 font-bold border-l-2 border-primary shadow-[inset_1px_0_0_rgba(0,231,1,0.2)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-dark-bg/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-all border ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_8px_rgba(0,231,1,0.2)]' 
                      : 'bg-transparent text-zinc-500 border-transparent group-hover:bg-dark-bg/60 group-hover:text-primary group-hover:border-dark-border/40'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  {item.name}
                </div>
                <ChevronRight className={`h-3.5 w-3.5 transition-all ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 text-zinc-500'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Admin Controls */}
        <div className="p-4 border-t border-dark-border/40 shrink-0 space-y-2">
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-xl border border-accent-red/20 bg-accent-red/5 py-2.5 text-xs font-bold text-accent-red hover:bg-accent-red/10 active:scale-[0.98] transition-all"
            >
              <ShieldAlert className="h-4 w-4 animate-pulse" />
              Admin Control Panel
            </Link>
          )}
          <div className="text-[10px] text-zinc-500 text-center py-1 font-semibold uppercase tracking-wider">
            RewardCash v1.4.0 • Stake Style
          </div>
        </div>
      </aside>

      {/* 3. MOBILE BOTTOM NAVIGATION (fixed at bottom, hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-card/95 backdrop-blur-lg border-t border-dark-border flex items-center justify-around z-40 px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSupport = item.name === 'Support';
          const isActive = !isSupport && pathname === item.href;

          if (isSupport) {
            return (
              <button
                key={item.name}
                onClick={() => setIsSupportOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer border-none bg-transparent group"
              >
                <div className="p-1 rounded-lg bg-transparent text-zinc-500 group-hover:bg-dark-bg/40 group-hover:text-primary transition-colors mb-0.5">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-bold tracking-wide">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all group ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all border ${
                isActive 
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_8px_rgba(0,231,1,0.2)]' 
                  : 'bg-transparent text-zinc-500 border-transparent group-hover:bg-dark-bg/40 group-hover:text-primary'
              } mb-0.5`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-bold tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialTab={authTab} 
      />

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />
    </>
  );
}
