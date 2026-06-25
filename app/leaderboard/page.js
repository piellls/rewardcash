'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Trophy, Award, Coins, Users, Crown, ChevronUp } from 'lucide-react';

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
  const podium = [];
  if (leaderboard[1]) podium.push({ ...leaderboard[1], rank: 2 }); // Second place on left
  if (leaderboard[0]) podium.push({ ...leaderboard[0], rank: 1 }); // First place in middle
  if (leaderboard[2]) podium.push({ ...leaderboard[2], rank: 3 }); // Third place on right

  const remainingList = leaderboard.slice(3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="icon-wrapper-primary p-2">
              <Trophy className="h-6 w-6" />
            </div>
            Global Leaderboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Compete with the top earners on RewardCash. Play games, complete surveys, and climb the ranks.
          </p>
        </div>
      </div>

      {/* Weekly Payout Banner */}
      <div className="mb-8 rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="icon-wrapper-gradient p-3 shrink-0">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Weekly Leaderboard Prizes</h3>
              <p className="text-xs text-zinc-400 max-w-xl mt-1">
                Climb to the top before Sunday midnight! The top 3 earners receive huge coin bonuses directly credited into their balances.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto text-center text-xs font-bold uppercase tracking-wider">
            <div className="rounded-xl bg-zinc-950 border border-dark-border/60 p-3 shadow-md">
              <span className="block text-secondary text-[10px] mb-1">1st Place</span>
              <span className="text-white font-black text-sm">+5,000</span>
              <span className="block text-[8px] text-zinc-550 mt-0.5">Coins</span>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-dark-border/60 p-3 shadow-md">
              <span className="block text-primary text-[10px] mb-1">2nd Place</span>
              <span className="text-white font-black text-sm">+2,500</span>
              <span className="block text-[8px] text-zinc-550 mt-0.5">Coins</span>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-dark-border/60 p-3 shadow-md">
              <span className="block text-secondary text-[10px] mb-1">3rd Place</span>
              <span className="text-white font-black text-sm">+1,000</span>
              <span className="block text-[8px] text-zinc-550 mt-0.5">Coins</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3 animate-pulse">
            Loading Rankings...
          </span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Podium towers (Top 3 Players) */}
          {leaderboard.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-end justify-center gap-6 mt-8">
              
              {/* Render Rank 2 (Left) */}
              {leaderboard[1] && (
                <div className="w-full md:w-64 rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-lg min-h-[260px] md:h-64 md:order-1">
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-primary/40" />
                  
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <img 
                        src={leaderboard[1].avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                        alt={leaderboard[1].username}
                        className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover"
                      />
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 border border-primary px-2.5 py-0.5 text-[9px] font-bold text-primary">
                        Rank 2
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors mt-2">{leaderboard[1].username}</h3>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 border border-dark-border/40 py-2">
                      <div className="icon-wrapper-primary p-0.5 border-none rounded-full shrink-0">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-black text-white">{leaderboard[1].total_earned_coins?.toLocaleString()}</span>
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Earned</span>
                    </div>
                    <span className="block text-[8px] text-secondary mt-2 font-bold uppercase tracking-wider">+2,500 Coins Prize Pending</span>
                  </div>
                </div>
              )}

              {/* Render Rank 1 (Center - Elevated) */}
              {leaderboard[0] && (
                <div className="w-full md:w-72 rounded-2xl border-2 border-secondary/30 bg-dark-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-2xl min-h-[300px] md:h-76 md:order-2 shadow-secondary/[0.03]">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-secondary to-primary" />
                  
                  <div className="flex flex-col items-center">
                    <Crown className="h-6 w-6 text-secondary mb-1" />
                    <div className="relative mb-3">
                      <img 
                        src={leaderboard[0].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={leaderboard[0].username}
                        className="h-20 w-20 rounded-full border-2 border-secondary object-cover"
                      />
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-secondary to-primary px-3.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
                        Winner
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-primary transition-colors flex items-center gap-1">
                      {leaderboard[0].username}
                    </h3>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 border border-dark-border/40 py-2.5 shadow-inner">
                      <div className="icon-wrapper-primary p-0.5 border-none rounded-full shrink-0">
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-black text-white">{leaderboard[0].total_earned_coins?.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Earned</span>
                    </div>
                    <span className="block text-[8px] text-secondary mt-2.5 font-bold uppercase tracking-widest animate-pulse">+5,000 Coins Prize Pending</span>
                  </div>
                </div>
              )}

              {/* Render Rank 3 (Right) */}
              {leaderboard[2] && (
                <div className="w-full md:w-64 rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-lg min-h-[260px] md:h-64 md:order-3">
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-primary/40" />
                  
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <img 
                        src={leaderboard[2].avatar_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150'} 
                        alt={leaderboard[2].username}
                        className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover"
                      />
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 border border-primary px-2.5 py-0.5 text-[9px] font-bold text-primary">
                        Rank 3
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors mt-2">{leaderboard[2].username}</h3>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 border border-dark-border/40 py-2">
                      <div className="icon-wrapper-primary p-0.5 border-none rounded-full shrink-0">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-black text-white">{leaderboard[2].total_earned_coins?.toLocaleString()}</span>
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Earned</span>
                    </div>
                    <span className="block text-[8px] text-secondary mt-2 font-bold uppercase tracking-wider">+1,000 Coins Prize Pending</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Leaderboard Table (Ranks 4-10) */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="icon-wrapper-primary p-1 border-none shadow-[0_0_8px_rgba(56,189,248,0.1)]">
                <Users className="h-4 w-4" />
              </div>
              Remaining Earners List
            </h2>

            {remainingList.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 font-bold">
                Climb the ranks! Only the top players are listed.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                      <th className="pb-3 pr-4 w-12">Rank</th>
                      <th className="pb-3 px-4">User</th>
                      <th className="pb-3 px-4 text-right">Coins Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                    {remainingList.map((player, idx) => {
                      const rank = idx + 4;
                      const isCurrent = user && user.username === player.username;
                      return (
                        <tr 
                          key={player.username} 
                          className={`group hover:bg-zinc-900/10 transition-colors ${
                            isCurrent ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                        >
                          <td className="py-3 pr-4 font-bold text-zinc-400 text-center">#{rank}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={player.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                                alt={player.username}
                                className="h-7 w-7 rounded-full border border-dark-border object-cover"
                              />
                              <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                                {player.username}
                                {isCurrent && (
                                  <span className="ml-2 rounded bg-primary/20 border border-primary/45 px-1.5 py-0.5 text-[8px] font-bold text-primary uppercase">
                                    You
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="rounded-full bg-primary/10 p-0.5">
                                <Coins className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="font-extrabold text-white">{player.total_earned_coins?.toLocaleString()}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
