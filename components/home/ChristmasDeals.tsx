"use client";

import { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star, Gift, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ChristmasDealProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  isChristmasDeal?: boolean;
  categoryId?: string;
}

interface ChristmasDealsProps {
  products: ChristmasDealProduct[];
}

export default function ChristmasDeals({ products }: ChristmasDealsProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const calculateDiscount = (price: number, compareAtPrice: number | null) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const timeLeftInDay = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const { hours, minutes } = timeLeftInDay();

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-red-50 via-green-50 to-amber-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-green-600 rounded-full mb-3">
            <Gift className="h-4 w-4 text-white" />
            <span className="text-white font-bold text-xs tracking-wider uppercase">
              Christmas Deals
            </span>
          </div>
          
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
            <span className="text-red-600">🎄 Christmas</span>{' '}
            <span className="text-green-600">Deals 🎁</span>
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm mb-3">
            Limited time offers on holiday favorites
          </p>

          {/* Compact Countdown */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-red-200">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="text-gray-700 font-semibold text-sm">Ends in:</span>
            <div className="flex items-center gap-1">
              <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold min-w-[1.5rem] text-center">
                {hours.toString().padStart(2, '0')}
              </div>
              <span className="text-gray-600 text-xs">:</span>
              <div className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-bold min-w-[1.5rem] text-center">
                {minutes.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                No Christmas deals available at the moment.
              </p>
            </div>
          ) : (
            products.map((product) => {
              const isHovered = hoveredProduct === product.id;
              const discount = calculateDiscount(product.price, product.compareAtPrice);

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
                >
                  {/* Compact Christmas Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-green-600 text-white text-xs font-bold rounded-full shadow-sm">
                      <Gift className="h-2.5 w-2.5" />
                    </div>
                  </div>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
                        -{discount}%
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-24 sm:h-28 bg-gradient-to-br from-red-100 to-green-100 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Compact Product Info */}
                  <div className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-xs">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-xs">({product.reviews})</span>
                    </div>

                    <h3 className="font-bold text-xs text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-sm font-bold text-gray-900">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          KSh {product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Compact Action Button */}
                    <Link href={`/products/${product.slug}`}>
                      <button className="w-full bg-gradient-to-r from-red-500 to-green-600 hover:from-red-600 hover:to-green-700 text-white py-1.5 px-2 rounded-md font-semibold text-xs transition-all duration-300 hover:shadow-sm flex items-center justify-center gap-1">
                        <Gift className="h-3 w-3" />
                        Wishlist
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}