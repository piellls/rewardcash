import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public, read-only feed of real recent earnings + real totals for the landing page.
// Uses the service role on the server and returns only non-sensitive fields.
export const revalidate = 30;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ feed: [], stats: null });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const [feedRes, countRes, paidRes, usersRes] = await Promise.all([
      supabase
        .from('completed_offers')
        .select('id, provider, coins_earned, completed_at, profiles(username, avatar_url)')
        .not('offer_id', 'in', '("daily_spin","signup_spin")')
        .order('completed_at', { ascending: false })
        .limit(15),
      supabase.from('completed_offers').select('id', { count: 'exact', head: true }),
      supabase.from('withdrawals').select('amount_usd').eq('status', 'approved'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const feed = (feedRes.data || []).map((r) => ({
      id: r.id,
      username: r.profiles?.username || 'Member',
      avatar: r.profiles?.avatar_url || null,
      provider: r.provider,
      usd: (r.coins_earned || 0) / 1000, // cashout rate: 1,000 coins = $1
      at: r.completed_at,
    }));

    const paid = (paidRes.data || []).reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);

    return NextResponse.json({
      feed,
      stats: {
        offersCompleted: countRes.count || 0,
        paidUsd: paid,
        members: usersRes.count || 0,
      },
    });
  } catch (err) {
    console.error('[LIVE FEED]', err.message);
    return NextResponse.json({ feed: [], stats: null });
  }
}
