// Referral commission ladder.
//
// A referrer's rate depends on how much ALL of their friends earned together during the current calendar
// month (UTC), and that rate applies to everything the friends earned that month. It starts again at the
// lowest step on the 1st.
//
// `from` is in dollars of friend earnings (1,000 coins = $1.00).
//
// The database pays the real commission with the same table (public.referral_rate in tiered_referrals.sql,
// thresholds there are in coins). If you change a number here, change it there too. scripts/check-affiliate-sync.mjs
// compares the two.
import { COINS_PER_USD } from './cashout';

export const TIERS = [
  { rate: 5, from: 0 },
  { rate: 6, from: 50 },
  { rate: 7, from: 100 },
  { rate: 8, from: 200 },
  { rate: 9, from: 400 },
  { rate: 10, from: 700 },
  { rate: 12, from: 1200 },
  { rate: 13, from: 2000 },
  { rate: 14, from: 3500 },
  { rate: 15, from: 5000 },
];

export const MIN_RATE = TIERS[0].rate;
export const MAX_RATE = TIERS[TIERS.length - 1].rate;

// Index of the step a monthly total (in dollars) falls on.
export function tierIndex(monthlyUsd) {
  const usd = Number(monthlyUsd) || 0;
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (usd >= TIERS[i].from) idx = i;
  return idx;
}

export const tierIndexFromCoins = (coins) => tierIndex((Number(coins) || 0) / COINS_PER_USD);

// What a referrer would earn per month from `friends` people who each earn `perFriendUsd` a month.
export function estimate(friends, perFriendUsd) {
  const volume = Math.max(0, friends) * Math.max(0, perFriendUsd);
  const index = tierIndex(volume);
  const rate = TIERS[index].rate;
  const next = TIERS[index + 1] || null;
  return {
    volume,
    index,
    rate,
    commission: Math.floor(volume * rate) / 100, // whole cents, rounded down like the database does for coins
    next,
    toNext: next ? next.from - volume : 0,
  };
}

// "$1,200" / "$1.2k" style label for chart axes.
export function shortUsd(n) {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `$${n}`;
}

export const formatUsd = (n, decimals = 0) =>
  `$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
