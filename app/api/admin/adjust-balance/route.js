import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const auth = await authenticate(request, { admin: true });
    if (auth.error) return auth.error;

    const { targetUserId, amount } = await request.json();
    if (!targetUserId || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10_000_000) {
      return NextResponse.json({ error: 'Missing targetUserId or invalid amount.' }, { status: 400 });
    }

    const { data: profile, error } = await auth.sb.rpc('admin_adjust_balance', {
      p_user: targetUserId,
      p_amount: amount,
    });
    if (error) {
      const notFound = error.message.includes('user_not_found');
      return NextResponse.json(
        { error: notFound ? 'Target user profile not found.' : 'Failed to adjust balance.' },
        { status: notFound ? 404 : 500 }
      );
    }

    console.log(`[ADMIN] ${auth.user.id} adjusted ${targetUserId} by ${amount}`);
    return NextResponse.json({
      success: true,
      userId: targetUserId,
      balance: profile.balance_coins,
      totalEarned: profile.total_earned_coins,
    });
  } catch (err) {
    console.error('[ADMIN ADJUST BALANCE] Server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
