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
          .eq('tag', 'top-deals')
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
    <section className="py-16 sm:py-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-10 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-amber-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full mb-6 shadow-lg animate-bounce-slow">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            <span className="font-bold text-base sm:text-lg">HOT DEALS</span>
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Today&apos;s Top Deals
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            Limited time offers you don&apos;t want to miss
          </p>

          {/* Countdown */}
          <div className="inline-flex items-center gap-3 sm:gap-4 bg-white rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-xl">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <div>
              <div className="text-xs text-gray-500 mb-1">DEALS END IN</div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 sm:h-56 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : deals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No deals available at the moment.
              </p>
            </div>
          ) : (
            deals.map((deal) => (
              <Link key={deal.id} href={`/products/${deal.slug}`}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg animate-pulse">
                      -{deal.discount}%
                    </div>

                    {/* Low Stock Warning */}
                    {deal.stockLeft < 10 && (
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Only {deal.stockLeft} left!
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {deal.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        KSh {deal.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        KSh {deal.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Sold: {deal.soldCount}</span>
                        <span>
                          {Math.round(
                            (deal.soldCount /
                              (deal.soldCount + deal.stockLeft)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (deal.soldCount /
                                (deal.soldCount + deal.stockLeft)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Button */}
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:from-amber-600 group-hover:to-orange-700 flex items-center justify-center gap-2 text-sm sm:text-base">
                      Grab Deal
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/deals">
            <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-orange-600 text-orange-600 rounded-full font-bold hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base">
              View All Deals
              <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
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
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
