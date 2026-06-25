'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Wallet, History, AlertCircle, CheckCircle2, ChevronRight, Loader2, ArrowUpRight, DollarSign, Clock, Percent, CreditCard } from 'lucide-react';

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
      name: 'PayPal Payout', 
      description: 'Withdraw funds directly to your PayPal account. Safe and secure.',
      logoColor: 'bg-[#0070ba]/10 text-sky-400 border-[#0070ba]/20',
      logoChar: 'PP',
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
      id: 'ltc', 
      name: 'Litecoin (LTC)', 
      description: 'Crypto payout with near-zero network fees. Instant blockchain transfer.',
      logoColor: 'bg-[#345d9d]/10 text-primary border-[#345d9d]/20',
      logoChar: 'Ł',
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
      id: 'btc', 
      name: 'Bitcoin (BTC)', 
      description: 'Direct transfer to any Bitcoin wallet. Classic cryptocurrency storage.',
      logoColor: 'bg-[#f7931a]/10 text-[#f7931a] border-[#f7931a]/20',
      logoChar: '₿',
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
      id: 'visa',
      name: 'Visa Virtual Card',
      description: 'Get a virtual prepaid Visa card to shop online globally.',
      logoColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      logoChar: <CreditCard className="h-5 w-5" />,
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" />
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

      {/* Method List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {methods.map((method) => (
          <div 
            key={method.id}
            onClick={() => handleMethodClick(method)}
            className="flex flex-col justify-between rounded-xl border border-dark-border bg-dark-card p-5 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.06)] active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Ribbons */}
            <div className="absolute top-3.5 right-3.5">
              <span className="rounded-full bg-zinc-900 border border-dark-border px-2.5 py-0.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                {method.badge}
              </span>
            </div>

            <div>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base mb-4 border shadow-sm ${method.logoColor}`}>
                {method.logoChar}
              </div>

              {/* Title */}
              <h3 className="text-sm font-extrabold text-white group-hover:text-primary transition-colors flex items-center gap-1">
                {method.name}
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </h3>
              
              <p className="text-xs text-zinc-455 mt-1 mb-5 leading-relaxed text-zinc-400">
                {method.description}
              </p>
            </div>

            {/* Bottom details */}
            <div className="pt-3 border-t border-dark-border/40 grid grid-cols-3 gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
              <div>
                <span className="block text-[8px] text-zinc-600 mb-0.5">Min. Payout</span>
                <span className="text-zinc-300 font-extrabold">${method.amounts[0].usd.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[8px] text-zinc-600 mb-0.5">Time</span>
                <span className="text-zinc-300 font-extrabold">{method.id === 'ltc' ? 'Instant' : '24 Hours'}</span>
              </div>
              <div>
                <span className="block text-[8px] text-zinc-600 mb-0.5">Fee</span>
                <span className="text-zinc-300 font-extrabold">{method.fee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Fee & Speed Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Method Info Block */}
        <div className="lg:col-span-2 rounded-2xl border border-dark-border bg-dark-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />
          
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Percent className="h-4.5 w-4.5 text-primary" />
            Payout Parameters & Fee Structures
          </h2>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-2">
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Minimum Limit</th>
                  <th className="pb-2">Network Fee</th>
                  <th className="pb-2">Average Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-zinc-300">
                <tr className="group">
                  <td className="py-2.5 font-semibold text-white">PayPal</td>
                  <td className="py-2.5">$5.00 (5,000 Coins)</td>
                  <td className="py-2.5 text-emerald-400">0%</td>
                  <td className="py-2.5 flex items-center gap-1.5"><Clock className="h-3 w-3 text-zinc-500" /> 1 - 24 hours</td>
                </tr>
                <tr className="group">
                  <td className="py-2.5 font-semibold text-white">Litecoin (LTC)</td>
                  <td className="py-2.5">$2.00 (2,000 Coins)</td>
                  <td className="py-2.5 text-emerald-400">0%</td>
                  <td className="py-2.5 flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary animate-pulse" /> Instant Payout</td>
                </tr>
                <tr className="group">
                  <td className="py-2.5 font-semibold text-white">Bitcoin (BTC)</td>
                  <td className="py-2.5">$10.00 (10,000 Coins)</td>
                  <td className="py-2.5 text-amber-500">2%</td>
                  <td className="py-2.5 flex items-center gap-1.5"><Clock className="h-3 w-3 text-zinc-500" /> Instant Payout</td>
                </tr>
                <tr className="group">
                  <td className="py-2.5 font-semibold text-white">Visa Gift Card</td>
                  <td className="py-2.5">$5.00 (5,000 Coins)</td>
                  <td className="py-2.5 text-emerald-400">0%</td>
                  <td className="py-2.5 flex items-center gap-1.5"><Clock className="h-3 w-3 text-zinc-500" /> 1 - 12 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Note */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-secondary/5 to-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-secondary" />
              Cashout Guidelines
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed text-zinc-450">
              We monitor all withdrawals manually to ensure the integrity of the network. Attempting to complete offers with virtual machines, proxies/VPNs, or temporary emails is strictly prohibited and will lead to an immediate ban and refund rejection.
            </p>
          </div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">
            Security Status: Secure SSL Active
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      {user && (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-secondary" />
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
                  <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
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
                        <span className={`text-[10px] ${isSelected ? 'text-black/70 font-bold' : 'text-zinc-500 font-bold'}`}>
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
