import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Supabase admin keys not configured on server.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const emailToReset = 'xpilalhamlawe@gmail.com';

  try {
    // 1. Get the auth user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find(u => u.email?.toLowerCase() === emailToReset.toLowerCase());
    
    if (user) {
      // Delete user from profiles table first
      await supabaseAdmin.from('profiles').delete().eq('id', user.id);
      
      // Delete user from auth.users
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;

      return NextResponse.json({ 
        success: true, 
        message: `Successfully deleted existing user ${emailToReset} from Supabase. You can now register it brand new with your password!` 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: `User ${emailToReset} does not exist. You can register it brand new now!` 
      });
    }
  } catch (error) {
    console.error('[ADMIN RESET ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to reset admin user' }, { status: 500 });
  }
}
