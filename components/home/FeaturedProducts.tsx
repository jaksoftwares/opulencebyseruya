'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (data) {
        setProducts(data);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked selections of our most popular and premium items
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              compareAtPrice={product.compare_at_price || undefined}
              image={product.images[0] || ''}
              isInStock={product.stock_quantity > 0}
              isFeatured={product.is_featured}
              sku={product.sku}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
