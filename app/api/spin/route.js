import { NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { db } from '@/lib/db';
import { authenticate } from '@/lib/supabaseAdmin';

// Probabilities add up to 1. Keep in sync with the prizes shown on app/spin/page.js.
const SPIN_PRIZES = [
  { coins: 10, probability: 0.50, label: '$0.01', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.1)' },
  { coins: 50, probability: 0.30, label: '$0.05', rarity: 'common', border: '#3f3f46', bg: 'rgba(63,63,70,0.1)' },
  { coins: 250, probability: 0.14, label: '$0.25', rarity: 'uncommon', border: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { coins: 1000, probability: 0.045, label: '$1.00', rarity: 'rare', border: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { coins: 2500, probability: 0.012, label: '$2.50', rarity: 'epic', border: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { coins: 10000, probability: 0.0029, label: '$10.00', rarity: 'legendary', border: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  { coins: 250000, probability: 0.0001, label: '$250.00', rarity: 'mythic', border: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
];

function rollPrize() {
  const roll = randomInt(0, 1_000_000) / 1_000_000;
  let cumulative = 0;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    cumulative += SPIN_PRIZES[i].probability;
    if (roll < cumulative) return i;
  }
  return 0;
}

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;
    const { sb, user } = auth;

    const { type } = await request.json();
    if (type !== 'daily' && type !== 'signup') {
      return NextResponse.json({ error: 'Invalid claim type' }, { status: 400 });
    }

    const prizeIndex = rollPrize();
    const prize = SPIN_PRIZES[prizeIndex];

    let result;
    if (type === 'daily') {
      result = await sb.rpc('claim_daily_spin', { p_user: user.id, p_coins: prize.coins });
      if (result.error) {
        return NextResponse.json({ error: 'Daily spin is on cooldown. Come back in 24 hours.' }, { status: 400 });
      }
    } else {
      const state = await db.getSignupBonusState(user.id, null, sb);
      const allowed = (state.claimedSpins || 0) + (state.claimsLeft || 0);
      result = await sb.rpc('claim_signup_spin', { p_user: user.id, p_coins: prize.coins, p_allowed: allowed });
      if (result.error) {
        return NextResponse.json({ error: 'No sign-up spins left to claim.' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, prize, prizeIndex, profile: result.data });
  } catch (err) {
    console.error('[SPIN ROUTE ERROR]', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    const signup = await db.getSignupBonusState(auth.user.id, null, auth.sb);
    return NextResponse.json({ success: true, signup });
  } catch (err) {
    console.error('[SPIN GET ROUTE ERROR]', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
