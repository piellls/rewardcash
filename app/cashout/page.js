'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import PageHeader, { Chip } from '@/components/PageHeader';
import { Reveal, AnimatedNumber } from '@/components/motion';
import { Coins, Wallet, History, AlertCircle, CheckCircle2, Loader2, ArrowUpRight, ShieldCheck, Clock, Percent, CreditCard } from 'lucide-react';

const MethodGiftCard = ({ id }) => {
  const logos = { paypal: 'paypal2.svg', visa: 'visa5.png', btc: 'bitcoin3.png', ltc: 'litecoin2.png', eth: 'eth.png', sol: 'solana.png' };
  return <div className="payment-art">
    {logos[id] ? <img src={`/home-reference/${logos[id]}`} alt="" width="64" height="64" /> : <CreditCard className="h-12 w-12" />}
  </div>;
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
      time: 'Within 24h',
      amounts: [
        { usd: 1, coins: 1000 },
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
      time: 'Within 24h',
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
      time: 'Within 24h',
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
      time: 'Within 24h',
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
      time: 'Within 24h',
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
      time: 'Within 24h',
      amounts: [
        { usd: 5, coins: 5000 },
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 }
      ],
      placeholder: 'Solana (SOL) Wallet Address',
      type: 'text'
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
      
      sfx.play('success');
      fx.confetti({ count: 70 });
      setSuccess(`Your withdrawal of $${selectedAmount.usd} (${selectedAmount.coins} coins) via ${selectedMethod.name} has been submitted!`);
      setSelectedMethod(null);
      await refreshUser();
      await fetchHistory();
    } catch (err) {
      sfx.play('error');
      setError(err.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STATUS = {
    approved: { label: 'Approved', c: '#42d8a0' },
    rejected: { label: 'Rejected', c: '#f17685' },
    pending: { label: 'Pending', c: '#f3c76b' },
  };
  const getStatusBadge = (status) => {
    const st = STATUS[status] || STATUS.pending;
    return <span className="g-rarity" style={{ '--c': st.c }}>{st.label}</span>;
  };

  const userUSD = user ? (user.balance_coins || 0) / 1000 : 0;

  const renderMethodCard = (method, idx) => {
    const minUSD = method.amounts[0].usd;
    const progress = Math.min(userUSD / minUSD, 1);
    const ready = !!user && userUSD >= minUSD;

    return (
      <Reveal key={method.id} i={idx}>
        <button
          type="button"
          onClick={() => handleMethodClick(method)}
          aria-label={`Cash out with ${method.name}, minimum $${minUSD}`}
          className={`g-card g-card-hover g-spot group flex h-full w-full flex-col justify-between p-5 text-left ${ready ? 'ring-1 ring-[rgba(66,216,160,0.5)]' : ''}`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">{method.name}</h3>
            {ready && <span className="g-rarity" style={{ '--c': '#42d8a0' }}>Ready</span>}
          </div>

          <div className="mb-4">
            <MethodGiftCard id={method.id} />
          </div>

          <div className="w-full space-y-2">
            <div className="g-xp" style={{ '--p': progress }}><i /></div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Minimum ${minUSD}</span>
              <span className="tabular-nums text-zinc-200">${userUSD.toFixed(2)} / ${minUSD}</span>
            </div>
          </div>
        </button>
      </Reveal>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[1760px] flex-1 flex-col px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Cashout"
        icon={Wallet}
        title="Cash out"
        accent="your coins"
        art="coins"
        artGlow="gold"
        subtitle="Turn coins into PayPal, a Visa card or crypto. Requests are checked within 24 hours."
      >
        <Chip icon={Coins} tone="gold">1,000 coins = $1.00</Chip>
        {user && (
          <Chip tone="green">
            <AnimatedNumber value={user.balance_coins || 0} className="tabular-nums" /> coins · ${userUSD.toFixed(2)}
          </Chip>
        )}
      </PageHeader>

      {success && (
        <div role="status" className="bb-swap mb-6 flex items-center gap-3 rounded-xl border border-[rgba(66,216,160,0.4)] bg-[rgba(66,216,160,0.1)] p-4 text-[#42d8a0]">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      <section className="mb-8">
        <Reveal as="h2" className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(113,63,225,0.9)]" />
          Cash
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.filter((m) => m.category === 'cash').map((m, i) => renderMethodCard(m, i))}
        </div>
      </section>

      <section className="mb-8">
        <Reveal as="h2" className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(155,123,255,0.9)]" />
          Crypto
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.filter((m) => m.category === 'crypto').map((m, i) => renderMethodCard(m, i))}
        </div>
      </section>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="g-card relative overflow-hidden p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <span className="icon-wrapper-secondary p-1.5"><Percent className="h-4 w-4" aria-hidden="true" /></span>
            Limits and fees
          </h2>
          <div className="overflow-x-auto text-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-dark-border text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="pb-2 pr-4">Method</th>
                  <th className="pb-2 pr-4">Minimum</th>
                  <th className="pb-2 pr-4">Fee</th>
                  <th className="pb-2">Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-zinc-300">
                {methods.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="py-2.5 pr-4 font-semibold text-white">{m.name}</td>
                    <td className="py-2.5 pr-4 tabular-nums">${m.amounts[0].usd.toFixed(2)} ({m.amounts[0].coins.toLocaleString()} coins)</td>
                    <td className={`py-2.5 pr-4 font-bold ${m.fee === '0%' ? 'text-[#42d8a0]' : 'text-[#f3c76b]'}`}>{m.fee}</td>
                    <td className="py-2.5"><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" /> {m.time}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal i={1} className="g-card relative flex flex-col justify-between overflow-hidden p-6">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
              <span className="icon-wrapper-secondary p-1.5"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
              Before you cash out
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Every withdrawal is checked by hand. Using virtual machines, proxies or VPNs, or temporary emails to complete tasks is not allowed and leads to a ban and a rejected withdrawal.
            </p>
          </div>
        </Reveal>
      </div>

      {user && (
        <Reveal className="g-card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
            <span className="icon-wrapper-gradient p-1.5"><History className="h-4 w-4" aria-hidden="true" /></span>
            Your withdrawals
          </h2>

          {withdrawals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-dark-border py-10 text-center">
              <p className="text-sm font-bold text-zinc-300">No withdrawals yet</p>
              <p className="mt-1 text-sm text-zinc-400">Finish a few tasks on the Earn page, then come back to cash out.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-dark-border text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3 pr-4">Method</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Coins</th>
                    <th className="pb-3 pr-4">Address</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-zinc-300">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="py-3 pr-4 font-bold uppercase text-white">{w.payment_method}</td>
                      <td className="py-3 pr-4 font-extrabold tabular-nums text-[#c3b2ff]">${parseFloat(w.amount_usd).toFixed(2)}</td>
                      <td className="py-3 pr-4 tabular-nums text-zinc-400">{w.coins_spent?.toLocaleString()}</td>
                      <td className="max-w-[180px] truncate py-3 pr-4 font-mono text-xs text-zinc-400" title={w.payment_address}>{w.payment_address}</td>
                      <td className="py-3 pr-4 text-zinc-400">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-3">{getStatusBadge(w.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>
      )}

      {/* Cashout dialog */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Cash out with ${selectedMethod.name}`}>
          <div className="g-fade fixed inset-0 bg-[#04060c]/80 backdrop-blur-sm" onClick={() => setSelectedMethod(null)} />

          <div className="g-modal g-neon relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-white">
              <ArrowUpRight className="h-5 w-5 text-[#c3b2ff]" aria-hidden="true" />
              Cash out with {selectedMethod.name}
            </h2>
            <p className="mb-4 border-b border-dark-border pb-3 text-sm text-zinc-400">
              Pick an amount and enter where to send it.
            </p>

            {error && (
              <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(241,118,133,0.4)] bg-[rgba(241,118,133,0.1)] p-3 text-sm text-[#f17685]">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <fieldset>
                <legend className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">Amount</legend>
                <div className="grid grid-cols-2 gap-2">
                  {selectedMethod.amounts.map((amount) => {
                    const isSelected = selectedAmount?.usd === amount.usd;
                    const canAfford = user.balance_coins >= amount.coins;
                    return (
                      <button
                        type="button"
                        key={amount.usd}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedAmount(amount)}
                        className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl border p-3 text-center transition-[background-color,border-color,box-shadow,transform] duration-150 active:scale-95 ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-[0_0_18px_rgba(113,63,225,0.55)]'
                            : 'border-dark-border bg-dark-bg text-white hover:border-primary/60'
                        } ${!canAfford && !isSelected ? 'opacity-45' : ''}`}
                      >
                        <span className="text-base font-extrabold tabular-nums">${amount.usd.toFixed(2)}</span>
                        <span className={`text-xs tabular-nums ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>{amount.coins.toLocaleString()} coins</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="payout-address" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Send to
                </label>
                <input
                  id="payout-address"
                  type={selectedMethod.type}
                  required
                  autoComplete="off"
                  placeholder={selectedMethod.placeholder}
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-dark-border bg-dark-bg px-4 text-base text-white placeholder:text-zinc-500 transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-bg px-4 py-3 text-sm">
                <span className="font-semibold text-zinc-400">Your balance</span>
                <span className="flex items-center gap-1.5 font-bold tabular-nums text-white">
                  <Coins className="h-4 w-4 text-[#f3c76b]" aria-hidden="true" />
                  {user.balance_coins.toLocaleString()} / {selectedAmount ? selectedAmount.coins.toLocaleString() : '0'}
                </span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedMethod(null)} className="btn-gaming-secondary min-h-[48px] flex-1 rounded-xl py-3 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-gaming flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Sending" /> : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />
    </div>
  );
}
