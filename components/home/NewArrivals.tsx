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
    <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-10 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full mb-6 shadow-lg animate-bounce-slow">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            <span className="font-bold text-base sm:text-lg">FRESH ARRIVALS</span>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            Be the first to discover our latest collection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 sm:h-56 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No new arrivals available at the moment.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.badge && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                          <Sparkles className="h-3 w-3" />
                          NEW
                        </div>
                      )}
                      
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                        </div>
                      )}

                      {/* Low Stock Warning */}
                      {product.stockLeft < 10 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          Only {product.stockLeft} left!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-sm">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-xs">({product.reviews})</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-3">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          KSh {product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700 flex items-center justify-center gap-2 text-sm">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg transition-all duration-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/shop">
            <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base">
              View All Products
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(-5%);
          }
          50% {
            transform: translateY(0);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}