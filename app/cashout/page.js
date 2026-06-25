'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Wallet, History, AlertCircle, CheckCircle2, ChevronRight, Loader2, ArrowUpRight, DollarSign, Clock, Percent, CreditCard } from 'lucide-react';

const MethodGiftCard = ({ id }) => {
  const cardClasses = "w-full aspect-[1.58/1] rounded-xl flex items-center justify-center relative overflow-hidden shadow-md group-hover:scale-[1.02] group-hover:shadow-primary/5 transition-all duration-300";
  
  switch (id) {
    case 'paypal':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#003087] via-[#0079C1] to-[#00457C]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <svg className="h-12 w-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.076 2.245C7.26 2.083 7.502 2 7.747 2H14.5c1.8 0 3.25.4 4.15 1.25.85.8 1.2 1.95 1.05 3.3-.25 2.2-1.5 3.9-3.7 4.5-.75.2-1.6.25-2.5.25H9.926l-1.35 6.55c-.05.24-.26.4-.5.4H4.5c-.32 0-.55-.3-.48-.6l2.5-12.1a1 1 0 0 1 .556-.755z" fill="white" />
            <path d="M10.076 6.245C10.26 6.083 10.502 6 10.747 6H16.5c1.5 0 2.7.35 3.4 1 .7.65.95 1.55.85 2.65-.2 1.75-1.2 3.1-2.9 3.6-.6.15-1.25.2-1.95.2H12.92l-1.15 5.55c-.05.24-.26.4-.5.4H7.5c-.32 0-.55-.3-.48-.6l2.5-12.1a1 1 0 0 1 .556-.755z" fill="#E2E8F0" opacity="0.9" />
          </svg>
        </div>
      );
    case 'visa':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#0057A0] to-[#1A1F71]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <span className="text-3xl font-black italic text-white tracking-widest drop-shadow-md select-none font-sans">
            VISA
          </span>
        </div>
      );
    case 'btc':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#F7931A] to-[#FFAB40]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white to-transparent" />
          <svg className="h-14 w-14 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M9 7h4a2.5 2.5 0 0 1 0 5H9m0 0h5.5a2.5 2.5 0 0 1 0 5H9M10.5 5v14M13.5 5v14" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      );
    case 'ltc':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#4E5B70] to-[#7B8B9E]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />
          <svg className="h-14 w-14 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M9.5 16h6M11.5 8l-3 8h5.5M8 12.5l5.5-2" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      );
    case 'eth':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#3C3C3D] to-[#62688F]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <svg className="h-14 w-14 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
            <path d="M12 5l4.5 7-4.5 2.5L7.5 12 12 5z" stroke="white" strokeWidth="1.5" />
            <path d="M12 14.5l4.5-2.5-4.5 7-4.5-7 4.5 2.5z" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'sol':
      return (
        <div className={`${cardClasses} bg-black`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent" />
          <div className="drop-shadow-lg">
            <svg className="h-10 w-10" viewBox="0 0 398 327" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64.72 260.6c-4.42 0-7.99 3.58-7.99 8v50.2c0 4.42 3.57 8 7.99 8H389.9c4.43 0 8-3.58 8-8v-50.2c0-4.42-3.57-8-8-8H64.72z" fill="url(#solGrad1)"/>
              <path d="M333.1 66.23c4.42 0 7.99-3.58 7.99-8V8.02c0-4.42-3.57-8-7.99-8H7.99C3.57.02 0 3.6 0 8.02v50.2c0 4.43 3.57 8 7.99 8H333.1z" fill="url(#solGrad2)"/>
              <path d="M7.99 163.4c-4.42 0-7.99 3.58-7.99 8v50.2c0 4.42 3.57 8 7.99 8H333.1c4.42 0 7.99-3.58 7.99-8v-50.2c0-4.42-3.57-8-7.99-8H7.99z" fill="url(#solGrad3)"/>
              <defs>
                <linearGradient id="solGrad1" x1="64.7" y1="293.4" x2="389.9" y2="293.4" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00ffa3"/>
                  <stop offset="50%" stopColor="#03e1e5"/>
                  <stop offset="100%" stopColor="#dc1fff"/>
                </linearGradient>
                <linearGradient id="solGrad2" x1="7.99" y1="33.1" x2="333.1" y2="33.1" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00ffa3"/>
                  <stop offset="50%" stopColor="#03e1e5"/>
                  <stop offset="100%" stopColor="#dc1fff"/>
                </linearGradient>
                <linearGradient id="solGrad3" x1="7.99" y1="130.3" x2="333.1" y2="130.3" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#dc1fff"/>
                  <stop offset="50%" stopColor="#03e1e5"/>
                  <stop offset="100%" stopColor="#00ffa3"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );
    case 'doge':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#C2A633] to-[#E1B300]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <svg className="h-14 w-14 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
            <path d="M8.5 8h4.5c2 0 3.5 1 3.5 3v2c0 2-1.5 3-3.5 3H8.5V8z" stroke="white" strokeWidth="1.5" />
            <path d="M8.5 12h9" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'amazon':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#191E26] to-[#232F3E]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xl font-bold tracking-wider text-white select-none">amazon</span>
            <svg className="h-4 w-16 text-[#FF9900]" viewBox="0 0 50 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3c15 8 30 8 46 0m-4-2c2 1 4 3 4 3s-3 .5-5 .5" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      );
    case 'steam':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#171a21] to-[#2a475e]`}>
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent" />
          <svg className="h-12 w-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" />
            <circle cx="10" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
            <path d="M12.5 10.5l4-2.5" stroke="white" strokeWidth="1.5" />
            <circle cx="16.5" cy="8.5" r="1" fill="white" />
            <circle cx="10" cy="12" r="1" fill="white" />
          </svg>
        </div>
      );
    case 'googleplay':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#000000] to-[#1F2022]`}>
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 to-transparent" />
          <div className="flex items-center gap-2">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3.5v17c0 .8.8 1.3 1.5.8l13.5-8.5c.6-.4.6-1.2 0-1.6L5.5 2.7c-.7-.5-1.5 0-1.5.8z" fill="url(#playGradCard)" />
              <defs>
                <linearGradient id="playGradCard" x1="4" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EA4335" />
                  <stop offset="33%" stopColor="#FBBC05" />
                  <stop offset="66%" stopColor="#34A853" />
                  <stop offset="100%" stopColor="#4285F4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs font-black tracking-widest text-white uppercase select-none font-sans">
              Google Play
            </span>
          </div>
        </div>
      );
    case 'apple':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#1E1E1E] to-[#333333]`}>
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
          <svg className="h-10 w-10 fill-white text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21a6 6 0 0 1-5-3 6.5 6.5 0 0 1 0-7 6.5 6.5 0 0 1 9.5-1 5 5 0 0 0-1.5 3.5c0 2 1.5 3.5 3 3.5a6 6 0 0 1-6 4z" />
            <path d="M14 6c0-1.2-.8-2.2-2-2.2.1 1.2-.7 2.2-1.9 2.2.2-1.2.7-2.2 2-2.2" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
      );
    case 'netflix':
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-[#000000] to-[#141414]`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#E50914] to-transparent" />
          <span className="text-3xl font-black text-[#E50914] tracking-wider drop-shadow-md select-none font-sans">
            NETFLIX
          </span>
        </div>
      );
    default:
      return (
        <div className={`${cardClasses} bg-gradient-to-tr from-primary/20 to-secondary/10`}>
          <CreditCard className="h-10 w-10 text-white" />
        </div>
      );
  }
};

export default function Cashout() {
  const { user, refreshUser } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  
  // Auth state redirect
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Withdrawal form states
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null); // { usd: 5, coins: 5000 }
  const [paymentAddress, setPaymentAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const methods = [
    { 
      id: 'paypal', 
      category: 'cash',
      name: 'PayPal', 
      description: 'Withdraw funds directly to your PayPal account. Safe and secure.',
      badge: 'Popular',
      fee: '0%',
      time: 'Instant - 24h',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'PayPal Email Address',
      type: 'email'
    },
    {
      id: 'visa',
      category: 'cash',
      name: 'Visa Prepaid',
      description: 'Get a virtual prepaid Visa card to shop online globally.',
      badge: 'Shopping',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    },
    { 
      id: 'btc', 
      category: 'crypto',
      name: 'Bitcoin', 
      description: 'Direct transfer to any Bitcoin wallet. Classic cryptocurrency storage.',
      badge: 'Classic Crypto',
      fee: '2%',
      time: 'Instant',
      amounts: [
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 },
        { usd: 100, coins: 100000 }
      ],
      placeholder: 'Bitcoin (BTC) Wallet Address',
      type: 'text'
    },
    { 
      id: 'ltc', 
      category: 'crypto',
      name: 'Litecoin', 
      description: 'Crypto payout with near-zero network fees. Instant blockchain transfer.',
      badge: 'Lowest Fees',
      fee: '0%',
      time: 'Instant',
      amounts: [
        { usd: 2, coins: 2000 },
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 20, coins: 20000 }
      ],
      placeholder: 'Litecoin (LTC) Wallet Address',
      type: 'text'
    },
    {
      id: 'eth',
      category: 'crypto',
      name: 'Ethereum',
      description: 'Withdraw to any ERC-20 compatible Ethereum address instantly.',
      badge: 'Secure',
      fee: '1.5%',
      time: 'Instant',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Ethereum (ETH) Wallet Address',
      type: 'text'
    },
    {
      id: 'sol',
      category: 'crypto',
      name: 'Solana',
      description: 'Withdraw SOL directly to your Solana wallet instantly.',
      badge: 'Fastest',
      fee: '0%',
      time: 'Instant',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Solana (SOL) Wallet Address',
      type: 'text'
    },
    {
      id: 'doge',
      category: 'crypto',
      name: 'Dogecoin',
      description: 'Instant meme coin transfer directly to your Dogecoin address.',
      badge: 'Popular',
      fee: '0%',
      time: 'Instant',
      amounts: [
        { usd: 3, coins: 3000 },
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 }
      ],
      placeholder: 'Dogecoin (DOGE) Wallet Address',
      type: 'text'
    },
    {
      id: 'amazon',
      category: 'giftcard',
      name: 'Amazon',
      description: 'Shop millions of products on Amazon with your balance.',
      badge: 'Popular',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    },
    {
      id: 'steam',
      category: 'giftcard',
      name: 'Steam',
      description: 'Top up your Steam wallet to buy games, skins, and DLCs.',
      badge: 'Gaming',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    },
    {
      id: 'googleplay',
      category: 'giftcard',
      name: 'Google Play',
      description: 'Purchase apps, games, books, and movies on Android.',
      badge: 'Android',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    },
    {
      id: 'apple',
      category: 'giftcard',
      name: 'Apple',
      description: 'Buy devices, apps, games, music, movies, or iCloud space.',
      badge: 'iOS/Mac',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    },
    {
      id: 'netflix',
      category: 'giftcard',
      name: 'Netflix',
      description: 'Subscribe to Netflix and watch your favorite shows & movies.',
      badge: 'Streaming',
      fee: '0%',
      time: '1 - 12 Hours',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Delivery Email Address',
      type: 'email'
    }
  ];

  const fetchHistory = async () => {
    if (user) {
      const history = await db.getWithdrawals(user.id);
      setWithdrawals(history);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleMethodClick = (method) => {
    if (!user) {
      setAuthTab('register');
      setIsAuthOpen(true);
      return;
    }
    setSelectedMethod(method);
    setSelectedAmount(method.amounts[0]); // default to first option
    setPaymentAddress('');
    setError('');
    setSuccess('');
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedMethod || !selectedAmount) return;
    setError('');
    setSuccess('');

    // Form validations
    if (!paymentAddress.trim()) {
      setError('Please provide a valid cashout address.');
      return;
    }
    if (user.balance_coins < selectedAmount.coins) {
      setError('You do not have enough coins for this payout.');
      return;
    }

    setLoading(true);
    try {
      await db.createWithdrawal(
        user.id,
        selectedAmount.usd,
        selectedAmount.coins,
        selectedMethod.id,
        paymentAddress
      );
      
      setSuccess(`Your withdrawal of $${selectedAmount.usd} (${selectedAmount.coins} coins) via ${selectedMethod.name} has been submitted!`);
      setSelectedMethod(null);
      await refreshUser();
      await fetchHistory();
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="rounded-full bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-0.5 text-xs font-bold text-primary">Approved</span>;
      case 'rejected':
        return <span className="rounded-full bg-red-950/40 border border-red-900/60 px-2.5 py-0.5 text-xs font-bold text-red-400">Rejected</span>;
      default:
        return <span className="rounded-full bg-amber-950/40 border border-amber-900/60 px-2.5 py-0.5 text-xs font-bold text-yellow-500">Pending</span>;
    }
  };

  const renderMethodCard = (method) => {
    const minUSD = method.amounts[0].usd;
    const userUSD = user ? (user.balance_coins / 1000) : 0;
    const progressPercent = Math.min((userUSD / minUSD) * 100, 100);

    return (
      <div 
        key={method.id}
        onClick={() => handleMethodClick(method)}
        className="flex flex-col justify-between rounded-2xl border border-dark-border bg-dark-card/65 p-5 hover:border-primary/20 hover:bg-dark-card active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
      >
        {/* Name Title at top center */}
        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white text-center mb-4 transition-colors font-sans">
          {method.name}
        </h3>

        {/* Center Gift Card Area */}
        <div className="mb-4">
          <MethodGiftCard id={method.id} />
        </div>

        {/* Payout Progress Area */}
        <div className="w-full mt-2 space-y-2">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-[1px] border border-dark-border">
            <div 
              className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Minimum and threshold value labels */}
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <span>Minimum $</span>
            <span className="text-zinc-300 font-extrabold font-sans normal-case">
              ${userUSD.toFixed(2)} / ${minUSD}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="icon-wrapper-primary p-2">
              <Wallet className="h-6 w-6" />
            </div>
            Cashout Portal
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Convert your earned coins into real cash or crypto. Checked and processed within 24 hours.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary animate-pulse" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {/* 1. Cash Withdrawals Section */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Withdraw Cash
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded-md border border-dark-border">Direct Payouts</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {methods.filter(m => m.category === 'cash').map((method) => renderMethodCard(method))}
        </div>
      </div>

      {/* 2. Cryptocurrencies Section */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Cryptocurrencies
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded-md border border-dark-border">Instant Blockchain</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {methods.filter(m => m.category === 'crypto').map((method) => renderMethodCard(method))}
        </div>
      </div>

      {/* 3. Gift Cards Section */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Gift Cards
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded-md border border-dark-border">Virtual Delivery</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {methods.filter(m => m.category === 'giftcard').map((method) => renderMethodCard(method))}
        </div>
      </div>

      {/* Summary Fee & Speed Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Method Info Block */}
        <div className="lg:col-span-2 rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />
          
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="icon-wrapper-secondary p-1.5">
              <Percent className="h-4 w-4" />
            </div>
            Payout Parameters & Fee Structures
          </h2>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-550 uppercase tracking-widest pb-2">
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Minimum Limit</th>
                  <th className="pb-2">Network Fee</th>
                  <th className="pb-2">Average Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-zinc-300">
                {methods.map((m) => (
                  <tr key={m.id} className="group hover:bg-zinc-900/10 transition-colors">
                    <td className="py-2.5 font-semibold text-white">{m.name}</td>
                    <td className="py-2.5">${m.amounts[0].usd.toFixed(2)} ({m.amounts[0].coins.toLocaleString()} Coins)</td>
                    <td className={`py-2.5 font-bold ${m.fee === '0%' ? 'text-emerald-400' : 'text-amber-500'}`}>{m.fee}</td>
                    <td className="py-2.5 flex items-center gap-1.5"><Clock className="h-3 w-3 text-zinc-500" /> {m.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Note */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-secondary/5 to-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <div className="icon-wrapper-secondary p-1.5">
                <DollarSign className="h-4 w-4" />
              </div>
              Cashout Guidelines
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We monitor all withdrawals manually to ensure the integrity of the network. Attempting to complete offers with virtual machines, proxies/VPNs, or temporary emails is strictly prohibited and will lead to an immediate ban and refund rejection.
            </p>
          </div>
          <div className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider mt-4">
            Security Status: Secure SSL Active
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      {user && (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="icon-wrapper-gradient p-1.5">
              <History className="h-4 w-4" />
            </div>
            Withdrawal Log History
          </h2>

          {withdrawals.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-zinc-950/20 border border-dashed border-dark-border">
              <p className="text-xs text-zinc-500 font-bold">You haven't requested any withdrawals yet.</p>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Complete tasks on the earn page to claim payouts!</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-550 uppercase tracking-widest pb-3">
                    <th className="pb-3 pr-4">Method</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Spent</th>
                    <th className="pb-3 px-4">Address</th>
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="group hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3 pr-4 font-bold text-white uppercase">{w.payment_method}</td>
                      <td className="py-3 px-4 font-extrabold text-primary">${parseFloat(w.amount_usd).toFixed(2)}</td>
                      <td className="py-3 px-4 text-zinc-400">{w.coins_spent?.toLocaleString()} Coins</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 max-w-[180px] truncate" title={w.payment_address}>{w.payment_address}</td>
                      <td className="py-3 px-4 text-zinc-500">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-3 pl-4">{getStatusBadge(w.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cashout Modal */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedMethod(null)} />
          
          <div className="relative w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl overflow-hidden">
            {/* Accent border top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Cashout: {selectedMethod.name}
            </h2>
            <p className="text-[11px] text-zinc-400 border-b border-dark-border/60 pb-3 mb-4">
              Select your reward size and enter your payment details below.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400 animate-pulse">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Select Payout Grid */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Select Payout Amount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedMethod.amounts.map((amount) => {
                    const isSelected = selectedAmount?.usd === amount.usd;
                    const canAfford = user.balance_coins >= amount.coins;
                    return (
                      <button
                        type="button"
                        key={amount.usd}
                        onClick={() => setSelectedAmount(amount)}
                        className={`rounded-xl p-3 text-center border transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-primary border-primary text-black'
                            : 'bg-zinc-950 border-dark-border text-white hover:border-zinc-700'
                        } ${!canAfford && !isSelected ? 'opacity-50' : ''}`}
                      >
                        <span className="text-sm font-bold">${amount.usd.toFixed(2)}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-black/70 font-bold' : 'text-zinc-555'}`}>
                          {amount.coins.toLocaleString()} Coins
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Payment Address / Account
                </label>
                <input
                  type={selectedMethod.type}
                  required
                  placeholder={selectedMethod.placeholder}
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-dark-border py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* User Balance Status */}
              <div className="flex items-center justify-between text-xs rounded-xl bg-zinc-900 border border-dark-border/80 px-4 py-3">
                <span className="text-zinc-400 font-semibold uppercase tracking-wide">Your Balance:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  {user.balance_coins.toLocaleString()} / {selectedAmount?.coins.toLocaleString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod(null)}
                  className="flex-1 rounded-xl border border-dark-border bg-zinc-900 py-3 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary py-3 text-xs font-black text-black hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redirect Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialTab={authTab} 
      />
    </div>
  );
}
