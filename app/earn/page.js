'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import DirectTasksSection from '@/components/DirectTasksSection';
import PageHeader, { Chip } from '@/components/PageHeader';
import { Reveal, AnimatedNumber } from '@/components/motion';
import { PlayCircle, Coins, MousePointerClick, Flag, Hourglass } from 'lucide-react';

const HOW = [
  { icon: MousePointerClick, title: 'Pick a task', text: 'Every card shows the reward in coins before you start.' },
  { icon: Flag, title: 'Finish it', text: 'Follow the steps in the task. Skipping a step usually means no credit.' },
  { icon: Hourglass, title: 'Coins arrive', text: 'The advertiser confirms your task, then the coins land in your balance.' },
];

export default function Earn() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');

  const openAuth = (tab) => { setAuthTab(tab); setIsAuthOpen(true); };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Earn"
        icon={PlayCircle}
        title="Earn"
        accent="coins"
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
            <button onClick={() => openAuth('login')} className="btn-gaming-secondary min-h-[44px] rounded-xl px-5 text-xs">Log in</button>
            <button onClick={() => openAuth('register')} className="btn-gaming min-h-[44px] rounded-xl px-5 text-xs">Register</button>
          </div>
        </Reveal>
      )}

      <ol className="mb-10 grid gap-3 sm:grid-cols-3">
        {HOW.map((h, i) => (
          <Reveal as="li" key={h.title} i={i}>
            <div className="g-card flex h-full items-start gap-4 p-4">
              <span className="icon-wrapper-primary h-11 w-11 shrink-0">
                <h.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-white">{i + 1}. {h.title}</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{h.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <DirectTasksSection />

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
