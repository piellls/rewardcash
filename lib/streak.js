// Earning Streak: earn the daily goal in coins from offers, on consecutive days, and claim a bonus for each day.
//
// - A "day" is a UTC day. The day ends at 00:00 UTC (the page shows a countdown to it).
// - Only real offers count towards the goal. Spins and streak bonuses do not.
// - Day N of a streak pays STREAK_REWARDS[N - 1]. After day 7 the bonuses start again from day 1's amount
//   while the streak number keeps counting.
// - The goal can be met on a day and claimed later, as long as the streak is still alive. A day that is missed
//   ends the streak, and rewards that were not claimed are gone.
// - A claim is stored per calendar day (one row per user and day), so a day can never be paid twice,
//   whatever happens to the streak around it.
//
// This file is plain logic with no database in it, so the server route and the tests use the same code.

export const STREAK_DAILY_GOAL = 1000; // coins earned from offers per UTC day
export const STREAK_REWARDS = [80, 120, 240, 400, 500, 600, 800]; // coins for day 1..7 of a cycle
export const STREAK_CYCLE = STREAK_REWARDS.length;
export const STREAK_LOOKBACK_DAYS = 370; // how far back the server looks for the run of days

const DAY_MS = 24 * 60 * 60 * 1000;

export const rewardForDay = (dayNo) => STREAK_REWARDS[(dayNo - 1) % STREAK_CYCLE];

export const dayKey = (date) => date.toISOString().slice(0, 10);
export const addDays = (key, n) => dayKey(new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS));

// totals: [{ day: 'YYYY-MM-DD', coins }]  coins earned from offers on each UTC day
// claims: ['YYYY-MM-DD', ...] or [{ day }]  days whose bonus was already claimed
export function computeStreak({ totals = [], claims = [], now = new Date(), goal = STREAK_DAILY_GOAL } = {}) {
  const coinsByDay = new Map();
  for (const t of totals) coinsByDay.set(String(t.day).slice(0, 10), Number(t.coins) || 0);
  const claimed = new Set(claims.map((c) => String(typeof c === 'string' ? c : c.day).slice(0, 10)));

  const today = dayKey(now);
  const todayCoins = coinsByDay.get(today) || 0;
  const goalMet = todayCoins >= goal;

  // The run of days that met the goal. If today is not done yet it ends yesterday, and it is still alive.
  const anchor = goalMet ? today : addDays(today, -1);
  let achieved = 0;
  for (let d = anchor; achieved < STREAK_LOOKBACK_DAYS && (coinsByDay.get(d) || 0) >= goal; d = addDays(d, -1)) achieved += 1;
  const runStart = achieved > 0 ? addDays(anchor, -(achieved - 1)) : today;

  // The streak day that today counts for.
  const workingDay = goalMet ? achieved : achieved + 1;

  const dayInfo = (dayNo) => {
    const date = addDays(runStart, dayNo - 1);
    let status = 'locked';
    if (dayNo <= achieved) status = claimed.has(date) ? 'claimed' : 'claimable';
    else if (dayNo === workingDay) status = 'today';
    return { dayNo, date, reward: rewardForDay(dayNo), status };
  };

  // Everything that can be claimed right now, oldest first.
  const claimable = [];
  for (let n = 1; n <= achieved; n++) {
    const info = dayInfo(n);
    if (info.status === 'claimable') claimable.push(info);
  }

  // The seven cards to show: the cycle that holds the oldest unclaimed day, or else today's day.
  const focusDay = claimable.length ? claimable[0].dayNo : Math.max(1, workingDay);
  const cycleStart = Math.floor((focusDay - 1) / STREAK_CYCLE) * STREAK_CYCLE;
  const days = Array.from({ length: STREAK_CYCLE }, (_, i) => dayInfo(cycleStart + i + 1));

  return {
    goal,
    todayKey: today,
    todayCoins,
    remaining: Math.max(0, goal - todayCoins),
    goalMet,
    achieved,
    workingDay,
    runStart,
    msLeft: Date.parse(`${addDays(today, 1)}T00:00:00Z`) - now.getTime(),
    days,
    claimable,
    claimableCoins: claimable.reduce((sum, c) => sum + c.reward, 0),
  };
}
