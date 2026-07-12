'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Gem, Zap, Trophy, Gift, ArrowRight, ChevronRight, Gamepad2, Smartphone, FileText, Search, Users, CheckCircle, Sparkles, Flame, BarChart3, Crown, Award, Medal, Play, Coins, Landmark, Clock, Filter } from 'lucide-react';

const LIVE_FEED = [
  { user: 'Alex_G', action: 'earned', amount: '$4.50', task: 'Coin Master', avatar: '🎮' },
  { user: 'Sarah99', action: 'cashed out', amount: '$25.00', task: 'PayPal', avatar: '💸' },
  { user: 'Mounir_L', action: 'earned', amount: '$1.80', task: 'Survey', avatar: '📋' },
  { user: 'Zack_C', action: 'earned', amount: '$8.20', task: 'RAID Legends', avatar: '⚔️' },
  { user: 'YassineG', action: 'earned', amount: '$2.40', task: 'TikTok Install', avatar: '📱' },
  { user: 'Reda_X', action: 'earned', amount: '$12.00', task: 'Lords Mobile', avatar: '🏰' },
  { user: 'CoinSlayer', action: 'cashed out', amount: '$50.00', task: 'Gift Card', avatar: '🎁' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Tasks', icon: Sparkles },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'apps', label: 'Apps', icon: Smartphone },
  { id: 'surveys', label: 'Surveys', icon: FileText },
  { id: 'videos', label: 'Videos', icon: Zap },
];

const OFFERS = [
  { id: 1, title: 'Coin Master', desc: 'Reach Village 12', payout: 4.50, gems: 4500, category: 'games', difficulty: 'Easy', time: '~2 days', hot: true, icon: '🎰', color: '#f59e0b' },
  { id: 2, title: 'RAID Shadow Legends', desc: 'Complete Chapter 5', payout: 8.20, gems: 8200, category: 'games', difficulty: 'Medium', time: '~4 days', hot: true, icon: '⚔️', color: '#a855f7' },
  { id: 3, title: 'Lords Mobile', desc: 'Reach Might 600K', payout: 12.00, gems: 12000, category: 'games', difficulty: 'Hard', time: '~7 days', hot: false, icon: '🏰', color: '#3b82f6' },
  { id: 4, title: 'Opinion Survey', desc: '10-min profile survey', payout: 1.80, gems: 1800, category: 'surveys', difficulty: 'Easy', time: '~10 min', hot: false, icon: '📋', color: '#10b981' },
  { id: 5, title: 'TikTok Install', desc: 'Install and open app', payout: 0.50, gems: 500, category: 'apps', difficulty: 'Easy', time: '~2 min', hot: false, icon: '📱', color: '#ec4899' },
  { id: 6, title: 'Monopoly GO', desc: 'Reach 1000 dice rolls', payout: 6.80, gems: 6800, category: 'games', difficulty: 'Medium', time: '~3 days', hot: true, icon: '🎲', color: '#ef4444' },
  { id: 7, title: 'Roblox Survey', desc: 'Gaming preference quiz', payout: 2.20, gems: 2200, category: 'surveys', difficulty: 'Easy', time: '~15 min', hot: false, icon: '📝', color: '#06b6d4' },
  { id: 8, title: 'Brawl Stars', desc: 'Reach Trophy 2000', payout: 5.00, gems: 5000, category: 'games', difficulty: 'Medium', time: '~5 days', hot: true, icon: '🥊', color: '#f59e0b' },
  { id: 9, title: 'Watch Ad Series', desc: 'Watch 5 short ads', payout: 0.80, gems: 800, category: 'videos', difficulty: 'Easy', time: '~5 min', hot: false, icon: '🎬', color: '#8b5cf6' },
  { id: 10, title: 'Gardenscapes', desc: 'Complete 50 levels', payout: 3.50, gems: 3500, category: 'games', difficulty: 'Medium', time: '~2 days', hot: false, icon: '🌻', color: '#84cc16' },
  { id: 11, title: 'App Download', desc: 'Download 3 featured apps', payout: 1.50, gems: 1500, category: 'apps', difficulty: 'Easy', time: '~10 min', hot: false, icon: '📲', color: '#0ea5e9' },
  { id: 12, title: 'Market Survey', desc: '3-part market research', payout: 4.00, gems: 4000, category: 'surveys', difficulty: 'Medium', time: '~30 min', hot: false, icon: '📊', color: '#d946ef' },
];

const REWARDS = [
  { id: 1, name: 'PayPal Cash', min: '$1.00', icon: '💳', gems: 1000, popular: true },
  { id: 2, name: 'Bitcoin', min: '$5.00', icon: '₿', gems: 5000, popular: false },
  { id: 3, name: 'Amazon Gift', min: '$5.00', icon: '📦', gems: 5000, popular: true },
  { id: 4, name: 'Steam Wallet', min: '$5.00', icon: '🎮', gems: 5000, popular: false },
  { id: 5, name: 'Robux', min: '800 R$', icon: '🟢', gems: 3000, popular: true },
  { id: 6, name: 'Ethereum', min: '$10.00', icon: '⟠', gems: 10000, popular: false },
];

const LEADERBOARD = [
  { rank: 1, user: 'GemMaster_Pro', gems: 284500, avatar: '👑', badge: 'Diamond' },
  { rank: 2, user: 'CryptoKing99', gems: 221000, avatar: '🔥', badge: 'Platinum' },
  { rank: 3, user: 'EarnGuru_X', gems: 198750, avatar: '⚡', badge: 'Gold' },
  { rank: 4, user: 'SurveySlayer', gems: 156200, avatar: '🎯', badge: 'Gold' },
  { rank: 5, user: 'TaskRunner_Z', gems: 134800, avatar: '🚀', badge: 'Silver' },
];

const STATS = [
  { label: 'Active Users', value: '127,492', color: '#bf5aff' },
  { label: 'Total Paid Out', value: '$2.4M+', color: '#f7c948' },
  { label: 'Tasks Available', value: '8,500+', color: '#48f78a' },
  { label: 'Avg Payout Time', value: '< 24h', color: '#f748b8' },
];

const RANDOM_TITLES = [
  { title: 'Coin Master', category: 'Game', icon: '🎰', basePayout: 4.5 },
  { title: 'Monopoly GO', category: 'Game', icon: '🎲', basePayout: 6.8 },
  { title: 'TikTok Install', category: 'App', icon: '📱', basePayout: 0.5 },
  { title: 'RAID Shadow Legends', category: 'Game', icon: '⚔️', basePayout: 8.2 },
  { title: 'Lords Mobile', category: 'Game', icon: '🏰', basePayout: 12.0 },
  { title: 'Opinion Survey', category: 'Survey', icon: '📋', basePayout: 1.8 },
  { title: 'Roblox Survey', category: 'Survey', icon: '📝', basePayout: 2.2 },
  { title: 'Brawl Stars', category: 'Game', icon: '🥊', basePayout: 5.0 },
  { title: 'Gardenscapes', category: 'Game', icon: '🌻', basePayout: 3.5 },
  { title: 'Family Island', category: 'Game', icon: '🏝️', basePayout: 4.0 },
  { title: 'Match Masters', category: 'Game', icon: '🏆', basePayout: 7.2 },
  { title: 'Brain Test', category: 'Game', icon: '🧠', basePayout: 0.8 },
  { title: 'Duolingo', category: 'App', icon: '🦉', basePayout: 1.5 },
  { title: 'Alibaba App', category: 'App', icon: '🛍️', basePayout: 0.6 },
  { title: 'Crypto Quiz', category: 'Survey', icon: '🪙', basePayout: 1.2 },
];

function getRandomFallbackOffers(categoryFilter, limit = 4) {
  let pool = RANDOM_TITLES;
  if (categoryFilter === 'Fast') {
    pool = RANDOM_TITLES.filter(t => t.basePayout < 5.0);
  } else if (categoryFilter === 'Finance') {
    pool = RANDOM_TITLES.filter(t => t.basePayout >= 3.0 || t.category === 'Survey');
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, limit).map((item, idx) => {
    const randomMultiplier = 0.8 + Math.random() * 0.4;
    const payout = item.basePayout * randomMultiplier;
    const coins = Math.round(payout * 150 * 3);
    
    const devicesPool = ['android', 'ios', 'desktop'];
    const deviceCount = Math.floor(Math.random() * 2) + 1;
    const devices = [];
    for (let i = 0; i < deviceCount; i++) {
      const dev = devicesPool[Math.floor(Math.random() * devicesPool.length)];
      if (!devices.includes(dev)) devices.push(dev);
    }

    return {
      id: `fallback_${categoryFilter.toLowerCase()}_${idx}_${Math.random()}`,
      title: item.title,
      category: item.category,
      coins,
      payout,
      icon: item.icon,
      provider: 'OGAds',
      url: '/earn',
      devices
    };
  });
}

const renderDeviceIcons = (devices = []) => {
  return (
    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-[#0a0b10]/80 px-1.5 py-0.5 rounded border border-white/10">
      {devices.includes('android') && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400">
          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM19 5.5l-1.34-2.31c-.13-.24-.44-.32-.68-.19-.24.13-.32.44-.19.68L18.13 6H5.87l1.34-2.31c.13-.24.05-.55-.19-.68-.24-.13-.55-.05-.68.19L5 5.5C2.69 6.84 1.14 9.21 1 12h22c-.14-2.79-1.69-5.16-4-6.5zM9 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      )}
      {devices.includes('ios') && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-300">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.61.7-1.15 1.84-1.01 2.96 1.12.09 2.27-.58 2.96-1.4z"/>
        </svg>
      )}
      {devices.includes('desktop') && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400">
          <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
        </svg>
      )}
    </div>
  );
};

export default function OfferwallPage() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [particles, setParticles] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [realOffers, setRealOffers] = useState([]);
  const [clickedOffers, setClickedOffers] = useState([]);
  const [fallbackFastOffers, setFallbackFastOffers] = useState([]);
  const [fallbackFinanceOffers, setFallbackFinanceOffers] = useState([]);

  useEffect(() => {
    setFallbackFastOffers(getRandomFallbackOffers('Fast', 4));
    setFallbackFinanceOffers(getRandomFallbackOffers('Finance', 4));
  }, []);

  useEffect(() => {
    if (user) {
      db.adminGetOfferClicks(user.id).then(clicks => {
        setClickedOffers(clicks || []);
      }).catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    const fetchAllOffers = async () => {
      try {
        const s1 = user ? user.id : 'guest';
        
        let abmList = [];
        let ogList = [];
        

        // 2. Fetch OGAds
        try {
          const res = await fetch(`/api/offers/ogads?s1=${s1}`);
          if (res.ok) {
            const data = await res.json();
            const rawOffers = Array.isArray(data) ? data : (data.offers || []);
            ogList = rawOffers.map(offer => {
              const rawPayout = parseFloat(offer.payout || offer.user_payout || '0.20');
              const coins = Math.round(rawPayout * 150 * 3);
              const text = `${offer.name} ${offer.description || ''} ${offer.adcopy || ''}`.toLowerCase();
              let category = 'App';
              if (text.includes('game') || text.includes('play') || text.includes('level') || text.includes('slot') || text.includes('casino')) {
                category = 'Game';
              } else if (text.includes('survey') || text.includes('quiz') || text.includes('opinion')) {
                category = 'Survey';
              }
              return {
                id: offer.offerid || offer.id || `og_${Math.random()}`,
                title: offer.name_short || offer.name || 'OGAds Task',
                coins,
                payout: rawPayout,
                provider: 'OGAds',
                icon: offer.picture || null,
                category,
                url: offer.link || offer.url,
                devices: text.includes('android') ? ['android'] : text.includes('ios') || text.includes('iphone') || text.includes('ipad') ? ['ios'] : ['desktop']
              };
            });
          }
        } catch (e) {
          console.error(e);
        }

        const merged = [...abmList, ...ogList];
        if (merged.length > 0) {
          setRealOffers(merged);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllOffers();
  }, [user]);

  const handleOfferClick = async (offer) => {
    if (!user) {
      openAuth('login');
      return;
    }
    try {
      await db.logOfferClick(user.id, user.username, offer);
      const clicks = await db.adminGetOfferClicks(user.id);
      setClickedOffers(clicks || []);
    } catch (e) {
      console.error(e);
    }
    window.open(offer.url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const fetchLB = async () => {
      try {
        const data = await db.getLeaderboard(user);
        setLeaderboard(data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchLB();
  }, [user]);

  const getBadgeName = (rank) => {
    if (rank === 1) return 'Diamond';
    if (rank === 2) return 'Platinum';
    if (rank === 3) return 'Gold';
    if (rank === 4) return 'Gold';
    return 'Silver';
  };

  useEffect(() => {
    const pts = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, size: Math.random() * 3 + 1,
      speed: Math.random() * 18 + 10, delay: Math.random() * 8, opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(pts);
  }, []);

  const filteredOffers = OFFERS.filter(o => {
    return (activeCategory === 'all' || o.category === activeCategory) &&
           o.title.toLowerCase().includes(search.toLowerCase());
  });

  const openAuth = (tab) => { setAuthTab(tab || 'register'); setIsAuthOpen(true); };
  const diffColor = (d) => d === 'Easy' ? '#48f78a' : d === 'Medium' ? '#f7c948' : '#f74848';
  const badgeStyle = (b) => {
    if (b === 'Diamond') return { bg: 'rgba(191,90,255,0.15)', color: '#bf5aff' };
    if (b === 'Platinum') return { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' };
    if (b === 'Gold') return { bg: 'rgba(247,201,72,0.15)', color: '#f7c948' };
    return { bg: 'rgba(255,255,255,0.08)', color: '#c0c0c0' };
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap');
    .ow{font-family:Rubik,sans-serif;background:#0a0a12;min-height:100vh;color:#fff;overflow-x:hidden;}
    .owc{max-width:1200px;margin:0 auto;padding:0 24px;}
    @keyframes floatUp{0%{transform:translateY(100vh);opacity:0;}10%{opacity:.4;}90%{opacity:.4;}100%{transform:translateY(-120px);opacity:0;}}
    @keyframes gemFloat{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-20px) rotate(3deg);}}
    @keyframes breathe{0%,100%{transform:translateY(-50%) scale(1);opacity:.6;}50%{transform:translateY(-50%) scale(1.12);opacity:1;}}
    @keyframes scrollFeed{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
    @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(72,247,138,.7);}50%{box-shadow:0 0 0 6px rgba(72,247,138,0);}}
    .particle{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.6) 0%,transparent 70%);pointer-events:none;}
    .btnp{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));color:#fff;font-weight:800;font-size:15px;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 30px rgba(59,130,246,.4);text-decoration:none;font-family:Rubik,sans-serif;}
    .btnp:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(59,130,246,.6);}
    .btns{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8);font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;cursor:pointer;transition:all .2s;text-decoration:none;backdrop-filter:blur(10px);font-family:Rubik,sans-serif;}
    .btns:hover{background:rgba(255,255,255,.1);transform:translateY(-2px);}
    .stag{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);color:var(--color-primary);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:5px 12px;border-radius:100px;margin-bottom:14px;}
    .stitle{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-.5px;line-height:1.1;margin-bottom:10px;}
    .stitle span{color:var(--color-primary);}
    .ssub{font-size:15px;color:rgba(255,255,255,.45);}
    .catbtn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);font-weight:700;font-size:13px;padding:8px 16px;border-radius:10px;cursor:pointer;transition:all .2s;font-family:Rubik,sans-serif;}
    .catbtn:hover,.catbtn.active{background:rgba(59,130,246,.15);border-color:rgba(59,130,246,.5);color:var(--color-primary);}
    .ocard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;cursor:pointer;transition:all .3s;position:relative;}
    .ocard:hover{border-color:rgba(59,130,246,.4);transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.4),0 0 40px rgba(59,130,246,.15);}
    .rcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden;}
    .rcard:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.4);box-shadow:0 16px 40px rgba(0,0,0,.3);}
    .rcard.pop::before{content:'Popular';position:absolute;top:8px;right:-20px;background:linear-gradient(135deg,#f7c948,#f7a248);color:#000;font-size:9px;font-weight:900;padding:3px 30px;transform:rotate(30deg);text-transform:uppercase;}
    .lbcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;}
    .lbrow{display:flex;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s;gap:14px;}
    .lbrow:hover{background:rgba(255,255,255,.03);}
    .ctawrap{background:linear-gradient(135deg,rgba(59,130,246,.12),rgba(93,95,239,.12));border:1px solid rgba(59,130,246,.2);border-radius:24px;padding:60px 48px;text-align:center;position:relative;overflow:hidden;}
    .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);}
    .sitem{background:rgba(255,255,255,.03);padding:22px;display:flex;align-items:center;gap:14px;transition:background .2s;}
    .sitem:hover{background:rgba(255,255,255,.055);}
    .feedwrap{background:rgba(255,255,255,.025);border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:11px 0;overflow:hidden;}
    .feedinner{display:flex;width:max-content;animation:scrollFeed 45s linear infinite;}
    .feeditem{display:inline-flex;align-items:center;gap:8px;padding:0 28px;white-space:nowrap;font-size:13px;color:rgba(255,255,255,.55);border-right:1px solid rgba(255,255,255,.07);}
    .owfoot{background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);padding:48px 0 24px;}
    .fgrid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;}
    .flink{display:block;font-size:13px;color:rgba(255,255,255,.5);font-weight:500;margin-bottom:10px;text-decoration:none;transition:color .2s;}
    .flink:hover{color:var(--color-primary);}
        .ow-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
    .owc {
      padding-top: 120px;
      padding-bottom: 80px;
    }
    @media(max-width:900px){
      .sgrid{grid-template-columns:repeat(2,1fr);}
      .fgrid{grid-template-columns:1fr 1fr;}
      .hero-r{display:none!important;}
      .lbhow{grid-template-columns:1fr!important;}
      .ow-hero {
        min-height: auto !important;
        padding-top: 80px !important;
        padding-bottom: 40px !important;
      }
      .owc {
        padding-top: 30px !important;
        padding-bottom: 30px !important;
      }
    }
    @media(max-width:600px){.ogrid{grid-template-columns:repeat(2,1fr)!important;}.rgrid{grid-template-columns:repeat(2,1fr)!important;}}
  `;

  const hgrid = {position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(191,90,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(191,90,255,.05) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'};
  const hglow = {position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(191,90,255,.18) 0%,transparent 70%)',top:'50%',right:'8%',animation:'breathe 4s ease-in-out infinite',pointerEvents:'none'};

  return (
    <>
      <style>{css}</style>
      <div className="ow">

        {/* HERO */}
        <section className="ow-hero" style={{position:'relative',overflow:'hidden',background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(191,90,255,.15) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 50%,rgba(147,51,234,.1) 0%,transparent 60%),#0a0a12'}}>
          <div style={hgrid}/>
          <div style={hglow}/>
          {particles.map(p => (
            <div key={p.id} className="particle" style={{left:`${p.x}%`,bottom:0,width:p.size,height:p.size,animation:`floatUp ${p.speed}s ${p.delay}s infinite linear`,opacity:p.opacity}}/>
          ))}
          <div className="owc" style={{position:'relative',zIndex:2,width:'100%'}}>
            <div style={{display:'flex',alignItems:'center',gap:60,justifyContent:'space-between'}}>
              <div style={{flex:1,minWidth:0}}>

                <h1 style={{fontSize:'clamp(40px,6vw,76px)',fontWeight:900,lineHeight:1.05,letterSpacing:-1,marginBottom:20}}>
                  Earn Gems.<br/>Cash Out{' '}
                  <span style={{background:'linear-gradient(135deg,#bf5aff,#a855f7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Instantly.</span>
                </h1>
                <p style={{fontSize:18,color:'rgba(255,255,255,.5)',lineHeight:1.6,maxWidth:480,marginBottom:36}}>
                  Complete tasks, play games and surveys. Redeem for PayPal, Bitcoin, Gift Cards and Robux instantly.
                </p>
                <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                  {user ? (
                    <Link href="/earn" className="btnp"><Zap size={18}/> Start Earning</Link>
                  ) : (
                    <button className="btnp" onClick={() => openAuth('register')}><Gem size={18}/> Join Free Now</button>
                  )}
                  <Link href="#offers" className="btns"><ArrowRight size={16}/> Browse Offers</Link>
                </div>
                <div style={{display:'flex',gap:20,marginTop:28,flexWrap:'wrap'}}>
                  {[['SSL Secured','#48f78a'],['Instant Payouts','#bf5aff'],['Free to Join','#f7c948']].map(([t,c]) => (
                    <div key={t} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,.4)',fontWeight:600}}>
                      <CheckCircle size={13} style={{color:c}}/> {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-r" style={{flexShrink:0}}>
                <img src="/offerwall/blueberry_icon.png" alt="Gem" style={{width:300,height:300,objectFit:'contain',filter:'drop-shadow(0 0 60px rgba(191,90,255,.5))',animation:'gemFloat 6s ease-in-out infinite'}}/>
              </div>
            </div>
          </div>
        </section>

        {/* OFFERS DASHBOARD SECTION */}
        <section id="offers-dashboard" className="py-12 bg-[#0a0a12]/80 border-y border-dark-border/40 select-none">
          <div className="owc flex flex-col gap-10">

            {/* 1. MY OFFERS ROW */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-dark-border/40">
                <div className="flex items-center gap-3">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-primary" /> My Offers
                  </h3>
                  <button className="flex items-center gap-1.5 bg-dark-card border border-dark-border px-2.5 py-1 rounded-lg text-[10px] font-black text-zinc-400 hover:text-white transition-colors">
                    Filter <span className="bg-primary/20 text-primary px-1.5 py-0.2 rounded">3</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Row */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {clickedOffers.length === 0 ? (
                  /* Default Mock Clicked Card */
                  <div className="flex flex-col select-none shrink-0">
                    <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-[#f59e0b]/30 shadow-lg flex flex-col justify-end group">
                      <img 
                        src="/banners/ogads.png" 
                        alt="Bus Puzzle" 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 z-0" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-black/40 to-transparent z-10" />
                      
                      {/* Clicked Badge */}
                      <div className="absolute top-2.5 left-2.5 z-20 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                        Clicked
                      </div>

                      {/* OS Badges */}
                      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-[#0a0b10]/80 px-1.5 py-0.5 rounded border border-white/10 text-zinc-300">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.61.7-1.15 1.84-1.01 2.96 1.12.09 2.27-.58 2.96-1.4z"/>
                        </svg>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col justify-end text-left">
                        <h4 className="text-[10px] sm:text-xs font-black text-white line-clamp-1 mb-0.5">
                          Bus Puzzle - Multiplayer
                        </h4>
                        <div className="text-xs sm:text-sm font-black text-primary flex items-center gap-1">
                          <Coins className="h-3 w-3 shrink-0" />
                          <span>126</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  clickedOffers.map(click => {
                    const activeOffer = realOffers.find(o => String(o.id) === String(click.offer_id));
                    const title = click.offer_title || 'Offer';
                    const coins = activeOffer ? activeOffer.coins : 300;
                    const icon = activeOffer?.icon;
                    return (
                      <div key={click.id} className="flex flex-col select-none shrink-0" onClick={() => activeOffer && handleOfferClick(activeOffer)}>
                        <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-[#f59e0b]/30 shadow-lg flex flex-col justify-end group">
                          {icon ? (
                            <img src={icon} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 z-0" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0a0a0f] z-0 flex items-center justify-center">
                              <span className="text-4xl">🎰</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-black/40 to-transparent z-10" />
                          <div className="absolute top-2.5 left-2.5 z-20 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                            Clicked
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col justify-end text-left">
                            <h4 className="text-[10px] sm:text-xs font-black text-white line-clamp-1 mb-0.5">{title}</h4>
                            <div className="text-xs sm:text-sm font-black text-primary flex items-center gap-1">
                              <Coins className="h-3 w-3 shrink-0" />
                              <span>{coins}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            {/* 2. FAST OFFERS ROW */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-dark-border/40 pb-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="h-4.5 w-4.5 text-primary" /> Fast Offers
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <Link href="/earn" className="bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Horizontal Scroll Row */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {(realOffers.length > 0 
                  ? realOffers.filter(o => o.category === 'Game' || o.payout < 2.0).slice(0, 4)
                  : fallbackFastOffers
                ).map(offer => {
                  return (
                    <div key={offer.id} className="flex flex-col select-none shrink-0" onClick={() => handleOfferClick(offer)}>
                      <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-dark-border hover:border-primary/50 shadow-lg flex flex-col justify-end group transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0a0a0f] z-0 flex items-center justify-center">
                          {offer.icon && String(offer.icon).startsWith('http') ? (
                            <img src={offer.icon} alt={offer.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                          ) : (
                            <span className="text-4xl">{offer.icon || '🎮'}</span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-black/40 to-transparent z-10" />

                        {renderDeviceIcons(offer.devices || ['android', 'ios'])}

                        <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col justify-end text-left">
                          <h4 className="text-[10px] sm:text-xs font-black text-white line-clamp-1 mb-0.5">
                            {offer.title}
                          </h4>
                          <div className="text-xs sm:text-sm font-black text-primary flex items-center gap-1">
                            <Coins className="h-3 w-3 shrink-0" />
                            <span>{offer.coins.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View More Card */}
                <Link href="/earn" className="flex flex-col select-none shrink-0">
                  <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-primary/30 bg-gradient-to-br from-primary to-secondary hover:opacity-95 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center p-4 text-center gap-2.5 shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-white tracking-wide uppercase leading-none">View More</span>
                    <Play className="h-4 w-4 fill-white text-white mt-1" />
                  </div>
                </Link>
              </div>
            </div>


            {/* 3. FINANCE OFFERS ROW */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-dark-border/40 pb-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="h-4.5 w-4.5 text-primary" /> Finance
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-dark-card border border-dark-border/60 text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <Link href="/earn" className="bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Horizontal Scroll Row */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {(realOffers.length > 0 
                  ? realOffers.filter(o => o.category === 'Survey' || o.payout >= 2.0).slice(0, 4)
                  : fallbackFinanceOffers
                ).map(offer => {
                  return (
                    <div key={offer.id} className="flex flex-col select-none shrink-0" onClick={() => handleOfferClick(offer)}>
                      <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-dark-border hover:border-primary/50 shadow-lg flex flex-col justify-end group transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0a0a0f] z-0 flex items-center justify-center">
                          {offer.icon && String(offer.icon).startsWith('http') ? (
                            <img src={offer.icon} alt={offer.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                          ) : (
                            <span className="text-4xl">{offer.icon || '💰'}</span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-black/40 to-transparent z-10" />

                        {renderDeviceIcons(offer.devices || ['desktop'])}

                        <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col justify-end text-left">
                          <h4 className="text-[10px] sm:text-xs font-black text-white line-clamp-1 mb-0.5">
                            {offer.title}
                          </h4>
                          <div className="text-xs sm:text-sm font-black text-primary flex items-center gap-1">
                            <Coins className="h-3 w-3 shrink-0" />
                            <span>{offer.coins.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View More Card */}
                <Link href="/earn" className="flex flex-col select-none shrink-0">
                  <div className="relative w-[130px] sm:w-[155px] h-[170px] sm:h-[195px] rounded-2xl overflow-hidden cursor-pointer border border-primary/30 bg-gradient-to-br from-primary to-secondary hover:opacity-95 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center p-4 text-center gap-2.5 shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-white tracking-wide uppercase leading-none">View More</span>
                    <Play className="h-4 w-4 fill-white text-white mt-1" />
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* LB + HOW */}
        <section style={{padding:'0 0 80px'}}>
          <div className="owc">
            <div className="lbhow" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'start'}}>
              <div>
                <div className="stag" style={{marginBottom:14}}><Trophy size={11}/> Top Earners</div>
                <h2 className="stitle" style={{marginBottom:6}}>Weekly <span>Leaderboard</span></h2>
                <p className="ssub" style={{marginBottom:24}}>Top earners win exclusive bonuses</p>
                <div className="lbcard">
                  <div style={{background:'linear-gradient(135deg,rgba(191,90,255,.12),rgba(147,51,234,.12))',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'18px 20px',display:'flex',alignItems:'center',gap:12}}>
                    <img src="/offerwall/trophy.jpg" alt="Trophy" style={{width:44,height:44,objectFit:'cover',borderRadius:10}}/>
                    <div>
                      <div style={{fontWeight:800,fontSize:15}}>Weekly Challenge</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>Resets every Monday UTC</div>
                    </div>
                  </div>
                  {leaderboard.map((p, idx) => {
                    const rank = idx + 1;
                    const badgeName = getBadgeName(rank);
                    const bs = badgeStyle(badgeName);
                    
                    let rankIcon;
                    if (rank === 1) {
                      rankIcon = <Trophy size={18} style={{ color: '#f7c948' }} />;
                    } else if (rank === 2) {
                      rankIcon = <Medal size={18} style={{ color: '#cbd5e1' }} />;
                    } else if (rank === 3) {
                      rankIcon = <Award size={18} style={{ color: '#cd7f32' }} />;
                    } else {
                      rankIcon = `#${rank}`;
                    }

                    return (
                      <div key={p.username} className="lbrow">
                        <div style={{fontSize:rank<=3?18:14,fontWeight:900,width:30,textAlign:'center',flexShrink:0,color:'rgba(255,255,255,.4)',display:'flex',justifyContent:'center',alignItems:'center'}}>
                          {rankIcon}
                        </div>
                        <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.username} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          ) : (
                            <span style={{fontSize:20}}>👤</span>
                          )}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:800}}>{p.username}</div>
                          <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:100,background:bs.bg,color:bs.color,textTransform:'uppercase'}}>{badgeName}</span>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:15,fontWeight:900,color:'#bf5aff'}}>{(p.total_earned_coins || 0).toLocaleString()}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>coins</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{padding:'14px 20px'}}>
                    <Link href="/leaderboard" className="btns" style={{display:'flex',justifyContent:'center',width:'100%',borderRadius:10}}>Full Leaderboard <ChevronRight size={14}/></Link>
                  </div>
                </div>
              </div>
              <div>
                <div className="stag" style={{marginBottom:14}}><BarChart3 size={11}/> How It Works</div>
                <h2 className="stitle" style={{marginBottom:6}}>3 Steps to <span>Cash Out</span></h2>
                <p className="ssub" style={{marginBottom:24}}>Simple, fast, completely free</p>
                {[
                  {step:'01',title:'Create Free Account',desc:'Sign up in seconds. No credit card required.',icon:Users,color:'#bf5aff'},
                  {step:'02',title:'Complete Tasks & Earn',desc:'Play games, surveys, install apps. Earn gems.',icon:Gem,color:'#a855f7'},
                  {step:'03',title:'Cash Out Instantly',desc:'Redeem for PayPal, Bitcoin, gift cards and more.',icon:Zap,color:'#48f78a'},
                ].map(({step,title,desc,icon:Icon,color}) => (
                  <div key={step} style={{display:'flex',gap:16,marginBottom:16,padding:18,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16}}>
                    <div style={{width:48,height:48,borderRadius:12,background:`${color}18`,border:`1px solid ${color}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon size={20} style={{color}}/>
                    </div>
                    <div>
                      <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>Step {step}</div>
                      <div style={{fontSize:14,fontWeight:800,marginBottom:5}}>{title}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.5}}>{desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{padding:18,background:'rgba(191,90,255,.05)',border:'1px solid rgba(191,90,255,.15)',borderRadius:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                    <img src="/offerwall/gift.jpg" alt="Gift" style={{width:40,height:40,objectFit:'cover',borderRadius:10}}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:800}}>Daily Bonus</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>Login every day for free gems</div>
                    </div>
                  </div>
                  <div style={{height:1,background:'rgba(255,255,255,.07)',margin:'10px 0'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:13,color:'rgba(255,255,255,.45)',fontWeight:600}}>Today bonus</span>
                    <span style={{fontSize:16,fontWeight:900,color:'#f7c948',display:'flex',alignItems:'center',gap:4}}><Gem size={13} style={{color:'#bf5aff'}}/> 500 Gems</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="owc" style={{paddingBottom:80}}>
          <div className="ctawrap">
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:48,marginBottom:14}}>💎</div>
              <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:900,marginBottom:14}}>Start Earning Gems Today</h2>
              <p style={{fontSize:16,color:'rgba(255,255,255,.45)',maxWidth:460,margin:'0 auto 32px',lineHeight:1.6}}>
                Join 38,000+ users already earning. Free to join. No hidden fees.
              </p>
              <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
                {user ? (
                  <Link href="/earn" className="btnp" style={{fontSize:16,padding:'16px 36px'}}><Zap size={20}/> Go to Earn Center</Link>
                ) : (
                  <button className="btnp" style={{fontSize:16,padding:'16px 36px'}} onClick={()=>openAuth('register')}><Gem size={20}/> Create Free Account</button>
                )}
                <Link href="/cashout" className="btns" style={{fontSize:16,padding:'16px 36px'}}><Gift size={17}/> View Rewards</Link>
              </div>
              <div style={{marginTop:24,display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
                {['No Credit Card','Instant Withdrawal','24/7 Support','100% Free'].map(t=>(
                  <div key={t} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'rgba(255,255,255,.4)',fontWeight:600}}>
                    <CheckCircle size={12} style={{color:'#48f78a'}}/> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="owfoot">
          <div className="owc">
            <div className="fgrid">
              <div>
                <Link href="/offerwall" style={{display:'flex',alignItems:'center',gap:12,fontSize:20,fontWeight:900,textDecoration:'none',color:'#fff',marginBottom:12}}>
                  <img src="/offerwall/blueberry_icon.png" alt="" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/> RewardCash
                </Link>
                <p style={{fontSize:13,color:'rgba(255,255,255,.35)',lineHeight:1.6,maxWidth:260}}>The number 1 reward platform for earning free cash, crypto, and gift cards.</p>
              </div>
              {[
                {title:'Earn',links:[['Browse Offers','/earn'],['Offerwall','/offerwall'],['Daily Bonus','/dashboard'],['Refer Friends','/referrals']]},
                {title:'Rewards',links:[['PayPal','/cashout'],['Bitcoin','/cashout'],['Gift Cards','/cashout'],['Robux','/cashout']]},
                {title:'Company',links:[['Leaderboard','/leaderboard'],['Terms','#'],['Privacy','#'],['Support','#']]},
              ].map(({title,links})=>(
                <div key={title}>
                  <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:1.5,color:'rgba(255,255,255,.35)',marginBottom:14}}>{title}</div>
                  {links.map(([label,href])=>(<Link key={label} href={href} className="flink">{label}</Link>))}
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:20,borderTop:'1px solid rgba(255,255,255,.06)',fontSize:12,color:'rgba(255,255,255,.25)',flexWrap:'wrap',gap:8}}>
              <span>2025 RewardCash. All rights reserved.</span>
              <span>Made with love for our community</span>
            </div>
          </div>
        </footer>

      </div>
      <AuthModal isOpen={isAuthOpen} onClose={()=>setIsAuthOpen(false)} defaultTab={authTab}/>
    </>
  );
}
