import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mpesaService } from '@/lib/mpesa';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phoneNumber, amount } = body;

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Order ID, phone number, and amount are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!mpesaService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use format: 0712345678 or +254712345678' },
        { status: 400 }
      );
    }

    // Create a server-side Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify order exists and belongs to authenticated user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, payment_status, customer_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists for this order
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('order_id', orderId)
      .single();

    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed for this order' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = mpesaService.formatPhoneNumber(phoneNumber);

    // Initiate M-Pesa STK Push
    const stkResponse = await mpesaService.initiateSTKPush({
      phoneNumber: formattedPhone,
      amount: parseFloat(amount),
      accountReference: order.order_number,
      transactionDesc: `Payment for Order ${order.order_number}`
    });

    // Create or update payment record
    const paymentData = {
      order_id: orderId,
      merchant_request_id: stkResponse.merchantRequestId,
      checkout_request_id: stkResponse.checkoutRequestId,
      response_code: stkResponse.responseCode,
      response_description: stkResponse.responseDescription,
      customer_message: stkResponse.customerMessage,
      phone_number: formattedPhone,
      amount: parseFloat(amount),
      status: stkResponse.responseCode === '0' ? 'processing' : 'failed'
    };

    if (existingPayment) {
      // Update existing payment
      const { error: updateError } = await supabaseAdmin
        .from('payments')
        .update(paymentData)
        .eq('id', existingPayment.id);

      if (updateError) {
        console.error('Failed to update payment:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment record' },
          { status: 500 }
        );
      }
    } else {
      // Create new payment
      const { error: insertError } = await supabaseAdmin
        .from('payments')
        .insert([paymentData]);

      if (insertError) {
        console.error('Failed to create payment:', insertError);
        return NextResponse.json(
          { error: 'Failed to create payment record' },
          { status: 500 }
        );
      }
    }

    // Update order payment status if STK push was successful
    if (stkResponse.responseCode === '0') {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'processing',
          payment_method: 'mpesa'
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      message: stkResponse.customerMessage,
      checkoutRequestId: stkResponse.checkoutRequestId,
      merchantRequestId: stkResponse.merchantRequestId
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Create a server-side Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get payment status
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        phoneNumber: payment.phone_number,
        checkoutRequestId: payment.checkout_request_id,
        createdAt: payment.created_at,
        mpesaReceiptNumber: payment.mpesa_receipt_number,
        transactionDate: payment.transaction_date
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}