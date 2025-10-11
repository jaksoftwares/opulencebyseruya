import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    const customers = data.users.map(user => {
      const meta = user.user_metadata || {};
      return {
        id: user.id,
        email: user.email || '',
        full_name: meta.full_name || '',
        phone: meta.phone || '',
        role: 'user' as const,
        is_active: true,
        created_at: user.created_at,
      };
    });

    return NextResponse.json(customers, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}