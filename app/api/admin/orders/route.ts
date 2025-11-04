import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_method,
      delivery_county,
      subtotal,
      delivery_fee,
      total,
      status,
      payment_method,
      payment_status,
      notes,
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        product_sku,
        quantity,
        unit_price,
        total_price,
        created_at
      ),
      payments (
        id,
        order_id,
        amount,
        phone_number,
        merchant_request_id,
        checkout_request_id,
        status,
        response_code,
        response_description,
        customer_message,
        result_code,
        result_desc,
        callback_metadata,
        mpesa_receipt_number,
        transaction_date,
        payment_method,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...update } = body;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}