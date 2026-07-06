import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    const { type } = body; // 'daily' or 'signup'

    if (!type || (type !== 'daily' && type !== 'signup')) {
      return NextResponse.json({ error: 'Invalid claim type' }, { status: 400 });
    }

    // Authenticate
    const supabaseAdmin = getSupabaseAdmin();
    let userId = null;

    if (!supabaseAdmin) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Missing session token.' }, { status: 401 });
      }
      userId = token; // In mock mode, the token is the mock user ID
    } else {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Missing session token.' }, { status: 401 });
      }
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: Invalid session token.' }, { status: 401 });
      }
      userId = user.id;
    }

    const result = await db.claimSpin(userId, type, supabaseAdmin);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[SPIN ROUTE ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 400 });
  }
}
