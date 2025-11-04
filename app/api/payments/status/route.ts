import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mpesaService } from '@/lib/mpesa';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'Checkout Request ID is required' },
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

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment is still processing, query M-Pesa for status
    if (payment.status === 'processing') {
      try {
        const statusResponse = await mpesaService.querySTKPushStatus(checkoutRequestId);
        console.log('M-Pesa status query response:', statusResponse);

        // Update payment status based on query response
        if (statusResponse.ResponseCode === '0') {
          const resultCode = statusResponse.ResultCode;

          if (resultCode === '0') {
            // Payment successful
            await supabaseAdmin
              .from('payments')
              .update({
                status: 'completed',
                result_code: resultCode.toString(),
                result_desc: statusResponse.ResultDesc
              })
              .eq('checkout_request_id', checkoutRequestId);

            // Update order
            await supabaseAdmin
              .from('orders')
              .update({
                payment_status: 'completed'
              })
              .eq('id', payment.order_id);

            payment.status = 'completed';
          } else if (['1032', '1037', '1', '2001'].includes(resultCode.toString())) {
            // Payment failed or cancelled
            await supabaseAdmin
              .from('payments')
              .update({
                status: 'failed',
                result_code: resultCode.toString(),
                result_desc: statusResponse.ResultDesc
              })
              .eq('checkout_request_id', checkoutRequestId);

            // Update order
            await supabaseAdmin
              .from('orders')
              .update({
                payment_status: 'failed'
              })
              .eq('id', payment.order_id);

            payment.status = 'failed';
          }
        }
      } catch (queryError) {
        console.error('Failed to query payment status:', queryError);
        // Don't fail the request, just return current status
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        resultCode: payment.result_code,
        resultDesc: payment.result_desc,
        mpesaReceiptNumber: payment.mpesa_receipt_number,
        transactionDate: payment.transaction_date,
        createdAt: payment.created_at
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