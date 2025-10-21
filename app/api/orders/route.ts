import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { sendOrderNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Create a server-side Supabase client with service role key for bypassing RLS
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

    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      payment_status,
      notes,
      items
    } = body;

    // Validate required fields
    if (!customer_id) {
      console.error('No customer_id provided in request');
      return NextResponse.json(
        { error: 'Customer ID is required. Please log in to place an order.' },
        { status: 400 }
      );
    }

    console.log('Processing order for customer_id:', customer_id);

    // Verify customer exists in customers table
    const { data: customerExists, error: customerCheckError } = await supabaseAdmin
      .from('customers')
      .select('id, email, full_name')
      .eq('id', customer_id)
      .single();

    if (customerCheckError || !customerExists) {
      console.error('Customer validation error:', customerCheckError);
      console.error('Customer ID being checked:', customer_id);
      console.error('Customer exists result:', customerExists);
      return NextResponse.json(
        { error: `Customer account not found for ID: ${customer_id}. Please ensure you have a complete account setup. Contact support if the issue persists.` },
        { status: 400 }
      );
    }

    console.log('Customer validation successful:', customerExists);

    // Generate order number
    const orderNumber = `OP-${Date.now()}`;

    // Create order using admin client to bypass RLS
    const orderData = {
      order_number: orderNumber,
      customer_id: customer_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      subtotal: parseFloat(subtotal),
      delivery_fee: parseFloat(delivery_fee),
      total: parseFloat(total),
      status: 'pending',
      payment_method,
      payment_status,
      notes: notes || '',
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      console.error('Error details:', orderError.message, orderError.details, orderError.hint);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_sku: item.sku,
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.price),
      total_price: parseFloat(item.price) * parseInt(item.quantity),
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      console.error('Error details:', itemsError.message, itemsError.details, itemsError.hint);
      // Clean up the order if items failed
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // Send order notification email to store owner
    try {
      await sendOrderNotificationEmail({
        orderNumber: orderNumber,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        deliveryCity: order.delivery_city,
        paymentMethod: order.payment_method,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        notes: order.notes,
        items: orderItems.map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });
      console.log('Order notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send order notification email:', emailError);
      // Don't fail the order if email fails - just log it
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        total: order.total,
        payment_method: order.payment_method,
      }
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create a server-side Supabase client with service role key for bypassing RLS
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

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    console.log('Fetching orders for customer ID:', customerId);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    console.log('Orders fetched successfully:', orders?.length || 0, 'orders');
    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}