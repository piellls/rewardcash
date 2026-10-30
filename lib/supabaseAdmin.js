import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Server-only client that uses the service role key (bypasses RLS). Never import this in a client component.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const fail = (error, status) => ({ error: NextResponse.json({ error }, { status }) });

// Checks the Bearer token and loads the caller's profile.
// Banned users are refused. With { admin: true } only profiles.role = 'admin' passes.
// Returns { sb, user, profile } or { error: Response } that the route should return as is.
export async function authenticate(request, { admin = false } = {}) {
  const sb = getSupabaseAdmin();
  if (!sb) return fail('Server is not configured.', 500);

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return fail('Unauthorized: missing session token.', 401);

  const { data: { user } = {}, error: authError } = await sb.auth.getUser(token);
  if (authError || !user) return fail('Unauthorized: invalid session token.', 401);

  const { data: profile } = await sb
    .from('profiles')
    .select('id, role, is_banned')
    .eq('id', user.id)
    .single();
  if (!profile) return fail('User profile not found.', 404);

  if (admin) {
    if (profile.role !== 'admin') return fail('Admin access required.', 403);
  } else if (profile.is_banned) {
    return fail('Your account is banned.', 403);
  }
  return { sb, user, profile };
}
