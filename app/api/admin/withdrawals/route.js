import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';

// List every withdrawal request (newest first) for the admin panel.
export async function GET(request) {
  const auth = await authenticate(request, { admin: true });
  if (auth.error) return auth.error;

  const { data, error } = await auth.sb
    .from('withdrawals')
    .select('id, user_id, amount_usd, coins_spent, payment_method, payment_address, status, created_at, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[ADMIN WITHDRAWALS]', error);
    return NextResponse.json({ error: 'Failed to load withdrawals.' }, { status: 500 });
  }

  return NextResponse.json(data.map(({ profiles, ...w }) => ({ ...w, username: profiles?.username || 'Unknown' })));
}

// Approve or reject one pending withdrawal. Rejecting gives the coins back.
export async function POST(request) {
  try {
    const auth = await authenticate(request, { admin: true });
    if (auth.error) return auth.error;

    const { id, status } = await request.json();
    if (!id || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Missing id or invalid status.' }, { status: 400 });
    }

    const { data, error } = await auth.sb.rpc('resolve_withdrawal', { p_id: id, p_status: status });
    if (error) {
      const notPending = error.message.includes('not_pending');
      return NextResponse.json(
        { error: notPending ? 'This withdrawal was already handled.' : 'Failed to update withdrawal.' },
        { status: notPending ? 409 : 500 }
      );
    }

    console.log(`[ADMIN] ${auth.user.id} marked withdrawal ${id} as ${status}`);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[ADMIN WITHDRAWALS] Server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
