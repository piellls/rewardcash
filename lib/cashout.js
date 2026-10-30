// Server-side source of truth for withdrawals: the coin amounts each method accepts.
// 1,000 coins = $1.00. Keep in sync with the options shown on app/cashout/page.js.
export const COINS_PER_USD = 1000;

// What members are credited for an offer: every $1.00 the network pays us is 450 coins ($0.45 of cashout value).
// The postback pays by this rate and the Earn page shows it, so keep them on the same number.
export const COINS_PER_PAYOUT_USD = 450;

export const PAYOUT_OPTIONS = {
  paypal: [1000, 5000, 10000, 25000, 50000],
  visa: [5000, 10000, 25000, 50000],
  btc: [10000, 25000, 50000, 100000],
  ltc: [2000, 5000, 10000, 20000],
  eth: [5000, 10000, 25000, 50000],
  sol: [5000, 10000, 25000, 50000],
};
