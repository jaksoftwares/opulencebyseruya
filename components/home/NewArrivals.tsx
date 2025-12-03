'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Star, ShoppingCart, Eye } from 'lucide-react';
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
  badge?: 'new' | 'bestseller' | 'trending';
  categoryId?: string;
  stockLeft: number;
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_new_arrival', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Error fetching new arrivals:', error);
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
            reviews: product.reviews || Math.floor(Math.random() * 50) + 20,
            badge: 'new' as const,
            categoryId: product.category_id,
            stockLeft: product.stock_left || product.stock_quantity || 0,
          }));

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">NEW ARRIVALS</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
          <Link href="/shop?tag=new" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                No new arrivals available at the moment.
              </p>
            </div>
          ) : (
            products.map((product) => {
              const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0;

              return (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Badges */}
                      <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {product.badge && (
                          <div className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                            NEW
                          </div>
                        )}
                        {discountPercent > 0 && (
                          <div className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                            -{discountPercent}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-gray-600">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>

                      <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            KSh {product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
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