'use client';

import { useState, useEffect } from 'react';
import { Coins, Wallet, Check } from 'lucide-react';

const MOCK_USERNAMES = [
  'BenStock', 'Denisiu21', 'Aymane_X', 'Sarah99', 'LukasK', 'AlexPro', 'SofiaR', 'Tariq1', 
  'CodyG', 'JaneD', 'EarnGuru', 'CoinSlayer', 'SurveyPro', 'CashHunter', 'Zack_C', 'Mounir_L', 
  'Radia_T', 'Younes_S', 'Fati_M', 'Mehdi_98', 'Reda_X', 'Yassine_G', 'Chaimae_R'
];

const MOCK_TASKS = [
  { title: 'TimeWall - Complete', subtitle: 'TimeWall', type: 'task', min: 0.10, max: 1.50 },
  { title: 'PrimeSurveys - Complete', subtitle: 'PrimeSurveys', type: 'survey', min: 0.50, max: 3.50 },
  { title: 'SayMore Profile Survey', subtitle: 'Lootably', type: 'survey', min: 0.20, max: 1.80 },
  { title: 'Board Kings: Level 11', subtitle: 'CPALead', type: 'task', min: 2.50, max: 6.80 },
  { title: 'TikTok Install & Open', subtitle: 'CPALead', type: 'task', min: 0.15, max: 0.50 },
  { title: 'Opinion World Survey', subtitle: 'AdBlueMedia', type: 'survey', min: 0.80, max: 2.20 },
  { title: 'Lords Mobile: Level 2', subtitle: 'AdBlueMedia', type: 'task', min: 4.50, max: 9.50 },
  { title: 'Monopoly Go Install', subtitle: 'Lootably', type: 'task', min: 3.20, max: 7.50 },
  { title: 'Cashout Request', subtitle: 'PayPal', type: 'withdrawal', min: 5.00, max: 50.00 },
  { title: 'Cashout Request', subtitle: 'Litecoin (LTC)', type: 'withdrawal', min: 2.50, max: 100.00 },
  { title: 'Cashout Request', subtitle: 'Bitcoin (BTC)', type: 'withdrawal', min: 10.00, max: 150.00 },
  { title: 'Cashout Request', subtitle: 'Visa Gift Card', type: 'withdrawal', min: 5.00, max: 25.00 }
];

const AVATAR_COLORS = [
  'bg-zinc-700', 'bg-blue-600', 'bg-red-600', 'bg-emerald-600', 
  'bg-amber-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600'
];

const CARTOON_AVATARS = [
  '/avatars/avatar_1.png', '/avatars/avatar_2.png', '/avatars/avatar_3.png', '/avatars/avatar_4.png',
  '/avatars/avatar_5.png', '/avatars/avatar_6.png', '/avatars/avatar_7.png', '/avatars/avatar_8.png',
  '/avatars/avatar_9.png', '/avatars/avatar_10.png'
];

// Helper to generate a single fake transaction
const generateItem = (isInitial = false) => {
  const userIdx = Math.floor(Math.random() * MOCK_USERNAMES.length);
  const taskIdx = Math.floor(Math.random() * MOCK_TASKS.length);
  
  const username = MOCK_USERNAMES[userIdx];
  const task = MOCK_TASKS[taskIdx];
  const amount = (Math.random() * (task.max - task.min) + task.min).toFixed(2);
  
  // 50% chance of letter avatar vs cartoon avatar
  const useLetterAvatar = Math.random() > 0.5;
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const cartoonUrl = CARTOON_AVATARS[Math.floor(Math.random() * CARTOON_AVATARS.length)];
  
  return {
    id: 'feed_' + Math.random().toString(36).substr(2, 9),
    username,
    title: task.type === 'withdrawal' ? `${username}` : task.title,
    subtitle: task.type === 'withdrawal' ? task.subtitle : task.subtitle,
    type: task.type,
    amount,
    useLetterAvatar,
    avatarColor,
    cartoonUrl,
    entering: !isInitial // only animate if generated dynamically
  };
};

export default function LiveFeedBanner() {
  const [feed, setFeed] = useState([]);

  // Generate initial feed
  useEffect(() => {
    const initialItems = Array.from({ length: 15 }, () => generateItem(true));
    setFeed(initialItems);
  }, []);

  // Periodically add new item and remove old ones
  useEffect(() => {
    if (feed.length === 0) return;

    const interval = setInterval(() => {
      const newItem = generateItem(false);
      
      setFeed(prev => {
        // Prepend new item
        const updated = [newItem, ...prev];
        // Limit list to 20 items to prevent memory bloat
        return updated.slice(0, 20);
      });

      // After slide-in animation starts, clear the entering flag to lock layout
      setTimeout(() => {
        setFeed(prev => {
          return prev.map(item => item.id === newItem.id ? { ...item, entering: false } : item);
        });
      }, 700);

    }, 3500); // add new item every 3.5 seconds

    return () => clearInterval(interval);
  }, [feed.length]);

  return (
    <div className="fixed top-16 right-0 left-0 md:left-64 z-20 h-14 bg-zinc-950/90 backdrop-blur-md border-b border-dark-border/60 flex items-center overflow-hidden px-4 select-none">
      
      {/* Live Badge (left overlay to show it's real time) */}
      <div className="flex items-center gap-1.5 bg-zinc-950 pr-4 z-10 h-full border-r border-dark-border/40 shrink-0 font-display">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
          Live Feed
        </span>
      </div>

      {/* Feed Container */}
      <div className="flex items-center gap-2.5 overflow-hidden flex-1 pl-4 h-full">
        {feed.map((item, index) => {
          const isWithdrawal = item.type === 'withdrawal';
          
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-dark-card/45 px-3 py-1.5 rounded-lg border border-dark-border/50 shrink-0 text-left min-w-[195px] max-w-[195px] h-9 transition-all duration-700 ease-out hover:border-primary/25"
              style={{
                width: item.entering ? '0px' : '195px',
                opacity: item.entering ? 0 : 1,
                paddingLeft: item.entering ? '0px' : '12px',
                paddingRight: item.entering ? '0px' : '12px',
                borderWidth: item.entering ? '0px' : '1px',
                marginRight: item.entering ? '-10px' : '0px'
              }}
            >
              {/* Avatar Image / Letter container */}
              {!item.entering && (
                <>
                  <div className="relative h-6.5 w-6.5 shrink-0 rounded-md overflow-hidden">
                    {item.useLetterAvatar ? (
                      <div className={`w-full h-full flex items-center justify-center font-bold text-[10px] text-white ${item.avatarColor}`}>
                        {item.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img
                        src={item.cartoonUrl}
                        alt={item.username}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Tiny icon badge at bottom right */}
                    <div className={`absolute -bottom-0.5 -right-0.5 rounded-sm p-[1.5px] border-[0.5px] border-zinc-950 text-white ${
                      isWithdrawal ? 'bg-primary' : 'bg-amber-500'
                    }`}>
                      {isWithdrawal ? (
                        <Wallet className="h-1.5 w-1.5 text-black animate-pulse" />
                      ) : (
                        <Check className="h-1.5 w-1.5 text-black stroke-[3.5]" />
                      )}
                    </div>
                  </div>

                  {/* Texts details */}
                  <div className="flex flex-col min-w-0 flex-1 leading-none">
                    <span className="text-[10px] font-bold text-white truncate mb-0.5">
                      {item.title}
                    </span>
                    <span className="text-[8.5px] text-zinc-500 truncate font-semibold uppercase tracking-wide">
                      {item.subtitle}
                    </span>
                  </div>

                  {/* Amount Payout */}
                  <span className="text-[10.5px] font-black text-primary font-sans shrink-0 ml-1">
                    ${item.amount}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
