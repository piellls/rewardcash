'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import { Coins, Trophy, Wallet, PlayCircle, ShieldAlert, LogOut, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Earn', href: '/earn', icon: PlayCircle },
    { name: 'Cashout', href: '/cashout', icon: Wallet },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="rounded-lg bg-gradient-to-tr from-primary to-secondary p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-110">
                  <Coins className="h-6 w-6 text-black" />
                </div>
                <span className="text-xl font-bold tracking-wider text-gradient">
                  RewardCash
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors py-2 px-3 rounded-md ${
                      isActive 
                        ? 'text-primary bg-primary/5' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Controls */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* Admin Badge */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-950/20 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Admin Panel
                    </Link>
                  )}

                  {/* Coin Display */}
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-dark-border px-3.5 py-1.5">
                    <Coins className="h-4.5 w-4.5 text-yellow-500 animate-pulse-slow" />
                    <span className="font-bold text-white tracking-wide">
                      {user.balance_coins?.toLocaleString() || 0}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                      Coins
                    </span>
                  </div>

                  {/* Profile & Logout */}
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/dashboard"
                      className="flex items-center gap-2 hover:text-primary text-zinc-200 transition-colors"
                    >
                      <img 
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={user.username}
                        className="h-8 w-8 rounded-full border border-dark-border"
                      />
                      <span className="text-sm font-bold">
                        {user.username}
                      </span>
                    </Link>

                    <button 
                      onClick={logout}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openAuth('login')}
                    className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              {user && (
                <div className="flex items-center gap-2 mr-4 rounded-lg bg-zinc-900 border border-dark-border px-2.5 py-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-bold text-white">
                    {user.balance_coins || 0}
                  </span>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-border bg-dark-bg/95 px-4 py-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-semibold tracking-wide transition-colors ${
                    isActive 
                      ? 'text-primary bg-primary/5' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-semibold text-red-400 hover:bg-zinc-900"
              >
                <ShieldAlert className="h-5 w-5" />
                Admin Panel
              </Link>
            )}

            <hr className="border-dark-border my-2" />

            {loading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-850" />
            ) : user ? (
              <div className="space-y-3">
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-1 hover:text-primary text-zinc-200 transition-colors"
                >
                  <img 
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-dark-border"
                  />
                  <span className="text-base font-bold">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-base font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => openAuth('login')}
                  className="rounded-lg border border-dark-border py-2 text-center text-sm font-semibold text-zinc-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="rounded-lg bg-primary py-2 text-center text-sm font-bold text-black"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialTab={authTab} 
      />
    </>
  );
}
