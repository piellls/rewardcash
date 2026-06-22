import Link from 'next/link';
import { Coins, Heart, Github, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-dark-border bg-dark-bg/60 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-tr from-primary to-secondary p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Coins className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-wider text-gradient">
                RewardCash
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm">
              RewardCash is the ultimate platform to earn free rewards by completing simple online tasks, games, and surveys. Direct cashouts, instant processing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Navigation</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/earn" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Earn Coins
                </Link>
              </li>
              <li>
                <Link href="/cashout" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Cashout
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Trust */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Legal & Support</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>SSL Secured Connection</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <ShieldAlert className="h-4 w-4 text-secondary" />
                <span>Anti-Cheat Protection</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-400" />
                <a href="mailto:support@rewardcash.co" className="hover:text-white transition-colors">
                  support@rewardcash.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-dark-border my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} RewardCash. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the community.
          </p>
        </div>
      </div>
    </footer>
  );
}
