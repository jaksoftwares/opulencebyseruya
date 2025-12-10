import { supabase } from '@/lib/supabase';
import CategoryPageClient from './CategoryPageClient';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
  sku: string;
  is_featured: boolean;
}

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // First try active categories only
  let { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle<Category>();

  // Fallback: if not found, try without is_active filter to handle legacy data
  if (!category) {
    const fallback = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<Category>();

    category = fallback.data ?? null;
  }

  if (!category) {
    return <CategoryPageClient category={null} subcategories={[]} products={[]} />;
  }

  const [{ data: subcategoriesData }, { data: productsData }] = await Promise.all([
    supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  const subcategories: Subcategory[] = (subcategoriesData || []) as Subcategory[];
  const products: Product[] = (productsData || []) as Product[];

  return (
    <CategoryPageClient
      category={category}
      subcategories={subcategories}
      products={products}
    />
  );
}
