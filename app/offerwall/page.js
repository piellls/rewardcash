'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Gem, Zap, Trophy, Gift, ArrowRight, ChevronRight, Gamepad2, Smartphone, FileText, Search, Users, CheckCircle, Sparkles, Flame, BarChart3 } from 'lucide-react';

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
export default function OfferwallPage() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [particles, setParticles] = useState([]);

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
    .particle{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(191,90,255,.6) 0%,transparent 70%);pointer-events:none;}
    .btnp{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#bf5aff,#7c3aed);color:#fff;font-weight:800;font-size:15px;padding:14px 28px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 30px rgba(191,90,255,.4);text-decoration:none;font-family:Rubik,sans-serif;}
    .btnp:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(191,90,255,.6);}
    .btns{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8);font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;cursor:pointer;transition:all .2s;text-decoration:none;backdrop-filter:blur(10px);font-family:Rubik,sans-serif;}
    .btns:hover{background:rgba(255,255,255,.1);transform:translateY(-2px);}
    .stag{display:inline-flex;align-items:center;gap:6px;background:rgba(191,90,255,.1);border:1px solid rgba(191,90,255,.25);color:#bf5aff;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:5px 12px;border-radius:100px;margin-bottom:14px;}
    .stitle{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-.5px;line-height:1.1;margin-bottom:10px;}
    .stitle span{color:#bf5aff;}
    .ssub{font-size:15px;color:rgba(255,255,255,.45);}
    .catbtn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);font-weight:700;font-size:13px;padding:8px 16px;border-radius:10px;cursor:pointer;transition:all .2s;font-family:Rubik,sans-serif;}
    .catbtn:hover,.catbtn.active{background:rgba(191,90,255,.15);border-color:rgba(191,90,255,.5);color:#bf5aff;}
    .ocard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;cursor:pointer;transition:all .3s;position:relative;}
    .ocard:hover{border-color:rgba(191,90,255,.4);transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.4),0 0 40px rgba(191,90,255,.15);}
    .rcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden;}
    .rcard:hover{transform:translateY(-4px);border-color:rgba(191,90,255,.4);box-shadow:0 16px 40px rgba(0,0,0,.3);}
    .rcard.pop::before{content:'Popular';position:absolute;top:8px;right:-20px;background:linear-gradient(135deg,#f7c948,#f7a248);color:#000;font-size:9px;font-weight:900;padding:3px 30px;transform:rotate(30deg);text-transform:uppercase;}
    .lbcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;}
    .lbrow{display:flex;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s;gap:14px;}
    .lbrow:hover{background:rgba(255,255,255,.03);}
    .ctawrap{background:linear-gradient(135deg,rgba(191,90,255,.12),rgba(147,51,234,.12));border:1px solid rgba(191,90,255,.2);border-radius:24px;padding:60px 48px;text-align:center;position:relative;overflow:hidden;}
    .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);}
    .sitem{background:rgba(255,255,255,.03);padding:22px;display:flex;align-items:center;gap:14px;transition:background .2s;}
    .sitem:hover{background:rgba(255,255,255,.055);}
    .feedwrap{background:rgba(255,255,255,.025);border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:11px 0;overflow:hidden;}
    .feedinner{display:flex;width:max-content;animation:scrollFeed 45s linear infinite;}
    .feeditem{display:inline-flex;align-items:center;gap:8px;padding:0 28px;white-space:nowrap;font-size:13px;color:rgba(255,255,255,.55);border-right:1px solid rgba(255,255,255,.07);}
    .owfoot{background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);padding:48px 0 24px;}
    .fgrid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;}
    .flink{display:block;font-size:13px;color:rgba(255,255,255,.5);font-weight:500;margin-bottom:10px;text-decoration:none;transition:color .2s;}
    .flink:hover{color:#bf5aff;}
    @media(max-width:900px){.sgrid{grid-template-columns:repeat(2,1fr);}.fgrid{grid-template-columns:1fr 1fr;}.hero-r{display:none!important;}.lbhow{grid-template-columns:1fr!important;}}
    @media(max-width:600px){.ogrid{grid-template-columns:repeat(2,1fr)!important;}.rgrid{grid-template-columns:repeat(2,1fr)!important;}}
  `;

  const hgrid = {position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(191,90,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(191,90,255,.05) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'};
  const hglow = {position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(191,90,255,.18) 0%,transparent 70%)',top:'50%',right:'8%',animation:'breathe 4s ease-in-out infinite',pointerEvents:'none'};

  return (
    <>
      <style>{css}</style>
      <div className="ow">

        {/* HERO */}
        <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(191,90,255,.15) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 50%,rgba(147,51,234,.1) 0%,transparent 60%),#0a0a12'}}>
          <div style={hgrid}/>
          <div style={hglow}/>
          {particles.map(p => (
            <div key={p.id} className="particle" style={{left:`${p.x}%`,bottom:0,width:p.size,height:p.size,animation:`floatUp ${p.speed}s ${p.delay}s infinite linear`,opacity:p.opacity}}/>
          ))}
          <div className="owc" style={{position:'relative',zIndex:2,width:'100%',paddingTop:120,paddingBottom:80}}>
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
                <img src="/offerwall/gem.jpg" alt="Gem" style={{width:300,height:300,objectFit:'contain',filter:'drop-shadow(0 0 60px rgba(191,90,255,.5))',animation:'gemFloat 6s ease-in-out infinite'}}/>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE FEED */}
        <div className="feedwrap">
          <div style={{display:'flex',alignItems:'center',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,color:'#48f78a',fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:1,padding:'0 20px',whiteSpace:'nowrap',flexShrink:0,borderRight:'1px solid rgba(255,255,255,.07)'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#48f78a',animation:'pulseDot 1.5s infinite'}}/> Live
            </div>
            <div className="feedinner">
              {[...LIVE_FEED,...LIVE_FEED,...LIVE_FEED].map((item,i) => (
                <div key={i} className="feeditem">
                  <span>{item.avatar}</span>
                  <span style={{color:'#fff',fontWeight:700}}>{item.user}</span>
                  <span>{item.action}</span>
                  <span style={{color:'#48f78a',fontWeight:800}}>{item.amount}</span>
                  <span>via</span>
                  <span style={{color:'rgba(255,255,255,.7)',fontWeight:600}}>{item.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="owc" style={{paddingTop:48,paddingBottom:48}}>
          <div className="sgrid">
            {STATS.map(({label,value,color}) => (
              <div key={label} className="sitem">
                <div style={{width:44,height:44,borderRadius:12,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Gem size={20} style={{color}}/>
                </div>
                <div>
                  <div style={{fontSize:22,fontWeight:900}}>{value}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OFFERS */}
        <section style={{padding:'0 0 80px'}} id="offers">
          <div className="owc">
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:20,marginBottom:24}}>
              <div>
                <div className="stag"><Zap size={11}/> Live Tasks</div>
                <h2 className="stitle">Available <span>Offers</span></h2>
                <p className="ssub">{filteredOffers.length} tasks right now</p>
              </div>
              <div style={{position:'relative',maxWidth:280,flex:1}}>
                <Search style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.3)'}} size={14}/>
                <input placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}
                  style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontFamily:'Rubik,sans-serif',fontSize:13,padding:'10px 14px 10px 38px',borderRadius:10,outline:'none',boxSizing:'border-box'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:28}}>
              {CATEGORIES.map(({id,label,icon:Icon}) => (
                <button key={id} className={`catbtn${activeCategory===id?' active':''}`} onClick={()=>setActiveCategory(id)}>
                  <Icon size={13}/> {label}
                </button>
              ))}
            </div>
            <div className="ogrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
              {filteredOffers.map(offer => (
                <div key={offer.id} className="ocard" onClick={()=>user?window.open('/earn','_self'):openAuth('register')}>
                  {offer.hot && (
                    <div style={{position:'absolute',top:10,right:10,background:'linear-gradient(135deg,#f74848,#f7a248)',color:'#fff',fontSize:9,fontWeight:900,padding:'3px 8px',borderRadius:100,textTransform:'uppercase',letterSpacing:1,display:'flex',alignItems:'center',gap:3,zIndex:2}}>
                      <Flame size={8}/> HOT
                    </div>
                  )}
                  <div style={{height:90,background:`linear-gradient(135deg,${offer.color}35,${offer.color}10)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                    {offer.icon}
                  </div>
                  <div style={{padding:16}}>
                    <div style={{fontSize:14,fontWeight:800,marginBottom:5}}>{offer.title}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:12,lineHeight:1.4}}>{offer.desc}</div>
                    <div style={{display:'flex',gap:6,marginBottom:14}}>
                      <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:6,textTransform:'uppercase',background:`${diffColor(offer.difficulty)}18`,color:diffColor(offer.difficulty)}}>{offer.difficulty}</span>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.4)'}}>{offer.time}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:18,fontWeight:900,color:'#bf5aff',display:'flex',alignItems:'center',gap:4}}><Gem size={13}/>{offer.gems.toLocaleString()}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>${offer.payout.toFixed(2)} value</div>
                      </div>
                      <button style={{background:'linear-gradient(135deg,#bf5aff,#7c3aed)',color:'#fff',fontWeight:800,fontSize:12,padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5}} onClick={e=>{e.stopPropagation();user?window.open('/earn','_self'):openAuth('register');}}>
                        Start <ChevronRight size={12}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:36}}>
              <Link href="/earn" className="btns" style={{display:'inline-flex'}}>View All Offers <ArrowRight size={15}/></Link>
            </div>
          </div>
        </section>

        {/* REWARDS */}
        <section style={{padding:'0 0 80px'}}>
          <div className="owc">
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:20,flexWrap:'wrap',marginBottom:36}}>
              <div>
                <div className="stag"><Gift size={11}/> Cashout Options</div>
                <h2 className="stitle">Redeem Your <span>Gems</span></h2>
                <p className="ssub">Instant payouts, every day</p>
              </div>
              <Link href="/cashout" className="btns" style={{display:'inline-flex'}}>All Rewards <ChevronRight size={14}/></Link>
            </div>
            <div className="rgrid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
              {REWARDS.map(r => (
                <div key={r.id} className={`rcard${r.popular?' pop':''}`} onClick={()=>user?window.open('/cashout','_self'):openAuth('register')}>
                  <span style={{fontSize:36,marginBottom:10,display:'block'}}>{r.icon}</span>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{r.name}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>From {r.min}</div>
                  <div style={{fontSize:13,fontWeight:800,color:'#bf5aff',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><Gem size={11}/>{r.gems.toLocaleString()}+ gems</div>
                </div>
              ))}
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
                  {LEADERBOARD.map(p => {
                    const bs = badgeStyle(p.badge);
                    const rankIcon = p.rank===1?'🥇':p.rank===2?'🥈':p.rank===3?'🥉':`#${p.rank}`;
                    return (
                      <div key={p.rank} className="lbrow">
                        <div style={{fontSize:p.rank<=3?18:14,fontWeight:900,width:30,textAlign:'center',flexShrink:0,color:p.rank===1?'#f7c948':p.rank===2?'#c0c0c0':p.rank===3?'#cd7f32':'rgba(255,255,255,.4)'}}>
                          {rankIcon}
                        </div>
                        <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{p.avatar}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:800}}>{p.user}</div>
                          <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:100,background:bs.bg,color:bs.color,textTransform:'uppercase'}}>{p.badge}</span>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:15,fontWeight:900,color:'#bf5aff'}}>{p.gems.toLocaleString()}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>gems</div>
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
                Join 127,000+ users already earning. Free to join. No hidden fees.
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
                  <img src="/offerwall/gem.jpg" alt="" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/> RewardCash
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
