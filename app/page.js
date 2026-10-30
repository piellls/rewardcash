'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import {
  Check, ChevronDown, Gift, Flame, Trophy, Users, LifeBuoy, Wallet,
  UserPlus, Gamepad2, Link2, Zap, Lock, Mail,
} from 'lucide-react';

const CASHOUTS = [
  { name: 'Venmo', img: '/offerwall/cashout_venmo.avif' },
  { name: 'Visa', img: '/offerwall/cashout_debit.png' },
  { name: 'Amazon', img: '/offerwall/cashout_amazon.avif' },
  { name: 'Apple', img: '/offerwall/cashout_apple.avif' },
  { name: 'Google Play', img: '/offerwall/cashout_ggplay.avif' },
  { name: 'Steam', img: '/offerwall/cashout_steam.avif' },
  { name: 'Xbox', img: '/offerwall/cashout_xbox.avif' },
  { name: 'PlayStation', img: '/offerwall/cashout_playstation.avif' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create your account', text: 'Sign up free with an email. It takes under a minute and you start with 100 coins.' },
  { icon: Gamepad2, title: 'Complete tasks', text: 'Play a game to a set level, try an app or answer a survey. The reward is shown before you start.' },
  { icon: Wallet, title: 'Cash out', text: 'Withdraw from $1 to PayPal, crypto or gift cards. Most requests are handled within 24 hours.' },
];

const PERKS = [
  { icon: Gift, title: 'Daily free spin', text: 'Spin once every 24 hours. Whatever you win goes straight to your balance.' },
  { icon: Flame, title: 'Daily streak', text: 'Log in each day to claim a bigger reward, up to day 7.' },
  { icon: Trophy, title: 'Levels', text: 'Every coin you earn moves you up a level, and your level shows on your profile.' },
  { icon: Users, title: 'Referral earnings', text: 'Earn 10% of everything the friends you invite earn, for as long as they keep earning.' },
  { icon: Zap, title: 'Fast cashout', text: 'Low minimums and no fees from us. Pick cash, crypto or a gift card.' },
  { icon: LifeBuoy, title: 'Real support', text: 'Open a ticket from any page and get a reply from a person.' },
];

const TABS = {
  referrals: {
    label: 'Referrals',
    title: 'Earn from the friends you invite',
    text: 'Share your link. When a friend joins and completes their first offer you get a bonus, then 10% of every offer they finish after that.',
    points: ['Copy your personal link from the Referrals page', 'Friends sign up and complete offers', 'You get 10% of what they earn, added to your balance'],
    cta: { label: 'Open referrals', href: '/referrals' },
  },
  spin: {
    label: 'Daily spin',
    title: 'One free spin, every day',
    text: 'Come back every 24 hours to spin the wheel. Prizes start small and go up to $250.',
    points: ['Open the Spin page', 'Hit spin, once every 24 hours', 'Your prize is added to your balance instantly'],
    cta: { label: 'Go to the spin', href: '/spin' },
  },
};

const FAQ = [
  { q: 'What is BlueberryCash?', a: 'A rewards site. Advertisers pay us when you try their games, apps or surveys, and we pass most of that money on to you as coins you can cash out.' },
  { q: 'How much is a coin worth?', a: '1,000 coins = $1.00. Every task shows its reward in coins before you start it.' },
  { q: 'Do I have to pay anything?', a: 'No. BlueberryCash is free. You never need to deposit money to earn or to cash out.' },
  { q: 'How do I get paid?', a: 'Open Cashout, pick PayPal, crypto or a gift card, and enter where to send it. Most requests are handled within 24 hours.' },
  { q: 'Why was my task not credited?', a: 'The advertiser has to confirm the task first. That can take from a few minutes to a few days. Using a VPN, or an account that already did the task, usually stops the credit.' },
];

function ago(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function useLiveFeed() {
  const [data, setData] = useState({ feed: [], stats: null });
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/live-feed')
        .then((r) => r.json())
        .then((d) => alive && setData(d))
        .catch(() => {});
    load();
    const iv = setInterval(load, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, []);
  return data;
}

function PayoutTicker({ feed }) {
  if (!feed.length) return null;
  const items = [...feed, ...feed];
  return (
    <div className="relative overflow-hidden" aria-label="Recent earnings">
      <div className="bb-ticker flex w-max gap-3">
        {items.map((f, i) => (
          <div key={`${f.id}-${i}`} className="flex min-w-[220px] items-center gap-3 rounded-xl bg-[var(--bb-surface)] px-3 py-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--bb-surface-2)] text-sm font-bold text-[var(--bb-berry-300)]">
              {f.avatar ? <img src={f.avatar} alt="" className="h-full w-full object-cover" /> : f.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-white">{f.username}</div>
              <div className="truncate text-xs capitalize text-[var(--bb-muted)]">{f.provider} · {ago(f.at)}</div>
            </div>
            <div className="text-sm font-bold text-[var(--bb-leaf)]">${f.usd.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { feed, stats } = useLiveFeed();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [tab, setTab] = useState('referrals');
  const [open, setOpen] = useState(0);

  const openAuth = (t) => { setAuthTab(t); setAuthOpen(true); };
  const active = TABS[tab];

  return (
    <div className="bb-home min-h-screen bg-[var(--bb-bg)] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-4 pb-20 sm:px-6">

        <PayoutTicker feed={feed} />

        {/* HERO */}
        <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
          <div>
            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
              Turn spare minutes into real rewards
            </h1>
            <p className="mt-5 max-w-lg text-base text-[var(--bb-muted)] sm:text-lg">
              Play games, try apps and answer surveys. Cash out to PayPal, crypto or gift cards from your first dollar.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {['No deposit', 'Fast cashout', 'Free to join'].map((c) => (
                <li key={c} className="flex items-center gap-1.5 rounded-lg bg-[var(--bb-surface)] px-3 py-1.5 text-[var(--bb-berry-300)]">
                  <Check className="h-4 w-4 text-[var(--bb-leaf)]" /> {c}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              {user ? (
                <Link href="/earn" className="bb-cta">Start earning</Link>
              ) : (
                <button onClick={() => openAuth('register')} className="bb-cta">Start earning</button>
              )}
              <a href="#how" className="inline-flex items-center rounded-xl bg-[var(--bb-surface)] px-5 py-3 font-semibold hover:bg-[var(--bb-surface-2)]">
                How it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              {CASHOUTS.map((c) => (
                <img key={c.name} src={c.img} alt={c.name} title={c.name} className="h-10 w-10 rounded-full bg-white object-cover" />
              ))}
            </div>

            {stats && stats.offersCompleted > 0 && (
              <p className="mt-5 text-sm text-[var(--bb-muted)]">
                {stats.offersCompleted.toLocaleString()} tasks completed by {stats.members.toLocaleString()} members
              </p>
            )}
          </div>

          <div className="bb-hero rounded-[28px] p-6 sm:p-8">
            {user ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xl font-bold">Welcome back, {user.username}</div>
                  <div className="mt-1 text-white/80">Balance: {(user.balance_coins || 0).toLocaleString()} coins</div>
                </div>
                <Link href="/earn" className="bb-cta">Find a task</Link>
                <Link href="/cashout" className="text-center text-sm font-semibold text-white underline underline-offset-2">Go to cashout</Link>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">Create your free account</div>
                <p className="mt-1 text-sm text-white/80">Takes under a minute. You start with 100 coins.</p>
                <button
                  onClick={() => openAuth('register')}
                  className="mt-5 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm text-white/70 ring-1 ring-white/20 hover:bg-white/15"
                >
                  <Mail className="h-4 w-4" /> Email address
                </button>
                <button onClick={() => openAuth('register')} className="bb-cta mt-3 w-full">Sign up free</button>
                <p className="mt-4 text-center text-sm text-white/75">
                  Already a member?{' '}
                  <button onClick={() => openAuth('login')} className="font-semibold text-white underline underline-offset-2">Log in</button>
                </p>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/70">
                  <Lock className="h-3.5 w-3.5" /> No card needed
                </p>
              </>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-24 pt-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps to your first payout</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-[var(--bb-surface)] p-6">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--bb-berry-500)]/20 text-[var(--bb-berry-300)]">
                  <s.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{i + 1}. {s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bb-muted)]">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* PERKS */}
        <section className="pt-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">More ways to earn on BlueberryCash</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p) => (
              <div key={p.title} className="rounded-2xl bg-[var(--bb-surface)] p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--bb-berry-500)]/15 text-[var(--bb-berry-300)]">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TABS: REFERRALS / SPIN */}
        <section className="pt-14">
          <div className="overflow-hidden rounded-[28px] bg-[var(--bb-surface)]">
            <div role="tablist" className="grid grid-cols-2 border-b border-white/10">
              {Object.entries(TABS).map(([key, t]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`py-4 font-semibold transition-colors ${tab === key ? 'border-b-2 border-[var(--bb-leaf)] text-white' : 'text-[var(--bb-muted)] hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6 sm:p-10">
              <h2 className="text-2xl font-bold sm:text-3xl">{active.title}</h2>
              <p className="mt-3 max-w-xl text-[var(--bb-muted)]">{active.text}</p>
              <ul className="mt-6 grid gap-3 sm:max-w-xl">
                {active.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 rounded-xl bg-[var(--bb-surface-2)] px-4 py-3 text-sm">
                    <Link2 className="h-4 w-4 shrink-0 text-[var(--bb-berry-300)]" /> {p}
                  </li>
                ))}
              </ul>
              <Link href={user ? active.cta.href : '#'} onClick={user ? undefined : (e) => { e.preventDefault(); openAuth('register'); }} className="bb-cta mt-7 inline-flex">
                {user ? active.cta.label : 'Sign up to start'}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions</h2>
          <div className="mt-8 flex flex-col gap-2">
            {FAQ.map((f, i) => (
              <div key={f.q} className="rounded-2xl bg-[var(--bb-surface)]">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                >
                  {f.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--bb-muted)] transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--bb-muted)]">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        {!user && (
          <section className="pt-14">
            <div className="bb-hero flex flex-col items-center gap-5 rounded-[28px] px-6 py-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your first dollar is a few tasks away</h2>
              <button onClick={() => openAuth('register')} className="bb-cta">Sign up free</button>
            </div>
          </section>
        )}
      </div>

      {authOpen && <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />}
    </div>
  );
}
