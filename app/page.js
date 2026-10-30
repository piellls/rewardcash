'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import {
  Gamepad2, ClipboardList, Smartphone, Gift, Users, ShieldCheck,
  ChevronDown, Mail, Lock, Zap,
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
  { name: 'Spotify', img: '/offerwall/cashout_spotify.avif' },
  { name: 'Netflix', img: '/offerwall/cashout_netflix.avif' },
];

const WAYS = [
  { icon: Gamepad2, title: 'Play games', text: 'Reach a level in a new mobile game and get paid for it.', href: '/earn' },
  { icon: ClipboardList, title: 'Answer surveys', text: 'Short surveys, paid the moment you finish.', href: '/offerwall' },
  { icon: Smartphone, title: 'Try apps', text: 'Install, open and use an app for a few minutes.', href: '/offerwall' },
  { icon: Gift, title: 'Daily spin', text: 'One free spin every 24 hours. Prizes go straight to your balance.', href: '/spin' },
  { icon: Users, title: 'Invite friends', text: 'Get 10% of everything your friends earn, for as long as they earn.', href: '/referrals' },
];

const STEPS = [
  { title: 'Pick a task', text: 'Browse games, apps and surveys. Each one shows exactly what it pays before you start.' },
  { title: 'Finish it', text: 'Follow the task steps. When the advertiser confirms, coins land in your balance.' },
  { title: 'Cash out', text: 'From $1 you can withdraw to PayPal, crypto or a gift card of your choice.' },
];

const FAQ = [
  { q: 'What is BlueberryCash?', a: 'A rewards site. Advertisers pay us when you try their games, apps or surveys, and we pass most of that money on to you as coins you can cash out.' },
  { q: 'How much is a coin worth?', a: '1,000 coins = $1.00. Every task shows its reward in coins before you start it.' },
  { q: 'Do I have to pay anything?', a: 'No. BlueberryCash is free. You never need to deposit money to earn or to cash out.' },
  { q: 'How do I get paid?', a: 'Open Cashout, pick PayPal, crypto or a gift card, and enter where to send it. Most requests are handled within 24 hours.' },
  { q: 'Why was my task not credited?', a: 'The advertiser has to confirm the task first. That can take from a few minutes to a few days. Using a VPN or an account that already did the task usually stops the credit.' },
];

function money(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n.toFixed(2)}`;
}

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
          <div key={`${f.id}-${i}`} className="flex items-center gap-3 rounded-xl bg-[var(--bb-surface)] px-3 py-2.5 min-w-[220px]">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[var(--bb-surface-2)] grid place-items-center text-sm font-bold text-[var(--bb-berry-300)]">
              {f.avatar ? <img src={f.avatar} alt="" className="h-full w-full object-cover" /> : f.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-white">{f.username}</div>
              <div className="truncate text-xs text-[var(--bb-muted)] capitalize">{f.provider} · {ago(f.at)}</div>
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
  const [open, setOpen] = useState(0);

  const openAuth = (tab) => { setAuthTab(tab); setAuthOpen(true); };

  return (
    <div className="bb-home min-h-screen bg-[var(--bb-bg)] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-4 pb-20 sm:px-6">

        <PayoutTicker feed={feed} />

        {/* HERO */}
        <section className="bb-hero relative overflow-hidden rounded-[28px] px-5 pt-14 pb-8 sm:px-10 sm:pt-20">
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
            <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.02em] sm:text-6xl">
              Small tasks.<br />Real cash.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
              Play games, try apps and answer surveys. Get paid in PayPal, crypto or gift cards from your first dollar.
            </p>

            {stats && (stats.offersCompleted > 0 || stats.paidUsd > 0) && (
              <dl className="mt-8 grid w-full max-w-md grid-cols-3 divide-x divide-white/15">
                <div className="px-2">
                  <dt className="text-xs text-white/65">Paid out</dt>
                  <dd className="text-2xl font-bold">{money(stats.paidUsd)}</dd>
                </div>
                <div className="px-2">
                  <dt className="text-xs text-white/65">Tasks done</dt>
                  <dd className="text-2xl font-bold">{stats.offersCompleted.toLocaleString()}</dd>
                </div>
                <div className="px-2">
                  <dt className="text-xs text-white/65">Members</dt>
                  <dd className="text-2xl font-bold">{stats.members.toLocaleString()}</dd>
                </div>
              </dl>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {CASHOUTS.slice(0, 6).map((c) => (
                <img key={c.name} src={c.img} alt={c.name} title={c.name} className="h-9 w-9 rounded-full bg-white object-cover ring-2 ring-white/20" />
              ))}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-xs font-bold">+{CASHOUTS.length - 6}</span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
              <Lock className="h-3.5 w-3.5" /> No deposit, no card needed
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-10 max-w-xl rounded-2xl bg-white/10 p-5 backdrop-blur-md ring-1 ring-white/15 sm:p-6">
            {user ? (
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <div className="text-lg font-bold">Welcome back, {user.username}</div>
                  <div className="text-sm text-white/75">Balance: {(user.balance_coins || 0).toLocaleString()} coins</div>
                </div>
                <Link href="/earn" className="bb-cta w-full sm:w-auto">Start earning</Link>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold">Create your free account</div>
                <p className="mt-1 text-sm text-white/75">Takes under a minute. You get 100 coins to start.</p>
                <button
                  onClick={() => openAuth('register')}
                  className="mt-4 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm text-white/60 ring-1 ring-white/15 hover:bg-white/15"
                >
                  <Mail className="h-4 w-4" /> Email address
                </button>
                <button onClick={() => openAuth('register')} className="bb-cta mt-3 w-full">Sign up free</button>
                <p className="mt-3 text-center text-sm text-white/70">
                  Already a member?{' '}
                  <button onClick={() => openAuth('login')} className="font-semibold text-white underline underline-offset-2">Log in</button>
                </p>
              </>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="pt-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-[var(--bb-surface)] p-6">
                <div className="text-5xl font-extrabold text-[var(--bb-berry-400)]">{i + 1}</div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bb-muted)]">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* WAYS TO EARN */}
        <section className="pt-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ways to earn</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WAYS.map((w) => (
              <Link
                key={w.title}
                href={w.href}
                className="group rounded-2xl bg-[var(--bb-surface)] p-5 ring-1 ring-transparent transition-colors hover:ring-[var(--bb-berry-500)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--bb-berry-500)]/15 text-[var(--bb-berry-300)]">
                  <w.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold">{w.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">{w.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CASHOUT OPTIONS */}
        <section className="pt-14">
          <div className="flex flex-col gap-6 rounded-[28px] bg-[var(--bb-surface)] p-6 sm:p-10 lg:flex-row lg:items-center">
            <div className="lg:w-2/5">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cash out your way</h2>
              <p className="mt-3 text-[var(--bb-muted)]">Withdraw from $1. Pick cash, crypto or a gift card. No fees on our side.</p>
              <Link href="/cashout" className="bb-cta mt-6 inline-flex">See cashout options</Link>
            </div>
            <div className="grid flex-1 grid-cols-5 gap-3">
              {CASHOUTS.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2">
                  <img src={c.img} alt="" className="aspect-square w-full max-w-[72px] rounded-2xl bg-white object-cover" />
                  <span className="text-center text-xs text-[var(--bb-muted)]">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="pt-14">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Zap, title: 'Fast payouts', text: 'Most cashouts are sent within 24 hours.' },
              { icon: ShieldCheck, title: 'Free, always', text: 'You never pay to earn or to withdraw.' },
              { icon: Users, title: 'Real support', text: 'Open a ticket from any page and a person answers.' },
            ].map((t) => (
              <div key={t.title} className="flex gap-4 rounded-2xl bg-[var(--bb-surface)] p-5">
                <t.icon className="h-6 w-6 shrink-0 text-[var(--bb-leaf)]" />
                <div>
                  <h3 className="font-bold">{t.title}</h3>
                  <p className="mt-1 text-sm text-[var(--bb-muted)]">{t.text}</p>
                </div>
              </div>
            ))}
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
