import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, payment_status, customer_phone')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check existing payment
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('order_id', orderId)
      .limit(1)
      .maybeSingle();

    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json({ error: 'Payment already completed for this order' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const paymentRecord: any = {
      order_id: orderId,
      amount: order.total || 0,
      phone_number: order.customer_phone || null,
      status: 'completed',
      payment_method: 'cash',
      customer_message: 'Payment confirmed in cash by admin',
      result_desc: 'Paid in cash',
      transaction_date: now,
      created_at: now,
      updated_at: now
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('payments')
      .insert([paymentRecord])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert cash payment:', insertError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Update order payment status and method
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'completed', payment_method: 'cash', updated_at: now })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order after cash payment:', updateError);
      // Not critical to rollback payment here, but inform caller
      return NextResponse.json({ error: 'Payment created but failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment: inserted });
  } catch (error) {
    console.error('Error creating cash payment:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
