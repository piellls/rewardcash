import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';
import { COINS_PER_USD, PAYOUT_OPTIONS } from '@/lib/cashout';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;
    const { sb, user } = auth;

    const body = await request.json();
    const method = String(body.payment_method || '');
    const address = String(body.payment_address || '').trim();
    const coins = Number(body.coins_spent);

    // The dollar amount is never taken from the browser: it comes from the coins.
    if (!PAYOUT_OPTIONS[method]?.includes(coins)) {
      return NextResponse.json({ error: 'Invalid withdrawal amount for this method.' }, { status: 400 });
    }
    if (address.length < 3 || address.length > 200) {
      return NextResponse.json({ error: 'Missing or invalid payment address.' }, { status: 400 });
    }

    const { data: withdrawal, error } = await sb.rpc('create_withdrawal', {
      p_user: user.id,
      p_coins: coins,
      p_amount: coins / COINS_PER_USD,
      p_method: method,
      p_address: address,
    });

    if (error) {
      if (error.message.includes('insufficient_balance_or_banned')) {
        return NextResponse.json({ error: 'Insufficient coins balance!' }, { status: 400 });
      }
      console.error('[WITHDRAW ERROR]', error);
      return NextResponse.json({ error: 'Failed to create withdrawal request.' }, { status: 500 });
    }

    console.log(`[WITHDRAW SUCCESS] user ${user.id} withdrew ${coins} coins via ${method}`);
    return NextResponse.json({ success: true, data: withdrawal });
  } catch (err) {
    console.error('[WITHDRAW EXCEPTION]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
