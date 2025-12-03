'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
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
          .order('created_at', { ascending: false })
          .limit(30);

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
    <section className="py-8 md:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="font-bold text-sm">New Arrivals</span>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Latest Products
          </h2>
          
          <p className="text-gray-600 text-sm mb-3">
            Fresh arrivals just for you
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 mb-6">
          {loading ? (
            Array.from({ length: 30 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-20 sm:h-24 bg-gray-200"></div>
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600 text-sm">
                No products available.
              </p>
            </div>
          ) : (
            products.map((product) => {
              const discount = product.compareAtPrice && product.compareAtPrice > product.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0;

              return (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-20 sm:h-24 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 12vw, 10vw"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Compact Badges */}
                      <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {product.badge && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="px-1.5 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                            -{discount}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Content */}
                    <div className="p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-xs">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xs">({product.reviews})</span>
                      </div>

                      <h3 className="font-bold text-xs text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
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