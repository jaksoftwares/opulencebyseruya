'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  categoryId: string;
}

const categoryImages = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800',
  'Fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
  'Home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
  'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
  'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800',
  'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800',
};

export default function CategoryRecommendations() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order')
        .limit(6);
      
      if (data) {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', selectedCategory.id)
        .order('created_at', { ascending: false })
        .limit(8);

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
          categoryId: product.category_id,
        }));
        setProducts(formattedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory]);

  const discount = (product: Product) => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">RECOMMENDED FOR YOU</h2>
          <Link href="/shop" className="text-red-600 hover:text-red-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Shop by Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory?.id === category.id
                        ? 'bg-red-100 text-red-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                        <Image
                          src={categoryImages[category.name as keyof typeof categoryImages] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800'}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {selectedCategory && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCategory.name}
                  </h3>
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <Link
                    href={`/categories/${selectedCategory.slug}`}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                        <div className="aspect-square bg-gray-200" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product) => {
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
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Discount Badge */}
                            {discountPercent > 0 && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                                -{discountPercent}%
                              </div>
                            )}
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
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}