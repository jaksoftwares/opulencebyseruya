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

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch newsletter subscribers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}