'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import DirectTasksSection from '@/components/DirectTasksSection';
import { Gamepad2, Play, Lock } from 'lucide-react';

export default function Earn() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const partnerWalls = [
    { name: 'AdBlueMedia', desc: 'Highest paying surveys', badge: 'Daily Tasks', banner: '/banners/lootably.png', active: true },
    { name: 'OGAds', desc: 'Premium app installs', badge: 'Bonus Offers', banner: '/banners/ogads.png', active: false },
    { name: 'Lootably', desc: 'Watch videos & play', badge: 'Big Rewards', banner: '/banners/adbluemedia.png', active: false },
  ];

  return (
    <div className="page-earn-bg mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start animate-fade-in">
      
      {/* Page Title Header */}
      <div className="text-center py-10 flex flex-col items-center justify-center select-none">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Earn <span className="text-gradient">Credits</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Complete the tasks below to earn credits instantly.
        </p>
      </div>

      {/* 2. PARTNER WALLS GRID (BANNERS) */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <div className="icon-wrapper-secondary p-1.5 border-none bg-transparent">
            <Gamepad2 className="h-4.5 w-4.5 text-secondary" />
          </div>
          Partner Offerwalls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerWalls.map((wall) => (
            <div 
              key={wall.name}
              onClick={() => {
                if (wall.active) {
                  const target = document.getElementById('direct-tasks');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`rounded-2xl border transition-all relative overflow-hidden group w-full h-36 flex flex-col justify-center ${
                wall.active 
                  ? 'border-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(93,95,239,0.2)] hover:-translate-y-1 cursor-pointer'
                  : 'border-dark-border/40 opacity-75 cursor-not-allowed select-none'
              }`}
            >
              {/* Banner Image */}
              <img 
                src={wall.banner} 
                alt={wall.name} 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                  wall.active ? 'group-hover:scale-105' : 'blur-[4px]'
                }`}
              />
              
              {/* Dark Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              
              {/* Locked Overlay */}
              {!wall.active && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1.5px] flex flex-col items-center justify-center z-10">
                  <Lock className="h-6 w-6 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ color: '#ffffff' }} />
                  <span className="text-xs font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ color: '#ffffff' }}>
                    Earn 2,500 Credits to unlock
                  </span>
                </div>
              )}

              {/* Status Badge (Sandbox/Open) */}
              {wall.active && (
                <div className="absolute top-3 left-3 shadow-lg z-20">
                  <div className="px-2 py-1 rounded-md backdrop-blur-md border bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(93,95,239,0.2)]">
                    <span className="text-[9px] font-black uppercase flex items-center gap-1">
                      <Play className="h-2.5 w-2.5 fill-primary" />
                      OPEN
                    </span>
                  </div>
                </div>
              )}

              {/* Promo Badge */}
              {wall.badge && (
                <div className="absolute top-3 right-3 shadow-lg z-20">
                  <span 
                    className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider bg-black/70 backdrop-blur-md ${
                      wall.active 
                        ? 'border-primary/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]' 
                        : 'border-dark-border'
                    }`}
                    style={{ color: '#ffffff' }}
                  >
                    {wall.badge}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. DIRECT TASKS FEED */}
      <DirectTasksSection />

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
