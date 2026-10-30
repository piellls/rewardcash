'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageHeader, { Chip } from '@/components/PageHeader';
import { Reveal, CountUp } from '@/components/motion';
import { Trophy, Crown, Coins } from 'lucide-react';

const MEDAL = {
  1: { c: '#f3c76b', label: '1st' },
  2: { c: '#c9d3e6', label: '2nd' },
  3: { c: '#d99b6c', label: '3rd' },
};

function Avatar({ src, name, size, ring }) {
  return (
    <img
      src={src || '/avatars/1.png'}
      alt=""
      className={`${size} rounded-full object-cover`}
      style={{ border: `3px solid ${ring}`, boxShadow: `0 0 24px -4px ${ring}` }}
      onError={(e) => { e.currentTarget.src = '/avatars/1.png'; }}
      title={name}
    />
  );
}

function PodiumCard({ player, rank, lead }) {
  const m = MEDAL[rank];
  return (
    <div
      className={`g-card relative flex w-full flex-col items-center px-5 pb-6 text-center md:w-64 ${lead ? 'g-neon g-neon-live pt-8 md:pb-10' : 'pt-6'}`}
      style={{ borderColor: `${m.c}55` }}
    >
      {lead && (
        <Crown className="bb-float absolute -top-5 h-9 w-9" style={{ color: m.c, '--d': '4s' }} aria-hidden="true" />
      )}
      <span className="g-rarity mb-3" style={{ '--c': m.c }}>{m.label}</span>
      <Avatar src={player.avatar_url} name={player.username} size={lead ? 'h-24 w-24' : 'h-20 w-20'} ring={m.c} />
      <h3 className="mt-3 max-w-full truncate text-base font-extrabold text-white">{player.username}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-lg font-black tabular-nums" style={{ color: m.c }}>
        <Coins className="h-4 w-4" aria-hidden="true" />
        <CountUp value={player.total_earned_coins} />
      </p>
      <p className="text-xs text-zinc-400">coins earned</p>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => alive && setPlayers(d.players || []))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const podium = [];
  // Source order is 1st, 2nd, 3rd (reads right when stacked on phones); md:order puts 1st in the middle on wide screens
  if (players[0]) podium.push({ ...players[0], rank: 1 });
  if (players[1]) podium.push({ ...players[1], rank: 2 });
  if (players[2]) podium.push({ ...players[2], rank: 3 });

  const rest = players.slice(3);
  const leader = players[0]?.total_earned_coins || 1;
  const myIndex = user ? players.findIndex((p) => p.username === user.username) : -1;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Rankings"
        icon={Trophy}
        title="Top"
        accent="earners"
        art="trophy"
        artGlow="gold"
        subtitle="The ten members who have earned the most coins on BlueberryCash."
      >
        {user && (
          <Chip tone="green">
            {myIndex >= 0 ? `You are #${myIndex + 1}` : `You: ${(user.total_earned_coins || 0).toLocaleString()} coins earned`}
          </Chip>
        )}
      </PageHeader>

      {loading ? (
        <div aria-busy="true" className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-dark-border bg-[var(--bb-surface)]" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="g-card py-16 text-center">
          <Trophy className="mx-auto h-10 w-10 text-[#c3b2ff]" aria-hidden="true" />
          <p className="mt-3 text-lg font-extrabold text-white">No rankings yet</p>
          <p className="mt-1 text-sm text-zinc-400">Complete a task on the Earn page and you could be the first name here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row md:items-end">
            {podium.map((p, i) => (
              <Reveal key={p.username} i={i} className={`w-full md:w-auto ${p.rank === 1 ? 'md:order-2' : p.rank === 2 ? 'md:order-1' : 'md:order-3'}`}>
                <PodiumCard player={p} rank={p.rank} lead={p.rank === 1} />
              </Reveal>
            ))}
          </div>

          {rest.length > 0 && (
            <ol className="space-y-2">
              {rest.map((p, i) => {
                const isMe = user && user.username === p.username;
                return (
                  <Reveal as="li" key={p.username} i={i}>
                    <div className={`g-card flex items-center gap-4 p-3 sm:p-4 ${isMe ? 'ring-1 ring-primary' : ''}`}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bb-surface-2)] text-sm font-black tabular-nums text-zinc-300">{i + 4}</span>
                      <img src={p.avatar_url || '/avatars/1.png'} alt="" className="h-10 w-10 shrink-0 rounded-full border border-dark-border object-cover" onError={(e) => { e.currentTarget.src = '/avatars/1.png'; }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate font-bold text-white">{p.username}{isMe && <span className="ml-2 text-xs font-bold text-[#c3b2ff]">You</span>}</span>
                          <span className="shrink-0 text-sm font-extrabold tabular-nums text-[#f3c76b]">{p.total_earned_coins.toLocaleString()}</span>
                        </div>
                        <div className="g-xp mt-2" style={{ '--p': Math.max(0.03, p.total_earned_coins / leader) }}><i /></div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
