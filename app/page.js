'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Info, Coins, Gift, Link as LinkIcon, Users, ChevronDown, MessageCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import SupportModal from '@/components/SupportModal';
import ThemeIcon from '@/components/ThemeIcon';
import { useScrollReveal } from '@/components/motion';
import { estimate, TIERS, formatUsd } from '@/lib/affiliate';
import s from './home.module.css';

const asset = (file) => `/home-reference/${file}`;
const logos = [
  ['Roblox', 'robloxlogowhite-trim.png', 5.402, 1], ['PayPal', 'paypallogowhite-trim.png', 2.985, 1],
  ['Xbox', 'xboxlogowhite-trim.png', 3.902, 1.18], ['Steam', 'steamlogowhite-trim.png', 3.684, 1.18],
  ['PlayStation', 'playstationwhite-trim.png', 6.363, 1.08], ['Litecoin', 'litecoinwhite-trim.png', 4.193, 1.18],
  ['Bitcoin', 'bitcoinlogowhite-trim.png', 5.120, 1.18], ['Nintendo', 'nintendowhite-trim.png', 4.646, 1.15],
  ['Amazon', 'amazonlogowhite-trim.png', 3.688, 1.12], ['Netflix', 'netflixwhite.png', 3.709, 1], ['Solana', 'solanawhite.png', 6.729, 1],
];
const steps = [
  ['signupicon2landing.png', 'Create an Account', 'Join BlueberryCash for free and set up your account in a few simple steps.'],
  ['earniconlanding.png', 'Earn Points', 'Discover games, apps and surveys. Finish the requirements to collect your coins.'],
  ['withdrawiconlanding.png', 'Cash Out', 'Choose your payout method and exchange your coins for a reward.'],
];
const benefits = [
  ['dailywheelspins.png', 'Daily Wheel Spins', 'Come back every 24 hours for a free spin and a chance to collect more coins.'],
  ['rankrewards.png', 'Rank Rewards', 'Every completed offer adds to your experience. Watch your level grow as you earn.'],
  ['bonusesicon.png', 'Bonuses on Earnings', 'Start with a welcome bonus and discover more ways to build your balance.'],
  ['earningboosts.png', 'More Ways to Earn', 'Find a new game, try an app or share your opinion in a survey.'],
  ['exclusivetournaments.png', 'Community Leaderboard', 'See how your earnings compare with other members of the community.'],
  ['affiliateicon.png', 'High Payout Commissions', 'Invite friends and receive a share of their completed offers, with rates up to 15%.'],
];
const questions = [
  ['How does BlueberryCash work?', 'Our advertising partners pay for completed offers. We share those payments with you as coins, which you can exchange on the Cashout page.'],
  ['What can I do on BlueberryCash?', 'Browse the Earn page for available games, apps and surveys. You can also invite friends and use your free daily spin.'],
  ['How much can I earn?', 'Rewards vary by offer, location and completion requirements. Check the displayed reward before starting. Earnings are not guaranteed.'],
  ['Which payouts are available?', 'Visit Cashout to see the current payment methods, minimum amounts and availability for your account. Each 1,000 coins is worth $1.'],
  ['How do I contact support?', 'Use the support button below to open a ticket. Include the offer name and any details that can help us investigate.'],
];

function Brand() {
  return <Link href="/" className={s.brand} aria-label="BlueberryCash home"><span>BLUEBERRY</span>CASH</Link>;
}

export default function Home() {
  const { user } = useAuth();
  const [auth, setAuth] = useState(null);
  const [support, setSupport] = useState(false);
  const [tab, setTab] = useState('affiliate');
  const [friends, setFriends] = useState(25);
  const [earnings, setEarnings] = useState(40);
  const [faq, setFaq] = useState(null);
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal(rootRef);
  // The sticky header gets a soft shadow once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const result = estimate(friends, earnings);
  // Preserve registration links from the app navigation and referral landing URLs.
  useEffect(() => {
    const openRegistration = () => {
      if (!user && (window.location.hash === '#signup' || new URLSearchParams(window.location.search).has('ref'))) setAuth('register');
    };
    openRegistration();
    window.addEventListener('hashchange', openRegistration);
    return () => window.removeEventListener('hashchange', openRegistration);
  }, [user]);
  return (
    <div ref={rootRef} className={s.home}>
      <header className={s.header} data-scrolled={scrolled ? '' : undefined}>
        <div className={`${s.container} ${s.nav}`}>
          <Brand />
          <nav aria-label="Main navigation" className={s.navLinks}>
            <Link href="/earn"><Coins size={20} />Earn</Link>
            <Link href="/spin"><Gift size={20} />Rewards</Link>
          </nav>
          <div className={s.authActions}>
            {user ? <Link className={`${s.button} ${s.primary}`} href="/dashboard">My account</Link> : <><button className={s.button} onClick={() => setAuth('login')}>Login</button><button className={`${s.button} ${s.primary}`} onClick={() => setAuth('register')}>Sign Up</button></>}
          </div>
        </div>
      </header>
      <main className={`${s.container} ${s.main}`}>
        <section className={s.hero}>
          <img className={s.heroImage} src={asset('banner3.png')} alt="" fetchPriority="high" />
          <div className={s.heroShade} />
          <div className={s.heroContent}>
            <h1 style={{ '--i': 0 }}>Turn <span>Tasks &amp; Surveys</span><br />Into Rewards</h1>
            <div className={s.badges} style={{ '--i': 1 }}>{['No deposit', 'Quick cashout', 'Free to join'].map(t => <span key={t}><Check size={14} strokeWidth={3} />{t}</span>)}</div>
            <div className={s.heroActions} style={{ '--i': 2 }}><Link className={`${s.button} ${s.primary}`} href="/earn">Earn now!</Link><a className={s.button} href="#how-it-works"><Info size={18} />How it works</a></div>
          </div>
        </section>
        <div className={s.logoWindow} aria-label="Reward brands">
          <div className={s.logoTrack}>{[0, 1, 2].map(copy => <div key={copy} className={s.logoGroup} aria-hidden={copy > 0}>{logos.map(([name, file, width, height]) => <img key={name} src={asset(file)} alt={copy ? '' : name} style={{ width: `${width}em`, height: `${height}em` }} />)}</div>)}</div>
        </div>
        <figure className={`${s.artBanner} ${s.gamesBanner}`} data-reveal>
          <img src="/banners/blueberrycash-neon-games.png" alt="Blueberry mascot surrounded by colorful mobile games" width="2048" height="768" loading="lazy" decoding="async" />
          <span className={s.neonLine} aria-hidden="true" />
        </figure>
        <section id="how-it-works" className={s.steps} aria-label="How it works">{steps.map(([file, title, text], i) => <article className={s.step} key={title} data-reveal style={{ '--i': i }}><img src={asset(file)} alt="" width="96" height="96" /><h2>{title}</h2><p>{text}</p></article>)}</section>
        <section className={s.offers}>
          <h2 className={s.eyebrow} data-reveal>What we Offer</h2><hr />
          <div className={s.benefits}>{benefits.map(([file, title, text]) => <article key={title} className={s.benefit} data-reveal><img src={asset(file)} alt="" loading="lazy" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          <div className={`${s.feature} ${tab === 'wheel' ? s.wheelFeature : ''}`} data-reveal>
            <div className={s.tabs} role="tablist" aria-label="Rewards features">
              {['affiliate', 'wheel'].map(key => <button key={key} id={`tab-${key}`} role="tab" aria-selected={tab === key} aria-controls={`panel-${key}`} tabIndex={tab === key ? 0 : -1} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = key === 'affiliate' ? 'wheel' : 'affiliate'; setTab(next); document.getElementById(`tab-${next}`)?.focus(); } }} className={tab === key ? s.activeTab : ''} onClick={() => setTab(key)}>{key === 'affiliate' ? 'Affiliate' : 'Daily Wheel'}</button>)}
            </div>
            <div key={tab} className={s.featureGrid} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
              {tab === 'affiliate' ? <>
                <div className={s.featureText}><h3 className={s.eyebrow}>Affiliates Program</h3><h2>Passive income with <span>Affiliates</span></h2><p>Build a network of friends and earn from the offers they finish. Your monthly referral activity sets your commission, from 5% up to 15%.</p><ul>{[[LinkIcon,'Send friends your invitation link'],[Users,'They join and complete available offers'],[Coins,'Receive your share of their earnings']].map(([Icon,text]) => <li key={text}><i><Icon size={20} /></i>{text}</li>)}</ul></div>
                <div className={s.calculator}><h4>Estimate your commission</h4><p>Explore what your referrals could earn you. This is an estimate, not a guaranteed payment.</p><label htmlFor="friends">Friends you invite <strong>{friends}</strong></label><input id="friends" type="range" min="1" max="500" value={friends} onChange={e => setFriends(Number(e.target.value))} /><label htmlFor="earnings">Each friend earns per month <strong>${earnings}</strong></label><input id="earnings" type="range" min="1" max="200" value={earnings} onChange={e => setEarnings(Number(e.target.value))} /><p className={s.tierLabel}>Your commission tier</p><div className={s.tiers}>{TIERS.map(({rate},i) => <span key={rate} className={result.index === i ? s.selectedTier : ''}>{rate}%</span>)}</div><div className={s.estimate}>You get every month<strong aria-live="polite">{formatUsd(result.commission, result.commission % 1 ? 2 : 0)}</strong></div></div>
              </> : <><div className={s.featureText}><h3 className={s.eyebrow}>Daily Wheel</h3><h2>A new day.<br /><span>A new chance to win.</span></h2><p>Your free spin is available once every 24 hours. Open the wheel to see the prizes and your next available spin.</p><Link className={`${s.button} ${s.primary} ${s.spinButton}`} href="/spin">Open daily wheel <ArrowRight size={18} /></Link></div><div className={s.wheelArt}><img src={asset('dailywheelspins.png')} alt="Purple daily reward wheel" /></div></>}
            </div>
          </div>
        </section>
        <section id="faq" className={s.faq}><h2 className={s.eyebrow} data-reveal>Still have questions?</h2><p className={s.faqSubtitle} data-reveal style={{ '--i': 1 }}>Here are top answers</p><hr /><div className={s.faqList}>{questions.map(([q,a],i) => <article key={q} data-reveal style={{ '--i': i }}><h3><button aria-expanded={faq === i} aria-controls={`answer-${i}`} onClick={() => setFaq(faq === i ? null : i)}>{q}<ChevronDown size={18} style={{transform: faq === i ? 'rotate(180deg)' : undefined}} /></button></h3><div id={`answer-${i}`} className={s.accordion} data-open={faq === i ? '' : undefined} inert={faq !== i}><div><div className={s.answer}>{a}</div></div></div></article>)}</div></section>
        <Link href="/cashout" className={`${s.artBanner} ${s.rewardsBanner}`} data-reveal aria-label="Explore cashout rewards">
          <img src="/banners/blueberrycash-cashout-rewards.png" alt="Blueberry mascot with PayPal, crypto, gift card and gaming rewards" width="2078" height="757" loading="lazy" decoding="async" />
          <span className={s.neonLine} aria-hidden="true" />
        </Link>
      </main>
      <footer className={s.footer}><div className={s.container}><div className={s.footerTop} data-reveal><div className={s.footerIntro}><Brand /><p>Turn your spare time into rewards with BlueberryCash. Discover offers, collect coins and choose your next payout.</p><div className={s.footerPayments}>{['robux2.svg','paypal2.svg','eth.png','solana.png','usdc.png'].map(file => <img src={asset(file)} alt="" key={file} loading="lazy" />)}<span>+ More</span></div></div><div className={s.footerLinks}><div><h3>Quick Links</h3><Link href="/earn">Earn</Link><Link href="/cashout">Cashout</Link><Link href="/referrals">Affiliates</Link></div><div><h3>About</h3><a href="#how-it-works">How it works</a><a href="#faq">FAQ</a><button onClick={() => setSupport(true)}>Support</button><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/rules">Rules</Link></div><div><h3>Community</h3><Link href="/leaderboard">Leaderboard</Link><Link href="/spin">Daily Wheel</Link></div></div></div><div className={s.footerBottom}>© {new Date().getFullYear()} BlueberryCash. All rights reserved.<span>BlueberryCash is not affiliated with the brands shown.</span></div></div></footer>
      <button className={s.supportButton} aria-label="Contact support" onClick={() => setSupport(true)}><ThemeIcon name="Support" fallback={MessageCircle} /></button>
      {/* Phone navigation, the same five shortcuts as inside the app (shown to visitors before they sign in too) */}
      <nav aria-label="Main" className={s.bottomNav}>
        {[['Earn', '/earn'], ['Cashout', '/cashout'], ['Leaderboard', '/leaderboard'], ['Referrals', '/referrals']].map(([name, href]) => (
          <Link key={name} href={href}><ThemeIcon name={name} fallback={MessageSquare} /><span>{name}</span></Link>
        ))}
        <button type="button" onClick={() => setSupport(true)}><ThemeIcon name="Support" fallback={MessageSquare} /><span>Support</span></button>
      </nav>
      <AuthModal isOpen={Boolean(auth)} defaultTab={auth || 'login'} onClose={() => setAuth(null)} />
      <SupportModal isOpen={support} onClose={() => setSupport(false)} />
    </div>
  );
}
