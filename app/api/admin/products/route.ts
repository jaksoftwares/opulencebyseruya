import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, category_id, subcategory_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications, is_featured, is_top_deal, is_new_arrival, is_active, rating, reviews, badge, original_price, discount, sold_count, stock_left, tag, variations, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('products').insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...update } = body;
  const { data, error } = await supabaseAdmin.from('products').update(update).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
