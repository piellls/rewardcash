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

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database service role key is not configured.' }, { status: 500 });
    }

    // Authenticate the user calling the API
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Strictly verify admin email
    if (user.email !== 'xpilalhamlawe@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, amount } = body;

    if (!targetUserId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing targetUserId or invalid amount.' }, { status: 400 });
    }

    // Fetch target user's current coins
    const { data: targetProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('balance_coins, total_earned_coins')
      .eq('id', targetUserId)
      .single();

    if (profileErr || !targetProfile) {
      return NextResponse.json({ error: 'Target user profile not found.' }, { status: 404 });
    }

    const currentBalance = targetProfile.balance_coins || 0;
    const currentTotal = targetProfile.total_earned_coins || 0;

    const nextBalance = Math.max(0, currentBalance + amount);
    const nextTotal = currentTotal + (amount > 0 ? amount : 0);

    // Perform update
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        balance_coins: nextBalance,
        total_earned_coins: nextTotal
      })
      .eq('id', targetUserId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      userId: targetUserId, 
      balance: nextBalance, 
      totalEarned: nextTotal 
    });

  } catch (err) {
    console.error('[ADMIN ADJUST BALANCE] Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
