'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import { Coins, Wallet, History, AlertCircle, CheckCircle2, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react';

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
      description: 'Withdraw funds directly to your PayPal account. Standard processing.',
      logoColor: 'bg-blue-600 text-white',
      badge: 'Popular',
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
      logoColor: 'bg-slate-700 text-white',
      badge: 'Lowest Fees',
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
      description: 'Direct transfer to any Bitcoin wallet. Network fee depends on congestion.',
      logoColor: 'bg-amber-600 text-white',
      badge: 'Classic Crypto',
      amounts: [
        { usd: 10, coins: 10000 },
        { usd: 25, coins: 25000 },
        { usd: 50, coins: 50000 },
        { usd: 100, coins: 100000 }
      ],
      placeholder: 'Bitcoin (BTC) Wallet Address',
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          Redeem Coins & Cashout
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Convert your earned coins into PayPal cash, Bitcoin, or Litecoin. Payouts are checked and processed within 24 hours.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary animate-pulse" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {/* Method List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {methods.map((method) => (
          <div 
            key={method.id}
            onClick={() => handleMethodClick(method)}
            className="flex flex-col rounded-2xl glass-card border border-dark-border p-6 hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Ribbon Badge */}
            <span className="absolute top-4 right-4 rounded-full bg-zinc-900 border border-dark-border px-2.5 py-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {method.badge}
            </span>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mb-6 shadow-md ${method.logoColor}`}>
              {method.id === 'paypal' ? 'PP' : method.id === 'ltc' ? 'Ł' : '₿'}
            </div>

            {/* Content */}
            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors flex items-center gap-1">
              {method.name}
              <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-zinc-400 mt-2 mb-6 flex-1 leading-relaxed">
              {method.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-1.5 pt-4 border-t border-dark-border/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Min. Payout: 
              <span className="text-zinc-200">${method.amounts[0].usd.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal History */}
      {user && (
        <div className="rounded-2xl glass-card border border-dark-border p-6">
          <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <History className="h-5 w-5 text-secondary" />
            Withdrawal History
          </h2>

          {withdrawals.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-zinc-950/30 border border-dashed border-dark-border">
              <p className="text-sm text-zinc-500">You haven't requested any withdrawals yet.</p>
              <p className="text-xs text-zinc-600 mt-1">Complete offers on the Earn page to start earning cash!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Method</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Spent</th>
                    <th className="pb-3 px-4">Address</th>
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-sm">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="group">
                      <td className="py-3.5 pr-4 font-bold text-white uppercase">{w.payment_method}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary">${parseFloat(w.amount_usd).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{w.coins_spent?.toLocaleString()} Coins</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-500 max-w-[180px] truncate" title={w.payment_address}>{w.payment_address}</td>
                      <td className="py-3.5 px-4 text-zinc-500 text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 pl-4">{getStatusBadge(w.status)}</td>
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
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedMethod(null)} />
          
          <div className="relative w-full max-w-md rounded-2xl glass-card border border-dark-border p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Cashout via {selectedMethod.name}
            </h2>
            <p className="text-xs text-zinc-400 border-b border-dark-border pb-4 mb-4">
              Select your desired reward size and enter your payment details below.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              {/* Select Payout Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
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
                        <span className={`text-[10px] ${isSelected ? 'text-black/70 font-semibold' : 'text-zinc-500 font-medium'}`}>
                          {amount.coins.toLocaleString()} Coins
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Payment Address / Account
                </label>
                <input
                  type={selectedMethod.type}
                  required
                  placeholder={selectedMethod.placeholder}
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* User Balance Status */}
              <div className="flex items-center justify-between text-xs rounded-xl bg-zinc-900 border border-dark-border/80 px-4 py-3">
                <span className="text-zinc-400 font-semibold uppercase tracking-wide">Your Balance:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-yellow-500" />
                  {user.balance_coins.toLocaleString()} / {selectedAmount?.coins.toLocaleString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod(null)}
                  className="flex-1 rounded-xl border border-dark-border bg-zinc-900 py-3 text-sm font-bold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
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
