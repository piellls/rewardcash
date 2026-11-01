import { NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { db } from '@/lib/db';
import { authenticate } from '@/lib/supabaseAdmin';
import { SPIN_PRIZES, prizeIndexForRoll } from '@/lib/spinPrizes';

// The prizes and their odds live in lib/spinPrizes.js (95% of spins win less than 200 coins).
function rollPrize() {
  return prizeIndexForRoll(randomInt(0, 1_000_000) / 1_000_000);
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
