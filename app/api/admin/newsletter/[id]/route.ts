import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { is_active } = await request.json();

    const updateData: any = { is_active };
    if (!is_active) {
      updateData.unsubscribed_at = new Date().toISOString();
    } else {
      updateData.unsubscribed_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to update subscriber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Subscriber deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete subscriber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}