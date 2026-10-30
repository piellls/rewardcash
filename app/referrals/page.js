'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import PageHeader, { Chip } from '@/components/PageHeader';
import CommissionCalculator from '@/components/CommissionCalculator';
import TierProgress from '@/components/TierProgress';
import { Reveal, CountUp } from '@/components/motion';
import { MIN_RATE, MAX_RATE } from '@/lib/affiliate';
import { Users, Copy, Check, Share2, Link2, UserCheck, Coins, Percent } from 'lucide-react';

const STEPS = [
  { icon: Link2, title: 'Share your link', text: 'Send your personal link to friends, on social or in a group chat.' },
  { icon: UserCheck, title: 'They join and finish a task', text: 'When a friend signs up and completes their first task, you get a 100 coin bonus.' },
  { icon: Percent, title: `You earn ${MIN_RATE}% to ${MAX_RATE}%`, text: `After that you get a share of the coins from every task they finish: ${MIN_RATE}% to start, up to ${MAX_RATE}% the more your friends earn in a month. It lands in your balance by itself.` },
];

export default function Referrals() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarnings: 0 });
  const [friends, setFriends] = useState([]);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const [s, l, m] = await Promise.all([
          db.getReferralStats(user.id),
          db.getReferralsList(user.id),
          db.getReferralMonth(user.id).catch(() => null), // only the step card depends on it
        ]);
        if (!alive) return;
        setStats(s);
        setFriends(l || []);
        setMonth(m);
      } catch (err) {
        console.error('Error loading referral data:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const link = typeof window !== 'undefined' && user ? `${window.location.origin}/ref/${user.username}` : '';
  const shareText = 'Join BlueberryCash and earn coins for games, apps and surveys.';

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      sfx.play('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link stays selectable in the field.
    }
  };

  const nativeShare = async () => {
    try { await navigator.share({ title: 'BlueberryCash', text: shareText, url: link }); } catch { /* cancelled */ }
  };

  const enc = encodeURIComponent;
  const targets = [
    { name: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${enc(`${shareText} ${link}`)}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${enc(link)}&text=${enc(shareText)}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${enc(`${shareText} ${link}`)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Referrals"
        icon={Users}
        title="Invite friends,"
        accent={`earn up to ${MAX_RATE}%`}
        art="referral"
        artGlow="purple"
        subtitle={`You get ${MIN_RATE}% to ${MAX_RATE}% of the coins your friends earn from tasks, and the more they earn in a month, the higher your rate. No cap, no claim button.`}
      />

      {!user ? (
        <Reveal className="g-neon g-neon-live flex flex-col items-center gap-4 p-8 text-center">
          <Users className="h-10 w-10 text-[#c3b2ff]" aria-hidden="true" />
          <p className="text-lg font-extrabold text-white">Log in to get your referral link</p>
          <div className="flex gap-3">
            <button onClick={() => { setAuthTab('login'); setIsAuthOpen(true); }} className="btn-gaming-secondary min-h-[44px] rounded-xl px-6 text-xs">Log in</button>
            <button onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }} className="btn-gaming min-h-[44px] rounded-xl px-6 text-xs">Register</button>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-6">
          <Reveal className="g-neon g-neon-live p-5 sm:p-6">
            <label htmlFor="ref-link" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your referral link</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="ref-link"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-dark-border bg-dark-bg px-4 font-mono text-sm text-white"
              />
              <button onClick={copy} className="btn-gaming flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 text-xs">
                {copied ? <Check className="g-pop h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {typeof navigator !== 'undefined' && navigator.share && (
                <button onClick={nativeShare} className="btn-gaming-secondary inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 text-xs">
                  <Share2 className="h-4 w-4" aria-hidden="true" /> Share
                </button>
              )}
              {targets.map((t) => (
                <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer" className="btn-gaming-secondary inline-flex min-h-[40px] items-center rounded-lg px-4 text-xs">
                  {t.name}
                </a>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal className="g-card p-5">
              <div className="flex items-center gap-3">
                <span className="icon-wrapper-primary h-11 w-11"><Users className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <div className="text-3xl font-extrabold tabular-nums text-white">{loading ? '–' : <CountUp value={stats.totalReferrals} />}</div>
                  <div className="text-sm text-zinc-400">Friends invited</div>
                </div>
              </div>
            </Reveal>
            <Reveal i={1} className="g-card p-5">
              <div className="flex items-center gap-3">
                <span className="icon-wrapper-gradient h-11 w-11"><Coins className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <div className="text-3xl font-extrabold tabular-nums text-[#f3c76b]">{loading ? '–' : <CountUp value={stats.totalEarnings} />}</div>
                  <div className="text-sm text-zinc-400">
                    Coins earned from referrals{!loading && stats.totalEarnings > 0 && <> · ${(stats.totalEarnings / 1000).toFixed(2)}</>}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {month && (
            <Reveal>
              <TierProgress month={month} />
            </Reveal>
          )}
        </div>
      )}

      <section className="mt-12">
        <Reveal as="h2" className="g-title text-2xl sm:text-3xl">Estimate your commission</Reveal>
        <Reveal as="p" className="mt-2 max-w-2xl text-sm text-zinc-400">Move the sliders to see what a group of friends would pay you each month.</Reveal>
        <Reveal className="mt-6">
          <CommissionCalculator />
        </Reveal>
      </section>

      <section className="mt-12">
        <Reveal as="h2" className="g-title text-2xl sm:text-3xl">How it works</Reveal>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} i={i}>
              <div className="g-card g-card-hover g-spot h-full p-5">
                <span className="icon-wrapper-primary h-12 w-12"><s.icon className="h-6 w-6" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold text-white">{i + 1}. {s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {user && (
        <section className="mt-12">
          <Reveal as="h2" className="g-title text-2xl sm:text-3xl">Your friends</Reveal>
          <Reveal className="g-card mt-6 overflow-hidden">
            {friends.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-bold text-white">{loading ? 'Loading…' : 'No friends yet'}</p>
                {!loading && <p className="mt-1 text-sm text-zinc-400">Share your link above. Friends who sign up with it will show up here.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-dark-border text-xs font-bold uppercase tracking-wider text-zinc-400">
                      <th className="px-5 py-3">Friend</th>
                      <th className="px-5 py-3">Joined</th>
                      <th className="px-5 py-3 text-right">Coins earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border text-zinc-300">
                    {friends.map((f) => (
                      <tr key={`${f.username}-${f.created_at}`} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-5 py-3 font-semibold text-white">{f.username}</td>
                        <td className="px-5 py-3 text-zinc-400">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</td>
                        <td className="px-5 py-3 text-right font-bold tabular-nums text-[#f3c76b]">{(f.total_earned_coins || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>
        </section>
      )}

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
