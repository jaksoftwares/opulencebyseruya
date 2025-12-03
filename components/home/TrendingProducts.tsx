'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  soldCount: number;
  categoryId?: string;
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        // Fetch products that are marked as trending/bestselling
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sold_count', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching trending products:', error);
          return;
        }

        if (data) {
          const formattedProducts: Product[] = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.original_price || product.compare_at_price,
            image:
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
            rating: product.rating || (4.0 + Math.random() * 1.0),
            reviews: product.reviews || Math.floor(Math.random() * 100) + 50,
            soldCount: product.sold_count || Math.floor(Math.random() * 500) + 100,
            categoryId: product.category_id,
          }));

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  const discount = (product: Product) => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">TRENDING NOW</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
          <Link href="/shop?sort=trending" className="text-red-600 hover:text-red-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => {
              const discountPercent = discount(product);
              
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 10vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Sold Count Badge */}
                    <div className="absolute bottom-1 left-1 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                      {product.soldCount}+ sold
                    </div>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>

                    <h3 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2rem]">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-red-600">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          KSh {product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}