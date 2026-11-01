import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';
import { computeStreak, STREAK_LOOKBACK_DAYS } from '@/lib/streak';

// The Earning Streak. All the rules are in lib/streak.js; the database part is earning_streak.sql.
//   GET  -> the member's streak today
//   POST { day } -> claim the bonus for streak day N (the server checks it and decides the amount)

// Errors that only mean "earning_streak.sql has not been run yet". The section then stays hidden.
const NOT_SET_UP = new Set(['PGRST202', 'PGRST205', '42883', '42P01']);
const isNotSetUp = (error) => NOT_SET_UP.has(error?.code) || /could not find the (function|table)/i.test(error?.message || '');

async function loadStreak(sb, userId) {
  const totals = await sb.rpc('streak_daily_totals', { p_user: userId, p_days: STREAK_LOOKBACK_DAYS });
  if (totals.error) return { error: totals.error };
  const claims = await sb
    .from('streak_claims')
    .select('day')
    .eq('user_id', userId)
    .order('day', { ascending: false })
    .limit(STREAK_LOOKBACK_DAYS + 5);
  if (claims.error) return { error: claims.error };
  return { streak: computeStreak({ totals: totals.data || [], claims: claims.data || [] }) };
}

// What the page needs, nothing more.
function publicView(s) {
  return {
    goal: s.goal,
    todayCoins: s.todayCoins,
    remaining: s.remaining,
    goalMet: s.goalMet,
    achieved: s.achieved,
    workingDay: s.workingDay,
    msLeft: s.msLeft,
    days: s.days,
    claimableCount: s.claimable.length,
    claimableCoins: s.claimableCoins,
  };
}

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    const res = await loadStreak(auth.sb, auth.user.id);
    if (res.error) {
      if (isNotSetUp(res.error)) return NextResponse.json({ success: true, available: false });
      console.error('[STREAK GET ERROR]', res.error.message);
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, available: true, streak: publicView(res.streak) });
  } catch (err) {
    console.error('[STREAK GET ERROR]', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;
    const { sb, user } = auth;

    let body = {};
    try { body = await request.json(); } catch { /* no body */ }
    const dayNo = Number(body?.day);
    if (!Number.isInteger(dayNo) || dayNo < 1) {
      return NextResponse.json({ error: 'Invalid day.' }, { status: 400 });
    }

    const res = await loadStreak(sb, user.id);
    if (res.error) {
      if (isNotSetUp(res.error)) return NextResponse.json({ error: 'The Earning Streak is not available yet.' }, { status: 503 });
      console.error('[STREAK POST ERROR]', res.error.message);
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }

    // Only a day that was reached and not claimed yet can be claimed, and the amount comes from the server.
    const target = res.streak.claimable.find((c) => c.dayNo === dayNo);
    if (!target) {
      return NextResponse.json({ error: 'This reward is not available to claim.' }, { status: 400 });
    }

    const claim = await sb.rpc('claim_streak_day', {
      p_user: user.id,
      p_day: target.date,
      p_day_no: target.dayNo,
      p_coins: target.reward,
    });
    if (claim.error) {
      if (claim.error.code === '23505') {
        return NextResponse.json({ error: 'This reward was already claimed.' }, { status: 409 });
      }
      if (/streak_unavailable/.test(claim.error.message || '')) {
        return NextResponse.json({ error: 'This account cannot claim rewards.' }, { status: 403 });
      }
      console.error('[STREAK CLAIM ERROR]', claim.error.message);
      return NextResponse.json({ error: 'Could not claim the reward.' }, { status: 500 });
    }

    const fresh = await loadStreak(sb, user.id);
    return NextResponse.json({
      success: true,
      coins: target.reward,
      dayNo: target.dayNo,
      streak: fresh.streak ? publicView(fresh.streak) : null,
      profile: claim.data,
    });
  } catch (err) {
    console.error('[STREAK POST ERROR]', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
