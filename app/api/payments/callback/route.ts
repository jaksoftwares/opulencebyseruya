import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

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

    const { Body } = callbackData;

    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure');
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = Body.stkCallback;

    // Find the payment record
    const { data: payment, error: findError } = await supabaseAdmin
      .from('payments')
      .select('id, order_id, amount')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (findError || !payment) {
      console.error('Payment record not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    let updateData: any = {
      result_code: ResultCode.toString(),
      result_desc: ResultDesc,
      callback_metadata: CallbackMetadata || null
    };

    // If payment was successful
    if (ResultCode === 0 && CallbackMetadata) {
      const metadata = CallbackMetadata.Item;

      // Extract transaction details
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      updateData.status = 'completed';
      updateData.mpesa_receipt_number = mpesaReceiptNumber;
      updateData.transaction_date = transactionDate ? new Date(transactionDate) : new Date();
      updateData.phone_number = phoneNumber;

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_reference: mpesaReceiptNumber,
          payment_confirmed_at: new Date()
        })
        .eq('id', payment.order_id);

      console.log(`Payment completed for order ${payment.order_id}, receipt: ${mpesaReceiptNumber}`);

    } else {
      // Payment failed
      updateData.status = 'failed';

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed'
        })
        .eq('id', payment.order_id);

      console.log(`Payment failed for order ${payment.order_id}, reason: ${ResultDesc}`);
    }

    // Update payment record
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .eq('checkout_request_id', CheckoutRequestID);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}