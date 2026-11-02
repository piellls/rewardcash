'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import AuthModal from '@/components/AuthModal';
import PageHeader, { Chip } from '@/components/PageHeader';
import { Reveal, AnimatedNumber } from '@/components/motion';
import Portal from '@/components/Portal';
import { Coins, Wallet, History, AlertCircle, CheckCircle2, Loader2, ArrowUpRight, ShieldCheck, CreditCard } from 'lucide-react';

const MethodGiftCard = ({ id }) => {
  const logos = { paypal: 'paypal2.svg', visa: 'visa5.png', btc: 'bitcoin3.png', ltc: 'litecoin2.png', eth: 'eth.png', sol: 'solana.png' };
  return <div className="payment-art">
    {logos[id] ? <img src={`/home-reference/${logos[id]}`} alt="" width="64" height="64" /> : <CreditCard className="h-12 w-12" />}
  </div>;
};

// The amounts here must match PAYOUT_OPTIONS in lib/cashout.js: the server rejects any other amount.
// The dollar value is always coins / 1000. No fee is added or taken on top of it by this site.
const methods = [
  {
    id: 'paypal',
    category: 'cash',
    name: 'PayPal',
    description: 'Sent to your PayPal account.',
    amounts: [
      { usd: 1, coins: 1000 },
      { usd: 5, coins: 5000 },
      { usd: 10, coins: 10000 },
      { usd: 25, coins: 25000 },
      { usd: 50, coins: 50000 },
    ],
    placeholder: 'PayPal email address',
    addressLabel: 'PayPal email',
    type: 'email',
  },
  {
    id: 'visa',
    category: 'cash',
    name: 'Visa Prepaid',
    description: 'Virtual prepaid Visa card, delivered by email.',
    amounts: [
      { usd: 5, coins: 5000 },
      { usd: 10, coins: 10000 },
      { usd: 25, coins: 25000 },
      { usd: 50, coins: 50000 },
    ],
    placeholder: 'Email to receive the card',
    addressLabel: 'Delivery email',
    type: 'email',
  },
  {
    id: 'btc',
    category: 'crypto',
    name: 'Bitcoin',
    description: 'Sent to a Bitcoin (BTC) wallet.',
    amounts: [
      { usd: 10, coins: 10000 },
      { usd: 25, coins: 25000 },
      { usd: 50, coins: 50000 },
      { usd: 100, coins: 100000 },
    ],
    placeholder: 'Bitcoin (BTC) wallet address',
    addressLabel: 'BTC wallet address',
    type: 'text',
  },
  {
    id: 'ltc',
    category: 'crypto',
    name: 'Litecoin',
    description: 'Sent to a Litecoin (LTC) wallet.',
    amounts: [
      { usd: 2, coins: 2000 },
      { usd: 5, coins: 5000 },
      { usd: 10, coins: 10000 },
      { usd: 20, coins: 20000 },
    ],
    placeholder: 'Litecoin (LTC) wallet address',
    addressLabel: 'LTC wallet address',
    type: 'text',
  },
  {
    id: 'eth',
    category: 'crypto',
    name: 'Ethereum',
    description: 'Sent to an ERC-20 compatible Ethereum address.',
    amounts: [
      { usd: 5, coins: 5000 },
      { usd: 10, coins: 10000 },
      { usd: 25, coins: 25000 },
      { usd: 50, coins: 50000 },
    ],
    placeholder: 'Ethereum (ETH) wallet address',
    addressLabel: 'ETH wallet address',
    type: 'text',
  },
  {
    id: 'sol',
    category: 'crypto',
    name: 'Solana',
    description: 'Sent to a Solana (SOL) wallet.',
    amounts: [
      { usd: 5, coins: 5000 },
      { usd: 10, coins: 10000 },
      { usd: 25, coins: 25000 },
      { usd: 50, coins: 50000 },
    ],
    placeholder: 'Solana (SOL) wallet address',
    addressLabel: 'SOL wallet address',
    type: 'text',
  },
];

const STATUS = {
  approved: { label: 'Approved', c: '#42d8a0' },
  rejected: { label: 'Rejected', c: '#f17685' },
  pending: { label: 'Pending', c: '#f3c76b' },
};

export default function Cashout() {
  const { user, refreshUser } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [historyError, setHistoryError] = useState('');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null); // { usd, coins }
  const [paymentAddress, setPaymentAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setHistoryError('');
      const history = await db.getWithdrawals(user.id);
      setWithdrawals(history);
    } catch (err) {
      setHistoryError(err.message || 'Could not load your withdrawals. Try again in a moment.');
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMethodClick = (method) => {
    if (!user) {
      setAuthTab('register');
      setIsAuthOpen(true);
      return;
    }
    setSelectedMethod(method);
    setSelectedAmount(method.amounts[0]);
    setPaymentAddress('');
    setError('');
    setSuccess('');
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedMethod || !selectedAmount) return;
    setError('');
    setSuccess('');

    if (!paymentAddress.trim()) {
      setError('Enter the address or email where we should send your payout.');
      return;
    }
    if (user.balance_coins < selectedAmount.coins) {
      setError('You do not have enough coins for this amount. Pick a smaller one.');
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
      setSuccess(`Request received: $${selectedAmount.usd} (${selectedAmount.coins.toLocaleString()} coins) via ${selectedMethod.name}. It is now pending review.`);
      setSelectedMethod(null);
      await refreshUser();
      await fetchHistory();
    } catch (err) {
      sfx.play('error');
      setError(err.message || 'The request did not go through. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = STATUS[status] || STATUS.pending;
    return <span className="g-rarity" style={{ '--c': st.c }}>{st.label}</span>;
  };

  const balanceCoins = user?.balance_coins || 0;
  const userUSD = balanceCoins / 1000;

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
          className={`bb-method-card g-card g-card-hover g-spot group flex h-full w-full flex-col justify-between p-3 text-left sm:p-5 ${ready ? 'bb-method-ready' : ''}`}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:mb-4">
            <h3 className="text-sm font-bold text-white">{method.name}</h3>
            {ready && <span className="g-rarity" style={{ '--c': '#42d8a0' }}>Ready</span>}
          </div>

          <div className="mb-3 sm:mb-4">
            <MethodGiftCard id={method.id} />
          </div>

          <div className="w-full space-y-2">
            <div className="g-xp" style={{ '--p': progress }}><i /></div>
            <div className="flex flex-col gap-0.5 text-xs font-semibold text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Minimum ${minUSD}</span>
              <span className="tabular-nums text-zinc-200">{user ? `$${userUSD.toFixed(2)} / $${minUSD}` : 'Sign in to see'}</span>
            </div>
          </div>
        </button>
      </Reveal>
    );
  };

  const selectedAfter = selectedAmount ? balanceCoins - selectedAmount.coins : null;

  return (
    <div className="bb-page mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-4 pb-10 pt-2 sm:px-6 md:px-8 lg:px-10 2xl:px-14">
      <PageHeader
        eyebrow="Cashout"
        icon={Wallet}
        title="Cash out"
        accent="your coins"
        art="coins"
        artGlow="gold"
        subtitle="1,000 coins = $1.00. Pick a method, choose an amount and enter where to send it."
      >
        <Chip icon={Coins} tone="gold">1,000 coins = $1.00</Chip>
        {user && (
          <Chip tone="green">
            <AnimatedNumber value={balanceCoins} className="tabular-nums" /> coins · ${userUSD.toFixed(2)}
          </Chip>
        )}
      </PageHeader>

      <ol className="bb-steps mb-8" aria-label="How cashing out works">
        <li><span>1</span> Pick a method</li>
        <li><span>2</span> Choose an amount</li>
        <li><span>3</span> Enter the address and confirm</li>
      </ol>

      {success && (
        <div role="status" className="bb-swap mb-6 flex items-start gap-3 rounded-xl border border-[rgba(66,216,160,0.4)] bg-[rgba(66,216,160,0.1)] p-4 text-[#42d8a0]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {!user && (
        <div className="bb-notice mb-8">
          <p><strong>Sign in to cash out.</strong> Your balance and withdrawal history appear here once you are signed in.</p>
          <button type="button" className="bb-cta-sm" onClick={() => { setAuthTab('login'); setIsAuthOpen(true); }}>Sign in</button>
        </div>
      )}

      <section className="mb-8">
        <Reveal as="h2" className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(113,63,225,0.9)]" />
          Cash
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {methods.filter((m) => m.category === 'cash').map((m, i) => renderMethodCard(m, i))}
        </div>
      </section>

      <section className="mb-8">
        <Reveal as="h2" className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(155,123,255,0.9)]" />
          Crypto
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {methods.filter((m) => m.category === 'crypto').map((m, i) => renderMethodCard(m, i))}
        </div>
      </section>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="g-card relative overflow-hidden p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-1 text-base font-bold text-white">Amounts for each method</h2>
          <p className="mb-4 text-sm text-zinc-400">The dollar value is always coins ÷ 1,000. The site adds no fee on top of it.</p>
          <div className="overflow-x-auto text-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-dark-border text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="pb-2 pr-4">Method</th>
                  <th className="pb-2 pr-4">Smallest</th>
                  <th className="pb-2">Largest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-zinc-300">
                {methods.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="py-2.5 pr-4 font-semibold text-white">{m.name}</td>
                    <td className="py-2.5 pr-4 tabular-nums">${m.amounts[0].usd.toFixed(2)} · {m.amounts[0].coins.toLocaleString()} coins</td>
                    <td className="py-2.5 tabular-nums">${m.amounts[m.amounts.length - 1].usd.toFixed(2)} · {m.amounts[m.amounts.length - 1].coins.toLocaleString()} coins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal i={1} className="g-card relative flex flex-col justify-between overflow-hidden p-5 sm:p-6">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
              <span className="icon-wrapper-secondary p-1.5"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
              Before you cash out
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Withdrawals are checked by hand. Using virtual machines, proxies or VPNs, or temporary emails to complete tasks is not allowed and can lead to a ban and a rejected withdrawal.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Check the address before you submit. A payout sent to a wrong address cannot be recovered by us.
            </p>
          </div>
        </Reveal>
      </div>

      {user && (
        <Reveal className="g-card p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
            <span className="icon-wrapper-gradient p-1.5"><History className="h-4 w-4" aria-hidden="true" /></span>
            Your withdrawals
          </h2>

          {historyError && (
            <div role="alert" className="bb-error mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{historyError}</span>
              <button type="button" className="bb-link" onClick={fetchHistory}>Retry</button>
            </div>
          )}

          {!historyError && withdrawals.length === 0 ? (
            <div className="bb-empty">
              <p className="text-sm font-bold text-zinc-300">No withdrawals yet</p>
              <p className="mt-1 text-sm text-zinc-400">Finish a few tasks on the Earn page, then come back to cash out.</p>
            </div>
          ) : !historyError && (
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
                      <td className="max-w-[11.25rem] truncate py-3 pr-4 font-mono text-xs text-zinc-400" title={w.payment_address}>{w.payment_address}</td>
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
      {selectedMethod && user && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Cash out with ${selectedMethod.name}`}>
            <div className="g-fade fixed inset-0 bg-[#04060c]/80 backdrop-blur-sm" onClick={() => !loading && setSelectedMethod(null)} />

            <div className="g-modal g-neon relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-2xl sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-white">
                <ArrowUpRight className="h-5 w-5 text-[#c3b2ff]" aria-hidden="true" />
                Cash out with {selectedMethod.name}
              </h2>
              <p className="mb-4 border-b border-dark-border pb-3 text-sm text-zinc-400">
                {selectedMethod.description}
              </p>

              {error && (
                <div role="alert" className="bb-error mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <fieldset>
                  <legend className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">2 · Amount</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMethod.amounts.map((amount) => {
                      const isSelected = selectedAmount?.usd === amount.usd;
                      const canAfford = balanceCoins >= amount.coins;
                      return (
                        <button
                          type="button"
                          key={amount.usd}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedAmount(amount)}
                          className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl border p-3 text-center transition-[background-color,border-color,box-shadow,transform] duration-150 active:scale-95 ${
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
                    3 · {selectedMethod.addressLabel}
                  </label>
                  <input
                    id="payout-address"
                    type={selectedMethod.type}
                    required
                    autoComplete="off"
                    placeholder={selectedMethod.placeholder}
                    value={paymentAddress}
                    onChange={(e) => setPaymentAddress(e.target.value)}
                    className="bb-input"
                  />
                </div>

                <dl className="bb-summary">
                  <div><dt>You send</dt><dd className="tabular-nums">{selectedAmount ? selectedAmount.coins.toLocaleString() : 0} coins</dd></div>
                  <div><dt>You receive</dt><dd className="tabular-nums">${selectedAmount ? selectedAmount.usd.toFixed(2) : '0.00'}</dd></div>
                  <div><dt>Balance after this</dt><dd className={`tabular-nums ${selectedAfter !== null && selectedAfter < 0 ? 'text-[#f17685]' : ''}`}>{selectedAfter !== null ? Math.max(selectedAfter, 0).toLocaleString() : balanceCoins.toLocaleString()} coins</dd></div>
                </dl>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setSelectedMethod(null)} disabled={loading} className="btn-gaming-secondary min-h-[3rem] flex-1 rounded-xl py-3 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || !selectedAmount} className="btn-gaming flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…</> : 'Submit request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />
    </div>
  );
}
