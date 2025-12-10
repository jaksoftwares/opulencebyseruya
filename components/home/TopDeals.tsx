"use client";

import { useState, useEffect } from 'react';
import { Flame, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface TopDeal {
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

interface TopDealsProps {
  deals: TopDeal[];
}

export default function TopDeals({ deals }: TopDealsProps) {
  const [timeRemaining, setTimeRemaining] = useState('23:45:12');
  useEffect(() => {
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
    <section className="py-8 md:py-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full mb-3">
            <Flame className="h-4 w-4" />
            <span className="font-bold text-sm">Top Deals</span>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Today&apos;s Deals
          </h2>
          
          <p className="text-gray-600 text-sm mb-3">
            Limited time offers
          </p>

          {/* Compact Countdown */}
          <div className="inline-flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md">
            <Clock className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-xs text-gray-500">Ends in</div>
              <div className="text-lg font-bold text-red-600">
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 mb-6">
          {deals.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600 text-sm">
                No deals available at the moment.
              </p>
            </div>
          ) : (
            deals.map((deal) => {
              const progressPercentage = Math.round(
                (deal.soldCount / (deal.soldCount + deal.stockLeft)) * 100
              );
              
              return (
                <Link key={deal.id} href={`/products/${deal.slug}`}>
                  <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-20 sm:h-24 overflow-hidden">
                      <Image
                        src={deal.image}
                        alt={deal.name}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 12vw, 10vw"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Compact Discount Badge */}
                      <div className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-orange-600 text-white px-1.5 py-0.5 rounded-full font-bold text-xs shadow-sm">
                        -{deal.discount}%
                      </div>
                    </div>

                    {/* Compact Content */}
                    <div className="p-2">
                      <h3 className="font-bold text-xs text-gray-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
                        {deal.name}
                      </h3>

                      {/* Compact Price */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          KSh {deal.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          KSh {deal.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Compact Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{progressPercentage}% sold</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-600 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Compact Button */}
                      <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-1 px-2 rounded-md font-semibold text-xs transition-all duration-300 flex items-center justify-center">
                        Deal
                      </button>
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
