'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Trophy, Medal, Coins, Flame, Award, Users, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await db.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Top 3 Podium spots
  const podium = leaderboard.slice(0, 3);
  const remainingList = leaderboard.slice(3);

  const getTrophyColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-500 bg-yellow-950/40 border-yellow-800/40'; // Gold
      case 1: return 'text-slate-350 bg-slate-900 border-slate-700/40'; // Silver
      case 2: return 'text-amber-700 bg-amber-950/40 border-amber-900/40'; // Bronze
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Check out the top earners on RewardCash. Complete offers to claim your spot and win weekly prizes.
        </p>
      </div>

      {/* Bonus Banner */}
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-zinc-950 border border-dark-border p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Weekly Payout Bonus</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Top 3 weekly earners receive massive coin bonuses directly in their balances every Sunday at midnight!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <div className="text-center rounded-xl bg-zinc-900 border border-dark-border px-4 py-2">
            <span className="block text-yellow-500">1st Place</span>
            <span className="text-white font-black">+5,000 Coins</span>
          </div>
          <div className="text-center rounded-xl bg-zinc-900 border border-dark-border px-4 py-2">
            <span className="block text-slate-400">2nd Place</span>
            <span className="text-white font-black">+2,500 Coins</span>
          </div>
          <div className="text-center rounded-xl bg-zinc-900 border border-dark-border px-4 py-2">
            <span className="block text-amber-600">3rd Place</span>
            <span className="text-white font-black">+1,000 Coins</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Podium (Top 3 Players) */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              
              {/* Rank 2 (Left) */}
              {podium[1] && (
                <div className="rounded-2xl glass-card border border-dark-border p-6 text-center md:order-1 relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-500" />
                  <div className="flex justify-center mb-4 relative">
                    <img 
                      src={podium[1].avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                      alt={podium[1].username}
                      className="h-20 w-20 rounded-full border-2 border-slate-600"
                    />
                    <span className="absolute bottom-0 translate-y-1/3 rounded-full bg-slate-900 border border-slate-700 px-3 py-0.5 text-xs font-bold text-slate-400">
                      Rank 2
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{podium[1].username}</h3>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-bold text-zinc-200">{podium[1].total_earned_coins?.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Earned</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Center - Elevated) */}
              {podium[0] && (
                <div className="rounded-2xl glass-card border-2 border-yellow-500/30 p-8 text-center md:order-2 md:scale-105 relative overflow-hidden shadow-2xl group">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-500 to-amber-500" />
                  <div className="flex justify-center mb-6 relative">
                    <img 
                      src={podium[0].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={podium[0].username}
                      className="h-24 w-24 rounded-full border-2 border-yellow-500"
                    />
                    <span className="absolute bottom-0 translate-y-1/3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-1 text-xs font-black text-black">
                      Rank 1
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                    <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />
                    {podium[0].username}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Coins className="h-4.5 w-4.5 text-yellow-500" />
                    <span className="text-base font-black text-white">{podium[0].total_earned_coins?.toLocaleString()}</span>
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Earned</span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {podium[2] && (
                <div className="rounded-2xl glass-card border border-dark-border p-6 text-center md:order-3 relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-700" />
                  <div className="flex justify-center mb-4 relative">
                    <img 
                      src={podium[2].avatar_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150'} 
                      alt={podium[2].username}
                      className="h-20 w-20 rounded-full border-2 border-amber-800"
                    />
                    <span className="absolute bottom-0 translate-y-1/3 rounded-full bg-slate-900 border border-amber-900 px-3 py-0.5 text-xs font-bold text-amber-600">
                      Rank 3
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{podium[2].username}</h3>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-bold text-zinc-200">{podium[2].total_earned_coins?.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Earned</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Leaderboard Table (Ranks 4-10) */}
          {remainingList.length > 0 && (
            <div className="rounded-2xl glass-card border border-dark-border p-6">
              <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Remaining Rankings
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Rank</th>
                      <th className="pb-3 px-4">User</th>
                      <th className="pb-3 px-4 text-right">Total Coins Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/40 text-sm">
                    {remainingList.map((player, idx) => {
                      const rank = idx + 4;
                      const isCurrent = user && user.username === player.username;
                      return (
                        <tr 
                          key={player.username} 
                          className={`group hover:bg-zinc-900/30 transition-colors ${
                            isCurrent ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                        >
                          <td className="py-3.5 pr-4 font-bold text-zinc-400">#{rank}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={player.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                                alt={player.username}
                                className="h-7 w-7 rounded-full border border-dark-border"
                              />
                              <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-zinc-200'}`}>
                                {player.username}
                                {isCurrent && <span className="ml-2 rounded bg-primary/20 border border-primary/40 px-1 py-0.5 text-[9px] font-bold text-primary uppercase">You</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-white">
                            <div className="flex items-center justify-end gap-1.5">
                              <Coins className="h-3.5 w-3.5 text-yellow-500" />
                              {player.total_earned_coins?.toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
