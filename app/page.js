'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SignupCard from '@/components/SignupCard';
import HeroScene from '@/components/HeroScene';
import { PAYOUT_OPTIONS, COINS_PER_USD } from '@/lib/cashout';
import { Reveal, CountUp, usePrefersReducedMotion } from '@/components/motion';
import Art from '@/components/Art';
import CoinCalculator from '@/components/CoinCalculator';
import CommissionCalculator from '@/components/CommissionCalculator';
import { MIN_RATE, MAX_RATE } from '@/lib/affiliate';
import {
  Check, ChevronDown, Gift, Trophy, Users, LifeBuoy, Wallet, Gamepad2,
  Smartphone, ClipboardList, Zap, Lock, ShieldCheck, ArrowRight,
} from 'lucide-react';

/* ---------- Content (all of it matches what the product really does) ---------- */

// Payout methods come from the same list the withdraw API enforces, so the home page can't promise a method that doesn't exist.
const METHOD_META = {
  paypal: { name: 'PayPal', glyph: 'P', tint: '#4597ff' },
  visa: { name: 'Visa card', glyph: 'V', tint: '#7854f7' },
  btc: { name: 'Bitcoin', glyph: '₿', tint: '#f3c76b' },
  ltc: { name: 'Litecoin', glyph: 'Ł', tint: '#aab4c9' },
  eth: { name: 'Ethereum', glyph: 'Ξ', tint: '#c3b2ff' },
  sol: { name: 'Solana', glyph: '◎', tint: '#42d8a0' },
};

const PAYOUTS = Object.entries(PAYOUT_OPTIONS)
  .map(([key, options]) => ({
    key,
    ...(METHOD_META[key] || { name: key.toUpperCase(), glyph: key.charAt(0).toUpperCase(), tint: '#aab4c9' }),
    min: Math.min(...options) / COINS_PER_USD,
  }))
  .sort((a, b) => a.min - b.min);

const MIN_CASHOUT = PAYOUTS[0]?.min ?? 1;

const STEPS = [
  { art: 'berry', glow: 'purple', title: 'Create your account', text: 'Sign up free with an email. It takes under a minute and you start with 100 coins.' },
  { art: 'gem', glow: 'blue', title: 'Complete tasks', text: 'Play a game to a set level, try an app or answer a survey. The reward is shown before you start.' },
  { art: 'coins', glow: 'gold', title: 'Cash out', text: `Withdraw from $${MIN_CASHOUT} to PayPal, a Visa card or crypto. Requests are checked within 24 hours.` },
];

const PERKS = [
  { icon: Gift, title: 'Daily free spin', text: 'Spin once every 24 hours. Whatever you win goes straight to your balance.' },
  { icon: Trophy, title: 'Levels', text: 'Every coin you earn moves you up a level, and your level shows next to your name.' },
  { icon: Users, title: 'Referral earnings', text: `Earn ${MIN_RATE}% to ${MAX_RATE}% of the offers your friends complete. The more they earn in a month, the higher your rate.` },
  { icon: Zap, title: 'Low minimums', text: `Cash out from $${MIN_CASHOUT}. We don't charge a fee to withdraw.` },
  { icon: ShieldCheck, title: 'Free to join', text: 'No deposit and no card. You only ever put time in, never money.' },
  { icon: LifeBuoy, title: 'Support on every page', text: 'Open a ticket from the menu any time something looks wrong.' },
];

const TABS = {
  referrals: {
    label: 'Referrals',
    title: 'Earn from the friends you invite',
    text: `Share your link. When a friend joins and completes their first offer you get a bonus, then ${MIN_RATE}% to ${MAX_RATE}% of every offer they finish after that.`,
    points: ['Copy your personal link from the Referrals page', 'Friends sign up and complete offers', `You get ${MIN_RATE}% to ${MAX_RATE}% of what they earn, added to your balance`],
    cta: { label: 'Open referrals', href: '/referrals' },
  },
  spin: {
    label: 'Daily spin',
    title: 'One free spin, every day',
    text: 'Come back every 24 hours to spin the wheel. Most prizes are small coin wins, and the top prize is $250 (a very rare one).',
    points: ['Open the Spin page', 'Hit spin, once every 24 hours', 'Your prize is added to your balance instantly'],
    cta: { label: 'Go to the spin', href: '/spin' },
  },
};

const FAQ = [
  { q: 'What is BlueberryCash?', a: 'A rewards site. Advertisers pay us when you try their games, apps or surveys. We share part of that with you as coins you can cash out.' },
  { q: 'How much is a coin worth?', a: '1,000 coins = $1.00. Every task shows its reward in coins before you start it.' },
  { q: 'Do I have to pay anything?', a: 'No. BlueberryCash is free. You never need to deposit money to earn or to cash out.' },
  { q: 'How do I get paid?', a: 'Open Cashout, pick PayPal, a Visa card or a crypto coin, and enter where to send it. Requests are checked within 24 hours.' },
  { q: 'How do referral rates work?', a: `You start at ${MIN_RATE}% of what your friends earn from tasks. Add up everything your friends earn in a calendar month: the more it is, the higher your rate, up to ${MAX_RATE}%, and it applies to all of it. Every month starts again at ${MIN_RATE}% on the 1st.` },
  { q: 'Why was my task not credited?', a: 'The advertiser has to confirm the task first. That can take from a few minutes to a few days. Using a VPN, or an account that already did the task, usually stops the credit.' },
];

/* ---------- Helpers ---------- */

function ago(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function useLiveFeed() {
  const [data, setData] = useState({ feed: [], stats: null, loaded: false });
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/live-feed')
        .then((r) => r.json())
        .then((d) => alive && setData({ feed: d.feed || [], stats: d.stats || null, loaded: true }))
        .catch(() => alive && setData((prev) => ({ ...prev, loaded: true })));
    load();
    const iv = setInterval(load, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, []);
  return data;
}

/* ---------- Live earnings ---------- */

function Avatar({ f, className }) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--bb-surface-2)] font-bold text-[var(--bb-berry-300)] ${className}`}>
      {f.avatar ? <img src={f.avatar} alt="" className="h-full w-full object-cover" /> : f.username.charAt(0).toUpperCase()}
    </div>
  );
}

function PayoutTicker({ feed }) {
  if (!feed.length) return null;
  const items = [...feed, ...feed];
  return (
    <div className="relative overflow-hidden" role="region" aria-label="Recent member earnings">
      <div className="bb-ticker flex w-max gap-3">
        {items.map((f, i) => (
          <div
            key={`${f.id}-${i}`}
            aria-hidden={i >= feed.length ? true : undefined}
            className="bb-card flex min-w-[220px] items-center gap-3 rounded-xl! px-3 py-2.5"
          >
            <Avatar f={f} className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{f.username}</div>
              <div className="truncate text-xs text-[var(--bb-muted)]">Task completed · {ago(f.at)}</div>
            </div>
            <div className="text-sm font-bold text-[var(--bb-success)]">${f.usd.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cycles through the latest real earnings inside the hero visual.
function LiveCard({ feed }) {
  const reduce = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (feed.length < 2 || reduce) return;
    const iv = setInterval(() => setIdx((n) => n + 1), 4200);
    return () => clearInterval(iv);
  }, [feed.length, reduce]);

  if (!feed.length) {
    return (
      <div className="bb-card flex items-center gap-3 rounded-xl! px-4 py-3">
        <Wallet className="h-5 w-5 text-[var(--bb-berry-300)]" aria-hidden="true" />
        <div className="text-sm font-semibold">1,000 coins = $1.00</div>
      </div>
    );
  }

  const f = feed[idx % feed.length];
  return (
    <div aria-live="off" className="bb-card rounded-xl! px-4 py-3">
      <div key={`${f.id}-${idx}`} className="bb-slide-in flex items-center gap-3">
        <Avatar f={f} className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{f.username} just earned</div>
          <div className="truncate text-xs text-[var(--bb-muted)]">Task completed · {ago(f.at)}</div>
        </div>
        <div className="text-base font-extrabold text-[var(--bb-success)]">${f.usd.toFixed(2)}</div>
      </div>
    </div>
  );
}

/* ---------- Hero card for signed-in members ---------- */

function MemberCard({ feed }) {
  return (
    <div className="g-neon g-neon-live relative rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-8">
      <p className="g-eyebrow mb-3">Live now</p>
      <h2 className="g-title mb-5 text-2xl text-white">Members are earning</h2>
      <LiveCard feed={feed} />
      <Link href="/earn" className="bb-cta mt-6 w-full">Find a task</Link>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const { user } = useAuth();
  const { feed, stats, loaded } = useLiveFeed();
  const [tab, setTab] = useState('referrals');
  const [open, setOpen] = useState(0);

  const tabKeys = Object.keys(TABS);
  const active = TABS[tab];

  const statItems = stats
    ? [
        { label: 'Tasks completed', value: stats.offersCompleted, decimals: 0 },
        { label: 'Paid out to members', value: stats.paidUsd, decimals: stats.paidUsd >= 100 ? 0 : 2, prefix: '$' },
        { label: 'Members', value: stats.members, decimals: 0 },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <div className="bb-home min-h-screen text-[var(--bb-text)]">
      {/* Without JS the reveal blocks would stay hidden */}
      <noscript>
        <style>{'.bb-reveal{opacity:1!important;transform:none!important}.bb-line{transform:none!important}'}</style>
      </noscript>

      {/* HERO: the scene fills the width of the page, the text and the sign-up card sit on top of it */}
      <HeroScene>
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-32 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-28 lg:pt-10">
          <div className="lg:self-start lg:pt-12">
            <p className="bb-enter inline-flex items-center gap-2 rounded-full border border-[var(--bb-border)] bg-[var(--bb-surface)] px-3 py-1.5 text-sm font-medium text-[var(--bb-berry-300)]" style={{ '--i': 0 }}>
              Games · Apps · Surveys
            </p>
            <h1 className="bb-enter mt-5 text-[42px] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-[58px] lg:text-[66px]" style={{ '--i': 1 }}>
              Turn spare minutes into <span className="text-gradient">real rewards</span>
            </h1>
            <p className="bb-enter mt-5 max-w-lg text-base text-[var(--bb-muted)] sm:text-lg" style={{ '--i': 2 }}>
              Play games, try apps and answer surveys. Cash out to PayPal, a Visa card or crypto from ${MIN_CASHOUT}.
            </p>

            {user && (
              <div className="bb-enter mt-7" style={{ '--i': 3 }}>
                <p className="text-lg font-bold">Welcome back, {user.username}</p>
                <p className="mt-1 text-[var(--bb-muted)]">Balance: {(user.balance_coins || 0).toLocaleString()} coins</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/earn" className="bb-cta">Find a task</Link>
                  <Link href="/cashout" className="bb-ghost">Go to cashout</Link>
                </div>
              </div>
            )}

            <ul className="bb-enter mt-6 flex flex-wrap gap-2 text-sm" style={{ '--i': 5 }}>
              {['No deposit', 'Free to join', `Cashout from $${MIN_CASHOUT}`].map((c) => (
                <li key={c} className="flex items-center gap-1.5 rounded-lg bg-[var(--bb-surface)] px-3 py-1.5 text-[var(--bb-muted)]">
                  <Check className="h-4 w-4 text-[var(--bb-success)]" aria-hidden="true" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {user ? <MemberCard feed={feed} /> : <SignupCard />}
        </div>
      </HeroScene>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-20 pt-4 sm:px-6">

        {/* PROOF: real recent earnings and totals (space is reserved while loading so the page doesn't jump) */}
        {(!loaded || feed.length > 0 || statItems.length > 0) && (
          <Reveal as="section" aria-label="Community activity" className={`flex flex-col gap-4 ${loaded ? '' : 'min-h-[64px]'}`}>
            <PayoutTicker feed={feed} />
            {statItems.length > 0 && (
              <dl className="bb-card grid grid-cols-1 divide-y divide-[var(--bb-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {statItems.map((s) => (
                  <div key={s.label} className="px-6 py-5 text-center">
                    <dd className="text-3xl font-extrabold tracking-tight">
                      <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} />
                    </dd>
                    <dt className="mt-1 text-sm text-[var(--bb-muted)]">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>
        )}

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-24 pt-14">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps to your first payout</Reveal>
          <Reveal as="div" plain className="relative mt-8">
            <div aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-[52px] hidden h-px bg-[var(--bb-border)] md:block">
              <div className="bb-line h-full w-full bg-[var(--bb-primary)]" />
            </div>
            <ol className="relative grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.title} i={i} className="bb-card g-spot relative overflow-hidden p-6">
                  <span aria-hidden="true" className="g-title pointer-events-none absolute right-4 top-2 select-none text-[72px] text-white/[0.07]">0{i + 1}</span>
                  <div className="-mt-1 w-[88px]" aria-hidden="true">
                    <Art name={s.art} size="100%" sizes="88px" glow={s.glow} float style={{ '--delay': `${-i * 1.5}s` }} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--bb-muted)]">{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* WAYS TO EARN: each card goes to the real page for it */}
        <section className="pt-14">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pick how you want to <span className="text-gradient">earn</span></h2>
            <p className="mt-3 max-w-xl text-[var(--bb-muted)]">Three kinds of tasks and a free spin every day. The reward is always shown in coins before you start.</p>
          </Reveal>
          <div className="mt-8 grid gap-3 md:grid-cols-[1.25fr_1fr] md:grid-rows-2">
            <Reveal className="md:row-span-2">
              <Link href="/earn" className="bb-card bb-lift g-spot group relative flex h-full min-h-[260px] flex-col gap-5 overflow-hidden p-6 sm:p-8">
                <div className="w-[140px] sm:w-[170px]" aria-hidden="true">
                  <Art name="gem" size="100%" sizes="170px" glow="blue" float />
                </div>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 text-[var(--bb-berry-300)]" aria-hidden="true">
                    <Gamepad2 className="h-5 w-5" /> <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">Games and apps</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--bb-muted)]">Play a game to a set level or try a new app. Finish the steps and the coins land in your balance.</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--bb-berry-300)]">
                    Browse tasks <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal i={1}>
              <Link href="/earn" className="bb-card bb-lift g-spot group flex h-full items-center gap-5 p-5 sm:p-6">
                <span aria-hidden="true" className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-2xl bg-[linear-gradient(145deg,rgba(69,151,255,0.25),rgba(120,84,247,0.2))] text-[var(--bb-berry-300)]">
                  <ClipboardList className="h-9 w-9" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold">Surveys</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">Answer a few questions and get paid in coins.</p>
                </div>
              </Link>
            </Reveal>

            <Reveal i={2}>
              <Link href="/spin" className="bb-card bb-lift g-spot group flex h-full items-center gap-5 p-5 sm:p-6">
                <div className="w-[84px] shrink-0" aria-hidden="true">
                  <Art name="wheel" size="100%" sizes="90px" glow="purple" float style={{ '--delay': '-1.5s' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold">Daily spin</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">One free spin every 24 hours. Prizes go straight to your balance.</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* PAYOUT METHODS */}
        <section className="pt-12">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cash out the way you like</h2>
            <p className="mt-3 max-w-xl text-[var(--bb-muted)]">These are the methods you can withdraw to today, with the minimum for each.</p>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PAYOUTS.map((m, i) => (
              <Reveal as="li" key={m.key} i={i}>
                <div className="bb-card bb-lift g-spot flex h-full flex-col items-center gap-3 px-3 py-5 text-center">
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center rounded-full text-xl font-bold"
                    style={{ color: m.tint, background: `color-mix(in srgb, ${m.tint} 18%, transparent)` }}
                  >
                    {m.glyph}
                  </span>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="mt-0.5 text-sm text-[var(--bb-muted)]">from ${m.min}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* CALCULATOR: the one interactive thing, built from the real rate and minimums */}
        <section className="pt-14">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See what your coins are <span className="text-gradient">worth</span></h2>
            <p className="mt-3 max-w-xl text-[var(--bb-muted)]">Drag the slider to see the dollar value and which payout methods you unlock.</p>
          </Reveal>
          <Reveal i={1} className="mt-8">
            <CoinCalculator payouts={PAYOUTS} />
          </Reveal>
        </section>

        {/* PERKS */}
        <section className="pt-14">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">More reasons to stay</Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} i={i % 3}>
                <div className="bb-card bb-lift g-spot h-full p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--bb-surface-2)] text-[var(--bb-berry-300)]">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TABS: REFERRALS / SPIN */}
        <Reveal as="section" className="pt-14">
          <div className="bb-card overflow-hidden rounded-[22px]!">
            <div className="relative border-b border-[var(--bb-border)]">
              <div role="tablist" aria-label="More ways to earn" className="grid grid-cols-2">
                {tabKeys.map((key) => (
                  <button
                    key={key}
                    id={`tab-${key}`}
                    role="tab"
                    aria-selected={tab === key}
                    aria-controls="tab-panel"
                    onClick={() => setTab(key)}
                    className={`min-h-[56px] font-semibold transition-colors duration-150 ${tab === key ? 'text-[var(--bb-text)]' : 'text-[var(--bb-muted)] hover:text-[var(--bb-text)]'}`}
                  >
                    {TABS[key].label}
                  </button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className="bb-tab-indicator absolute bottom-0 left-0 h-0.5 w-1/2 bg-[var(--bb-primary)]"
                style={{ transform: `translateX(${tabKeys.indexOf(tab) * 100}%)` }}
              />
            </div>
            <div key={tab} id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="bb-swap grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:gap-10">
              <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{active.title}</h2>
              <p className="mt-3 max-w-xl text-[var(--bb-muted)]">{active.text}</p>
              <ul className="mt-6 grid gap-3 sm:max-w-xl">
                {active.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 rounded-xl bg-[var(--bb-surface-2)] px-4 py-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-[var(--bb-success)]" aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
              {user ? (
                <Link href={active.cta.href} className="bb-cta mt-7">{active.cta.label}</Link>
              ) : (
                <a href="#signup" className="bb-cta mt-7">Sign up to start</a>
              )}
              </div>
              <div className="order-first mx-auto w-[170px] md:order-last md:w-[280px]">
                <Art name={tab === 'spin' ? 'wheel' : 'referral'} size="100%" glow="purple" float tilt />
              </div>
            </div>
          </div>
        </Reveal>

        {/* REFERRAL COMMISSION CALCULATOR */}
        <section className="pt-14">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">Estimate your commission</Reveal>
          <Reveal as="p" className="mt-3 max-w-2xl text-[var(--bb-muted)]">
            Invite friends and earn {MIN_RATE}% to {MAX_RATE}% of what they make. Slide to see what a group of friends would pay you every month.
          </Reveal>
          <Reveal className="mt-8">
            <CommissionCalculator />
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="pt-14">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">Questions</Reveal>
          <div className="mt-8 flex flex-col gap-2">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} i={i} className="bb-card">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(open === i ? -1 : i)}
                    aria-expanded={open === i}
                    aria-controls={`faq-a-${i}`}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                  >
                    {f.q}
                    <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-[var(--bb-muted)] transition-transform duration-[250ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="bb-acc" data-open={open === i ? '' : undefined} inert={open !== i}>
                  <div>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--bb-muted)]">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        {!user && (
          <Reveal as="section" className="pt-14">
            <div className="bb-hero g-ring relative flex flex-col items-center gap-5 overflow-hidden rounded-[22px] px-6 py-12 text-center sm:py-16">
              <div aria-hidden="true" className="pointer-events-none absolute -left-4 bottom-0 hidden w-[170px] sm:block lg:left-8 lg:w-[220px]"><Art name="trophy" size="100%" glow="gold" float /></div>
              <div aria-hidden="true" className="pointer-events-none absolute -right-4 bottom-0 hidden w-[170px] sm:block lg:right-8 lg:w-[220px]"><Art name="gift" size="100%" glow="blue" float style={{ '--delay': '-3s' }} /></div>
              <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Your first dollar is a few tasks away</h2>
              <p className="max-w-md text-[var(--bb-berry-300)]">Join free in under a minute. No deposit, no card.</p>
              <a href="#signup" className="bb-cta">Sign up free</a>
              <p className="flex items-center gap-1.5 text-sm text-[var(--bb-muted)]">
                <Lock className="h-4 w-4" aria-hidden="true" /> We never ask for your card
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
