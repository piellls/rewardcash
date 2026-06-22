import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client using service role key (bypasses RLS to write to database)
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Extract parameters supporting multiple naming conventions from different CPA networks
  const click_id = searchParams.get('click_id') || searchParams.get('subid') || searchParams.get('user_id') || searchParams.get('userId');
  const payoutStr = searchParams.get('payout') || searchParams.get('amount') || '0';
  const coinsStr = searchParams.get('coins');
  const provider = searchParams.get('provider') || searchParams.get('network') || 'cpalead';
  const secret = searchParams.get('secret') || searchParams.get('password');

  // Log incoming postback request for debugging
  console.log(`[POSTBACK RECEIVED] click_id: ${click_id}, payout: ${payoutStr}, coins: ${coinsStr}, provider: ${provider}`);

  // Validation
  if (!click_id) {
    return NextResponse.json({ error: 'Missing click_id / tracking user parameter.' }, { status: 400 });
  }

  const payout = parseFloat(payoutStr);
  
  // Calculate coins if not explicitly passed: $1.00 USD = 1000 coins
  const coinsEarned = coinsStr ? parseInt(coinsStr) : Math.round(payout * 1000);

  if (isNaN(payout) || isNaN(coinsEarned) || coinsEarned <= 0) {
    return NextResponse.json({ error: 'Invalid payout or coin amounts.' }, { status: 400 });
  }

  // Check if we are in mock mode (missing Supabase configuration)
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({
      success: true,
      mode: 'mock',
      message: 'Supabase credentials missing. Postback received and validated in Mock Sandbox Mode.',
      data: {
        userId: click_id,
        payout,
        coinsEarned,
        provider
      }
    });
  }

  try {
    // 1. Check if user profile exists
    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('balance_coins, total_earned_coins')
      .eq('id', click_id)
      .single();

    if (profError || !profile) {
      console.error('[POSTBACK ERROR] User profile not found in Supabase:', click_id);
      return NextResponse.json({ error: 'User profile matching click_id does not exist.' }, { status: 404 });
    }

    // 2. Log completion in completed_offers table
    const { error: logError } = await supabaseAdmin
      .from('completed_offers')
      .insert({
        user_id: click_id,
        offer_id: 'cpa_network_offer',
        provider,
        payout_usd: payout,
        coins_earned: coinsEarned,
        click_id: click_id
      });

    if (logError) {
      console.error('[POSTBACK ERROR] Failed to log completed offer:', logError);
      return NextResponse.json({ error: 'Failed to record completion log.' }, { status: 500 });
    }

    // 3. Update user profile balance (increment balance_coins and total_earned_coins)
    const newBalance = profile.balance_coins + coinsEarned;
    const newTotal = profile.total_earned_coins + coinsEarned;

    const { error: updError } = await supabaseAdmin
      .from('profiles')
      .update({
        balance_coins: newBalance,
        total_earned_coins: newTotal
      })
      .eq('id', click_id);

    if (updError) {
      console.error('[POSTBACK ERROR] Failed to credit coins to user profile:', updError);
      return NextResponse.json({ error: 'Failed to update user profile balance.' }, { status: 500 });
    }

    console.log(`[POSTBACK SUCCESS] Credited ${coinsEarned} coins to user ID: ${click_id}`);
    
    // Return success to the CPA network (networks like CPALead check for positive responses like 1 or OK)
    return new Response('1', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (err) {
    console.error('[POSTBACK EXCEPTION]', err);
    return NextResponse.json({ error: 'Internal server exception.' }, { status: 500 });
  }
}
