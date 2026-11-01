'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import DirectTasksSection from '@/components/DirectTasksSection';
import PageHeader, { Chip } from '@/components/PageHeader';
import { Reveal, AnimatedNumber } from '@/components/motion';
import { PlayCircle, Coins } from 'lucide-react';

export default function Earn() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');

  const openAuth = (tab) => { setAuthTab(tab); setIsAuthOpen(true); };

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-6 pb-10 pt-2 md:px-8 lg:px-10 2xl:px-14">
      <PageHeader
        eyebrow="Earn"
        icon={PlayCircle}
        title="Earn"
        accent="coins"
        art="gem"
        artGlow="blue"
        subtitle="Play games, try apps and answer surveys. Pick a task and get paid in coins."
      >
        <Chip icon={Coins} tone="gold">1,000 coins = $1.00</Chip>
        {user && (
          <Chip tone="green">
            Balance: <AnimatedNumber value={user.balance_coins || 0} className="tabular-nums" /> coins
          </Chip>
        )}
      </PageHeader>

      {!user && (
        <Reveal className="g-neon g-neon-live mb-8 flex flex-col items-center justify-between gap-4 p-5 sm:flex-row sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-lg font-extrabold text-white">Sign up to start earning</p>
            <p className="text-sm text-zinc-400">Free, no deposit. You start with 100 coins.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openAuth('login')} className="btn-gaming-secondary min-h-[2.75rem] rounded-xl px-5 text-xs">Log in</button>
            <button onClick={() => openAuth('register')} className="btn-gaming min-h-[2.75rem] rounded-xl px-5 text-xs">Register</button>
          </div>
        </Reveal>
      )}

      <DirectTasksSection />

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
