import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const auth = await authenticate(request, { admin: true });
    if (auth.error) return auth.error;

    const { targetUserId, isBanned } = await request.json();
    if (!targetUserId || typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'Missing targetUserId or invalid isBanned flag.' }, { status: 400 });
    }

    const { error } = await auth.sb.from('profiles').update({ is_banned: isBanned }).eq('id', targetUserId);
    if (error) {
      console.error('[ADMIN TOGGLE BAN]', error);
      return NextResponse.json({ error: 'Failed to update ban status.' }, { status: 500 });
    }

    console.log(`[ADMIN] ${auth.user.id} set is_banned=${isBanned} for ${targetUserId}`);
    return NextResponse.json({ success: true, userId: targetUserId, isBanned });
  } catch (err) {
    console.error('[ADMIN TOGGLE BAN] Server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
