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
          .limit(8);

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
    <section className="py-10 md:py-16 bg-white relative overflow-hidden">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-amber-800 font-medium text-sm">Handpicked for You</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Discover our most popular and premium items, loved by thousands of customers
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 md:mb-14">
          <div className="flex justify-center">
            <div className="flex gap-3 overflow-x-auto pb-2 px-2 sm:px-0 max-w-full scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {/* Products Horizontal Scroll */}
<div className="relative mb-10">
  <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory">
    {loading ? (
      Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[250px] sm:min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md animate-pulse snap-start"
        >
          <div className="h-56 sm:h-64 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))
    ) : products.length === 0 ? (
      <div className="w-full text-center py-10">
        <p className="text-gray-600 text-base sm:text-lg">
          No featured products available.
        </p>
      </div>
    ) : (
      products.map(product => {
        const isHovered = hoveredProduct === product.id;
        const badge = getBadgeConfig(product.badge);
        const BadgeIcon = badge?.icon;
        const discount =
          product.compareAtPrice && product.compareAtPrice > product.price
            ? Math.round(
                ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
              )
            : 0;

        return (
          <div
            key={product.id}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            className="group min-w-[250px] sm:min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start"
          >
            {/* Image */}
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-56 sm:h-64 bg-gray-100 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {badge && (
                    <div
                      className={`flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${badge.color} text-white text-xs font-bold rounded-full shadow-lg`}
                    >
                      {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                      {badge.text}
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                      -{discount}%
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Product Info */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-sm">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-gray-400 text-xs">({product.reviews})</span>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-bold text-gray-900">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    KSh {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>


        {/* View All Button */}
        <div className="text-center">
          <Link href="/shop">
            <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 text-sm sm:text-base">
              View All Products
              <Sparkles className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
