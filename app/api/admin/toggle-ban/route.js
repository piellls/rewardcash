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

    // Authenticate the caller
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // strictly verify admin email
    if (user.email !== 'xpilalhamlawe@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, isBanned } = body;

    if (!targetUserId || typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'Missing targetUserId or invalid isBanned flag.' }, { status: 400 });
    }

    // Perform update in profiles table
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', targetUserId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      userId: targetUserId, 
      isBanned 
    });

  } catch (err) {
    console.error('[ADMIN TOGGLE BAN] Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
