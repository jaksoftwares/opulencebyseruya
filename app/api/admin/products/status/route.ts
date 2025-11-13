import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface StatusUpdateRequest {
  id: string;
  status_type: 'is_active' | 'is_featured' | 'is_top_deal' | 'is_new_arrival';
  status_value: boolean;
}

// Update individual product status
export async function POST(req: NextRequest) {
  try {
    const body: StatusUpdateRequest = await req.json();
    const { id, status_type, status_value } = body;

    if (!id || !status_type || typeof status_value !== 'boolean') {
      return NextResponse.json({ 
        error: 'Missing required fields: id, status_type, status_value' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ [status_type]: status_value, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating product status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      product: data[0] 
    });
  } catch (error: any) {
    console.error('Error in status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}