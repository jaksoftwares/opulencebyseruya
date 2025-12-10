import { supabase } from '@/lib/supabase';
import ShopPageClient from './ShopPageClient';

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const [productsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order'),
  ]);

  const products = productsResponse.data || [];
  const categories = categoriesResponse.data || [];

  const initialSearchQuery = searchParams.search
    ? decodeURIComponent(searchParams.search)
    : '';

  return (
    <ShopPageClient
      initialProducts={products}
      initialCategories={categories}
      initialSearchQuery={initialSearchQuery}
    />
  );
}