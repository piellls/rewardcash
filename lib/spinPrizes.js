// The spin prizes, in coins. One list for everything that needs it:
// - app/api/spin/route.js rolls a prize from it (the server decides, the browser only animates),
// - components/SpinWheel.js draws the wheel from it (same order, so prizeIndex lines up),
// - lib/db.js uses it in local mock mode.
//
// Odds: 95% of spins win less than 200 coins (10 or 50). The probabilities add up to exactly 1.
// Average win is about 85 coins per spin.
export const SPIN_PRIZES = [
  { coins: 10, probability: 0.6, label: '10', rarity: 'common' },
  { coins: 50, probability: 0.35, label: '50', rarity: 'common' },
  { coins: 250, probability: 0.034, label: '250', rarity: 'uncommon' },
  { coins: 1000, probability: 0.012, label: '1,000', rarity: 'rare' },
  { coins: 2500, probability: 0.003, label: '2,500', rarity: 'epic' },
  { coins: 10000, probability: 0.0009, label: '10,000', rarity: 'legendary' },
  { coins: 250000, probability: 0.0001, label: '250,000', rarity: 'mythic' },
];

// The biggest prize, for the texts on the Spin page.
export const TOP_SPIN_PRIZE = SPIN_PRIZES[SPIN_PRIZES.length - 1].coins;

// Picks a prize index from a number in [0, 1).
export function prizeIndexForRoll(roll) {
  let cumulative = 0;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    cumulative += SPIN_PRIZES[i].probability;
    if (roll < cumulative) return i;
  }
  return 0;
}
