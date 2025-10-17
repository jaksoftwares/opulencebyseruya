import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists and is active
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { message: 'Email already subscribed' },
          { status: 200 }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({
            is_active: true,
            unsubscribed_at: null
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        return NextResponse.json(
          { message: 'Subscription reactivated successfully' },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        is_active: true
      });

    if (error) throw error;

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}