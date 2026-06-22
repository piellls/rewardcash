'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import SupportModal from './SupportModal';
import { Coins, Trophy, Wallet, PlayCircle, ShieldAlert, LogOut, MessageSquare, User, Users } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const navItems = [
    { name: 'Earn', href: '/earn', icon: PlayCircle },
    { name: 'Cashout', href: '/cashout', icon: Wallet },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Referrals', href: '/referrals', icon: User },
    { name: 'Support', href: '#support', icon: MessageSquare }
  ];

  return (
    <>
      {/* 1. TOP HEADER (sticky on mobile, right-aligned next to sidebar on desktop) */}
      <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-16 glass-nav flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Logo (hidden on desktop sidebar) */}
        <div className="flex items-center md:hidden">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-tr from-primary to-accent-cyan p-1.5 shadow-[0_0_10px_rgba(35,231,133,0.3)]">
              <Coins className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-wider text-gradient">
              RewardCash
            </span>
          </Link>
        </div>

        {/* Desktop Header Spacer (page title) */}
        <div className="hidden md:block">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            {pathname === '/' ? 'Home Dashboard' : pathname.replace('/', '')}
          </span>
        </div>

        {/* User Controls (Sign In / Register / Balance / Profile) */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-900 border border-dark-border" />
          ) : user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Coin Display */}
              <div className="flex items-center gap-2 rounded-lg bg-zinc-950 border border-dark-border px-3 py-1.5">
                <Coins className="h-4.5 w-4.5 text-yellow-500 animate-pulse-slow" />
                <span className="font-bold text-white text-xs sm:text-sm tracking-wide">
                  {user.balance_coins?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hidden sm:inline">
                  Coins
                </span>
              </div>

              {/* Profile Avatar link */}
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 hover:text-primary text-zinc-200 transition-colors"
              >
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                  alt={user.username}
                  className="h-8 w-8 rounded-full border border-dark-border"
                />
                <span className="text-xs sm:text-sm font-bold hidden sm:inline">
                  {user.username}
                </span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={logout}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => openAuth('login')}
                className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('register')}
                className="rounded-lg bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. DESKTOP SIDEBAR (fixed on the left, hidden on mobile) */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-dark-card border-r border-dark-border flex-col z-40">
        {/* Sidebar Logo Header */}
        <div className="h-16 border-b border-dark-border/40 flex items-center px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-tr from-primary to-accent-cyan p-1.5 shadow-[0_0_10px_rgba(35,231,133,0.3)] transition-transform group-hover:scale-110">
              <Coins className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-wider text-gradient">
              RewardCash
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
                  className="flex w-full items-center gap-3 text-sm font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-zinc-900/40 py-2.5 px-4 rounded-xl transition-all cursor-pointer border-none bg-transparent text-left"
                >
                  <Icon className="h-4.5 w-4.5 text-zinc-500" />
                  {item.name}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 text-sm font-semibold tracking-wide py-2.5 px-4 rounded-xl transition-all ${
                  isActive 
                    ? 'text-primary bg-primary/5 font-bold border-l-2 border-primary' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Admin Controls */}
        <div className="p-4 border-t border-dark-border/40 shrink-0 space-y-2">
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-xl border border-accent-red/20 bg-accent-red/5 py-2.5 text-xs font-bold text-accent-red hover:bg-accent-red/10 transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Control Panel
            </Link>
          )}
          <div className="text-[10px] text-zinc-500 text-center py-1 font-semibold uppercase tracking-wider">
            RewardCash v1.2.0 • Coinhub Style
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
                className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <Icon className="h-5 w-5 mb-0.5 text-zinc-500" />
                <span className="text-[10px] font-bold tracking-wide">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
              <span className="text-[10px] font-bold tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
