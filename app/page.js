'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How does blueberrycash.com work?',
    a: 'Advertisers pay users like you to use their apps or complete surveys so they can reach more people. We pass those earnings on to you, which you can then withdraw with your favourite option! blueberrycash.com has helped thousands of users earn real rewards.',
  },
  {
    q: 'What do I do on blueberrycash.com?',
    a: 'You can earn coins by completing simple tasks like downloading apps, playing games, participating in surveys, watching short videos, referring friends and more.',
  },
  {
    q: 'How much can I earn on blueberrycash.com?',
    a: 'Your earnings depend on your activity and dedication. Active users can earn from $10 up to $50+ a week by dedicating a few hours daily to completing offers, referrals and more.',
  },
  {
    q: 'What withdrawal options are there?',
    a: 'You can cash out via PayPal, Bitcoin, Litecoin, Ethereum, Solana, Visa gift cards and more.',
  },
  {
    q: 'How can I get help if I have an issue?',
    a: 'Reach out to our support team by emailing support@blueberrycash.com and our team will help you out!',
  },
];

// ─── MARQUEE ITEMS ────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  { label: 'PayPal', icon: '💰' },
  { label: 'Bitcoin', icon: '₿' },
  { label: 'Ethereum', icon: '⟠' },
  { label: 'Litecoin', icon: '◈' },
  { label: 'Solana', icon: '◎' },
  { label: 'Visa', icon: '💳' },
  { label: 'Amazon', icon: '📦' },
  { label: 'Steam', icon: '🎮' },
  { label: 'Netflix', icon: '🎬' },
  { label: 'Google Play', icon: '▶' },
];

// ─── FEATURES ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'Daily Free Spins',
    desc: 'Log in every day to spin the wheel for free coins, boosts and instant rewards.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
      </svg>
    ),
    align: 'left',
  },
  {
    title: 'Leaderboard Prizes',
    desc: 'Compete weekly and climb the leaderboard for large prize pools and exclusive rewards.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" d="M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
        <path strokeLinecap="round" d="M12 11V21M9 17h6" />
        <path strokeLinecap="round" d="M9 3v4l3-2 3 2V3" />
      </svg>
    ),
    align: 'right',
  },
  {
    title: 'Earning Bonuses',
    desc: 'Stack extra bonuses on top of everything you earn from completed offers and tasks.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    align: 'left',
  },
  {
    title: 'Referral Commissions',
    desc: 'Refer friends and earn a percentage of everything they make — passive income forever.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    align: 'right',
  },
  {
    title: 'Multiple Offerwalls',
    desc: 'Access thousands of offers from top networks like AdBlueMedia, OGAds and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
    align: 'left',
  },
  {
    title: 'Instant Cashouts',
    desc: 'Request withdrawals and receive your rewards quickly with no hidden fees.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#a855f7]" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path strokeLinecap="round" d="M9 22V12h6v10" />
      </svg>
    ),
    align: 'right',
  },
];

// ─── FAQ ACCORDION ITEM ───────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#13141a] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 cursor-pointer"
      >
        <span className="text-[15px] font-medium text-white">{q}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-[#1e1e26]/50">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  return (
    <div className="relative overflow-hidden mb-10 py-1 mt-4">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-left 28s linear infinite;
        }
      `}</style>
      <div className="marquee-track">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <div
            key={i}
            className="mx-6 sm:mx-10 flex shrink-0 items-center gap-2 text-white/50 text-xl sm:text-2xl font-bold whitespace-nowrap"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [referrals, setReferrals] = useState(25);
  const [perFriend, setPerFriend] = useState(40);

  const openSignUp = () => { setAuthTab('register'); setAuthOpen(true); };

  const commission = referrals <= 10 ? 5 : referrals <= 30 ? 7 : referrals <= 60 ? 10 : 15;
  const monthly = Math.round(referrals * perFriend * (commission / 100));

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0c] text-white">
        {/* ── HERO BANNER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
          <div className="relative overflow-hidden rounded-2xl mb-8 sm:mb-10" style={{ minHeight: 260 }}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#120827] to-[#0a0a12]" />
            {/* Purple glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#a855f7] rounded-full opacity-10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-60 h-60 bg-[#6d28d9] rounded-full opacity-10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col justify-center gap-5 py-10 px-6 sm:px-12 sm:py-16 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.05] tracking-tight">
                Turn <span className="text-[#a855f7]">Tasks &amp; Surveys</span>
                <br />Into Rewards
              </h1>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-2">
                {['No deposit', 'Quick cashout', 'Free to join'].map((badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-white/8 border border-white/10 px-4 h-9 text-sm font-semibold text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 shrink-0 text-[#a855f7]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                {user ? (
                  <Link
                    href="/earn"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-base font-bold transition-colors"
                  >
                    Earn now!
                  </Link>
                ) : (
                  <button
                    onClick={openSignUp}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-base font-bold transition-colors cursor-pointer"
                  >
                    Earn now!
                  </button>
                )}
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/8 border border-white/10 hover:bg-white/12 text-white text-base font-semibold transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-zinc-400">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm1.2 10.75h-2.4v-6.5h2.4v6.5Z" />
                  </svg>
                  How it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Marquee />
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 mb-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create an Account',
                desc: 'Sign up for free in seconds — just an email and password, no credit card needed.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 text-[#a855f7] mb-4">
                    <path strokeLinecap="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Earn Coins',
                desc: 'Complete tasks, play games, take surveys and watch videos to stack up coins.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 text-[#a855f7] mb-4">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 7v10M9.5 9.5C9.5 8.4 10.6 8 12 8s2.5.4 2.5 1.5-1 1.5-2.5 1.8c-1.7.4-2.5.9-2.5 2.2C9.5 14.8 10.6 16 12 16s2.5-.6 2.5-1.5" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Cash Out',
                desc: 'Redeem your coins for PayPal, crypto, gift cards and more.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 text-[#a855f7] mb-4">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path strokeLinecap="round" d="M2 10h20" />
                    <path strokeLinecap="round" d="M6 15h4" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div
                key={step}
                className="relative overflow-hidden rounded-2xl bg-[#13141a] border border-[#1e1e26] px-8 py-10 flex flex-col items-center text-center group hover:border-[#a855f7]/40 transition-colors"
              >
                <div className="absolute top-4 right-4 text-5xl font-black text-white/4 select-none">{step}</div>
                {icon}
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-sm text-zinc-400 max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT WE OFFER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <h2 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-[#a855f7] mb-5">
            What we Offer
          </h2>
          <hr className="border-t border-[#1e1e26] mb-8" />

          <div className="flex flex-col gap-6 sm:gap-8">
            {FEATURES.map(({ title, desc, icon, align }) => (
              <div
                key={title}
                className={`flex flex-col items-center gap-3 sm:gap-6 ${align === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
              >
                <div className="shrink-0">{icon}</div>
                <div className={`flex-1 text-center ${align === 'right' ? 'sm:text-right' : 'sm:text-left'}`}>
                  <h3 className="text-lg font-extrabold text-white sm:text-xl md:text-2xl">{title}</h3>
                  <p className={`mt-1.5 text-xs text-zinc-400 sm:text-sm max-w-sm ${align === 'right' ? 'sm:ml-auto' : ''}`}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── REFERRAL SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-[#13141a] border border-[#1e1e26] p-6 sm:p-8">
            {/* glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#a855f7] rounded-full opacity-10 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex border-b border-[#1e1e26] pb-3 mb-6 gap-0">
                <span className="flex-1 text-center text-sm sm:text-base font-semibold pb-3 border-b-2 border-[#a855f7] text-white -mb-3">
                  Affiliates
                </span>
                <span className="flex-1 text-center text-sm sm:text-base font-semibold pb-3 text-zinc-500">
                  Daily Spin
                </span>
              </div>

              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                {/* Left */}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#a855f7] sm:text-sm">Affiliates Program</p>
                  <p className="mt-3 text-xl font-extrabold text-white sm:text-2xl md:text-3xl">
                    Passive income with <span className="text-[#a855f7]">Referrals</span>
                  </p>
                  <p className="mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
                    Earn a % from every offer your referrals complete. The more they earn, the more you earn and the higher your commission tier.
                  </p>
                  <div className="mt-6 flex flex-col gap-4">
                    {[
                      { icon: '🔗', label: 'Share your referral link' },
                      { icon: '👥', label: 'Referred users complete offers on blueberrycash.com' },
                      { icon: '💰', label: 'You earn a % of what each referred user makes' },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-[#a855f7]/15 text-lg">
                          {icon}
                        </span>
                        <span className="text-sm text-zinc-300 sm:text-base">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right - Calculator */}
                <div className="flex-1 rounded-2xl bg-[#0e0f16] border border-[#1e1e26] p-5 sm:p-6">
                  <h4 className="font-bold text-white">Estimate your commission</h4>
                  <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Your tier depends on how many friends you invite.</p>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-300">Friends you invite</span>
                      <span className="font-bold text-white">{referrals}</span>
                    </div>
                    <input
                      type="range" min="1" max="200" value={referrals}
                      onChange={e => setReferrals(+e.target.value)}
                      className="w-full accent-[#a855f7]"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-300">Each friend earns per month</span>
                      <span className="font-bold text-white">${perFriend}</span>
                    </div>
                    <input
                      type="range" min="0" max="300" step="5" value={perFriend}
                      onChange={e => setPerFriend(+e.target.value)}
                      className="w-full accent-[#a855f7]"
                    />
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#1e1e26]">
                    <p className="text-xs text-zinc-400 sm:text-sm">Your commission rate</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#a855f7]">{commission}%</p>
                    <p className="mt-3 text-xs text-zinc-400 sm:text-sm">You get every month</p>
                    <p className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">
                      <span className="text-[#a855f7]">$</span>{monthly}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 scroll-mt-20">
          <h2 className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-[#a855f7]">
            Still have questions?
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">Here are top answers</p>
          <hr className="mt-5 border-t border-[#1e1e26] mb-10" />
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </section>

        {/* ── BOTTOM CTA BANNER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="relative overflow-hidden bg-[#13141a] border border-[#1e1e26] rounded-2xl p-4 sm:px-6 ring-1 ring-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/10 via-[#a855f7]/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 sm:gap-4 relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-b from-[#c084fc] to-[#7c3aed] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
                  <path d="M5.1 3.6h13.8a1.2 1.2 0 0 1 0 2.4H5.1a1.2 1.2 0 0 1 0-2.4Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.3 7.4h15.4A2.3 2.3 0 0 1 22 9.7v8a2.3 2.3 0 0 1-2.3 2.3H4.3A2.3 2.3 0 0 1 2 17.7v-8a2.3 2.3 0 0 1 2.3-2.3Zm2.2 3.1a1.1 1.1 0 1 0 0 2.2h11a1.1 1.1 0 1 0 0-2.2h-11Z" />
                </svg>
              </div>
              <p className="text-base sm:text-lg font-bold">
                Cash out with <span className="text-[#a855f7]">multiple</span> withdrawal options
              </p>
            </div>
            <div className="relative flex justify-center sm:justify-end">
              {user ? (
                <Link
                  href="/cashout"
                  className="inline-flex items-center justify-center h-11 px-7 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-bold transition-colors"
                >
                  Cash Out Now
                </Link>
              ) : (
                <button
                  onClick={openSignUp}
                  className="inline-flex items-center justify-center h-11 px-7 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  Get Started Free
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
