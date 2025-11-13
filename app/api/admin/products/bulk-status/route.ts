import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface BulkStatusUpdateRequest {
  product_ids: string[];
  status_type: 'is_active' | 'is_featured' | 'is_top_deal' | 'is_new_arrival';
  status_value: boolean;
}

// Bulk update product statuses
export async function PUT(req: NextRequest) {
  try {
    const body: BulkStatusUpdateRequest = await req.json();
    const { product_ids, status_type, status_value } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json({ 
        error: 'product_ids must be a non-empty array' 
      }, { status: 400 });
    }

    if (!status_type || typeof status_value !== 'boolean') {
      return NextResponse.json({ 
        error: 'Missing required fields: status_type, status_value' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ [status_type]: status_value, updated_at: new Date().toISOString() })
      .in('id', product_ids)
      .select();

    if (error) {
      console.error('Error bulk updating product status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      updated_count: data?.length || 0,
      products: data 
    });
  } catch (error: any) {
    console.error('Error in bulk status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}