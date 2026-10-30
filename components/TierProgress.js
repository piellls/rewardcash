'use client';

import { Percent } from 'lucide-react';
import { COINS_PER_USD } from '@/lib/cashout';
import { TIERS, tierIndex, formatUsd } from '@/lib/affiliate';

// The signed-in user's own step this month: the rate they are on now, how much their friends have earned
// and how far they are from the next step. `month` is { friendsCoins, paidCoins } from db.getReferralMonth.
export default function TierProgress({ month }) {
  const usd = month.friendsCoins / COINS_PER_USD;
  const index = tierIndex(usd);
  const tier = TIERS[index];
  const next = TIERS[index + 1] || null;
  const fraction = next ? Math.min(1, Math.max(0, (usd - tier.from) / (next.from - tier.from))) : 1;

  // The steps start again on the 1st (UTC)
  const now = new Date();
  const resets = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

  return (
    <div className="g-card g-spot p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <span className="icon-wrapper-primary h-11 w-11"><Percent className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <div className="text-3xl font-extrabold tabular-nums text-white">{tier.rate}%</div>
            <div className="text-sm text-zinc-400">Your rate this month</div>
          </div>
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-zinc-400">Friends earned <strong className="font-bold tabular-nums text-white">{formatUsd(usd, 2)}</strong> so far</span>
            <span className="shrink-0 font-bold tabular-nums text-[#c3b2ff]">{next ? `${next.rate}% at ${formatUsd(next.from)}` : 'Top step'}</span>
          </div>
          <div
            role="progressbar"
            aria-label={next ? `Progress to ${next.rate}%` : 'Top step reached'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fraction * 100)}
            className="mt-2 h-2.5 overflow-hidden rounded-full border border-[var(--bb-border)] bg-[#1c2540]"
          >
            <div
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#4597ff] to-[#7854f7] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${fraction})` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--bb-subtle)]">
            {next ? <>{formatUsd(next.from - usd, 2)} more to go. </> : null}
            Steps start again at {TIERS[0].rate}% on {resets}.
          </p>
        </div>
      </div>
    </div>
  );
}
