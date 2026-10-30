import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Public top earners for the leaderboard page: real members only, no sensitive fields.
// Uses the service role on the server because profile rows are private to their owners.
export const revalidate = 60;

export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ players: [] });

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('username, avatar_url, total_earned_coins, role, is_banned')
      .gt('total_earned_coins', 0)
      .order('total_earned_coins', { ascending: false })
      .limit(40);
    if (error) throw error;

    const players = (data || [])
      .filter((p) => !p.is_banned && p.role !== 'admin' && p.username)
      .slice(0, 10)
      .map((p) => ({
        username: p.username,
        avatar_url: p.avatar_url || null,
        total_earned_coins: p.total_earned_coins || 0,
      }));

    return NextResponse.json({ players });
  } catch (err) {
    console.error('[LEADERBOARD]', err.message);
    return NextResponse.json({ players: [] });
  }
}
