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
      customer_id,
      order_number
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch customer details separately
  const paymentsWithCustomers = await Promise.all(
    data.map(async (payment) => {
      if (payment.customer_id) {
        const { data: customer, error: customerError } = await supabaseAdmin
          .from('users')
          .select('full_name, email, phone')
          .eq('id', payment.customer_id)
          .single();

        if (!customerError && customer) {
          return { ...payment, users: customer };
        }
      }
      return payment;
    })
  );

  return NextResponse.json(paymentsWithCustomers);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...update } = body;

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update(update)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}