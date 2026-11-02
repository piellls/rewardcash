'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Coins, Gift, Info, MessageCircle, MessageSquare, Trophy, Users, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import SupportModal from '@/components/SupportModal';
import { estimate, TIERS, formatUsd } from '@/lib/affiliate';
import s from './home.module.css';

const asset = (file) => `/home-reference/${file}`;

// Only the payout methods the site really offers (see lib/cashout.js). Nothing else is shown as a reward.
const PAYOUTS = [
  { name: 'PayPal', file: 'paypal2.svg' },
  { name: 'Visa Prepaid', file: 'visa5.png' },
  { name: 'Bitcoin', file: 'bitcoin3.png' },
  { name: 'Litecoin', file: 'litecoin2.png' },
  { name: 'Ethereum', file: 'eth.png' },
  { name: 'Solana', file: 'solana.png' },
];

const STEPS = [
  { title: 'Create a free account', text: 'Sign up in a minute. Every new account starts with 100 coins, and there is no deposit.' },
  { title: 'Complete tasks', text: 'Try an app, play a game or answer a survey. The reward is shown on each task before you start.' },
  { title: 'Cash out', text: 'Exchange coins for PayPal, a Visa prepaid card or crypto. 1,000 coins = $1.00.' },
];

const FEATURES = [
  { icon: Gift, title: 'Daily spin', text: 'One free spin every 24 hours. Prizes are shown on the wheel before you spin.' },
  { icon: Trophy, title: 'Levels', text: 'Every coin you earn counts toward your level, shown next to your name.' },
  { icon: Users, title: 'Referrals', text: `Invite friends and earn a share of the coins they make, from ${TIERS[0].rate}% up to ${TIERS[TIERS.length - 1].rate}% depending on how much your friends earn in a month.` },
  { icon: Wallet, title: 'Clear payouts', text: 'Each method shows its minimum and amounts before you request anything.' },
];

const FAQ = [
  ['How does BlueberryCash work?', 'Advertising partners pay for completed tasks. We share those payments with you as coins, which you can exchange on the Cashout page.'],
  ['How much can I earn?', 'Rewards depend on the task and on the requirements. The reward is shown before you start, and earnings are not guaranteed.'],
  ['Which payouts are available?', 'The Cashout page lists the current methods, their minimums and amounts. 1,000 coins are worth $1.00.'],
  ['How do I contact support?', 'Use the support button to open a ticket. Include the task name and any details that help us check it.'],
];

export default function Home() {
  const { user } = useAuth();
  const [auth, setAuth] = useState(null);
  const [support, setSupport] = useState(false);
  const [friends, setFriends] = useState(25);
  const [earnings, setEarnings] = useState(40);
  const [openFaq, setOpenFaq] = useState(null);

  const result = estimate(friends, earnings);

  // Registration links from the app navigation and referral URLs open the sign-up form directly.
  useEffect(() => {
    const openRegistration = () => {
      if (!user && (window.location.hash === '#signup' || new URLSearchParams(window.location.search).has('ref'))) setAuth('register');
    };
    openRegistration();
    window.addEventListener('hashchange', openRegistration);
    return () => window.removeEventListener('hashchange', openRegistration);
  }, [user]);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.container + ' ' + s.nav}>
          <Link href="/" className={s.brand} aria-label="BlueberryCash home">
            <img src="/brand/blueberrycash-logo.png" alt="BlueberryCash" width="640" height="167" decoding="async" />
          </Link>
          <nav aria-label="Main navigation" className={s.navLinks}>
            <Link href="/earn">Earn</Link>
            <Link href="/cashout">Cashout</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/referrals">Referrals</Link>
          </nav>
          <div className={s.navActions}>
            {user ? (
              <Link className={s.btnPrimary} href="/dashboard">My account</Link>
            ) : (
              <>
                <button type="button" className={s.btnGhost} onClick={() => setAuth('login')}>Sign in</button>
                <button type="button" className={s.btnPrimary} onClick={() => setAuth('register')}>Sign up free</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={s.container}>
        <section className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>BlueberryCash</p>
            <h1>Turn tasks into <span className={s.accent}>rewards</span></h1>
            <p className={s.lead}>Try apps, play games and answer surveys. Your coins add up to PayPal, a Visa prepaid card or crypto.</p>
            <ul className={s.chips} aria-label="Good to know">
              {['Free to join', 'No deposit', '100 coins to start'].map((t) => (
                <li key={t}><Check size={15} strokeWidth={3} aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <div className={s.heroActions}>
              <Link className={s.btnPrimary} href="/earn">Start earning <ArrowRight size={18} aria-hidden="true" /></Link>
              <a className={s.btnGhost} href="#how-it-works"><Info size={18} aria-hidden="true" />How it works</a>
            </div>
          </div>
          <div className={s.heroArt} aria-hidden="true">
            <img src="/banners/blueberrycash-earn.png" alt="" width="2170" height="725" fetchPriority="high" />
          </div>
        </section>

        <section className={s.payouts} aria-labelledby="payouts-title">
          <h2 id="payouts-title" className={s.kicker}>Ways to cash out</h2>
          <ul>
            {PAYOUTS.map((p) => (
              <li key={p.name}>
                <img src={asset(p.file)} alt="" width="40" height="40" loading="lazy" />
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
          <p className={s.note}>1,000 coins = $1.00. Minimums and amounts are on the <Link href="/cashout">Cashout page</Link>.</p>
        </section>

        <section id="how-it-works" className={s.section} aria-labelledby="how-title">
          <h2 id="how-title" className={s.h2}>How it works</h2>
          <ol className={s.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={s.card}>
                <span className={s.stepNum}>{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={s.section} aria-labelledby="features-title">
          <h2 id="features-title" className={s.h2}>More ways to earn</h2>
          <div className={s.features}>
            {FEATURES.map((f) => (
              <article key={f.title} className={s.card}>
                <span className={s.iconBox}><f.icon size={22} aria-hidden="true" /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="calc-title">
          <div className={s.calcWrap}>
            <div>
              <h2 id="calc-title" className={s.h2}>Estimate your referral commission</h2>
              <p className={s.muted}>Move the sliders to see what a group of friends could pay you each month. This is an estimate, not a guaranteed payment.</p>
            </div>
            <div className={s.calc}>
              <label htmlFor="friends" className={s.sliderLabel}>Friends you invite <strong>{friends}</strong></label>
              <input id="friends" type="range" min="1" max="500" value={friends} onChange={(e) => setFriends(Number(e.target.value))} />
              <label htmlFor="earnings" className={s.sliderLabel}>Each friend earns per month <strong>{formatUsd(earnings)}</strong></label>
              <input id="earnings" type="range" min="1" max="200" value={earnings} onChange={(e) => setEarnings(Number(e.target.value))} />
              <div className={s.result}>
                <span>Your rate: <strong>{result.rate}%</strong></span>
                <span>Estimated monthly: <strong>{formatUsd(result.commission, 2)}</strong></span>
              </div>
              {result.next && <p className={s.muted}>{formatUsd(result.toNext)} more in friends&apos; monthly earnings reaches {result.next.rate}%.</p>}
            </div>
          </div>
        </section>

        <section id="faq" className={s.section} aria-labelledby="faq-title">
          <h2 id="faq-title" className={s.h2}>Questions</h2>
          <div className={s.faq}>
            {FAQ.map(([q, a], i) => (
              <div key={q} className={s.faqItem}>
                <h3>
                  <button type="button" aria-expanded={openFaq === i} aria-controls={`faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {q}
                  </button>
                </h3>
                {openFaq === i && <p id={`faq-${i}`}>{a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className={s.ctaBand}>
          <div>
            <h2>Ready when you are</h2>
            <p>Free to join. Start with 100 coins and pick your tasks.</p>
          </div>
          <Link className={s.btnPrimary} href="/earn">Start earning <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.container + ' ' + s.footerInner}>
          <div>
            <img src="/brand/blueberrycash-logo.png" alt="BlueberryCash" width="640" height="167" className={s.footerLogo} />
            <p className={s.muted}>Complete tasks, collect coins and choose how you cash out.</p>
          </div>
          <nav aria-label="Footer" className={s.footerLinks}>
            <Link href="/rules">Rules</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <button type="button" onClick={() => setSupport(true)}>Support</button>
          </nav>
        </div>
        <p className={s.copy}>© {new Date().getFullYear()} BlueberryCash. All rights reserved.</p>
      </footer>

      <button type="button" className={s.supportFab} aria-label="Contact support" onClick={() => setSupport(true)}>
        <MessageCircle size={20} aria-hidden="true" />
      </button>

      <nav aria-label="Main" className={s.bottomNav}>
        <Link href="/earn"><Coins size={20} aria-hidden="true" /><span>Earn</span></Link>
        <Link href="/cashout"><Wallet size={20} aria-hidden="true" /><span>Cashout</span></Link>
        <Link href="/leaderboard"><Trophy size={20} aria-hidden="true" /><span>Leaderboard</span></Link>
        <Link href="/referrals"><Users size={20} aria-hidden="true" /><span>Referrals</span></Link>
        <button type="button" onClick={() => setSupport(true)}><MessageSquare size={20} aria-hidden="true" /><span>Support</span></button>
      </nav>

      <AuthModal isOpen={Boolean(auth)} defaultTab={auth || 'login'} onClose={() => setAuth(null)} />
      <SupportModal isOpen={support} onClose={() => setSupport(false)} />
    </div>
  );
}
