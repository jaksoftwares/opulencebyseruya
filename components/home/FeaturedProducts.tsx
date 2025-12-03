'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star, TrendingUp, Sparkles } from 'lucide-react';
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
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('display_order');

        if (categoriesData) {
          setCategories([{ id: 'all', name: 'All Products', slug: 'all' }, ...categoriesData]);
        }

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(16);

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
            : undefined) as 'new' | 'bestseller' | 'trending' | undefined, // 👈 FIXED
          categoryId: p.category_id,
        }));

          setAllProducts(formatted);
          setProducts(formatted);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') setProducts(allProducts);
    else setProducts(allProducts.filter(p => p.categoryId === selectedCategory));
  }, [selectedCategory, allProducts]);

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
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">FEATURED PRODUCTS</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
          <Link href="/shop" className="text-red-600 hover:text-red-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                No featured products available.
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
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {badge && (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${badge.color} text-white text-xs font-bold rounded-full shadow-sm`}
                        >
                          {BadgeIcon && <BadgeIcon className="h-2 w-2" />}
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                          -{discount}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>

                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-red-600">
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


        {/* View More Button */}
        <div className="text-center">
          <Link href="/shop">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm">
              Load More Products
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
