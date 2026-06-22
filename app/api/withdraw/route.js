import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    const body = await request.json();
    const { amount_usd, coins_spent, payment_method, payment_address } = body;

    // Check mock mode
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        mode: 'mock',
        message: 'Withdrawal processed in Mock Sandbox Mode.'
      });
    }

    // Authenticate user server-side using token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing session token.' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token.' }, { status: 401 });
    }

    // Validation
    const amount = parseFloat(amount_usd);
    const coins = parseInt(coins_spent);

    if (isNaN(amount) || isNaN(coins) || coins <= 0 || amount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal parameters.' }, { status: 400 });
    }

    if (!payment_address || !payment_method) {
      return NextResponse.json({ error: 'Missing payment method or address.' }, { status: 400 });
    }

    // 1. Fetch current profile coin balance to ensure they have enough coins
    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('balance_coins')
      .eq('id', user.id)
      .single();

    if (profError || !profile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    if (profile.balance_coins < coins) {
      return NextResponse.json({ error: 'Insufficient coins balance!' }, { status: 400 });
    }

    // 2. Deduct coins from profile
    const newBalance = profile.balance_coins - coins;
    const { error: balanceError } = await supabaseAdmin
      .from('profiles')
      .update({ balance_coins: newBalance })
      .eq('id', user.id);

    if (balanceError) {
      console.error('[WITHDRAW ERROR] Failed to deduct user coins:', balanceError);
      return NextResponse.json({ error: 'Failed to update balance.' }, { status: 500 });
    }

    // 3. Create the withdrawal request record
    const { data: withdrawal, error: withdrawError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount_usd: amount,
        coins_spent: coins,
        payment_method,
        payment_address,
        status: 'pending'
      })
      .select()
      .single();

    if (withdrawError) {
      console.error('[WITHDRAW ERROR] Failed to log withdrawal request:', withdrawError);
      // Rollback balance (refund coins)
      await supabaseAdmin
        .from('profiles')
        .update({ balance_coins: profile.balance_coins })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Failed to create withdrawal request.' }, { status: 500 });
    }

    console.log(`[WITHDRAW SUCCESS] User ${user.email} withdrew $${amount} (${coins} coins) via ${payment_method}`);
    return NextResponse.json({ success: true, data: withdrawal });

  } catch (err) {
    console.error('[WITHDRAW EXCEPTION]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
