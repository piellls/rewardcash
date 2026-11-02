'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import SupportModal from '@/components/SupportModal';
import { estimate, TIERS } from '@/lib/affiliate';
import s from './home.module.css';

const TILES = [
  { title: 'Earn', fact: 'Apps, games and surveys from partner networks. The reward is shown before you start.', img: '/banners/blueberrycash-earn.png', alt: 'The mascot with games, tasks and coins' },
  { title: 'Daily spin', fact: 'One free spin every 24 hours. The prizes are on the wheel.', img: '/art/wheel.webp', alt: 'A prize wheel' },
  { title: 'Cash out', fact: 'PayPal, Visa prepaid, Bitcoin, Litecoin, Ethereum or Solana. 1,000 coins = $1.00.', img: '/banners/blueberrycash-cashout-rewards.png', alt: 'The mascot with payout rewards' },
  { title: 'Referrals', fact: `Earn a share of what your friends make, from ${TIERS[0].rate}% up to ${TIERS[TIERS.length - 1].rate}% depending on their monthly total.`, img: '/art/referral.webp', alt: 'Two people connected by a referral' },
];

const HOW = [
  { word: 'Join', text: 'Create a free account. Every new account starts with 100 coins.' },
  { word: 'Complete', text: 'Finish the task shown on each card. Coins are added to your balance.' },
  { word: 'Cash out', text: 'Pick a method and an amount on the Cashout page. Each request is reviewed before payment.' },
];

const FAQ = [
  ['How does BlueberryCash work?', 'Advertising partners pay for completed tasks. We pay those rewards to you as coins, which you can exchange on the Cashout page.'],
  ['How much can I earn?', 'It depends on the task. The reward is shown before you start, and earnings are not guaranteed.'],
  ['What does 1,000 coins mean?', '1,000 coins are worth $1.00. Each payout method has its own minimum and amounts.'],
  ['How do I contact support?', 'Use the support button to open a ticket. Include the task name and any details that help us check it.'],
];

export default function Home() {
  const { user } = useAuth();
  const [auth, setAuth] = useState(null);
  const [support, setSupport] = useState(false);

  // Registration links from the app and referral URLs open the sign-up form directly.
  useEffect(() => {
    const openRegistration = () => {
      if (!user && (window.location.hash === '#signup' || new URLSearchParams(window.location.search).has('ref'))) setAuth('register');
    };
    openRegistration();
    window.addEventListener('hashchange', openRegistration);
    return () => window.removeEventListener('hashchange', openRegistration);
  }, [user]);

  const example = estimate(25, 40);

  return (
    <div className={s.page}>
      <header className={s.bar}>
        <Link href="/" aria-label="BlueberryCash home" className={s.mark}>
          <img src="/brand/blueberrycash-logo.png" alt="BlueberryCash" width="640" height="167" />
        </Link>
        <nav aria-label="Main" className={s.links}>
          <Link href="/earn">Earn</Link>
          <Link href="/cashout">Cashout</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/referrals">Referrals</Link>
        </nav>
        {user ? (
          <Link href="/dashboard" className={s.action}>My account</Link>
        ) : (
          <button type="button" className={s.action} onClick={() => setAuth('register')}>Sign up free</button>
        )}
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroText}>
            <h1 id="hero-title">Tasks become coins.</h1>
            <p className={s.lead}>Complete apps, games and surveys. 1,000 coins = $1.00, paid out to PayPal, a Visa prepaid card or crypto.</p>
            {user ? (
              <Link href="/earn" className={s.button}>Go to tasks</Link>
            ) : (
              <button type="button" className={s.button} onClick={() => setAuth('register')}>Start with 100 coins</button>
            )}
          </div>
          <div className={s.heroShape} aria-hidden="true">
            <img src="/banners/blueberrycash-earn.png" alt="" width="2170" height="725" fetchPriority="high" />
          </div>
        </section>

        <section className={s.tiles} aria-labelledby="features-title">
          <h2 id="features-title" className={s.h2}>What is on BlueberryCash</h2>
          <ul className={s.tileGrid}>
            {TILES.map((t) => (
              <li key={t.title} className={s.tileItem}>
                <div className={s.tile}>
                  <img src={t.img} alt={t.alt} width="800" height="800" loading="lazy" />
                </div>
                <h3>{t.title}</h3>
                <p>{t.fact}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" className={s.how} aria-labelledby="how-title">
          <h2 id="how-title" className={s.h2}>Join, complete, cash out</h2>
          <ol className={s.steps}>
            {HOW.map((h) => (
              <li key={h.word}>
                <span className={s.dot} aria-hidden="true" />
                <h3>{h.word}</h3>
                <p>{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={s.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={s.h2}>Questions</h2>
          <div className={s.faqList}>
            {FAQ.map(([q, a]) => (
              <details key={q} name="faq" className={s.faqItem}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className={s.note}>Example, not a promise: at {example.rate}% a friend group earning $40 each per month would pay ${example.commission.toFixed(2)} a month.</p>
        </section>

        <section className={s.cta} aria-labelledby="cta-title">
          <h2 id="cta-title">Start with 100 coins.</h2>
          {user ? (
            <Link href="/earn" className={s.button}>See today&apos;s tasks</Link>
          ) : (
            <button type="button" className={s.button} onClick={() => setAuth('register')}>Sign up free</button>
          )}
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footMark}>
          <img src="/brand/blueberrycash-logo.png" alt="BlueberryCash" width="640" height="167" className={s.footLogo} />
        </div>
        <nav aria-label="Footer" className={s.footLinks}>
          <Link href="/rules">Rules</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <button type="button" onClick={() => setSupport(true)}>Support</button>
        </nav>
        <p className={s.copy}>© {new Date().getFullYear()} BlueberryCash. All rights reserved.</p>
      </footer>

      <AuthModal isOpen={Boolean(auth)} defaultTab={auth || 'login'} onClose={() => setAuth(null)} />
      <SupportModal isOpen={support} onClose={() => setSupport(false)} />
    </div>
  );
}
