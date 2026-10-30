import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    const now = new Date().toISOString();
    const { error } = await auth.sb.from('profiles').update({ last_seen_at: now }).eq('id', auth.user.id);
    if (error) {
      console.error('[HEARTBEAT ERROR]:', error);
      return NextResponse.json({ error: 'Failed to update presence.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    console.error('[HEARTBEAT ERROR]:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
