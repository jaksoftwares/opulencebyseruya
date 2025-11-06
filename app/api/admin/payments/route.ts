import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  try {
    console.log('Fetching payments from database...');

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        order_id,
        merchant_request_id,
        checkout_request_id,
        response_code,
        response_description,
        customer_message,
        result_code,
        result_desc,
        callback_metadata,
        mpesa_receipt_number,
        transaction_date,
        phone_number,
        amount,
        status,
        payment_method,
        created_at,
        updated_at,
        orders(
          order_number,
          customer_name,
          customer_email,
          customer_phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} payments in database`);

    const transformedData = data?.map(payment => ({
      payment_id: payment.id,
      order_id: payment.order_id,
      merchant_request_id: payment.merchant_request_id,
      checkout_request_id: payment.checkout_request_id,
      response_code: payment.response_code,
      response_description: payment.response_description,
      customer_message: payment.customer_message,
      result_code: payment.result_code,
      result_desc: payment.result_desc,
      callback_metadata: payment.callback_metadata,
      mpesa_receipt_number: payment.mpesa_receipt_number,
      transaction_date: payment.transaction_date,
      phone_number: payment.phone_number,
      amount: payment.amount,
      status: payment.status,
      payment_method: payment.payment_method,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      order_number: (payment.orders as any)?.order_number || null,
      customer_name: (payment.orders as any)?.customer_name || null,
      customer_email: (payment.orders as any)?.customer_email || null,
      customer_phone: (payment.orders as any)?.customer_phone || null,
    })) || [];

    console.log(`Returning ${transformedData.length} transformed payments`);
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, updated_at } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Payment ID and status are required' }, { status: 400 });
    }

    console.log(`Updating payment ${id} status to ${status}`);

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        status,
        updated_at: updated_at || new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Payment status updated successfully:', data);
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    console.error('Unexpected error updating payment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
