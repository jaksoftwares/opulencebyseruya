'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star, TrendingUp, Sparkles } from 'lucide-react';
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
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('display_order');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else if (categoriesData) {
          const formattedCategories = [
            { id: 'all', name: 'All Products', slug: 'all' },
            ...categoriesData
          ];
          setCategories(formattedCategories);
        }

        // Fetch featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else if (productsData) {
          const formattedProducts: Product[] = productsData.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.original_price || product.compare_at_price,
            image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
            badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bestseller' : 'trending') : undefined,
            categoryId: product.category_id
          }));
          setAllProducts(formattedProducts);
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => product.categoryId === selectedCategory);
      setProducts(filtered);
    }
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
    <section className="py-8 md:py-12 bg-white relative overflow-hidden">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-amber-800 font-medium text-sm">Handpicked for You</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our most popular and premium items, loved by thousands of customers
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 sm:px-0 max-w-full scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No featured products available.</p>
            </div>
          ) : (
            products.map((product) => {
            const isHovered = hoveredProduct === product.id;
            const badgeConfig = getBadgeConfig(product.badge);
            const BadgeIcon = badgeConfig?.icon;
            const discount = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container */}
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {badgeConfig && (
                        <div className={`flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${badgeConfig.color} text-white text-xs font-bold rounded-full shadow-lg`}>
                          {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                          {badgeConfig.text}
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          -{discount}%
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors group/btn">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors group/btn">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Overlay CTA */}
                    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-sm">{product.rating}</span>
                    </div>
                    <span className="text-gray-400 text-xs">({product.reviews} reviews)</span>
                  </div>

                  {/* Product Name */}
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[56px]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
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

        {/* View All Button */}
        <div className="text-center">
          <Link href="/shop">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">
              View All Products
              <Sparkles className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
