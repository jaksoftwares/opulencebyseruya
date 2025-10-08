'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'decor', name: 'Home Decor' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'bedroom', name: 'Bedroom' },
  ];

  useEffect(() => {
    // Mock products data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Luxury Ceramic Dinner Set',
        slug: 'luxury-ceramic-dinner-set',
        price: 8999,
        compareAtPrice: 12999,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800',
        rating: 4.8,
        reviews: 127,
        badge: 'bestseller'
      },
      {
        id: '2',
        name: 'Premium Non-Stick Cookware',
        slug: 'premium-non-stick-cookware',
        price: 6499,
        compareAtPrice: 9999,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
        rating: 4.9,
        reviews: 203,
        badge: 'trending'
      },
      {
        id: '3',
        name: 'Elegant Wall Mirror Set',
        slug: 'elegant-wall-mirror-set',
        price: 4999,
        compareAtPrice: null,
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800',
        rating: 4.7,
        reviews: 89,
        badge: 'new'
      },
      {
        id: '4',
        name: 'Designer Storage Baskets',
        slug: 'designer-storage-baskets',
        price: 2999,
        compareAtPrice: 4999,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800',
        rating: 4.6,
        reviews: 156,
        badge: 'bestseller'
      },
      {
        id: '5',
        name: 'Luxury Bath Towel Set',
        slug: 'luxury-bath-towel-set',
        price: 3499,
        compareAtPrice: 5999,
        image: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?q=80&w=800',
        rating: 4.9,
        reviews: 312,
        badge: 'trending'
      },
      {
        id: '6',
        name: 'Modern Table Lamp',
        slug: 'modern-table-lamp',
        price: 3999,
        compareAtPrice: null,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800',
        rating: 4.5,
        reviews: 67,
        badge: 'new'
      },
      {
        id: '7',
        name: 'Bamboo Cutting Board Set',
        slug: 'bamboo-cutting-board-set',
        price: 2499,
        compareAtPrice: 3999,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800',
        rating: 4.8,
        reviews: 189,
        badge: 'bestseller'
      },
      {
        id: '8',
        name: 'Decorative Throw Pillows',
        slug: 'decorative-throw-pillows',
        price: 1999,
        compareAtPrice: null,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800',
        rating: 4.7,
        reviews: 143,
        badge: 'trending'
      },
    ];
    setProducts(mockProducts);
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
    <section className="py-20 bg-white relative overflow-hidden">
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
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => {
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
          })}
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

// 'use client';

// import { useEffect, useState } from 'react';
// import ProductCard from '@/components/ProductCard';
// import { supabase } from '@/lib/supabase';

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compare_at_price: number | null;
//   images: string[];
//   stock_quantity: number;
//   sku: string;
//   is_featured: boolean;
// }

// export default function FeaturedProducts() {
//   const [products, setProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     const fetchFeaturedProducts = async () => {
//       const { data } = await supabase
//         .from('products')
//         .select('*')
//         .eq('is_active', true)
//         .eq('is_featured', true)
//         .order('created_at', { ascending: false })
//         .limit(8);

//       if (data) {
//         setProducts(data);
//       }
//     };

//     fetchFeaturedProducts();
//   }, []);

//   if (products.length === 0) return null;

//   return (
//     <section className="py-16 bg-gray-50">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Featured Products
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Handpicked selections of our most popular and premium items
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <ProductCard
//               key={product.id}
//               id={product.id}
//               name={product.name}
//               slug={product.slug}
//               price={product.price}
//               compareAtPrice={product.compare_at_price || undefined}
//               image={product.images[0] || ''}
//               isInStock={product.stock_quantity > 0}
//               isFeatured={product.is_featured}
//               sku={product.sku}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
