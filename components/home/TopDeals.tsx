'use client';

import { useState, useEffect } from 'react';
import { Flame, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Deal {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  timeLeft: string;
  soldCount: number;
  stockLeft: number;
}

export default function TopDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('23:45:12');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_top_deal', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching top deals:', error);
          return;
        }

        if (data) {
          const formattedDeals: Deal[] = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice:
              product.original_price ||
              product.compare_at_price ||
              product.price,
            discount:
              product.discount ||
              (product.original_price
                ? Math.round(
                    ((product.original_price - product.price) /
                      product.original_price) *
                      100
                  )
                : 0),
            image:
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
            timeLeft: '23:45:12',
            soldCount: product.sold_count || 0,
            stockLeft: product.stock_left || product.stock_quantity || 0,
          }));
          setDeals(formattedDeals);
        }
      } catch (error) {
        console.error('Error fetching top deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDeals();

    // Countdown timer
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">FLASH DEALS</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-600">{timeRemaining}</span>
          </div>
          <Link href="/shop?deal=flash" className="text-red-600 hover:text-red-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {/* Deals Grid */}
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
          ) : deals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                No deals available at the moment.
              </p>
            </div>
          ) : (
            deals.map((deal) => {
              const progressPercent = Math.round(
                (deal.soldCount / (deal.soldCount + deal.stockLeft)) * 100
              );
              
              return (
                <Link key={deal.id} href={`/products/${deal.slug}`}>
                  <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Image
                        src={deal.image}
                        alt={deal.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Discount Badge */}
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                        -{deal.discount}%
                      </div>

                      {/* Sold Count Badge */}
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                        {deal.soldCount}+ sold
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">
                        {deal.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-lg font-bold text-red-600">
                          KSh {deal.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          KSh {deal.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{progressPercent}% sold</span>
                          <span>{deal.stockLeft} left</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
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
