'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(30);

        if (productsData) {
          const formatted: Product[] = productsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.original_price || p.compare_at_price,
          image:
            p.images?.[0] ||
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 200) + 50,
          badge: (Math.random() > 0.7
            ? Math.random() > 0.5
              ? 'bestseller'
              : 'trending'
            : undefined) as 'new' | 'bestseller' | 'trending' | undefined,

        }));

          setProducts(formatted);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const getBadgeConfig = (badge?: string) => {
    switch (badge) {
      case 'new':
        return { color: 'from-blue-500 to-cyan-600', text: 'NEW', icon: Sparkles };
      case 'bestseller':
        return { color: 'from-amber-500 to-orange-600', text: 'BESTSELLER', icon: Star };
      case 'trending':
        return { color: 'from-pink-500 to-rose-600', text: 'TRENDING', icon: TrendingUp };
      default:
        return null;
    }
  };

  return (
    <section className="py-8 md:py-12 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-3">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-amber-800 font-medium text-sm">Featured Products</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Popular Items
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm mb-3">
            Trending products loved by customers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 mb-6">
          {loading ? (
            Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-20 sm:h-24 bg-gray-200" />
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
            products.map(product => {
              const badge = getBadgeConfig(product.badge);
              const BadgeIcon = badge?.icon;
              const discount =
                product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                    )
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
                        {badge && (
                          <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r ${badge.color} text-white text-xs font-bold rounded-full shadow-sm`}
                          >
                            {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5" />}
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
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

                      <h3 className="font-bold text-xs text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gray-900">
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
